/**
 * Phase E10 — Deployment Profiles & Progressive UX.
 * One codebase, three profiles. Profile ≠ authorization.
 * Reuses E0 DeploymentProfiles + E1 nav gates + E4 zero-connector / Copilot boundary.
 */

import {
  CapabilityBasedUxHideUnavailable,
  DeploymentProfiles,
  type DeploymentProfile,
  E0ForbidsDuplicatePiIiOwnership,
  E0ForbidsForcedExternalDependency,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  EnterpriseConnectorsNeverHardDependency,
  EnterpriseConnectorsOptional,
  HideDeadNonClickablePrimaryFeatures,
  NoMandatorySapM365CopilotDependency,
  ProgressiveDeploymentSupported,
  supportsZeroConnectorNativeDeployment,
  VendorNeutralLogicalArchitecture,
} from "../phase-e0/contracts";
import {
  PhaseE1ExperienceFoundationComplete,
  PhaseE1EssentialZeroConnector,
} from "../phase-e1/contracts";
import { PhaseE2GroundedSearchComplete } from "../phase-e2/contracts";
import { PhaseE3CanonicalContextComplete } from "../phase-e3/contracts";
import {
  EngineeringCopilotFederationBoundary,
  PhaseE4ConnectorFrameworkComplete,
  PhaseE4EssentialZeroConnector,
} from "../phase-e4/contracts";
import { PhaseE5ReasoningExplainabilityComplete } from "../phase-e5/contracts";
import { PhaseE6GovernedToolFrameworkComplete } from "../phase-e6/contracts";
import { PhaseE7PassiveMemoryComplete } from "../phase-e7/contracts";
import { PhaseE8ActionWorkflowOrchestrationComplete } from "../phase-e8/contracts";
import { PhaseE9UnifiedIntelligenceComplete } from "../phase-e9/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E10 = "E10" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E10 = "0.1.0-e10" as const;

export const PhaseE10DeploymentProfilesComplete = true as const;
export const PhaseE10ProfileIsNotAuthorization = true as const;
export const PhaseE10EssentialZeroConnectorIndependent = true as const;
export const PhaseE10NoProviderHardDependency = true as const;
export const PhaseE10NoSeparateAppsPerProfile = true as const;
export const PhaseE10SameDomainArchitectureAcrossProfiles = true as const;
export const PhaseE10HideUnavailableFromEngineers = true as const;
export const PhaseE10CopilotFederationOptional = true as const;
export const PhaseE10DoesNotOwnPiIiAiEngines = true as const;
export const PhaseE10DoesNotDuplicateAuthFramework = true as const;

/** Re-export E0 profile ids for E10 consumers. */
export { DeploymentProfiles };
export type { DeploymentProfile };

export const EngineeringDeploymentModes = [
  "RTB_SAAS",
  "CLIENT_CLOUD",
  "PRIVATE_CLOUD",
  "ON_PREM_READY",
] as const;
export type EngineeringDeploymentMode = (typeof EngineeringDeploymentModes)[number];

export const EngineeringIdentityModes = [
  "NATIVE",
  "ENTRA",
  "OIDC_SAML_READY",
] as const;
export type EngineeringIdentityMode = (typeof EngineeringIdentityModes)[number];

export const EngineeringUxDensities = [
  "MINIMAL",
  "STANDARD",
  "RICH",
  "ENTERPRISE",
] as const;
export type EngineeringUxDensity = (typeof EngineeringUxDensities)[number];

export const EngineeringGovernanceLevels = [
  "CORE",
  "ENHANCED",
  "ENTERPRISE",
] as const;
export type EngineeringGovernanceLevel = (typeof EngineeringGovernanceLevels)[number];

export const EngineeringConnectorPolicies = [
  "DISABLED",
  "OPTIONAL",
  "ENTERPRISE_ENABLED",
] as const;
export type EngineeringConnectorPolicy = (typeof EngineeringConnectorPolicies)[number];

/** Capability keys used for progressive packaging (not a second entitlement system). */
export const EngineeringProfileCapabilityKeys = [
  "ask_native",
  "search_reasoning",
  "projects_documents_registers",
  "core_engineering_tools",
  "passive_memory",
  "action_proposals",
  "cross_project_intelligence",
  "richer_workflows",
  "advanced_tools",
  "optional_connectors",
  "selected_intelligence_packs",
  "sso_enterprise_identity",
  "enterprise_connectors",
  "federated_data",
  "advanced_rbac_governance",
  "enterprise_deployment_controls",
  "corporate_copilot_federation",
  "approvals_governance_surfaces",
  "integrations_admin",
] as const;
export type EngineeringProfileCapabilityKey =
  (typeof EngineeringProfileCapabilityKeys)[number];

export type EngineeringProfileContract = {
  profileId: DeploymentProfile;
  enabledCapabilities: EngineeringProfileCapabilityKey[];
  optionalCapabilities: EngineeringProfileCapabilityKey[];
  connectorPolicy: EngineeringConnectorPolicy;
  governanceLevel: EngineeringGovernanceLevel;
  identityMode: EngineeringIdentityMode;
  /** Default logical deployment mode for this profile packaging. */
  deploymentMode: EngineeringDeploymentMode;
  /** Allowed deployment modes for this profile. */
  allowedDeploymentModes: EngineeringDeploymentMode[];
  adminFeatures: string[];
  UXDensity: EngineeringUxDensity;
  /** Primary nav surface ids (E1) typically shown when entitled. */
  primaryNavIds: string[];
  /** Engineer-facing notes — never substitutes for entitlement. */
  profileIsAuthorization: false;
};

