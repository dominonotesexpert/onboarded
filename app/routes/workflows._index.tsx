import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { listWorkflows } from "~/services/workflows/workflow.server";
import { listExecutions } from "~/services/execution/execution-service.server";

export async function loader() {
  const workflows = await listWorkflows();
  const executions = await listExecutions();
  return json({ workflows, executions });
}

export default function WorkflowsRoute() {
  const { workflows, executions } = useLoaderData<typeof loader>();

  return (
    <div className="px-8 py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Workflows</p>
          <h2 className="text-3xl font-semibold text-white mt-2">Automation Library</h2>
        </div>
        <Link to="/workflows/new" className="btn-primary">
          New Workflow
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workflows.map((workflow) => {
          const workflowExecutions = executions.filter((execution) => execution.workflowId === workflow.id);

          return (
            <Link
              key={workflow.id}
              to={`/workflows/${workflow.id}`}
              className="card hover:shadow-glow transition-shadow"
            >
              <p className="text-sm text-white/70">{workflow.name}</p>
              <p className="text-xs text-white/50 mt-1">{workflow.description}</p>
              <div className="flex items-center justify-between mt-6 text-xs text-white/60">
                <span>{workflowExecutions.length} runs</span>
                <span>v{workflow.version}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
