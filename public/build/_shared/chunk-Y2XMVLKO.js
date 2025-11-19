import {
  createHotContext
} from "/build/_shared/chunk-M7AEJR4O.js";

// app/data/demo-workflows.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/data/demo-workflows.ts"
  );
  import.meta.hot.lastModified = "1763420744816.98";
}
var demoExecutions = [
  {
    id: "exec_1",
    workflowId: "demo-employee-onboarding",
    status: "COMPLETED",
    duration: 3825,
    startedAt: new Date(Date.now() - 1e3 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1e3 * 60 * 60 + 3825).toISOString(),
    metrics: { successRate: 0.98 }
  },
  {
    id: "exec_2",
    workflowId: "demo-employee-onboarding",
    status: "FAILED",
    duration: 1250,
    startedAt: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1e3 * 60 * 30 + 1250).toISOString(),
    metrics: { failedNode: "http-ticket" }
  },
  {
    id: "exec_3",
    workflowId: "demo-lead-routing",
    status: "RUNNING",
    duration: void 0,
    startedAt: new Date(Date.now() - 1e3 * 60 * 5).toISOString(),
    metrics: { successRate: 0.94 }
  }
];
//# sourceMappingURL=/build/_shared/chunk-Y2XMVLKO.js.map
