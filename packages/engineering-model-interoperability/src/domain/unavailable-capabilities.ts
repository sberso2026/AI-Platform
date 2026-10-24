/**
 * Phase 13F — machine-readable matrix of what EMI V1.0 does NOT certify.
 */

import {
  ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  AUTOMATIC_MAPPING_APPROVAL_ENABLED,
  CSIBRIDGE_ADAPTER_IMPLEMENTED,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABS_CONTROLLED_EXECUTION_CERTIFIED,
  ETABS_HOSTED_EXECUTION_CERTIFIED,
  MODEL_MUTATION_IMPLEMENTED,
  NATIVE_NAVISWORKS_ADAPTER_IMPLEMENTED,
  NATIVE_REVIT_ADAPTER_IMPLEMENTED,
  NATIVE_TEKLA_ADAPTER_IMPLEMENTED,
  SAFE_ADAPTER_IMPLEMENTED,
  SAP2000_ADAPTER_IMPLEMENTED,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
  SPACEGASS_LIVE_PROVIDER_READY,
  SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED,
  SPACE_GASS_HOSTED_EXECUTION_CERTIFIED,
} from "../version";

export type UnavailableCapabilityEntry = {
  capabilityId: string;
  label: string;
  kind: "unavailable" | "blocked_external_dependency" | "reserved";
  governingFlag: string;
  flagValue: boolean;
  userFacingLabel: string;
  reason: string;
  owner: string | null;
};

