import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getExecution } from "~/services/execution/execution-service.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.executionId) {
    return json({ error: "Missing execution id" }, { status: 400 });
  }

  const execution = await getExecution(params.executionId);
  if (!execution) {
    return json({ error: "Execution not found" }, { status: 404 });
  }

  return json({ execution });
}
