import { describe, expect, it } from "vitest";
import {
  BOS_BROWSER_FIXTURE_SETS_LIVE_CERTIFICATION,
  BOS_OAUTH_CALLBACK_PATH,
  BOS_OAUTH_FIXTURE_CODES,
  assertOauthRedirectAllowed,
  buildBosFixtureAuthorizeUrl,
  interpretOauthCallbackInput,
  signBosOAuthState,
  verifyBosOAuthState,
} from "./oauth-fixture";
import {
  XERO_LIVE_CERTIFICATION_EXECUTED,
  M365_LIVE_CERTIFICATION_EXECUTED,
  HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
  bosLiveXeroCertified,
  bosLiveMicrosoft365Certified,
  bosLiveHubSpotCertified,
} from "../release";

const CLAIMS = {
  v: 1 as const,
  nonce: "nonce-1",
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  connectorId: "xero" as const,
  userId: "33333333-3333-4333-8333-333333333333",
  exp: Date.now() + 60_000,
  redirectUri: "http://127.0.0.1:3000/api/business/integrations/oauth/callback",
  fixture: true as const,
};

describe("browser fixture OAuth boundary", () => {
  it("signs CSRF state, allowlists the callback, and never includes secrets", () => {
    const state = signBosOAuthState(CLAIMS);
    expect(state).not.toMatch(/client_secret|refresh_token|access_token|secret_id/i);
    const verified = verifyBosOAuthState(state);
    expect(verified.tenantId).toBe(CLAIMS.tenantId);
    expect(verified.connectorId).toBe("xero");
    expect(assertOauthRedirectAllowed(CLAIMS.redirectUri).pathname).toBe(BOS_OAUTH_CALLBACK_PATH);
    expect(() => assertOauthRedirectAllowed("https://evil.example/callback")).toThrow("oauth_redirect_forbidden");
    const authorize = buildBosFixtureAuthorizeUrl({
      origin: "http://127.0.0.1:3000",
      connectorId: "xero",
      state,
    });
    expect(authorize).toContain("/business/integrations/oauth/fixture");
    expect(authorize).not.toContain("identity.xero.com");
    expect(authorize).not.toContain("login.microsoftonline.com");
    expect(authorize).not.toContain("app.hubspot.com");
    expect(authorize).not.toMatch(/client_secret/);
  });

  it("rejects expired and invalid state", () => {
    const expired = signBosOAuthState({ ...CLAIMS, exp: Date.now() - 1 });
    expect(() => verifyBosOAuthState(expired)).toThrow("oauth_state_expired");
    expect(() => verifyBosOAuthState("not-valid")).toThrow("oauth_state_invalid");
    expect(() => verifyBosOAuthState(`${stateTamper(signBosOAuthState(CLAIMS))}`)).toThrow("oauth_state_invalid");
  });

  it("maps fixture callback codes without minting tokens", () => {
    expect(interpretOauthCallbackInput({ code: BOS_OAUTH_FIXTURE_CODES.success })).toBe("success");
    expect(interpretOauthCallbackInput({ error: "access_denied" })).toBe("denied");
    expect(interpretOauthCallbackInput({ code: null })).toBe("missing_code");
    expect(interpretOauthCallbackInput({ code: BOS_OAUTH_FIXTURE_CODES.error })).toBe("provider_error");
    expect(BOS_BROWSER_FIXTURE_SETS_LIVE_CERTIFICATION).toBe(false);
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(M365_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(HUBSPOT_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
  });
});

function stateTamper(state: string): string {
  const [body, sig] = state.split(".");
  return `${body}.${sig?.slice(0, -2)}aa`;
}
