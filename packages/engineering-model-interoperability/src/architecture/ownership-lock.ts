/**
 * Phase 13A — Engineering Model Interoperability ownership lock.
 *
 * Preserves asset / project / spatial / DT / ETF ownership. External models and
 * solvers remain source-owned. Discovery must not invent a second tool framework.
 */

import {
  ANALYSIS_MODEL_GENERATION_BOUNDARY_LOCKED,
  AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED,
  CANONICAL_ASSET_OWNERSHIP,
  CANONICAL_PROJECT_OWNERSHIP,
  CANONICAL_SPATIAL_OWNERSHIP,
  CSI_PRODUCT_ADAPTERS_REMAIN_SEPARATE,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_V1_COMMIT,
  DIGITAL_TWIN_V1_VERSION,
  DUPLICATE_ASSET_OWNERSHIP_DETECTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  DUPLICATE_SPATIAL_OWNERSHIP_DETECTED,
  DUPLICATE_TOOL_FRAMEWORK_DETECTED,
  ENGINEERING_FEDERATION_MODEL_LOCKED,
  ENGINEERING_MODEL_INTEROPERABILITY_KEY,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP,
  EXTERNAL_MODEL_OWNERSHIP,
  EXTERNAL_SOLVER_OWNERSHIP,
  IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED,
  INTEROP_DISCOVERY_READY,
  MODEL_AUTHORING_BOUNDARY_LOCKED,
  MODEL_FEDERATION_BOUNDARY_LOCKED,
  PHASE_13B_READY,
  PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED,
  PUBLIC_CONTRACT_VERSION,
  RESULT_FEDERATION_BOUNDARY_LOCKED,
  REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK,
  SOLVER_EXECUTION_BOUNDARY_LOCKED,
  SOURCE_MODEL_OWNERSHIP_PRESERVED,
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
  | "forbidden";

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
      notes: "Discovery + draft contracts for federated model references",
    },
    {
      concern: "result_federation_semantics",
      owner: "engineering_model_interoperability",
      relation: "owns",
      notes: "Discovery for federated analysis result references",
    },
    {
      concern: "solver_execution_orchestration",
      owner: "digital_twin",
      relation: "reuses",
      notes:
        "Reuse EngineeringSolverAdapter + four-layer qualification — no second framework",
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
      notes: "Solvers remain external engineering tools",
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
      notes: "DT V1.0.0 intact; interop discovery is additive outside DT package",
    },
    {
      concern: "ifc_first_class_path",
      owner: "engineering_model_interoperability",
      relation: "reserved",
      notes: "IFC/openBIM first-class vendor-neutral path — not sole pathway",
    },
    {
      concern: "production_interop_runtime",
      owner: "engineering_model_interoperability",
      relation: "forbidden",
      notes: "productionInteroperabilityRuntimeImplemented=false in 13A",
    },
    {
      concern: "automatic_analysis_model_certification",
      owner: "engineering_model_interoperability",
      relation: "forbidden",
      notes: "automaticAnalysisModelCertificationEnabled=false always in 13A",
    },
    {
      concern: "second_solver_framework",
      owner: "forbidden",
      relation: "forbidden",
      notes: "duplicateToolFrameworkDetected must remain false",
    },
  ] as const;

export function assertEngineeringInteropOwnershipLock(): {
  ok: true;
  InteropDiscoveryReady: true;
  EngineeringFederationModelLocked: true;
  ModelFederationBoundaryLocked: true;
  ResultFederationBoundaryLocked: true;
  SolverExecutionBoundaryLocked: true;
  IFCFirstClassInteroperabilityReserved: true;
  productionInteroperabilityRuntimeImplemented: false;
  automaticAnalysisModelCertificationEnabled: false;
  duplicateToolFrameworkDetected: false;
  sourceModelOwnershipPreserved: true;
  duplicateAssetOwnershipDetected: false;
  duplicateProjectOwnershipDetected: false;
  duplicateSpatialOwnershipDetected: false;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
  phase13BReady: true;
  digitalTwinV1Version: typeof DIGITAL_TWIN_V1_VERSION;
  digitalTwinV1Commit: typeof DIGITAL_TWIN_V1_COMMIT;
} {
  assertTerminologyLocks();

  if (ENGINEERING_MODEL_INTEROPERABILITY_VERSION !== "0.1.0-interop-discovery") {
    throw new Error("interop_discovery_version_mismatch");
  }
  if (ENGINEERING_MODEL_INTEROPERABILITY_KEY !== "engineering_model_interoperability") {
    throw new Error("interop_discovery_key_mismatch");
  }
  if (!INTEROP_DISCOVERY_READY) {
    throw new Error("interop_discovery_not_ready");
  }
  if (!ENGINEERING_FEDERATION_MODEL_LOCKED) {
    throw new Error("engineering_federation_model_must_be_locked");
  }
  if (
    !MODEL_FEDERATION_BOUNDARY_LOCKED ||
    !RESULT_FEDERATION_BOUNDARY_LOCKED ||
    !SOLVER_EXECUTION_BOUNDARY_LOCKED ||
    !MODEL_AUTHORING_BOUNDARY_LOCKED ||
    !ANALYSIS_MODEL_GENERATION_BOUNDARY_LOCKED
  ) {
    throw new Error("interop_boundaries_must_be_locked");
  }
  if (!IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED) {
    throw new Error("ifc_first_class_path_must_be_reserved");
  }
  if (PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED) {
    throw new Error("production_interop_runtime_forbidden_in_13a");
  }
  if (AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED) {
    throw new Error("automatic_analysis_model_certification_forbidden");
  }
  if (DUPLICATE_TOOL_FRAMEWORK_DETECTED) {
    throw new Error("duplicate_tool_framework_detected");
  }
  if (!REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK) {
    throw new Error("must_reuse_digital_twin_solver_adapter_framework");
  }
  if (!SOURCE_MODEL_OWNERSHIP_PRESERVED) {
    throw new Error("source_model_ownership_must_be_preserved");
  }
  if (
    DUPLICATE_ASSET_OWNERSHIP_DETECTED ||
    DUPLICATE_PROJECT_OWNERSHIP_DETECTED ||
    DUPLICATE_SPATIAL_OWNERSHIP_DETECTED
  ) {
    throw new Error("duplicate_identity_ownership_detected");
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
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-draft") {
    throw new Error("public_contracts_must_remain_draft");
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
  if (!PHASE_13B_READY) {
    throw new Error("phase_13b_ready_flag_required");
  }

  const secondFramework = ENGINEERING_INTEROP_OWNERSHIP_MATRIX.some(
    (row) =>
      row.concern === "second_solver_framework" && row.relation !== "forbidden",
  );
  if (secondFramework) {
    throw new Error("second_solver_framework_must_remain_forbidden");
  }

  return {
    ok: true,
    InteropDiscoveryReady: true,
    EngineeringFederationModelLocked: true,
    ModelFederationBoundaryLocked: true,
    ResultFederationBoundaryLocked: true,
    SolverExecutionBoundaryLocked: true,
    IFCFirstClassInteroperabilityReserved: true,
    productionInteroperabilityRuntimeImplemented: false,
    automaticAnalysisModelCertificationEnabled: false,
    duplicateToolFrameworkDetected: false,
    sourceModelOwnershipPreserved: true,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateSpatialOwnershipDetected: false,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
    phase13BReady: true,
    digitalTwinV1Version: DIGITAL_TWIN_V1_VERSION,
    digitalTwinV1Commit: DIGITAL_TWIN_V1_COMMIT,
  };
}
