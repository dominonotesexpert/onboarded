import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { listExecutions, triggerExecution } from "~/services/execution/execution-service.server";
import { getWorkflow } from "~/services/workflows/workflow.server";
import { definitionToReactFlow } from "~/utils/workflow-transform";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { ClientOnly } from "~/components/common/ClientOnly";
import type { ExecutionDetail, WorkflowDefinition } from "~/types/workflow";

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
  const execution = await triggerExecution(params.workflowId, payload ?? {});
  return json(execution, { status: 202 });
}

export default function WorkflowDetailRoute() {
  const { workflow, executions, published } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const workflowDefinition = useMemo<WorkflowDefinition>(
    () =>
      (workflow.definition ?? { nodes: [], edges: [] }) as unknown as WorkflowDefinition,
    [workflow.definition]
  );
  const [definition, setDefinition] = useState(() => definitionToReactFlow(workflowDefinition));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState(executions[0]?.id ?? null);
  const [executionDetail, setExecutionDetail] = useState<ExecutionDetail | null>(null);

  const detailFetcher = useFetcher<{ execution: ExecutionDetail }>();

  useEffect(() => {
    if (selectedExecutionId) {
      detailFetcher.load(`/api/executions/${selectedExecutionId}`);
    }
  }, [detailFetcher, selectedExecutionId]);

  useEffect(() => {
    if (detailFetcher.data?.execution) {
      setExecutionDetail(detailFetcher.data.execution);
    }
  }, [detailFetcher.data]);

  useEffect(() => {
    if (fetcher.data && "executionId" in fetcher.data) {
      setStatusMessage(`Triggered execution ${fetcher.data.executionId}`);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setDefinition(definitionToReactFlow(workflowDefinition));
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

      {published ? (
        <div className="card border border-emerald-400/40 text-emerald-200 text-sm">
          Workflow published successfully.
        </div>
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
          />
        )}
      </ClientOnly>

      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Recent Executions</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {executions.map((execution) => {
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
          </div>
        ) : null}
      </section>
    </div>
  );
}
