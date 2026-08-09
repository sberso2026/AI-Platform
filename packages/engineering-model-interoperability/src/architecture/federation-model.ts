/**
 * Phase 13A — Engineering Federation Model (architecture lock).
 *
 * Separates Model Federation, Result Federation, and Solver Execution under
 * project-aware policy. Abstain rather than silent substitute.
 */

import {
  ABSTAIN_RATHER_THAN_SILENT_SUBSTITUTE,
  ENGINEERING_FEDERATION_MODEL_LOCKED,
  MODEL_FEDERATION_BOUNDARY_LOCKED,
  PROJECT_AWARE_SOLVER_POLICY_LOCKED,
  RESULT_FEDERATION_BOUNDARY_LOCKED,
  SOLVER_EXECUTION_BOUNDARY_LOCKED,
} from "../version";

export type FederationLayer =
  | "model_federation"
  | "result_federation"
  | "solver_execution"
  | "model_authoring"
  | "analysis_model_generation";

export type ProjectSolverPolicy = {
  /** Explicit allow-list — empty means abstain (no silent substitute). */
  projectApprovedProviders: readonly string[];
  silentSubstituteForbidden: true;
  abstainWhenNotApproved: true;
};

export type EngineeringFederationModel = {
  locked: true;
  layers: readonly FederationLayer[];
  modelAccessibleImpliesSolverExecutable: false;
  modelFederatedImpliesRtbOwnership: false;
  existingResultsImplyRtbGenerated: false;
  ifcFirstClassVendorNeutralPath: true;
  ifcSolePathway: false;
  nativeAdaptersOptional: true;
  reusesDigitalTwinEngineeringSolverAdapter: true;
  reusesFourLayerQualification: true;
  projectAwareSolverPolicy: ProjectSolverPolicy;
  csiFamily: {
    assessCommonCsiInteropCore: true;
    productSpecificAdaptersRemainSeparate: true;
    products: readonly ["etabs", "sap2000", "safe", "csibridge"];
  };
};

export const ENGINEERING_FEDERATION_MODEL: EngineeringFederationModel = {
  locked: true,
  layers: [
    "model_federation",
    "result_federation",
    "solver_execution",
    "model_authoring",
    "analysis_model_generation",
  ],
  modelAccessibleImpliesSolverExecutable: false,
  modelFederatedImpliesRtbOwnership: false,
  existingResultsImplyRtbGenerated: false,
  ifcFirstClassVendorNeutralPath: true,
  ifcSolePathway: false,
  nativeAdaptersOptional: true,
  reusesDigitalTwinEngineeringSolverAdapter: true,
  reusesFourLayerQualification: true,
  projectAwareSolverPolicy: {
    projectApprovedProviders: [],
    silentSubstituteForbidden: true,
    abstainWhenNotApproved: true,
  },
  csiFamily: {
    assessCommonCsiInteropCore: true,
    productSpecificAdaptersRemainSeparate: true,
    products: ["etabs", "sap2000", "safe", "csibridge"],
  },
};

export function resolveProjectApprovedProvider(input: {
  requestedProviderId: string;
  policy: ProjectSolverPolicy;
}): { approved: boolean; action: "allow" | "abstain"; reason: string } {
  if (!input.policy.projectApprovedProviders.includes(input.requestedProviderId)) {
    return {
      approved: false,
      action: "abstain",
      reason: "provider_not_in_projectApprovedProviders",
    };
  }
  return {
    approved: true,
    action: "allow",
    reason: "provider_project_approved",
  };
}

export function assertEngineeringFederationModel(): {
  ok: true;
  EngineeringFederationModelLocked: true;
  ModelFederationBoundaryLocked: true;
  ResultFederationBoundaryLocked: true;
  SolverExecutionBoundaryLocked: true;
  model: EngineeringFederationModel;
} {
  if (!ENGINEERING_FEDERATION_MODEL_LOCKED || !ENGINEERING_FEDERATION_MODEL.locked) {
    throw new Error("engineering_federation_model_unlocked");
  }
  if (
    !MODEL_FEDERATION_BOUNDARY_LOCKED ||
    !RESULT_FEDERATION_BOUNDARY_LOCKED ||
    !SOLVER_EXECUTION_BOUNDARY_LOCKED
  ) {
    throw new Error("federation_boundaries_unlocked");
  }
  if (!PROJECT_AWARE_SOLVER_POLICY_LOCKED || !ABSTAIN_RATHER_THAN_SILENT_SUBSTITUTE) {
    throw new Error("project_aware_solver_policy_unlocked");
  }
  if (ENGINEERING_FEDERATION_MODEL.ifcSolePathway) {
    throw new Error("ifc_must_not_be_sole_pathway");
  }
  if (!ENGINEERING_FEDERATION_MODEL.reusesDigitalTwinEngineeringSolverAdapter) {
    throw new Error("must_reuse_dt_engineering_solver_adapter");
  }
  return {
    ok: true,
    EngineeringFederationModelLocked: true,
    ModelFederationBoundaryLocked: true,
    ResultFederationBoundaryLocked: true,
    SolverExecutionBoundaryLocked: true,
    model: ENGINEERING_FEDERATION_MODEL,
  };
}
