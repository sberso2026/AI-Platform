/**
 * Control plane vs execution plane separation.
 * Solver qualification decisions stay outside the host.
 */

export type ControlPlaneResponsibility =
  | "job_authorization"
  | "provider_policy"
  | "qualification_references"
  | "job_submission"
  | "status"
  | "audit";

export type ExecutionPlaneResponsibility =
  | "licensed_engineering_software"
  | "temporary_files"
  | "solver_invocation"
  | "native_artifacts";

export const CONTROL_PLANE_RESPONSIBILITIES: readonly ControlPlaneResponsibility[] = [
  "job_authorization",
  "provider_policy",
  "qualification_references",
  "job_submission",
  "status",
  "audit",
] as const;

export const EXECUTION_PLANE_RESPONSIBILITIES: readonly ExecutionPlaneResponsibility[] =
  [
    "licensed_engineering_software",
    "temporary_files",
    "solver_invocation",
    "native_artifacts",
  ] as const;

export type PlaneSeparationDeclaration = {
  controlPlane: typeof CONTROL_PLANE_RESPONSIBILITIES;
  executionPlane: typeof EXECUTION_PLANE_RESPONSIBILITIES;
  solverQualificationOwnedByHost: false;
  methodQualificationOwnedByHost: false;
  silentSolverFallbackAllowed: false;
  reusesEngineeringToolFramework: true;
};

export function getControlVsExecutionPlaneDeclaration(): PlaneSeparationDeclaration {
  return {
    controlPlane: CONTROL_PLANE_RESPONSIBILITIES,
    executionPlane: EXECUTION_PLANE_RESPONSIBILITIES,
    solverQualificationOwnedByHost: false,
    methodQualificationOwnedByHost: false,
    silentSolverFallbackAllowed: false,
    reusesEngineeringToolFramework: true,
  };
}
