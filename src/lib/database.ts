import type { PoolConfig } from "pg";

export function getRuntimeDatabaseUrl() {
  const configured = process.env.DATABASE_URL;
  if (!configured) {
    throw new Error("DATABASE_CONFIG_MISSING");
  }

  const url = new URL(configured);
  if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "5432") {
    url.port = "6543";
  }

  return url.toString();
}

export function getDatabasePoolConfig(): PoolConfig {
  return {
    connectionString: getRuntimeDatabaseUrl(),
    max: Math.max(1, Number(process.env.DATABASE_POOL_SIZE) || 1),
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
    allowExitOnIdle: true,
  };
}
