import { describe, expect, it } from "vitest";
import {
  evaluateProjectIntelligenceAccess,
  canTransition,
  MappingStatus,
  ProjectIntelligenceError,
} from "@rtb/project-intelligence/server";

const allowed = {
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  principalId: "user-a",
  tenantActive: true,
  workspaceAssigned: true,
  subscriptionActive: true,
  licenceActive: true,
  engineeringOsInstalled: true,
  applicationInstalled: true,
  seatAssigned: true,
  roleAssigned: true,
  featureEnabled: true,
  permissions: ["read", "admin", "migration"] as const,
};

describe("Phase 6B offline domain contracts", () => {
  it("covers access denial and workspace boundaries", () => {
    expect(evaluateProjectIntelligenceAccess({ ...allowed, workspaceAssigned: false }).code)
      .toBe("workspace_not_assigned");
    expect(evaluateProjectIntelligenceAccess({ ...allowed, licenceActive: false }).code)
      .toBe("licence_suspended");
    expect(evaluateProjectIntelligenceAccess({ ...allowed, seatAssigned: false }).code)
      .toBe("seat_not_assigned");
  });

  it("keeps mapping transitions explicit and non-destructive", () => {
    expect(canTransition(MappingStatus.Candidate, MappingStatus.PendingReview)).toBe(true);
    expect(canTransition(MappingStatus.Approved, MappingStatus.Candidate)).toBe(false);
  });

  it("preserves nested error details for API adapters", () => {
    const error = new ProjectIntelligenceError("mapping_conflict", "Conflict", 409, { mappingId: "m1" });
    expect(error.toEnvelope()).toEqual({
      error: { code: "mapping_conflict", message: "Conflict", details: { mappingId: "m1" } },
    });
  });
});
