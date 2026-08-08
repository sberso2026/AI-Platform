/**
 * Phase 12H — SimulationReproducibilityAssessment.
 */

export const REPRODUCIBILITY_OUTCOMES = [
  "reproducible_within_bounds",
  "conditionally_reproducible",
  "not_reproducible",
  "insufficient_evidence",
  "unknown",
] as const;

export type ReproducibilityOutcome = (typeof REPRODUCIBILITY_OUTCOMES)[number];

export type SimulationReproducibilityAssessment = {
  reproducibilityId: string;
  packageId: string;
  packageVersionId: string;
  runId?: string;
  outcome: ReproducibilityOutcome;
  reasons: string[];
  environmentId?: string;
  manifestHash?: string;
  claimsBitExactUniversal: false;
  assessedAt: string;
  createdBy?: string;
};

export function assessSimulationReproducibility(input: {
  reproducibilityId: string;
  packageId: string;
  packageVersionId: string;
  runId?: string;
  packageSealed: boolean;
  integrityHashMatch: boolean;
  environmentRecorded: boolean;
  environmentId?: string;
  manifestHash?: string;
  createdBy?: string;
}): SimulationReproducibilityAssessment {
  const reasons: string[] = [];
  let outcome: ReproducibilityOutcome = "unknown";

  if (!input.packageSealed) {
    reasons.push("package_not_sealed");
    outcome = "insufficient_evidence";
  } else if (!input.integrityHashMatch) {
    reasons.push("integrity_hash_mismatch");
    outcome = "not_reproducible";
  } else if (!input.environmentRecorded) {
    reasons.push("execution_environment_missing");
    outcome = "conditionally_reproducible";
  } else {
    reasons.push("sealed_package_integrity_and_environment_present");
    outcome = "reproducible_within_bounds";
  }

  return {
    reproducibilityId: input.reproducibilityId,
    packageId: input.packageId,
    packageVersionId: input.packageVersionId,
    runId: input.runId,
    outcome,
    reasons,
    environmentId: input.environmentId,
    manifestHash: input.manifestHash,
    claimsBitExactUniversal: false,
    assessedAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
}
