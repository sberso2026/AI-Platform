import { describe, expect, it } from "vitest";
import { Microsoft365ProviderClient, type Ms365Fetch } from "./m365-client";
import { Ms365ConnectorError } from "./m365-errors";
import { assertConnectorUrl } from "./security";

const TENANT = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

const SECRETS = {
  clientId: "client",
  clientSecret: "super-secret",
  refreshToken: "refresh-secret",
  tenantId: TENANT,
  secretId: "sec_m365",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fakeAccessToken(tid: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ tid })).toString("base64url");
  return `${header}.${payload}.sig`;
}

function tokenThen(handler: (url: string, init?: RequestInit) => Response): Ms365Fetch {
  return async (input, init) => {
    const url = String(input);
    if (url.includes("/oauth2/v2.0/token")) {
      return jsonResponse(200, { access_token: fakeAccessToken(TENANT), token_type: "Bearer", scope: "User.Read Calendars.Read Files.Read offline_access" });
    }
    return handler(url, init);
  };
}

describe("Microsoft 365 Graph client boundary", () => {
  it("obtains an access token internally and never returns it", async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const client = new Microsoft365ProviderClient({
      fetch: async (input, init) => {
        const url = String(input);
        calls.push({ url, method: String(init?.method ?? "GET") });
        if (url.includes("/oauth2/v2.0/token")) {
          expect(String(init?.body ?? "")).not.toContain("password");
          return jsonResponse(200, { access_token: fakeAccessToken(TENANT), token_type: "Bearer" });
        }
        if (url.includes("/v1.0/me") && !url.includes("/events") && !url.includes("/drive")) {
          return jsonResponse(200, { id: "user-1", displayName: "Pat", userPrincipalName: "pat@contoso.test" });
        }
        return jsonResponse(404, {});
      },
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    const user = await client.getSignedInUser();
    expect(user.externalSourceId).toBe("user-1");
    expect(JSON.stringify(user)).not.toContain("refresh-secret");
    expect(JSON.stringify(user)).not.toContain("super-secret");
    expect(JSON.stringify(user)).not.toContain(fakeAccessToken(TENANT));
    expect(calls.some((call) => call.url.includes("login.microsoftonline.com") && call.method === "POST")).toBe(true);
    expect(calls.some((call) => call.url.includes("graph.microsoft.com/v1.0/me") && call.method === "GET")).toBe(true);
    expect(client.boundProviderOrgId()).toBe(TENANT);
  });

  it("rejects the wrong Microsoft tenant before Graph reads", async () => {
    const client = new Microsoft365ProviderClient({
      fetch: tokenThen(() => jsonResponse(200, { id: "user-1" })),
      secrets: { ...SECRETS, tenantId: OTHER },
      expectedProviderOrgId: TENANT,
    });
    await expect(client.getSignedInUser()).rejects.toThrow("m365_tenant_mismatch");
  });

  it("blocks email, file, and calendar mutations and generic Graph request before HTTP", async () => {
    let fetched = false;
    const client = new Microsoft365ProviderClient({
      fetch: async () => {
        fetched = true;
        return jsonResponse(200, {});
      },
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    expect(() => client.sendMail()).toThrow("connector_write_forbidden");
    expect(() => client.uploadFile()).toThrow("connector_write_forbidden");
    expect(() => client.createEvent()).toThrow("connector_write_forbidden");
    expect(() => client.graphRequest("POST", "https://graph.microsoft.com/v1.0/me/sendMail")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
    expect(fetched).toBe(false);
  });

  it("maps 401/403/429/5xx and timeout fail-closed", async () => {
    const unauthorized = new Microsoft365ProviderClient({
      fetch: async (input) =>
        String(input).includes("/oauth2/v2.0/token") ? jsonResponse(401, { error: "invalid_grant" }) : jsonResponse(500, {}),
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(unauthorized.getSignedInUser()).rejects.toMatchObject({ category: "m365_unauthorized" });

    const forbidden = new Microsoft365ProviderClient({
      fetch: tokenThen(() => jsonResponse(403, {})),
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(forbidden.getSignedInUser()).rejects.toMatchObject({ category: "m365_forbidden" });

    const limited = new Microsoft365ProviderClient({
      fetch: tokenThen(() => jsonResponse(429, {})),
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(limited.getSignedInUser()).rejects.toMatchObject({ category: "m365_rate_limited" });

    const down = new Microsoft365ProviderClient({
      fetch: tokenThen(() => jsonResponse(503, {})),
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(down.getSignedInUser()).rejects.toMatchObject({ category: "m365_provider_error" });

    const timeout = new Microsoft365ProviderClient({
      fetch: async () => {
        throw new Error("network");
      },
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(timeout.getSignedInUser()).rejects.toMatchObject({ category: "m365_timeout" });
  });

  it("allows login.microsoftonline.com for token refresh and not arbitrary hosts", () => {
    expect(assertConnectorUrl("microsoft_365", `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`).hostname).toBe(
      "login.microsoftonline.com",
    );
    expect(() => assertConnectorUrl("microsoft_365", "https://evil.example/oauth2/v2.0/token")).toThrow(
      "unrestricted_external_proxy_forbidden",
    );
  });

  it("rejects schema-invalid Graph payloads", async () => {
    const client = new Microsoft365ProviderClient({
      fetch: tokenThen(() => jsonResponse(200, {})),
      secrets: SECRETS,
      expectedProviderOrgId: TENANT,
    });
    await expect(client.getSignedInUser()).rejects.toBeInstanceOf(Ms365ConnectorError);
  });
});
