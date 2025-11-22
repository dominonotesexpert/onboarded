import { Effect } from "effect";
import type { WorkflowNodeDefinition, WorkflowNodeType } from "~/types/workflow";
import { renderTemplateString } from "~/utils/templates";
import { sendMail } from "~/lib/mailer.server";

export interface ExecutionContext {
  input: Record<string, unknown>;
  shared: Record<string, unknown>;
}

export interface TaskResult {
  status: "SUCCESS" | "FAILED";
  data?: Record<string, unknown>;
  branch?: string;
  logs?: string[];
}

export type TaskHandler = (
  node: WorkflowNodeDefinition,
  context: ExecutionContext
) => Effect.Effect<TaskResult>;

const delay = (ms: number) => Effect.promise(() => new Promise((resolve) => setTimeout(resolve, ms)));

const handlers: Record<WorkflowNodeType, TaskHandler> = {
  START: (node, context) =>
    Effect.succeed({
      status: "SUCCESS",
      data: context.input
    }),
  END: () =>
    Effect.succeed({
      status: "SUCCESS"
    }),
  EMAIL: (node, context) =>
    Effect.gen(function* () {
      const config = node.config as {
        to?: string;
        subject?: string;
        body?: string;
        from?: string;
      };
      const to = renderTemplateString(config.to ?? "", context.shared).trim();
      const subject = renderTemplateString(config.subject ?? "", context.shared).trim();
      const renderedBody = renderTemplateString(config.body ?? "", context.shared);
      const textFallback = renderedBody.replace(/<[^>]+>/g, " ").trim() || renderedBody;

      if (!to || !subject) {
        throw new Error("Email node requires 'to' and 'subject' values.");
      }

      const messageId = yield* Effect.promise(() =>
        sendMail({
          to,
          subject,
          html: renderedBody,
          text: textFallback,
          from: config.from
        })
      );

      return {
        status: "SUCCESS",
        data: {
          type: "email",
          to,
          subject,
          body: renderedBody,
          messageId
        }
      };
    }),
  SLACK: (node) =>
    Effect.gen(function* () {
      yield* delay(250);
      return {
        status: "SUCCESS",
        data: {
          type: "slack",
          channel: node.config.channel ?? "#general",
          message: node.config.message ?? "Notification sent",
          ts: Date.now()
        }
      };
    }),
  HTTP: (node) =>
    Effect.gen(function* () {
      yield* delay(500);
      return {
        status: "SUCCESS",
        data: {
          type: "http",
          method: (node.config.method ?? "GET") as string,
          url: node.config.url ?? "https://example.com",
          status: 200
        }
      };
    }),
  DELAY: (node) =>
    Effect.gen(function* () {
      const duration = Number(node.config.durationMs ?? 1000);
      yield* delay(Math.min(duration, 2_000));
      return { status: "SUCCESS", data: { waitedMs: duration } };
    }),
  CONDITIONAL: (node, context) =>
    Effect.sync(() => {
      const { expression, branchTrue = "yes", branchFalse = "no" } = node.config as {
        expression: string;
        branchTrue?: string;
        branchFalse?: string;
      };

      const fn = new Function("context", `return (${expression ?? "true"});`);
      const result = Boolean(fn(context.shared));

      return {
        status: "SUCCESS",
        branch: result ? branchTrue : branchFalse,
        data: { result }
      };
    }),
  TRANSFORM: (node, context) =>
    Effect.sync(() => {
      const mapper = node.config.mapper as Record<string, string>;
      const transformed: Record<string, unknown> = {};
      for (const key of Object.keys(mapper ?? {})) {
        transformed[key] = renderTemplateString(mapper[key], context.shared);
      }

      return {
        status: "SUCCESS",
        data: transformed
      };
    }),
  WEBHOOK: (node) =>
    Effect.gen(function* () {
      yield* delay(300);
      return {
        status: "SUCCESS",
        data: {
          url: node.config.url ?? "https://hooks.flowforge.dev",
          deliveryId: `hook_${Date.now()}`
        }
      };
    })
};

export function resolveTaskHandler(type: WorkflowNodeType): TaskHandler {
  if (!handlers[type]) {
    throw new Error(`No handler registered for node type: ${type}`);
  }

  return handlers[type];
}
