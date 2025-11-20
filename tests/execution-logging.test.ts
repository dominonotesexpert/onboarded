import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
  Execution,
  ExecutionLog,
  PrismaClient,
  TaskExecution
} from "@prisma/client";

vi.mock("~/lib/prisma.server", () => {
  const execution: Execution & { taskExecutions: TaskExecution[]; logs: ExecutionLog[] } = {
    id: "exec_1",
    workflowId: "wf_1",
    status: "COMPLETED",
    duration: 123,
    startedAt: new Date("2024-01-01T00:00:00Z"),
    completedAt: new Date("2024-01-01T00:00:01Z"),
    output: {},
    error: null,
    input: {},
    context: {},
    failedTaskId: null,
    triggeredBy: null,
    taskExecutions: [
      {
        id: "task_1",
        executionId: "exec_1",
        nodeId: "n1",
        status: "SUCCESS",
        duration: 50,
        startedAt: new Date("2024-01-01T00:00:00Z"),
        completedAt: new Date("2024-01-01T00:00:00.050Z"),
        output: {},
        error: null,
        input: {},
        attempt: 1,
        maxAttempts: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        stackTrace: null
      }
    ],
    logs: [
      {
        id: "log_1",
        executionId: "exec_1",
        level: "INFO",
        message: "Execution started",
        timestamp: new Date("2024-01-01T00:00:00Z"),
        metadata: {},
        taskId: null
      },
      {
        id: "log_2",
        executionId: "exec_1",
        level: "ERROR",
        message: "Oops",
        timestamp: new Date("2024-01-01T00:00:00.100Z"),
        metadata: {},
        taskId: "task_1"
      }
    ]
  };

  return {
    prisma: {
      execution: {
        findUnique: vi.fn().mockResolvedValue(execution)
      }
    } as unknown as PrismaClient
  };
});

vi.mock("~/utils/env.server", () => ({
  isDemoMode: () => false
}));

describe("getExecution logging", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns execution logs and tasks", async () => {
    const { getExecution } = await import("../app/services/execution/execution-service.server");
    const result = await getExecution("exec_1");
    if (!result || !("logs" in result)) throw new Error("Execution not returned");
    expect(result.logs?.length).toBe(2);
    expect(result.tasks?.length).toBe(1);
    expect(result.logs?.find((l) => l.level === "ERROR")).toBeTruthy();
  });
});
