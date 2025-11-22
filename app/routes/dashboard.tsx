import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listExecutions } from "~/services/execution/execution-service.server";
import { listWorkflows } from "~/services/workflows/workflow.server";
import { useEventSource } from "remix-utils/sse/react";
import type { ExecutionDetail } from "~/types/workflow";
import { Button } from "~/components/common/Button";
import { Card } from "~/components/common/Card";

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
  const streamUrl = activeExecutionId ? `/api/executions/${activeExecutionId}/stream` : "data:text/event-stream,";
  const event = useEventSource(streamUrl);
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
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-400 font-medium mb-2">Monitoring</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Execution Dashboard</h2>
        </div>
        <Button href="/workflows" variant="secondary" rightIcon={<span>→</span>}>
          Manage Workflows
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((execution) => (
          <Card
            key={execution.id}
            hover
            onClick={() => setActiveExecutionId(execution.id)}
            className={`cursor-pointer border-2 ${activeExecutionId === execution.id
                ? "border-blue-500/50 bg-blue-500/5 shadow-glow-sm"
                : "border-transparent"
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <StatusBadge status={execution.status} />
              <span className="text-[10px] text-slate-500 font-mono">
                {execution.id.slice(0, 8)}
              </span>
            </div>
            <p className="text-lg text-white font-semibold truncate">
              {workflowNameById[execution.workflowId] ?? execution.workflowId}
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-400">Duration</span>
              <span className="text-xs font-mono text-slate-300">
                {execution.duration
                  ? `${execution.duration}ms`
                  : execution.status === "RUNNING"
                    ? "..."
                    : "--"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-medium">Live Event Stream</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${liveEvent ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-500">{liveEvent ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-auto font-mono text-xs">
            {liveEvent ? (
              <pre className="text-emerald-400">
                {JSON.stringify(liveEvent, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600">
                Awaiting events...
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-medium mb-1">Execution Detail</p>
              <p className="text-white font-semibold text-lg font-mono">{executionDetail?.id ?? "Select a run"}</p>
            </div>
            {executionDetail && <StatusBadge status={executionDetail.status} />}
          </div>

          {executionDetail ? (
            <div className="flex-1 overflow-hidden flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Started</p>
                  <p className="text-sm text-white font-mono">
                    {executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleString() : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Completed</p>
                  <p className="text-sm text-white font-mono">
                    {executionDetail.completedAt ? new Date(executionDetail.completedAt).toLocaleString() : "--"}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-sm text-slate-300 font-medium mb-3">Logs</p>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {(executionDetail.logs ?? []).map((log) => (
                    <div
                      key={log.id}
                      className="group relative rounded-lg border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <LogLevel level={log.level} />
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-mono leading-relaxed">{log.message}</p>

                      {["ERROR", "FATAL"].includes(log.level) && log.metadata && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-xs font-semibold text-red-400 mb-1">Error Details</p>
                          {log.metadata.error && (
                            <pre className="text-[10px] text-red-300 whitespace-pre-wrap overflow-x-auto">
                              {String(log.metadata.error)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(executionDetail.logs ?? []).length === 0 && (
                    <div className="text-center py-12 text-slate-600 text-sm">
                      No logs available for this execution.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Select an execution to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    RUNNING: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    PENDING: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const style = colors[status as keyof typeof colors] || colors.PENDING;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
}

function LogLevel({ level }: { level: string }) {
  const colors = {
    INFO: "text-blue-400",
    WARN: "text-amber-400",
    ERROR: "text-red-400",
    FATAL: "text-red-500 font-bold",
    DEBUG: "text-slate-400"
  };

  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold ${colors[level as keyof typeof colors] || "text-slate-400"}`}>
      {level}
    </span>
  );
}
