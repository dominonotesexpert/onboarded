/**
 * NodeConfigPanel Component
 *
 * Side panel for configuring workflow node settings.
 * Slides in from the right with smooth animations.
 *
 * Configuration:
 * - Label: Display name for the node
 * - Config (JSON): Node-specific settings (e.g., email address, HTTP URL)
 * - Execution Mode: Sequential or parallel execution
 * - Retries: Number of retry attempts on failure
 * - Timeout: Max execution time in milliseconds
 * - Priority: Execution priority (higher = earlier)
 *
 * Validation:
 * - JSON syntax validation with error display
 * - Returns validation result to parent via onSave callback
 *
 * @component
 * @module NodeConfigPanel
 */

import { motion } from "framer-motion";
import type { Node } from "reactflow";
import { useEffect, useState } from "react";

interface NodeConfigPanelProps {
  /** The React Flow node being configured */
  node: Node;
  /** Callback to close the panel */
  onClose: () => void;
  /** Callback when user saves - returns false if validation fails */
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
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="w-96 border-l border-white/10 bg-midnight/80 backdrop-blur-xl p-6 space-y-4 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">Node Config</p>
          <h3 className="text-xl font-semibold text-white mt-1">{(node.data as { type?: string })?.type ?? node.type}</h3>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
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
          className="w-full h-64 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white/80"
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
        className="btn-primary w-full justify-center"
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
  );
}
