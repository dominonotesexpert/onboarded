import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listExecutions } from "~/services/execution/execution-service.server";
import { listWorkflows } from "~/services/workflows/workflow.server";
import { useEventSource } from "remix-utils/sse/react";
import type { ExecutionDetail } from "~/types/workflow";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-2">Monitoring</p>
            <h2 className="text-4xl font-display font-bold text-white">Execution Dashboard</h2>
          </div>
          <Link
            to="/workflows"
            className="btn-secondary px-4 py-2 flex items-center gap-2 group hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Manage Workflows</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar List */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {cards.map((execution) => (
                <motion.button
                  layout
                  key={execution.id}
                  onClick={() => setActiveExecutionId(execution.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden min-h-[120px] ${activeExecutionId === execution.id
                      ? "bg-white/10 border-neon-blue/50 shadow-glow-sm"
                      : "bg-glass-light border-glass-border hover:bg-glass-medium"
                    }`}
                >
                  {activeExecutionId === execution.id && (
                    <motion.div
                      layoutId="active-glow"
                      className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent pointer-events-none"
                    />
                  )}

                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className={`h-5 inline-flex items-center justify-center px-2.5 rounded-full border text-[10px] font-bold tracking-wider uppercase ${execution.status === 'COMPLETED' ? 'bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald' :
                        execution.status === 'FAILED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                          'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                      }`}>
                      {execution.status}
                    </span>
                    <span className="text-xs text-white/40 font-mono">
                      {execution.duration ? `${execution.duration}ms` : '...'}
                    </span>
                  </div>

                  <p className="text-white font-medium truncate relative z-10">
                    {workflowNameById[execution.workflowId] ?? execution.workflowId}
                  </p>
                  <p className="text-white/40 text-xs font-mono mt-1 truncate relative z-10">
                    {execution.id}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Main Detail Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Status Card */}
            <div className="glass p-6 rounded-2xl min-h-[260px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-1">Selected Execution</p>
                  <p className="text-white font-display font-bold text-xl tracking-wide">
                    {executionDetail?.id ?? "Select a run"}
                  </p>
                </div>
                {executionDetail && (
                  <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${executionDetail.status === 'COMPLETED' ? 'bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald' :
                    executionDetail.status === 'FAILED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${executionDetail.status === 'RUNNING' ? 'animate-pulse bg-current' : 'bg-current'
                      }`} />
                    <span className="text-xs font-bold tracking-wide">{executionDetail.status}</span>
                  </div>
                )}
              </div>

              {executionDetail ? (
                <div className="grid grid-cols-3 gap-4 mt-auto">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Started</p>
                    <p className="text-white font-mono text-sm">
                      {executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleTimeString() : "--"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Completed</p>
                    <p className="text-white font-mono text-sm">
                      {executionDetail.completedAt ? new Date(executionDetail.completedAt).toLocaleTimeString() : "--"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-white font-mono text-sm">
                      {executionDetail.duration ? `${executionDetail.duration} ms` : "--"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/30">
                  Select an execution to view details
                </div>
              )}
            </div>

            {/* Logs Terminal */}
            <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col border border-white/10 bg-[#0c0c0c]">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <span className="text-xs text-white/30 font-mono">EXECUTION LOGS</span>
                <div className="w-12" /> {/* Spacer */}
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-xs space-y-1 custom-scrollbar">
                {executionDetail ? (
                  <>
                    {(executionDetail.logs ?? []).map((log) => {
                      const meta = (log.metadata ?? {}) as Record<string, unknown>;
                      const metaError = "error" in meta && meta.error !== undefined ? String(meta.error) : undefined;
                      const metaStack = "stack" in meta && meta.stack !== undefined ? String(meta.stack) : undefined;
                      return (
                        <div key={log.id} className="group flex gap-3 hover:bg-white/5 p-1 rounded -mx-1 transition-colors">
                          <span className="text-white/30 shrink-0 w-20">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                          </span>
                          <span className={`shrink-0 w-16 font-bold ${log.level === 'ERROR' || log.level === 'FATAL' ? 'text-red-400' :
                            log.level === 'WARN' ? 'text-yellow-400' :
                              'text-neon-blue'
                            }`}>
                            {log.level}
                          </span>
                          <div className="text-white/80 break-all">
                            {log.message}
                            {["ERROR", "FATAL"].includes(log.level) && (metaError || metaStack) && (
                              <div className="mt-1 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300">
                                {metaError && <div>{String(metaError)}</div>}
                                {metaStack && <div className="opacity-50 mt-1 whitespace-pre-wrap">{String(metaStack)}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(executionDetail.logs ?? []).length === 0 && (
                      <div className="text-white/30 italic">No logs available for this execution.</div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/20">
                    Waiting for selection...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
