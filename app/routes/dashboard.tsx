import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listExecutions } from "~/services/execution/execution-service.server";
import { listWorkflows } from "~/services/workflows/workflow.server";
import { useEventSource } from "remix-utils/sse/react";
import type { ExecutionDetail } from "~/types/workflow";

export async function loader() {
  const executions = await listExecutions();
  const workflows = await listWorkflows();
  return json({ executions, workflows });
}

export default function DashboardRoute() {
  const { executions, workflows } = useLoaderData<typeof loader>();
  const detailFetcher = useFetcher<{ execution: ExecutionDetail }>();
  const workflowNameById = useMemo(
    () =>
      Object.fromEntries(
        workflows.map((wf) => [wf.id, wf.name ?? wf.id])
      ),
    [workflows]
  );
  const [activeExecutionId, setActiveExecutionId] = useState(executions[0]?.id);
  const streamUrl = activeExecutionId ? `/api/executions/${activeExecutionId}/stream` : undefined;
  const event = useEventSource(streamUrl as string);
  const liveEvent = event ? JSON.parse(event) : null;
  const [executionDetail, setExecutionDetail] = useState<ExecutionDetail | null>(null);
  const lastLoadedExecution = useRef<string | null>(null);
  const lastLoadAt = useRef<number>(0);
  const [cards, setCards] = useState(executions);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // If nothing is selected but we have executions, select the first.
  useEffect(() => {
    if (!activeExecutionId && cards.length > 0) {
      setActiveExecutionId(cards[0].id);
    }
  }, [activeExecutionId, cards]);

  // Fetch when selection changes, but avoid spamming the same id repeatedly.
  useEffect(() => {
    if (!activeExecutionId) return;
    const now = Date.now();
    const isNew = lastLoadedExecution.current !== activeExecutionId;
    const shouldRefreshRunning =
      executionDetail?.status === "RUNNING" && now - lastLoadAt.current > 1500;

    if (isNew || shouldRefreshRunning) {
      lastLoadAt.current = now;
      detailFetcher.load(`/api/executions/${activeExecutionId}`);
      lastLoadedExecution.current = activeExecutionId;
    }
  }, [activeExecutionId, detailFetcher, executionDetail?.status]);

  // Fallback polling while a run is active to avoid sticky UI if SSE drops.
  useEffect(() => {
    if (!activeExecutionId) return;

    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }

    refreshTimer.current = setInterval(() => {
      const shouldPoll = executionDetail?.status === "RUNNING" || executionDetail == null;
      const isLoading = detailFetcher.state === "loading";
      if (shouldPoll && !isLoading) {
        detailFetcher.load(`/api/executions/${activeExecutionId}`);
      } else if (!shouldPoll && refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    }, 2000);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [activeExecutionId, detailFetcher, executionDetail, detailFetcher.state]);

  useEffect(() => {
    if (detailFetcher.data && "execution" in detailFetcher.data) {
      const exec = (detailFetcher.data as { execution: ExecutionDetail }).execution;
      setExecutionDetail(exec);
      setCards((prev) =>
        prev.map((c) => (c.id === exec.id ? { ...c, status: exec.status, duration: exec.duration } : c))
      );
    }
  }, [detailFetcher.data]);

  useEffect(() => {
    if (!liveEvent) return;
    if (liveEvent.type === "EXECUTION_COMPLETED" && activeExecutionId) {
      detailFetcher.load(`/api/executions/${activeExecutionId}`);
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeExecutionId ? { ...c, status: liveEvent.payload.status ?? "COMPLETED" } : c
        )
      );
    }
  }, [activeExecutionId, detailFetcher, liveEvent]);

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
        {cards.map((execution) => (
          <button
            key={execution.id}
            onClick={() => setActiveExecutionId(execution.id)}
            className={`card text-left ${activeExecutionId === execution.id ? "border-blue-400/60" : ""}`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{execution.status}</p>
            <p className="text-lg text-white font-semibold mt-1">
              {workflowNameById[execution.workflowId] ?? execution.workflowId}
            </p>
            <p className="text-xs text-white/50 mt-1">{execution.workflowId}</p>
            <p className="text-xs text-white/60 mt-2">
              {execution.duration
                ? `${execution.duration} ms`
                : execution.status === "RUNNING"
                  ? "Processing"
                  : execution.status}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Live Event Stream</p>
          <pre className="bg-black/30 rounded-2xl text-xs text-emerald-200 p-4 h-64 overflow-auto">
            {liveEvent ? JSON.stringify(liveEvent, null, 2) : "Awaiting events..."}
          </pre>
        </section>

        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Execution Detail</p>
              <p className="text-white font-semibold text-lg">{executionDetail?.id ?? "Select a run"}</p>
            </div>
            {executionDetail ? <span className="pill">{executionDetail.status}</span> : null}
          </div>
          {executionDetail ? (
            <div className="space-y-2 text-xs text-white/70 max-h-64 overflow-auto">
              <p>Workflow: {executionDetail.workflowId}</p>
              <p>
                Started:{" "}
                {executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleString() : "--"}
              </p>
              <p>
                Completed:{" "}
                {executionDetail.completedAt
                  ? new Date(executionDetail.completedAt).toLocaleString()
                  : "--"}
              </p>
              <p>Duration: {executionDetail.duration ? `${executionDetail.duration} ms` : "--"}</p>
              <p className="text-white/80">Logs:</p>
              <div className="space-y-1">
                {(executionDetail.logs ?? []).map((log) => (
                  <div key={log.id} className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-white/60">{log.level}</span>
                      <span className="text-[10px] text-white/50">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white text-xs">{log.message}</p>
                  </div>
                ))}
                {(executionDetail.logs ?? []).length === 0 ? (
                  <p className="text-white/60">No logs yet.</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/60">Select a run to see details.</p>
          )}
        </section>
      </div>
    </div>
  );
}
