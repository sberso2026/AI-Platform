/**
 * Phase 9H — Inspection Intelligence predictive signals (advisory scaffolding).
 * Deterministic rules / statistical trends only. ML providers reserved and fail-closed.
 * Does NOT own Asset Intelligence or Digital Twin. No remaining-useful-life product claim.
 */
export type PredictiveSignalType =
  | "defect_recurrence_trend"
  | "overdue_action_pressure"
  | "condition_decline_trend"
  | "evidence_staleness"
  | "inspection_due_pressure";

export type PredictiveDataQuality = "good" | "degraded" | "insufficient" | "unavailable";

export type PredictiveDisposition =
  | "unreviewed"
  | "acknowledged"
  | "dismissed"
  | "escalated"
  | "expired"
  | "superseded";

export type PredictiveProviderKind = "deterministic_rule" | "statistical_trend" | "ml_reserved";

export type PredictiveSignal = {
  signalId: string;
  signalType: PredictiveSignalType;
  version: string;
  tenantId: string;
  workspaceId: string;
  sessionId?: string;
  targetRef: string;
  sourceInputs: readonly string[];
  timeWindow: { from: string; to: string };
  generatedAt: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  priority: number;
  confidence: number;
  uncertainty: number;
  explanation: string;
  contributingFactors: readonly string[];
  applicability: string;
  operatingBoundary: string;
  dataQuality: PredictiveDataQuality;
  freshness: "fresh" | "stale" | "expired";
  provider: {
    kind: PredictiveProviderKind;
    providerId: string;
    version: string;
  };
  recommendedReview: string;
  disposition: PredictiveDisposition;
  expiresAt: string;
  supersededBy?: string;
  provenanceRefs: readonly string[];
  auditRefs: readonly string[];
  /** Advisory only — never authoritative condition or irreversible action. */
  advisory: true;
  claimsRemainingUsefulLife: false;
  claimsProductionMlAccuracy: false;
  abstained: boolean;
  abstentionReason?: string;
};

export type PredictiveSignalEventType =
  | "engineering.inspection.predictive.generated"
  | "engineering.inspection.predictive.abstained"
  | "engineering.inspection.predictive.acknowledged"
  | "engineering.inspection.predictive.expired"
  | "engineering.inspection.predictive.provider_failed";

