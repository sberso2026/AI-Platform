/**
 * Phase 13E — Engineering Model Interoperability ownership lock
 * (IFC + SPACE GASS + ETABS export federation / interop-hosted fail-closed solvers).
 *
 * Preserves asset / project / spatial / DT / ETF ownership. External models remain
 * source-owned. DT V1 frozen — ETABS/SPACE GASS execution hosted here consuming DT contracts.
 */

import {
  ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED,
  ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  CANONICAL_ASSET_OWNERSHIP,
  CANONICAL_PROJECT_OWNERSHIP,
  CANONICAL_SPATIAL_OWNERSHIP,
  CONTROLLED_ENGINEERING_EXECUTION_HOST_READY,
  CSI_PRODUCT_ADAPTERS_REMAIN_SEPARATE,
  CSIBRIDGE_ADAPTER_IMPLEMENTED,
  DIGITAL_TWIN_MAY_OWN_SOURCE_MODEL,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  DUPLICATE_MODEL_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  DUPLICATE_SPATIAL_OWNERSHIP_DETECTED,
  DUPLICATE_TOOL_FRAMEWORK_DETECTED,
  ENGINEERING_FEDERATION_MODEL_LOCKED,
  ENGINEERING_MODEL_INTEROPERABILITY_KEY,
  ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP,
  ETABS_CONTROLLED_EXECUTION_CERTIFIED,
  ETABS_HOSTED_EXECUTION_CERTIFIED,
  ETABS_MODEL_FEDERATION_READY,
  ETABS_RESULT_FEDERATION_READY,
  ETABS_SOLVER_ADAPTER_READY,
  EXTERNAL_MODEL_OWNERSHIP,
  EXTERNAL_SOLVER_OWNERSHIP,
  FULL_BIM_VIEWER_IMPLEMENTED,
  IFC_FEDERATION_READY,
  IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED,
  IFC_PRODUCTION_ADAPTER_IMPLEMENTED,
  INTEROP_DISCOVERY_READY,
  MODEL_BINARY_STORAGE_IN_POSTGRES,
  MODEL_INTEROPERABILITY_OWNERSHIP,
  MODEL_MUTATION_IMPLEMENTED,
  NATIVE_ETABS_ADAPTER_IMPLEMENTED,
  NATIVE_REVIT_ADAPTER_IMPLEMENTED,
  NATIVE_SAP2000_ADAPTER_IMPLEMENTED,
  NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED,
  PHASE_13A_CERTIFIED_COMMIT,
  PHASE_13B_CERTIFIED_COMMIT,
  PHASE_13C_CERTIFIED_COMMIT,
  PHASE_13C_READY,
  PHASE_13D1_CERTIFIED_COMMIT,
  PHASE_13D_READY,
  PHASE_13E_READY,
  PHASE_13F_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK,
  SAFE_ADAPTER_IMPLEMENTED,
  SAP2000_ADAPTER_IMPLEMENTED,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SOLVER_EXECUTION_IMPLEMENTED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
  SPACEGASS_FEDERATION_READY,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
  SPACEGASS_LIVE_PROVIDER_READY,
  SPACEGASS_PRODUCTION_ADAPTER_IMPLEMENTED,
  SPACEGASS_SOLVER_ADAPTER_READY,
  SPACE_GASS_HOSTED_EXECUTION_CERTIFIED,
} from "../version";
import { assertTerminologyLocks } from "./terminology-lock";

export type InteropDomainOwner =
  | "engineering_model_interoperability"
  | "engineering_os_shared_domain"
  | "engineering_os_shared_project_domain"
  | "engineering_os_shared_spatial_domain"
  | "digital_twin"
  | "platform_intelligence"
  | "source_client_engineering_application"
  | "external_engineering_tool"
  | "forbidden";

export type InteropBoundaryRelation =
  | "owns"
  | "consumes"
  | "references"
  | "reuses"
  | "reserved"
  | "must_never_own"
  | "forbidden"
  | "implements";

