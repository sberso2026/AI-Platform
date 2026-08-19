import type {
  BusinessEvidenceRef,
  BusinessRiskActionLink,
  BusinessRiskAssessment,
  BusinessRiskCategory,
  BusinessRiskControl,
  BusinessRiskControlEffectiveness,
  BusinessRiskControlLink,
  BusinessRiskControlStatus,
  BusinessRiskControlType,
  BusinessRiskEvidenceLink,
  BusinessRiskEvidenceSourceType,
  BusinessRiskImpact,
  BusinessRiskIncident,
  BusinessRiskIncidentSeverity,
  BusinessRiskLevel,
  BusinessRiskLikelihood,
  BusinessRiskObligation,
  BusinessRiskObligationStatus,
  BusinessRiskRecord,
  BusinessRiskSettings,
  BusinessRiskStatus,
  BusinessRiskToleranceRule,
  BusinessRiskTreatment,
  BusinessRiskTreatmentStrategy,
} from "@rtb/types";
import {
  BUSINESS_RISK_ASSESSMENT_METHOD,
  BUSINESS_RISK_RESIDUAL_METHOD,
} from "@rtb/types";

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function bool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function evidence(value: unknown): BusinessEvidenceRef[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      sourceType: String(row.sourceType ?? row.source_type ?? "unknown"),
      sourceRef: String(row.sourceRef ?? row.source_ref ?? ""),
      title: String(row.title ?? "Evidence"),
      excerpt: row.excerpt ? String(row.excerpt) : undefined,
    };
  });
}

function jsonRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function mapRisk(row: Record<string, unknown>): BusinessRiskRecord {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    reference: str(row.reference),
    title: str(row.title),
    description: opt(row.description),
    category: str(row.category) as BusinessRiskCategory,
    domain: opt(row.domain),
    nature: "threat",
    ownerLabel: opt(row.owner_label),
    status: str(row.status) as BusinessRiskStatus,
    sourceType: str(row.source_type),
    sourceRef: str(row.source_ref),
    identifiedAt: str(row.identified_at),
    reviewAt: opt(row.review_at),
    closedAt: opt(row.closed_at),
    acceptedAt: opt(row.accepted_at),
    acceptedBy: opt(row.accepted_by),
    linkedDecisionId: opt(row.linked_decision_id),
    toleranceExceptionAt: opt(row.tolerance_exception_at),
    toleranceExceptionBy: opt(row.tolerance_exception_by),
    toleranceExceptionRationale: opt(row.tolerance_exception_rationale),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapAssessment(row: Record<string, unknown>): BusinessRiskAssessment {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: str(row.risk_id),
    version: num(row.version) ?? 1,
    method: BUSINESS_RISK_ASSESSMENT_METHOD,
    likelihood: str(row.likelihood) as BusinessRiskLikelihood,
    impact: str(row.impact) as BusinessRiskImpact,
    inherentLevel: str(row.inherent_level) as BusinessRiskLevel,
    residualLevel: str(row.residual_level) as BusinessRiskLevel,
    inherentScore: num(row.inherent_score),
    residualScore: num(row.residual_score),
    assessorLabel: opt(row.assessor_label),
    rationale: opt(row.rationale),
    assumptions: strings(row.assumptions),
    evidenceRefs: evidence(row.evidence_refs),
    residualMethod: BUSINESS_RISK_RESIDUAL_METHOD,
    residualRationale: opt(row.residual_rationale),
    assessedAt: str(row.assessed_at),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
  };
}

export function mapControl(row: Record<string, unknown>): BusinessRiskControl {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    name: str(row.name),
    description: opt(row.description),
    controlType: str(row.control_type) as BusinessRiskControlType,
    ownerLabel: opt(row.owner_label),
    status: str(row.status) as BusinessRiskControlStatus,
    effectiveness: str(row.effectiveness) as BusinessRiskControlEffectiveness,
    frequency: opt(row.frequency),
    evidenceRefs: evidence(row.evidence_refs),
    testedAt: opt(row.tested_at),
    reviewAt: opt(row.review_at),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapControlLink(row: Record<string, unknown>): BusinessRiskControlLink {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: str(row.risk_id),
    controlId: str(row.control_id),
    applicable: bool(row.applicable, true),
    createdAt: str(row.created_at),
  };
}

