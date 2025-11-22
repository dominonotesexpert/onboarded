import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { demoExecutions, demoWorkflows } from "~/data/demo-workflows";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { definitionToReactFlow } from "~/utils/workflow-transform";
import { ClientOnly } from "~/components/common/ClientOnly";
import { motion } from "framer-motion";

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
    <div className="min-h-screen pt-32 pb-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-neon-blue/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono tracking-widest uppercase mb-6">
              {t("app.tagline")}
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white leading-tight tracking-tight mb-6 text-glow">
              Build workflows <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-pulse-glow">
                visually.
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              FlowForge pairs a delightful drag-and-drop builder with a production-grade execution
              engine. Automate everything with style.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 relative z-10"
          >
            <Link to="/workflows/new" className="btn-neon px-8 py-4 text-lg font-semibold">
              {t("app.cta")}
            </Link>
            <Link to="/dashboard" className="btn-secondary px-8 py-4 text-lg">
              {t("app.dashboard")}
            </Link>
          </motion.div>
        </section>

        {/* Preview Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-[2rem] opacity-30 blur-lg" />
          <div className="relative bg-obsidian/80 backdrop-blur-xl rounded-[1.8rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="text-xs font-mono text-white/40 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
                LIVE PREVIEW
              </div>
            </div>
            <div className="h-[600px] relative">
              <ClientOnly fallback={<div className="h-full w-full bg-black/20 animate-pulse" />}>
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

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.section>

        {/* Bento Grid Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-white/50 text-sm font-mono uppercase tracking-wider mb-2">Total Automations</h3>
            <p className="text-5xl font-display font-bold text-white group-hover:text-neon-blue transition-colors">
              {data.metrics.automations}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-white/50 text-sm font-mono uppercase tracking-wider mb-2">Success Rate</h3>
            <p className="text-5xl font-display font-bold text-white group-hover:text-neon-emerald transition-colors">
              {data.metrics.successRate * 100}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-white/50 text-sm font-mono uppercase tracking-wider mb-2">Avg Duration</h3>
            <p className="text-5xl font-display font-bold text-white group-hover:text-neon-purple transition-colors">
              {data.metrics.avgDuration}
            </p>
          </motion.div>
        </section>

        {/* Recent Executions */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold text-white">Recent Activity</h2>
            <Link to="/dashboard" className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-medium">
              View Dashboard →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.executions.map((execution, i) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${execution.status === 'COMPLETED' ? 'bg-neon-emerald shadow-[0_0_10px_#10b981]' :
                      execution.status === 'FAILED' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                        'bg-neon-blue animate-pulse'
                    }`} />
                  <div>
                    <p className="text-white font-medium">{execution.workflowId}</p>
                    <p className="text-white/40 text-xs font-mono">{execution.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">{new Date(execution.startedAt).toLocaleTimeString()}</p>
                  <p className="text-white/40 text-xs font-mono uppercase">{execution.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
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
