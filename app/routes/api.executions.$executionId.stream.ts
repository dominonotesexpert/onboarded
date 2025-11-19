import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { subscribeToExecution } from "~/services/events/execution-hub.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const executionId = params.executionId;
  if (!executionId) {
    throw new Response("Missing execution id", { status: 400 });
  }

  return eventStream(request.signal, (send) => {
    const unsubscribe = subscribeToExecution(executionId, (event) => {
      send({ event: event.type, data: JSON.stringify(event) });
    });

    return () => unsubscribe();
  });
}
