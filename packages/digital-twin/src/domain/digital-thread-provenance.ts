/**
 * Phase 12K — Digital Thread provenance.
 * Missing provenance → provenanceStatus=unknown, fail-closed (never fabricate).
 */

import {
  DIGITAL_THREAD_TAXONOMY_VERSION,
  coerceRelationshipType,
  type DigitalThreadRelationshipType,
} from "./digital-thread-taxonomy";

export const PROVENANCE_STATUSES = [
  "known",
  "partial",
  "unknown",
  "conflicting",
  "stale",
] as const;

export type ProvenanceStatus = (typeof PROVENANCE_STATUSES)[number];

export const PROVENANCE_REVIEW_STATUSES = [
  "not_reviewed",
  "submitted",
  "approved",
  "rejected",
  "unknown",
] as const;

export type ProvenanceReviewStatus = (typeof PROVENANCE_REVIEW_STATUSES)[number];

export type DigitalThreadProvenance = {
  provenanceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  sourceDomain: string;
  sourceReference: string;
  sourceVersion?: string;
  sourceTimestamp?: string;
  relationshipType: DigitalThreadRelationshipType;
  relationshipTaxonomyVersion: typeof DIGITAL_THREAD_TAXONOMY_VERSION;
  provenanceStatus: ProvenanceStatus;
  reviewStatus: ProvenanceReviewStatus;
  validity: "valid" | "invalid" | "unknown" | "expired";
  limitations: readonly string[];
  /** Never fabricate — missing fields force unknown. */
  fabricated: false;
  recordedAt: string;
};

export function createDigitalThreadProvenance(input: {
  provenanceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  sourceDomain?: string | null;
  sourceReference?: string | null;
  sourceVersion?: string | null;
  sourceTimestamp?: string | null;
  relationshipType?: string | null;
  provenanceStatus?: ProvenanceStatus;
  reviewStatus?: ProvenanceReviewStatus;
  validity?: DigitalThreadProvenance["validity"];
  limitations?: readonly string[];
  recordedAt?: string;
}): DigitalThreadProvenance {
  const missingSource =
    !input.sourceDomain?.trim() || !input.sourceReference?.trim();
  const relationshipType = coerceRelationshipType(input.relationshipType);
  const provenanceStatus: ProvenanceStatus = missingSource
    ? "unknown"
    : (input.provenanceStatus ?? "known");

  if (missingSource && input.provenanceStatus && input.provenanceStatus !== "unknown") {
    throw new Error("provenance_missing_must_be_unknown_fail_closed");
  }

  return {
    provenanceId: input.provenanceId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sourceDomain: input.sourceDomain?.trim() || "unknown",
    sourceReference: input.sourceReference?.trim() || "unknown",
    sourceVersion: input.sourceVersion?.trim() || undefined,
    sourceTimestamp: input.sourceTimestamp?.trim() || undefined,
    relationshipType,
    relationshipTaxonomyVersion: DIGITAL_THREAD_TAXONOMY_VERSION,
    provenanceStatus,
    reviewStatus: input.reviewStatus ?? (missingSource ? "unknown" : "not_reviewed"),
    validity: input.validity ?? (missingSource ? "unknown" : "valid"),
    limitations: input.limitations ?? (missingSource ? ["missing_source_provenance"] : []),
    fabricated: false,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  };
}

/** Fail-closed: refuse to invent provenance fields. */
export function assertProvenanceFailClosed(p: DigitalThreadProvenance): {
  ok: true;
  fabricated: false;
} {
  if (p.fabricated !== false) {
    throw new Error("provenance_fabrication_forbidden");
  }
  if (
    (p.sourceDomain === "unknown" || p.sourceReference === "unknown") &&
    p.provenanceStatus !== "unknown"
  ) {
    throw new Error("provenance_missing_must_be_unknown_fail_closed");
  }
  return { ok: true, fabricated: false };
}
