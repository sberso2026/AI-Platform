import { failClosed } from "../errors";
import {
  asActorId,
  asDocumentId,
  asFindingDispositionId,
  asFindingEvidenceId,
  asProjectId,
  asReviewFindingId,
  asReviewPackageId,
  asReviewRunId,
  asTenantId,
  asWorkspaceId,
} from "../ids";
import {
  REVIEW_PACKAGE_STATUSES,
  REVIEW_DOCUMENT_ROLES,
  type ReviewPackage,
  type ReviewPackageDocument,
  type ReviewPackageStatus,
} from "../review-package";
import {
  REVIEW_RUN_STATUSES,
  type ReviewRun,
  type ReviewRunRuleRef,
  type ReviewRunProvenance,
  type ReviewRunStatus,
} from "../review-run";
import { MVP_REVIEW_TYPES, type MvpReviewType, type ReviewScope } from "../review-scope";
import {
  REVIEW_FINDING_CATEGORIES,
  FINDING_VERIFICATION_STATES,
  REVIEW_REASONING_BASIS,
  type ReviewFinding,
  type ReviewFindingCategory,
  type FindingVerificationState,
  type ReviewReasoningBasis,
  type ReviewFindingProvenance,
} from "../finding";
import { REVIEW_FINDING_STATUSES, type ReviewFindingStatus } from "../lifecycle";
import { REVIEW_SEVERITIES, type ReviewSeverity } from "../severity";
import { REVIEW_CONFIDENCE_BANDS, type ReviewConfidenceBand } from "../confidence";
import {
  EVIDENCE_SOURCE_TYPES,
  EVIDENCE_VERIFICATION_STATES,
  type EvidenceSourceType,
  type EvidenceVerificationState,
  type FindingEvidence,
} from "../evidence";
import {
  REVIEW_DISPOSITION_ACTIONS,
  type FindingDisposition,
  type ReviewDispositionAction,
} from "../disposition";
import type {
  ReviewDispositionRow,
  ReviewEvidenceRow,
  ReviewFindingRow,
  ReviewPackageRow,
  ReviewRunRow,
} from "./rows";

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    failClosed("persistence_invalid", `${field} is required`, { field, value });
  }
  return value.trim();
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  const text = requireString(value, field);
  if (!(allowed as readonly string[]).includes(text)) {
    failClosed("persistence_invalid", `Invalid ${field}`, { field, value: text });
  }
  return text as T;
}

function asJsonArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    failClosed("persistence_invalid", `${field} must be a JSON array`, { field });
  }
  return value;
}

function asJsonObject(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    failClosed("persistence_invalid", `${field} must be a JSON object`, { field });
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") failClosed("persistence_invalid", "Expected string or null");
  const trimmed = value.trim();
  return trimmed || undefined;
}

function mapPackageDocument(raw: unknown): ReviewPackageDocument {
  const row = asJsonObject(raw, "package_document");
  return {
    documentId: asDocumentId(requireString(row.document_id ?? row.documentId, "document_id")),
    revision: requireString(row.revision, "revision"),
    role: oneOf(row.role, REVIEW_DOCUMENT_ROLES, "role"),
    documentNumber: optionalString(row.document_number ?? row.documentNumber),
    inclusion: row.inclusion
      ? oneOf(row.inclusion, ["current", "superseded"] as const, "inclusion")
      : "current",
  };
}

export function packageToRow(pkg: ReviewPackage): ReviewPackageRow {
  return {
    id: pkg.id,
    tenant_id: pkg.tenantId,
    workspace_id: pkg.workspaceId,
    project_id: pkg.projectId,
    name: pkg.name,
    status: pkg.status,
    documents: pkg.documents.map((doc) => ({
      document_id: doc.documentId,
      revision: doc.revision,
      role: doc.role,
      document_number: doc.documentNumber ?? null,
      inclusion: doc.inclusion,
    })),
    created_by: pkg.createdBy,
    created_at: pkg.createdAt,
    updated_at: pkg.updatedAt,
  };
}

