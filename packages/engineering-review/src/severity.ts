/**
 * Review severity — engineering consequence, not AI certainty.
 *
 * Existing RTB PI / document findings use `low | medium | high | critical`.
 * Review AI uses a five-level vocabulary so informational observations are
 * distinct from minor defects. Mapping to PI on later handoff:
 *
 * | Review            | PI findings |
 * | ----------------- | ----------- |
 * | informational     | low         |
 * | minor             | low         |
 * | moderate          | medium      |
 * | major             | high        |
 * | critical          | critical    |
 *
 * AI confidence MUST NOT set or imply severity.
 */
export const REVIEW_SEVERITIES = [
  "informational",
  "minor",
  "moderate",
  "major",
  "critical",
] as const;

export type ReviewSeverity = (typeof REVIEW_SEVERITIES)[number];

export const REVIEW_SEVERITY_TO_PI: Record<
  ReviewSeverity,
  "low" | "medium" | "high" | "critical"
> = {
  informational: "low",
  minor: "low",
  moderate: "medium",
  major: "high",
  critical: "critical",
};

export function isReviewSeverity(value: string): value is ReviewSeverity {
  return (REVIEW_SEVERITIES as readonly string[]).includes(value);
}
