/**
 * Execution Service
 *
 * This module provides the high-level API for workflow execution management.
 * It serves as the bridge between HTTP API routes and the workflow engine.
 *
 * **Key Responsibilities:**
 * 1. Triggering workflow executions (async with immediate response)
 * 2. Creating execution records in database
 * 3. Publishing real-time events via SSE for live monitoring
 * 4. Fetching execution status and logs
 * 5. Handling both demo mode (in-memory) and production mode (PostgreSQL)
 *
 * **Execution Flow:**
 * ```
 * API Request → triggerExecution() → Create DB record
 *                                   ↓
 *                              setTimeout(10ms)
 *                                   ↓
 *                          runWorkflow() [async]
 *                                   ↓
 *                         Update DB + Publish events
 * ```
 *
 * **Demo Mode vs Production:**
 * - Demo mode: Uses in-memory data (demoWorkflows, demoExecutions)
 * - Production: Persists to PostgreSQL via Prisma
 * - Controlled by FLOWFORGE_DEMO_MODE environment variable
 *
 * @module execution-service
 */

import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import { demoExecutions, demoWorkflows, demoExecutionDetails } from "~/data/demo-workflows";
import { publishExecutionEvent } from "~/services/events/execution-hub.server";
import { runWorkflow } from "./workflow-engine.server";
import { validateWorkflowDefinition } from "~/utils/workflow-validation";
import type {
  ExecutionSummary,
  ExecutionDetail,
  WorkflowDefinition,
  ExecutionLogEntry
} from "~/types/workflow";
import { getWorkflow } from "../workflows/workflow.server";

/**
 * Trigger execution of a workflow with the given input data.
 *
 * **Important: This function returns immediately (async execution).**
 * The actual workflow runs in the background via setTimeout. This allows:
 * - Fast API response (202 Accepted)
 * - Long-running workflows without blocking
 * - Real-time progress via SSE events
 *
 * **Execution Lifecycle:**
 * 1. Validate workflow structure (DAG, required fields)
 * 2. Create execution record with status="RUNNING"
 * 3. Publish EXECUTION_STARTED event (SSE)
 * 4. Return execution ID immediately (non-blocking)
 * 5. Run workflow in background (setTimeout 10ms)
 * 6. Publish task events as execution progresses
 * 7. Update final status (COMPLETED/FAILED) + publish event
 *
 * **Error Handling:**
 * - Validation errors: Thrown immediately (400 response)
 * - Workflow not found: Thrown immediately (404 response)
 * - Runtime errors: Published via SSE, stored in DB, execution marked FAILED
 *
 * **Event Publishing (SSE):**
 * All events are published to execution-hub for SSE subscribers:
 * - EXECUTION_STARTED
 * - TASK_STARTED (for each node)
 * - TASK_COMPLETED (for each node)
 * - TASK_FAILED (if node fails)
 * - EXECUTION_COMPLETED (final status)
 *
 * @param workflowId - ID of the workflow to execute
 * @param input - Input data accessible to workflow nodes via context
 * @returns Execution metadata (ID, status, workflowId)
 * @throws Response(404) if workflow not found
 * @throws Response(400) if workflow validation fails
 *
 * @example
 * ```typescript
 * const result = await triggerExecution('wf_123', {
 *   userId: '456',
 *   email: 'user@example.com'
 * });
 * console.log('Execution started:', result.executionId);
 * // Workflow runs in background, monitor via SSE at:
 * // GET /api/executions/{executionId}/stream
 * ```
 */
