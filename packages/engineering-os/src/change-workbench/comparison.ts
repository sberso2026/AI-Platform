import type { EngineeringImpactAssessment, PotentialImpactCandidate } from "./types";

export function compareAssessments(previous: EngineeringImpactAssessment | null, next: EngineeringImpactAssessment) {
  const prior = new Map((previous?.snapshot.candidates ?? []).map((row) => [row.id, row]));
  const incoming = new Map(next.snapshot.candidates.map((row) => [row.id, row]));
  const newPotential: PotentialImpactCandidate[] = [];
  const preserved: PotentialImpactCandidate[] = [];
  const noLongerApplicable: PotentialImpactCandidate[] = [];
  for (const candidate of next.snapshot.candidates) {
    const was = prior.get(candidate.id);
    if (!was) newPotential.push(candidate);
    else preserved.push(candidate);
  }
  for (const candidate of previous?.snapshot.candidates ?? []) {
    if (!incoming.has(candidate.id)) noLongerApplicable.push(candidate);
  }
  return {
    newPotentialImpacts: newPotential,
    previouslyConfirmed: (previous?.snapshot.candidates ?? []).filter((row) => row.disposition === "CONFIRMED_IMPACT"),
    resolvedOrDismissed: (previous?.snapshot.candidates ?? []).filter((row) =>
      row.disposition === "NOT_IMPACTED" || row.disposition === "DEFERRED",
    ),
    noLongerApplicable,
    preserved,
    priorAssessmentId: previous?.id ?? null,
    priorPreserved: Boolean(previous),
    overwritten: false,
  };
}

export function restoreSafeDispositions(
  previous: EngineeringImpactAssessment | null,
  candidates: PotentialImpactCandidate[],
): PotentialImpactCandidate[] {
  if (!previous) return candidates;
  const prior = new Map(previous.snapshot.candidates.map((row) => [row.id, row]));
  return candidates.map((candidate) => {
    const was = prior.get(candidate.id);
    if (!was) return candidate;
    if (was.evidenceFingerprint !== candidate.evidenceFingerprint) return candidate;
    if (was.disposition === "POTENTIAL_IMPACT") return candidate;
    return {
      ...candidate,
      disposition: was.disposition,
      rationale: was.rationale,
      autoConfirmed: false,
    };
  });
}
