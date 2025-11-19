import type { NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";
import { useState, MouseEvent } from "react";

interface GlassNodeProps extends NodeProps {
  data: NodeProps["data"] & { onDelete?: (id: string) => void };
}

export function GlassNode({ data, selected, id }: GlassNodeProps) {
  const mode = (data.executionMode as string) ?? "sequential";
  const badge = mode === "parallel" ? "Parallel Branch" : "Sequential Step";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canDelete = typeof data.onDelete === "function";
  const [hoverHandle, setHoverHandle] = useState<"source" | "target" | null>(null);

  const handlePointer = (event: MouseEvent, type: "source" | "target") => {
    event.stopPropagation();
    setHoverHandle(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0.9, scale: 0.95 }}
      animate={{ opacity: 1, scale: selected ? 1.02 : 1 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 min-w-[190px] shadow-card relative group"
    >
      <div
        className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseEnter={(event) => handlePointer(event, "target")}
        onMouseLeave={() => setHoverHandle(null)}
      />
      <div
        className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseEnter={(event) => handlePointer(event, "source")}
        onMouseLeave={() => setHoverHandle(null)}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={`w-4 h-4 bg-sky-400 border-2 border-slate-900 rounded-full shadow-glow cursor-crosshair ${hoverHandle === "target" ? "scale-125" : ""}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-4 h-4 bg-indigo-400 border-2 border-slate-900 rounded-full shadow-glow cursor-crosshair ${hoverHandle === "source" ? "scale-125" : ""}`}
      />

      {canDelete ? (
        <button
          type="button"
          aria-label="Remove node"
          className="absolute -top-2 -right-2 rounded-full bg-white/15 border border-white/30 text-white text-[10px] w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur"
          onClick={(event) => {
            event.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          ×
        </button>
      ) : null}

      <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{data.type}</p>
      <p className="text-lg font-semibold text-white mt-1 leading-tight">{data.label}</p>
      <p className="text-xs text-white/70 leading-relaxed mt-1">{data.description}</p>
      <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white/85 bg-white/10 border border-white/20 rounded-full px-3 py-1">
        <span
          className={`w-2 h-2 rounded-full ${mode === "parallel" ? "bg-emerald-400" : "bg-sky-400"}`}
        />
        {badge}
      </span>

      {confirmOpen ? (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur rounded-2xl flex flex-col items-center justify-center space-y-3 text-center p-4 z-10">
          <p className="text-sm text-white font-semibold">Remove this node?</p>
          <p className="text-xs text-white/70">
            This will also delete any connections attached to it.
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
                data.onDelete?.(id);
                setConfirmOpen(false);
              }}
            >
              Yes, remove
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
