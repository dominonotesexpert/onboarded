import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listExecutions, triggerExecution } from "~/services/execution/execution-service.server";
import { getWorkflow } from "~/services/workflows/workflow.server";
import { definitionToReactFlow } from "~/utils/workflow-transform";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { ClientOnly } from "~/components/common/ClientOnly";
import type { ExecutionDetail, WorkflowDefinition, TaskStatus } from "~/types/workflow";
import { useEventSource } from "remix-utils/sse/react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  if (!params.workflowId) {
    throw new Response("Missing workflow id", { status: 400 });
  }
  const workflow = await getWorkflow(params.workflowId);
  if (!workflow) {
    throw new Response("Workflow not found", { status: 404 });
  }
  const url = new URL(request.url);
  const published = url.searchParams.get("status") === "published";

  const executions = await listExecutions(params.workflowId);
  return json({ workflow, executions, published });
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (!params.workflowId) {
    return json({ error: "Missing workflow id" }, { status: 400 });
  }

  const formData = await request.formData();
  const payload = JSON.parse(String(formData.get("input") ?? "{}"));
  try {
    const execution = await triggerExecution(params.workflowId, payload ?? {});
    return json(execution, { status: 202 });
  } catch (error) {
    const message = (error as Error).message ?? "Failed to start execution";
    const status = error instanceof Response ? error.status : 400;
    return json({ error: message }, { status });
  }
}

