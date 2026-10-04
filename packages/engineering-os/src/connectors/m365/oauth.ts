/**
 * Microsoft identity URLs and trusted token claim extraction for MODE A onboarding.
 * Token values never enter domain rows or logs.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isAllowedGraphUrl } from "./security";
import type { TrustedMicrosoftIdentity } from "./onboarding";
import { rtbMicrosoftAppConfig } from "./onboarding";

const LOGIN_AUTHORIZE = "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize";
const LOGIN_ADMIN_CONSENT = "https://login.microsoftonline.com/organizations/v2.0/adminconsent";
const LOGIN_TOKEN = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token";

export const EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT = "EOS_M365_TOKEN_EXCHANGE_FAILURE" as const;
export const EOS_M365_TOKEN_EXCHANGE_FAILURE_FILENAME = "eos-m365-token-exchange-failure.json" as const;
export const MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION = "microsoft_organizations_oauth_token" as const;

export type MicrosoftTokenExchangeFailureLayer =
  | "NETWORK_EXCEPTION"
  | "MICROSOFT_HTTP_ERROR"
  | "TOKEN_RESPONSE_PARSE_ERROR"
  | "POST_TOKEN_VALIDATION_ERROR";

const SECRET_TEXT_MARKERS = /\b(client_secret|client secret|access_token|refresh_token|id_token|authorization_code|authorization code)\b/gi;
const ASSIGNED_SECRET = /\b(code|client_secret|access_token|refresh_token|id_token|assertion|state)\s*[:=]\s*[^\s,;]+/gi;
const JWT_LIKE = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*\b/g;
const BEARER_LIKE = /\bBearer\s+\S+/gi;
const QUERY_SECRET = /[?&](code|client_secret|access_token|refresh_token|id_token|assertion|state)=[^&\s]*/gi;

export type MicrosoftTokenExchangeFailureDiagnostic = {
  layer: MicrosoftTokenExchangeFailureLayer;
  httpStatus: number | null;
  oauthError: string | null;
  aadstsCodes: string[];
  errorDescriptionSanitized: string | null;
  correlationId: string | null;
  traceId: string | null;
  timestamp: string | null;
  msRequestId: string | null;
  endpoint: typeof MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION;
  errorName: string | null;
};

export class MicrosoftTokenExchangeFailure extends Error {
  readonly diagnostic: MicrosoftTokenExchangeFailureDiagnostic;

  constructor(reason: string, diagnostic: MicrosoftTokenExchangeFailureDiagnostic) {
    super(reason);
    this.name = "MicrosoftTokenExchangeFailure";
    this.diagnostic = diagnostic;
  }
}

function looksLikeSecretMaterial(value: string): boolean {
  return /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\./.test(value)
    || /Bearer\s+\S+/i.test(value)
    || /client_secret|access_token|refresh_token|id_token/i.test(value);
}

function safeShortToken(value: unknown, max = 128): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  if (looksLikeSecretMaterial(trimmed)) return null;
  return trimmed;
}

function safeOauthError(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9_:\-]{1,80}$/.test(trimmed) ? trimmed : null;
}

function aadstsCodesFrom(body: Record<string, unknown>, description: string | null): string[] {
  const found = new Set<string>();
  const codes = body.error_codes;
  if (Array.isArray(codes)) {
    for (const code of codes) {
      if (typeof code === "number" && Number.isInteger(code) && code >= 1000 && code <= 99_999_999) {
        found.add(`AADSTS${code}`);
      } else if (typeof code === "string" && /^AADSTS\d{4,8}$/i.test(code.trim())) {
        found.add(code.trim().toUpperCase());
      } else if (typeof code === "string" && /^\d{4,8}$/.test(code.trim())) {
        found.add(`AADSTS${code.trim()}`);
      }
    }
  }
  const haystack = `${typeof body.error_description === "string" ? body.error_description : ""} ${description ?? ""}`;
  for (const match of haystack.match(/AADSTS\d{4,8}/gi) ?? []) found.add(match.toUpperCase());
  return [...found];
}

function headerValue(headers: Headers, name: string): string | null {
  return safeShortToken(headers.get(name));
}