export function mapTreatment(row: Record<string, unknown>): BusinessRiskTreatment {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: str(row.risk_id),
    strategy: str(row.strategy) as BusinessRiskTreatmentStrategy,
    decisionId: opt(row.decision_id),
    expectedResidualLevel: (opt(row.expected_residual_level) as BusinessRiskLevel | null) ?? null,
    actualResidualLevel: (opt(row.actual_residual_level) as BusinessRiskLevel | null) ?? null,
    acceptedAt: opt(row.accepted_at),
    acceptedBy: opt(row.accepted_by),
    notes: opt(row.notes),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapActionLink(row: Record<string, unknown>): BusinessRiskActionLink {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: str(row.risk_id),
    treatmentId: opt(row.treatment_id),
    actionId: str(row.action_id),
    createdAt: str(row.created_at),
  };
}

export function mapObligation(row: Record<string, unknown>): BusinessRiskObligation {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: opt(row.risk_id),
    controlId: opt(row.control_id),
    actionId: opt(row.action_id),
    title: str(row.title),
    sourceRef: opt(row.source_ref),
    jurisdiction: opt(row.jurisdiction),
    ownerLabel: opt(row.owner_label),
    dueAt: opt(row.due_at),
    reviewAt: opt(row.review_at),
    status: str(row.status) as BusinessRiskObligationStatus,
    evidenceRefs: evidence(row.evidence_refs),
    authorizedConfirmation: bool(row.authorized_confirmation),
    confirmationBy: opt(row.confirmation_by),
    confirmationAt: opt(row.confirmation_at),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapIncident(row: Record<string, unknown>): BusinessRiskIncident {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: opt(row.risk_id),
    actionId: opt(row.action_id),
    title: str(row.title),
    description: opt(row.description),
    occurredAt: str(row.occurred_at),
    severity: str(row.severity) as BusinessRiskIncidentSeverity,
    sourceType: str(row.source_type),
    sourceRef: str(row.source_ref),
    impact: opt(row.impact),
    evidenceRefs: evidence(row.evidence_refs),
    provenance: jsonRecord(row.provenance),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
  };
}

export function mapEvidence(row: Record<string, unknown>): BusinessRiskEvidenceLink {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    riskId: str(row.risk_id),
    sourceType: str(row.source_type) as BusinessRiskEvidenceSourceType,
    sourceRef: str(row.source_ref),
    snapshot: jsonRecord(row.snapshot),
    capturedAt: str(row.captured_at),
    provenance: jsonRecord(row.provenance),
  };
}

export function mapSettings(row: Record<string, unknown>): BusinessRiskSettings {
  const rulesRaw = Array.isArray(row.rules) ? row.rules : [];
  const rules: BusinessRiskToleranceRule[] = rulesRaw.map((item) => {
    const rule = (item ?? {}) as Record<string, unknown>;
    return {
      domain: rule.domain ? String(rule.domain) : undefined,
      category: rule.category ? (String(rule.category) as BusinessRiskToleranceRule["category"]) : undefined,
      maxAcceptableLevel: String(rule.maxAcceptableLevel ?? rule.max_acceptable_level ?? "high") as Exclude<
        import("@rtb/types").BusinessRiskLevel,
        "unknown"
      >,
      escalationThreshold: rule.escalationThreshold
        ? (String(rule.escalationThreshold) as Exclude<import("@rtb/types").BusinessRiskLevel, "unknown">)
        : undefined,
      requiresApproval: Boolean(rule.requiresApproval ?? rule.requires_approval ?? true),
      unit: rule.unit ? String(rule.unit) : undefined,
      toleranceValue: rule.toleranceValue === undefined || rule.toleranceValue === null ? null : Number(rule.toleranceValue),
    };
  });
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    version: num(row.version) ?? 1,
    effectiveAt: str(row.effective_at),
    defaultMaxAcceptableLevel: str(row.default_max_acceptable_level) as BusinessRiskSettings["defaultMaxAcceptableLevel"],
    rules,
    provenance: jsonRecord(row.provenance),
    updatedAt: str(row.updated_at),
  };
}
