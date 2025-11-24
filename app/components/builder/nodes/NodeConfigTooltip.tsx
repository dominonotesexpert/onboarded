/**
 * NodeConfigTooltip Component
 *
 * Beautiful tooltip overlay that displays node configuration on hover.
 * Shows read-only view of all node settings in a glassmorphic panel.
 *
 * Features:
 * - Glassmorphic design with backdrop blur
 * - Syntax-highlighted JSON for complex values
 * - Color-coded property keys
 * - Smooth fade-in animation
 * - Auto-positioning to avoid viewport edges
 *
 * @component
 * @module NodeConfigTooltip
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface NodeConfigTooltipProps {
  /** Whether to show the tooltip */
  show: boolean;
  /** Node configuration object */
  config: Record<string, unknown>;
  /** Node type for header display */
  nodeType: string;
  /** Node label */
  label: string;
  /** Timeout config if present */
  timeout?: number;
  /** Retries config if present */
  retries?: number;
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

  // Track mounted state for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
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
      const tooltipHeight = 400; // Approximate max height
      const offset = 16;

      // Get node's center position on screen
      const nodeCenterX = anchorRect.left + anchorRect.width / 2;
      const nodeCenterY = anchorRect.top + anchorRect.height / 2;

      // Determine if tooltip should be on left or right
      const wouldOverflowRight = anchorRect.right + tooltipWidth + offset > viewportWidth - 20;
      const newPosition = wouldOverflowRight ? "left" : "right";
      setPosition(newPosition);

      // Calculate position relative to node (not mouse)
      let top = nodeCenterY - tooltipHeight / 2; // Center vertically with node
      const left = newPosition === "right"
        ? anchorRect.right + offset
        : anchorRect.left - tooltipWidth - offset;

      // Ensure tooltip doesn't go off top or bottom of viewport
      if (top < 20) top = 20;
      if (top + tooltipHeight > viewportHeight - 20) {
        top = viewportHeight - tooltipHeight - 20;
      }

      setTooltipPosition({ top, left });
    };

    // Initial position
    updateTooltipPosition();

    // Update on scroll, resize, or zoom
    const handleUpdate = () => {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(updateTooltipPosition);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    // Update frequently to handle React Flow pan/zoom
    const intervalId = setInterval(handleUpdate, 100);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      clearInterval(intervalId);
    };
  }, [show]);

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return JSON.stringify(value, null, 2);
  };

  const configEntries = Object.entries(config || {});
  const hasConfig = configEntries.length > 0;

  const tooltipContent = (
    <AnimatePresence>
      {show && isMounted && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[99999]"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            pointerEvents: "auto"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-[340px] rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 font-semibold">
                    {nodeType}
                  </p>
                  <p className="text-lg font-bold text-white mt-0.5">{label}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                  <span className="text-xl">⚙️</span>
                </div>
              </div>
            </div>

            {/* Configuration Section */}
            <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* Execution Settings */}
              {(timeout || retries) && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80 font-semibold flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    Execution Settings
                  </p>
                  <div className="space-y-2 pl-3 border-l-2 border-white/10">
                    {timeout && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Timeout</span>
                        <span className="text-sm font-mono text-amber-300">{timeout}ms</span>
                      </div>
                    )}
                    {retries !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Retries</span>
                        <span className="text-sm font-mono text-sky-300">{retries}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Node Configuration */}
              {hasConfig && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80 font-semibold flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                    Configuration
                  </p>
                  <div className="space-y-3 pl-3 border-l-2 border-white/10">
                    {configEntries.map(([key, value]) => {
                      const isComplex = typeof value === "object" && value !== null;
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-xs font-semibold text-sky-300 font-mono">
                            {key}
                          </p>
                          {isComplex ? (
                            <pre className="text-xs text-white/80 font-mono bg-black/30 rounded-lg px-3 py-2 overflow-x-auto border border-white/10">
                              {renderValue(value)}
                            </pre>
                          ) : (
                            <p className="text-sm text-white/90 break-words">
                              {renderValue(value)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!hasConfig && !timeout && !retries && (
                <div className="text-center py-6">
                  <p className="text-sm text-white/50">No configuration</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 border-t border-white/10 px-5 py-3">
              <p className="text-[10px] text-white/40 text-center uppercase tracking-[0.3em]">
                Read-Only View
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Anchor element to track node position */}
      <div ref={anchorRef} className="absolute inset-0 pointer-events-none" />

      {/* Portal tooltip to document body */}
      {isMounted && typeof document !== "undefined" && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
}
