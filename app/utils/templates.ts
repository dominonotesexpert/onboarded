/**
 * Template Rendering Utilities
 *
 * Provides template string interpolation for dynamic content in workflows.
 * Supports {{variable}} syntax with dot-notation for nested properties.
 *
 * Usage:
 * ```typescript
 * const context = { user: { name: "John", email: "john@example.com" } };
 * renderTemplateString("Hello {{user.name}}", context); // "Hello John"
 * ```
 *
 * Use Cases:
 * - Dynamic email addresses: "{{employee.email}}"
 * - Personalized messages: "Welcome {{user.name}}!"
 * - API URLs: "https://api.com/users/{{user.id}}"
 *
 * @module templates
 */

const templateToken = /{{\s*([^}]+)\s*}}/g;

/**
 * Replaces template tokens with values from context object.
 *
 * @param template - String containing {{variable}} tokens
 * @param context - Object with values to interpolate
 * @returns Rendered string with variables replaced
 */
export function renderTemplateString(template: string, context: Record<string, unknown>) {
  if (!template || typeof template !== "string") return template;

  return template.replace(templateToken, (_, key: string) => {
    const value = getValueFromContext(context, key.trim());
    return value === undefined ? "" : String(value);
  });
}

/**
 * Retrieves nested value from context using dot-notation path.
 *
 * @param context - Object to extract value from
 * @param path - Dot-separated path (e.g., "user.email")
 * @returns Value at path or undefined if not found
 *
 * @example
 * getValueFromContext({ user: { email: "test@example.com" } }, "user.email")
 * // Returns: "test@example.com"
 */
export function getValueFromContext(context: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, context);
}
