import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createWorkflow, listWorkflows } from "~/services/workflows/workflow.server";

export async function loader() {
  const workflows = await listWorkflows();
  return json({ workflows });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Unsupported method" }, { status: 405 });
  }

  const payload = await request.json();
  const workflow = await createWorkflow(payload);

  return json({ workflow }, { status: 201 });
}
