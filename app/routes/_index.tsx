import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { demoExecutions, demoWorkflows } from "~/data/demo-workflows";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { definitionToReactFlow } from "~/utils/workflow-transform";
import { ClientOnly } from "~/components/common/ClientOnly";
import { Button } from "~/components/common/Button";
import { Card } from "~/components/common/Card";

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
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20 space-y-20">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-4 relative">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-wider uppercase">
              {t("app.tagline")}
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Build workflows <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient">
                visually.
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              FlowForge pairs a delightful drag-and-drop builder with a production-grade execution
              engine powered by Effect, Prisma, and Remix. Automate onboarding, revenue ops, or
              anything in between.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button href="/workflows/new" size="lg" rightIcon={<span>→</span>}>
              {t("app.cta")}
            </Button>
            <Button href="/dashboard" variant="secondary" size="lg">
              {t("app.dashboard")}
            </Button>
          </div>

          <dl className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
            <Metric value={data.metrics.automations} label="Automations" />
            <Metric value={`${data.metrics.successRate * 100}%`} label="Success rate" />
            <Metric value={data.metrics.avgDuration} label="Avg duration" />
          </dl>
        </div>

        <div className="relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative glass rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.01] group-hover:rotate-1">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <p className="text-sm font-medium text-slate-300">{data.heroWorkflow.name}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                Live Builder
              </div>
            </div>
            <div className="h-[500px] relative bg-midnight/50">
              <ClientOnly fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Loading builder...</div>}>
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
        </div>
      </section>

      {/* Recent Executions */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Recent Executions</h2>
          <Button href="/dashboard" variant="ghost" size="sm" rightIcon={<span>→</span>}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.executions.map((execution) => (
            <Card key={execution.id} hover className="group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <StatusBadge status={execution.status} />
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/5 shadow-inner">
                  <span className="text-lg">⚡️</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {execution.workflowId}
                  </p>
                  <p className="text-sm text-slate-400">
                    Started{" "}
                    <ClientOnly fallback="--">
                      {() => new Date(execution.startedAt).toLocaleTimeString()}
                    </ClientOnly>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const style = colors[status as keyof typeof colors] || colors.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
}
