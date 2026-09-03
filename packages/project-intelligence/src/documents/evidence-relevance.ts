import type { EngineeringQueryPlan } from "./query-plan";
import { contentContainsEntity, contentContainsTerm } from "./lexical-overlap";

export type EvidenceRelevanceClass = "DIRECT" | "SUPPORTING" | "CONTEXTUAL" | "IRRELEVANT";

const OTHER_PROPERTY_CUES = [
  /\b\d+(?:\.\d+)?\s*N\b/i,
  /\bforce required\b/i,
  /\block-?out\b/i,
  /\bdeflect(?:ion)?\b/i,
];

export function classifyEvidenceRelevance(
  content: string,
  plan: EngineeringQueryPlan,
): EvidenceRelevanceClass {
  const hay = content.replace(/\s+/g, " ");
  const subjectHit = plan.subjects.length === 0
    || plan.subjects.some((subject) => contentContainsEntity(hay, subject) || contentContainsTerm(hay, subject));
  const propertyHit = plan.properties.some((property) => contentContainsTerm(hay, property));
  const constraintHit = plan.constraints
    .filter((value) => value === "minimum" || value === "maximum" || value === "prohibited")
    .some((constraint) => contentContainsTerm(hay, constraint));
  const quantityHit = /\b\d+(?:\.\d+)?\s*(mm|m|kPa|MPa|lux|dB(?:\(A\))?|degrees|m\/s|N|minutes?)\b/i.test(hay);

  if (!subjectHit && plan.subjects.length > 0 && !propertyHit) return "IRRELEVANT";
  if (plan.property && propertyHit && (constraintHit || quantityHit) && (subjectHit || plan.subjects.length === 0)) {
    return "DIRECT";
  }
  if (plan.property && propertyHit && subjectHit) return "SUPPORTING";
  if (subjectHit && !propertyHit && plan.property) {
    if (OTHER_PROPERTY_CUES.some((pattern) => pattern.test(hay)) || quantityHit) return "CONTEXTUAL";
    return "SUPPORTING";
  }
  if (propertyHit || constraintHit) return "SUPPORTING";
  if (subjectHit) return "CONTEXTUAL";
  return "IRRELEVANT";
}

export function relevanceRankBoost(relevance: EvidenceRelevanceClass): number {
  switch (relevance) {
    case "DIRECT":
      return 1.4;
    case "SUPPORTING":
      return 0.35;
    case "CONTEXTUAL":
      return -0.25;
    default:
      return -1;
  }
}

export function selectGenerationEvidence<T extends { relevance?: EvidenceRelevanceClass }>(
  rows: readonly T[],
  limit = 3,
): T[] {
  const direct = rows.filter((row) => row.relevance === "DIRECT");
  const supporting = rows.filter((row) => row.relevance === "SUPPORTING");
  const selected = [...direct, ...supporting].slice(0, limit);
  return selected.length ? selected : rows.slice(0, 1);
}
