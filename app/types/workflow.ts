export type WorkflowNodeType =
  | "START"
  | "EMAIL"
  | "SLACK"
  | "HTTP"
  | "DELAY"
  | "CONDITIONAL"
  | "TRANSFORM"
  | "WEBHOOK"
  | "END";

export interface WorkflowNodeDefinition {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  retries?: number;
  timeout?: number;
  executionMode?: "sequential" | "parallel";
}

export interface WorkflowEdgeDefinition {
  id?: string;
  source: string;
  target: string;
  condition?: {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "includes";
    value: unknown;
  };
  animated?: boolean;
  label?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeDefinition[];
  edges: WorkflowEdgeDefinition[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowWithRelations {
  id: string;
  name: string;
  description?: string | null;
  definition: WorkflowDefinition;
  version: number;
  isPublished: boolean;
  isDraft: boolean;
}

export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMEOUT";
export type TaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "RETRYING" | "SKIPPED" | "TIMEOUT";

export interface ExecutionSummary {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  duration?: number;
  startedAt: string;
  completedAt?: string;
  metrics?: Record<string, unknown>;
}

export interface TaskExecutionDetail {
  id: string;
  nodeId: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  output?: Record<string, unknown> | null;
  error?: string | null;
  label?: string;
}

export interface ExecutionDetail extends ExecutionSummary {
  tasks?: TaskExecutionDetail[];
  output?: Record<string, unknown> | null;
  error?: string | null;
  logs?: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  id: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
  taskId?: string | null;
}
