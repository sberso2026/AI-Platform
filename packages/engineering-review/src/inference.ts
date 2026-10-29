import { REVIEW_FINDING_CATEGORIES, type ReviewFindingCategory } from "./finding";
import { isReviewSeverity } from "./severity";
import type { ReviewInferenceCandidate } from "./ai-boundary";
import type { ReviewDocumentFixture } from "./detectors/types";
import { evidenceResolvesToSource } from "./evidence-resolve";
import type { UntrustedDocumentText } from "./trust-boundary";

function unwrap(text: UntrustedDocumentText | string | undefined): string {
  if (!text) return "";
  return typeof text === "string" ? text : text.text;
}

export type InferenceValidationResult = {
  accepted: ReviewInferenceCandidate[];
  rejected: { reason: string; title?: string }[];
};

/**
 * Schema-validate AI candidates and reject invented locators/values.
 * Tests must use in-memory providers — this function never calls a network.
 */
export function validateInferenceCandidates(
  candidates: readonly unknown[],
  documents: readonly ReviewDocumentFixture[],
): InferenceValidationResult {
  const accepted: ReviewInferenceCandidate[] = [];
  const rejected: { reason: string; title?: string }[] = [];
  const corpus = documents.map((doc) => unwrap(doc.extractedText)).join("\n");

  for (const raw of candidates) {
    if (!raw || typeof raw !== "object") {
      rejected.push({ reason: "malformed_candidate" });
      continue;
    }
    const candidate = raw as Partial<ReviewInferenceCandidate>;
    if (!candidate.title?.trim() || !candidate.description?.trim()) {
      rejected.push({ reason: "schema_invalid", title: candidate.title });
      continue;
    }
    if (!candidate.category || !(REVIEW_FINDING_CATEGORIES as readonly string[]).includes(candidate.category)) {
      rejected.push({ reason: "category_invalid", title: candidate.title });
      continue;
    }
    if (candidate.proposedSeverity && !isReviewSeverity(candidate.proposedSeverity)) {
      rejected.push({ reason: "severity_invalid", title: candidate.title });
      continue;
    }
    const evidence = candidate.evidence ?? [];
    if (evidence.length === 0) {
      rejected.push({ reason: "evidence_required", title: candidate.title });
      continue;
    }
    const locatorsOk = evidence.every((item) => {
      const doc = documents.find((row) => row.documentId === item.documentId);
      if (!doc) return false;
      if (item.page !== undefined && item.page < 1) return false;
      return evidenceResolvesToSource(item, documents);
    });
    if (!locatorsOk) {
      rejected.push({ reason: "invented_locator", title: candidate.title });
      continue;
    }
    const claimedValues = candidate.description.match(/[0-9]+(?:\.[0-9]+)?\s*(?:MPa|kN|kPa|N\/mm²|years?)/gi) ?? [];
    const inventedValue = claimedValues.some((value) => !corpus.includes(value.replace(/\s+/g, " ").trim()) && !corpus.includes(value));
    if (inventedValue) {
      rejected.push({ reason: "invented_value", title: candidate.title });
      continue;
    }
    accepted.push({
      title: candidate.title.trim(),
      description: candidate.description.trim(),
      category: candidate.category as ReviewFindingCategory,
      proposedSeverity: candidate.proposedSeverity ?? "minor",
      proposedConfidenceScore: candidate.proposedConfidenceScore ?? 0.4,
      evidence,
      requirementReferences: candidate.requirementReferences ?? [],
      reasoningSummary: candidate.reasoningSummary?.trim() || "AI-proposed candidate pending evidence verification.",
      recommendedAction: candidate.recommendedAction?.trim() || "Engineer to review.",
    });
  }
  return { accepted, rejected };
}
