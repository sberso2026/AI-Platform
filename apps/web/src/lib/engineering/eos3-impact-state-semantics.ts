/**
 * EOS-3-INTELLIGENCE-1 — Impact / staleness state semantics.
 * Dependency ≠ invalidity. INVALIDATED is never a generic downstream warning.
 */

export const IMPACT_STATES = [
  "CURRENT",
  "CHANGE_DETECTED",
  "POTENTIALLY_AFFECTED",
  "REVIEW_RECOMMENDED",
  "REVIEW_REQUIRED",
  "REASSESSMENT_REQUIRED",
  "STALE",
  "INVALIDATED",
  "RESOLVED_NO_CHANGE",
  "RESOLVED_REVISED",
] as const;

export type ImpactState = (typeof IMPACT_STATES)[number];

export const IMPACT_STATE_MEANINGS: Record<
  ImpactState,
  { meaning: string; automaticInvalidation: boolean; engineeringDecision: boolean }
> = {
  CURRENT: {
    meaning: "No known upstream change requiring attention.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  CHANGE_DETECTED: {
    meaning: "A directly relevant upstream object changed.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  POTENTIALLY_AFFECTED: {
    meaning: "An explicit dependency path exists; consequence not yet determined.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  REVIEW_RECOMMENDED: {
    meaning: "A change may matter; governed engineering review determines consequence.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  REVIEW_REQUIRED: {
    meaning: "Explicit dependency/materiality rules require engineering review.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  REASSESSMENT_REQUIRED: {
    meaning:
      "A governed Decision relied on engineering information that materially changed.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  STALE: {
    meaning:
      "The object no longer reflects current upstream engineering state and requires review/revision.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  INVALIDATED: {
    meaning:
      "Strong governed evidence establishes that the previous premise/result/state is no longer valid. Not a generic warning.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  RESOLVED_NO_CHANGE: {
    meaning: "Authorized engineer recorded that no engineering change is required.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
  RESOLVED_REVISED: {
    meaning: "Impact closed after revised engineering was recorded under human authority.",
    automaticInvalidation: false,
    engineeringDecision: false,
  },
};

/** Relatedness vocabulary retained for graph composition (Domain 3). */
export const DEPENDENCY_RELATEDNESS = [
  "RELATED",
  "DEPENDENT",
  "POTENTIALLY_AFFECTED",
  "REVIEW_RECOMMENDED",
  "REVIEW_REQUIRED",
  "REASSESSMENT_REQUIRED",
  "STALE",
  "INVALIDATED",
] as const;

export type PropagationTriggerKind =
  | "EVIDENCE_REVISION"
  | "EVIDENCE_REPLACEMENT"
  | "ASSUMPTION_REVISION"
  | "ASSUMPTION_INVALIDATION"
  | "REQUIREMENT_REVISION"
  | "DESIGN_BASIS_REVISION"
  | "CALCULATION_REVISION"
  | "DECISION_SUPERSESSION"
  | "ASSET_CONFIGURATION_CHANGE"
  | "INTERFACE_INPUT_REVISION"
  | "CHANGE_OBJECT"
  | "VENDOR_INFORMATION_UPDATE";

/** Relationship types that may propagate engineering review state. */
export const PROPAGATING_RELATIONSHIP_TYPES = new Set([
  "ASSUMES",
  "REQUIRES",
  "SUPPORTS",
  "JUSTIFIES",
  "AFFECTS",
  "MODIFIES",
  "PRODUCES",
  "CONSUMES",
  "DERIVED_FROM",
  "IMPLEMENTS",
  "BLOCKS",
  "APPLIES_TO",
  "SUPERSEDES",
]);

/** Relationship types that must NOT alone create review/stale state. */
export const NON_PROPAGATING_RELATIONSHIP_TYPES = new Set([
  "CONNECTED_TO",
  "ASSOCIATED_WITH",
  "CONTAINS",
  "REVIEWS",
  "APPROVES",
]);

export const DEFAULT_PROPAGATION_MAX_DEPTH = 4;

export const EOS_AUTOMATIC_CALCULATION_INVALIDATION = false as const;
export const EOS_AUTOMATIC_DECISION_REVERSAL = false as const;
export const EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL = false as const;
export const EOS_AUTOMATIC_ENGINEERING_APPROVAL = false as const;
export const EOS_PROPAGATION_REQUIRES_LIVE_LLM = false as const;
export const EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY = true as const;
