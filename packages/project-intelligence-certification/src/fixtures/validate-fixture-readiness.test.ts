import { describe, expect, it } from "vitest";
import { validatePiFixtureReadiness } from "./validate-fixture-readiness.js";

const manifest = {
  runId: "run", createdAt: "2026-07-12T00:00:00.000Z", slugPrefix: "cert-pi-",
  baseline: {
    tenantId: "tenant", workspaceId: "workspace-a", workspaceBId: "workspace-b", engineeringProjectId: "project",
    mappingId: "mapping", approvedMappingId: "approved", foreignMappingId: "foreign-mapping", engineeringOsInstallationId: "engineering-install",
    piApplicationInstallationId: "pi-install", licenceId: "licence", seatAssignments: { owner: "seat-owner", engineer: "seat-engineer" },
    users: Object.fromEntries(["owner", "admin", "engineer", "engineerWorkspaceBOnly", "viewer", "otherTenantOwner"].map((role) => [role, { id: `${role}-id`, email: `${role}@test`, jwt: `${role}-jwt`, role }])),
  },
  denial: {
    piNotInstalledTenant: { tenantId: "no-pi", workspaceId: "no-pi-workspace", engineeringOsInstallationId: "no-pi-install", owner: { id: "a", email: "a@test", jwt: "a-jwt", role: "owner" }, expectedCode: "project_intelligence_not_installed", expectedReason: "application_not_in_plan" },
    suspendedLicence: { tenantId: "suspended", owner: { id: "b", email: "b@test", jwt: "b-jwt", role: "owner" }, licenceId: "suspended-licence", expectedCode: "licence_suspended", expectedReason: "licence_not_found" },
    seatNotAssigned: { tenantId: "tenant", workspaceId: "workspace-a", user: { id: "c", email: "c@test", jwt: "c-jwt", role: "viewer" }, expectedCode: "seat_not_assigned", expectedReason: "seat_not_assigned" },
    workspaceNotAssigned: { tenantId: "tenant", userWithoutWorkspace: { id: "d", email: "d@test", jwt: "d-jwt", role: "engineer" }, expectedCode: "workspace_not_assigned", expectedReason: "workspace_not_assigned" },
  },
};

describe("validatePiFixtureReadiness", () => {
  it("accepts a complete offline manifest", () => {
    expect(validatePiFixtureReadiness(manifest)).toEqual({ ok: true, failures: [] });
  });

  it("reports every missing fixture prerequisite", () => {
    const broken = structuredClone(manifest);
    broken.baseline.users.engineer.jwt = "";
    broken.denial.suspendedLicence.licenceId = "";
    broken.slugPrefix = "wrong";
    expect(validatePiFixtureReadiness(broken)).toEqual({
      ok: false,
      failures: expect.arrayContaining([
        "slugPrefix must be cert-pi-",
        "baseline.users.engineer.jwt is required",
        "denial.suspendedLicence.licenceId is required",
      ]),
    });
  });
});
