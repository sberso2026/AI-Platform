import { XeroConnectorError } from "./xero-errors";

const XERO_LIVE_KEYS = [
  "XERO_CLIENT_ID",
  "XERO_CLIENT_SECRET",
  "XERO_SECRET_ID",
  "XERO_TENANT_ID",
  "XERO_REFRESH_TOKEN",
] as const;

export type XeroSecretMaterial = {
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

export function xeroBrowserSecretPresent(env: NodeJS.ProcessEnv = process.env): boolean {
  return Object.keys(env).some((key) => key.startsWith("NEXT_PUBLIC_XERO_") && Boolean(trimmed(env, key)));
}

export function xeroLiveKeysPresent(env: NodeJS.ProcessEnv = process.env): {
  present: string[];
  missing: string[];
} {
  const present = XERO_LIVE_KEYS.filter((key) => Boolean(trimmed(env, key)));
  const missing = XERO_LIVE_KEYS.filter((key) => !trimmed(env, key));
  return { present: [...present], missing: [...missing] };
}

export function resolveXeroSecrets(
  secretId: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): XeroSecretMaterial {
  if (xeroBrowserSecretPresent(env)) {
    throw new XeroConnectorError("xero_browser_secret_forbidden");
  }
  if (!secretId) throw new XeroConnectorError("xero_missing_secret");
  const expectedSecretId = trimmed(env, "XERO_SECRET_ID");
  const clientId = trimmed(env, "XERO_CLIENT_ID");
  const clientSecret = trimmed(env, "XERO_CLIENT_SECRET");
  const refreshToken = trimmed(env, "XERO_REFRESH_TOKEN");
  const tenantId = trimmed(env, "XERO_TENANT_ID");
  if (!expectedSecretId || secretId !== expectedSecretId) {
    throw new XeroConnectorError("xero_secret_retrieval_failed");
  }
  if (!clientId || !clientSecret || !refreshToken || !tenantId) {
    throw new XeroConnectorError("xero_live_unavailable");
  }
  return { clientId, clientSecret, refreshToken, tenantId, secretId };
}