export function packageFromRow(row: ReviewPackageRow): ReviewPackage {
  return {
    id: asReviewPackageId(row.id),
    tenantId: asTenantId(row.tenant_id),
    workspaceId: asWorkspaceId(row.workspace_id),
    projectId: asProjectId(row.project_id),
    name: requireString(row.name, "name"),
    status: oneOf(row.status, REVIEW_PACKAGE_STATUSES, "package_status") as ReviewPackageStatus,
    documents: asJsonArray(row.documents, "documents").map(mapPackageDocument),
    createdBy: requireString(row.created_by, "created_by"),
    createdAt: requireString(row.created_at, "created_at"),
    updatedAt: requireString(row.updated_at, "updated_at"),
  };
}

function mapScope(raw: unknown): ReviewScope {
  const row = asJsonObject(raw, "scope");
  const reviewTypes = asJsonArray(row.reviewTypes ?? row.review_types, "reviewTypes").map((item) =>
    oneOf(item, MVP_REVIEW_TYPES, "reviewType"),
  ) as MvpReviewType[];
  return {
    reviewTypes,
    documentRoles: Array.isArray(row.documentRoles ?? row.document_roles)
      ? ((row.documentRoles ?? row.document_roles) as string[])
      : undefined,
    discipline: optionalString(row.discipline),
    requiredFields: Array.isArray(row.requiredFields ?? row.required_fields)
      ? ((row.requiredFields ?? row.required_fields) as string[])
      : undefined,
    expectedEvidenceKeys: Array.isArray(row.expectedEvidenceKeys ?? row.expected_evidence_keys)
      ? ((row.expectedEvidenceKeys ?? row.expected_evidence_keys) as string[])
      : undefined,
  };
}

function mapRules(raw: unknown): ReviewRunRuleRef[] {
  return asJsonArray(raw, "rules").map((item) => {
    const row = asJsonObject(item, "rule");
    return {
      ruleId: requireString(row.ruleId ?? row.rule_id, "ruleId"),
      version: requireString(row.version, "version"),
    };
  });
}

function mapRunProvenance(raw: unknown): ReviewRunProvenance {
  const row = asJsonObject(raw, "run_provenance");
  return {
    engineVersion: requireString(row.engineVersion ?? row.engine_version, "engineVersion"),
    promptVersion: optionalString(row.promptVersion ?? row.prompt_version),
    modelProvider: optionalString(row.modelProvider ?? row.model_provider),
    modelId: optionalString(row.modelId ?? row.model_id),
    ruleSetHash: requireString(row.ruleSetHash ?? row.rule_set_hash, "ruleSetHash"),
  };
}

export function runToRow(run: ReviewRun): ReviewRunRow {
  return {
    id: run.id,
    review_package_id: run.reviewPackageId,
    tenant_id: run.tenantId,
    workspace_id: run.workspaceId,
    project_id: run.projectId,
    status: run.status,
    scope: run.scope,
    input_documents: run.inputDocuments.map((doc) => ({
      document_id: doc.documentId,
      revision: doc.revision,
      role: doc.role,
      document_number: doc.documentNumber ?? null,
      inclusion: doc.inclusion,
    })),
    rules: run.rules.map((rule) => ({ rule_id: rule.ruleId, version: rule.version })),
    provenance: {
      engine_version: run.provenance.engineVersion,
      prompt_version: run.provenance.promptVersion ?? null,
      model_provider: run.provenance.modelProvider ?? null,
      model_id: run.provenance.modelId ?? null,
      rule_set_hash: run.provenance.ruleSetHash,
    },
    started_at: run.startedAt ?? null,
    completed_at: run.completedAt ?? null,
    created_at: run.createdAt,
    updated_at: run.updatedAt,
  };
}

export function runFromRow(row: ReviewRunRow): ReviewRun {
  return {
    id: asReviewRunId(row.id),
    reviewPackageId: asReviewPackageId(row.review_package_id),
    tenantId: asTenantId(row.tenant_id),
    workspaceId: asWorkspaceId(row.workspace_id),
    projectId: asProjectId(row.project_id),
    status: oneOf(row.status, REVIEW_RUN_STATUSES, "run_status") as ReviewRunStatus,
    scope: mapScope(row.scope),
    inputDocuments: asJsonArray(row.input_documents, "input_documents").map(mapPackageDocument),
    rules: mapRules(row.rules),
    provenance: mapRunProvenance(row.provenance),
    startedAt: optionalString(row.started_at),
    completedAt: optionalString(row.completed_at),
    createdAt: requireString(row.created_at, "created_at"),
    updatedAt: requireString(row.updated_at, "updated_at"),
  };
}

