/**
 * Phase 14B — Engineering OS commercial productization (Platform Commerce reuse).
 * Commercial solver entitlement ≠ commercial solver license.
 */

export interface EngineeringOSCommercialProduct {
  productKey: "engineering-os";
  baseCapabilities: string[];
  moduleEntitlements: string[];
  premiumCapabilities: string[];
  toolExecutionEntitlement: string;
  commercialSolverOrchestrationEntitlement: string;
  notes: {
    commercialSolverEntitlementImpliesLicense: false;
    clientRetainsCommercialSolverLicenseOwnership: true;
  };
}

export const ENGINEERING_OS_COMMERCIAL_PRODUCT: EngineeringOSCommercialProduct = {
  productKey: "engineering-os",
  baseCapabilities: [
    "shell",
    "shared_domains",
    "search",
    "ai_workspace",
    "context",
    "health",
  ],
  moduleEntitlements: [
    "project_intelligence",
    "inspection_intelligence",
    "asset_intelligence",
    "project_controls",
    "digital_twin",
    "engineering_model_interoperability",
  ],
  premiumCapabilities: [
    "inspection_intelligence.vision",
    "asset_intelligence.predictive_advisory",
    "project_controls.advanced_contributors",
  ],
  toolExecutionEntitlement: "engineering_tool.execute",
  commercialSolverOrchestrationEntitlement: "external_solver.execute",
  notes: {
    commercialSolverEntitlementImpliesLicense: false,
    clientRetainsCommercialSolverLicenseOwnership: true,
  },
};

export type EngineeringOSInstallState =
  | "installed"
  | "enabled"
  | "disabled"
  | "degraded"
  | "incompatible";

export type EngineeringModuleInstallState =
  | "installed"
  | "enabled"
  | "disabled"
  | "unavailable"
  | "blocked_dependency";

export function resolveModuleInstallState(input: {
  entitled: boolean;
  dependencyOk: boolean;
  enabled: boolean;
}): EngineeringModuleInstallState {
  if (!input.dependencyOk) return "blocked_dependency";
  if (!input.entitled) return "unavailable";
  if (!input.enabled) return "disabled";
  return "enabled";
}
