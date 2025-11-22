import { json, type ActionFunctionArgs } from "@remix-run/node";
import { triggerExecution } from "~/services/execution/execution-service.server";

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
    // Handle malformed JSON
    if (error instanceof SyntaxError) {
      return json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Handle Remix response throws (e.g., from loaders/actions)
    if (error instanceof Response) {
      return error;
    }

    // Handle all other errors
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