export type InteropOwnershipRow = {
  concern: string;
  owner: InteropDomainOwner;
  relation: InteropBoundaryRelation;
  notes: string;
};

export const ENGINEERING_INTEROP_OWNERSHIP_MATRIX: readonly InteropOwnershipRow[] =
  [
    {
      concern: "model_federation_semantics",
      owner: "engineering_model_interoperability",
      relation: "owns",
      notes: "Runtime federation references + mappings",
    },
    {
      concern: "result_federation_semantics",
      owner: "engineering_model_interoperability",
      relation: "owns",
      notes: "Federated analysis result references (trust-classified)",
    },
    {
      concern: "ifc_federation_runtime",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes: "IFC/openBIM production adapter — first-class vendor-neutral path",
    },
    {
      concern: "spacegass_federation_runtime",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes: "SPACE GASS production model/result federation (fixture export + fail-closed solver)",
    },
    {
      concern: "etabs_federation_runtime",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes:
        "ETABS export/fixture federation + fail-closed solver — NOT live native COM",
    },
    {
      concern: "csi_interop_core",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes: "Internal session/error/metadata helper only — not business domain",
    },
    {
      concern: "solver_execution_orchestration",
      owner: "digital_twin",
      relation: "reuses",
      notes:
        "Reuse EngineeringSolverAdapter + four-layer qualification — no second framework. DT V1 remains CalculiX-only inside frozen package.",
    },
    {
      concern: "spacegass_solver_adapter_host",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes:
        "SPACEGASSSolverAdapter hosted in interop consuming DT public contracts (DT freeze)",
    },
    {
      concern: "etabs_solver_adapter_host",
      owner: "engineering_model_interoperability",
      relation: "implements",
      notes:
        "ETABSSolverAdapter hosted in interop consuming DT public contracts; fail-closed when COM unavailable",
    },
    {
      concern: "engineering_tool_framework",
      owner: "platform_intelligence",
      relation: "reuses",
      notes: "Existing ETF / Platform Tool Registry ownership unchanged",
    },
    {
      concern: "external_model_files",
      owner: "source_client_engineering_application",
      relation: "must_never_own",
      notes: "Federated ≠ owned by RTB; sourceModelOwnershipPreserved=true",
    },
    {
      concern: "external_solver_binaries",
      owner: "external_engineering_tool",
      relation: "must_never_own",
      notes: "Solvers remain external; no ETABS/SPACE GASS binary in-repo",
    },
    {
      concern: "canonical_asset_identity",
      owner: "engineering_os_shared_domain",
      relation: "references",
      notes: "Must not invent a competing asset identity",
    },
    {
      concern: "canonical_project_identity",
      owner: "engineering_os_shared_project_domain",
      relation: "references",
      notes: "Must not invent a competing project identity",
    },
    {
      concern: "canonical_spatial_reference",
      owner: "engineering_os_shared_spatial_domain",
      relation: "references",
      notes: "Must not invent a competing spatial authority",
    },
    {
      concern: "digital_twin_identity",
      owner: "digital_twin",
      relation: "references",
      notes: "DT V1.0.0 intact; interop runtime is additive outside DT package",
    },
    {
      concern: "ifc_first_class_path",
      owner: "engineering_model_interoperability",
      relation: "owns",
      notes: "IFC/openBIM first-class vendor-neutral path — coexistence with SPACE GASS + ETABS",
    },
    {
      concern: "production_sap2000_adapter",
      owner: "forbidden",
      relation: "forbidden",
      notes: "SAP2000 not implemented in 13E",
    },
    {
      concern: "production_safe_adapter",
      owner: "forbidden",
      relation: "forbidden",
      notes: "SAFE not implemented in 13E",
    },
    {
      concern: "production_csibridge_adapter",
      owner: "forbidden",
      relation: "forbidden",
      notes: "CSiBridge not implemented in 13E",
    },
    {
      concern: "automatic_analysis_model_certification",
      owner: "engineering_model_interoperability",
      relation: "forbidden",
      notes: "automaticAnalysisModelCertificationEnabled=false",
    },
    {
      concern: "second_solver_framework",
      owner: "forbidden",
      relation: "forbidden",
      notes: "duplicateToolFrameworkDetected must remain false",
    },
    {
      concern: "full_bim_viewer",
      owner: "forbidden",
      relation: "forbidden",
      notes: "fullBimViewerImplemented=false",
    },
  ] as const;

