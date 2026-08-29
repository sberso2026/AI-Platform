import { describe, expect, it } from "vitest";
import {
  MS365_ALLOWED_CAPABILITIES,
  MS365_ALLOWED_GRAPH_SCOPES,
  MS365_DENIED_GRAPH_SCOPES,
  MS365_MUTATION_OPERATIONS,
  MS365_THREAT_MODEL,
  assertMs365CapabilityAllowed,
  assertMs365ScopeAllowed,
  buildMs365AuthorizeUrl,
  m365GraphPathAllowed,
  ms365ConnectionState,
} from "./m365-policy";

const TENANT = "11111111-1111-4111-8111-111111111111";

describe("Microsoft 365 capability allowlist", () => {
  it("allows only current BOS read contracts and denies Graph writes", () => {
    expect(MS365_ALLOWED_CAPABILITIES).toEqual(["directory.read", "calendar.read", "files.metadata.read"]);
    expect(MS365_ALLOWED_GRAPH_SCOPES).toEqual(["offline_access", "User.Read", "Calendars.Read", "Files.Read"]);
    expect(MS365_DENIED_GRAPH_SCOPES).toContain("Mail.Send");
    expect(MS365_DENIED_GRAPH_SCOPES).toContain("Files.ReadWrite.All");
    expect(MS365_MUTATION_OPERATIONS).toContain("sendMail");
    expect(() => assertMs365CapabilityAllowed("mail.send")).toThrow("m365_capability_forbidden");
    expect(() => assertMs365ScopeAllowed("Mail.Send")).toThrow("m365_scope_forbidden");
    expect(m365GraphPathAllowed("/v1.0/me/events")).toBe(true);
    expect(m365GraphPathAllowed("/v1.0/me/sendMail")).toBe(false);
    expect(MS365_THREAT_MODEL).toHaveLength(21);
    const authorize = buildMs365AuthorizeUrl({
      clientId: "public-client-id",
      tenantId: TENANT,
      redirectUri: "http://localhost:8787/callback",
      state: "csrf-state",
    });
    expect(authorize).toContain("login.microsoftonline.com");
    expect(authorize).toContain("prompt=consent");
    expect(authorize).not.toMatch(/client_secret|refresh_token|password/i);
    expect(ms365ConnectionState({ health: "revoked", effectiveMode: "live", secretId: null, errorCategory: "revoked" })).toBe(
      "DISCONNECTED",
    );
    expect(
      ms365ConnectionState({
        health: "unavailable",
        effectiveMode: "live",
        secretId: "sec",
        errorCategory: "m365_unauthorized",
      }),
    ).toBe("REAUTH_REQUIRED");
  });
});