export const EMI_UNAVAILABLE_CAPABILITIES: readonly UnavailableCapabilityEntry[] =
  [
    {
      capabilityId: "emi.spacegass_live_api",
      label: "SPACE GASS live API",
      kind: "blocked_external_dependency",
      governingFlag: "SPACEGASS_LIVE_PROVIDER_READY",
      flagValue: SPACEGASS_LIVE_PROVIDER_READY,
      userFacingLabel: "NOT CERTIFIED — blocked_external_dependency",
      reason: "Licensed SPACE GASS environment unavailable (Phase 13D).",
      owner: "external_engineering_tool",
    },
    {
      capabilityId: "emi.spacegass_live_execution",
      label: "SPACE GASS live execution",
      kind: "blocked_external_dependency",
      governingFlag: "SPACEGASS_LIVE_EXECUTION_CERTIFIED",
      flagValue: SPACEGASS_LIVE_EXECUTION_CERTIFIED,
      userFacingLabel: "NOT CERTIFIED — blocked_external_dependency",
      reason: "Live SPACE GASS execution not certified.",
      owner: "external_engineering_tool",
    },
    {
      capabilityId: "emi.spacegass_hosted_execution",
      label: "SPACE GASS hosted execution",
      kind: "unavailable",
      governingFlag: "SPACE_GASS_HOSTED_EXECUTION_CERTIFIED",
      flagValue: SPACE_GASS_HOSTED_EXECUTION_CERTIFIED,
      userFacingLabel: "NOT CERTIFIED",
      reason: "Hosted SPACE GASS binary execution not certified.",
      owner: "external_engineering_tool",
    },
    {
      capabilityId: "emi.spacegass_controlled_execution",
      label: "SPACE GASS controlled execution",
      kind: "unavailable",
      governingFlag: "SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED",
      flagValue: SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED,
      userFacingLabel: "NOT CERTIFIED",
      reason: "Controlled-host SPACE GASS execution not certified.",
      owner: "engineering_execution_infrastructure",
    },
    {
      capabilityId: "emi.etabs_live_com",
      label: "ETABS live COM/API",
      kind: "unavailable",
      governingFlag: "ETABS_HOSTED_EXECUTION_CERTIFIED",
      flagValue: ETABS_HOSTED_EXECUTION_CERTIFIED,
      userFacingLabel: "NOT CERTIFIED",
      reason: "Live native COM not certified; export federation only.",
      owner: "external_engineering_tool",
    },
    {
      capabilityId: "emi.etabs_execution",
      label: "ETABS real solver execution",
      kind: "unavailable",
      governingFlag: "ETABS_CONTROLLED_EXECUTION_CERTIFIED",
      flagValue: ETABS_CONTROLLED_EXECUTION_CERTIFIED,
      userFacingLabel: "NOT CERTIFIED",
      reason: "ETABSHosted/Controlled execution remain false.",
      owner: "external_engineering_tool",
    },
    {
      capabilityId: "emi.sap2000",
      label: "SAP2000 adapter",
      kind: "reserved",
      governingFlag: "SAP2000_ADAPTER_IMPLEMENTED",
      flagValue: SAP2000_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "ETABS path does not certify other CSI products.",
      owner: null,
    },
    {
      capabilityId: "emi.safe",
      label: "SAFE adapter",
      kind: "reserved",
      governingFlag: "SAFE_ADAPTER_IMPLEMENTED",
      flagValue: SAFE_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "SAFE not implemented.",
      owner: null,
    },
    {
      capabilityId: "emi.csibridge",
      label: "CSiBridge adapter",
      kind: "reserved",
      governingFlag: "CSIBRIDGE_ADAPTER_IMPLEMENTED",
      flagValue: CSIBRIDGE_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "CSiBridge not implemented.",
      owner: null,
    },
    {
      capabilityId: "emi.revit_native",
      label: "Revit native adapter",
      kind: "reserved",
      governingFlag: "NATIVE_REVIT_ADAPTER_IMPLEMENTED",
      flagValue: NATIVE_REVIT_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "Native Revit adapter not in V1.0.",
      owner: null,
    },
    {
      capabilityId: "emi.navisworks_native",
      label: "Navisworks native adapter",
      kind: "reserved",
      governingFlag: "NATIVE_NAVISWORKS_ADAPTER_IMPLEMENTED",
      flagValue: NATIVE_NAVISWORKS_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "Native Navisworks adapter not in V1.0.",
      owner: null,
    },
    {
      capabilityId: "emi.tekla_native",
      label: "Tekla native adapter",
      kind: "reserved",
      governingFlag: "NATIVE_TEKLA_ADAPTER_IMPLEMENTED",
      flagValue: NATIVE_TEKLA_ADAPTER_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "Native Tekla adapter not in V1.0.",
      owner: null,
    },
    {
      capabilityId: "emi.analysis_model_generation",
      label: "Analysis-model generation",
      kind: "reserved",
      governingFlag: "ANALYSIS_MODEL_GENERATION_IMPLEMENTED",
      flagValue: ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE — reserved",
      reason: "Analysis-model generation not implemented.",
      owner: null,
    },
    {
      capabilityId: "emi.automatic_analysis_model_certification",
      label: "Automatic analysis-model certification",
      kind: "unavailable",
      governingFlag: "AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED",
      flagValue: AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
      userFacingLabel: "UNAVAILABLE",
      reason: "Automatic analysis-model certification disabled.",
      owner: "human_only",
    },
    {
      capabilityId: "emi.source_model_mutation",
      label: "Source-model mutation",
      kind: "unavailable",
      governingFlag: "MODEL_MUTATION_IMPLEMENTED",
      flagValue: MODEL_MUTATION_IMPLEMENTED,
      userFacingLabel: "UNAVAILABLE",
      reason: "Source models remain client-owned; RTB does not mutate them.",
      owner: "source_client_engineering_application",
    },
    {
      capabilityId: "emi.automatic_mapping_approval",
      label: "Automatic mapping approval",
      kind: "unavailable",
      governingFlag: "AUTOMATIC_MAPPING_APPROVAL_ENABLED",
      flagValue: AUTOMATIC_MAPPING_APPROVAL_ENABLED,
      userFacingLabel: "UNAVAILABLE — human review required",
      reason: "Mapping approval stays human-governed.",
      owner: "human_only",
    },
    {
      capabilityId: "emi.silent_solver_fallback",
      label: "Silent solver fallback",
      kind: "unavailable",
      governingFlag: "SILENT_SOLVER_FALLBACK_ALLOWED",
      flagValue: SILENT_SOLVER_FALLBACK_ALLOWED,
      userFacingLabel: "UNAVAILABLE — fail-closed",
      reason: "No silent CalculiX/SPACE GASS/ETABS/fixture substitution.",
      owner: null,
    },
  ] as const;

export function listUnavailableCapabilities(): readonly UnavailableCapabilityEntry[] {
  return EMI_UNAVAILABLE_CAPABILITIES;
}

export function isCapabilityUnavailable(capabilityId: string): boolean {
  return EMI_UNAVAILABLE_CAPABILITIES.some((e) => e.capabilityId === capabilityId);
}

export function assertUnavailableCapabilitiesClosed(): {
  ok: true;
  version: string;
  unavailableCount: number;
} {
  for (const entry of EMI_UNAVAILABLE_CAPABILITIES) {
    if (entry.flagValue !== false) {
      throw new Error(`unavailable_capability_opened:${entry.capabilityId}`);
    }
    if (
      !entry.userFacingLabel.includes("UNAVAILABLE") &&
      !entry.userFacingLabel.includes("NOT CERTIFIED")
    ) {
      throw new Error(`unavailable_capability_mislabelled:${entry.capabilityId}`);
    }
  }
  return {
    ok: true,
    version: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
    unavailableCount: EMI_UNAVAILABLE_CAPABILITIES.length,
  };
}
