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
  ConnectionLineType,
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
import type { TaskStatus } from "~/types/workflow";

const nodeTypes = { glass: GlassNode };

export interface FlowBuilderProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onChange?: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  showPalette?: boolean;
  showConfig?: boolean;
  interactive?: boolean;
  nodeStatuses?: Record<string, TaskStatus>;
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
  interactive = true,
  nodeStatuses
}: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { pushToast } = useToast();
  const reactFlow = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const enforceSiblingExecutionModes = useCallback(
    (updatedEdges: Edge[]) => {
      const childMap = updatedEdges.reduce<Record<string, string[]>>((acc, edge) => {
        if (!acc[edge.source]) acc[edge.source] = [];
        acc[edge.source].push(edge.target);
        return acc;
      }, {});

      const parallelTargets = new Set<string>();
      const sequentialTargets = new Set<string>();

      Object.values(childMap).forEach((children) => {
        if (children.length > 1) {
          children.forEach((id) => parallelTargets.add(id));
        } else {
          children.forEach((id) => sequentialTargets.add(id));
        }
      });

      setNodes((prev) =>
        prev.map((node) => {
          if (parallelTargets.has(node.id)) {
            return { ...node, data: { ...node.data, executionMode: "parallel" } };
          }
          if (sequentialTargets.has(node.id)) {
            return { ...node, data: { ...node.data, executionMode: "sequential" } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  useEffect(() => {
    onChange?.({ nodes, edges });
  }, [nodes, edges, onChange]);

  useEffect(() => {
    if (!nodeStatuses) return;
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: nodeStatuses[node.id]
        }
      }))
    );
  }, [nodeStatuses, setNodes]);

  useEffect(() => {
    if (!selectedNode) return;
    const latest = nodes.find((n) => n.id === selectedNode.id);
    if (latest && latest !== selectedNode) {
      setSelectedNode(latest);
    }
  }, [nodes, selectedNode]);

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
      const sourceId = connection.source;
      const targetId = connection.target;

      if (sourceId && targetId) {
        const parentsOf = (nodeId: string) => edges.filter((e) => e.target === nodeId).map((e) => e.source);
        const sourceParents = new Set(parentsOf(sourceId));
        const targetParents = parentsOf(targetId);
        const sharedParent = targetParents.find((parent) => sourceParents.has(parent));

        if (sharedParent) {
          pushToast({
            title: "Invalid connection",
            description: "Siblings with the same parent cannot be chained together."
          });
          return;
        }

        const wouldCreateCycle = () => {
          const adjacency = new Map<string, string[]>();
          edges.forEach((e) => {
            if (!adjacency.has(e.source)) adjacency.set(e.source, []);
            adjacency.get(e.source)!.push(e.target);
          });
          if (!adjacency.has(sourceId)) adjacency.set(sourceId, []);
          adjacency.get(sourceId)!.push(targetId);

          const stack = [targetId];
          const seen = new Set<string>();
          while (stack.length) {
            const current = stack.pop()!;
            if (current === sourceId) return true;
            if (seen.has(current)) continue;
            seen.add(current);
            (adjacency.get(current) ?? []).forEach((next) => stack.push(next));
          }
          return false;
        };

        if (wouldCreateCycle()) {
          pushToast({
            title: "Cycle detected",
            description: "That connection would create a loop. Please choose a different target."
          });
          return;
        }
      }

      setEdges((eds) => {
        const nextEdges = addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#38bdf8", strokeWidth: 2 }
          },
          eds
        );
        enforceSiblingExecutionModes(nextEdges);
        return nextEdges;
      });
    },
    [edges, enforceSiblingExecutionModes, interactive, pushToast, setEdges]
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
          connectionLineType={ConnectionLineType.SmoothStep}
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
