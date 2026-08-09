/**
 * Phase 13F — frozen Engineering Model Interoperability V1.0 capability registry.
 */

import {
  ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
  AUTOMATIC_MAPPING_APPROVAL_ENABLED,
  CSIBRIDGE_ADAPTER_IMPLEMENTED,
  ENGINEERING_MODEL_INTEROPERABILITY_KEY,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABS_CONTROLLED_EXECUTION_CERTIFIED,
  ETABS_HOSTED_EXECUTION_CERTIFIED,
  ETABS_MODEL_FEDERATION_READY,
  ETABS_RESULT_FEDERATION_READY,
  IFC_FEDERATION_READY,
  MODEL_MUTATION_IMPLEMENTED,
  SAFE_ADAPTER_IMPLEMENTED,
  SAP2000_ADAPTER_IMPLEMENTED,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
  SPACEGASS_LIVE_PROVIDER_READY,
  SPACEGASS_MODEL_FEDERATION_READY,
  SPACEGASS_RESULT_FEDERATION_READY,
  SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED,
  SPACE_GASS_HOSTED_EXECUTION_CERTIFIED,
} from "../version";

export type EmiCapabilityMaturity =
  | "ga"
  | "ga_bounded"
  | "unavailable"
  | "reserved"
  | "blocked_external_dependency";

export type EmiCapabilityEntry = {
  id: string;
  surface: string;
  maturity: EmiCapabilityMaturity;
  entitlement: string;
  mutatesSourceModel: false;
  impliesProviderAvailability: false;
  implementationRef: string | null;
  note: string;
};

