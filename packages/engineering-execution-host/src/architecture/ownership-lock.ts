/**
 * Phase 13D.1 — Controlled Engineering Execution Host ownership lock.
 */

import {
  ANALYSIS_MODEL_GENERATION_IMPLEMENTED,
  CONTROLLED_ENGINEERING_EXECUTION_HOST_READY,
  CONTROLLED_EXECUTION_HOST_OWNERSHIP,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_V1_INTACT,
  DUPLICATE_SOLVER_OWNERSHIP_DETECTED,
  DUPLICATE_TOOL_FRAMEWORK_DETECTED,
  ENGINEERING_EXECUTION_ARTIFACT_HANDLING_READY,
  ENGINEERING_EXECUTION_HOST_HEALTH_READY,
  ENGINEERING_EXECUTION_HOST_KEY,
  ENGINEERING_EXECUTION_HOST_REGISTRY_READY,
  ENGINEERING_EXECUTION_HOST_VERSION,
  ENGINEERING_EXECUTION_JOB_READY,
  ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP,
  ETABSAdapterImplemented,
  ETABSExecutionCertified,
  EXECUTION_WORKSPACE_ISOLATION_READY,
  PHASE_13D_RE_CERTIFICATION_READY,
  PROVIDER_HOST_PROBE_READY,
  PUBLIC_CONTRACT_VERSION,
  RELEASE_ELIGIBLE,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SOLVER_OWNERSHIP,
  SOURCE_MODEL_OWNERSHIP,
  SPACEGASSLiveExecutionCertified,
} from "../version";

export type ExecutionHostOwner =
  | "existing_engineering_tool_framework"
  | "platform_or_engineering_execution_infrastructure"
  | "external_engineering_tool"
  | "client_or_source_engineering_application"
  | "digital_twin"
  | "engineering_model_interoperability";

export type ExecutionHostOwnershipRow = {
  concern: string;
  owner: ExecutionHostOwner;
  relation: "owns" | "consumes" | "references" | "reserved" | "must_never_own" | "forbidden";
  notes: string;
};

export const EXECUTION_HOST_OWNERSHIP_MATRIX: readonly ExecutionHostOwnershipRow[] = [
  {
    concern: "engineering_tool_framework",
    owner: "existing_engineering_tool_framework",
    relation: "references",
    notes: "Host reuses existing ETF; does not create a second framework",
  },
  {
    concern: "controlled_execution_host",
    owner: "platform_or_engineering_execution_infrastructure",
    relation: "owns",
    notes: "Host registry, workspace, sandbox, job transport",
  },
  {
    concern: "solver_runtime",
    owner: "external_engineering_tool",
    relation: "must_never_own",
    notes: "Commercial solver remains external/vendor-owned",
  },
  {
    concern: "source_model",
    owner: "client_or_source_engineering_application",
    relation: "must_never_own",
    notes: "Source models remain client/source-owned",
  },
  {
    concern: "digital_twin",
    owner: "digital_twin",
    relation: "must_never_own",
    notes: "DT V1 frozen; host must not own DT semantics",
  },
  {
    concern: "solver_qualification",
    owner: "existing_engineering_tool_framework",
    relation: "forbidden",
    notes: "Qualification remains outside the host",
  },
  {
    concern: "etabs_adapter",
    owner: "platform_or_engineering_execution_infrastructure",
    relation: "reserved",
    notes: "ETABS reserved only; adapter not implemented",
  },
] as const;

