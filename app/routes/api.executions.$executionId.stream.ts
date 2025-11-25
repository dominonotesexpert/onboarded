import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { subscribeToExecution } from "~/services/events/execution-hub.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const executionId = params.executionId;
  if (!executionId) {
    throw new Response("Missing execution id", { status: 400 });
  }

  console.log(`🔌 SSE connection opened for execution: ${executionId}`);

  return eventStream(request.signal, (send) => {
    const unsubscribe = subscribeToExecution(executionId, (event) => {
      console.log(`📤 Sending SSE event to client:`, event.type);
      // Send as default 'message' event so useEventSource can receive it
      send({ data: JSON.stringify(event) });
    });

    return () => {
      console.log(`🔌 SSE connection closed for execution: ${executionId}`);
      unsubscribe();
    };
  });
}
