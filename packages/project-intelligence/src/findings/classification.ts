/**
 * Phase 8E — Classification and severity suggestions (advisory only).
 */
import { FindingsIntelligenceError } from "./errors";
import type { FindingsCategory, FindingsSeverity } from "./types";
import { FINDINGS_CATEGORIES, FINDINGS_SEVERITIES } from "./types";

export const FINDINGS_TAXONOMY_VERSION = "findings-taxonomy/v1";

export type FindingsClassificationSuggestion = {
  category: FindingsCategory;
  severity: FindingsSeverity;
  confidence: number;
  rationale: string;
  taxonomyVersion: typeof FINDINGS_TAXONOMY_VERSION;
  model?: string;
  promptVersion?: string;
  humanConfirmed: false;
  mayExecuteDisposition: false;
};

export function suggestFindingsClassification(input: {
  title: string;
  description?: string;
  model?: string;
  promptVersion?: string;
}): FindingsClassificationSuggestion {
  const text = `${input.title} ${input.description ?? ""}`.toLowerCase();
  let category: FindingsCategory = "other";
  if (/safety|hazard/.test(text)) category = "safety_concern";
  else if (/non[- ]?conform|ncr/.test(text)) category = "non_conformance";
  else if (/schedule|delay/.test(text)) category = "schedule_concern";
  else if (/cost|budget/.test(text)) category = "cost_concern";
  else if (/quality/.test(text)) category = "quality_concern";
  else if (/compliance|regulation/.test(text)) category = "compliance_concern";
  else if (/gap|missing/.test(text)) category = "information_gap";
  else if (/lesson/.test(text)) category = "lesson_candidate";
  else if (/discrepan/.test(text)) category = "discrepancy";
  else if (/design/.test(text)) category = "design_concern";

  let severity: FindingsSeverity = "medium";
  if (/critical|imminent/.test(text)) severity = "critical";
  else if (/high|urgent/.test(text)) severity = "high";
  else if (/low|minor/.test(text)) severity = "low";

  return {
    category,
    severity,
    confidence: 0.55,
    rationale: "Deterministic keyword suggestion; human confirmation required",
    taxonomyVersion: FINDINGS_TAXONOMY_VERSION,
    model: input.model ?? "findings-deterministic-v1",
    promptVersion: input.promptVersion ?? "cert-fixtures-v1",
    humanConfirmed: false,
    mayExecuteDisposition: false,
  };
}

export function confirmFindingsClassification(input: {
  category: FindingsCategory;
  severity: FindingsSeverity;
  reviewerUserId: string;
}): { category: FindingsCategory; severity: FindingsSeverity; humanConfirmed: true; confirmedBy: string } {
  if (!(FINDINGS_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new FindingsIntelligenceError("findings_category_invalid", "Invalid category", 400);
  }
  if (!(FINDINGS_SEVERITIES as readonly string[]).includes(input.severity)) {
    throw new FindingsIntelligenceError("findings_severity_invalid", "Invalid severity", 400);
  }
  if (!input.reviewerUserId.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Reviewer required", 400);
  }
  return {
    category: input.category,
    severity: input.severity,
    humanConfirmed: true,
    confirmedBy: input.reviewerUserId,
  };
}