export function assertControlledEngineeringExecutionHostOwnershipLock(): {
  ok: true;
  ControlledEngineeringExecutionHostReady: true;
  EngineeringExecutionHostRegistryReady: true;
  EngineeringExecutionJobReady: true;
  EngineeringExecutionHostHealthReady: true;
  ProviderHostProbeReady: true;
  ExecutionWorkspaceIsolationReady: true;
  EngineeringExecutionArtifactHandlingReady: true;
  silentSolverFallbackAllowed: false;
  SPACEGASSLiveExecutionCertified: false;
  ETABSAdapterImplemented: false;
  ETABSExecutionCertified: false;
  analysisModelGenerationImplemented: false;
  duplicateToolFrameworkDetected: false;
  duplicateSolverOwnershipDetected: false;
  DigitalTwinV1Intact: true;
  releaseEligible: true;
  phase13DReCertificationReady: true;
  publicContractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (ENGINEERING_EXECUTION_HOST_VERSION !== "0.1.0-execution-host") {
    throw new Error("execution_host_version_mismatch");
  }
  if (ENGINEERING_EXECUTION_HOST_KEY !== "controlled_engineering_execution_host") {
    throw new Error("execution_host_key_mismatch");
  }
  if (!CONTROLLED_ENGINEERING_EXECUTION_HOST_READY) {
    throw new Error("controlled_engineering_execution_host_not_ready");
  }
  if (!ENGINEERING_EXECUTION_HOST_REGISTRY_READY) {
    throw new Error("host_registry_not_ready");
  }
  if (!ENGINEERING_EXECUTION_JOB_READY) {
    throw new Error("execution_job_not_ready");
  }
  if (!ENGINEERING_EXECUTION_HOST_HEALTH_READY) {
    throw new Error("host_health_not_ready");
  }
  if (!PROVIDER_HOST_PROBE_READY) {
    throw new Error("provider_host_probe_not_ready");
  }
  if (!EXECUTION_WORKSPACE_ISOLATION_READY) {
    throw new Error("workspace_isolation_not_ready");
  }
  if (!ENGINEERING_EXECUTION_ARTIFACT_HANDLING_READY) {
    throw new Error("artifact_handling_not_ready");
  }
  if (SILENT_SOLVER_FALLBACK_ALLOWED) {
    throw new Error("silent_solver_fallback_forbidden");
  }
  if (SPACEGASSLiveExecutionCertified) {
    throw new Error("spacegass_live_execution_must_not_be_certified");
  }
  if (ETABSAdapterImplemented || ETABSExecutionCertified) {
    throw new Error("etabs_must_remain_unimplemented");
  }
  if (ANALYSIS_MODEL_GENERATION_IMPLEMENTED) {
    throw new Error("analysis_model_generation_forbidden");
  }
  if (DUPLICATE_TOOL_FRAMEWORK_DETECTED || DUPLICATE_SOLVER_OWNERSHIP_DETECTED) {
    throw new Error("duplicate_ownership_detected");
  }
  if (!DIGITAL_TWIN_V1_INTACT) {
    throw new Error("digital_twin_v1_must_remain_intact");
  }
  if (!RELEASE_ELIGIBLE) {
    throw new Error("release_eligible_required");
  }
  if (!PHASE_13D_RE_CERTIFICATION_READY) {
    throw new Error("phase_13d_recert_ready_flag_required");
  }
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-execution-host") {
    throw new Error("public_contracts_must_be_execution_host_prerelease");
  }
  if (
    ENGINEERING_TOOL_FRAMEWORK_OWNERSHIP !== "existing_engineering_tool_framework" ||
    CONTROLLED_EXECUTION_HOST_OWNERSHIP !==
      "platform_or_engineering_execution_infrastructure" ||
    SOLVER_OWNERSHIP !== "external_engineering_tool" ||
    SOURCE_MODEL_OWNERSHIP !== "client_or_source_engineering_application" ||
    DIGITAL_TWIN_OWNERSHIP !== "digital_twin"
  ) {
    throw new Error("ownership_constants_mismatch");
  }

  return {
    ok: true,
    ControlledEngineeringExecutionHostReady: true,
    EngineeringExecutionHostRegistryReady: true,
    EngineeringExecutionJobReady: true,
    EngineeringExecutionHostHealthReady: true,
    ProviderHostProbeReady: true,
    ExecutionWorkspaceIsolationReady: true,
    EngineeringExecutionArtifactHandlingReady: true,
    silentSolverFallbackAllowed: false,
    SPACEGASSLiveExecutionCertified: false,
    ETABSAdapterImplemented: false,
    ETABSExecutionCertified: false,
    analysisModelGenerationImplemented: false,
    duplicateToolFrameworkDetected: false,
    duplicateSolverOwnershipDetected: false,
    DigitalTwinV1Intact: true,
    releaseEligible: true,
    phase13DReCertificationReady: true,
    publicContractVersion: PUBLIC_CONTRACT_VERSION,
  };
}
