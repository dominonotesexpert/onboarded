import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getExecution } from "~/services/execution/execution-service.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.executionId) {
    return json({ error: "Missing execution id" }, { status: 400 });
  }

  try {
    const execution = await getExecution(params.executionId);
    if (!execution) {
      return json({ error: "Execution not found" }, { status: 404 });
    }

    return json({ execution });
  } catch (error) {
    // Handle Remix response throws
    if (error instanceof Response) {
      return error;
    }

    // Handle all other errors
    console.error("Failed to get execution:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to retrieve execution",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
