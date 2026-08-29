import { describe, expect, it } from "vitest";
import { HubSpotProviderClient, type HubSpotFetch } from "./hubspot-client";
import { HubSpotConnectorError } from "./hubspot-errors";
import { assertConnectorUrl } from "./security";

const PORTAL = "12345678";
const OTHER = "87654321";

const SECRETS = {
  clientId: "client",
  clientSecret: "super-secret",
  refreshToken: "refresh-secret",
  portalId: PORTAL,
  secretId: "sec_hubspot",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function tokenThen(handler: (url: string, init?: RequestInit) => Response): HubSpotFetch {
  return async (input, init) => {
    const url = String(input);
    if (url.includes("/oauth/v3/token")) {
      return jsonResponse(200, {
        access_token: "hs-access-token-value",
        token_type: "bearer",
        hub_id: Number(PORTAL),
        scopes: "oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read",
      });
    }
    return handler(url, init);
  };
}

describe("HubSpot CRM client boundary", () => {
  it("obtains an access token internally and never returns it", async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const client = new HubSpotProviderClient({
      fetch: async (input, init) => {
        const url = String(input);
        calls.push({ url, method: String(init?.method ?? "GET") });
        if (url.includes("/oauth/v3/token")) {
          expect(String(init?.body ?? "")).not.toContain("password");
          expect(String(init?.body ?? "")).not.toContain("hapikey");
          return jsonResponse(200, {
            access_token: "hs-access-token-value",
            hub_id: Number(PORTAL),
          });
        }
        if (url.includes("/account-info/v3/details")) {
          return jsonResponse(200, { portalId: Number(PORTAL) });
        }
        if (url.includes("/crm/v3/objects/contacts")) {
          return jsonResponse(200, {
            results: [
              {
                id: "1",
                properties: { firstname: "Jordan", lastname: "Buyer", company: "Acme", email: "jordan@example.com" },
              },
            ],
          });
        }
        return jsonResponse(404, {});
      },
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    const identity = await client.getAccountIdentity();
    const contacts = await client.getContactsReadOnly();
    expect(identity.externalSourceId).toBe(PORTAL);
    expect(contacts[0]?.payload.name).toBe("Jordan Buyer");
    expect(JSON.stringify({ identity, contacts })).not.toContain("refresh-secret");
    expect(JSON.stringify({ identity, contacts })).not.toContain("super-secret");
    expect(JSON.stringify({ identity, contacts })).not.toContain("hs-access-token-value");
    expect(JSON.stringify(contacts)).not.toContain("jordan@example.com");
    expect(calls.some((call) => call.url.includes("api.hubapi.com/oauth/v3/token") && call.method === "POST")).toBe(true);
    expect(calls.some((call) => call.url.includes("/account-info/v3/details") && call.method === "GET")).toBe(true);
    expect(client.boundProviderOrgId()).toBe(PORTAL);
  });

  it("rejects the wrong HubSpot portal before CRM reads", async () => {
    let fetched = false;
    const client = new HubSpotProviderClient({
      fetch: async () => {
        fetched = true;
        return jsonResponse(200, { portalId: Number(PORTAL) });
      },
      secrets: { ...SECRETS, portalId: OTHER },
      expectedProviderOrgId: PORTAL,
    });
    await expect(client.getAccountIdentity()).rejects.toThrow("hubspot_portal_mismatch");
    expect(fetched).toBe(false);
  });

  it("rejects a non-numeric company-name portal binding", async () => {
    const client = new HubSpotProviderClient({
      fetch: tokenThen(() => jsonResponse(200, {})),
      secrets: { ...SECRETS, portalId: "Acme Marketing" },
      expectedProviderOrgId: "Acme Marketing",
    });
    await expect(client.getAccountIdentity()).rejects.toThrow("hubspot_portal_mismatch");
  });

  it("blocks CRM mutations, workflow/email actions, and generic HubSpot request before HTTP", async () => {
    let fetched = false;
    const client = new HubSpotProviderClient({
      fetch: async () => {
        fetched = true;
        return jsonResponse(200, {});
      },
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    expect(() => client.createContact()).toThrow("connector_write_forbidden");
    expect(() => client.updateCompany()).toThrow("connector_write_forbidden");
    expect(() => client.deleteDeal()).toThrow("connector_write_forbidden");
    expect(() => client.changePipelineStage()).toThrow("connector_write_forbidden");
    expect(() => client.sendEmail()).toThrow("connector_write_forbidden");
    expect(() => client.enrolWorkflow()).toThrow("connector_write_forbidden");
    expect(() => client.hubspotRequest("POST", "https://api.hubapi.com/crm/v3/objects/contacts")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(fetched).toBe(false);
  });

  it("maps 401/403/429/5xx and timeout fail-closed", async () => {
    const unauthorized = new HubSpotProviderClient({
      fetch: async (input) =>
        String(input).includes("/oauth/v3/token") ? jsonResponse(401, { error: "invalid_grant" }) : jsonResponse(500, {}),
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(unauthorized.getAccountIdentity()).rejects.toMatchObject({ category: "hubspot_unauthorized" });

    const forbidden = new HubSpotProviderClient({
      fetch: tokenThen(() => jsonResponse(403, {})),
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(forbidden.getAccountIdentity()).rejects.toMatchObject({ category: "hubspot_forbidden" });

    const limited = new HubSpotProviderClient({
      fetch: tokenThen(() => jsonResponse(429, {})),
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(limited.getAccountIdentity()).rejects.toMatchObject({ category: "hubspot_rate_limited" });

    const down = new HubSpotProviderClient({
      fetch: tokenThen(() => jsonResponse(503, {})),
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(down.getAccountIdentity()).rejects.toMatchObject({ category: "hubspot_provider_error" });

    const timeout = new HubSpotProviderClient({
      fetch: async () => {
        throw new Error("network");
      },
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(timeout.getAccountIdentity()).rejects.toMatchObject({ category: "hubspot_timeout" });
  });

  it("allows api.hubapi.com and not arbitrary hosts", () => {
    expect(assertConnectorUrl("hubspot", "https://api.hubapi.com/crm/v3/objects/contacts").hostname).toBe("api.hubapi.com");
    expect(() => assertConnectorUrl("hubspot", "https://app.hubspot.com/oauth/authorize")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(() => assertConnectorUrl("hubspot", "https://evil.example/crm/v3/objects/contacts")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
  });

  it("rejects schema-invalid HubSpot payloads", async () => {
    const client = new HubSpotProviderClient({
      fetch: tokenThen(() => jsonResponse(200, {})),
      secrets: SECRETS,
      expectedProviderOrgId: PORTAL,
    });
    await expect(client.getAccountIdentity()).rejects.toBeInstanceOf(HubSpotConnectorError);
  });
});
