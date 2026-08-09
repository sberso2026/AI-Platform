/**
 * Phase 13A — Terminology separation locks.
 *
 * Independently governed concerns — never collapse into one “interop” blob.
 */

export const INTEROP_TERMINOLOGY_CONCERNS = [
  "ModelFederation",
  "ResultFederation",
  "SolverExecution",
  "ModelAuthoring",
  "AnalysisModelGeneration",
] as const;

export type InteropTerminologyConcern =
  (typeof INTEROP_TERMINOLOGY_CONCERNS)[number];

export type TerminologyLockRow = {
  concern: InteropTerminologyConcern;
  independentlyGoverned: true;
  notes: string;
};

export const INTEROP_TERMINOLOGY_LOCKS: readonly TerminologyLockRow[] = [
  {
    concern: "ModelFederation",
    independentlyGoverned: true,
    notes:
      "Reference/read access to external engineering models without claiming ownership or execution rights.",
  },
  {
    concern: "ResultFederation",
    independentlyGoverned: true,
    notes:
      "Reference/read of existing analysis results — distinct from RTB-generated results.",
  },
  {
    concern: "SolverExecution",
    independentlyGoverned: true,
    notes:
      "Orchestrated via Digital Twin EngineeringSolverAdapter + ETF four-layer qualification — not a second framework.",
  },
  {
    concern: "ModelAuthoring",
    independentlyGoverned: true,
    notes:
      "Create/edit models in source applications — RTB does not become the authoring system by federating.",
  },
  {
    concern: "AnalysisModelGeneration",
    independentlyGoverned: true,
    notes:
      "Generating analysis models from authoring models — never auto-certified (automaticAnalysisModelCertificationEnabled=false).",
  },
] as const;

export const HONESTY_LOCKS = {
  modelAccessibleDoesNotImplySolverExecutable: true,
  modelFederatedDoesNotImplyRtbOwnership: true,
  existingResultsDoNotImplyRtbGenerated: true,
  solverSupportedDoesNotImplyQualified: true,
  solverQualifiedDoesNotImplyProjectApproved: true,
  projectApprovedDoesNotImplyExecutionQualified: true,
  executionQualifiedDoesNotImplyEngineeringApproved: true,
} as const;

export function assertTerminologyLocks(): {
  ok: true;
  concerns: typeof INTEROP_TERMINOLOGY_CONCERNS;
  honesty: typeof HONESTY_LOCKS;
} {
  if (INTEROP_TERMINOLOGY_CONCERNS.length !== 5) {
    throw new Error("interop_terminology_concerns_incomplete");
  }
  for (const row of INTEROP_TERMINOLOGY_LOCKS) {
    if (!row.independentlyGoverned) {
      throw new Error(`terminology_must_be_independently_governed:${row.concern}`);
    }
  }
  for (const [key, value] of Object.entries(HONESTY_LOCKS)) {
    if (value !== true) {
      throw new Error(`honesty_lock_must_remain_true:${key}`);
    }
  }
  return {
    ok: true,
    concerns: INTEROP_TERMINOLOGY_CONCERNS,
    honesty: HONESTY_LOCKS,
  };
}
