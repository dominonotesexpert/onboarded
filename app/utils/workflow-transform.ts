/**
 * Workflow Transform Utilities
 *
 * Converts between workflow definition format and React Flow format.
 * Enables seamless integration between workflow engine and visual builder.
 *
 * Transformations:
 * - definitionToReactFlow: Engine format -> UI format
 * - reactFlowToDefinition: UI format -> Engine format
 *
 * @module workflow-transform
 */

import type { Edge, Node } from "reactflow";
import type { WorkflowDefinition } from "~/types/workflow";

/**
 * Converts workflow definition to React Flow nodes and edges.
 *
 * @param definition - Workflow definition from database
 * @returns Object with React Flow nodes and edges
 */
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

/**
 * Converts React Flow nodes and edges to workflow definition.
 *
 * @param nodes - React Flow nodes from builder
 * @param edges - React Flow edges from builder
 * @returns Workflow definition ready for execution
 */
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
      label: typeof edge.label === "string" ? edge.label : undefined,
      animated: edge.animated
    }))
  };
}
