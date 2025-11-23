/**
 * NodePalette Component
 *
 * Displays a draggable palette of available workflow node types.
 * Users can either drag nodes onto the canvas or click to add them.
 *
 * Features:
 * - Drag-and-drop support with React Flow
 * - Click-to-add fallback for accessibility
 * - Categorized node types from node catalog
 * - Smooth animations via Framer Motion
 * - Visual preview with icons and descriptions
 *
 * @component
 * @module NodePalette
 */

import { motion } from "framer-motion";
import type { DragEvent } from "react";
import { nodeCatalog } from "~/constants/node-catalog";

interface NodePaletteProps {
  /** Callback when user adds a node (via drag or click) */
  onAdd: (type: string) => void;
}

export function NodePalette({ onAdd }: NodePaletteProps) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>, type: string) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-72 border-r border-white/5 bg-white/5 backdrop-blur p-4 space-y-4 overflow-y-auto">
      <div>
        <p className="text-xs uppercase text-white/60 tracking-[0.2em]">Node Library</p>
        <p className="text-sm text-white/70 mt-1">
          Drag or click to add production-ready automation blocks.
        </p>
      </div>

      <div className="space-y-3">
        {nodeCatalog.map((item) => (
          <motion.button
            key={item.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAdd(item.type)}
            draggable
            onDragStartCapture={(event: DragEvent<HTMLButtonElement>) => handleDragStart(event, item.type)}
            className="w-full text-left rounded-2xl border border-white/10 p-4 bg-white/5 backdrop-blur flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 uppercase tracking-wide text-white/70">
                {item.type}
              </span>
            </div>
            <p className="text-white font-semibold">{item.label}</p>
            <p className="text-sm text-white/70">{item.description}</p>
            <div className={`h-1 rounded-full bg-gradient-to-r ${item.accent}`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
