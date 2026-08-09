/**
 * Phase 13A — Provider discovery matrix.
 *
 * Capability flags are independent per provider. Discovery ≠ implementation.
 * Existing Digital Twin reserved stubs are inventoried without modifying DT.
 */

export type ProviderCapabilityFlags = {
  modelFederationSupported: boolean;
  resultFederationSupported: boolean;
  solverExecutionSupported: boolean;
  modelMutationSupported: boolean;
  analysisModelGenerationSupported: boolean;
};

export type ProviderDiscoveryRow = {
  providerKey: string;
  displayName: string;
  category:
    | "openbim"
    | "bim_authoring"
    | "coordination"
    | "structural_analysis"
    | "fea_cfd"
    | "existing_certified";
  capabilities: ProviderCapabilityFlags;
  /** Reserved stub already present under Digital Twin (document only). */
  digitalTwinReservedStub: boolean;
  /** IFC/openBIM + SPACE GASS + ETABS export federation are production-implemented in Phase 13E. */
  productionAdapterImplemented: boolean;
  notes: string;
};

function caps(
  partial: Partial<ProviderCapabilityFlags> &
    Pick<ProviderCapabilityFlags, "modelFederationSupported">,
): ProviderCapabilityFlags {
  return {
    modelFederationSupported: partial.modelFederationSupported,
    resultFederationSupported: partial.resultFederationSupported ?? false,
    solverExecutionSupported: partial.solverExecutionSupported ?? false,
    modelMutationSupported: partial.modelMutationSupported ?? false,
    analysisModelGenerationSupported:
      partial.analysisModelGenerationSupported ?? false,
  };
}

/**
 * Candidate inventory. Flags express expected future support classes —
 * none are production-implemented in Phase 13A.
 */