export type PredictiveSignalEvent = {
  type: PredictiveSignalEventType;
  tenantId: string;
  workspaceId?: string;
  signalId?: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export function createPredictiveSignalEvent(
  type: PredictiveSignalEventType,
  input: {
    tenantId: string;
    workspaceId?: string;
    signalId?: string;
    payload?: Record<string, unknown>;
  },
): PredictiveSignalEvent {
  return {
    type,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    signalId: input.signalId,
    occurredAt: new Date().toISOString(),
    payload: input.payload ?? {},
  };
}

export function abstainPredictiveSignal(input: {
  tenantId: string;
  workspaceId: string;
  signalType: PredictiveSignalType;
  reason: string;
  providerId: string;
  targetRef: string;
}): PredictiveSignal {
  const now = new Date();
  return {
    signalId: `ps_abstain_${Date.now().toString(36)}`,
    signalType: input.signalType,
    version: "1.0.0",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    targetRef: input.targetRef,
    sourceInputs: [],
    timeWindow: { from: now.toISOString(), to: now.toISOString() },
    generatedAt: now.toISOString(),
    severity: "info",
    priority: 0,
    confidence: 0,
    uncertainty: 1,
    explanation: `Abstaining: ${input.reason}`,
    contributingFactors: [],
    applicability: "none",
    operatingBoundary: "fail_closed",
    dataQuality: "unavailable",
    freshness: "expired",
    provider: {
      kind: input.providerId.startsWith("ml_") ? "ml_reserved" : "deterministic_rule",
      providerId: input.providerId,
      version: "1.0.0",
    },
    recommendedReview: "Do not treat as confirmed failure; restore inputs or provider.",
    disposition: "unreviewed",
    expiresAt: now.toISOString(),
    provenanceRefs: [],
    auditRefs: [],
    advisory: true,
    claimsRemainingUsefulLife: false,
    claimsProductionMlAccuracy: false,
    abstained: true,
    abstentionReason: input.reason,
  };
}

/** Fail closed when ML provider is requested but not certified. */
export function executeMlProviderReserved(input: {
  tenantId: string;
  workspaceId: string;
  targetRef: string;
}): PredictiveSignal {
  return abstainPredictiveSignal({
    ...input,
    signalType: "condition_decline_trend",
    reason: "ml_provider_not_certified",
    providerId: "ml_reserved",
  });
}

export function generateDeterministicPredictiveSignals(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  targetRef: string;
  openDefectCount: number;
  overdueActionCount: number;
  latestConditionOrdinal?: number;
  priorConditionOrdinal?: number;
  evidenceAgeDays: number;
  daysSinceLastInspection: number;
  inspectionIntervalDays: number;
}): PredictiveSignal[] {
  const now = new Date();
  const from = new Date(now.getTime() - 90 * 86400000).toISOString();
  const to = now.toISOString();
  const signals: PredictiveSignal[] = [];

  if (input.openDefectCount >= 2) {
    signals.push(
      baseSignal({
        ...input,
        signalType: "defect_recurrence_trend",
        from,
        to,
        severity: input.openDefectCount >= 4 ? "high" : "medium",
        priority: Math.min(90, 40 + input.openDefectCount * 10),
        confidence: 0.7,
        uncertainty: 0.3,
        explanation: `${input.openDefectCount} open defects in session scope suggest recurrence pressure.`,
        contributingFactors: [`open_defects=${input.openDefectCount}`],
        dataQuality: "good",
        providerId: "rule_defect_recurrence_v1",
      }),
    );
  }

  if (input.overdueActionCount > 0) {
    signals.push(
      baseSignal({
        ...input,
        signalType: "overdue_action_pressure",
        from,
        to,
        severity: input.overdueActionCount >= 3 ? "critical" : "high",
        priority: Math.min(95, 50 + input.overdueActionCount * 15),
        confidence: 0.85,
        uncertainty: 0.15,
        explanation: `${input.overdueActionCount} overdue corrective actions increase operational risk.`,
        contributingFactors: [`overdue_actions=${input.overdueActionCount}`],
        dataQuality: "good",
        providerId: "rule_overdue_actions_v1",
      }),
    );
  }

  if (
    input.latestConditionOrdinal !== undefined &&
    input.priorConditionOrdinal !== undefined &&
    input.latestConditionOrdinal > input.priorConditionOrdinal
  ) {
    signals.push(
      baseSignal({
        ...input,
        signalType: "condition_decline_trend",
        from,
        to,
        severity: "medium",
        priority: 60,
        confidence: 0.65,
        uncertainty: 0.35,
        explanation: `Ordinal condition moved from ${input.priorConditionOrdinal} to ${input.latestConditionOrdinal} (higher is worse).`,
        contributingFactors: [
          `prior=${input.priorConditionOrdinal}`,
          `latest=${input.latestConditionOrdinal}`,
        ],
        dataQuality: "good",
        providerId: "stat_condition_trend_v1",
        providerKind: "statistical_trend",
      }),
    );
  }

  if (input.evidenceAgeDays > 180) {
    signals.push(
      baseSignal({
        ...input,
        signalType: "evidence_staleness",
        from,
        to,
        severity: "low",
        priority: 30,
        confidence: 0.9,
        uncertainty: 0.1,
        explanation: `Evidence age ${input.evidenceAgeDays}d exceeds freshness threshold.`,
        contributingFactors: [`evidence_age_days=${input.evidenceAgeDays}`],
        dataQuality: "degraded",
        freshness: "stale",
        providerId: "rule_evidence_staleness_v1",
      }),
    );
  }

  if (input.daysSinceLastInspection > input.inspectionIntervalDays) {
    signals.push(
      baseSignal({
        ...input,
        signalType: "inspection_due_pressure",
        from,
        to,
        severity: "medium",
        priority: 55,
        confidence: 0.8,
        uncertainty: 0.2,
        explanation: `Last inspection ${input.daysSinceLastInspection}d ago exceeds interval ${input.inspectionIntervalDays}d.`,
        contributingFactors: [
          `days_since=${input.daysSinceLastInspection}`,
          `interval=${input.inspectionIntervalDays}`,
        ],
        dataQuality: "good",
        providerId: "rule_inspection_due_v1",
      }),
    );
  }

  if (signals.length === 0) {
    return [
      abstainPredictiveSignal({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        signalType: "defect_recurrence_trend",
        reason: "insufficient_signal_inputs",
        providerId: "rule_engine_v1",
        targetRef: input.targetRef,
      }),
    ];
  }
  return signals;
}

export function disposePredictiveSignal(
  signal: PredictiveSignal,
  disposition: Exclude<PredictiveDisposition, "unreviewed" | "expired" | "superseded">,
  actorUserId: string,
  reason: string,
): PredictiveSignal {
  if (!reason.trim()) throw new Error("predictive_disposition_reason_required");
  void actorUserId;
  return { ...signal, disposition };
}

function baseSignal(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  targetRef: string;
  signalType: PredictiveSignalType;
  from: string;
  to: string;
  severity: PredictiveSignal["severity"];
  priority: number;
  confidence: number;
  uncertainty: number;
  explanation: string;
  contributingFactors: readonly string[];
  dataQuality: PredictiveDataQuality;
  providerId: string;
  providerKind?: PredictiveProviderKind;
  freshness?: PredictiveSignal["freshness"];
}): PredictiveSignal {
  const generatedAt = new Date().toISOString();
  return {
    signalId: `ps_${input.signalType}_${Date.now().toString(36)}`,
    signalType: input.signalType,
    version: "1.0.0",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    targetRef: input.targetRef,
    sourceInputs: input.contributingFactors,
    timeWindow: { from: input.from, to: input.to },
    generatedAt,
    severity: input.severity,
    priority: input.priority,
    confidence: input.confidence,
    uncertainty: input.uncertainty,
    explanation: input.explanation,
    contributingFactors: input.contributingFactors,
    applicability: "inspection_intelligence_session_scope",
    operatingBoundary: "advisory_only_no_auto_mutation",
    dataQuality: input.dataQuality,
    freshness: input.freshness ?? "fresh",
    provider: {
      kind: input.providerKind ?? "deterministic_rule",
      providerId: input.providerId,
      version: "1.0.0",
    },
    recommendedReview: "Review with technical authority; do not treat as confirmed failure.",
    disposition: "unreviewed",
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    provenanceRefs: [`session:${input.sessionId}`],
    auditRefs: [],
    advisory: true,
    claimsRemainingUsefulLife: false,
    claimsProductionMlAccuracy: false,
    abstained: false,
  };
}
