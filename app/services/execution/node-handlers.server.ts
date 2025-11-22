import { Effect } from "effect";
import { Parser } from "expr-eval";
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

      // Debug: log messageId server-side for troubleshooting duplicate sends.
      // This does not surface to the client; safe to keep for debugging.
      // eslint-disable-next-line no-console
      console.log(`[email-node] messageId=${messageId} to=${to}`);

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
  /**
   * CONDITIONAL node handler - evaluates expressions to determine workflow branching.
   *
   * SECURITY: Uses expr-eval parser instead of new Function() to prevent code injection.
   * Only primitive values (number, string, boolean) are supported in expressions.
   *
   * Supports both syntaxes:
   * - Direct field access: "score > 50"
   * - Context syntax (legacy): "context.score > 50"
   */
  CONDITIONAL: (node, context) =>
    Effect.sync(() => {
      const { expression, branchTrue = "yes", branchFalse = "no" } = node.config as {
        expression: string;
        branchTrue?: string;
        branchFalse?: string;
      };

      try {
        const parser = new Parser();
        const expr = parser.parse(expression ?? "true");

        // Filter context to only include primitive types for security
        const primitiveContext: Record<string, number | string | boolean> = {};
        for (const [key, value] of Object.entries(context.shared)) {
          if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            primitiveContext[key] = value;
          }
        }

        // Support both "context.field" and "field" syntax by providing both
        const variables = {
          context: primitiveContext as unknown as number,
          ...primitiveContext
        };

        const result = Boolean(expr.evaluate(variables as Record<string, number>));

        return {
          status: "SUCCESS",
          branch: result ? branchTrue : branchFalse,
          data: { result }
        };
      } catch (error) {
        throw new Error(
          `Invalid conditional expression: ${(error as Error).message}. ` +
          `Expression must be a valid boolean expression.`
        );
      }
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
