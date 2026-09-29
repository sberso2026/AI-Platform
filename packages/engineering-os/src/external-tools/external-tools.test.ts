import { describe, expect, it } from "vitest";
import { MICROSOFT_365_CATALOG_ENTRY, SPACE_GASS_CATALOG_ENTRY, isIntegrationMode } from "./catalog";
import { evaluateAdapterCompatibility } from "./compatibility";
import { assertExternalToolReadyForOptimization, ExternalToolGovernanceError } from "./optimization-gate";
import { deriveReadiness, requiredFieldsForModes } from "./readiness";
import { findForbiddenSecretMaterial } from "./secrets";
import { buildNotReadySpaceGassProfile } from "./spacegass-profile";
import { rejectWorkspacePlatformFields } from "./assignment-service";
import { ExternalToolProfileService } from "./profile-service";
import { validationActionsForModes, validateProfile } from "./validation";
import type { ExternalToolProfile, ExternalToolWorkspaceAssignment } from "./types";

function readySpaceGass(overrides: Partial<ExternalToolProfile> = {}): ExternalToolProfile {
  const base = buildNotReadySpaceGassProfile({ tenantId: "tenant-a", id: "p1" });
  const merged = {
    ...base,
    enabled: true,
    executionHostId: "host-1",
    executablePath: "C:\\Program Files\\SPACE GASS\\sgwin.exe",
    installedVersion: "14.2.0",
    installationStatus: "INSTALLED" as const,
    licenceStatus: "AVAILABLE" as const,
    automationPermission: "PERMITTED" as const,
    automationConfirmedBy: "admin-1",
    automationConfirmedAt: "2026-09-29T00:00:00.000Z",
    automationBasis: "vendor licence terms acknowledged by tool manager",
    lastValidation: { ranAt: "2026-09-29T00:00:00.000Z", overall: "PASS" as const, checks: [] },
    capabilities: base.capabilities.map((cap) =>
      ["OPTIMIZATION_EXECUTION", "LINEAR_STATIC_ANALYSIS", "RESULT_EXTRACTION"].includes(cap.key)
        ? { ...cap, certification: "CERTIFIED" as const, availability: "CERTIFIED" as const }
        : cap,
    ),
    ...overrides,
  };
  return { ...merged, ...deriveReadiness(merged) };
}

function assignment(overrides: Partial<ExternalToolWorkspaceAssignment> = {}): ExternalToolWorkspaceAssignment {
  return {
    id: "as-1",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: null,
    profileId: "p1",
    allowed: true,
    permittedCapabilities: ["OPTIMIZATION_EXECUTION", "LINEAR_STATIC_ANALYSIS", "RESULT_EXTRACTION"],
    designStandard: "AS 4100",
    unitSystem: "SI",
    analysisProfile: "linear_elastic_static",
    createdAt: "t0",
    updatedAt: "t0",
    ...overrides,
  };
}

