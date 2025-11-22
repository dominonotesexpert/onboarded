import type { WorkflowDefinition } from "~/types/workflow";
import { buildWorkflowGraph } from "./workflow-graph";
import { validateNodeConfig } from "./node-validation";

export interface ValidationIssue {
  message: string;
  nodeId?: string;
}

export function getValidationIssues(definition: WorkflowDefinition): ValidationIssue[] {
  const graph = buildWorkflowGraph(definition);
  const issues: ValidationIssue[] = [];

  // Detect cycles with DFS
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const neighbor of graph.adjacency.get(nodeId) ?? []) {
      if (hasCycle(neighbor)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  for (const node of graph.nodes.keys()) {
    if (hasCycle(node)) {
      issues.push({ message: "Workflow has a cycle; execution requires a DAG." });
      break;
    }
  }

  // Validate node configurations using shared validation logic
  for (const node of graph.nodes.values()) {
    const validation = validateNodeConfig(
      node.type,
      node.config as Record<string, unknown> | undefined,
      node.label ?? node.id
    );

    if (!validation.valid && validation.error) {
      issues.push({
        message: validation.error,
        nodeId: node.id
      });
    }
  }

  return issues;
}

export function validateWorkflowDefinition(definition: WorkflowDefinition) {
  const issues = getValidationIssues(definition);
  if (issues.length > 0) {
    throw new Error(issues[0]?.message ?? "Workflow validation failed");
  }
}
