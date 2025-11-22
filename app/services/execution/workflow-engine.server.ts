/**
 * Workflow Execution Engine
 *
 * This module implements the core workflow execution engine using Effect.ts.
 * It handles DAG-based workflow traversal with support for:
 * - Parallel and sequential node execution
 * - Retry logic with configurable attempts
 * - Timeout protection per node
 * - Real-time event streaming via SSE
 * - Comprehensive execution logging
 *
 * @module workflow-engine
 */

import { Effect } from "effect";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import type { WorkflowDefinition } from "~/types/workflow";
import { buildWorkflowGraph } from "~/utils/workflow-graph";
import { getValueFromContext } from "~/utils/templates";
import { validateWorkflowDefinition } from "~/utils/workflow-validation";
import type { ExecutionContext, TaskResult } from "./node-handlers.server";
import { resolveTaskHandler } from "./node-handlers.server";

/**
 * Types of events emitted during workflow execution.
 * Used for real-time monitoring via Server-Sent Events (SSE).
 */
export type ExecutionEventType =
  | "EXECUTION_STARTED"   // Workflow execution begins
  | "TASK_STARTED"        // Individual task/node starts
  | "TASK_COMPLETED"      // Task finishes successfully
  | "TASK_FAILED"         // Task fails after all retries
  | "EXECUTION_COMPLETED"; // Entire workflow finishes

/**
 * Event structure for execution lifecycle notifications.
 * Streamed to clients via SSE for real-time monitoring.
 */
export interface ExecutionEvent {
  type: ExecutionEventType;
  payload: Record<string, unknown>;  // Event-specific data (nodeId, status, error, etc.)
  timestamp: string;                 // ISO 8601 timestamp
}

/**
 * Callback function for emitting execution events.
 * Used by the execution-hub for broadcasting to SSE subscribers.
 */
export type EmitExecutionEvent = (event: ExecutionEvent) => void;

/**
 * Complete result of a workflow execution.
 * Contains all events, shared context, and individual task results.
 */
export interface WorkflowExecutionResult {
  events: ExecutionEvent[];                    // Chronological list of all events
  sharedContext: Record<string, unknown>;      // Final shared context with all task outputs
  results: Record<string, TaskResult>;         // Map of nodeId -> task result
  durationMs?: number;                         // Total execution time in milliseconds
}

// Default no-op event emitter (used when not streaming events)
const defaultEmit: EmitExecutionEvent = () => undefined;

// Maximum size for logged context objects (prevents database bloat)
const LOG_CONTEXT_LIMIT = 800;

export interface ValidationIssue {
  message: string;
  nodeId?: string;
}

/**
 * Execute a workflow definition with the given input payload.
 *
 * This is the main entry point for workflow execution. It:
 * 1. Validates the workflow structure (DAG, required fields)
 * 2. Builds an execution graph with topological ordering
 * 3. Executes nodes in batches (parallel siblings, sequential otherwise)
 * 4. Handles retries, timeouts, and error propagation
 * 5. Persists execution logs and task status to database
 * 6. Streams real-time events via the emit callback
 *
 * @param definition - The workflow definition with nodes and edges
 * @param payload - Input data passed to the workflow (accessible via context)
 * @param emit - Optional callback for streaming execution events (SSE)
 * @param executionId - Optional execution record ID for database persistence
 * @param workflowId - Optional workflow record ID for linking nodes
 * @returns Complete execution result with events, context, and task results
 * @throws Error if workflow validation fails or a critical task fails
 *
 * @example
 * ```typescript
 * const result = await runWorkflow(
 *   { nodes: [...], edges: [...] },
 *   { userId: "123", email: "user@example.com" },
 *   (event) => console.log('Event:', event.type)
 * );
 * console.log('Workflow completed in', result.durationMs, 'ms');
 * ```
 */