function mapFindingProvenance(raw: unknown): ReviewFindingProvenance {
  const row = asJsonObject(raw, "finding_provenance");
  const origin = oneOf(row.origin, ["detector", "ai_candidate", "human"] as const, "origin");
  return {
    origin,
    engineVersion: requireString(row.engineVersion ?? row.engine_version, "engineVersion"),
    ruleId: optionalString(row.ruleId ?? row.rule_id),
    ruleVersion: optionalString(row.ruleVersion ?? row.rule_version),
    detectorId: optionalString(row.detectorId ?? row.detector_id),
    modelProvider: optionalString(row.modelProvider ?? row.model_provider),
    modelId: optionalString(row.modelId ?? row.model_id),
    promptVersion: optionalString(row.promptVersion ?? row.prompt_version),
  };
}

export function findingToRow(finding: ReviewFinding): ReviewFindingRow {
  return {
    id: finding.id,
    review_package_id: finding.reviewPackageId,
    review_run_id: finding.reviewRunId,
    tenant_id: finding.tenantId,
    workspace_id: finding.workspaceId,
    project_id: finding.projectId,
    discipline: finding.discipline ?? null,
    category: finding.category,
    title: finding.title,
    description: finding.description,
    severity: finding.severity,
    confidence_band: finding.confidence.band,
    confidence_score: finding.confidence.score,
    requirement_references: [...finding.requirementReferences],
    reasoning_summary: finding.reasoningSummary,
    reasoning_basis: finding.reasoningBasis,
    recommended_action: finding.recommendedAction,
    status: finding.status,
    verification_state: finding.verificationState,
    human_disposition_id: finding.humanDispositionId ?? null,
    provenance: {
      origin: finding.provenance.origin,
      engine_version: finding.provenance.engineVersion,
      rule_id: finding.provenance.ruleId ?? null,
      rule_version: finding.provenance.ruleVersion ?? null,
      detector_id: finding.provenance.detectorId ?? null,
      model_provider: finding.provenance.modelProvider ?? null,
      model_id: finding.provenance.modelId ?? null,
      prompt_version: finding.provenance.promptVersion ?? null,
    },
    created_at: finding.createdAt,
    updated_at: finding.updatedAt,
  };
}

export function findingFromRow(row: ReviewFindingRow, evidence: readonly FindingEvidence[]): ReviewFinding {
  const score = Number(row.confidence_score);
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    failClosed("persistence_invalid", "Invalid confidence score", { score: row.confidence_score });
  }
  return {
    id: asReviewFindingId(row.id),
    reviewPackageId: asReviewPackageId(row.review_package_id),
    reviewRunId: asReviewRunId(row.review_run_id),
    tenantId: asTenantId(row.tenant_id),
    workspaceId: asWorkspaceId(row.workspace_id),
    projectId: asProjectId(row.project_id),
    discipline: optionalString(row.discipline),
    category: oneOf(row.category, REVIEW_FINDING_CATEGORIES, "category") as ReviewFindingCategory,
    title: requireString(row.title, "title"),
    description: requireString(row.description, "description"),
    severity: oneOf(row.severity, REVIEW_SEVERITIES, "severity") as ReviewSeverity,
    confidence: {
      band: oneOf(row.confidence_band, REVIEW_CONFIDENCE_BANDS, "confidence_band") as ReviewConfidenceBand,
      score,
    },
    evidence,
    requirementReferences: asJsonArray(row.requirement_references, "requirement_references").map((item) =>
      requireString(item, "requirement_reference"),
    ),
    reasoningSummary: requireString(row.reasoning_summary, "reasoning_summary"),
    reasoningBasis: oneOf(row.reasoning_basis, REVIEW_REASONING_BASIS, "reasoning_basis") as ReviewReasoningBasis,
    recommendedAction: requireString(row.recommended_action, "recommended_action"),
    status: oneOf(row.status, REVIEW_FINDING_STATUSES, "finding_status") as ReviewFindingStatus,
    verificationState: oneOf(
      row.verification_state,
      FINDING_VERIFICATION_STATES,
      "verification_state",
    ) as FindingVerificationState,
    humanDispositionId: optionalString(row.human_disposition_id),
    provenance: mapFindingProvenance(row.provenance),
    createdAt: requireString(row.created_at, "created_at"),
    updatedAt: requireString(row.updated_at, "updated_at"),
  };
}