export const PROVIDER_DISCOVERY_MATRIX: readonly ProviderDiscoveryRow[] = [
  {
    providerKey: "ifc_openbim",
    displayName: "IFC / openBIM",
    category: "openbim",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: true,
    notes:
      "Phase 13B production IFC/openBIM federation adapter. Native adapters remain optional/unimplemented.",
  },
  {
    providerKey: "revit",
    displayName: "Autodesk Revit",
    category: "bim_authoring",
    capabilities: caps({
      modelFederationSupported: true,
      modelMutationSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes: "Authoring federation candidate — mutation remains source-owned.",
  },
  {
    providerKey: "navisworks",
    displayName: "Autodesk Navisworks",
    category: "coordination",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes: "Coordination / federated model review candidate.",
  },
  {
    providerKey: "tekla",
    displayName: "Trimble Tekla",
    category: "bim_authoring",
    capabilities: caps({
      modelFederationSupported: true,
      modelMutationSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes: "Structural detailing / authoring federation candidate.",
  },
  {
    providerKey: "spacegass",
    displayName: "SPACE GASS",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: true,
    notes:
      "Phase 13C production SPACE GASS model/result federation + interop-hosted fail-closed solver adapter (hostedExecutionCertified=false). DT stub remains non-activatable inside frozen DT package.",
  },
  {
    providerKey: "etabs",
    displayName: "CSI ETABS",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: true,
    notes:
      "Phase 13E ETABS export/fixture federation + fail-closed solver adapter (ETABSHostedExecutionCertified=false; not live native COM). CSIInteropCore is internal helper only; SAP2000/SAFE/CSiBridge remain separate/unimplemented.",
  },
  {
    providerKey: "sap2000",
    displayName: "CSI SAP2000",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
      analysisModelGenerationSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "CSI family candidate — separate from ETABS adapter/qualification.",
  },
  {
    providerKey: "safe",
    displayName: "CSI SAFE",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes: "CSI family product — assess via optional CSIInteropCore; adapters remain separate.",
  },
  {
    providerKey: "csibridge",
    displayName: "CSI CSiBridge",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes: "CSI family product — adapters/qualifications remain product-specific.",
  },
  {
    providerKey: "staad",
    displayName: "STAAD",
    category: "structural_analysis",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "DT reserved stub `staad` — discovery only.",
  },
  {
    providerKey: "opensees",
    displayName: "OpenSees",
    category: "fea_cfd",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "DT reserved stub — not production-qualified in V1.",
  },
  {
    providerKey: "calculix",
    displayName: "CalculiX (ccx)",
    category: "existing_certified",
    capabilities: caps({
      modelFederationSupported: false,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: false,
    productionAdapterImplemented: false,
    notes:
      "Existing Digital Twin V1 certified linear-static execution path ONLY. Interop package must not re-implement.",
  },
  {
    providerKey: "abaqus",
    displayName: "Abaqus",
    category: "fea_cfd",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "DT reserved stub — commercial FEA candidate.",
  },
  {
    providerKey: "openfoam",
    displayName: "OpenFOAM",
    category: "fea_cfd",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "DT reserved stub — CFD candidate.",
  },
  {
    providerKey: "ansys",
    displayName: "ANSYS",
    category: "fea_cfd",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes: "DT reserved stub — commercial multiphysics candidate.",
  },
  {
    providerKey: "other_etf_providers",
    displayName: "Other Engineering Tool Framework providers",
    category: "fea_cfd",
    capabilities: caps({
      modelFederationSupported: true,
      resultFederationSupported: true,
      solverExecutionSupported: true,
    }),
    digitalTwinReservedStub: true,
    productionAdapterImplemented: false,
    notes:
      "Catch-all for additional ETF-registered tools — reuse existing framework; no duplicate ETF.",
  },
] as const;

export function getProviderDiscoveryRow(
  providerKey: string,
): ProviderDiscoveryRow | undefined {
  return PROVIDER_DISCOVERY_MATRIX.find((row) => row.providerKey === providerKey);
}

export function assertProviderDiscoveryMatrix(): {
  ok: true;
  providerCount: number;
  etabsDiscovered: true;
  spaceGassDiscovered: true;
  ifcReserved: true;
  ifcProductionAdapter: true;
  spacegassProductionAdapter: true;
  etabsProductionAdapter: true;
  sap2000ProductionAdapter: false;
  safeProductionAdapter: false;
  csibridgeProductionAdapter: false;
} {
  const etabs = getProviderDiscoveryRow("etabs");
  const spacegass = getProviderDiscoveryRow("spacegass");
  const ifc = getProviderDiscoveryRow("ifc_openbim");
  const sap2000 = getProviderDiscoveryRow("sap2000");
  const safe = getProviderDiscoveryRow("safe");
  const csibridge = getProviderDiscoveryRow("csibridge");
  if (!etabs?.capabilities.modelFederationSupported) {
    throw new Error("etabs_integration_not_discovered");
  }
  if (!spacegass?.capabilities.modelFederationSupported) {
    throw new Error("spacegass_integration_not_discovered");
  }
  if (!ifc?.capabilities.modelFederationSupported) {
    throw new Error("ifc_first_class_path_not_reserved");
  }
  if (!ifc.productionAdapterImplemented) {
    throw new Error("ifc_production_adapter_required");
  }
  if (!spacegass.productionAdapterImplemented) {
    throw new Error("spacegass_production_adapter_required");
  }
  if (!etabs.productionAdapterImplemented) {
    throw new Error("etabs_production_adapter_required_in_13e");
  }
  if (
    sap2000?.productionAdapterImplemented ||
    safe?.productionAdapterImplemented ||
    csibridge?.productionAdapterImplemented
  ) {
    throw new Error("other_csi_production_adapters_forbidden_in_13e");
  }
  const allowedProduction = new Set(["ifc_openbim", "spacegass", "etabs"]);
  for (const row of PROVIDER_DISCOVERY_MATRIX) {
    if (row.productionAdapterImplemented && !allowedProduction.has(row.providerKey)) {
      throw new Error(`native_production_adapter_forbidden_in_13e:${row.providerKey}`);
    }
  }
  return {
    ok: true,
    providerCount: PROVIDER_DISCOVERY_MATRIX.length,
    etabsDiscovered: true,
    spaceGassDiscovered: true,
    ifcReserved: true,
    ifcProductionAdapter: true,
    spacegassProductionAdapter: true,
    etabsProductionAdapter: true,
    sap2000ProductionAdapter: false,
    safeProductionAdapter: false,
    csibridgeProductionAdapter: false,
  };
}
