import type { WorkflowDefinition } from "~/types/workflow";
import { buildWorkflowGraph } from "./workflow-graph";

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

  // Minimal required config per node type
  for (const node of graph.nodes.values()) {
    switch (node.type) {
      case "EMAIL":
        if (!node.config || !(node.config as Record<string, unknown>)["to"]) {
          issues.push({
            message: `Email node "${node.label ?? node.id}" requires a "to" address.`,
            nodeId: node.id
          });
        }
        if (node.config && (node.config as Record<string, unknown>)["to"]) {
          const to = String((node.config as Record<string, unknown>)["to"]).trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(to)) {
            issues.push({
              message: `Email node "${node.label ?? node.id}" must have a valid "to" email address.`,
              nodeId: node.id
            });
          }
        }
        break;
      case "SLACK":
        if (!node.config || !(node.config as Record<string, unknown>)["channel"]) {
          issues.push({
            message: `Slack node "${node.label ?? node.id}" requires a "channel".`,
            nodeId: node.id
          });
        }
        break;
      case "HTTP":
        if (!node.config || !(node.config as Record<string, unknown>)["url"]) {
          issues.push({
            message: `HTTP node "${node.label ?? node.id}" requires a "url".`,
            nodeId: node.id
          });
        }
        if (node.config && (node.config as Record<string, unknown>)["url"]) {
          const rawUrl = String((node.config as Record<string, unknown>)["url"]).trim();
          try {
            const parsed = new URL(rawUrl);
            if (!/^https?:$/i.test(parsed.protocol)) {
              issues.push({
                message: `HTTP node "${node.label ?? node.id}" must use http or https URL.`,
                nodeId: node.id
              });
            }
          } catch {
            issues.push({
              message: `HTTP node "${node.label ?? node.id}" has an invalid URL format.`,
              nodeId: node.id
            });
          }
        }
        break;
      case "DELAY":
        if (!node.config || !(node.config as Record<string, unknown>)["durationMs"]) {
          issues.push({
            message: `Delay node "${node.label ?? node.id}" requires "durationMs".`,
            nodeId: node.id
          });
        }
        break;
      case "CONDITIONAL":
        if (!node.config || !(node.config as Record<string, unknown>)["expression"]) {
          issues.push({
            message: `Conditional node "${node.label ?? node.id}" requires an "expression".`,
            nodeId: node.id
          });
        }
        break;
      default:
        break;
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