describe("EOS-A5E amendment — external tool governance", () => {
  it("is generic across categories and integration modes", () => {
    expect(SPACE_GASS_CATALOG_ENTRY.category).toBe("ANALYSIS_SIMULATION");
    expect(MICROSOFT_365_CATALOG_ENTRY.category).toBe("COLLABORATION");
    expect(isIntegrationMode("EXECUTION_ADAPTER")).toBe(true);
    expect(isIntegrationMode("API_CONNECTOR")).toBe(true);
    expect(SPACE_GASS_CATALOG_ENTRY.toolCode).not.toEqual(MICROSOFT_365_CATALOG_ENTRY.toolCode);
  });

  it("uses different required fields for execution vs API tools", () => {
    expect(requiredFieldsForModes(["EXECUTION_ADAPTER"]).execution).toBe(true);
    expect(requiredFieldsForModes(["API_CONNECTOR"]).api).toBe(true);
    expect(validationActionsForModes(["EXECUTION_ADAPTER"])).toContain("VALIDATE_EXECUTABLE");
    expect(validationActionsForModes(["API_CONNECTOR"])).toContain("VALIDATE_AUTHENTICATION");
    expect(validationActionsForModes(["API_CONNECTOR"])).not.toContain("VALIDATE_EXECUTABLE");
  });

  it("records SPACE GASS as NOT_CONFIGURED without fabricating install data", () => {
    const profile = buildNotReadySpaceGassProfile({ tenantId: "tenant-a" });
    expect(profile.installedVersion).toBeNull();
    expect(profile.executablePath).toBeNull();
    expect(profile.licenceStatus).toBe("UNAVAILABLE");
    expect(profile.automationPermission).toBe("REQUIRES_CONFIRMATION");
    expect(profile.readiness).toBe("NOT_CONFIGURED");
    expect(profile.adapterCompatibilityStatus).toBe("NOT_CONFIGURED");
    expect(profile.capabilities.every((cap) => cap.certification !== "CERTIFIED")).toBe(true);
  });

  it("does not infer automation permission from executable presence", () => {
    const profile = readySpaceGass({
      automationPermission: "UNKNOWN",
      automationConfirmedBy: null,
      automationConfirmedAt: null,
    });
    expect(profile.executablePath).toBeTruthy();
    expect(profile.readiness).not.toBe("READY");
    expect(profile.readiness).toBe("BLOCKED");
  });

  it("requires explicit automation provenance for READY", () => {
    const profile = readySpaceGass({ automationConfirmedBy: null });
    expect(profile.readiness).toBe("BLOCKED");
  });

  it("fail-closes adapter compatibility outside certified versions", () => {
    expect(
      evaluateAdapterCompatibility({
        installedVersion: "15.0.0",
        compatibleToolVersions: ["14.2"],
        notCertifiedToolVersions: ["15"],
        minSupportedVersion: "12.0",
      }),
    ).toBe("INCOMPATIBLE");
    expect(
      evaluateAdapterCompatibility({
        installedVersion: "14.2.1",
        compatibleToolVersions: ["14.2"],
        notCertifiedToolVersions: ["15"],
        minSupportedVersion: "12.0",
      }),
    ).toBe("CERTIFIED");
  });

  it("blocks Optimization unless profile is READY with certified OPTIMIZATION_EXECUTION", () => {
    const notReady = buildNotReadySpaceGassProfile({ tenantId: "tenant-a", id: "p1" });
    expect(() =>
      assertExternalToolReadyForOptimization({
        profile: notReady,
        assignment: assignment(),
        workspaceId: "ws-a",
      }),
    ).toThrow(ExternalToolGovernanceError);

    expect(() =>
      assertExternalToolReadyForOptimization({
        profile: readySpaceGass(),
        assignment: assignment({ allowed: false }),
        workspaceId: "ws-a",
      }),
    ).toThrow(/not authorized/i);

    expect(() =>
      assertExternalToolReadyForOptimization({
        profile: readySpaceGass(),
        assignment: assignment({ permittedCapabilities: ["LINEAR_STATIC_ANALYSIS"] }),
        workspaceId: "ws-a",
      }),
    ).toThrow(/not permitted/i);

    expect(() =>
      assertExternalToolReadyForOptimization({
        profile: readySpaceGass(),
        assignment: assignment(),
        workspaceId: "ws-a",
      }),
    ).not.toThrow();
  });

  it("rejects workspace attempts to set executable or licence", () => {
    expect(() => rejectWorkspacePlatformFields({ executablePath: "C:\\sg.exe" })).toThrow(/cannot set platform/i);
    expect(() => rejectWorkspacePlatformFields({ workspaceId: "ws-a", unitSystem: "SI" })).not.toThrow();
  });

  it("does not persist secret values in normal tool records", () => {
    expect(findForbiddenSecretMaterial({ licence_key: "ABC-123-SECRETKEY-0001" }).length).toBeGreaterThan(0);
    expect(findForbiddenSecretMaterial({ password: "hunter2" }).length).toBeGreaterThan(0);
    expect(findForbiddenSecretMaterial({ credentialSecretId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" })).toEqual([]);
  });

  it("keeps execution validation fail-closed without live solver evidence", () => {
    const result = validateProfile(readySpaceGass());
    expect(result.overall).toBe("FAIL");
    expect(result.checks.some((row) => row.action === "TEST_EXECUTION" && row.status === "NOT_RUN")).toBe(true);
  });

  it("supports in-memory profile CRUD overlay for SPACE GASS catalog", () => {
    const service = new ExternalToolProfileService({ from: () => ({}) } as never);
    const listed = service.mergeCatalog("tenant-a", []);
    expect(listed[0]?.toolCode).toBe("spacegass");
    expect(listed[0]?.readiness).toBe("NOT_CONFIGURED");
  });
});