export type EngineeringCapabilityVisibilityInput = {
  profileId: DeploymentProfile;
  /** Installed application/module keys (e.g. project_intelligence). */
  installedKeys?: string[];
  /** Entitled product/application/feature keys. */
  entitledKeys?: string[];
  /** RBAC permission keys granted to the user. */
  rbacPermissions?: string[];
  /** Required RBAC permission to use a capability (server-side). */
  requiredPermission?: string | null;
  capabilityKey: EngineeringProfileCapabilityKey | string;
  /** When true, capability is installed in the deployment. */
  installed?: boolean;
  /** Audience: engineer hides admin-only unavailable; admin may inspect. */
  audience?: "engineer" | "admin";
};

export type EngineeringCapabilityVisibility = {
  visible: boolean;
  usable: boolean;
  reasonCode:
    | "OK"
    | "PROFILE_DOES_NOT_INCLUDE"
    | "NOT_INSTALLED"
    | "NOT_ENTITLED"
    | "RBAC_DENIED"
    | "ADMIN_INSPECT_ONLY"
    | "CONNECTOR_DISABLED_IN_PROFILE";
  /** Profile packaging never elevates permissions. */
  profileElevatesPermissions: false;
};

export type EngineeringDegradationEvent =
  | "connector_outage"
  | "intelligence_pack_unavailable"
  | "external_identity_unavailable"
  | "enterprise_feature_not_entitled";

export type EngineeringDegradationResult = {
  continueNativeEos: boolean;
  fallback:
    | "native_ask_evidence_reasoning"
    | "native_identity"
    | "hide_enterprise_surface"
    | "admin_inspect_only";
  message: string;
};

export function getPhaseE10Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E10,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E10,
    PhaseE10DeploymentProfilesComplete,
    PhaseE10ProfileIsNotAuthorization,
    PhaseE10EssentialZeroConnectorIndependent,
    PhaseE10NoProviderHardDependency,
    PhaseE10NoSeparateAppsPerProfile,
    PhaseE10SameDomainArchitectureAcrossProfiles,
    PhaseE10HideUnavailableFromEngineers,
    PhaseE10CopilotFederationOptional,
    PhaseE10DoesNotOwnPiIiAiEngines,
    PhaseE10DoesNotDuplicateAuthFramework,
    profiles: DeploymentProfiles,
    deploymentModes: EngineeringDeploymentModes,
    identityModes: EngineeringIdentityModes,
    uxDensities: EngineeringUxDensities,
    copilotFederation: EngineeringCopilotFederationBoundary,
    providerHardDependenciesForbidden: [
      "Vercel",
      "Supabase",
      "Azure",
      "AWS",
      "OpenAI",
      "Microsoft Copilot",
    ] as const,
    profileIsAuthorization: false as const,
  } as const;
}

export function assertPhaseE10Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete ||
    !PhaseE3CanonicalContextComplete ||
    !PhaseE4ConnectorFrameworkComplete ||
    !PhaseE5ReasoningExplainabilityComplete ||
    !PhaseE6GovernedToolFrameworkComplete ||
    !PhaseE7PassiveMemoryComplete ||
    !PhaseE8ActionWorkflowOrchestrationComplete ||
    !PhaseE9UnifiedIntelligenceComplete
  ) {
    throw new Error("E10 requires E0–E9 contracts locked");
  }
  if (
    !PhaseE10ProfileIsNotAuthorization ||
    !PhaseE10EssentialZeroConnectorIndependent ||
    !PhaseE1EssentialZeroConnector ||
    !PhaseE4EssentialZeroConnector ||
    !supportsZeroConnectorNativeDeployment
  ) {
    throw new Error("E10 ESSENTIAL must remain independently useful with zero connectors");
  }
  if (
    !PhaseE10NoProviderHardDependency ||
    !VendorNeutralLogicalArchitecture ||
    !NoMandatorySapM365CopilotDependency ||
    !EnterpriseConnectorsNeverHardDependency ||
    !E0ForbidsForcedExternalDependency
  ) {
    throw new Error("E10 must not introduce provider/enterprise hard dependencies");
  }
  if (
    !PhaseE10NoSeparateAppsPerProfile ||
    !PhaseE10SameDomainArchitectureAcrossProfiles ||
    !ProgressiveDeploymentSupported
  ) {
    throw new Error("E10 must keep one codebase / same domain architecture");
  }
  if (
    !PhaseE10HideUnavailableFromEngineers ||
    !CapabilityBasedUxHideUnavailable ||
    !HideDeadNonClickablePrimaryFeatures
  ) {
    throw new Error("E10 must hide unavailable capabilities from engineers");
  }
  if (
    !PhaseE10CopilotFederationOptional ||
    EngineeringCopilotFederationBoundary.microsoftCopilotRequired
  ) {
    throw new Error("E10 Copilot federation must remain optional");
  }
  if (
    !EnterpriseConnectorsOptional ||
    !PhaseE10DoesNotDuplicateAuthFramework ||
    !PhaseE10DoesNotOwnPiIiAiEngines
  ) {
    throw new Error("E10 ownership / auth reuse invariants failed");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E10 ownership regression");
  }
  if (
    !input.ProjectIntelligenceV1Intact ||
    !input.InspectionIntelligenceV1Intact ||
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E10 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E10 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E10 requires product boundary locked");
  }
}
