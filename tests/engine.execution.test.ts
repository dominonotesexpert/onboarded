import { describe, expect, it } from "vitest";
import { runWorkflow } from "../app/services/execution/workflow-engine.server";
import type { WorkflowDefinition } from "../app/types/workflow";

const sampleDefinition: WorkflowDefinition = {
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
      config: { channel: "#general", message: "Notify" }
    }
  ],
  edges: [
    { source: "start", target: "branch" },
    { source: "branch", target: "notify", label: "high" }
  ]
};

describe("workflow engine execution", () => {
  it("executes workflow and respects branch labels", async () => {
    const result = await runWorkflow(sampleDefinition, { score: 75 });
    expect(Object.keys(result.results)).toContain("notify");
  });

  it("skips nodes that do not match branch", async () => {
    const result = await runWorkflow(sampleDefinition, { score: 10 });
    expect(Object.keys(result.results)).not.toContain("notify");
  });

  it("runs parallel nodes concurrently", async () => {
    const parallelDef: WorkflowDefinition = {
      nodes: [
        { id: "start", type: "START", label: "Start", position: { x: 0, y: 0 }, config: {} },
        {
          id: "left",
          type: "DELAY",
          label: "Left",
          position: { x: -100, y: 100 },
          config: { durationMs: 800 },
          executionMode: "parallel"
        },
        {
          id: "right",
          type: "DELAY",
          label: "Right",
          position: { x: 100, y: 100 },
          config: { durationMs: 800 },
          executionMode: "parallel"
        },
        { id: "end", type: "END", label: "End", position: { x: 0, y: 200 }, config: {} }
      ],
      edges: [
        { source: "start", target: "left" },
        { source: "start", target: "right" },
        { source: "left", target: "end" },
        { source: "right", target: "end" }
      ]
    };

    const started = Date.now();
    await runWorkflow(parallelDef, {});
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(1500);
  });
});

