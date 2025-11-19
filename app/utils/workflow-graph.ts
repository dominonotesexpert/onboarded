import { invariant } from "./invariant";
import type {
  WorkflowDefinition,
  WorkflowEdgeDefinition,
  WorkflowNodeDefinition
} from "~/types/workflow";

export interface WorkflowGraph {
  nodes: Map<string, WorkflowNodeDefinition>;
  edges: WorkflowEdgeDefinition[];
  adjacency: Map<string, string[]>;
  reverseAdjacency: Map<string, string[]>;
  entryNodes: WorkflowNodeDefinition[];
}

export function buildWorkflowGraph(definition: WorkflowDefinition): WorkflowGraph {
  const nodes = new Map<string, WorkflowNodeDefinition>();
  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  for (const node of definition.nodes) {
    nodes.set(node.id, node);
    adjacency.set(node.id, []);
    reverseAdjacency.set(node.id, []);
  }

  for (const edge of definition.edges) {
    invariant(nodes.has(edge.source), `Edge references unknown source node ${edge.source}`);
    invariant(nodes.has(edge.target), `Edge references unknown target node ${edge.target}`);

    adjacency.get(edge.source)?.push(edge.target);
    reverseAdjacency.get(edge.target)?.push(edge.source);
  }

  const entryNodes = Array.from(nodes.values()).filter((node) => {
    const incoming = reverseAdjacency.get(node.id);
    return !incoming || incoming.length === 0 || node.type === "START";
  });

  return {
    nodes,
    edges: definition.edges,
    adjacency,
    reverseAdjacency,
    entryNodes
  };
}

export function buildExecutionLayers(graph: WorkflowGraph) {
  const inDegree = new Map<string, number>();
  for (const nodeId of graph.nodes.keys()) {
    inDegree.set(nodeId, graph.reverseAdjacency.get(nodeId)?.length ?? 0);
  }

  const layers: string[][] = [];
  let queue = graph.entryNodes.map((node) => node.id);

  while (queue.length > 0) {
    layers.push(queue);
    const nextQueue: string[] = [];

    for (const nodeId of queue) {
      const neighbors = graph.adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        const current = inDegree.get(neighbor) ?? 0;
        const next = current - 1;
        inDegree.set(neighbor, next);
        if (next === 0) {
          nextQueue.push(neighbor);
        }
      }
    }

    queue = nextQueue;
  }

  return layers;
}
