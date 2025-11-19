import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { listExecutions } from "~/services/execution/execution-service.server";
import { useEventSource } from "remix-utils/sse/react";

export async function loader({}: LoaderFunctionArgs) {
  const executions = await listExecutions();
  return json({ executions });
}

export default function DashboardRoute() {
  const { executions } = useLoaderData<typeof loader>();
  const [activeExecutionId, setActiveExecutionId] = useState(executions[0]?.id);
  const event = useEventSource(
    activeExecutionId ? `/api/executions/${activeExecutionId}/stream` : null
  );
  const liveEvent = event ? JSON.parse(event) : null;

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Monitoring</p>
          <h2 className="text-3xl font-semibold text-white">Execution Dashboard</h2>
        </div>
        <Link to="/workflows" className="btn-secondary">
          Manage Workflows
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {executions.map((execution) => (
          <button
            key={execution.id}
            onClick={() => setActiveExecutionId(execution.id)}
            className={`card text-left ${activeExecutionId === execution.id ? "border-blue-400/60" : ""}`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{execution.status}</p>
            <p className="text-lg text-white font-semibold mt-1">{execution.workflowId}</p>
            <p className="text-xs text-white/60 mt-2">
              {execution.duration ? `${execution.duration} ms` : "Processing"}
            </p>
          </button>
        ))}
      </div>

      <section className="card space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Live Event Stream</p>
        <pre className="bg-black/30 rounded-2xl text-xs text-emerald-200 p-4 h-64 overflow-auto">
          {liveEvent ? JSON.stringify(liveEvent, null, 2) : "Awaiting events..."}
        </pre>
      </section>
    </div>
  );
}
