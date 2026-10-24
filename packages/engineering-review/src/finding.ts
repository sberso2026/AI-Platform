import { createReviewConfidence, type ReviewConfidence } from "./confidence";
import { failClosed } from "./errors";
import {
  createFindingEvidence,
  hasAttributableSpan,
  verifyEvidenceRecord,
  type EvidenceDraft,
  type FindingEvidence,
} from "./evidence";
import {
  asReviewFindingId,
  asReviewPackageId,
  asReviewRunId,
  type ReviewFindingId,
  type ReviewPackageId,
  type ReviewRunId,
} from "./ids";
import type { ReviewFindingStatus } from "./lifecycle";
import { createReviewOwnership, type ReviewOwnership } from "./ownership";
import { isReviewSeverity, type ReviewSeverity } from "./severity";
import { ENGINEERING_REVIEW_ENGINE_VERSION } from "./version";

export const REVIEW_FINDING_CATEGORIES = [
  "cross_document_inconsistency",
  "missing_information",
  "requirement_traceability_gap",
  "unsupported_assumption",
  "revision_inconsistency",
  "missing_engineering_evidence",
  "other_observation",
] as const;
export type ReviewFindingCategory = (typeof REVIEW_FINDING_CATEGORIES)[number];

export const FINDING_VERIFICATION_STATES = [
  "unverified",
  "evidence_verified",
  "insufficient_evidence",
  "revoked",
] as const;
export type FindingVerificationState = (typeof FINDING_VERIFICATION_STATES)[number];

export const REVIEW_REASONING_BASIS = [
  "EVIDENCE_BASED",
  "DERIVED",
  "ASSUMED",
  "INSUFFICIENT_EVIDENCE",
  "CONFLICTING",
] as const;
export type ReviewReasoningBasis = (typeof REVIEW_REASONING_BASIS)[number];

export type ReviewFindingProvenance = {
  origin: "detector" | "ai_candidate" | "human";
  engineVersion: string;
  ruleId?: string;
  ruleVersion?: string;
  detectorId?: string;
  detectionKey?: string;
  modelProvider?: string;
  modelId?: string;
  promptVersion?: string;
};

export type ReviewFinding = ReviewOwnership & {
  id: ReviewFindingId;
  reviewPackageId: ReviewPackageId;
  reviewRunId: ReviewRunId;
  discipline?: string;
  category: ReviewFindingCategory;
  title: string;
  description: string;
  severity: ReviewSeverity;
  confidence: ReviewConfidence;
  evidence: readonly FindingEvidence[];
  requirementReferences: readonly string[];
  reasoningSummary: string;
  reasoningBasis: ReviewReasoningBasis;
  recommendedAction: string;
  status: ReviewFindingStatus;
  verificationState: FindingVerificationState;
  humanDispositionId?: string;
  createdAt: string;
  updatedAt: string;
  provenance: ReviewFindingProvenance;
};

export type CreateReviewFindingInput = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  reviewPackageId: string;
  reviewRunId: string;
  discipline?: string;
  category: ReviewFindingCategory;
  title: string;
  description: string;
  severity: ReviewSeverity;
  confidence: { band?: ReviewConfidence["band"]; score?: number };
  evidence: readonly EvidenceDraft[];
  requirementReferences?: readonly string[];
  reasoningSummary: string;
  reasoningBasis?: ReviewReasoningBasis;
  recommendedAction: string;
  provenance: Omit<ReviewFindingProvenance, "engineVersion"> & { engineVersion?: string };
  now?: string;
};

function deriveVerificationState(
  origin: ReviewFindingProvenance["origin"],
  evidence: readonly FindingEvidence[],
): FindingVerificationState {
  if (origin !== "human" && evidence.length === 0) {
    failClosed("evidence_required", "AI and detector findings require attributable evidence");
  }
  if (evidence.some((item) => item.verificationState === "revoked")) return "revoked";
  if (evidence.length === 0) return "insufficient_evidence";
  return "unverified";
}

export function createReviewFinding(input: CreateReviewFindingInput): ReviewFinding {
  if (!input.title?.trim()) failClosed("title_required", "Finding title is required");
  if (!isReviewSeverity(input.severity)) {
    failClosed("severity_invalid", "Invalid review severity", { severity: input.severity });
  }
  if (!(REVIEW_FINDING_CATEGORIES as readonly string[]).includes(input.category)) {
    failClosed("category_invalid", "Invalid review finding category", { category: input.category });
  }
  const ownership = createReviewOwnership(input);
  const evidence = input.evidence.map((draft) => createFindingEvidence(draft, ownership));
  const confidence = createReviewConfidence(input.confidence);
  const now = input.now ?? new Date().toISOString();

  return {
    id: asReviewFindingId(input.id),
    tenantId: ownership.tenantId,
    workspaceId: ownership.workspaceId,
    projectId: ownership.projectId,
    reviewPackageId: asReviewPackageId(input.reviewPackageId),
    reviewRunId: asReviewRunId(input.reviewRunId),
    discipline: input.discipline?.trim() || undefined,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    severity: input.severity,
    confidence,
    evidence,
    requirementReferences: input.requirementReferences ?? [],
    reasoningSummary: input.reasoningSummary.trim(),
    reasoningBasis: input.reasoningBasis ?? "EVIDENCE_BASED",
    recommendedAction: input.recommendedAction.trim(),
    status: "candidate",
    verificationState: deriveVerificationState(input.provenance.origin, evidence),
    createdAt: now,
    updatedAt: now,
    provenance: {
      ...input.provenance,
      engineVersion: input.provenance.engineVersion ?? ENGINEERING_REVIEW_ENGINE_VERSION,
    },
  };
}

/**
 * Evidence verification is a separate stage from detection and disposition.
 * A finding cannot enter evidence_verified when required evidence is absent.
 */
export function verifyFindingEvidence(finding: ReviewFinding): ReviewFinding {
  if (finding.evidence.length === 0) {
    return { ...finding, verificationState: "insufficient_evidence" };
  }
  const verified = finding.evidence.map(verifyEvidenceRecord);
  const insufficient = verified.some((item) => item.verificationState !== "verified");
  const attributable = verified.some(hasAttributableSpan) || verified.some((item) => item.revision);
  if (insufficient || !attributable) {
    return {
      ...finding,
      evidence: verified,
      verificationState: "insufficient_evidence",
      updatedAt: finding.updatedAt,
    };
  }
  return {
    ...finding,
    evidence: verified,
    verificationState: "evidence_verified",
  };
}

export function assertEvidenceVerified(finding: ReviewFinding): void {
  if (finding.verificationState !== "evidence_verified") {
    failClosed(
      "finding_not_evidence_verified",
      "Finding cannot be treated as evidence-verified without retrievable attributable evidence",
      { verificationState: finding.verificationState },
    );
  }
}
