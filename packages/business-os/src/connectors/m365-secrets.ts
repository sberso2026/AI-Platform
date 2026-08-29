import { Ms365ConnectorError } from "./m365-errors";

const MS365_LIVE_KEYS = [
  "MS365_CLIENT_ID",
  "MS365_CLIENT_SECRET",
  "MS365_SECRET_ID",
  "MS365_TENANT_ID",
  "MS365_REFRESH_TOKEN",
] as const;

export type Ms365SecretMaterial = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tenantId: string;
  secretId: string;
};

function trimmed(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key];
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

export function m365BrowserSecretPresent(env: NodeJS.ProcessEnv = process.env): boolean {
  return Object.keys(env).some((key) => key.startsWith("NEXT_PUBLIC_MS365_") && Boolean(trimmed(env, key)));
}

export function resolveMs365Secrets(
  secretId: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): Ms365SecretMaterial {
  if (m365BrowserSecretPresent(env)) {
    throw new Ms365ConnectorError("m365_browser_secret_forbidden");
  }
  if (!secretId) throw new Ms365ConnectorError("m365_missing_secret");
  const expectedSecretId = trimmed(env, "MS365_SECRET_ID");
  const clientId = trimmed(env, "MS365_CLIENT_ID");
  const clientSecret = trimmed(env, "MS365_CLIENT_SECRET");
  const refreshToken = trimmed(env, "MS365_REFRESH_TOKEN");
  const tenantId = trimmed(env, "MS365_TENANT_ID");
  if (!expectedSecretId || secretId !== expectedSecretId) {
    throw new Ms365ConnectorError("m365_secret_retrieval_failed");
  }
  if (!clientId || !clientSecret || !refreshToken || !tenantId) {
    throw new Ms365ConnectorError("m365_live_unavailable");
  }
  return { clientId, clientSecret, refreshToken, tenantId, secretId };
}
