/**
 * Invariant Assertion Utility
 *
 * TypeScript assertion function for runtime invariant checks.
 * Throws error if condition is falsy, otherwise narrows type to truthy.
 *
 * @param condition - Value to check for truthiness
 * @param message - Error message if condition is falsy
 * @throws Error with message if condition is falsy
 *
 * @example
 * invariant(user, "User must be defined");
 * // TypeScript now knows user is truthy
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
