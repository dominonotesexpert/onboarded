import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { listWorkflows, deleteWorkflow } from "~/services/workflows/workflow.server";
import { listExecutions } from "~/services/execution/execution-service.server";
import type { WorkflowWithRelations } from "~/types/workflow";
import { Button } from "~/components/common/Button";
import { Card } from "~/components/common/Card";

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
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-400 font-medium mb-2">Workflows</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Automation Library</h2>
        </div>
        <Button href="/workflows/new" leftIcon={<span>+</span>}>
          New Workflow
        </Button>
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
    <Card hover className="group relative overflow-hidden flex flex-col h-full border border-white/5">
      <Link to={`/workflows/${workflow.id}`} className="flex-1 relative z-0 block">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors">
            <span className="text-lg">⚡️</span>
          </div>
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            v{workflow.version}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
          {workflow.name}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-6">
          {workflow.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-white/5 pt-4 mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{workflowExecutions.length} runs</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setConfirmOpen(true);
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {confirmOpen ? (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20 animate-in fade-in duration-200">
          <p className="text-sm text-white font-semibold mb-2">Delete Workflow?</p>
          <p className="text-xs text-slate-400 text-center mb-4">
            This action cannot be undone. All runs will be lost.
          </p>
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={(event) => {
                event.stopPropagation();
                setConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="flex-1"
              onClick={(event) => {
                event.stopPropagation();
                fetcher.submit({ id: workflow.id }, { method: "post" });
                setConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
