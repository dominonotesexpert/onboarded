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
import { Button } from "~/components/common/Button";
import { Card } from "~/components/common/Card";

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
        description: `Execution ${newExecutionId} is now running`,
        variant: "success"
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
      pushToast({ title: "Save failed", description: String(saveFetcher.data.error), variant: "error" });
    } else if (saveFetcher.data && "saved" in saveFetcher.data) {
      pushToast({
        title: saveFetcher.data.published ? "Workflow published" : "Workflow saved",
        description: saveFetcher.data.published
          ? "Workflow published successfully."
          : "Draft updated successfully.",
        variant: "success"
      });
      setIsEditing(false);
    }
  }, [pushToast, saveFetcher.data]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-400 font-medium mb-2">Workflow</p>
          {isEditing ? (
            <div className="flex flex-col gap-3 max-w-xl">
              <input
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={description ?? ""}
                placeholder="Describe the automation"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white tracking-tight">{workflow.name}</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">{workflow.description}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel Edit" : "Edit Workflow"}
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="secondary"
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
              </Button>
              <Button
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
              </Button>
            </>
          ) : (
            <Button
              disabled={fetcher.state !== "idle"}
              isLoading={fetcher.state !== "idle"}
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
              rightIcon={<span>▶</span>}
            >
              Run Workflow
            </Button>
          )}
        </div>
      </header>

      {showPublishedBanner ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between gap-3">
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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">{errorMessage}</div>
      ) : null}
      {statusMessage ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">{statusMessage}</div>
      ) : null}

      <div className="h-[640px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
        <ClientOnly fallback={<div className="h-full w-full bg-white/5 animate-pulse" />}>
          {() => (
            <FlowBuilder
              key={workflow.id}
              initialNodes={definition.nodes}
              initialEdges={definition.edges}
              onChange={(payload) => setDefinition(payload)}
              showPalette={isEditing}
              interactive={isEditing}
              showConfigOnHover={!isEditing}
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
      </div>

      <section ref={executionDetailRef} className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400 font-medium">Recent Executions</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {executionList.map((execution) => {
              const active = execution.id === selectedExecutionId;
              return (
                <Card
                  key={execution.id}
                  hover
                  onClick={() => setSelectedExecutionId(execution.id)}
                  className={`cursor-pointer border-2 ${active ? "border-blue-500/50 bg-blue-500/5 shadow-glow-sm" : "border-transparent"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={execution.status} />
                    <span className="text-[10px] text-slate-500 font-mono">{execution.duration ?? "--"} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{execution.id.slice(0, 8)}</span>
                    <span className="text-xs text-slate-500">
                      <ClientOnly fallback="--">
                        {() => new Date(execution.startedAt).toLocaleTimeString()}
                      </ClientOnly>
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="lg:col-span-2 flex flex-col h-[600px]">
            {executionDetail ? (
              <>
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-medium mb-1">Execution Detail</p>
                    <p className="text-lg text-white font-semibold font-mono">{executionDetail.id}</p>
                  </div>
                  <StatusBadge status={executionDetail.status} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Started</p>
                    <p className="text-sm text-white font-mono">
                      <ClientOnly fallback="--">
                        {() => executionDetail.startedAt ? new Date(executionDetail.startedAt).toLocaleTimeString() : "--"}
                      </ClientOnly>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Completed</p>
                    <p className="text-sm text-white font-mono">
                      <ClientOnly fallback="--">
                        {() => executionDetail.completedAt ? new Date(executionDetail.completedAt).toLocaleTimeString() : "--"}
                      </ClientOnly>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm text-white font-mono">
                      {executionDetail.duration ? `${executionDetail.duration} ms` : "--"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                  <div className="flex flex-col min-h-0">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-medium mb-3">Tasks</p>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {(executionDetail.tasks ?? []).map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <p className="text-sm text-white font-medium">{task.label ?? task.nodeId}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusDot status={task.status} />
                              <span className="text-xs text-slate-400">{task.status}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-mono">{task.duration ? `${task.duration}ms` : "--"}</p>
                          </div>
                        </div>
                      ))}
                      {(executionDetail.tasks ?? []).length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-4">No tasks recorded.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-h-0">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-medium mb-3">Logs</p>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {(executionDetail.logs ?? []).map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs font-mono relative group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <LogLevel level={log.level} />
                            <span className="text-slate-600">
                              <ClientOnly fallback="--">
                                {() => new Date(log.timestamp).toLocaleTimeString()}
                              </ClientOnly>
                            </span>
                          </div>
                          <p className="text-slate-300 break-words">{log.message}</p>
                        </div>
                      ))}
                      {(executionDetail.logs ?? []).length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-4">No logs recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select an execution to view details
              </div>
            )}
          </Card>
        </div>
      </section>
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

function StatusDot({ status }: { status: string }) {
  const colors = {
    RUNNING: "bg-blue-400 animate-pulse",
    COMPLETED: "bg-green-400",
    FAILED: "bg-red-400",
    PENDING: "bg-slate-600"
  };
  return (
    <div className={`w-1.5 h-1.5 rounded-full ${colors[status as keyof typeof colors] || colors.PENDING}`} />
  );
}

function LogLevel({ level }: { level: string }) {
  const colors = {
    INFO: "text-blue-400",
    WARN: "text-amber-400",
    ERROR: "text-red-400",
    FATAL: "text-red-500 font-bold",
    DEBUG: "text-slate-500"
  };

  return (
    <span className={`font-bold ${colors[level as keyof typeof colors] || "text-slate-500"}`}>
      {level}
    </span>
  );
}
