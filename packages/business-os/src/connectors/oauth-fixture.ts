/**
 * Browser-test fixture OAuth boundary. Never calls live provider identity endpoints
 * and never issues real provider tokens. Distinct from live provider certification.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { BosOauthConnectorId } from "./ui-state";
import { isBosOauthConnector } from "./ui-state";

export const BOS_BROWSER_OAUTH_FIXTURE_MODE = "browser_fixture" as const;
export const BOS_BROWSER_FIXTURE_SETS_LIVE_CERTIFICATION = false as const;
export const BOS_FIXTURE_SECRET_REF = "bos_fixture_secret_ref" as const;
export const BOS_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const BOS_OAUTH_CALLBACK_PATH = "/api/business/integrations/oauth/callback" as const;
export const BOS_OAUTH_FIXTURE_PATH = "/business/integrations/oauth/fixture" as const;

export const BOS_OAUTH_FIXTURE_CODES = {
  success: "bos_fixture_ok",
  denied: "bos_fixture_denied",
  error: "bos_fixture_error",
  wrong_org: "bos_fixture_wrong_org",
  expired_placeholder: "bos_fixture_expired",
} as const;

export const BOS_FIXTURE_ORG = {
  xero: {
    id: "bos-fixture-xero-org",
    name: "BOS Fixture Accounting Org With An Exceptionally Long Registered Name Pty Ltd",
  },
  microsoft_365: {
    id: "bos-fixture-m365-directory",
    name: "BOS Fixture Directory",
  },
  hubspot: {
    id: "bos-fixture-hubspot-portal",
    name: "BOS Fixture Portal 000000",
  },
} as const;

export type BosOAuthStateClaims = {
  v: 1;
  nonce: string;
  tenantId: string;
  workspaceId: string;
  connectorId: BosOauthConnectorId;
  userId: string;
  exp: number;
  redirectUri: string;
  fixture: true;
};

export type BosOauthFixtureOutcome =
  | "success"
  | "denied"
  | "provider_error"
  | "missing_code"
  | "wrong_org"
  | "reauth_required"
  | "provider_unavailable"
  | "permission_denied"
  | "rate_limit"
  | "timeout"
  | "schema_invalid"
  | "wrong_provider_org"
  | "installation_revoked"
  | "sync_error";

function stateSecret(): string {
  return process.env.BOS_OAUTH_STATE_SECRET?.trim() || "bos16-a8-fixture-oauth-state";
}

export function signBosOAuthState(claims: BosOAuthStateClaims): string {
  const body = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function decodeBosOAuthState(state: string): BosOAuthStateClaims {
  const parts = state.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error("oauth_state_invalid");
  const expected = createHmac("sha256", stateSecret()).update(parts[0]).digest("base64url");
  const actual = Buffer.from(parts[1]);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    throw new Error("oauth_state_invalid");
  }
  let claims: BosOAuthStateClaims;
  try {
    claims = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as BosOAuthStateClaims;
  } catch {
    throw new Error("oauth_state_invalid");
  }
  if (claims.v !== 1 || claims.fixture !== true || !isBosOauthConnector(claims.connectorId)) {
    throw new Error("oauth_state_invalid");
  }
  return claims;
}

export function verifyBosOAuthState(state: string, now = Date.now()): BosOAuthStateClaims {
  const claims = decodeBosOAuthState(state);
  if (claims.exp < now) throw new Error("oauth_state_expired");
  assertOauthRedirectAllowed(claims.redirectUri);
  return claims;
}

export function assertOauthRedirectAllowed(redirectUri: string): URL {
  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    throw new Error("oauth_redirect_forbidden");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("oauth_redirect_forbidden");
  if (url.pathname !== BOS_OAUTH_CALLBACK_PATH) throw new Error("oauth_redirect_forbidden");
  if (url.search || url.hash) throw new Error("oauth_redirect_forbidden");
  return url;
}

export function buildBosFixtureAuthorizeUrl(input: {
  origin: string;
  connectorId: BosOauthConnectorId;
  state: string;
}): string {
  const origin = new URL(input.origin).origin;
  const url = new URL(BOS_OAUTH_FIXTURE_PATH, `${origin}/`);
  url.searchParams.set("connector", input.connectorId);
  url.searchParams.set("state", input.state);
  url.searchParams.set("mode", BOS_BROWSER_OAUTH_FIXTURE_MODE);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export function fixtureCallbackUrl(origin: string, input: { state: string; code?: string; error?: string }): string {
  const url = new URL(BOS_OAUTH_CALLBACK_PATH, `${new URL(origin).origin}/`);
  url.searchParams.set("state", input.state);
  if (input.code) url.searchParams.set("code", input.code);
  if (input.error) url.searchParams.set("error", input.error);
  return url.toString();
}

export function interpretOauthCallbackInput(input: { code?: string | null; error?: string | null }): BosOauthFixtureOutcome {
  if (input.error === "access_denied" || input.code === BOS_OAUTH_FIXTURE_CODES.denied) return "denied";
  if (input.error) return "provider_error";
  if (!input.code) return "missing_code";
  if (input.code === BOS_OAUTH_FIXTURE_CODES.error) return "provider_error";
  if (input.code === BOS_OAUTH_FIXTURE_CODES.wrong_org) return "wrong_org";
  if (input.code === BOS_OAUTH_FIXTURE_CODES.success) return "success";
  throw new Error("oauth_provider_error");
}

export function fixtureSecretId(): string {
  return BOS_FIXTURE_SECRET_REF;
}
