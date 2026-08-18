import type {
  BusinessAction,
  BusinessDecision,
  BusinessEvidenceRef,
  BusinessKpi,
  BusinessRecommendation,
  BusinessSignal,
} from "@rtb/types";

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

export function mapKpi(row: Record<string, unknown>): BusinessKpi {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    key: String(row.key),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    category: row.category as BusinessKpi["category"],
    unit: String(row.unit ?? "count"),
    value: num(row.value),
    target: num(row.target),
    warningThreshold: num(row.warning_threshold),
    criticalThreshold: num(row.critical_threshold),
    direction: (row.direction as BusinessKpi["direction"]) ?? "higher_is_better",
    status: row.status as BusinessKpi["status"],
    measuredAt: (row.measured_at as string | null) ?? null,
    sourceType: (row.source_type as BusinessKpi["sourceType"]) ?? "manual",
    sourceRef: (row.source_ref as string | null) ?? null,
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapSignal(row: Record<string, unknown>): BusinessSignal {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    type: String(row.type),
    severity: row.severity as BusinessSignal["severity"],
    title: String(row.title),
    summary: String(row.summary),
    sourceType: (row.source_type as BusinessSignal["sourceType"]) ?? "kpi",
    sourceRef: (row.source_ref as string | null) ?? null,
    kpiId: (row.kpi_id as string | null) ?? null,
    evidence: evidence(row.evidence),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    detectedAt: String(row.detected_at),
    status: row.status as BusinessSignal["status"],
    businessImpact: (row.business_impact as BusinessSignal["businessImpact"]) ?? null,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRecommendation(row: Record<string, unknown>): BusinessRecommendation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    signalId: (row.signal_id as string | null) ?? null,
    title: String(row.title),
    recommendationText: String(row.recommendation_text),
    rationaleSummary: String(row.rationale_summary),
    expectedImpact: (row.expected_impact as string | null) ?? null,
    confidence: (row.confidence as BusinessRecommendation["confidence"]) ?? "medium",
    evidenceRefs: evidence(row.evidence_refs),
    status: row.status as BusinessRecommendation["status"],
    generatedBy: (row.generated_by as BusinessRecommendation["generatedBy"]) ?? "deterministic_rule",
    advisoryOnly: true,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapDecision(row: Record<string, unknown>): BusinessDecision {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    recommendationId: (row.recommendation_id as string | null) ?? null,
    statement: String(row.statement),
    context: (row.context as string | null) ?? null,
    ownerId: (row.owner_id as string | null) ?? null,
    status: row.status as BusinessDecision["status"],
    decision: (row.decision as BusinessDecision["decision"]) ?? null,
    rationale: (row.rationale as string | null) ?? null,
    decidedAt: (row.decided_at as string | null) ?? null,
    reviewAt: (row.review_at as string | null) ?? null,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapAction(row: Record<string, unknown>): BusinessAction {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    decisionId: (row.decision_id as string | null) ?? null,
    title: String(row.title),
    ownerId: (row.owner_id as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
    priority: (row.priority as BusinessAction["priority"]) ?? "medium",
    status: row.status as BusinessAction["status"],
    completionEvidence: (row.completion_evidence as Record<string, unknown>) ?? {},
    completedAt: (row.completed_at as string | null) ?? null,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