export async function triggerExecution(workflowId: string, input: Record<string, unknown>) {
  // Fetch workflow from database (or use demo data)
  const workflow = await getWorkflow(workflowId);

  if (!workflow) {
    if (isDemoMode()) {
      // Demo mode: Fallback to first demo workflow for convenience
      // This allows testing without database setup
      if (!demoWorkflows.length) {
        throw new Response("Workflow not found", { status: 404 });
      }
    } else {
      throw new Response("Workflow not found", { status: 404 });
    }
  }

  const activeWorkflow = workflow ?? demoWorkflows[0];

  if (!activeWorkflow) {
    throw new Response("Workflow not found", { status: 404 });
  }

  // VALIDATION: Synchronously validate before scheduling execution
  // This ensures we fail-fast with clear error messages
  // Catches: cycles, invalid node configs, missing required fields
  try {
    validateWorkflowDefinition(activeWorkflow.definition as unknown as WorkflowDefinition);
  } catch (error) {
    throw new Response((error as Error).message, { status: 400 });
  }

  // Generate unique execution ID (exec_XXXXXXXXXX format)
  const executionId = `exec_${nanoid(10)}`;

  // Publish initial event to SSE subscribers
  // Clients can immediately start listening at /api/executions/{executionId}/stream
  publishExecutionEvent(executionId, {
    type: "EXECUTION_STARTED",
    payload: { workflowId },
    timestamp: new Date().toISOString()
  });

  /**
   * ASYNC EXECUTION PATTERN:
   * Use setTimeout(10ms) to schedule execution in the background.
   * This allows the API to return immediately (202 Accepted) while
   * the workflow runs asynchronously.
   *
   * Why 10ms delay?
   * - Ensures DB transaction completes (execution record created below)
   * - Prevents race condition where SSE client connects before record exists
   * - Minimal delay for user experience
   *
   * Event-driven architecture:
   * - All progress is published via SSE (execution-hub)
   * - Clients can connect to stream immediately after receiving executionId
   * - No polling required, truly real-time updates
   */
  setTimeout(async () => {
    try {
      // Execute workflow with event callback for real-time updates
      // The callback publishes each event to SSE subscribers
      const result = await runWorkflow(
        activeWorkflow.definition as unknown as WorkflowDefinition,
        input,
        (event) => publishExecutionEvent(executionId, event), // SSE callback
        executionId,
        workflowId
      );

      // SUCCESS PATH: Publish completion event with final context
      publishExecutionEvent(executionId, {
        type: "EXECUTION_COMPLETED",
        payload: {
          status: "COMPLETED",
          context: result.sharedContext // All node outputs
        },
        timestamp: new Date().toISOString()
      });

      // Update database record with final status (production mode only)
      if (!isDemoMode()) {
        await prisma.execution.update({
          where: { id: executionId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            duration: result.durationMs,
            output: result.sharedContext as Prisma.InputJsonValue
          }
        });
      }
    } catch (error) {
      // ERROR PATH: Handle workflow execution failures
      // This catches errors from:
      // - Task handler failures (after all retries exhausted)
      // - Timeout errors
      // - Validation errors (shouldn't happen, already validated)

      // Publish failure event to SSE subscribers
      publishExecutionEvent(executionId, {
        type: "TASK_FAILED",
        payload: {
          message: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });

      // Persist failure to database (production mode only)
      if (!isDemoMode()) {
        await prisma.execution.update({
          where: { id: executionId },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            error: (error as Error).message
          }
        });

        // Create error log entry with stack trace for debugging
        await prisma.executionLog.create({
          data: {
            executionId,
            level: "ERROR",
            message: "Execution failed",
            metadata: {
              error: (error as Error).message,
              stack: (error as Error).stack ?? "no stack"
            }
          }
        });
      }

      // Publish final completion event (even for failures)
      // This signals to clients that execution is done
      publishExecutionEvent(executionId, {
        type: "EXECUTION_COMPLETED",
        payload: {
          status: "FAILED",
          error: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }, 10);

  // Create execution record in database BEFORE setTimeout completes
  // This ensures the record exists when SSE client queries execution details
  if (!isDemoMode()) {
    await prisma.execution.create({
      data: {
        id: executionId,
        workflowId,
        status: "RUNNING",  // Initial status (updated by setTimeout callback)
        input: input as Prisma.InputJsonValue
      }
    });
  }

  // Return immediately with execution metadata
  // The workflow is now running in the background (via setTimeout)
  // Client should connect to SSE stream to monitor progress
  return {
    executionId,
    workflowId,
    status: "RUNNING" as const,
    websocketUrl: `wss://demo.flowforge.local/ws/executions/${executionId}`
  };
}

/**
 * List recent executions for a workflow (or all executions).
 *
 * **Query Behavior:**
 * - If workflowId provided: Returns executions for that workflow only
 * - If no workflowId: Returns all recent executions (limit 25)
 * - Ordered by most recent first (startedAt DESC)
 *
 * **Demo Mode:**
 * - Returns in-memory demo executions
 * - Useful for testing UI without database
 *
 * **Production Mode:**
 * - Queries PostgreSQL via Prisma
 * - Limited to 25 most recent to prevent performance issues
 * - Consider pagination for production use with many executions
 *
 * @param workflowId - Optional workflow ID to filter by
 * @returns Array of execution summaries (id, status, duration, etc.)
 *
 * @example
 * ```typescript
 * // Get all executions for a workflow
 * const executions = await listExecutions('wf_123');
 *
 * // Get all recent executions
 * const allExecutions = await listExecutions();
 * ```
 */
export async function listExecutions(workflowId?: string): Promise<ExecutionSummary[]> {
  if (isDemoMode()) {
    return demoExecutions.filter((execution) => !workflowId || execution.workflowId === workflowId);
  }

  // Query database for recent executions
  // where clause: { workflowId } is equivalent to { workflowId: workflowId }
  // If workflowId is undefined, Prisma ignores the where clause (returns all)
  const executions = await prisma.execution.findMany({
    where: { workflowId },
    orderBy: { startedAt: "desc" },
    take: 25  // Limit to prevent performance issues with large datasets
  });

  // Transform Prisma objects to ExecutionSummary format
  // Convert Date objects to ISO strings for JSON serialization
  return executions.map((execution) => ({
    id: execution.id,
    workflowId: execution.workflowId,
    status: execution.status as ExecutionSummary["status"],
    duration: execution.duration ?? undefined,  // null → undefined for optional field
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString()
  }));
}

/**
 * Get detailed information about a specific execution.
 *
 * **Includes:**
 * - Execution metadata (id, status, duration, startedAt, completedAt)
 * - Task executions (status of each node with timings)
 * - Execution logs (last 50 entries, most recent first)
 * - Output data (final shared context from workflow)
 * - Error details (if execution failed)
 *
 * **Demo Mode:**
 * - Returns pre-populated demo execution details
 * - Searches both demoExecutionDetails and demoExecutions
 *
 * **Production Mode:**
 * - Queries PostgreSQL with joins (taskExecutions, logs)
 * - Logs limited to 50 most recent to prevent bloat
 * - Transforms Prisma objects to ExecutionDetail format
 *
 * **Use Cases:**
 * - Display execution details page in UI
 * - Monitor task progress and logs
 * - Debug failed executions
 * - Download execution results
 *
 * @param executionId - Unique execution ID (exec_XXXXXXXXXX format)
 * @returns Execution details with tasks and logs, or null if not found
 *
 * @example
 * ```typescript
 * const execution = await getExecution('exec_abc123');
 * if (execution) {
 *   console.log('Status:', execution.status);
 *   console.log('Tasks:', execution.tasks.length);
 *   console.log('Logs:', execution.logs.length);
 * }
 * ```
 */
export async function getExecution(executionId: string) {
  if (isDemoMode()) {
    return (
      demoExecutionDetails.find((execution) => execution.id === executionId) ??
      demoExecutions.find((execution) => execution.id === executionId) ??
      null
    );
  }

  // Query execution with related data (eager loading)
  // include: Prisma joins - fetches taskExecutions and logs in single query
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: {
      taskExecutions: true,  // All task executions for this workflow run
      logs: {
        orderBy: { timestamp: "desc" },  // Most recent first
        take: 50  // Limit to prevent huge payloads (latest 50 logs)
      }
    }
  });

  if (!execution) return null;

  // Transform Prisma result to ExecutionDetail format
  // Key transformations:
  // - Date → ISO string (for JSON serialization)
  // - Prisma.JsonValue → Record<string, unknown> (type casting)
  // - null → undefined for optional fields
  // - Nested arrays transformed with map()
  return {
    id: execution.id,
    workflowId: execution.workflowId,
    status: execution.status,
    duration: execution.duration ?? undefined,
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString(),
    output: execution.output as unknown as Record<string, unknown> | null,
    error: execution.error,

    // Transform task executions (one per node in workflow)
    tasks: execution.taskExecutions.map((task) => ({
      id: task.id,
      nodeId: task.nodeId,  // References WorkflowNode.id in database
      status: task.status,  // PENDING, RUNNING, SUCCESS, FAILED, TIMEOUT
      duration: task.duration ?? undefined,
      startedAt: task.startedAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      output: task.output as unknown as Record<string, unknown> | null,
      error: task.error  // Error message if task failed
    })),

    // Transform execution logs (INFO, WARN, ERROR, etc.)
    logs:
      execution.logs?.map((log) => ({
        id: log.id,
        level: log.level as ExecutionLogEntry["level"],  // DEBUG, INFO, WARN, ERROR, FATAL
        message: log.message,
        timestamp: log.timestamp.toISOString(),
        metadata: log.metadata as unknown as Record<string, unknown> | null,  // Additional context
        taskId: log.taskId  // Optional: which task generated this log
      })) ?? []
  } satisfies ExecutionDetail;  // Type safety: ensures return type matches ExecutionDetail
}