export async function runWorkflow(
  definition: WorkflowDefinition,
  payload: Record<string, unknown>,
  emit: EmitExecutionEvent = defaultEmit,
  executionId?: string,
  workflowId?: string
): Promise<WorkflowExecutionResult> {
  // Validate workflow structure (cycles, required fields, etc.)
  validateWorkflowDefinition(definition);

  // Build DAG representation with topological ordering
  const graph = buildWorkflowGraph(definition);

  // Maximum parallel tasks running at once (prevents resource exhaustion)
  const maxConcurrency = 4;
  const startedAt = Date.now();
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

  // Debug: trace execution lifecycle
  if (executionId) {
    // eslint-disable-next-line no-console
    console.log(`[workflow] start executionId=${executionId} workflowId=${workflowId ?? "unknown"}`);
  }

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

  // Topological sorting tracking:
  // - indegree: Number of incoming edges per node (dependencies)
  // - activatedCounts: How many parents activated this node (for conditional branches)
  // - processedCounts: How many parents have finished processing
  // - nodeIdMap: Maps workflow nodeId to database WorkflowNode primary key
  const indegree = new Map<string, number>();
  const activatedCounts = new Map<string, number>();
  const processedCounts = new Map<string, number>();
  const nodeIdMap = new Map<string, string>();

  if (persistLogs && workflowId) {
    const nodes = definition.nodes;
    const dbNodes = await Promise.all(
      nodes.map((node) =>
        prisma.workflowNode.upsert({
          where: { workflowId_nodeId: { workflowId, nodeId: node.id } },
          create: {
            workflowId,
            nodeId: node.id,
            type: node.type,
            label: node.label,
            position: node.position as Prisma.InputJsonValue,
            config: node.config as Prisma.InputJsonValue,
            timeout: Number(node.timeout ?? 30000),
            retries: Number(node.retries ?? 3)
          },
          update: {
            label: node.label,
            position: node.position as Prisma.InputJsonValue,
            config: node.config as Prisma.InputJsonValue,
            type: node.type
          }
        })
      )
    );
    dbNodes.forEach((dbNode) => nodeIdMap.set(dbNode.nodeId, dbNode.id));
  }

  for (const node of graph.nodes.values()) {
    const reverse = graph.reverseAdjacency.get(node.id) ?? [];
    indegree.set(node.id, reverse.length);
    activatedCounts.set(node.id, 0);
    processedCounts.set(node.id, 0);
  }

  // Start with entry nodes (nodes with no incoming edges)
  let currentBatch = graph.entryNodes.map((node) => node.id);
  const visited = new Set<string>();

  // Execute workflow in batches using topological ordering
  // Each batch contains nodes that have all dependencies satisfied
  while (currentBatch.length > 0) {
    const batch = currentBatch;
    currentBatch = [];

    // Separate batch into sequential and parallel nodes
    // Sequential: executionMode='sequential' (default) - run one-by-one
    // Parallel: executionMode='parallel' (siblings with same parent) - run concurrently
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
      executionId,
      workflowId,
      nodePrimaryIds: nodeIdMap
    };

    /**
     * Execute multiple nodes in parallel with concurrency limit.
     *
     * This implements a bounded parallelism pattern:
     * - Launches up to `maxConcurrency` tasks simultaneously
     * - As tasks complete, launches next tasks from queue
     * - Uses Promise.race() to wait for ANY task to finish (not all)
     * - Returns when all tasks complete
     *
     * This prevents resource exhaustion while maximizing throughput.
     * For example, with maxConcurrency=4 and 10 nodes:
     * - Starts nodes 0-3 immediately
     * - When node 0 finishes, starts node 4
     * - When node 1 finishes, starts node 5
     * - And so on...
     *
     * @param ids - Array of node IDs to execute in parallel
     * @returns Promise that resolves when all nodes complete
     */
    const runLimitedParallel = async (ids: string[]) => {
      const running = new Set<Promise<Awaited<ReturnType<typeof runNode>>>>();
      const results: Promise<Awaited<ReturnType<typeof runNode>>>[] = [];
      const queue = [...ids];

      const launch = (id: string) => {
        const task = runNode(id, runParams).finally(() => running.delete(task));
        running.add(task);
        results.push(task);
      };

      // Process queue with concurrency limit
      while (queue.length > 0 || running.size > 0) {
        // Fill up to maxConcurrency slots
        while (queue.length > 0 && running.size < maxConcurrency) {
          const nextId = queue.shift();
          if (nextId) launch(nextId);
        }

        // Wait for ANY running task to complete (then loop continues)
        if (running.size > 0) {
          await Promise.race(Array.from(running));
        }
      }

      // Wait for all tasks to complete and return results
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

  if (executionId) {
    // eslint-disable-next-line no-console
    console.log(`[workflow] completed executionId=${executionId} durationMs=${Date.now() - startedAt}`);
  }

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
    results: completedResults,
    durationMs: Date.now() - startedAt
  };
}