function safeErrorName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[A-Za-z][A-Za-z0-9._]{0,80}$/.test(trimmed)) return null;
  if (looksLikeSecretMaterial(trimmed)) return null;
  return trimmed;
}

function tokenExchangeDiagnostic(
  layer: MicrosoftTokenExchangeFailureLayer,
  extras: Partial<Omit<MicrosoftTokenExchangeFailureDiagnostic, "layer" | "endpoint">> = {},
): MicrosoftTokenExchangeFailureDiagnostic {
  return {
    layer,
    httpStatus: extras.httpStatus ?? null,
    oauthError: extras.oauthError ?? null,
    aadstsCodes: extras.aadstsCodes ?? [],
    errorDescriptionSanitized: extras.errorDescriptionSanitized ?? null,
    correlationId: extras.correlationId ?? null,
    traceId: extras.traceId ?? null,
    timestamp: extras.timestamp ?? new Date().toISOString(),
    msRequestId: extras.msRequestId ?? null,
    endpoint: MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION,
    errorName: extras.errorName ?? null,
  };
}

export function sanitizeMicrosoftTokenErrorDescription(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  let sanitized = value.replace(QUERY_SECRET, "[REDACTED]");
  sanitized = sanitized.replace(ASSIGNED_SECRET, "$1=[REDACTED]");
  sanitized = sanitized.replace(JWT_LIKE, "[REDACTED_JWT]");
  sanitized = sanitized.replace(BEARER_LIKE, "Bearer [REDACTED]");
  sanitized = sanitized.replace(SECRET_TEXT_MARKERS, "[REDACTED_FIELD]");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  if (!sanitized) return null;
  return sanitized.length > 400 ? `${sanitized.slice(0, 400)}...` : sanitized;
}

export function parseMicrosoftTokenEndpointFailure(
  response: Pick<Response, "status" | "headers">,
  bodyText: string,
): MicrosoftTokenExchangeFailureDiagnostic {
  let body: Record<string, unknown> = {};
  const trimmed = bodyText.trim();
  if (trimmed.startsWith("{") && trimmed.length < 16_384) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const description = typeof body.error_description === "string" ? body.error_description : null;
  const correlationId =
    safeShortToken(body.correlation_id) ??
    headerValue(response.headers, "x-ms-correlation-request-id") ??
    headerValue(response.headers, "x-ms-ests-correlation-id");
  const traceId = safeShortToken(body.trace_id);
  return tokenExchangeDiagnostic("MICROSOFT_HTTP_ERROR", {
    httpStatus: response.status,
    oauthError: safeOauthError(body.error),
    aadstsCodes: aadstsCodesFrom(body, description),
    errorDescriptionSanitized: sanitizeMicrosoftTokenErrorDescription(description),
    correlationId,
    traceId,
    timestamp: safeShortToken(body.timestamp, 64),
    msRequestId: headerValue(response.headers, "x-ms-request-id") ?? headerValue(response.headers, "client-request-id"),
    errorName: "HttpError",
  });
}

export function microsoftTokenExchangeFailureDiagnosticPath(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.EOS_M365_TOKEN_DIAGNOSTIC_PATH?.trim();
  if (configured) return configured;
  return join(tmpdir(), EOS_M365_TOKEN_EXCHANGE_FAILURE_FILENAME);
}

