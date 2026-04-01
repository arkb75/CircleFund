type RequiredEnvKey = "DATABASE_URL" | "DIRECT_URL" | "SESSION_SECRET";

export function getRequiredEnv(key: RequiredEnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function hasRequiredEnv(key: RequiredEnvKey) {
  return Boolean(process.env[key]);
}
