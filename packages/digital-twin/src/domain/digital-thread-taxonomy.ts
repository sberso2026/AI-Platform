/**
 * Phase 12K — Digital Thread relationship taxonomy (versioned).
 *
 * Semantics (non-negotiable):
 * - Traceability ≠ causality
 * - Association ≠ dependency
 * - Correlation ≠ causation
 * Taxonomy documents references only — NO causal inference.
 */

export const DIGITAL_THREAD_TAXONOMY_VERSION = "1.0.0" as const;

export const DIGITAL_THREAD_RELATIONSHIP_TYPES = [
  "represents",
  "references",
  "derived_from",
  "observed_from",
  "validated_by",
  "reviewed_by",
  "qualified_by",
  "executed_with",
  "produced",
  "supersedes",
  "associated_with",
  "mapped_to",
  "supported_by",
  "contradicted_by",
  "applies_to",
  "generated_from",
  "published_from",
  "unknown",
] as const;

export type DigitalThreadRelationshipType =
  (typeof DIGITAL_THREAD_RELATIONSHIP_TYPES)[number];

/** Explicit non-causal contract — taxonomy never asserts cause→effect. */
export const DIGITAL_THREAD_CAUSAL_INFERENCE_ALLOWED = false as const;
export const digitalThreadCausalInferenceAllowed = false as const;

export const DIGITAL_THREAD_TAXONOMY_SEMANTICS: Record<
  DigitalThreadRelationshipType,
  { meaning: string; impliesCausality: false; impliesDependency: false }
> = {
  represents: {
    meaning: "Subject is a governed representation of the object (identity mapping).",
    impliesCausality: false,
    impliesDependency: false,
  },
  references: {
    meaning: "Subject cites object by reference; no ownership or causality.",
    impliesCausality: false,
    impliesDependency: false,
  },
  derived_from: {
    meaning: "Subject was derived using object as an input source (trace, not cause).",
    impliesCausality: false,
    impliesDependency: false,
  },
  observed_from: {
    meaning: "Subject observation cites object as observation source.",
    impliesCausality: false,
    impliesDependency: false,
  },
  validated_by: {
    meaning: "Subject validation cites object as validating evidence.",
    impliesCausality: false,
    impliesDependency: false,
  },
  reviewed_by: {
    meaning: "Subject review cites object as review record.",
    impliesCausality: false,
    impliesDependency: false,
  },
  qualified_by: {
    meaning: "Subject qualification cites object qualification record.",
    impliesCausality: false,
    impliesDependency: false,
  },
  executed_with: {
    meaning: "Subject execution cites object capability/adapter/method.",
    impliesCausality: false,
    impliesDependency: false,
  },
  produced: {
    meaning: "Subject produced object artefact (trace of production, not causation claim).",
    impliesCausality: false,
    impliesDependency: false,
  },
  supersedes: {
    meaning: "Subject version supersedes prior object version.",
    impliesCausality: false,
    impliesDependency: false,
  },
  associated_with: {
    meaning: "Loose association — Association ≠ dependency.",
    impliesCausality: false,
    impliesDependency: false,
  },
  mapped_to: {
    meaning: "Mapping link between representation/element spaces.",
    impliesCausality: false,
    impliesDependency: false,
  },
  supported_by: {
    meaning: "Supporting evidence citation — Correlation ≠ causation.",
    impliesCausality: false,
    impliesDependency: false,
  },
  contradicted_by: {
    meaning: "Conflicting evidence citation — detection only.",
    impliesCausality: false,
    impliesDependency: false,
  },
  applies_to: {
    meaning: "Scope application of subject to object context.",
    impliesCausality: false,
    impliesDependency: false,
  },
  generated_from: {
    meaning: "Generation source citation — Traceability ≠ causality.",
    impliesCausality: false,
    impliesDependency: false,
  },
  published_from: {
    meaning: "Publication source citation for governed publish.",
    impliesCausality: false,
    impliesDependency: false,
  },
  unknown: {
    meaning: "Relationship type not established — fail-closed, never fabricate.",
    impliesCausality: false,
    impliesDependency: false,
  },
};

export function assertNoCausalInference(
  relationshipType: DigitalThreadRelationshipType,
): { ok: true; impliesCausality: false } {
  const semantics = DIGITAL_THREAD_TAXONOMY_SEMANTICS[relationshipType];
  if (semantics.impliesCausality !== false || DIGITAL_THREAD_CAUSAL_INFERENCE_ALLOWED) {
    throw new Error("digital_thread_causal_inference_forbidden");
  }
  return { ok: true, impliesCausality: false };
}

export function isKnownRelationshipType(value: string): value is DigitalThreadRelationshipType {
  return (DIGITAL_THREAD_RELATIONSHIP_TYPES as readonly string[]).includes(value);
}

export function coerceRelationshipType(value: string | undefined | null): DigitalThreadRelationshipType {
  if (value && isKnownRelationshipType(value)) return value;
  return "unknown";
}