export function evidenceToRow(findingId: string, evidence: FindingEvidence, timestamps?: { createdAt: string; updatedAt: string }): ReviewEvidenceRow {
  const now = new Date().toISOString();
  return {
    id: evidence.evidenceId,
    finding_id: findingId,
    tenant_id: evidence.tenantId,
    workspace_id: evidence.workspaceId,
    project_id: evidence.projectId,
    document_id: evidence.documentId,
    revision: evidence.revision ?? null,
    page: evidence.page ?? null,
    section: evidence.section ?? null,
    chunk_id: evidence.chunkId ?? null,
    span: evidence.span ?? null,
    retrieval_id: evidence.retrievalId ?? null,
    source_type: evidence.sourceType,
    verification_state: evidence.verificationState,
    content_hash: evidence.contentHash ?? null,
    created_at: timestamps?.createdAt ?? now,
    updated_at: timestamps?.updatedAt ?? now,
  };
}

export function evidenceFromRow(row: ReviewEvidenceRow): FindingEvidence {
  return {
    evidenceId: asFindingEvidenceId(row.id),
    documentId: asDocumentId(row.document_id),
    tenantId: asTenantId(row.tenant_id),
    workspaceId: asWorkspaceId(row.workspace_id),
    projectId: asProjectId(row.project_id),
    revision: optionalString(row.revision),
    page: row.page ?? undefined,
    section: optionalString(row.section),
    chunkId: optionalString(row.chunk_id),
    span: optionalString(row.span),
    retrievalId: optionalString(row.retrieval_id),
    sourceType: oneOf(row.source_type, EVIDENCE_SOURCE_TYPES, "source_type") as EvidenceSourceType,
    verificationState: oneOf(
      row.verification_state,
      EVIDENCE_VERIFICATION_STATES,
      "evidence_verification_state",
    ) as EvidenceVerificationState,
    contentHash: optionalString(row.content_hash),
  };
}

export function dispositionToRow(disposition: FindingDisposition, ownership: { tenantId: string; workspaceId: string; projectId: string }): ReviewDispositionRow {
  return {
    id: disposition.id,
    finding_id: disposition.findingId,
    tenant_id: ownership.tenantId,
    workspace_id: ownership.workspaceId,
    project_id: ownership.projectId,
    action: disposition.action,
    previous_status: disposition.previousStatus,
    new_status: disposition.newStatus,
    actor_id: disposition.actorId,
    actor_kind: disposition.actorKind,
    reason: disposition.reason ?? null,
    assigned_to: disposition.assignedTo ?? null,
    occurred_at: disposition.at,
    created_at: disposition.at,
  };
}

export function dispositionFromRow(row: ReviewDispositionRow): FindingDisposition {
  if (row.actor_kind !== "human") {
    failClosed("ai_cannot_dispose", "Persisted dispositions must have actor_kind=human", {
      actorKind: row.actor_kind,
    });
  }
  return {
    id: asFindingDispositionId(row.id),
    findingId: asReviewFindingId(row.finding_id),
    action: oneOf(row.action, REVIEW_DISPOSITION_ACTIONS, "disposition_action") as ReviewDispositionAction,
    previousStatus: oneOf(row.previous_status, REVIEW_FINDING_STATUSES, "previous_status") as ReviewFindingStatus,
    newStatus: oneOf(row.new_status, REVIEW_FINDING_STATUSES, "new_status") as ReviewFindingStatus,
    actorId: asActorId(requireString(row.actor_id, "actor_id")),
    actorKind: "human",
    reason: optionalString(row.reason),
    assignedTo: optionalString(row.assigned_to) ? asActorId(optionalString(row.assigned_to) as string) : undefined,
    at: requireString(row.occurred_at, "occurred_at"),
  };
}
