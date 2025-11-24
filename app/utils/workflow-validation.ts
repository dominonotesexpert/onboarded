/**
 * Workflow Validation Utilities
 *
 * This module provides validation functions for workflow definitions.
 * It ensures workflows are structurally sound before execution:
 * - DAG validation (no cycles)
 * - Node configuration validation (required fields, format checks)
 * - Edge validation (valid source/target connections)
 *
 * Validation runs at two points:
 * 1. In the UI when clicking "Save" or "Publish" (real-time feedback)
 * 2. Before execution starts (prevents invalid workflows from running)
 *
 * @module workflow-validation
 */

import type { WorkflowDefinition } from "~/types/workflow";
import { buildWorkflowGraph } from "./workflow-graph";
import { validateNodeConfig } from "./node-validation";

/**
 * A single validation issue found in the workflow.
 * Can be node-specific or workflow-wide (e.g., cycle detection).
 */
export interface ValidationIssue {
  message: string;     // Human-readable error message
  nodeId?: string;     // Optional node ID if issue is node-specific
}

/**
 * Get all validation issues for a workflow definition.
 *
 * This function performs comprehensive workflow validation:
 * 1. Cycle detection using DFS (workflows must be DAGs)
 * 2. Node configuration validation (required fields, formats)
 * 3. Returns all issues found (not just the first one)
 *
 * @param definition - The workflow definition to validate
 * @returns Array of validation issues (empty if valid)
 *
 * @example
 * ```typescript
 * const issues = getValidationIssues(workflow);
 * if (issues.length > 0) {
 *   console.error('Validation failed:', issues[0].message);
 * }
 * ```
 */
export function getValidationIssues(definition: WorkflowDefinition): ValidationIssue[] {
  const graph = buildWorkflowGraph(definition);
  const issues: ValidationIssue[] = [];

  // Detect cycles using Depth-First Search (DFS)
  // A workflow with cycles cannot be executed (needs to be a DAG)
  const visiting = new Set<string>();  // Currently in recursion stack
  const visited = new Set<string>();   // Fully processed nodes

  /**
   * DFS helper to detect cycles.
   * - If we encounter a node in "visiting", we found a back edge (cycle)
   * - If we encounter a node in "visited", it's already processed (no cycle)
   * - Otherwise, recursively check all neighbors
   */
  const hasCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;   // Back edge found = cycle!
    if (visited.has(nodeId)) return false;    // Already processed safely

    visiting.add(nodeId);
    for (const neighbor of graph.adjacency.get(nodeId) ?? []) {
      if (hasCycle(neighbor)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  // Check all nodes for cycles (handles disconnected components)
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
      issues.push({ message: validation.error, nodeId: node.id });
    }
  }

  // Validate edges reference existing nodes
  for (const edge of definition.edges ?? []) {
    if (!graph.nodes.has(edge.source)) {
      issues.push({ message: `Edge source "${edge.source}" does not exist.` });
    }
    if (!graph.nodes.has(edge.target)) {
      issues.push({ message: `Edge target "${edge.target}" does not exist.` });
    }
  }

  // Ensure we have at least one START and one END
  const startNodes = Array.from(graph.nodes.values()).filter((n) => n.type === "START");
  const endNodes = Array.from(graph.nodes.values()).filter((n) => n.type === "END");
  if (startNodes.length === 0) {
    issues.push({ message: "Workflow requires at least one START node." });
  }
  if (endNodes.length === 0) {
    issues.push({ message: "Workflow requires at least one END node." });
  }

  // Connectivity: all nodes must be reachable from a START and able to reach an END
  if (startNodes.length > 0 && endNodes.length > 0) {
    const reachableFromStart = new Set<string>();
    const dfsFromStart = (id: string) => {
      if (reachableFromStart.has(id)) return;
      reachableFromStart.add(id);
      for (const neighbor of graph.adjacency.get(id) ?? []) {
        dfsFromStart(neighbor);
      }
    };
    startNodes.forEach((n) => dfsFromStart(n.id));

    const canReachEnd = new Set<string>();
    const dfsToEnd = (id: string) => {
      if (canReachEnd.has(id)) return;
      canReachEnd.add(id);
      for (const parent of graph.reverseAdjacency.get(id) ?? []) {
        dfsToEnd(parent);
      }
    };
    endNodes.forEach((n) => dfsToEnd(n.id));

    for (const node of graph.nodes.values()) {
      if (!reachableFromStart.has(node.id)) {
        issues.push({
          message: `Node "${node.label ?? node.id}" is not connected to a START node.`,
          nodeId: node.id
        });
      } else if (!canReachEnd.has(node.id)) {
        issues.push({
          message: `Node "${node.label ?? node.id}" does not lead to an END node.`,
          nodeId: node.id
        });
      }
    }
  }

  return issues;
}

/**
 * Validate a workflow definition and throw on first error.
 *
 * This is a convenience wrapper around getValidationIssues() that throws
 * an error if any issues are found. Used by the execution engine to fail-fast
 * before starting workflow execution.
 *
 * @param definition - The workflow definition to validate
 * @throws Error with the first validation issue message
 *
 * @example
 * ```typescript
 * try {
 *   validateWorkflowDefinition(workflow);
 *   // Safe to execute
 * } catch (error) {
 *   console.error('Invalid workflow:', error.message);
 * }
 * ```
 */
export function validateWorkflowDefinition(definition: WorkflowDefinition) {
  const issues = getValidationIssues(definition);
  if (issues.length > 0) {
    throw new Error(issues[0]?.message ?? "Workflow validation failed");
  }
}
