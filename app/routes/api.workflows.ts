import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createWorkflow, listWorkflows } from "~/services/workflows/workflow.server";

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
