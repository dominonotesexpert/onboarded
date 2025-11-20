import { describe, expect, it } from "vitest";
import { runWorkflow } from "../app/services/execution/workflow-engine.server";
import { getValidationIssues } from "../app/utils/workflow-validation";
import type { WorkflowDefinition } from "../app/types/workflow";

describe("workflow validation", () => {
  it("detects missing configs with node ids", () => {
    const def: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "START", label: "Start", position: { x: 0, y: 0 }, config: {} },
        { id: "email", type: "EMAIL", label: "Email", position: { x: 0, y: 100 }, config: {} }
      ],
      edges: [{ source: "start", target: "email" }]
    };
    const issues = getValidationIssues(def);
    expect(issues.some((i: { nodeId?: string }) => i.nodeId === "email")).toBe(true);
  });

  it("detects cycles", () => {
    const def: WorkflowDefinition = {
      nodes: [
        { id: "a", type: "START", label: "A", position: { x: 0, y: 0 }, config: {} },
        { id: "b", type: "HTTP", label: "B", position: { x: 0, y: 100 }, config: { url: "https://x" } }
      ],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "a" }
      ]
    };
    const issues = getValidationIssues(def);
    expect(issues.some((i: { message: string }) => /cycle/i.test(i.message))).toBe(true);
  });

  it("throws on validation failure when running", async () => {
    const invalid: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "START", label: "Start", position: { x: 0, y: 0 }, config: {} },
        { id: "email", type: "EMAIL", label: "Email", position: { x: 0, y: 100 }, config: {} }
      ],
      edges: [{ source: "start", target: "email" }]
    };
    await expect(runWorkflow(invalid, {})).rejects.toThrow();
  });
});
