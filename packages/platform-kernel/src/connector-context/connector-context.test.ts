import { describe, expect, it } from "vitest";
import { assemblePlatformConnectorContext, resolveConnectorFreshnessPolicyHours } from "./assemble";
import { canReadPlatformConnectorContext } from "./access";
import { redactConnectorSecrets } from "./redact";
import { PlatformConnectorContextService } from "./service";

describe("Platform connector-context read contract", () => {
  it("redacts secrets and does not require Business OS entitlement for Engineering/PI readers", () => {
    expect(canReadPlatformConnectorContext([{ resource: "engineering", action: "read" }])).toBe(true);
    expect(canReadPlatformConnectorContext([{ resource: "tenant", action: "admin" }])).toBe(true);
    expect(canReadPlatformConnectorContext([{ resource: "business", action: "read" }])).toBe(false);
    expect(canReadPlatformConnectorContext([])).toBe(false);
    const redacted = redactConnectorSecrets({ subject: "ok", access_token: "tok", secretId: "sec" });
    expect(redacted).toEqual({ subject: "ok" });
  });

  it("assembles project-neutral records without credentials or writes", () => {
    const result = assemblePlatformConnectorContext({
      scope: { tenantId: "t1", workspaceId: "w1" },
      installations: [
        { id: "i1", tenantId: "t1", workspaceId: "w1", health: "healthy", effectiveMode: "fixture", provenance: {} },
      ],
      staging: [
        {
          id: "s1",
          tenantId: "t1",
          workspaceId: "w1",
          connectorId: "microsoft_365",
          installationId: "i1",
          provider: "microsoft_365",
          externalSourceId: "evt-1",
          dataClass: "calendar_event_read",
          retrievedAt: "2026-08-30T00:00:00.000Z",
          sourceUpdatedAt: "2026-08-30T00:00:00.000Z",
          freshness: "2026-08-30T00:00:00.000Z",
          mappingVersion: "v1",
          payload: { subject: "Review", access_token: "tok" },
          matchStatus: "unmatched",
          canonicalEntityType: null,
          canonicalEntityId: null,
          suppressed: false,
          provenance: { projectId: "p1" },
        },
        {
          id: "s2",
          tenantId: "other",
          workspaceId: "w1",
          connectorId: "microsoft_365",
          installationId: "i1",
          provider: "microsoft_365",
          externalSourceId: "evt-x",
          dataClass: "calendar_event_read",
          retrievedAt: "2026-08-30T00:00:00.000Z",
          sourceUpdatedAt: null,
          freshness: "2026-08-30T00:00:00.000Z",
          mappingVersion: "v1",
          payload: {},
          matchStatus: "unmatched",
          canonicalEntityType: null,
          canonicalEntityId: null,
          suppressed: false,
          provenance: {},
        },
      ],
    });
    expect(result.writeLabel).toBe("READ ONLY");
    expect(result.secretIdPresent).toBe(false);
    expect(result.liveExecution).toBe(false);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.payload).not.toHaveProperty("access_token");
    expect(JSON.stringify(result.records)).not.toMatch(/secretId|access_token/);
    expect(() => new PlatformConnectorContextService({} as never).writeExternal()).toThrow("connector_write_forbidden");
  });

  it("treats missing freshness policy as current-or-default without inventing a second registry", () => {
    expect(resolveConnectorFreshnessPolicyHours("csv_excel", {})).toBe(0);
    expect(resolveConnectorFreshnessPolicyHours("microsoft_365", { freshnessPolicyHours: 12 })).toBe(12);
    expect(resolveConnectorFreshnessPolicyHours("xero", {})).toBe(24);
  });
});
