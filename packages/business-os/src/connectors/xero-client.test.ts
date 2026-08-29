import { describe, expect, it } from "vitest";
import { XeroProviderClient, type XeroFetch } from "./xero-client";
import { XeroConnectorError } from "./xero-errors";
import { assertConnectorUrl } from "./security";

const SECRETS = {
  clientId: "client",
  clientSecret: "super-secret",
  refreshToken: "refresh-secret",
  tenantId: "xero-org-expected",
  secretId: "sec_xero",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function createFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>): {
  fetch: XeroFetch;
  calls: Array<{ url: string; method: string }>;
} {
  const calls: Array<{ url: string; method: string }> = [];
  return {
    calls,
    fetch: async (input, init) => {
      const url = String(input);
      calls.push({ url, method: String(init?.method ?? "GET") });
      return handler(url, init);
    },
  };
}

function tokenThen(handler: (url: string) => Response): XeroFetch {
  return async (input, init) => {
    const url = String(input);
    if (url.includes("/connect/token")) {
      return jsonResponse(200, { access_token: "access-token-live-value", token_type: "Bearer" });
    }
    return handler(url);
  };
}

describe("Xero provider client boundary", () => {
  it("obtains an access token internally and never returns it", async () => {
    const { fetch, calls } = createFetch((url) => {
      if (url.includes("/connect/token")) return jsonResponse(200, { access_token: "access-token-live-value" });
      if (url.includes("/connections")) return jsonResponse(200, [{ tenantId: "xero-org-expected" }]);
      if (url.includes("/Organisation")) {
        return jsonResponse(200, { Organisations: [{ OrganisationID: "xero-org-expected", Name: "Demo", IsDemoCompany: true }] });
      }
      return jsonResponse(404, {});
    });
    const client = new XeroProviderClient({ fetch, secrets: SECRETS, expectedProviderOrgId: "xero-org-expected" });
    const org = await client.getOrganisation();
    expect(org.externalSourceId).toBe("xero-org-expected");
    expect(JSON.stringify(org)).not.toContain("access-token-live-value");
    expect(JSON.stringify(org)).not.toContain("refresh-secret");
    expect(JSON.stringify(org)).not.toContain("super-secret");
    expect(calls.some((call) => call.url.includes("identity.xero.com/connect/token") && call.method === "POST")).toBe(
      true,
    );
    expect(client.boundProviderOrgId()).toBe("xero-org-expected");
  });

  it("rejects the wrong provider org before accounting reads", async () => {
    const client = new XeroProviderClient({
      fetch: tokenThen(() => jsonResponse(200, [{ tenantId: "other-org" }])),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(client.getOrganisation()).rejects.toThrow("xero_org_mismatch");
  });

  it("rejects ambiguous multi-org connections", async () => {
    const client = new XeroProviderClient({
      fetch: tokenThen(() =>
        jsonResponse(200, [
          { tenantId: "xero-org-expected" },
          { tenantId: "xero-org-expected" },
        ]),
      ),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(client.getOrganisation()).rejects.toThrow("xero_org_ambiguous");
  });

  it("blocks mutation methods and generic request before HTTP", async () => {
    let fetched = false;
    const client = new XeroProviderClient({
      fetch: async () => {
        fetched = true;
        return jsonResponse(200, {});
      },
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    expect(() => client.createInvoice()).toThrow("connector_write_forbidden");
    expect(() => client.createPayment()).toThrow("connector_write_forbidden");
    expect(() => client.request("POST", "https://api.xero.com/api.xro/2.0/Invoices")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(fetched).toBe(false);
  });

  it("maps 401/403/429/5xx and timeout fail-closed", async () => {
    const unauthorized = new XeroProviderClient({
      fetch: async (input) =>
        String(input).includes("/connect/token") ? jsonResponse(401, { error: "invalid_grant" }) : jsonResponse(500, {}),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(unauthorized.getOrganisation()).rejects.toMatchObject({ category: "xero_unauthorized" });

    const forbidden = new XeroProviderClient({
      fetch: tokenThen(() => jsonResponse(403, {})),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(forbidden.getOrganisation()).rejects.toMatchObject({ category: "xero_forbidden" });

    const limited = new XeroProviderClient({
      fetch: tokenThen(() => jsonResponse(429, {})),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(limited.getOrganisation()).rejects.toMatchObject({ category: "xero_rate_limited" });

    const down = new XeroProviderClient({
      fetch: tokenThen(() => jsonResponse(503, {})),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(down.getOrganisation()).rejects.toMatchObject({ category: "xero_provider_error" });

    const timeout = new XeroProviderClient({
      fetch: async () => {
        throw new Error("network");
      },
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(timeout.getOrganisation()).rejects.toMatchObject({ category: "xero_timeout" });
  });

  it("allows identity.xero.com for token refresh and not arbitrary hosts", () => {
    expect(assertConnectorUrl("xero", "https://identity.xero.com/connect/token").hostname).toBe("identity.xero.com");
    expect(() => assertConnectorUrl("xero", "https://evil.example/connect/token")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
  });

  it("rejects schema-invalid provider payloads", async () => {
    const client = new XeroProviderClient({
      fetch: tokenThen((url) => {
        if (url.includes("/connections")) return jsonResponse(200, [{ tenantId: "xero-org-expected" }]);
        return jsonResponse(200, { Organisations: [{}] });
      }),
      secrets: SECRETS,
      expectedProviderOrgId: "xero-org-expected",
    });
    await expect(client.getOrganisation()).rejects.toBeInstanceOf(XeroConnectorError);
  });
});
