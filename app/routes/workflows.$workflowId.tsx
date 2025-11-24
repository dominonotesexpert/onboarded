import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listExecutions, triggerExecution } from "~/services/execution/execution-service.server";
import { getWorkflow, updateWorkflow } from "~/services/workflows/workflow.server";
import { definitionToReactFlow, reactFlowToDefinition } from "~/utils/workflow-transform";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { ClientOnly } from "~/components/common/ClientOnly";
import type { ExecutionDetail, WorkflowDefinition, TaskStatus } from "~/types/workflow";
import { useEventSource } from "remix-utils/sse/react";
import { getValidationIssues } from "~/utils/workflow-validation";
import { useToast } from "~/components/common/Toaster";

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
  const intent = String(formData.get("intent") ?? "run");

  // Update workflow intent
  if (intent === "update" || intent === "publish") {
    try {
      const parsed = JSON.parse(String(formData.get("definition") ?? "{}"));
      const definition = reactFlowToDefinition(parsed.nodes ?? [], parsed.edges ?? []);
      if (intent === "publish") {
        const issues = getValidationIssues(definition as WorkflowDefinition);
        if (issues.length > 0) {
          return json(
            { error: issues[0]?.message ?? "Workflow validation failed", issues },
            { status: 400 }
          );
        }
      }

      const workflow = await updateWorkflow(params.workflowId, {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        definition,
        isDraft: intent !== "publish",
        isPublished: intent === "publish"
      });

      if (!workflow) {
        return json({ error: "Workflow not found" }, { status: 404 });
      }

      return json({ workflow, saved: true, published: intent === "publish" });
    } catch (error) {
      const message = (error as Error)?.message ?? "Failed to save workflow";
      return json({ error: message }, { status: 400 });
    }
  }

  // Trigger execution intent
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
  const saveFetcher = useFetcher<typeof action>();
  const { pushToast } = useToast();
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name ?? "");
  const [description, setDescription] = useState(workflow.description ?? "");

  const detailFetcher = useFetcher<{ execution: ExecutionDetail }>();
  // Only connect to event stream if we have a valid execution ID
  const streamUrl = selectedExecutionId ? `/api/executions/${selectedExecutionId}/stream` : "data:text/event-stream,";
  const eventStream = useEventSource(streamUrl);
  const lastLoadedExecution = useRef<string | null>(null);
  const lastLoadAt = useRef<number>(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const executionDetailRef = useRef<HTMLElement | null>(null);

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
      const exec = detailFetcher.data.execution;
      setExecutionDetail(exec);
      setExecutionList((prev) => {
        const updated = prev.map((item) =>
          item.id === exec.id
            ? {
                ...item,
                status: exec.status,
                duration: exec.duration,
                completedAt: exec.completedAt
              }
            : item
        );
        const exists = updated.some((item) => item.id === exec.id);
        if (exists) return updated;
        return [
          ...updated,
          {
            id: exec.id,
            workflowId: workflow.id,
            status: exec.status,
            duration: exec.duration,
            startedAt: exec.startedAt,
            completedAt: exec.completedAt
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
      const newExecutionId = fetcher.data.executionId as string;
      setStatusMessage(`Triggered execution ${newExecutionId}`);
      setErrorMessage(null);

      // Auto-select the new execution
      setSelectedExecutionId(newExecutionId);

      // Show toast notification
      pushToast({
        title: "Workflow execution started",
        description: `Execution ${newExecutionId} is now running`
      });

      // Scroll to execution details section after a brief delay
      setTimeout(() => {
        executionDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (fetcher.data && "error" in fetcher.data) {
      setErrorMessage(fetcher.data.error as string);
      setStatusMessage(null);
    }
  }, [fetcher.data, pushToast]);

  useEffect(() => {
    setDefinition(definitionToReactFlow(workflowDefinition));
    setShowPublishedBanner(published);
    setName(workflow.name ?? "");
    setDescription(workflow.description ?? "");
  }, [workflowDefinition]);

  useEffect(() => {
    if (saveFetcher.data && "error" in saveFetcher.data) {
      pushToast({ title: "Save failed", description: String(saveFetcher.data.error) });
    } else if (saveFetcher.data && "saved" in saveFetcher.data) {
      pushToast({
        title: saveFetcher.data.published ? "Workflow published" : "Workflow saved",
        description: saveFetcher.data.published
          ? "Workflow published successfully."
          : "Draft updated successfully."
      });
      setIsEditing(false);
    }
  }, [pushToast, saveFetcher.data]);

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Workflow</p>
          {isEditing ? (
            <div className="flex flex-col gap-2 max-w-xl">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                value={description ?? ""}
                placeholder="Describe the automation"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-semibold text-white">{workflow.name}</h2>
              <p className="text-sm text-white/60 mt-2 max-w-3xl">{workflow.description}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel Edit" : "Edit Workflow"}
          </button>
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  saveFetcher.submit(
                    {
                      intent: "update",
                      name,
                      description,
                      definition: JSON.stringify({
                        nodes: definition.nodes,
                        edges: definition.edges
                      })
                    },
                    { method: "post" }
                  )
                }
              >
                Save Draft
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  saveFetcher.submit(
                    {
                      intent: "publish",
                      name,
                      description,
                      definition: JSON.stringify({
                        nodes: definition.nodes,
                        edges: definition.edges
                      })
                    },
                    { method: "post" }
                  )
                }
              >
                Publish
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`btn-primary ${fetcher.state !== "idle" ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={fetcher.state !== "idle"}
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
          )}
        </div>
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
            showPalette={isEditing}
            interactive={isEditing}
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

      <section ref={executionDetailRef} className="space-y-4">
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
                  Started{" "}
                  <ClientOnly fallback="--">
                    {() => new Date(execution.startedAt).toLocaleString()}
                  </ClientOnly>
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
                <p>
                  <ClientOnly fallback="--">
                    {() => executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleString() : "--"}
                  </ClientOnly>
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Completed</p>
                <p>
                  <ClientOnly fallback="--">
                    {() => executionDetail.completedAt ? new Date(executionDetail.completedAt).toLocaleString() : "--"}
                  </ClientOnly>
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
                      <ClientOnly fallback="--">
                        {() => task.startedAt ? new Date(task.startedAt).toLocaleTimeString() : "--"}
                      </ClientOnly>
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
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 relative group"
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
                          <ClientOnly fallback="--">
                            {() => new Date(log.timestamp).toLocaleTimeString()}
                          </ClientOnly>
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
                      {["ERROR", "FATAL"].includes(log.level) && log.metadata ? (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-2 translate-y-full bg-slate-950/95 border border-rose-400/40 text-rose-100 rounded-lg px-3 py-2 text-[11px] max-w-xs shadow-glow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                          <p className="font-semibold mb-1">Error details</p>
                          {log.metadata.error ? (
                            <p className="whitespace-pre-wrap">Message: {String(log.metadata.error)}</p>
                          ) : null}
                          {log.metadata.stack ? (
                            <p className="whitespace-pre-wrap mt-1 text-white/70">
                              Stack: {String(log.metadata.stack)}
                            </p>
                          ) : null}
                          {!log.metadata.error && !log.metadata.stack ? (
                            <p className="text-white/60">No additional metadata.</p>
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
