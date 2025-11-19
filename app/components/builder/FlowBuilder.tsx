import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type XYPosition
} from "reactflow";
import { AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { NodePalette } from "./NodePalette";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { GlassNode } from "./nodes/GlassNode";
import { nodeCatalog } from "~/constants/node-catalog";
import { useToast } from "~/components/common/Toaster";

const nodeTypes = { glass: GlassNode };

export interface FlowBuilderProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onChange?: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  showPalette?: boolean;
  showConfig?: boolean;
  interactive?: boolean;
}

export function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderCanvas {...props} />
    </ReactFlowProvider>
  );
}

function FlowBuilderCanvas({
  initialNodes,
  initialEdges,
  onChange,
  showPalette = true,
  showConfig = true,
  interactive = true
}: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { pushToast } = useToast();
  const reactFlow = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.({ nodes, edges });
  }, [nodes, edges, onChange]);

  const spawnNode = useCallback(
    (type: string, position?: XYPosition) => {
      if (!interactive) return;
      const catalog = nodeCatalog.find((node) => node.type === type);
      const basePosition =
        position ??
        {
          x: 200 + Math.random() * 200,
          y: 120 + nodes.length * 60
        };

      const newNode: Node = {
        id: nanoid(),
        type: "glass",
        position: basePosition,
        data: {
          ...catalog,
          label: catalog?.label ?? "Node",
          type,
          executionMode: catalog?.executionMode ?? "sequential"
        }
      };

      setNodes((current) => [...current, newNode]);

      pushToast({
        title: `${catalog?.label ?? type} node added`,
        description: "Drag to position, then connect it to define execution order."
      });
    },
    [interactive, nodes.length, pushToast, setNodes]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      if (!interactive) return;
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      spawnNode(type, position);
    },
    [interactive, reactFlow, spawnNode]
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      if (!interactive) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [interactive]
  );

  const handleConnect = useCallback(
    (connection: Parameters<typeof addEdge>[0]) => {
      if (!interactive) return;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#38bdf8", strokeWidth: 2 }
          },
          eds
        )
      );
    },
    [interactive, setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: unknown, node: Node) => {
      if (!interactive) return;
      setSelectedNode(node);
    },
    [interactive]
  );

  const handleUpdateNode = useCallback(
    (payload: Record<string, unknown>) => {
      if (!selectedNode) return;
      setNodes((current) => {
        const next = current.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...payload
                }
              }
            : node
        );
        const refreshed = next.find((node) => node.id === selectedNode.id) ?? null;
        setSelectedNode(refreshed);
        return next;
      });
    },
    [selectedNode, setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      pushToast({
        title: "Node removed",
        description: "Any edges connected to this node were also deleted."
      });
    },
    [pushToast, selectedNode, setEdges, setNodes]
  );

  const reactFlowNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        type: "glass",
        data: {
          ...node.data,
          onDelete: interactive ? deleteNode : undefined
        }
      })),
    [deleteNode, interactive, nodes]
  );

  const edgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: "#38bdf8"
      },
      style: { stroke: "#38bdf8", strokeWidth: 2 }
    }),
    []
  );

  const minHeightClass =
    showPalette || showConfig ? "min-h-[640px]" : "min-h-[420px]";

  return (
    <div className={`flex h-full ${minHeightClass} bg-midnight/70 rounded-3xl border border-white/10 overflow-hidden shadow-card`}>
      {showPalette ? <NodePalette onAdd={(type) => spawnNode(type)} /> : null}
      <main className="flex-1 relative" ref={wrapperRef}>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={edgeOptions}
          connectionRadius={40}
          fitView
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          snapToGrid
          snapGrid={[16, 16]}
          nodesDraggable={interactive}
          nodesConnectable={interactive}
          elementsSelectable={interactive}
          panOnDrag={interactive}
          zoomOnScroll={interactive}
          zoomOnDoubleClick={interactive}
          zoomOnPinch={interactive}
          connectionLineStyle={{ stroke: "#38bdf8", strokeWidth: 2 }}
          connectionLineType="smoothstep"
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        >
          <Background gap={24} size={1.5} color="#ffffff12" />
          <Controls className="bg-white/10 backdrop-blur rounded-xl border border-white/20" />
          <MiniMap
            className="bg-white/10 backdrop-blur rounded-xl border border-white/10"
            nodeColor={() => "#3b82f6"}
          />
        </ReactFlow>
        {interactive ? (
          <div className="pointer-events-none absolute top-4 right-4 text-xs text-white/70 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 shadow-card">
            Drag blocks into the canvas, then pull from a glowing handle to connect steps.
          </div>
        ) : null}
      </main>

      <AnimatePresence>
        {selectedNode && showConfig ? (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onSave={handleUpdateNode}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
