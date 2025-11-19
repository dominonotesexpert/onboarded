export const isDemoMode = () => (process.env.FLOWFORGE_DEMO_MODE ?? "true") !== "false";

export function requiredEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}
