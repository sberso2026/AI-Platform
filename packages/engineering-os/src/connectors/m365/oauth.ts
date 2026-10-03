/**
 * Microsoft identity URLs and trusted token claim extraction for MODE A onboarding.
 * Token values never enter domain rows or logs.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { isAllowedGraphUrl } from "./security";
import type { TrustedMicrosoftIdentity } from "./onboarding";
import { rtbMicrosoftAppConfig } from "./onboarding";

const LOGIN_AUTHORIZE = "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize";
const LOGIN_ADMIN_CONSENT = "https://login.microsoftonline.com/organizations/v2.0/adminconsent";
const LOGIN_TOKEN = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token";

export type MicrosoftOAuthState = {
  nonce: string;
  eosTenantId: string;
  workspaceId: string;
  userId: string;
  adminConsent: boolean;
  exp: number;
};

export function defaultM365RedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/engineering/m365/oauth/callback`;
}

export function buildMicrosoftAuthorizeUrl(input: {
  applicationId: string;
  redirectUri: string;
  state: string;
  adminConsent?: boolean;
}): string {
  if (!isAllowedGraphUrl("https://login.microsoftonline.com/organizations/oauth2/v2.0/token")) {
    throw new Error("SSRF_BLOCKED");
  }
  const params = new URLSearchParams({
    client_id: input.applicationId,
    redirect_uri: input.redirectUri,
    state: input.state,
    response_type: "code",
    response_mode: "query",
    scope: "openid profile offline_access",
    prompt: input.adminConsent ? "admin_consent" : "select_account",
  });
  return `${input.adminConsent ? LOGIN_ADMIN_CONSENT.replace("/adminconsent", "/oauth2/v2.0/authorize") : LOGIN_AUTHORIZE}?${params.toString()}`;
}

export function buildMicrosoftAdminConsentUrl(input: {
  applicationId: string;
  redirectUri: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.applicationId,
    redirect_uri: input.redirectUri,
    state: input.state,
    scope: "https://graph.microsoft.com/.default",
  });
  return `${LOGIN_ADMIN_CONSENT}?${params.toString()}`;
}

export function signOAuthState(payload: MicrosoftOAuthState, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyOAuthState(token: string, secret: string): MicrosoftOAuthState {
  const [body, mac] = token.split(".");
  if (!body || !mac) throw new Error("oauth_state_invalid");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) throw new Error("oauth_state_invalid");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as MicrosoftOAuthState;
  if (!payload.nonce || !payload.eosTenantId || !payload.workspaceId || payload.exp < Date.now()) {
    throw new Error("oauth_state_invalid");
  }
  return payload;
}

export function decodeMicrosoftIdToken(idToken: string): TrustedMicrosoftIdentity {
  const part = idToken.split(".")[1];
  if (!part) throw new Error("microsoft_identity_missing");
  const json = JSON.parse(Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as Record<string, unknown>;
  const tid = typeof json.tid === "string" ? json.tid.trim() : "";
  const oid = typeof json.oid === "string" ? json.oid.trim() : typeof json.sub === "string" ? json.sub.trim() : "";
  if (!tid || !oid) throw new Error("microsoft_tenant_missing");
  const organisationName = typeof json.preferred_username === "string" ? json.preferred_username : typeof json.upn === "string" ? json.upn : null;
  return {
    microsoftTenantId: tid,
    signedInUserId: oid,
    organisationName,
    adminConsentGranted: true,
    source: "microsoft_token",
  };
}

export async function exchangeMicrosoftAuthorizationCode(input: {
  code: string;
  redirectUri: string;
  env?: NodeJS.ProcessEnv;
}): Promise<{ identity: TrustedMicrosoftIdentity; tokenPresent: true }> {
  const env = input.env ?? process.env;
  const app = rtbMicrosoftAppConfig(env);
  const secret = env.RTB_M365_CLIENT_SECRET?.trim();
  if (!app.configured || !secret) throw new Error("RTB_APP_NOT_CONFIGURED");
  if (!isAllowedGraphUrl(LOGIN_TOKEN)) throw new Error("SSRF_BLOCKED");
  const response = await fetch(LOGIN_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: app.applicationId,
      client_secret: secret,
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: input.redirectUri,
    }),
    redirect: "manual",
  });
  if (response.status === 401 || response.status === 403) throw new Error("token_rejected");
  if (!response.ok) throw new Error(`token_http_${response.status}`);
  const json = (await response.json()) as { id_token?: string; access_token?: string };
  if (!json.id_token) throw new Error("microsoft_identity_missing");
  return { identity: decodeMicrosoftIdToken(json.id_token), tokenPresent: true };
}

export function identityFromAdminConsentCallback(tenant: string, adminConsent: string): TrustedMicrosoftIdentity {
  if (adminConsent.toLowerCase() !== "true") throw new Error("ADMIN_CONSENT_REQUIRED");
  if (!tenant.trim()) throw new Error("microsoft_tenant_missing");
  return {
    microsoftTenantId: tenant.trim(),
    signedInUserId: "microsoft-admin-consent",
    adminConsentGranted: true,
    source: "microsoft_admin_consent",
  };
}

export function classifyMicrosoftOAuthError(error: string | null, description: string | null): "ADMIN_CONSENT_REQUIRED" | "AUTH_EXPIRED" | "CONNECTION_ERROR" {
  const text = `${error ?? ""} ${description ?? ""}`.toLowerCase();
  if (text.includes("consent") || text.includes("access_denied") || text.includes("aadsts65001")) return "ADMIN_CONSENT_REQUIRED";
  if (text.includes("expired") || text.includes("invalid_grant")) return "AUTH_EXPIRED";
  return "CONNECTION_ERROR";
}