export function emitMicrosoftTokenExchangeFailure(
  diagnostic: MicrosoftTokenExchangeFailureDiagnostic,
  env: NodeJS.ProcessEnv = process.env,
): MicrosoftTokenExchangeFailureDiagnostic {
  const payload = {
    event: EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT,
    layer: diagnostic.layer,
    endpoint: diagnostic.endpoint,
    errorName: diagnostic.errorName,
    httpStatus: diagnostic.httpStatus,
    oauthError: diagnostic.oauthError,
    aadstsCodes: diagnostic.aadstsCodes,
    errorDescriptionSanitized: diagnostic.errorDescriptionSanitized,
    correlationId: diagnostic.correlationId,
    traceId: diagnostic.traceId,
    timestamp: diagnostic.timestamp,
    msRequestId: diagnostic.msRequestId,
  };
  console.error(JSON.stringify(payload));
  const explicitPath = env.EOS_M365_TOKEN_DIAGNOSTIC_PATH?.trim();
  if (explicitPath || env.RTB_REVIEW_RUNTIME?.trim() === "staging") {
    try {
      writeFileSync(microsoftTokenExchangeFailureDiagnosticPath(env), JSON.stringify(payload), "utf8");
    } catch {
      // Diagnostic persistence must never change fail-closed token handling.
    }
  }
  return diagnostic;
}

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
  fetchImpl?: typeof fetch;
  onFailureDiagnostic?: (diagnostic: MicrosoftTokenExchangeFailureDiagnostic) => void;
}): Promise<{ identity: TrustedMicrosoftIdentity; tokenPresent: true }> {
  const env = input.env ?? process.env;
  const app = rtbMicrosoftAppConfig(env);
  const secret = env.RTB_M365_CLIENT_SECRET?.trim();
  if (!app.configured || !secret) throw new Error("RTB_APP_NOT_CONFIGURED");
  if (!isAllowedGraphUrl(LOGIN_TOKEN)) throw new Error("SSRF_BLOCKED");
  const fetchImpl = input.fetchImpl ?? fetch;
  const fail = (reason: string, diagnostic: MicrosoftTokenExchangeFailureDiagnostic): never => {
    emitMicrosoftTokenExchangeFailure(diagnostic, env);
    input.onFailureDiagnostic?.(diagnostic);
    throw new MicrosoftTokenExchangeFailure(reason, diagnostic);
  };
  let response: Response;
  try {
    response = await fetchImpl(LOGIN_TOKEN, {
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
  } catch (error) {
    return fail("token_network_exception", tokenExchangeDiagnostic("NETWORK_EXCEPTION", {
      errorName: error instanceof Error ? safeErrorName(error.name) : "Error",
      errorDescriptionSanitized: sanitizeMicrosoftTokenErrorDescription(
        error instanceof Error ? error.message : "network_exception",
      ) ?? "network_exception",
    }));
  }
  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "";
    }
    const diagnostic = parseMicrosoftTokenEndpointFailure(response, bodyText);
    const reason = response.status === 401 || response.status === 403 ? "token_rejected" : `token_http_${response.status}`;
    return fail(reason, diagnostic);
  }
  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    return fail("token_response_invalid_json", tokenExchangeDiagnostic("TOKEN_RESPONSE_PARSE_ERROR", {
      httpStatus: response.status,
      errorName: error instanceof Error ? safeErrorName(error.name) : "SyntaxError",
      errorDescriptionSanitized: "invalid_json",
    }));
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return fail("token_response_invalid_json", tokenExchangeDiagnostic("TOKEN_RESPONSE_PARSE_ERROR", {
      httpStatus: response.status,
      errorName: "TokenResponseParseError",
      errorDescriptionSanitized: "invalid_json",
    }));
  }
  const idToken = (json as { id_token?: unknown }).id_token;
  if (typeof idToken !== "string" || !idToken.trim()) {
    return fail("microsoft_identity_missing", tokenExchangeDiagnostic("TOKEN_RESPONSE_PARSE_ERROR", {
      httpStatus: response.status,
      errorName: "TokenResponseParseError",
      errorDescriptionSanitized: "id_token_missing",
    }));
  }
  try {
    return { identity: decodeMicrosoftIdToken(idToken), tokenPresent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "microsoft_tenant_missing" || message === "microsoft_user_missing") {
      return fail("microsoft_tenant_missing", tokenExchangeDiagnostic("POST_TOKEN_VALIDATION_ERROR", {
        httpStatus: response.status,
        errorName: "MicrosoftIdTokenClaimsError",
        errorDescriptionSanitized: "required_claim_missing",
      }));
    }
    return fail("microsoft_identity_missing", tokenExchangeDiagnostic("TOKEN_RESPONSE_PARSE_ERROR", {
      httpStatus: response.status,
      errorName: error instanceof Error ? safeErrorName(error.name) : "TokenResponseParseError",
      errorDescriptionSanitized: "id_token_malformed",
    }));
  }
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
