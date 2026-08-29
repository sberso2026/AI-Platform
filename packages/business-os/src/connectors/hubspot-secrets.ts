import { HubSpotConnectorError } from "./hubspot-errors";

export const HUBSPOT_LIVE_KEYS = [
  "HUBSPOT_CLIENT_ID",
  "HUBSPOT_CLIENT_SECRET",
  "HUBSPOT_SECRET_ID",
  "HUBSPOT_PORTAL_ID",
  "HUBSPOT_REFRESH_TOKEN",
] as const;

export type HubSpotSecretMaterial = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  portalId: string;
  secretId: string;
};

function trimmed(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key];
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

export function hubspotBrowserSecretPresent(env: NodeJS.ProcessEnv = process.env): boolean {
  return Object.keys(env).some((key) => key.startsWith("NEXT_PUBLIC_HUBSPOT_") && Boolean(trimmed(env, key)));
}

function looksLikePrivateAppToken(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.startsWith("pat-") || lower.startsWith("hapikey") || lower.includes("hapikey=");
}

export function resolveHubSpotSecrets(
  secretId: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): HubSpotSecretMaterial {
  if (hubspotBrowserSecretPresent(env)) {
    throw new HubSpotConnectorError("hubspot_browser_secret_forbidden");
  }
  const accessToken = trimmed(env, "HUBSPOT_ACCESS_TOKEN");
  if (accessToken || looksLikePrivateAppToken(trimmed(env, "HUBSPOT_HAPIKEY"))) {
    throw new HubSpotConnectorError("hubspot_private_app_forbidden");
  }
  if (!secretId) throw new HubSpotConnectorError("hubspot_missing_secret");
  const expectedSecretId = trimmed(env, "HUBSPOT_SECRET_ID");
  const clientId = trimmed(env, "HUBSPOT_CLIENT_ID");
  const clientSecret = trimmed(env, "HUBSPOT_CLIENT_SECRET");
  const refreshToken = trimmed(env, "HUBSPOT_REFRESH_TOKEN");
  const portalId = trimmed(env, "HUBSPOT_PORTAL_ID");
  if (!expectedSecretId || secretId !== expectedSecretId) {
    throw new HubSpotConnectorError("hubspot_secret_retrieval_failed");
  }
  if (looksLikePrivateAppToken(refreshToken) || looksLikePrivateAppToken(clientSecret)) {
    throw new HubSpotConnectorError("hubspot_private_app_forbidden");
  }
  if (!clientId || !clientSecret || !refreshToken || !portalId) {
    throw new HubSpotConnectorError("hubspot_live_unavailable");
  }
  if (!/^\d+$/.test(portalId)) {
    throw new HubSpotConnectorError("hubspot_portal_mismatch");
  }
  return { clientId, clientSecret, refreshToken, portalId, secretId };
}
