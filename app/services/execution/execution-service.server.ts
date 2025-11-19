import { nanoid } from "nanoid";
import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import { demoExecutions, demoWorkflows } from "~/data/demo-workflows";
import { publishExecutionEvent } from "~/services/events/execution-hub.server";
import { runWorkflow } from "./workflow-engine.server";
import type { ExecutionSummary } from "~/types/workflow";
import { getWorkflow } from "../workflows/workflow.server";

export async function triggerExecution(workflowId: string, input: Record<string, unknown>) {
  const workflow = (await getWorkflow(workflowId)) ?? demoWorkflows[0];
  if (!workflow) {
    throw new Response("Workflow not found", { status: 404 });
  }

  const executionId = `exec_${nanoid(10)}`;
  publishExecutionEvent(executionId, {
    type: "EXECUTION_STARTED",
    payload: { workflowId },
    timestamp: new Date().toISOString()
  });

  // Kick off async execution; errors are emitted to subscribers.
  setTimeout(async () => {
    try {
      const result = await runWorkflow(
        workflow.definition,
        input,
        (event) => publishExecutionEvent(executionId, event)
      );
      publishExecutionEvent(executionId, {
        type: "EXECUTION_COMPLETED",
        payload: {
          status: "COMPLETED",
          context: result.sharedContext
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      publishExecutionEvent(executionId, {
        type: "TASK_FAILED",
        payload: {
          message: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }, 10);

  if (!isDemoMode()) {
    await prisma.execution.create({
      data: {
        id: executionId,
        workflowId,
        status: "RUNNING",
        input
      }
    });
  }

  return {
    executionId,
    workflowId,
    status: "RUNNING" as const,
    websocketUrl: `wss://demo.flowforge.local/ws/executions/${executionId}`
  };
}

export async function listExecutions(workflowId?: string): Promise<ExecutionSummary[]> {
  if (isDemoMode()) {
    return demoExecutions.filter((execution) => !workflowId || execution.workflowId === workflowId);
  }

  const executions = await prisma.execution.findMany({
    where: { workflowId },
    orderBy: { startedAt: "desc" },
    take: 25
  });

  return executions.map((execution) => ({
    id: execution.id,
    workflowId: execution.workflowId,
    status: execution.status as ExecutionSummary["status"],
    duration: execution.duration ?? undefined,
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString()
  }));
}

export async function getExecution(executionId: string) {
  if (isDemoMode()) {
    return demoExecutions.find((execution) => execution.id === executionId) ?? null;
  }

  return prisma.execution.findUnique({ where: { id: executionId } });
}
