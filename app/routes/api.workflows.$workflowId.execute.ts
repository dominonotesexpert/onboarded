/**
 * Workflow Execution API Route
 *
 * Triggers execution of a workflow with custom input data.
 * Execution runs asynchronously - this endpoint returns immediately with execution ID.
 *
 * Endpoint:
 * - POST /api/workflows/:workflowId/execute
 *
 * @module api.workflows.$workflowId.execute
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { triggerExecution } from "~/services/execution/execution-service.server";

/**
 * POST /api/workflows/:workflowId/execute
 *
 * Trigger a workflow execution with the provided input data.
 *
 * Request body:
 * ```json
 * {
 *   "input": {
 *     "userId": "123",
 *     "email": "user@example.com",
 *     "score": 75
 *   }
 * }
 * ```
 *
 * The input object is passed to the workflow and accessible in:
 * - Node handlers via `context.shared`
 * - Templates via `{{ variable }}` syntax
 * - Conditional expressions via `score > 50`
 *
 * @param workflowId - Workflow ID from URL parameter
 * @param input - Input data to pass to workflow execution
 * @returns 202 Accepted with execution object (runs async)
 * @returns 400 Bad Request if workflowId missing or JSON invalid
 * @returns 404 Not Found if workflow doesn't exist
 * @returns 500 Internal Server Error on execution start failure
 *
 * Response format:
 * ```json
 * {
 *   "id": "exec_abc123",
 *   "workflowId": "wf_xyz789",
 *   "status": "PENDING",
 *   "startedAt": "2025-01-15T10:30:00Z",
 *   "input": { ... }
 * }
 * ```
 */
export async function action({ params, request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Unsupported method" }, { status: 405 });
  }

  const workflowId = params.workflowId;
  if (!workflowId) {
    return json({ error: "Missing workflow id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const execution = await triggerExecution(workflowId, body.input ?? {});
    return json(execution, { status: 202 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    if (error instanceof Response) {
      return error;
    }
    console.error("Workflow execution error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to start workflow execution",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
