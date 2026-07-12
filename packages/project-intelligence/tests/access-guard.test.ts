import { describe, expect, it } from "vitest";
import { evaluateAccess, evaluateProjectIntelligenceAccess, requireProjectIntelligenceAdmin } from "../src/security/access-guard";

describe("access guard", () => {
  const reader = {
    tenantId: "tenant",
    workspaceId: "workspace",
    principalId: "user",
    tenantActive: true,
    workspaceAssigned: true,
    subscriptionActive: true,
    licenceActive: true,
    engineeringOsInstalled: true,
    applicationInstalled: true,
    seatAssigned: true,
    roleAssigned: true,
    featureEnabled: true,
    permissions: ["read"] as const,
  };
  it("requires explicit migration permission", () => {
    expect(evaluateAccess(reader, "migration")).toMatchObject({ allowed: false, code: "project_intelligence_migration_access_denied" });
  });
  it("throws for missing admin permission", () => {
    expect(() => requireProjectIntelligenceAdmin(reader)).toThrow("admin access");
  });
  it("denies the first missing dependency in the entitlement chain", () => {
    expect(evaluateProjectIntelligenceAccess({ ...reader, applicationInstalled: false }))
      .toMatchObject({ allowed: false, code: "application_not_installed" });
    expect(evaluateProjectIntelligenceAccess({ ...reader, seatAssigned: false }))
      .toMatchObject({ allowed: false, code: "seat_not_assigned" });
  });
  it("fails closed when the chain is not fully supplied", () => {
    expect(evaluateProjectIntelligenceAccess({ tenantId: "tenant", principalId: "user", permissions: ["read"] }))
      .toMatchObject({ allowed: false, code: "unauthorized" });
  });
});
