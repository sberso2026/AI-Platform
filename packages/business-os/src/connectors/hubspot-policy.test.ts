import { describe, expect, it } from "vitest";
import {
  HUBSPOT_ALLOWED_CAPABILITIES,
  HUBSPOT_ALLOWED_OAUTH_SCOPES,
  HUBSPOT_CAPABILITY_CLASS,
  HUBSPOT_DENIED_OAUTH_SCOPES,
  HUBSPOT_MUTATION_OPERATIONS,
  HUBSPOT_CURRENT_OAUTH_CONTRACT_VERIFIED,
  HUBSPOT_OAUTH_API_VERSION,
  HUBSPOT_OAUTH_REVOKE_PATH,
  HUBSPOT_OAUTH_TOKEN_PATH,
  HUBSPOT_SCOPE_MINIMISATION_PASS,
  HUBSPOT_THREAT_MODEL,
  assertHubSpotCapabilityAllowed,
  assertHubSpotScopeAllowed,
  buildHubSpotAuthorizeUrl,
  hubspotConnectionState,
  hubspotCrmPathAllowed,
  hubspotLegacyOauthPath,
  hubspotOauthIdentityPostAllowed,
  hubspotOauthRevokePathAllowed,
} from "./hubspot-policy";

describe("HubSpot capability allowlist", () => {
  it("allows only current BOS CRM reads and denies write scopes", () => {
    expect(HUBSPOT_ALLOWED_CAPABILITIES).toEqual(["crm.contacts.read", "crm.companies.read", "crm.deals.read"]);
    expect(HUBSPOT_CAPABILITY_CLASS["crm.contacts.read"]).toBe("required_now");
    expect(HUBSPOT_CAPABILITY_CLASS["crm.pipelines.read"]).toBe("future");
    expect(HUBSPOT_CAPABILITY_CLASS["crm.owners.read"]).toBe("future");
    expect(HUBSPOT_ALLOWED_OAUTH_SCOPES).toEqual([
      "oauth",
      "crm.objects.contacts.read",
      "crm.objects.companies.read",
      "crm.objects.deals.read",
    ]);
    expect(HUBSPOT_SCOPE_MINIMISATION_PASS).toBe(true);
    expect(HUBSPOT_CURRENT_OAUTH_CONTRACT_VERIFIED).toBe(true);
    expect(HUBSPOT_OAUTH_API_VERSION).toBe("2026-03");
    expect(HUBSPOT_OAUTH_TOKEN_PATH).toBe("/oauth/2026-03/token");
    expect(HUBSPOT_OAUTH_REVOKE_PATH).toBe("/oauth/2026-03/token/revoke");
    expect(hubspotOauthIdentityPostAllowed("/oauth/2026-03/token")).toBe(true);
    expect(hubspotOauthRevokePathAllowed("/oauth/2026-03/token/revoke")).toBe(true);
    expect(hubspotOauthIdentityPostAllowed("/crm/v3/objects/contacts")).toBe(false);
    expect(hubspotLegacyOauthPath("/oauth/v1/token")).toBe(true);
    expect(hubspotLegacyOauthPath("/oauth/v1/refresh-tokens/abc")).toBe(true);
    expect(hubspotLegacyOauthPath("/oauth/v3/refresh-tokens/abc")).toBe(true);
    expect(hubspotLegacyOauthPath("/oauth/v3/token")).toBe(true);
    expect(hubspotOauthRevokePathAllowed("/oauth/v1/refresh-tokens/abc")).toBe(false);
    expect(hubspotOauthRevokePathAllowed("/oauth/v3/refresh-tokens/abc")).toBe(false);
    expect(HUBSPOT_DENIED_OAUTH_SCOPES).toContain("crm.objects.contacts.write");
    expect(HUBSPOT_DENIED_OAUTH_SCOPES).toContain("crm.objects.companies.write");
    expect(HUBSPOT_DENIED_OAUTH_SCOPES).toContain("crm.objects.deals.write");
    expect(HUBSPOT_DENIED_OAUTH_SCOPES).toContain("automation");
    expect(HUBSPOT_MUTATION_OPERATIONS).toContain("createContact");
    expect(() => assertHubSpotCapabilityAllowed("crm.contacts.write")).toThrow("hubspot_capability_forbidden");
    expect(() => assertHubSpotScopeAllowed("crm.objects.contacts.write")).toThrow("hubspot_scope_forbidden");
    expect(hubspotCrmPathAllowed("/crm/v3/objects/contacts")).toBe(true);
    expect(hubspotCrmPathAllowed("/crm/v3/owners")).toBe(false);
    expect(hubspotCrmPathAllowed("/automation/v4/workflows")).toBe(false);
    expect(HUBSPOT_THREAT_MODEL).toHaveLength(22);
    const authorize = buildHubSpotAuthorizeUrl({
      clientId: "public-client-id",
      redirectUri: "http://localhost:8787/callback",
      state: "csrf-state",
    });
    expect(authorize).toContain("app.hubspot.com/oauth/authorize");
    expect(authorize).toContain("crm.objects.contacts.read");
    expect(authorize).not.toMatch(/client_secret|refresh_token|password|hapikey|access_token/i);
    expect(
      hubspotConnectionState({ health: "revoked", effectiveMode: "live", secretId: null, errorCategory: "revoked" }),
    ).toBe("DISCONNECTED");
    expect(
      hubspotConnectionState({
        health: "unavailable",
        effectiveMode: "live",
        secretId: "sec",
        errorCategory: "hubspot_unauthorized",
      }),
    ).toBe("REAUTH_REQUIRED");
  });
});
