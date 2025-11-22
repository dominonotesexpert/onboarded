import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { listWorkflows, deleteWorkflow } from "~/services/workflows/workflow.server";
import { listExecutions } from "~/services/execution/execution-service.server";
import type { WorkflowWithRelations } from "~/types/workflow";

export async function loader() {
  const workflows = await listWorkflows();
  const executions = await listExecutions();
  return json({ workflows, executions });
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  if (!id) return json({ error: "Missing workflow id" }, { status: 400 });
  await deleteWorkflow(id);
  return json({ ok: true });
}

export default function WorkflowsRoute() {
  const { workflows, executions } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Workflows</p>
          <h2 className="text-3xl font-semibold text-white mt-2">Automation Library</h2>
        </div>
        <Link
          to="/workflows/new"
          className="btn-neon px-6 py-3 text-base flex items-center gap-3 group"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">New Workflow</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workflows.map((workflow) => {
          const typedWorkflow = workflow as unknown as WorkflowWithRelations;
          const workflowExecutions = executions.filter((execution) => execution.workflowId === workflow.id);

          return (
            <WorkflowCard
              key={workflow.id}
              workflow={typedWorkflow}
              workflowExecutions={workflowExecutions}
              fetcher={fetcher}
            />
          );
        })}
      </div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  workflowExecutions,
  fetcher,
}: {
  workflow: Pick<WorkflowWithRelations, "id" | "name" | "description" | "version">;
  workflowExecutions: { workflowId: string }[];
  fetcher: ReturnType<typeof useFetcher>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="card hover:shadow-glow transition-shadow relative overflow-hidden">
      <Link to={`/workflows/${workflow.id}`} className="block relative z-0">
        <p className="text-sm text-white/70">{workflow.name}</p>
        <p className="text-xs text-white/50 mt-1">{workflow.description}</p>
        <div className="flex items-center justify-between mt-6 text-xs text-white/60">
          <span>{workflowExecutions.length} runs</span>
          <span>v{workflow.version}</span>
        </div>
      </Link>

      <button
        type="button"
        className="absolute top-3 right-3 text-xs text-white/60 hover:text-rose-200 rounded-full px-2 py-1 border border-white/10 bg-white/5 z-10"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setConfirmOpen(true);
        }}
      >
        Remove
      </button>

      {confirmOpen ? (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur rounded-2xl flex flex-col items-center justify-center space-y-3 text-center p-4 z-20">
          <p className="text-sm text-white font-semibold">Remove this workflow?</p>
          <p className="text-xs text-white/70">
            This will also delete any runs and tasks attached to it.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/80 bg-white/10 border border-white/20"
              onClick={(event) => {
                event.stopPropagation();
                setConfirmOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-glow"
              onClick={(event) => {
                event.stopPropagation();
                fetcher.submit({ id: workflow.id }, { method: "post" });
                setConfirmOpen(false);
              }}
            >
              Yes, remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
