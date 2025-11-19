import type { Edge, Node } from "reactflow";
import type { WorkflowDefinition } from "~/types/workflow";

export function definitionToReactFlow(definition: WorkflowDefinition) {
  const nodes: Node[] = definition.nodes.map((node) => ({
    id: node.id,
    position: node.position ?? { x: 0, y: 0 },
    data: { ...node, label: node.label ?? node.id, executionMode: node.executionMode ?? "sequential" },
    type: "glass"
  }));

  const edges: Edge[] = definition.edges.map((edge, index) => ({
    id: edge.id ?? `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    animated: edge.animated ?? true,
    label: edge.label
  }));

  return { nodes, edges };
}

export function reactFlowToDefinition(nodes: Node[], edges: Edge[]): WorkflowDefinition {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.data?.label ?? node.id,
      type: (node.data?.type as WorkflowDefinition["nodes"][number]["type"]) ?? "HTTP",
      position: node.position ?? { x: 0, y: 0 },
      config: node.data?.config ?? {},
      executionMode: (node.data?.executionMode as "parallel" | "sequential") ?? "sequential"
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated
    }))
  };
}
