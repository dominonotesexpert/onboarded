import { describe, expect, it } from "vitest";
import { runWorkflow } from "../app/services/execution/workflow-engine.server";

const sampleDefinition = {
  nodes: [
    {
      id: "start",
      type: "START",
      label: "Trigger",
      position: { x: 0, y: 0 },
      config: {}
    },
    {
      id: "branch",
      type: "CONDITIONAL",
      label: "Check",
      position: { x: 200, y: 0 },
      config: { expression: "context.score > 50", branchTrue: "high", branchFalse: "low" }
    },
    {
      id: "notify",
      type: "SLACK",
      label: "Slack",
      position: { x: 400, y: 0 },
      config: {}
    }
  ],
  edges: [
    { source: "start", target: "branch" },
    { source: "branch", target: "notify", label: "high" }
  ]
};

describe("workflow engine", () => {
  it("executes workflow and respects branch labels", async () => {
    const result = await runWorkflow(sampleDefinition, { score: 75 });
    expect(Object.keys(result.results)).toContain("notify");
  });

  it("skips nodes that do not match branch", async () => {
    const result = await runWorkflow(sampleDefinition, { score: 10 });
    expect(Object.keys(result.results)).not.toContain("notify");
  });
});
