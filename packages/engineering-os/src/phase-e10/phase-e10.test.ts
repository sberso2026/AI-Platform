import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE10Invariants,
  getPhaseE10Declaration,
  PhaseE10EssentialZeroConnectorIndependent,
  PhaseE10NoSeparateAppsPerProfile,
  PhaseE10ProfileIsNotAuthorization,
} from "./contracts";
import {
  ENGINEERING_PROFILE_ESSENTIAL,
  ENGINEERING_PROFILE_ENTERPRISE,
  ENGINEERING_PROFILE_PROFESSIONAL,
  getEngineeringProfileContract,
} from "./profiles";
import {
  assertEnterpriseRouteAllowed,
  listAdminInspectCapabilities,
  listEngineerVisibleCapabilities,
  resolveCapabilityVisibility,
  resolveProfilePrimaryNav,
} from "./visibility";
import { createProfileSeedTenants } from "./seed-tenants";
import {
  assertSameDomainServicesAcrossProfiles,
  recordProfilePerf,
  resolveCopilotFederation,
  resolveDegradation,
  resolveIdentityPath,
} from "./degradation";
import { resolveAskAvailabilityForProfile, resolveNavForProfileTenant } from "./nav-bridge";
import { EngineeringCopilotFederationBoundary } from "../phase-e4/contracts";
import { supportsZeroConnectorNativeDeployment } from "../phase-e0/contracts";