export default function WorkflowDetailRoute() {
  const { workflow, executions, published } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const workflowDefinition = useMemo<WorkflowDefinition>(
    () =>
      (workflow.definition ?? { nodes: [], edges: [] }) as unknown as WorkflowDefinition,
    [workflow.definition]
  );
  const [executionList, setExecutionList] = useState(executions);
  const [definition, setDefinition] = useState(() => definitionToReactFlow(workflowDefinition));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPublishedBanner, setShowPublishedBanner] = useState(published);
  const [selectedExecutionId, setSelectedExecutionId] = useState(executions[0]?.id ?? null);
  const [executionDetail, setExecutionDetail] = useState<ExecutionDetail | null>(null);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, TaskStatus>>({});

  const detailFetcher = useFetcher<{ execution: ExecutionDetail }>();
  const streamUrl = selectedExecutionId ? `/api/executions/${selectedExecutionId}/stream` : "";
  const eventStream = useEventSource(streamUrl);
  const lastLoadedExecution = useRef<string | null>(null);
  const lastLoadAt = useRef<number>(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!selectedExecutionId) return;

    const now = Date.now();
    const shouldRefreshRunning =
      executionDetail?.status === "RUNNING" && now - lastLoadAt.current > 1500;
    const isNewSelection = lastLoadedExecution.current !== selectedExecutionId;

    if (isNewSelection || shouldRefreshRunning) {
      lastLoadAt.current = now;
      detailFetcher.load(`/api/executions/${selectedExecutionId}`);
      lastLoadedExecution.current = selectedExecutionId;
    }
  }, [detailFetcher, executionDetail?.status, selectedExecutionId]);

  // Fallback auto-poll while RUNNING to avoid sticky UI if SSE misses.
  useEffect(() => {
    if (!selectedExecutionId) return;

    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }

    refreshTimer.current = setInterval(() => {
      if (executionDetail?.status === "RUNNING") {
        detailFetcher.load(`/api/executions/${selectedExecutionId}`);
      } else if (refreshTimer.current) {
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
  }, [detailFetcher, executionDetail?.status, selectedExecutionId]);

  useEffect(() => {
    if (detailFetcher.data?.execution) {
      setExecutionDetail(detailFetcher.data.execution);
      // Keep the execution list in sync so cards/pills show the latest status and duration.
      setExecutionList((prev) => {
        const updated = prev.map((item) =>
          item.id === detailFetcher.data?.execution.id
            ? {
                ...item,
                status: detailFetcher.data.execution.status,
                duration: detailFetcher.data.execution.duration,
                completedAt: detailFetcher.data.execution.completedAt
              }
            : item
        );
        // If the execution was not previously in the list (rare), append it.
        const exists = updated.some((item) => item.id === detailFetcher.data?.execution.id);
        if (exists) return updated;
        const e = detailFetcher.data.execution;
        return [
          ...updated,
          {
            id: e.id,
            workflowId: workflow.id,
            status: e.status,
            duration: e.duration,
            startedAt: e.startedAt,
            completedAt: e.completedAt
          }
        ];
      });
      const taskStatuses =
        detailFetcher.data.execution.tasks?.reduce<Record<string, TaskStatus>>((acc, task) => {
          acc[task.nodeId] = task.status;
          return acc;
        }, {}) ?? {};
      setLiveStatuses(taskStatuses);
    }
  }, [detailFetcher.data]);

  useEffect(() => {
    if (!eventStream) return;
    const parsed = JSON.parse(eventStream);
    if (parsed.type === "TASK_STARTED") {
      setLiveStatuses((prev) => ({ ...prev, [parsed.payload.nodeId]: "RUNNING" as TaskStatus }));
    } else if (parsed.type === "TASK_COMPLETED") {
      setLiveStatuses((prev) => ({ ...prev, [parsed.payload.nodeId]: "SUCCESS" as TaskStatus }));
      // Refresh details during long runs so the UI does not stick on the last visible task.
      if (selectedExecutionId) {
        detailFetcher.load(`/api/executions/${selectedExecutionId}`);
      }
    } else if (parsed.type === "TASK_FAILED") {
      setLiveStatuses((prev) => ({ ...prev, [parsed.payload.nodeId]: "FAILED" as TaskStatus }));
      detailFetcher.load(`/api/executions/${selectedExecutionId}`);
    } else if (parsed.type === "EXECUTION_COMPLETED") {
      if (selectedExecutionId) {
        detailFetcher.load(`/api/executions/${selectedExecutionId}`);
      }
    }
  }, [detailFetcher, eventStream, selectedExecutionId]);

  useEffect(() => {
    if (fetcher.data && "executionId" in fetcher.data) {
      setStatusMessage(`Triggered execution ${fetcher.data.executionId}`);
      setErrorMessage(null);
    } else if (fetcher.data && "error" in fetcher.data) {
      setErrorMessage(fetcher.data.error as string);
      setStatusMessage(null);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setDefinition(definitionToReactFlow(workflowDefinition));
    setShowPublishedBanner(published);
  }, [workflowDefinition]);

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Workflow</p>
          <h2 className="text-3xl font-semibold text-white">{workflow.name}</h2>
          <p className="text-sm text-white/60 mt-2 max-w-3xl">{workflow.description}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            fetcher.submit(
              {
                input: JSON.stringify({
                  employee: { name: "Demo User", email: "demo@flowforge.dev" }
                })
              },
              { method: "post" }
            )
          }
        >
          Run Workflow
        </button>
      </header>

      {showPublishedBanner ? (
        <div className="card border border-emerald-400/40 text-emerald-200 text-sm flex items-start justify-between gap-3">
          <span>Workflow published successfully.</span>
          <button
            type="button"
            className="text-emerald-100/80 hover:text-emerald-50"
            onClick={() => setShowPublishedBanner(false)}
          >
            ×
          </button>
        </div>
      ) : null}
      {errorMessage ? (
        <div className="card border border-rose-400/40 text-rose-200 text-sm">{errorMessage}</div>
      ) : null}
      {statusMessage ? (
        <div className="card border border-emerald-400/40 text-emerald-200 text-sm">{statusMessage}</div>
      ) : null}

      <ClientOnly fallback={<div className="h-[640px] bg-white/5 rounded-3xl animate-pulse" />}>
        {() => (
          <FlowBuilder
            key={workflow.id}
            initialNodes={definition.nodes}
            initialEdges={definition.edges}
            onChange={(payload) => setDefinition(payload)}
            showPalette={false}
            interactive={false}
            nodeStatuses={
              Object.keys(liveStatuses).length > 0
                ? liveStatuses
                : executionDetail?.tasks
                  ? Object.fromEntries(
                      executionDetail.tasks.map((task) => [task.nodeId, task.status as TaskStatus])
                    )
                  : undefined
            }
          />
        )}
      </ClientOnly>

      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Recent Executions</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {executionList.map((execution) => {
            const active = execution.id === selectedExecutionId;
            return (
              <button
                key={execution.id}
                onClick={() => setSelectedExecutionId(execution.id)}
                className={`card text-left transition ${
                  active ? "border-blue-400/60 shadow-glow" : "hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{execution.status}</p>
                  <p className="text-xs text-white/60">{execution.duration ?? "--"} ms</p>
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Started {new Date(execution.startedAt).toLocaleString()}
                </p>
              </button>
            );
          })}
        </div>

        {executionDetail ? (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Execution Detail</p>
                <p className="text-lg text-white font-semibold">{executionDetail.id}</p>
              </div>
              <span className="pill">{executionDetail.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Started</p>
                <p>{executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleString() : "--"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Completed</p>
                <p>
                  {executionDetail.completedAt
                    ? new Date(executionDetail.completedAt).toLocaleString()
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Duration</p>
                <p>{executionDetail.duration ? `${executionDetail.duration} ms` : "--"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Tasks</p>
              <div className="space-y-2">
                {(executionDetail.tasks ?? []).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-white font-semibold">{task.label ?? task.nodeId}</p>
                      <p className="text-xs text-white/60">
                        {task.status} • {task.duration ? `${task.duration} ms` : "--"}
                      </p>
                    </div>
                    <div className="text-xs text-white/50 text-right">
                      {task.startedAt ? new Date(task.startedAt).toLocaleTimeString() : "--"}
                    </div>
                  </div>
                ))}
                {(executionDetail.tasks ?? []).length === 0 ? (
                  <p className="text-xs text-white/60">No task data available.</p>
                ) : null}
              </div>
            </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Logs</p>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {(executionDetail.logs ?? []).map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] ${
                            log.level === "ERROR" || log.level === "FATAL"
                              ? "border-rose-400/50 text-rose-200"
                              : log.level === "WARN"
                                ? "border-amber-300/60 text-amber-200"
                                : "border-white/20 text-white/80"
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-white/50">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1">{log.message}</p>
                      {"metadata" in log && log.metadata ? (
                        <div className="mt-1 text-[11px] text-white/60">
                          {log.metadata.error ? <p>Error: {String(log.metadata.error)}</p> : null}
                          {log.metadata.stack ? (
                            <p className="text-white/50">Stack: {String(log.metadata.stack)}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {(executionDetail.logs ?? []).length === 0 ? (
                    <p className="text-xs text-white/60">No logs recorded.</p>
                  ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
