import { Effect } from "effect";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import type { WorkflowDefinition } from "~/types/workflow";
import { buildWorkflowGraph } from "~/utils/workflow-graph";
import { getValueFromContext } from "~/utils/templates";
import type { ExecutionContext, TaskResult } from "./node-handlers.server";
import { resolveTaskHandler } from "./node-handlers.server";

export type ExecutionEventType =
  | "EXECUTION_STARTED"
  | "TASK_STARTED"
  | "TASK_COMPLETED"
  | "TASK_FAILED"
  | "EXECUTION_COMPLETED";

export interface ExecutionEvent {
  type: ExecutionEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type EmitExecutionEvent = (event: ExecutionEvent) => void;

export interface WorkflowExecutionResult {
  events: ExecutionEvent[];
  sharedContext: Record<string, unknown>;
  results: Record<string, TaskResult>;
}

const defaultEmit: EmitExecutionEvent = () => undefined;
const LOG_CONTEXT_LIMIT = 800;

export async function runWorkflow(
  definition: WorkflowDefinition,
  payload: Record<string, unknown>,
  emit: EmitExecutionEvent = defaultEmit,
  executionId?: string
): Promise<WorkflowExecutionResult> {
  const graph = buildWorkflowGraph(definition);
  const maxConcurrency = 4;
  const sharedContext: Record<string, unknown> = structuredClone(payload ?? {});
  const completedResults: Record<string, TaskResult> = {};
  const outEvents: ExecutionEvent[] = [];
  const persistLogs = Boolean(executionId) && !isDemoMode();
  const emitEvent = (event: Omit<ExecutionEvent, "timestamp">) => {
    const fullEvent: ExecutionEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    emit(fullEvent);
    outEvents.push(fullEvent);
  };

  emitEvent({
    type: "EXECUTION_STARTED",
    payload: { nodes: definition.nodes.length }
  });

  if (persistLogs && executionId) {
    await prisma.executionLog.create({
      data: {
        executionId,
        level: "INFO",
        message: "Execution started",
        metadata: truncateJson({ nodeCount: definition.nodes.length })
      }
    });
  }

  const indegree = new Map<string, number>();
  const activatedCounts = new Map<string, number>();
  const processedCounts = new Map<string, number>();

  for (const node of graph.nodes.values()) {
    const reverse = graph.reverseAdjacency.get(node.id) ?? [];
    indegree.set(node.id, reverse.length);
    activatedCounts.set(node.id, 0);
    processedCounts.set(node.id, 0);
  }

  let currentBatch = graph.entryNodes.map((node) => node.id);
  const visited = new Set<string>();

  while (currentBatch.length > 0) {
    const batch = currentBatch;
    currentBatch = [];

    const sequentialNodes = batch.filter(
      (id) => (graph.nodes.get(id)?.executionMode ?? "sequential") === "sequential"
    );
    const parallelNodes = batch.filter((id) => !sequentialNodes.includes(id));

    const runParams = {
      graph,
      payload,
      sharedContext,
      emitEvent,
      visited,
      completedResults,
      executionId
    };

    const runLimitedParallel = async (ids: string[]) => {
      const running = new Set<Promise<Awaited<ReturnType<typeof runNode>>>>();
      const results: Promise<Awaited<ReturnType<typeof runNode>>>[] = [];
      const queue = [...ids];

      const launch = (id: string) => {
        const task = runNode(id, runParams).finally(() => running.delete(task));
        running.add(task);
        results.push(task);
      };

      while (queue.length > 0 || running.size > 0) {
        while (queue.length > 0 && running.size < maxConcurrency) {
          const nextId = queue.shift();
          if (nextId) launch(nextId);
        }
        if (running.size > 0) {
          await Promise.race(Array.from(running));
        }
      }

      return Promise.all(results);
    };

    const sequentialResults: Awaited<ReturnType<typeof runNode>>[] = [];
    for (const nodeId of sequentialNodes) {
      sequentialResults.push(await runNode(nodeId, runParams));
    }

    const parallelResults = await runLimitedParallel(parallelNodes);
    const batchResults = [...sequentialResults, ...parallelResults];

    for (const { nodeId: ignoredNodeId, outgoingActivations } of batchResults) {
      for (const activation of outgoingActivations) {
        const processed = (processedCounts.get(activation.targetId) ?? 0) + 1;
        processedCounts.set(activation.targetId, processed);

        if (activation.activated) {
          activatedCounts.set(activation.targetId, (activatedCounts.get(activation.targetId) ?? 0) + 1);
        }

        const parentTotal = indegree.get(activation.targetId) ?? 0;
        if (processed >= parentTotal && (activatedCounts.get(activation.targetId) ?? 0) > 0) {
          currentBatch.push(activation.targetId);
        }
      }
    }
  }

  emitEvent({
    type: "EXECUTION_COMPLETED",
    payload: { status: "COMPLETED" }
  });

  if (persistLogs && executionId) {
    await prisma.executionLog.create({
      data: {
        executionId,
        level: "INFO",
        message: "Execution completed",
        metadata: truncateJson({ sharedContext })
      }
    });
  }

  return {
    events: outEvents,
    sharedContext,
    results: completedResults
  };
}

async function runNode(
  nodeId: string,
  params: {
    graph: ReturnType<typeof buildWorkflowGraph>;
    payload: Record<string, unknown>;
    sharedContext: Record<string, unknown>;
    emitEvent: (event: Omit<ExecutionEvent, "timestamp">) => void;
    visited: Set<string>;
    completedResults: Record<string, TaskResult>;
    executionId?: string;
  }
) {
  const { graph, payload, sharedContext, emitEvent, visited, completedResults } = params;
  const node = graph.nodes.get(nodeId);
  if (!node) throw new Error(`Unknown node: ${nodeId}`);

  // Avoid executing same node twice (happens when graph has zero indegree loops)
  if (visited.has(node.id)) {
    return { nodeId, outgoingActivations: [] as ActivationResult[] };
  }
  visited.add(node.id);

  emitEvent({
    type: "TASK_STARTED",
    payload: { nodeId: node.id, label: node.label, type: node.type }
  });

  const shouldPersist = Boolean(params.executionId) && !isDemoMode() && isRealConfig(node.config);
  const startedAt = Date.now();
  let taskRecordId: string | null = null;

  if (shouldPersist && params.executionId) {
    await prisma.executionLog.create({
      data: {
        executionId: params.executionId,
        level: "INFO",
        message: `Task started: ${node.label ?? node.id}`,
        metadata: truncateJson({ nodeId: node.id, type: node.type })
      }
    });

    const created = await prisma.taskExecution.create({
      data: {
        executionId: params.executionId,
        nodeId: node.id,
        status: "RUNNING",
        input: payload as Prisma.InputJsonValue,
        attempt: 1,
        maxAttempts: Number(node.retries ?? 1),
        startedAt: new Date(startedAt)
      }
    });
    taskRecordId = created.id;
  }

  const handler = resolveTaskHandler(node.type);
  const context: ExecutionContext = { input: payload, shared: sharedContext };

  const result = await executeWithPolicies(handler(node, context), {
    retries: Number(node.retries ?? 2),
    timeoutMs: Number(node.timeout ?? 5_000)
  }).catch(async (error) => {
    emitEvent({
      type: "TASK_FAILED",
      payload: { nodeId: node.id, message: (error as Error).message }
    });

    if (shouldPersist && taskRecordId) {
      await prisma.executionLog.create({
        data: {
          executionId: params.executionId!,
          level: "ERROR",
          message: `Task failed: ${node.label ?? node.id}`,
          metadata: truncateJson({ nodeId: node.id, error: (error as Error).message })
        }
      });

      await prisma.taskExecution.update({
        where: { id: taskRecordId },
        data: {
          status: "FAILED",
          error: (error as Error).message,
          completedAt: new Date(),
          duration: Date.now() - startedAt,
          attempt: 1
        }
      });
    }

    throw error;
  });

  if (result?.data) {
    sharedContext[node.id] = result.data;
    Object.assign(sharedContext, result.data);
  }

  if (shouldPersist && taskRecordId) {
    await prisma.executionLog.create({
      data: {
        executionId: params.executionId!,
        level: "INFO",
        message: `Task completed: ${node.label ?? node.id}`,
        metadata: truncateJson({
          nodeId: node.id,
          status: result.status,
          durationMs: Date.now() - startedAt
        })
      }
    });

    await prisma.taskExecution.update({
      where: { id: taskRecordId },
      data: {
        status: result.status === "SUCCESS" ? "SUCCESS" : "FAILED",
        output: (result.data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        completedAt: new Date(),
        duration: Date.now() - startedAt
      }
    });
  }

  completedResults[node.id] = result;

  emitEvent({
    type: "TASK_COMPLETED",
    payload: {
      nodeId: node.id,
      status: result.status,
      output: result.data
    }
  });

  const outgoingEdges = params.graph.edges.filter((edge) => edge.source === node.id);
  const outgoingActivations = outgoingEdges.map((edge) => ({
    targetId: edge.target,
    activated: shouldActivateEdge(
      edge,
      result,
      sharedContext,
      params.graph.nodes.get(edge.target)?.executionMode ?? node.executionMode ?? "sequential"
    )
  }));

  return { nodeId: node.id, outgoingActivations };
}

interface ActivationResult {
  targetId: string;
  activated: boolean;
}

function shouldActivateEdge(
  edge: { condition?: { field: string; operator: string; value: unknown }; label?: string },
  result: TaskResult,
  sharedContext: Record<string, unknown>,
  _executionMode?: string
) {
  const branchMatches = result.branch ? edge.label === result.branch : true;
  if (!branchMatches) return false;

  if (!edge.condition) return true;

  const value = getValueFromContext(sharedContext, edge.condition.field);
  const expected = edge.condition.value;

  switch (edge.condition.operator) {
    case "eq":
      return value === expected;
    case "neq":
      return value !== expected;
    case "gt":
      return Number(value) > Number(expected);
    case "gte":
      return Number(value) >= Number(expected);
    case "lt":
      return Number(value) < Number(expected);
    case "lte":
      return Number(value) <= Number(expected);
    case "includes":
      return Array.isArray(value) && value.includes(expected);
    default:
      return true;
  }
}

async function executeWithPolicies(
  effect: Effect.Effect<TaskResult>,
  options: { retries: number; timeoutMs: number }
): Promise<TaskResult> {
  const attempt = async () => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Task timeout exceeded")), options.timeoutMs)
    );
    return (await Promise.race([Effect.runPromise(effect), timeoutPromise])) as TaskResult;
  };

  let tries = 0;
  let lastError: unknown;
  while (tries <= options.retries) {
    tries += 1;
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
      if (tries > options.retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * tries));
    }
  }

  throw lastError ?? new Error("Unknown execution failure");
}

function isRealConfig(config: Record<string, unknown>) {
  if (!config || Object.keys(config).length === 0) return false;

  const visit = (value: unknown): boolean => {
    if (value == null) return false;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return false;
      return !trimmed.includes("{{");
    }
    if (typeof value === "number" || typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.some((item) => visit(item));
    if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((v) => visit(v));
    return false;
  };

  return visit(config);
}

function truncateJson(value: Record<string, unknown>, limit = LOG_CONTEXT_LIMIT): Prisma.InputJsonValue {
  try {
    const str = JSON.stringify(value);
    if (str.length <= limit) return value as Prisma.InputJsonValue;
    return {
      truncated: true,
      preview: str.slice(0, limit)
    } as Prisma.InputJsonValue;
  } catch {
    return { truncated: true, preview: "unserializable metadata" };
  }
}
