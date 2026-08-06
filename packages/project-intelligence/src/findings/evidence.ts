/**
 * Phase 8E — Evidence and citation governance.
 */
import { FindingsIntelligenceError } from "./errors";
import type { FindingsCitationLineage, FindingsEvidenceRef } from "./types";

export function buildCitationLineage(
  refs: readonly FindingsEvidenceRef[],
  revoked = false,
): FindingsCitationLineage {
  return { immutable: true, refs, revoked };
}

export function assertAiFindingHasEvidence(
  refs: readonly FindingsEvidenceRef[],
  isAiGenerated: boolean,
): void {
  if (isAiGenerated && refs.length === 0) {
    throw new FindingsIntelligenceError(
      "findings_evidence_required",
      "AI-generated findings require verifiable evidence; abstain or use manual draft",
      422,
    );
  }
}

export function assertEvidenceAccessibleForApproval(lineage: FindingsCitationLineage): void {
  if (lineage.revoked) {
    throw new FindingsIntelligenceError(
      "findings_evidence_revoked",
      "Revoked or inaccessible evidence invalidates approval",
      409,
    );
  }
  if (!lineage.immutable) {
    throw new FindingsIntelligenceError(
      "findings_citation_mutable",
      "Citation lineage must be immutable",
      500,
    );
  }
}

export function assertEvidenceScope(
  refs: readonly FindingsEvidenceRef[],
  allowed: { tenantId: string; workspaceId: string; projectIds?: readonly string[] },
  row: { tenantId: string; workspaceId: string; projectId?: string },
): void {
  if (row.tenantId !== allowed.tenantId || row.workspaceId !== allowed.workspaceId) {
    throw new FindingsIntelligenceError(
      "findings_scope_violation",
      "Cross-tenant or cross-workspace evidence access denied",
      403,
    );
  }
  if (
    allowed.projectIds?.length &&
    row.projectId &&
    !allowed.projectIds.includes(row.projectId)
  ) {
    throw new FindingsIntelligenceError(
      "findings_project_filter",
      "Finding project is outside allowed project filter",
      403,
    );
  }
  void refs;
}