export const EMI_CAPABILITY_CATALOG: readonly EmiCapabilityEntry[] = [
  {
    id: "emi.model_reference",
    surface: "models",
    maturity: "ga",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/engineering-model-reference",
    note: "Engineering model references — source-owned.",
  },
  {
    id: "emi.model_versioning",
    surface: "versions",
    maturity: "ga",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/engineering-model-reference",
    note: "Model version lineage without binary storage in Postgres.",
  },
  {
    id: "emi.element_references",
    surface: "elements",
    maturity: "ga",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/engineering-model-element-reference",
    note: "Element references for federation mapping.",
  },
  {
    id: "emi.federation_service",
    surface: "federation",
    maturity: "ga",
    entitlement: "engineering_model.register",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/federation-service",
    note: "Governed federation service.",
  },
  {
    id: "emi.mapping",
    surface: "mappings",
    maturity: "ga",
    entitlement: "engineering_model.map",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/mappings",
    note: "Canonical mapping candidates require review.",
  },
  {
    id: "emi.mapping_review",
    surface: "reviews",
    maturity: "ga",
    entitlement: "engineering_model.review",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/mappings",
    note: "Human-governed mapping review.",
  },
  {
    id: "emi.change_impact",
    surface: "change_impact",
    maturity: "ga",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/change-impact",
    note: "Bounded change-impact records.",
  },
  {
    id: "emi.result_references",
    surface: "results",
    maturity: "ga",
    entitlement: "engineering_result.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/result-reference",
    note: "Existing external results remain source_declared.",
  },
  {
    id: "emi.ifc_federation",
    surface: "ifc",
    maturity: IFC_FEDERATION_READY ? "ga" : "unavailable",
    entitlement: "ifc.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/ifc-model-adapter",
    note: "IFC/openBIM first-class vendor-neutral path (bounded STEP).",
  },
  {
    id: "emi.spacegass_model_federation",
    surface: "spacegass",
    maturity: SPACEGASS_MODEL_FEDERATION_READY ? "ga" : "unavailable",
    entitlement: "spacegass.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/spacegass/spacegass-model-adapter",
    note: "SPACE GASS export/model federation.",
  },
  {
    id: "emi.spacegass_result_federation",
    surface: "spacegass",
    maturity: SPACEGASS_RESULT_FEDERATION_READY ? "ga_bounded" : "unavailable",
    entitlement: "spacegass.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/spacegass/spacegass-model-adapter",
    note: "SPACE GASS existing-result federation within export scope.",
  },
  {
    id: "emi.spacegass_live_api",
    surface: "spacegass_live",
    maturity: "blocked_external_dependency",
    entitlement: "spacegass.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: `SPACEGASSLiveProviderReady=${SPACEGASS_LIVE_PROVIDER_READY}; Phase 13D blocked.`,
  },
  {
    id: "emi.spacegass_execution",
    surface: "spacegass_execution",
    maturity: "blocked_external_dependency",
    entitlement: "external_solver.execute",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/spacegass/spacegass-solver-adapter",
    note: `Live/hosted/controlled certified=${SPACEGASS_LIVE_EXECUTION_CERTIFIED}/${SPACE_GASS_HOSTED_EXECUTION_CERTIFIED}/${SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED}.`,
  },
  {
    id: "emi.etabs_model_federation",
    surface: "etabs",
    maturity: ETABS_MODEL_FEDERATION_READY ? "ga" : "unavailable",
    entitlement: "etabs.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/etabs/etabs-model-adapter",
    note: "ETABS export/fixture federation — not live COM.",
  },
  {
    id: "emi.etabs_result_federation",
    surface: "etabs",
    maturity: ETABS_RESULT_FEDERATION_READY ? "ga_bounded" : "unavailable",
    entitlement: "etabs.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/etabs/etabs-model-adapter",
    note: "ETABS existing-result federation within certified export scope.",
  },
  {
    id: "emi.etabs_live_com",
    surface: "etabs_live",
    maturity: "unavailable",
    entitlement: "etabs.federation",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "Live ETABS COM/API not certified in V1.0.",
  },
  {
    id: "emi.etabs_execution",
    surface: "etabs_execution",
    maturity: "unavailable",
    entitlement: "external_solver.execute",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "domain/etabs/etabs-solver-adapter",
    note: `ETABSHosted=${ETABS_HOSTED_EXECUTION_CERTIFIED}; ETABSControlled=${ETABS_CONTROLLED_EXECUTION_CERTIFIED}.`,
  },
  {
    id: "emi.execution_host",
    surface: "execution_host",
    maturity: "ga",
    entitlement: "execution_host.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: "@rtb/engineering-execution-host",
    note: "Controlled Engineering Execution Host — host ≠ solver certified.",
  },
  {
    id: "emi.sap2000",
    surface: "csi",
    maturity: SAP2000_ADAPTER_IMPLEMENTED ? "ga" : "reserved",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "SAP2000 reserved — not certified by ETABS path.",
  },
  {
    id: "emi.safe",
    surface: "csi",
    maturity: SAFE_ADAPTER_IMPLEMENTED ? "ga" : "reserved",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "SAFE reserved.",
  },
  {
    id: "emi.csibridge",
    surface: "csi",
    maturity: CSIBRIDGE_ADAPTER_IMPLEMENTED ? "ga" : "reserved",
    entitlement: "engineering_model.read",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "CSiBridge reserved.",
  },
  {
    id: "emi.analysis_model_generation",
    surface: "authoring",
    maturity: ANALYSIS_MODEL_GENERATION_IMPLEMENTED ? "ga" : "reserved",
    entitlement: "engineering_model.register",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "Analysis-model generation reserved / not implemented.",
  },
  {
    id: "emi.source_model_mutation",
    surface: "authoring",
    maturity: MODEL_MUTATION_IMPLEMENTED ? "ga" : "unavailable",
    entitlement: "engineering_model.register",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "Source-model mutation unavailable.",
  },
  {
    id: "emi.automatic_mapping_approval",
    surface: "mappings",
    maturity: AUTOMATIC_MAPPING_APPROVAL_ENABLED ? "ga" : "unavailable",
    entitlement: "engineering_model.review",
    mutatesSourceModel: false,
    impliesProviderAvailability: false,
    implementationRef: null,
    note: "Automatic mapping approval unavailable — human review required.",
  },
] as const;

export function listCapabilitiesByMaturity(
  maturity: EmiCapabilityMaturity,
): readonly EmiCapabilityEntry[] {
  return EMI_CAPABILITY_CATALOG.filter((c) => c.maturity === maturity);
}

export function assertCapabilityCatalogComplete(): {
  ok: true;
  version: string;
  count: number;
  moduleKey: typeof ENGINEERING_MODEL_INTEROPERABILITY_KEY;
} {
  if (EMI_CAPABILITY_CATALOG.length < 20) {
    throw new Error("capability_catalog_incomplete");
  }
  for (const entry of EMI_CAPABILITY_CATALOG) {
    if (entry.mutatesSourceModel !== false) {
      throw new Error(`capability_mutates_source:${entry.id}`);
    }
    if (entry.impliesProviderAvailability !== false) {
      throw new Error(`capability_implies_provider:${entry.id}`);
    }
  }
  return {
    ok: true,
    version: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
    count: EMI_CAPABILITY_CATALOG.length,
    moduleKey: ENGINEERING_MODEL_INTEROPERABILITY_KEY,
  };
}
