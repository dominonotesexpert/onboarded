/**
 * Workflows API Route
 *
 * Handles workflow CRUD operations via REST API.
 *
 * Endpoints:
 * - GET /api/workflows - List all workflows
 * - POST /api/workflows - Create new workflow
 *
 * @module api.workflows
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createWorkflow, listWorkflows } from "~/services/workflows/workflow.server";

/**
 * GET /api/workflows
 *
 * List all workflows with metadata (name, description, published status, etc.)
 *
 * @returns JSON array of workflows
 *
 * Response format:
 * ```json
 * {
 *   "workflows": [
 *     {
 *       "id": "abc123",
 *       "name": "Welcome Email Flow",
 *       "description": "Sends welcome email to new users",
 *       "isPublished": true,
 *       "isDraft": false,
 *       "createdAt": "2025-01-15T10:30:00Z",
 *       "updatedAt": "2025-01-15T14:20:00Z"
 *     }
 *   ]
 * }
 * ```
 */
export async function loader() {
  try {
    const workflows = await listWorkflows();
    return json({ workflows });
  } catch (error) {
    console.error("Failed to list workflows:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to list workflows",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 *
 * Create a new workflow with the given definition.
 *
 * Request body:
 * ```json
 * {
 *   "name": "My Workflow",
 *   "description": "Optional description",
 *   "definition": {
 *     "nodes": [...],
 *     "edges": [...]
 *   },
 *   "isDraft": true,      // Optional (default: true)
 *   "isPublished": false  // Optional (default: false)
 * }
 * ```
 *
 * Validation:
 * - Name is required (1-80 characters)
 * - Workflow definition must be valid JSON
 * - Workflow must pass validation (DAG, required node fields)
 *
 * @returns 201 Created with workflow object on success
 * @returns 400 Bad Request if validation fails or JSON is invalid
 * @returns 500 Internal Server Error on database/server errors
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Unsupported method" }, { status: 405 });
  }

  try {
    const payload = await request.json();
    const workflow = await createWorkflow(payload);
    return json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    if (error instanceof Response) {
      return error;
    }
    console.error("Failed to create workflow:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to create workflow",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
