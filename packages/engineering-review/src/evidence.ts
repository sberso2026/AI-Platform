import { failClosed } from "./errors";
import {
  asDocumentId,
  asFindingEvidenceId,
  type DocumentId,
  type FindingEvidenceId,
} from "./ids";
import { assertSameOwnership, createReviewOwnership, type ReviewOwnership } from "./ownership";

export const EVIDENCE_SOURCE_TYPES = [
  "extracted_text",
  "structured_field",
  "document_revision",
  "requirement_statement",
  "declared_assumption",
] as const;
export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export const EVIDENCE_VERIFICATION_STATES = [
  "unverified",
  "verified",
  "insufficient",
  "revoked",
] as const;
export type EvidenceVerificationState = (typeof EVIDENCE_VERIFICATION_STATES)[number];

/**
 * Frozen citation. Does not duplicate source documents.
 * page/section/chunk are omitted unless the source provided them — never invented.
 */
export type FindingEvidence = ReviewOwnership & {
  evidenceId: FindingEvidenceId;
  documentId: DocumentId;
  revision?: string;
  page?: number;
  section?: string;
  chunkId?: string;
  span?: string;
  retrievalId?: string;
  sourceType: EvidenceSourceType;
  verificationState: EvidenceVerificationState;
  contentHash?: string;
};

export type EvidenceDraft = {
  evidenceId?: string;
  documentId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  revision?: string;
  page?: number;
  section?: string;
  chunkId?: string;
  span?: string;
  retrievalId?: string;
  sourceType: EvidenceSourceType;
  contentHash?: string;
};

function optionalLocator<T>(value: T | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  return value;
}

export function createFindingEvidence(
  draft: EvidenceDraft,
  findingOwnership: ReviewOwnership,
): FindingEvidence {
  const evidenceOwnership = createReviewOwnership({
    tenantId: draft.tenantId,
    workspaceId: draft.workspaceId,
    projectId: draft.projectId,
  });
  assertSameOwnership(findingOwnership, evidenceOwnership);
  if (!(EVIDENCE_SOURCE_TYPES as readonly string[]).includes(draft.sourceType)) {
    failClosed("evidence_source_invalid", "Invalid evidence source type", { sourceType: draft.sourceType });
  }
  if (draft.page !== undefined && (!Number.isInteger(draft.page) || draft.page < 1)) {
    failClosed("evidence_page_invalid", "Page must be a positive integer when provided", { page: draft.page });
  }

  return {
    evidenceId: asFindingEvidenceId(draft.evidenceId ?? `ev-${draft.documentId}`),
    tenantId: findingOwnership.tenantId,
    workspaceId: findingOwnership.workspaceId,
    projectId: findingOwnership.projectId,
    documentId: asDocumentId(draft.documentId),
    revision: optionalLocator(draft.revision),
    page: draft.page,
    section: optionalLocator(draft.section),
    chunkId: optionalLocator(draft.chunkId),
    span: optionalLocator(draft.span),
    retrievalId: optionalLocator(draft.retrievalId),
    sourceType: draft.sourceType,
    verificationState: "unverified",
    contentHash: optionalLocator(draft.contentHash),
  };
}

export function hasAttributableSpan(evidence: FindingEvidence): boolean {
  return Boolean(evidence.span?.trim() || evidence.chunkId?.trim() || evidence.section?.trim());
}

export function verifyEvidenceRecord(evidence: FindingEvidence): FindingEvidence {
  if (evidence.verificationState === "revoked") {
    failClosed("evidence_revoked", "Revoked evidence cannot be verified");
  }
  if (!hasAttributableSpan(evidence) && !evidence.revision) {
    return { ...evidence, verificationState: "insufficient" };
  }
  return { ...evidence, verificationState: "verified" };
}

export function revokeEvidence(evidence: FindingEvidence): FindingEvidence {
  return { ...evidence, verificationState: "revoked" };
}

export function assertEvidenceNotSilentlyDropped(
  previous: readonly FindingEvidence[],
  next: readonly FindingEvidence[] | undefined,
): void {
  if (next === undefined) return;
  if (previous.length > 0 && next.length === 0) {
    failClosed(
      "evidence_provenance_lost",
      "Evidence provenance cannot silently disappear; revoke explicitly",
    );
  }
  const nextIds = new Set(next.map((item) => item.evidenceId));
  for (const item of previous) {
    if (!nextIds.has(item.evidenceId)) {
      failClosed("evidence_provenance_lost", "Existing evidence records cannot be dropped without revoke", {
        evidenceId: item.evidenceId,
      });
    }
  }
}
