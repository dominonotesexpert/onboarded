import type { NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";
import { useState, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { NodeConfigTooltip } from "./NodeConfigTooltip";

interface GlassNodeProps extends NodeProps {
  data: NodeProps["data"] & {
    onDelete?: (id: string) => void;
    status?: string;
    invalid?: boolean;
    showConfigOnHover?: boolean;
    config?: Record<string, unknown>;
    timeout?: number | null;
    retries?: number | null;
  };
}

export function GlassNode({ data, selected, id }: GlassNodeProps) {
  const mode = (data.executionMode as string) ?? "sequential";
  const badge = mode === "parallel" ? "Parallel Branch" : "Sequential Step";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canDelete = typeof data.onDelete === "function";
  const [hoverHandle, setHoverHandle] = useState<"source" | "target" | null>(null);
  const sourceHandleRef = useRef<HTMLDivElement>(null);
  const targetHandleRef = useRef<HTMLDivElement>(null);
  const status = data.status as string | undefined;
  const hasStatus = Boolean(status);
  const invalid = Boolean(data.invalid);
  const [showTooltip, setShowTooltip] = useState(false);
  const showConfigOnHover = data.showConfigOnHover ?? false;

  const statusStyles =
    invalid
      ? "border-rose-400/70 shadow-[0_0_0_3px_rgba(244,63,94,0.25)]"
      : status === "RUNNING"
        ? "border-amber-300/70 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
        : status === "SUCCESS"
          ? "border-emerald-300/60 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
          : status === "FAILED"
            ? "border-rose-300/70 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]"
            : "border-white/10";

  const statusDot =
    status === "RUNNING"
      ? "bg-amber-300"
      : status === "SUCCESS"
        ? "bg-emerald-400"
        : status === "FAILED"
          ? "bg-rose-400"
          : invalid
            ? "bg-rose-400"
            : "";

  const handlePointer = (event: ReactMouseEvent, type: "source" | "target") => {
    event.stopPropagation();
    setHoverHandle(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0.9, scale: 0.95 }}
      animate={{ opacity: 1, scale: selected ? 1.02 : 1 }}
      className={`rounded-2xl bg-white/5 backdrop-blur-xl px-4 py-3 min-w-[190px] shadow-card relative group transition border ${statusStyles}`}
      onMouseEnter={() => showConfigOnHover && setShowTooltip(true)}
      onMouseLeave={() => showConfigOnHover && setShowTooltip(false)}
    >
      {hasStatus ? (
        <span
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-900 ${statusDot} shadow-[0_0_0_6px_rgba(15,23,42,0.45)]`}
        />
      ) : null}
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full opacity-0 group-hover:opacity-40 transition-all cursor-crosshair"
        onMouseEnter={(event) => handlePointer(event, "target")}
        onMouseLeave={() => setHoverHandle(null)}
        onMouseDown={(event) => {
          event.stopPropagation();
          targetHandleRef.current?.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              clientX: event.clientX,
              clientY: event.clientY
            })
          );
        }}
        onMouseMove={(event) => {
          if (!targetHandleRef.current) return;
          targetHandleRef.current.dispatchEvent(
            new MouseEvent("mousemove", {
              bubbles: true,
              clientX: event.clientX,
              clientY: event.clientY
            })
          );
        }}
      />
      <div
        className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full opacity-0 group-hover:opacity-40 transition-all cursor-crosshair"
        onMouseEnter={(event) => handlePointer(event, "source")}
        onMouseLeave={() => setHoverHandle(null)}
        onMouseDown={(event) => {
          event.stopPropagation();
          sourceHandleRef.current?.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              clientX: event.clientX,
              clientY: event.clientY
            })
          );
        }}
        onMouseMove={(event) => {
          if (!sourceHandleRef.current) return;
          sourceHandleRef.current.dispatchEvent(
            new MouseEvent("mousemove", {
              bubbles: true,
              clientX: event.clientX,
              clientY: event.clientY
            })
          );
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        ref={targetHandleRef}
        className={`w-8 h-8 bg-sky-400 border-2 border-slate-900 rounded-full shadow-glow cursor-crosshair transition-transform ${
          hoverHandle === "target" ? "scale-150" : ""
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        ref={sourceHandleRef}
        className={`w-8 h-8 bg-indigo-400 border-2 border-slate-900 rounded-full shadow-glow cursor-crosshair transition-transform ${
          hoverHandle === "source" ? "scale-150" : ""
        }`}
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
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white/85 bg-white/10 border border-white/20 rounded-full px-3 py-1">
          <span
            className={`w-2 h-2 rounded-full ${mode === "parallel" ? "bg-emerald-400" : "bg-sky-400"}`}
          />
          {badge}
        </span>
      </div>

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

      {showConfigOnHover && (
        <NodeConfigTooltip
          show={showTooltip}
          config={data.config || {}}
          nodeType={data.type as string}
          label={data.label as string}
          timeout={data.timeout}
          retries={data.retries}
        />
      )}
    </motion.div>
  );
}
