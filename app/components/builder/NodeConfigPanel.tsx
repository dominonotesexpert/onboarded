import { motion } from "framer-motion";
import type { Node } from "reactflow";
import { useEffect, useState } from "react";

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => boolean | void;
}

export function NodeConfigPanel({ node, onClose, onSave }: NodeConfigPanelProps) {
  const [label, setLabel] = useState(node.data?.label ?? node.data?.label ?? node.id);
  const [config, setConfig] = useState(
    JSON.stringify(node.data?.config ?? {}, null, 2)
  );
  const [executionMode, setExecutionMode] = useState(
    (node.data?.executionMode as string) ?? "sequential"
  );

  useEffect(() => {
    setLabel(node.data?.label ?? node.id);
    setConfig(JSON.stringify(node.data?.config ?? {}, null, 2));
    setExecutionMode((node.data?.executionMode as string) ?? "sequential");
  }, [node]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed lg:relative inset-x-0 bottom-0 lg:inset-auto w-full lg:w-96 max-h-[80vh] lg:max-h-none border-l-0 lg:border-l border-t lg:border-t-0 border-white/10 bg-midnight/95 lg:bg-midnight/80 backdrop-blur-xl p-4 sm:p-6 space-y-4 overflow-y-auto z-50 rounded-t-3xl lg:rounded-none"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Node Config</p>
            <h3 className="text-lg sm:text-xl font-semibold text-white mt-1">{(node.data as { type?: string })?.type ?? node.type}</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm touch-manipulation">
            Close
          </button>
        </div>

      <label className="space-y-2 block">
        <span className="text-xs uppercase text-white/50 tracking-[0.3em]">Label</span>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
      </label>

      <label className="space-y-2 block">
        <span className="text-xs uppercase text-white/50 tracking-[0.3em]">Config JSON</span>
        <textarea
          className="w-full h-48 sm:h-64 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white/80"
          value={config}
          onChange={(event) => setConfig(event.target.value)}
        />
      </label>

      <label className="space-y-2 block">
        <span className="text-xs uppercase text-white/50 tracking-[0.3em]">Execution Mode</span>
        <select
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
          value={executionMode}
          onChange={(event) => setExecutionMode(event.target.value)}
        >
          <option value="sequential">Sequential (wait for completion)</option>
          <option value="parallel">Parallel (branch instantly)</option>
        </select>
      </label>

      <button
        className="btn-primary w-full justify-center touch-manipulation"
        onClick={() => {
          try {
            const parsed = JSON.parse(config);
            const success = onSave({ label, config: parsed, executionMode });
            if (success !== false) {
              onClose();
            }
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(`Invalid JSON: ${(error as Error).message}`);
            }
          }
        }}
      >
        Save
      </button>
      </motion.aside>
    </>
  );
}
