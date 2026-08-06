/**
 * Phase 8E — Canonical candidate-finding intake contract.
 */
import { createHash } from "node:crypto";
import {
  assertFindingsHandoffCannotMutateCore,
  type DocumentFindingsCandidateHandoff,
} from "../documents/findings-handoff";
import {
  assertMeetingFindingsHandoffCannotMutateCore,
  type MeetingFindingsCandidateHandoff,
} from "../meetings/findings-handoff";
import { FindingsIntelligenceError } from "./errors";
import type {
  FindingsCategory,
  FindingsEvidenceRef,
  FindingsPriority,
  FindingsSeverity,
  FindingsSourceType,
} from "./types";
import { FINDINGS_CATEGORIES, FINDINGS_PRIORITIES, FINDINGS_SEVERITIES, FINDINGS_SOURCE_TYPES } from "./types";

export type FindingsCandidateIntake = {
  sourceType: FindingsSourceType;
  sourceFeature: "document_intelligence" | "meeting_intelligence" | "manual" | "future_feature";
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  assetId?: string;
  title: string;
  description?: string;
  proposedCategory: FindingsCategory;
  proposedSeverity: FindingsSeverity;
  proposedPriority?: FindingsPriority;
  confidence: number;
  evidenceReferences: readonly FindingsEvidenceRef[];
  citations: readonly FindingsEvidenceRef[];
  traceId: string;
  detectedAt: string;
  providerModelIdentity?: { provider?: string; model?: string; promptVersion?: string };
  abstentionOrConflictState?: "none" | "abstained" | "conflicting_evidence";
  idempotencyKey: string;
  mayMutateEngineeringCore: false;
};

function requireScope(tenantId: string, workspaceId: string): void {
  if (!tenantId.trim() || !workspaceId.trim()) {
    throw new FindingsIntelligenceError(
      "findings_scope_required",
      "tenantId and workspaceId are required",
      400,
    );
  }
}

