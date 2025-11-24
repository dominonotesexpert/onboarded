import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface NodeConfigTooltipProps {
  show: boolean;
  config: Record<string, unknown>;
  nodeType: string;
  label: string;
  timeout?: number | null;
  retries?: number | null;
}

export function NodeConfigTooltip({
  show,
  config,
  nodeType,
  label,
  timeout,
  retries
}: NodeConfigTooltipProps) {
  const [position, setPosition] = useState<"right" | "left">("right");
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate position based on node's actual screen position
  useEffect(() => {
    if (!show || !anchorRef.current) return;

    const updateTooltipPosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 340;
      const tooltipHeight = 400;
      const offset = 16;

      const nodeCenterY = anchorRect.top + anchorRect.height / 2;
      const wouldOverflowRight = anchorRect.right + tooltipWidth + offset > viewportWidth - 20;
      const newPosition = wouldOverflowRight ? "left" : "right";
      setPosition(newPosition);

      let top = nodeCenterY - tooltipHeight / 2;
      const left = newPosition === "right"
        ? anchorRect.right + offset
        : anchorRect.left - tooltipWidth - offset;

      if (top < 20) top = 20;
      if (top + tooltipHeight > viewportHeight - 20) {
        top = viewportHeight - tooltipHeight - 20;
      }

      setTooltipPosition({ top, left });
    };

    updateTooltipPosition();
    const intervalId = setInterval(updateTooltipPosition, 100);

    return () => clearInterval(intervalId);
  }, [show]);

  if (!show) return null;

  const configEntries = Object.entries(config ?? {});

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-[340px] max-h-[400px] pointer-events-none"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        opacity: tooltipPosition.top === 0 ? 0 : 1,
        transition: "opacity 0.15s ease-out"
      }}
    >
      <div className="glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-medium">
                {nodeType}
              </p>
              <p className="text-base font-semibold text-white mt-0.5">{label}</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar space-y-3">
          {configEntries.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No configuration</p>
          ) : (
            configEntries.map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium">
                  {key}
                </label>
                <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono break-words">
                  {formatValue(value)}
                </div>
              </div>
            ))
          )}

          {(timeout !== null && timeout !== undefined) || (retries !== null && retries !== undefined) ? (
            <div className="pt-3 border-t border-white/5 space-y-3">
              {timeout !== null && timeout !== undefined && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium">
                    Timeout
                  </label>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono">
                    {timeout}ms
                  </div>
                </div>
              )}
              {retries !== null && retries !== undefined && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium">
                    Retries
                  </label>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono">
                    {retries}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div ref={anchorRef} className="absolute inset-0 pointer-events-none" />
      {isMounted && typeof document !== "undefined" && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
