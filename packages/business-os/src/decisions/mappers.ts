import type {
  BusinessDecisionContext,
  BusinessDecisionDomain,
  BusinessDecisionEvidenceItem,
  BusinessDecisionImpact,
  BusinessDecisionLesson,
  BusinessDecisionOption,
  BusinessDecisionOutcome,
  BusinessEvidenceRef,
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

export function mapContext(row: Record<string, unknown>): BusinessDecisionContext {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    decisionId: str(row.decision_id),
    question: str(row.question),
    problemStatement: opt(row.problem_statement),
    originatingSignalId: opt(row.originating_signal_id),
    originatingRecommendationId: opt(row.originating_recommendation_id),
    domain: (row.domain as BusinessDecisionDomain) ?? "general",
    ownerLabel: opt(row.owner_label),
    stakeholders: strings(row.stakeholders),
    urgency: (row.urgency as BusinessDecisionContext["urgency"]) ?? "normal",
    dueAt: opt(row.due_at),
    evidenceCompletenessBps: opt(row.evidence_completeness_bps),
    assumptions: strings(row.assumptions),
    constraints: strings(row.constraints),
    selectedOptionId: opt(row.selected_option_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapEvidence(row: Record<string, unknown>): BusinessDecisionEvidenceItem {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    decisionId: str(row.decision_id),
    optionId: opt(row.option_id),
    sourceType: str(row.source_type),
    sourceDomain: (row.source_domain as BusinessDecisionDomain) ?? "general",
    sourceId: opt(row.source_id),
    sourceRef: str(row.source_ref),
    summary: str(row.summary),
    valueState: (row.value_state as BusinessDecisionEvidenceItem["valueState"]) ?? "unknown",
    valueText: opt(row.value_text),
    valueMinor: opt(row.value_minor),
    currency: opt(row.currency),
    scale: row.scale == null ? null : Number(row.scale),
    unit: opt(row.unit),
    observedAt: opt(row.observed_at),
    linkedAt: str(row.linked_at || row.created_at),
    freshness: opt(row.freshness),
    confidence: (row.confidence as BusinessDecisionEvidenceItem["confidence"]) ?? "unavailable",
    evidenceQuality: (row.evidence_quality as BusinessDecisionEvidenceItem["evidenceQuality"]) ?? "unavailable",
    snapshot: (row.snapshot as Record<string, unknown>) ?? {},
    generatedBy: (row.generated_by as BusinessDecisionEvidenceItem["generatedBy"]) ?? "user",
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapOption(row: Record<string, unknown>): BusinessDecisionOption {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    decisionId: str(row.decision_id),
    title: str(row.title),
    description: opt(row.description),
    status: row.status as BusinessDecisionOption["status"],
    assumptions: strings(row.assumptions),
    constraints: strings(row.constraints),
    expectedBenefits: opt(row.expected_benefits),
    expectedCosts: opt(row.expected_costs),
    expectedRisks: opt(row.expected_risks),
    reversibility: (row.reversibility as BusinessDecisionOption["reversibility"]) ?? "unknown",
    generatedBy: (row.generated_by as BusinessDecisionOption["generatedBy"]) ?? "user",
    aiGenerated: bool(row.ai_generated) || row.generated_by === "platform_ai_director",
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapImpact(row: Record<string, unknown>): BusinessDecisionImpact {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    optionId: str(row.option_id),
    dimension: row.dimension as BusinessDecisionImpact["dimension"],
    quantification: (row.quantification as BusinessDecisionImpact["quantification"]) ?? "unknown",
    valueMinor: opt(row.value_minor),
    currency: opt(row.currency),
    scale: row.scale == null ? null : Number(row.scale),
    unit: opt(row.unit),
    period: opt(row.period),
    qualitativeLabel: opt(row.qualitative_label),
    qualitativeOnly: bool(row.qualitative_only),
    sourceDomain: opt(row.source_domain),
    sourceRef: opt(row.source_ref),
    ruleVersion: opt(row.rule_version),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapOutcome(row: Record<string, unknown>): BusinessDecisionOutcome {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    decisionId: str(row.decision_id),
    selectedOptionId: opt(row.selected_option_id),
    expectedOutcome: opt(row.expected_outcome),
    expectedMetricKey: opt(row.expected_metric_key),
    expectedValue: opt(row.expected_value),
    expectedUnit: opt(row.expected_unit),
    expectedCurrency: opt(row.expected_currency),
    expectedScale: row.expected_scale == null ? null : Number(row.expected_scale),
    expectedPeriod: opt(row.expected_period),
    actualOutcome: opt(row.actual_outcome),
    actualMetricKey: opt(row.actual_metric_key),
    actualValue: opt(row.actual_value),
    actualUnit: opt(row.actual_unit),
    actualCurrency: opt(row.actual_currency),
    actualScale: row.actual_scale == null ? null : Number(row.actual_scale),
    actualPeriod: opt(row.actual_period),
    measurementDate: opt(row.measurement_date)?.slice(0, 10) ?? null,
    measurementWindowStart: opt(row.measurement_window_start)?.slice(0, 10) ?? null,
    measurementWindowEnd: opt(row.measurement_window_end)?.slice(0, 10) ?? null,
    status: row.status as BusinessDecisionOutcome["status"],
    varianceValue: opt(row.variance_value),
    varianceState: row.variance_state === "computed" ? "computed" : "unknown",
    explanation: opt(row.explanation),
    evidenceRefs: evidence(row.evidence_refs),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapLesson(row: Record<string, unknown>): BusinessDecisionLesson {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    decisionId: str(row.decision_id),
    selectedOptionId: opt(row.selected_option_id),
    assumptionsSnapshot: strings(row.assumptions_snapshot),
    evidenceSnapshot: (row.evidence_snapshot as Record<string, unknown>) ?? {},
    expectedOutcome: opt(row.expected_outcome),
    actualOutcome: opt(row.actual_outcome),
    lessonText: str(row.lesson_text),
    draftSource: (row.draft_source as BusinessDecisionLesson["draftSource"]) ?? "user",
    status: row.status as BusinessDecisionLesson["status"],
    acceptedAt: opt(row.accepted_at),
    acceptedBy: opt(row.accepted_by),
    memoryId: opt(row.memory_id),
    reviewStatus: (row.review_status as BusinessDecisionLesson["reviewStatus"]) ?? "pending",
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