function normalizeCategory(raw?: string): FindingsCategory {
  if (raw && (FINDINGS_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as FindingsCategory;
  }
  return "other";
}

function normalizeSeverity(raw?: string): FindingsSeverity {
  if (raw && (FINDINGS_SEVERITIES as readonly string[]).includes(raw)) {
    return raw as FindingsSeverity;
  }
  return "medium";
}

export function buildIdempotencyKey(parts: {
  sourceType: string;
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  title: string;
}): string {
  return createHash("sha256")
    .update(
      [parts.sourceType, parts.sourceId, parts.tenantId, parts.workspaceId, parts.title.trim().toLowerCase()].join("|"),
    )
    .digest("hex");
}

export function intakeFromDocumentHandoff(
  handoff: DocumentFindingsCandidateHandoff,
  scope: { tenantId: string; workspaceId: string; detectedAt?: string },
): FindingsCandidateIntake {
  assertFindingsHandoffCannotMutateCore(handoff);
  requireScope(scope.tenantId, scope.workspaceId);
  const evidence: FindingsEvidenceRef[] = handoff.evidence.map((c) => ({
    kind: "document_chunk" as const,
    refId: c.chunkId ?? c.engineeringDocumentId,
    excerpt: c.excerpt,
    engineeringDocumentId: c.engineeringDocumentId,
    revision: c.revision,
    evidenceScore: c.evidenceScore,
  }));
  if (!evidence.length) {
    throw new FindingsIntelligenceError(
      "findings_evidence_required",
      "AI document findings require evidence citations",
      422,
    );
  }
  const sourceType = "document_intelligence.candidate_finding" as const;
  return {
    sourceType,
    sourceFeature: "document_intelligence",
    sourceId: handoff.candidateFindingId,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    projectId: handoff.engineeringProjectId,
    assetId: handoff.engineeringAssetId,
    title: handoff.title,
    description: handoff.description,
    proposedCategory: normalizeCategory(handoff.proposedCategory),
    proposedSeverity: normalizeSeverity(handoff.severitySuggestion),
    confidence: handoff.confidence,
    evidenceReferences: evidence,
    citations: evidence,
    traceId: handoff.traceId,
    detectedAt: scope.detectedAt ?? new Date().toISOString(),
    abstentionOrConflictState: "none",
    idempotencyKey: buildIdempotencyKey({
      sourceType,
      sourceId: handoff.candidateFindingId,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      title: handoff.title,
    }),
    mayMutateEngineeringCore: false,
  };
}

export function intakeFromMeetingHandoff(
  handoff: MeetingFindingsCandidateHandoff,
  scope: { tenantId: string; workspaceId: string; detectedAt?: string },
): FindingsCandidateIntake {
  assertMeetingFindingsHandoffCannotMutateCore(handoff);
  requireScope(scope.tenantId, scope.workspaceId);
  const evidence: FindingsEvidenceRef[] = [
    ...handoff.transcriptReferences.map((id) => ({
      kind: "transcript_segment" as const,
      refId: id,
      meetingSessionId: handoff.meetingSessionId,
    })),
    ...handoff.evidence.map((c) => ({
      kind: "document_chunk" as const,
      refId: c.chunkId ?? c.engineeringDocumentId,
      excerpt: c.excerpt,
      engineeringDocumentId: c.engineeringDocumentId,
      revision: c.revision,
      evidenceScore: c.evidenceScore,
    })),
  ];
  if (!evidence.length) {
    throw new FindingsIntelligenceError(
      "findings_evidence_required",
      "AI meeting findings require transcript or document evidence",
      422,
    );
  }
  const sourceType = "meeting_intelligence.candidate_finding" as const;
  return {
    sourceType,
    sourceFeature: "meeting_intelligence",
    sourceId: handoff.candidateFindingId,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    projectId: handoff.engineeringProjectId,
    title: handoff.title,
    description: handoff.description,
    proposedCategory: "observation",
    proposedSeverity: normalizeSeverity(handoff.severitySuggestion),
    confidence: handoff.confidence,
    evidenceReferences: evidence,
    citations: evidence,
    traceId: handoff.traceId,
    detectedAt: scope.detectedAt ?? new Date().toISOString(),
    abstentionOrConflictState: "none",
    idempotencyKey: buildIdempotencyKey({
      sourceType,
      sourceId: handoff.candidateFindingId,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      title: handoff.title,
    }),
    mayMutateEngineeringCore: false,
  };
}

export function intakeManualFinding(input: {
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  assetId?: string;
  title: string;
  description?: string;
  proposedCategory?: FindingsCategory;
  proposedSeverity?: FindingsSeverity;
  proposedPriority?: FindingsPriority;
  evidenceReferences?: readonly FindingsEvidenceRef[];
  actorUserId: string;
  traceId: string;
  detectedAt?: string;
}): FindingsCandidateIntake {
  requireScope(input.tenantId, input.workspaceId);
  if (!input.actorUserId.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Manual intake requires actor", 400);
  }
  if (!input.title.trim()) {
    throw new FindingsIntelligenceError("findings_title_required", "Title is required", 400);
  }
  if (input.proposedPriority && !(FINDINGS_PRIORITIES as readonly string[]).includes(input.proposedPriority)) {
    throw new FindingsIntelligenceError("findings_priority_invalid", "Invalid priority", 400);
  }
  const sourceType = "manual" as const;
  if (!(FINDINGS_SOURCE_TYPES as readonly string[]).includes(sourceType)) {
    throw new FindingsIntelligenceError("findings_source_invalid", "Invalid source", 400);
  }
  return {
    sourceType,
    sourceFeature: "manual",
    sourceId: input.sourceId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    assetId: input.assetId,
    title: input.title,
    description: input.description,
    proposedCategory: input.proposedCategory ?? "other",
    proposedSeverity: input.proposedSeverity ?? "medium",
    proposedPriority: input.proposedPriority,
    confidence: 1,
    evidenceReferences: input.evidenceReferences ?? [],
    citations: input.evidenceReferences ?? [],
    traceId: input.traceId,
    detectedAt: input.detectedAt ?? new Date().toISOString(),
    abstentionOrConflictState: input.evidenceReferences?.length ? "none" : "abstained",
    idempotencyKey: buildIdempotencyKey({
      sourceType,
      sourceId: input.sourceId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      title: input.title,
    }),
    mayMutateEngineeringCore: false,
  };
}

export function assertIntakeCannotMutateCore(intake: FindingsCandidateIntake): void {
  if (intake.mayMutateEngineeringCore !== false) {
    throw new FindingsIntelligenceError(
      "findings_core_mutation_forbidden",
      "Findings intake must not mutate Engineering Core",
      403,
    );
  }
}
