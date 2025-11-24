import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { demoExecutions, demoWorkflows } from "~/data/demo-workflows";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { definitionToReactFlow } from "~/utils/workflow-transform";
import { ClientOnly } from "~/components/common/ClientOnly";

export async function loader() {
  const heroWorkflow = demoWorkflows[0];
  const executions = demoExecutions.slice(0, 3);

  return json({
    heroWorkflow,
    executions,
    metrics: {
      automations: 28,
      successRate: 0.98,
      avgDuration: "3.4s"
    }
  });
}

export default function IndexRoute() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const builderData = useMemo(
    () => definitionToReactFlow(data.heroWorkflow.definition as unknown as import("~/types/workflow").WorkflowDefinition),
    [data.heroWorkflow.definition]
  );

  return (
    <div className="px-8 py-12 space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">
            {t("app.tagline")}
          </p>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Build workflows visually.
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              {" "}
              Observe them in real-time.
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl">
            FlowForge pairs a delightful drag-and-drop builder with a production-grade execution
            engine powered by Effect, Prisma, and Remix. Automate onboarding, revenue ops, or
            anything in between.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/workflows/new" className="btn-primary">
              {t("app.cta")}
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              {t("app.dashboard")}
            </Link>
          </div>

          <dl className="grid grid-cols-3 gap-6 text-center">
            <Metric value={data.metrics.automations} label="Automations" />
            <Metric value={`${data.metrics.successRate * 100}%`} label="Success rate" />
            <Metric value={data.metrics.avgDuration} label="Avg duration" />
          </dl>
        </div>

        <div className="relative glass p-4 border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 relative z-10">
            <div>
              <p className="text-xs uppercase text-white/50 tracking-[0.3em]">
                Demo workflow
              </p>
              <p className="text-lg text-white font-semibold">{data.heroWorkflow.name}</p>
            </div>
            <span className="pill">Live Builder</span>
          </div>
          <div className="h-[460px] relative z-10">
            <ClientOnly fallback={<div className="h-full w-full bg-black/20 rounded-3xl animate-pulse" />}>
              {() => (
                <FlowBuilder
                  key="hero-preview"
                  initialNodes={builderData.nodes}
                  initialEdges={builderData.edges}
                  onChange={() => undefined}
                  showPalette={false}
                  showConfig={false}
                  interactive={false}
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.executions.map((execution) => (
          <div key={execution.id} className="card space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {execution.status}
            </p>
            <p className="text-xl font-semibold text-white">{execution.workflowId}</p>
            <p className="text-sm text-white/70">
              Started{" "}
              <ClientOnly fallback="--">
                {() => new Date(execution.startedAt).toLocaleTimeString()}
              </ClientOnly>
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.4em] text-white/60 mt-2">{label}</p>
    </div>
  );
}
