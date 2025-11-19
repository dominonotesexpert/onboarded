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

  const input = await request.json();
  const execution = await triggerExecution(workflowId, input.input ?? {});

  return json(execution, { status: 202 });
}