describe("Phase E10 deployment profiles & progressive UX", () => {
  it("17. E0-E9 invariants + one codebase", () => {
    expect(PhaseE10ProfileIsNotAuthorization).toBe(true);
    expect(PhaseE10EssentialZeroConnectorIndependent).toBe(true);
    expect(PhaseE10NoSeparateAppsPerProfile).toBe(true);
    expect(getPhaseE10Declaration().profileIsAuthorization).toBe(false);
    expect(getPhaseE10Declaration().copilotFederation.microsoftCopilotRequired).toBe(false);
    assertPhaseE10Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
    });
    expect(assertSameDomainServicesAcrossProfiles().sameCodebase).toBe(true);
  });

  it("1. ESSENTIAL zero-connector", () => {
    expect(ENGINEERING_PROFILE_ESSENTIAL.connectorPolicy).toBe("DISABLED");
    expect(supportsZeroConnectorNativeDeployment).toBe(true);
    const connectors = resolveCapabilityVisibility({
      profileId: "ESSENTIAL",
      capabilityKey: "enterprise_connectors",
      entitledKeys: ["engineering-os", "enterprise_connectors"],
      audience: "engineer",
    });
    expect(connectors.visible).toBe(false);
    expect(connectors.reasonCode).toBe("PROFILE_DOES_NOT_INCLUDE");
  });

  it("2. ESSENTIAL native Ask", () => {
    const ask = resolveAskAvailabilityForProfile({
      profileId: "ESSENTIAL",
      productEntitled: true,
      entitledFeatureKeys: ["ai_assistant"],
    });
    expect(ask.available).toBe(true);
    const nav = resolveProfilePrimaryNav({
      profileId: "ESSENTIAL",
      productEntitled: true,
      entitledFeatureKeys: ["ai_assistant"],
    });
    expect(nav).toContain("eng-ask");
    expect(nav).not.toContain("eng-intelligence");
  });

  it("3. PROFESSIONAL optional connector", () => {
    expect(ENGINEERING_PROFILE_PROFESSIONAL.connectorPolicy).toBe("OPTIONAL");
    const without = resolveCapabilityVisibility({
      profileId: "PROFESSIONAL",
      capabilityKey: "optional_connectors",
      entitledKeys: ["engineering-os"],
      audience: "engineer",
    });
    expect(without.usable).toBe(false);
    const withEntitlement = resolveCapabilityVisibility({
      profileId: "PROFESSIONAL",
      capabilityKey: "optional_connectors",
      entitledKeys: ["engineering-os", "optional_connectors"],
      audience: "engineer",
    });
    expect(withEntitlement.usable).toBe(true);
  });

  it("4. ENTERPRISE connector/intelligence visibility", () => {
    expect(ENGINEERING_PROFILE_ENTERPRISE.connectorPolicy).toBe("ENTERPRISE_ENABLED");
    const nav = resolveProfilePrimaryNav({
      profileId: "ENTERPRISE",
      productEntitled: true,
      entitledFeatureKeys: ["ai_assistant"],
    });
    expect(nav).toContain("eng-intelligence");
    const enterpriseConnectors = resolveCapabilityVisibility({
      profileId: "ENTERPRISE",
      capabilityKey: "enterprise_connectors",
      entitledKeys: ["engineering-os", "enterprise_connectors"],
      audience: "engineer",
    });
    expect(enterpriseConnectors.usable).toBe(true);
  });

  it("5. capability hidden when unavailable", () => {
    const hidden = resolveCapabilityVisibility({
      profileId: "ESSENTIAL",
      capabilityKey: "corporate_copilot_federation",
      entitledKeys: ["engineering-os", "corporate_copilot_federation"],
      audience: "engineer",
    });
    expect(hidden.visible).toBe(false);
    const admin = listAdminInspectCapabilities("ESSENTIAL").find(
      (c) => c.capabilityKey === "corporate_copilot_federation",
    );
    expect(admin?.visibility.reasonCode).toBe("ADMIN_INSPECT_ONLY");
  });

  it("6. entitlement deny", () => {
    const denied = resolveCapabilityVisibility({
      profileId: "ESSENTIAL",
      capabilityKey: "ask_native",
      entitledKeys: ["engineering-os"],
      audience: "engineer",
    });
    expect(denied.reasonCode).toBe("NOT_ENTITLED");
  });

  it("7. RBAC deny", () => {
    const denied = resolveCapabilityVisibility({
      profileId: "ENTERPRISE",
      capabilityKey: "enterprise_connectors",
      entitledKeys: ["engineering-os", "enterprise_connectors"],
      requiredPermission: "engineering.integrations.admin",
      rbacPermissions: [],
      audience: "engineer",
    });
    expect(denied.reasonCode).toBe("RBAC_DENIED");
  });

  it("8. no dead tabs", () => {
    const seeds = createProfileSeedTenants();
    for (const seed of seeds) {
      const nav = resolveNavForProfileTenant({
        profileId: seed.profileId,
        productEntitled: true,
        entitledFeatureKeys: seed.entitledKeys,
      });
      expect(nav.deadTabs).toEqual([]);
      expect(nav.navIds.length).toBeGreaterThan(0);
    }
  });

  it("9. profile != authorization", () => {
    expect(getEngineeringProfileContract("ENTERPRISE").profileIsAuthorization).toBe(false);
    // ENTERPRISE profile alone does not grant ask without ai_assistant entitlement
    const ask = resolveAskAvailabilityForProfile({
      profileId: "ENTERPRISE",
      productEntitled: true,
      entitledFeatureKeys: [],
    });
    expect(ask.available).toBe(false);
  });

  it("10. connector outage graceful degradation", () => {
    const d = resolveDegradation("connector_outage", "ENTERPRISE");
    expect(d.continueNativeEos).toBe(true);
    expect(d.fallback).toBe("native_ask_evidence_reasoning");
  });

  it("11. native identity path", () => {
    expect(ENGINEERING_PROFILE_ESSENTIAL.identityMode).toBe("NATIVE");
    const path = resolveIdentityPath({
      configuredMode: "NATIVE",
      externalIdentityAvailable: false,
      deploymentPermitsNativeFallback: true,
    });
    expect(path.mode).toBe("NATIVE");
  });

  it("12. enterprise identity abstraction", () => {
    const path = resolveIdentityPath({
      configuredMode: "ENTRA",
      externalIdentityAvailable: false,
      deploymentPermitsNativeFallback: true,
    });
    expect(path.usedNativeFallback).toBe(true);
    expect(path.mode).toBe("NATIVE");
    expect(ENGINEERING_PROFILE_ENTERPRISE.identityMode).toBe("OIDC_SAML_READY");
  });

  it("13. Copilot federation optional", () => {
    expect(EngineeringCopilotFederationBoundary.microsoftCopilotRequired).toBe(false);
    const essential = resolveCopilotFederation({
      profileId: "ESSENTIAL",
      entitled: true,
      enabledByAdmin: true,
    });
    expect(essential.available).toBe(false);
    expect(essential.nativeAssistantRequiredFunctional).toBe(true);
    const enterprise = resolveCopilotFederation({
      profileId: "ENTERPRISE",
      entitled: true,
      enabledByAdmin: true,
    });
    expect(enterprise.available).toBe(true);
  });

  it("14. same domain services across profiles", () => {
    const a = assertSameDomainServicesAcrossProfiles();
    expect(a.sameCodebase).toBe(true);
    expect(a.services).toContain("EngineeringAIService");
  });

  it("15. deployment-mode abstraction", () => {
    const modes = getPhaseE10Declaration().deploymentModes;
    expect([...modes]).toEqual([
      "RTB_SAAS",
      "CLIENT_CLOUD",
      "PRIVATE_CLOUD",
      "ON_PREM_READY",
    ]);
    expect(getPhaseE10Declaration().providerHardDependenciesForbidden).toContain("Vercel");
    expect(getPhaseE10Declaration().providerHardDependenciesForbidden).toContain(
      "Microsoft Copilot",
    );
  });

  it("16. cross-tenant isolation (seed tenants see only relevant capabilities)", () => {
    const seeds = createProfileSeedTenants();
    expect(seeds).toHaveLength(3);
    const essential = seeds.find((s) => s.profileId === "ESSENTIAL")!;
    const enterprise = seeds.find((s) => s.profileId === "ENTERPRISE")!;
    expect(essential.connectorsEnabled).toBe(false);
    expect(essential.visibleCapabilities).not.toContain("enterprise_connectors");
    expect(essential.visibleNavIds).not.toContain("eng-intelligence");
    expect(enterprise.visibleCapabilities).toContain("enterprise_connectors");
    expect(enterprise.tenantId).not.toBe(essential.tenantId);
    // Server block for ESSENTIAL connector admin
    const blocked = assertEnterpriseRouteAllowed({
      profileId: "ESSENTIAL",
      entitledKeys: ["engineering-os", "enterprise_connectors"],
      rbacPermissions: ["engineering.integrations.admin"],
      routeKind: "connector_admin",
    });
    expect(blocked.allowed).toBe(false);
  });

  it("perf instrumentation helper", () => {
    const sample = recordProfilePerf("ESSENTIAL", { homeMs: 12, navMs: 3, askMs: 40 });
    expect(sample.profileId).toBe("ESSENTIAL");
  });

  it("seed PROFESSIONAL sees intelligence nav when entitled", () => {
    const mid = createProfileSeedTenants().find((s) => s.profileId === "PROFESSIONAL")!;
    expect(mid.visibleNavIds).toContain("eng-intelligence");
    expect(listEngineerVisibleCapabilities("PROFESSIONAL", mid.entitledKeys)).toContain(
      "cross_project_intelligence",
    );
  });
});
