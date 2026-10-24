import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
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
  CapabilityBasedUxHideUnavailable,
  DeploymentProfiles,
  E0ForbidsForcedExternalDependency,
  EnterpriseConnectorsNeverHardDependency,
  EnterpriseConnectorsOptional,
  ExperienceSurfaces,
  ExternalRecordNotEqualEngineeringOsRecord,
  NativeAiSearchWithoutEnterpriseAiRequired,
  NoMandatorySapM365CopilotDependency,
  PHASE_E0_DOCUMENTS,
  PhaseE0ArchitectureComplete,
  PreferReferencesMappingsProvenance,
  assertPhaseE0Invariants,
  getPhaseE0Declaration,
  supportsEnterpriseFederatedDeployment,
  supportsZeroConnectorNativeDeployment,
} from "./contracts";

describe("Phase E0 Engineering Intelligence Layer contracts", () => {
  it("locks product invariants and deployment profile support", () => {
    const decl = getPhaseE0Declaration();
    expect(decl.evolutionPhase).toBe("E0");
    expect(decl.EngineeringIntelligenceLayerContractLocked).toBe(true);
    expect(PhaseE0ArchitectureComplete).toBe(true);
    expect(EnterpriseConnectorsOptional).toBe(true);
    expect(EnterpriseConnectorsNeverHardDependency).toBe(true);
    expect(NativeAiSearchWithoutEnterpriseAiRequired).toBe(true);
    expect(NoMandatorySapM365CopilotDependency).toBe(true);
    expect(CapabilityBasedUxHideUnavailable).toBe(true);
    expect(ExternalRecordNotEqualEngineeringOsRecord).toBe(true);
    expect(PreferReferencesMappingsProvenance).toBe(true);
    expect(supportsZeroConnectorNativeDeployment).toBe(true);
    expect(supportsEnterpriseFederatedDeployment).toBe(true);
    expect(E0ForbidsForcedExternalDependency).toBe(true);
    expect([...DeploymentProfiles]).toEqual(["ESSENTIAL", "PROFESSIONAL", "ENTERPRISE"]);
    expect([...ExperienceSurfaces]).toEqual([
      "ask_engineering_os",
      "my_engineering",
      "explore",
      "intelligence",
    ]);
  });

  it("preserves certified ownership invariants", () => {
    expect(() =>
      assertPhaseE0Invariants({
        ProjectIntelligenceV1Intact,
        InspectionIntelligenceV1Intact,
        AssetIntelligenceV1Intact,
        ProjectControlsV1Intact,
        DigitalTwinV1Intact,
        EngineeringModelInteroperabilityV1Intact,
        privateCrossModuleCouplingDetected,
        duplicateAssetOwnershipDetected,
        EngineeringOSProductBoundaryLocked,
      }),
    ).not.toThrow();
  });

  it("publishes required architecture documents", () => {
    const repoRoot = resolve(__dirname, "../../../..");
    for (const rel of PHASE_E0_DOCUMENTS) {
      expect(existsSync(resolve(repoRoot, rel)), rel).toBe(true);
    }
  });
});
