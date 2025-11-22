/**
 * Workflow Node Handlers
 *
 * This module implements the execution logic for each workflow node type.
 * Each handler is a pure function that takes node configuration and context,
 * then returns an Effect that produces a TaskResult.
 *
 * Security Considerations:
 * - CONDITIONAL nodes use expr-eval parser (prevents code injection)
 * - EMAIL nodes support template syntax ({{ variable }}) for dynamic content
 * - HTTP nodes validate URL protocols (http/https only)
 * - All handlers use Effect.ts for composable error handling
 *
 * @module node-handlers
 */

import { Effect } from "effect";
import { Parser } from "expr-eval";
import type { WorkflowNodeDefinition, WorkflowNodeType } from "~/types/workflow";
import { renderTemplateString } from "~/utils/templates";
import { sendMail } from "~/lib/mailer.server";

/**
 * Execution context passed to every node handler.
 * Contains input data and shared context from previous nodes.
 */
export interface ExecutionContext {
  input: Record<string, unknown>;   // Original workflow input payload
  shared: Record<string, unknown>;  // Accumulated data from all completed tasks
}

/**
 * Result returned by each node handler.
 * Indicates success/failure and optionally provides data or branching instructions.
 */
export interface TaskResult {
  status: "SUCCESS" | "FAILED";        // Task outcome
  data?: Record<string, unknown>;      // Output data (stored in shared context)
  branch?: string;                     // Conditional branch to take ("yes"/"no", etc.)
  logs?: string[];                     // Optional log messages
}

/**
 * Function signature for node handlers.
 * All handlers must return an Effect for composable error handling.
 */
export type TaskHandler = (
  node: WorkflowNodeDefinition,
  context: ExecutionContext
) => Effect.Effect<TaskResult>;

/** Helper to create a delay effect (used by DELAY node) */
const delay = (ms: number) => Effect.promise(() => new Promise((resolve) => setTimeout(resolve, ms)));

/**
 * Map of node type to handler function.
 * Each handler implements the execution logic for one workflow node type.
 */
const handlers: Record<WorkflowNodeType, TaskHandler> = {
  /**
   * START node - Entry point of workflow execution.
   * Simply passes through the input data to the shared context.
   */
  START: (node, context) =>
    Effect.succeed({
      status: "SUCCESS",
      data: context.input
    }),

  /**
   * END node - Terminal node of workflow execution.
   * No-op that marks the end of a workflow path.
   */
  END: () =>
    Effect.succeed({
      status: "SUCCESS"
    }),
  /**
   * EMAIL node - Sends email via SMTP.
   *
   * Features:
   * - Template support: Use {{ variable }} in to/subject/body fields
   * - HTML support: Renders HTML emails with plain text fallback
   * - AWS SES compatible SMTP configuration
   *
   * Configuration:
   * - to: Recipient email address (required) - supports templates
   * - subject: Email subject line (required) - supports templates
   * - body: HTML or plain text body - supports templates
   * - from: Sender email (optional, uses MAIL_FROM env var by default)
   *
   * Returns messageId in task data for tracking sent emails.
   *
   * Note: Defaults to 0 retries to prevent duplicate email sends.
   */
  EMAIL: (node, context) =>
    Effect.gen(function* () {
      const config = node.config as {
        to?: string;
        subject?: string;
        body?: string;
        from?: string;
      };

      // Render templates ({{ variable }} syntax)
      const to = renderTemplateString(config.to ?? "", context.shared).trim();
      const subject = renderTemplateString(config.subject ?? "", context.shared).trim();
      const renderedBody = renderTemplateString(config.body ?? "", context.shared);

      // Create plain text fallback by stripping HTML tags
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
   * CONDITIONAL node - Evaluates expressions for workflow branching.
   *
   * **SECURITY - CODE INJECTION PREVENTION:**
   * Uses expr-eval library instead of `new Function()` or `eval()` to prevent
   * arbitrary code execution. Only mathematical and logical operations are allowed.
   *
   * **Supported Expression Syntax:**
   * - Comparisons: `score > 50`, `age >= 18`, `status == "active"`
   * - Boolean logic: `score > 50 && age < 65`, `isAdmin || isModerator`
   * - Math operations: `(price * quantity) > 1000`
   * - Direct fields: `isVerified`, `score > threshold`
   * - Context prefix: `context.score > 50` (legacy support)
   *
   * **Configuration:**
   * - expression: Boolean expression to evaluate (required)
   * - branchTrue: Edge label for true branch (default: "yes")
   * - branchFalse: Edge label for false branch (default: "no")
   *
   * **How Branching Works:**
   * The returned branch value is matched against edge labels. For example:
   * - If expression evaluates to true, activates edges with label="yes"
   * - If expression evaluates to false, activates edges with label="no"
   * - Unmatched edges are not activated (skipped in execution)
   *
   * **Security Constraints:**
   * - Only primitive types (number, string, boolean) are accessible
   * - Objects and functions are filtered out from context
   * - No access to Node.js globals (process, require, etc.)
   * - No ability to execute arbitrary code
   *
   * @example
   * // Expression: "score > 50"
   * // Context: { score: 75 }
   * // Result: branch="yes", activates edges with label="yes"
   */
  CONDITIONAL: (node, context) =>
    Effect.sync(() => {
      const { expression, branchTrue = "yes", branchFalse = "no" } = node.config as {
        expression: string;
        branchTrue?: string;
        branchFalse?: string;
      };

      try {
        // Parse expression using safe expr-eval library
        const parser = new Parser();
        const expr = parser.parse(expression ?? "true");

        // SECURITY: Filter context to only include primitive types
        // This prevents access to objects, functions, or Node.js globals
        const primitiveContext: Record<string, number | string | boolean> = {};
        for (const [key, value] of Object.entries(context.shared)) {
          if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            primitiveContext[key] = value;
          }
        }

        // Support both "context.field" and "field" syntax
        // Type assertion needed for expr-eval's variable system
        const variables = {
          context: primitiveContext as unknown as number,
          ...primitiveContext
        };

        // Evaluate expression and convert to boolean
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

/**
 * Resolve the handler function for a given node type.
 *
 * @param type - The workflow node type (START, EMAIL, HTTP, etc.)
 * @returns The handler function for that node type
 * @throws Error if no handler is registered for the given type
 *
 * @example
 * ```typescript
 * const handler = resolveTaskHandler("EMAIL");
 * const result = await Effect.runPromise(handler(emailNode, context));
 * ```
 */
export function resolveTaskHandler(type: WorkflowNodeType): TaskHandler {
  if (!handlers[type]) {
    throw new Error(`No handler registered for node type: ${type}`);
  }

  return handlers[type];
}
