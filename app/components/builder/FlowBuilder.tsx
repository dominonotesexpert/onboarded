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
import { useDebounce } from "use-debounce";
import { NodePalette } from "./NodePalette";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { GlassNode } from "./nodes/GlassNode";
import { nodeCatalog } from "~/constants/node-catalog";
import { useToast } from "~/components/common/Toaster";
import type { TaskStatus, WorkflowDefinition } from "~/types/workflow";
import { reactFlowToDefinition } from "~/utils/workflow-transform";
import { getValidationIssues } from "~/utils/workflow-validation";
import { validateNodeConfig } from "~/utils/node-validation";
import { buildWorkflowGraph, buildExecutionLayers } from "~/utils/workflow-graph";
import type { EdgeMouseHandler } from "reactflow";

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
  const [invalidNodeIds, setInvalidNodeIds] = useState<Set<string>>(new Set());
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showValidationMessage, setShowValidationMessage] = useState(true);
  const [hasEdited, setHasEdited] = useState(false);
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([
    { nodes: initialNodes, edges: initialEdges }
  ]);
  const historyIndexRef = useRef(0);
  const applyingHistoryRef = useRef(false);
  const { pushToast } = useToast();
  const lastToastAtRef = useRef<number>(0);
  const reactFlow = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce validation to improve performance during rapid changes
  const [debouncedNodes] = useDebounce(nodes, 500);
  const [debouncedEdges] = useDebounce(edges, 500);

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

  useEffect(() => {
    if (!interactive) return;
    if (applyingHistoryRef.current) return;
    const snapshot = { nodes: nodes.map((n) => ({ ...n })), edges: edges.map((e) => ({ ...e })) };
    const history = historyRef.current.slice(0, historyIndexRef.current + 1);
    history.push(snapshot);
    historyRef.current = history.slice(-30); // cap history
    historyIndexRef.current = historyRef.current.length - 1;
  }, [nodes, edges, interactive]);

  useEffect(() => {
    if (!interactive) return;
    if (!hasEdited) {
      setInvalidNodeIds(new Set());
      setValidationMessage(null);
      setShowValidationMessage(false);
      return;
    }
    try {
      const definition = reactFlowToDefinition(debouncedNodes, debouncedEdges);
      const issues = getValidationIssues(definition as WorkflowDefinition);
      setInvalidNodeIds(new Set(issues.map((issue: { nodeId?: string }) => issue.nodeId).filter(Boolean) as string[]));
      const newMessage = issues[0]?.message ?? null;
      setValidationMessage(newMessage);
      if (newMessage) {
        setShowValidationMessage(true);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setValidationMessage(errorMessage);
      if (errorMessage) {
        setShowValidationMessage(true);
      }
    }
  }, [debouncedEdges, debouncedNodes, hasEdited, interactive]);

  useEffect(() => {
    if (!validationMessage || !showValidationMessage) return;
    const timer = setTimeout(() => {
      setShowValidationMessage(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [validationMessage, showValidationMessage]);

  const spawnNode = useCallback(
    (type: string, position?: XYPosition) => {
      if (!interactive) return;
      setHasEdited(true);
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

      setHasEdited(true);
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

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      if (!interactive) return;
      const confirmed = window.confirm("Remove this connection?");
      if (!confirmed) return;
      setHasEdited(true);
      setEdges((current) => current.filter((e) => e.id !== edge.id));
      pushToast({ title: "Connection removed", description: "Edge deleted from the workflow." });
    },
    [interactive, pushToast, setEdges]
  );

  const undo = useCallback(() => {
    if (!interactive) return;
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      applyingHistoryRef.current = true;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      applyingHistoryRef.current = false;
    }
  }, [interactive, setEdges, setNodes]);

  const redo = useCallback(() => {
    if (!interactive) return;
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      applyingHistoryRef.current = true;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      applyingHistoryRef.current = false;
    }
  }, [interactive, setEdges, setNodes]);

  const autoLayout = useCallback(() => {
    const definition = reactFlowToDefinition(nodes, edges) as WorkflowDefinition;
    const graph = buildWorkflowGraph(definition);
    const layers = buildExecutionLayers(graph);
    const spacingX = 260;
    const spacingY = 200;
    const positioned = nodes.map((node) => {
      const layerIdx = layers.findIndex((layer) => layer.includes(node.id));
      const layer = layerIdx >= 0 ? layerIdx : 0;
      const col = layerIdx >= 0 ? layers[layerIdx].indexOf(node.id) : 0;
      return {
        ...node,
        position: {
          x: col * spacingX,
          y: layer * spacingY
        }
      };
    });
    setNodes(positioned);
    pushToast({ title: "Auto-layout applied", description: "Nodes repositioned for readability." });
  }, [edges, nodes, pushToast, setNodes]);

  const handleNodeClick = useCallback(
    (_event: unknown, node: Node) => {
      if (!interactive) return;
      setSelectedNode(node);
    },
    [interactive]
  );

  const deleteSelection = useCallback(() => {
    if (!interactive) return;
    const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    const selectedEdgeIds = new Set(edges.filter((e) => e.selected).map((e) => e.id));
    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

    setHasEdited(true);
    setNodes((current) => current.filter((n) => !selectedNodeIds.has(n.id)));
    setEdges((current) =>
      current.filter(
        (e) =>
          !selectedEdgeIds.has(e.id) &&
          !selectedNodeIds.has(e.source as string) &&
          !selectedNodeIds.has(e.target as string)
      )
    );
    pushToast({ title: "Deleted selection", description: "Nodes or edges were removed." });
  }, [edges, interactive, nodes, pushToast, setEdges, setNodes]);

  const duplicateSelection = useCallback(() => {
    if (!interactive) return;
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    setHasEdited(true);
    const idMap = new Map<string, string>();
    const offset = { x: 40, y: 40 };
    const newNodes = selectedNodes.map((node) => {
      const newId = nanoid();
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + offset.x, y: node.position.y + offset.y },
        selected: false,
        data: { ...node.data, label: `${node.data?.label ?? node.id} copy` }
      };
    });
    const newEdges = edges
      .filter((edge) => edge.selected || (edge.source && edge.target && idMap.has(edge.source) && idMap.has(edge.target)))
      .map((edge) => ({
        ...edge,
        id: `${edge.id}-${nanoid(4)}`,
        source: idMap.get(edge.source as string) ?? edge.source,
        target: idMap.get(edge.target as string) ?? edge.target,
        selected: false
      }));
    setNodes((current) => [...current, ...newNodes]);
    setEdges((current) => [...current, ...newEdges]);
    pushToast({ title: "Duplicated selection", description: "Copied nodes (and edges) with offset." });
  }, [edges, interactive, nodes, pushToast, setEdges, setNodes]);

  useEffect(() => {
    if (!interactive) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        target?.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "option";
      if (isTyping) return;

      const key = event.key.toLowerCase();
      const isUndo = (event.metaKey || event.ctrlKey) && key === "z" && !event.shiftKey;
      const isRedo = (event.metaKey || event.ctrlKey) && ((key === "z" && event.shiftKey) || key === "y");
      const isDelete = key === "delete" || key === "backspace";
      const isDuplicate = (event.metaKey || event.ctrlKey) && key === "d";
      if (isUndo) {
        event.preventDefault();
        undo();
      } else if (isRedo) {
        event.preventDefault();
        redo();
      } else if (isDelete) {
        event.preventDefault();
        deleteSelection();
      } else if (isDuplicate) {
        event.preventDefault();
        duplicateSelection();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelection, duplicateSelection, interactive, redo, undo]);

  const handleUpdateNode = useCallback(
    (payload: Record<string, unknown>): boolean => {
      if (!selectedNode) return false;
      setHasEdited(true);

      // Create updated node data for validation
      const updatedNodeData = {
        ...selectedNode.data,
        ...payload
      };

      // Validate using shared validation logic
      const nodeType = selectedNode.data?.type as WorkflowDefinition["nodes"][number]["type"];
      const config = updatedNodeData.config as Record<string, unknown> | undefined;
      const validation = validateNodeConfig(
        nodeType,
        config,
        updatedNodeData.label ?? selectedNode.id
      );

      if (!validation.valid) {
        setValidationMessage(validation.error ?? "Validation failed");
        setShowValidationMessage(true);
        setInvalidNodeIds(new Set([selectedNode.id]));
        return false;
      }

      setNodes((current) => {
        const next = current.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: updatedNodeData
              }
            : node
        );
        // Close the panel after a successful save to match expected UX.
        setSelectedNode(null);
        setValidationMessage(null);
        setShowValidationMessage(false);
        // Defer toast to avoid state updates during render of parent providers.
        const now = Date.now();
        if (now - lastToastAtRef.current > 500) {
          lastToastAtRef.current = now;
          setTimeout(() => {
            pushToast({
              title: "Node updated",
              description: "Configuration saved to the workflow draft."
            });
          }, 0);
        }
        return next;
      });
      return true;
    },
    [pushToast, selectedNode, setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      setHasEdited(true);
      pushToast({
        title: "Node removed",
        description: "Any edges connected to this node were also deleted."
      });
    },
    [pushToast, selectedNode, setEdges, setNodes]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const reactFlowNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        type: "glass",
        data: {
          ...node.data,
          onDelete: interactive ? deleteNode : undefined,
          invalid: invalidNodeIds.has(node.id)
        }
      })),
    [deleteNode, interactive, invalidNodeIds, nodes]
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

  const decoratedEdges = useMemo(() => {
    const colorForLabel = (label?: string) => {
      if (!label) return "#38bdf8";
      const lower = label.toLowerCase();
      if (["yes", "true", "success"].includes(lower)) return "#22c55e";
      if (["no", "false", "fail"].includes(lower)) return "#f472b6";
      return "#38bdf8";
    };
    return edges.map((edge) => {
      const stroke = colorForLabel(edge.label as string | undefined);
      return {
        ...edge,
        animated: edge.animated ?? true,
        style: {
          stroke,
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke
        }
      };
    });
  }, [edges]);

  const selectedCounts = useMemo(() => {
    const nodeCount = nodes.filter((n) => n.selected).length;
    const edgeCount = edges.filter((e) => e.selected).length;
    return { nodeCount, edgeCount };
  }, [edges, nodes]);

  const minHeightClass =
    showPalette || showConfig ? "min-h-[640px]" : "min-h-[420px]";

  return (
    <div className={`flex h-full ${minHeightClass} bg-midnight/70 rounded-3xl border border-white/10 overflow-hidden shadow-card`}>
      {showPalette ? <NodePalette onAdd={(type) => spawnNode(type)} /> : null}
      <main className="flex-1 relative" ref={wrapperRef}>
        {interactive && hasEdited && validationMessage && showValidationMessage ? (
          <div className="pointer-events-auto absolute top-3 left-64 right-64 z-30 flex justify-center">
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-100 text-xs px-4 py-2.5 shadow-card flex items-start gap-3 max-w-lg">
              <span className="flex-1">{validationMessage}</span>
              <button
                type="button"
                onClick={() => setShowValidationMessage(false)}
                className="text-amber-200 hover:text-amber-50 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
        <ReactFlow
          nodes={reactFlowNodes}
          edges={decoratedEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={edgeOptions}
          connectionRadius={40}
          fitView
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          selectionOnDrag={interactive}
          selectNodesOnDrag={interactive}
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
          <>
            <div className="pointer-events-auto absolute top-3 right-3 flex gap-2 z-20">
              <button
                type="button"
                onClick={undo}
                className="text-xs text-white/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 hover:bg-white/15"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                className="text-xs text-white/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 hover:bg-white/15"
              >
                Redo
              </button>
              <button
                type="button"
                onClick={autoLayout}
                className="text-xs text-white/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 hover:bg-white/15"
              >
                Auto Layout
              </button>
            </div>
            <div className="pointer-events-none absolute top-12 right-4 text-xs text-white/70 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 shadow-card">
              Drag blocks into the canvas, then pull from a cross to connect steps.
            </div>
            {selectedCounts.nodeCount + selectedCounts.edgeCount > 0 ? (
              <div className="pointer-events-none absolute top-3 left-3 text-xs text-white/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 shadow-card">
                Selected: {selectedCounts.nodeCount} node(s), {selectedCounts.edgeCount} edge(s)
              </div>
            ) : null}
          </>
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
