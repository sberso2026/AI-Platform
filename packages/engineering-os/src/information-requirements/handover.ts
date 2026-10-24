import type { EngineeringHandoverPackage, EngineeringInformationRequirement, HandoverCompletenessState } from "./types";
import type { RequirementSatisfactionResult } from "./satisfaction";

export type HandoverCompletenessResolution = {
  packageId: string;
  completeness: HandoverCompletenessState;
  missing: RequirementSatisfactionResult[];
  stale: RequirementSatisfactionResult[];
  unaccepted: RequirementSatisfactionResult[];
  superseded: RequirementSatisfactionResult[];
  explanation: string;
  completenessPercent: null;
  humanAcceptanceRequired: true;
  durationMs: number;
};

export function evaluateHandoverCompleteness(input: {
  pkg: EngineeringHandoverPackage;
  requirements: EngineeringInformationRequirement[];
  evaluations: RequirementSatisfactionResult[];
}): HandoverCompletenessResolution {
  const started = Date.now();
  const missing = input.evaluations.filter((row) => !row.received);
  const unaccepted = input.evaluations.filter((row) => row.received && !row.acceptedForPurpose);
  const stale = input.evaluations.filter((row) => row.stale);
  const superseded = input.evaluations.filter((row) => row.superseded);
  const conflicted = input.evaluations.filter((row) => row.conflicted);
  let completeness: HandoverCompletenessState = "COMPLETE";
  if (conflicted.length) completeness = "CONFLICTED";
  else if (stale.length || superseded.length) completeness = "STALE";
  else if (missing.length) completeness = "INCOMPLETE";
  else if (unaccepted.length) completeness = "PARTIAL";
  const readyForReview = completeness === "COMPLETE" && input.evaluations.every((row) => row.acceptedForPurpose);
  return {
    packageId: input.pkg.id,
    completeness: readyForReview ? "COMPLETE" : completeness,
    missing,
    stale,
    unaccepted,
    superseded,
    explanation:
      completeness === "COMPLETE"
        ? "Configured handover information is present and accepted for purpose. Human package acceptance is still required."
        : completeness === "INCOMPLETE"
          ? "Handover is incomplete: required information is missing."
          : completeness === "STALE"
            ? "Handover information is stale or superseded."
            : completeness === "CONFLICTED"
              ? "Handover information has conflicting authority."
              : "Handover is partial: some required information is missing or unaccepted.",
    completenessPercent: null,
    humanAcceptanceRequired: true,
    durationMs: Date.now() - started,
  };
}

export function nextHandoverState(completeness: HandoverCompletenessState, current: EngineeringHandoverPackage["state"]): EngineeringHandoverPackage["state"] {
  if (current === "ACCEPTED" || current === "REJECTED" || current === "SUPERSEDED") return current;
  if (completeness === "COMPLETE") return current === "UNDER_REVIEW" ? "UNDER_REVIEW" : "READY_FOR_REVIEW";
  if (completeness === "PARTIAL" || completeness === "INCOMPLETE") return "ASSEMBLING";
  return current === "DRAFT" ? "DRAFT" : "ASSEMBLING";
}
