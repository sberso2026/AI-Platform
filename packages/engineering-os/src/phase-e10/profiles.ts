/**
 * Machine-readable ESSENTIAL / PROFESSIONAL / ENTERPRISE profile contracts.
 * Packaging only — never replaces entitlement or RBAC.
 */

import type { EngineeringProfileContract } from "./contracts";

const ESSENTIAL_CAPS = [
  "ask_native",
  "search_reasoning",
  "projects_documents_registers",
  "core_engineering_tools",
  "passive_memory",
  "action_proposals",
] as const;

const PROFESSIONAL_OPTIONAL = [
  "optional_connectors",
  "selected_intelligence_packs",
  "advanced_tools",
] as const;

const ENTERPRISE_CAPS = [
  "sso_enterprise_identity",
  "enterprise_connectors",
  "federated_data",
  "advanced_rbac_governance",
  "enterprise_deployment_controls",
  "approvals_governance_surfaces",
  "integrations_admin",
] as const;

export const ENGINEERING_PROFILE_ESSENTIAL: EngineeringProfileContract = {
  profileId: "ESSENTIAL",
  enabledCapabilities: [...ESSENTIAL_CAPS],
  optionalCapabilities: [],
  connectorPolicy: "DISABLED",
  governanceLevel: "CORE",
  identityMode: "NATIVE",
  deploymentMode: "RTB_SAAS",
  allowedDeploymentModes: ["RTB_SAAS", "CLIENT_CLOUD", "PRIVATE_CLOUD", "ON_PREM_READY"],
  adminFeatures: ["modules_entitlement_status", "minimal_settings"],
  UXDensity: "MINIMAL",
  primaryNavIds: ["eng-home", "eng-ask", "eng-my", "eng-explore"],
  profileIsAuthorization: false,
};

export const ENGINEERING_PROFILE_PROFESSIONAL: EngineeringProfileContract = {
  profileId: "PROFESSIONAL",
  enabledCapabilities: [
    ...ESSENTIAL_CAPS,
    "cross_project_intelligence",
    "richer_workflows",
  ],
  optionalCapabilities: [...PROFESSIONAL_OPTIONAL],
  connectorPolicy: "OPTIONAL",
  governanceLevel: "ENHANCED",
  identityMode: "NATIVE",
  deploymentMode: "RTB_SAAS",
  allowedDeploymentModes: ["RTB_SAAS", "CLIENT_CLOUD", "PRIVATE_CLOUD", "ON_PREM_READY"],
  adminFeatures: [
    "modules_entitlement_status",
    "integrations_optional",
    "workflow_admin",
  ],
  UXDensity: "RICH",
  primaryNavIds: [
    "eng-home",
    "eng-ask",
    "eng-my",
    "eng-explore",
    "eng-intelligence",
  ],
  profileIsAuthorization: false,
};

export const ENGINEERING_PROFILE_ENTERPRISE: EngineeringProfileContract = {
  profileId: "ENTERPRISE",
  enabledCapabilities: [
    ...ESSENTIAL_CAPS,
    "cross_project_intelligence",
    "richer_workflows",
    ...ENTERPRISE_CAPS,
  ],
  optionalCapabilities: [
    ...PROFESSIONAL_OPTIONAL,
    "corporate_copilot_federation",
  ],
  connectorPolicy: "ENTERPRISE_ENABLED",
  governanceLevel: "ENTERPRISE",
  identityMode: "OIDC_SAML_READY",
  deploymentMode: "PRIVATE_CLOUD",
  allowedDeploymentModes: ["RTB_SAAS", "CLIENT_CLOUD", "PRIVATE_CLOUD", "ON_PREM_READY"],
  adminFeatures: [
    "modules_entitlement_status",
    "integrations_admin",
    "governance_approvals",
    "enterprise_identity",
    "deployment_controls",
    "capability_inspect",
  ],
  UXDensity: "ENTERPRISE",
  primaryNavIds: [
    "eng-home",
    "eng-ask",
    "eng-my",
    "eng-explore",
    "eng-intelligence",
  ],
  profileIsAuthorization: false,
};

export const ENGINEERING_PROFILE_CATALOG: Record<
  EngineeringProfileContract["profileId"],
  EngineeringProfileContract
> = {
  ESSENTIAL: ENGINEERING_PROFILE_ESSENTIAL,
  PROFESSIONAL: ENGINEERING_PROFILE_PROFESSIONAL,
  ENTERPRISE: ENGINEERING_PROFILE_ENTERPRISE,
};

export function getEngineeringProfileContract(
  profileId: EngineeringProfileContract["profileId"],
): EngineeringProfileContract {
  return structuredClone(ENGINEERING_PROFILE_CATALOG[profileId]);
}

export function profileIncludesCapability(
  profileId: EngineeringProfileContract["profileId"],
  capabilityKey: string,
): { included: boolean; optional: boolean } {
  const profile = ENGINEERING_PROFILE_CATALOG[profileId];
  const enabled = profile.enabledCapabilities.includes(capabilityKey as never);
  const optional = profile.optionalCapabilities.includes(capabilityKey as never);
  return { included: enabled || optional, optional };
}