export function assertEngineeringInteropOwnershipLock(): {
  ok: true;
  InteropDiscoveryReady: true;
  EngineeringFederationModelLocked: true;
  EngineeringModelInteroperabilityRuntimeReady: true;
  IFCFederationReady: true;
  SpaceGassFederationReady: true;
  ETABSModelFederationReady: true;
  ETABSResultFederationReady: true;
  productionInteroperabilityRuntimeImplemented: true;
  ifcProductionAdapterImplemented: true;
  spacegassProductionAdapterImplemented: true;
  SPACEGASSSolverAdapterReady: true;
  ETABSSolverAdapterReady: true;
  ETABSAdapterImplemented: true;
  ETABSHostedExecutionCertified: false;
  ETABSControlledExecutionCertified: false;
  spaceGassHostedExecutionCertified: false;
  SPACEGASSLiveExecutionCertified: false;
  SPACEGASSLiveProviderReady: false;
  ControlledEngineeringExecutionHostReady: true;
  silentSolverFallbackAllowed: false;
  automaticAnalysisModelCertificationEnabled: false;
  solverExecutionImplemented: false;
  additionalExternalSolverExecutionImplemented: true;
  modelMutationImplemented: false;
  analysisModelGenerationImplemented: false;
  fullBimViewerImplemented: false;
  productionMemoryRepositoryAllowed: false;
  duplicateToolFrameworkDetected: false;
  sourceModelOwnershipPreserved: true;
  digitalTwinMayOwnSourceModel: false;
  duplicateModelOwnershipDetected: false;
  duplicateAssetOwnershipDetected: false;
  duplicateProjectOwnershipDetected: false;
  duplicateSpatialOwnershipDetected: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
  phase13CReady: true;
  phase13DReady: true;
  phase13EReady: true;
  phase13FReady: true;
  digitalTwinV1Version: typeof DIGITAL_TWIN_V1_VERSION;
  digitalTwinV1Commit: typeof DIGITAL_TWIN_V1_COMMIT;
  modelInteroperabilityOwnership: typeof MODEL_INTEROPERABILITY_OWNERSHIP;
} {
  assertTerminologyLocks();

  if (ENGINEERING_MODEL_INTEROPERABILITY_VERSION !== "0.4.0-etabs-federation") {
    throw new Error("etabs_federation_version_mismatch");
  }
  if (ENGINEERING_MODEL_INTEROPERABILITY_KEY !== "engineering_model_interoperability") {
    throw new Error("interop_key_mismatch");
  }
  if (!INTEROP_DISCOVERY_READY || !ENGINEERING_FEDERATION_MODEL_LOCKED) {
    throw new Error("discovery_locks_required");
  }
  if (!ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY || !IFC_FEDERATION_READY) {
    throw new Error("ifc_federation_runtime_not_ready");
  }
  if (!SPACEGASS_FEDERATION_READY || !SPACEGASS_PRODUCTION_ADAPTER_IMPLEMENTED) {
    throw new Error("spacegass_federation_not_ready");
  }
  if (!SPACEGASS_SOLVER_ADAPTER_READY || !NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED) {
    throw new Error("spacegass_adapter_not_ready");
  }
  if (
    !ETABS_MODEL_FEDERATION_READY ||
    !ETABS_RESULT_FEDERATION_READY ||
    !ETABS_SOLVER_ADAPTER_READY ||
    !NATIVE_ETABS_ADAPTER_IMPLEMENTED
  ) {
    throw new Error("etabs_federation_not_ready");
  }
  if (!PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED) {
    throw new Error("production_interop_runtime_required");
  }
  if (!IFC_PRODUCTION_ADAPTER_IMPLEMENTED || !IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED) {
    throw new Error("ifc_production_adapter_required");
  }
  if (AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED) {
    throw new Error("automatic_analysis_model_certification_forbidden");
  }
  if (
    SOLVER_EXECUTION_IMPLEMENTED ||
    MODEL_MUTATION_IMPLEMENTED ||
    ANALYSIS_MODEL_GENERATION_IMPLEMENTED ||
    FULL_BIM_VIEWER_IMPLEMENTED
  ) {
    throw new Error("forbidden_capability_enabled_in_13e");
  }
  if (!ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED) {
    throw new Error("external_solver_execution_adapter_required");
  }
  if (SPACE_GASS_HOSTED_EXECUTION_CERTIFIED || SPACEGASS_LIVE_EXECUTION_CERTIFIED) {
    throw new Error("spacegass_live_or_hosted_certified_must_remain_false");
  }
  if (SPACEGASS_LIVE_PROVIDER_READY) {
    throw new Error("spacegass_live_provider_ready_must_remain_false");
  }
  if (ETABS_HOSTED_EXECUTION_CERTIFIED || ETABS_CONTROLLED_EXECUTION_CERTIFIED) {
    throw new Error("etabs_execution_certified_must_remain_false");
  }
  if (SILENT_SOLVER_FALLBACK_ALLOWED) {
    throw new Error("silent_solver_fallback_forbidden");
  }
  if (
    NATIVE_SAP2000_ADAPTER_IMPLEMENTED ||
    SAP2000_ADAPTER_IMPLEMENTED ||
    SAFE_ADAPTER_IMPLEMENTED ||
    CSIBRIDGE_ADAPTER_IMPLEMENTED ||
    NATIVE_REVIT_ADAPTER_IMPLEMENTED
  ) {
    throw new Error("non_etabs_csi_or_authoring_adapters_forbidden_in_13e");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED || MODEL_BINARY_STORAGE_IN_POSTGRES) {
    throw new Error("hosted_persistence_constraints_violated");
  }
  if (DUPLICATE_TOOL_FRAMEWORK_DETECTED) {
    throw new Error("duplicate_tool_framework_detected");
  }
  if (!REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK) {
    throw new Error("must_reuse_digital_twin_solver_adapter_framework");
  }
  if (!SOURCE_MODEL_OWNERSHIP_PRESERVED || DIGITAL_TWIN_MAY_OWN_SOURCE_MODEL) {
    throw new Error("source_model_ownership_violated");
  }
  if (
    DUPLICATE_MODEL_OWNERSHIP_DETECTED ||
    DUPLICATE_ASSET_OWNERSHIP_DETECTED ||
    DUPLICATE_PROJECT_OWNERSHIP_DETECTED ||
    DUPLICATE_SPATIAL_OWNERSHIP_DETECTED
  ) {
    throw new Error("duplicate_identity_ownership_detected");
  }
  if (MODEL_INTEROPERABILITY_OWNERSHIP !== "engineering_model_interoperability") {
    throw new Error("model_interoperability_ownership_mismatch");
  }
  if (CANONICAL_ASSET_OWNERSHIP !== "engineering_os_shared_domain") {
    throw new Error("asset_identity_must_remain_shared_domain");
  }
  if (CANONICAL_PROJECT_OWNERSHIP !== "engineering_os_shared_project_domain") {
    throw new Error("project_identity_must_remain_shared_project_domain");
  }
  if (CANONICAL_SPATIAL_OWNERSHIP !== "engineering_os_shared_spatial_domain") {
    throw new Error("spatial_identity_must_remain_shared_spatial_domain");
  }
  if (DIGITAL_TWIN_OWNERSHIP !== "digital_twin") {
    throw new Error("digital_twin_ownership_mismatch");
  }
  if (ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP !== "platform_intelligence") {
    throw new Error("etf_ownership_must_remain_platform_intelligence");
  }
  if (EXTERNAL_MODEL_OWNERSHIP !== "source_client_engineering_application") {
    throw new Error("external_model_ownership_mismatch");
  }
  if (EXTERNAL_SOLVER_OWNERSHIP !== "external_engineering_tool") {
    throw new Error("external_solver_ownership_mismatch");
  }
  if (!CSI_PRODUCT_ADAPTERS_REMAIN_SEPARATE) {
    throw new Error("csi_product_adapters_must_remain_separate");
  }
  if (!CONTROLLED_ENGINEERING_EXECUTION_HOST_READY) {
    throw new Error("controlled_execution_host_ready_required_via_dependency");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.4.0-etabs-federation") {
    throw new Error("public_contracts_must_be_etabs_federation");
  }
  if (PUBLIC_CONTRACT_VERSION === "1.0.0") {
    throw new Error("public_contracts_must_not_be_ga");
  }
  if (DIGITAL_TWIN_V1_VERSION !== "1.0.0") {
    throw new Error("digital_twin_v1_version_pin_mismatch");
  }
  if (DIGITAL_TWIN_V1_COMMIT !== "a94425ed009ca087c2f44c9d3757c0c82bd936b1") {
    throw new Error("digital_twin_v1_commit_pin_mismatch");
  }
  if (PHASE_13A_CERTIFIED_COMMIT !== "5d238f24a3c61b95011c6c2a0ab2f1bf81540267") {
    throw new Error("phase_13a_commit_pin_mismatch");
  }
  if (PHASE_13B_CERTIFIED_COMMIT !== "1540f806ada0cf70179c3cfdffe4157f29620778") {
    throw new Error("phase_13b_commit_pin_mismatch");
  }
  if (PHASE_13C_CERTIFIED_COMMIT !== "a1c73721326927b507bb7c2f456d6188dd00e8b9") {
    throw new Error("phase_13c_commit_pin_mismatch");
  }
  if (PHASE_13D1_CERTIFIED_COMMIT !== "0bbe0c7bc686615231167f9d56cad2481c627026") {
    throw new Error("phase_13d1_commit_pin_mismatch");
  }
  if (!PHASE_13C_READY || !PHASE_13D_READY || !PHASE_13E_READY) {
    throw new Error("phase_ready_flags_required");
  }
  if (!PHASE_13F_READY) {
    throw new Error("phase_13f_ready_flag_required_as_flag_only");
  }

  return {
    ok: true,
    InteropDiscoveryReady: true,
    EngineeringFederationModelLocked: true,
    EngineeringModelInteroperabilityRuntimeReady: true,
    IFCFederationReady: true,
    SpaceGassFederationReady: true,
    ETABSModelFederationReady: true,
    ETABSResultFederationReady: true,
    productionInteroperabilityRuntimeImplemented: true,
    ifcProductionAdapterImplemented: true,
    spacegassProductionAdapterImplemented: true,
    SPACEGASSSolverAdapterReady: true,
    ETABSSolverAdapterReady: true,
    ETABSAdapterImplemented: true,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    spaceGassHostedExecutionCertified: false,
    SPACEGASSLiveExecutionCertified: false,
    SPACEGASSLiveProviderReady: false,
    ControlledEngineeringExecutionHostReady: true,
    silentSolverFallbackAllowed: false,
    automaticAnalysisModelCertificationEnabled: false,
    solverExecutionImplemented: false,
    additionalExternalSolverExecutionImplemented: true,
    modelMutationImplemented: false,
    analysisModelGenerationImplemented: false,
    fullBimViewerImplemented: false,
    productionMemoryRepositoryAllowed: false,
    duplicateToolFrameworkDetected: false,
    sourceModelOwnershipPreserved: true,
    digitalTwinMayOwnSourceModel: false,
    duplicateModelOwnershipDetected: false,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateSpatialOwnershipDetected: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase13CReady: true,
    phase13DReady: true,
    phase13EReady: true,
    phase13FReady: true,
    digitalTwinV1Version: DIGITAL_TWIN_V1_VERSION,
    digitalTwinV1Commit: DIGITAL_TWIN_V1_COMMIT,
    modelInteroperabilityOwnership: MODEL_INTEROPERABILITY_OWNERSHIP,
  };
}