/**
 * Execute a single workflow node with retry/timeout policies.
 *
 * This function:
 * 1. Checks if node was already visited (prevents duplicate execution)
 * 2. Emits TASK_STARTED event for monitoring
 * 3. Creates TaskExecution database record
 * 4. Resolves and executes the node handler (EMAIL, HTTP, SLACK, etc.)
 * 5. Applies retry logic and timeout protection
 * 6. Stores task output in shared context (accessible to downstream nodes)
 * 7. Emits TASK_COMPLETED or TASK_FAILED event
 * 8. Returns activation status for outgoing edges (conditional branching)
 *
 * @param nodeId - ID of the node to execute
 * @param params - Execution parameters (graph, context, event emitter, etc.)
 * @returns Object with nodeId and array of outgoing edge activations
 */
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
    workflowId?: string;
    nodePrimaryIds?: Map<string, string>;
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

  // Debug: trace node execution starts
  if (params.executionId) {
    // eslint-disable-next-line no-console
    console.log(`[workflow] node start executionId=${params.executionId} nodeId=${node.id} type=${node.type}`);
  }

  emitEvent({
    type: "TASK_STARTED",
    payload: { nodeId: node.id, label: node.label, type: node.type }
  });

  const shouldPersist = Boolean(params.executionId) && !isDemoMode();
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
        nodeId: params.nodePrimaryIds?.get(node.id) ?? node.id,
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

  // EMAIL defaults to 0 retries to avoid duplicate sends unless explicitly configured.
  const retries = node.type === "EMAIL" ? Number(node.retries ?? 0) : Number(node.retries ?? 2);
  // Give EMAIL more time by default; others keep 5s unless overridden on the node.
  const timeoutMs = node.type === "EMAIL" ? Number(node.timeout ?? 20_000) : Number(node.timeout ?? 5_000);
  const result = await executeWithPolicies(handler(node, context), {
    retries,
    timeoutMs
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

    if (node.type === "EMAIL" && result.data?.messageId) {
      // eslint-disable-next-line no-console
      console.log(
        `[email-node] executionId=${params.executionId} nodeId=${node.id} taskId=${taskRecordId} messageId=${result.data.messageId} to=${(result.data as Record<string, unknown>)?.to ?? "unknown"}`
      );
    }
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

  if (params.executionId) {
    // eslint-disable-next-line no-console
    console.log(`[workflow] node completed executionId=${params.executionId} nodeId=${node.id} type=${node.type} status=${result.status}`);
  }

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

/**
 * Execute a task with retry and timeout policies.
 *
 * This wrapper function applies resilience patterns:
 * - **Timeout**: Fails if task exceeds timeoutMs (prevents hanging)
 * - **Retry**: Retries failed tasks up to `retries` times with exponential backoff
 * - **Backoff**: Waits 150ms * attempt_number between retries (150ms, 300ms, 450ms...)
 *
 * Example scenarios:
 * - EMAIL node with retries=0: Sends once, fails immediately if error (no duplicates)
 * - HTTP node with retries=3: Tries up to 4 times total (1 initial + 3 retries)
 * - Task timeout=5000ms: Fails after 5 seconds regardless of retries
 *
 * @param effect - Effect.ts effect to execute (task handler)
 * @param options - Retry count and timeout duration
 * @returns Task result if successful
 * @throws Error if all retries exhausted or timeout exceeded
 */
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
