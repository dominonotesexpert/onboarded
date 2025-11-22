import type { WorkflowNodeType } from "~/types/workflow";

/**
 * Result of node configuration validation
 */
export interface NodeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a single node's configuration based on its type.
 * This is the single source of truth for node validation logic.
 *
 * @param nodeType - The type of the workflow node
 * @param config - The node's configuration object
 * @param label - The node's label or ID for error messages
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateNodeConfig('EMAIL', { to: 'user@example.com' }, 'Welcome Email');
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateNodeConfig(
  nodeType: WorkflowNodeType,
  config: Record<string, unknown> | undefined,
  label: string
): NodeValidationResult {
  // Helper to create error result
  const invalid = (error: string): NodeValidationResult => ({ valid: false, error });

  switch (nodeType) {
    case "EMAIL": {
      // Check required fields
      if (!config?.to || !config?.subject) {
        return invalid(`Email node "${label}" requires "to" and "subject".`);
      }

      // Validate email format
      const to = String(config.to).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return invalid(`Email node "${label}" must have a valid "to" email address.`);
      }

      return { valid: true };
    }

    case "SLACK": {
      if (!config?.channel) {
        return invalid(`Slack node "${label}" requires a "channel".`);
      }
      return { valid: true };
    }

    case "HTTP": {
      if (!config?.url) {
        return invalid(`HTTP node "${label}" requires a "url".`);
      }

      // Validate URL format
      const rawUrl = String(config.url).trim();
      try {
        const parsed = new URL(rawUrl);
        if (!/^https?:$/i.test(parsed.protocol)) {
          return invalid(`HTTP node "${label}" must use http or https URL.`);
        }
      } catch {
        return invalid(`HTTP node "${label}" has an invalid URL format.`);
      }

      return { valid: true };
    }

    case "DELAY": {
      if (!config?.durationMs) {
        return invalid(`Delay node "${label}" requires "durationMs".`);
      }
      return { valid: true };
    }

    case "CONDITIONAL": {
      if (!config?.expression) {
        return invalid(`Conditional node "${label}" requires an "expression".`);
      }
      return { valid: true };
    }

    // Node types that don't require validation
    case "START":
    case "END":
    case "TRANSFORM":
    case "WEBHOOK":
      return { valid: true };

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = nodeType;
      return _exhaustive;
    }
  }
}
