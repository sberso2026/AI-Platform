import type { CommandCentreAvailability } from "../command-centre/types";
import {
  CANONICAL_RISK_CRITICAL_SCORE_THRESHOLD,
  CANONICAL_RISK_HIGH_SCORE_THRESHOLD,
} from "../project-health/evaluator";
import {
  classifySourcedRegisterRead,
  registerReadMayEvaluateGreen,
} from "../project-health/register-read-semantics";
import type { ProjectHealthOverallClassification } from "../project-health/types";
import type {
  CanonicalRiskActionRef,
  CanonicalRiskRef,
  ChangeDataQuality,
  ChangeEvidenceReference,
  ChangeHealthSummary,
  ChangePortfolioSummary,
  ChangePublishedImplications,
  ChangeSourceSlice,
  PublishedChangeImpactContext,
  PublishedChangeStateRef,
  PublishedChangeStatusContext,
  QualityBoundaryNote,
  RiskChangeFreshnessState,
  RiskChangeLinkedSignal,
  RiskDataQuality,
  RiskEvidenceReference,
  RiskHealthSummary,
  RiskMatrixSafety,
  RiskPortfolioSummary,
  RiskSourceSlice,
  UnsupportedChangeImpacts,
} from "./types";
import { CANONICAL_RISK_MATRIX_SCALE } from "./types";

export const RISK_CHANGE_STALE_MS = 45 * 24 * 60 * 60 * 1000;

const CHANGE_PRESSURE_RANK: Record<PublishedChangeStatusContext, number> = {
  unknown: 0,
  rejected_context: 0,
  approved_context: 0,
  pending: 2,
};

export const QUALITY_BOUNDARY: QualityBoundaryNote = {
  inspectionIntegrated: false,
  sources: ["core_issues", "pi_findings"],
  explanation:
    "Quality remains Core issues plus existing PI findings. Inspection Intelligence is not integrated in PI-4.",
};

export const UNSUPPORTED_CHANGE_IMPACTS: UnsupportedChangeImpacts = {
  monetaryAmount: "unavailable",
  scheduleDays: "unavailable",
  forecastImplication: "unavailable",
  redPosture: "unavailable",
  limitation: "change_impacts_not_independently_calculated",
};

export function asChangeStatusContext(value: string | undefined): PublishedChangeStatusContext | undefined {
  if (
    value === "pending" ||
    value === "approved_context" ||
    value === "rejected_context" ||
    value === "unknown"
  ) {
    return value;
  }
  return undefined;
}

export function asChangeImpactContext(value: string | undefined): PublishedChangeImpactContext | undefined {
  if (value === "suspected" || value === "supported" || value === "unknown" || value === "not_applicable") {
    return value;
  }
  return undefined;
}

export function classifyRiskChangeFreshness(
  availability: CommandCentreAvailability,
  asOf: string | undefined,
  generatedAt: string,
): RiskChangeFreshnessState {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return "UNAVAILABLE";
  }
  if (!asOf) return "UNKNOWN";
  const then = Date.parse(asOf);
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "UNKNOWN";
  if (now - then > RISK_CHANGE_STALE_MS) return "STALE";
  return "CURRENT";
}

export function riskEvidence(item: CanonicalRiskRef): RiskEvidenceReference {
  return {
    sourceDomain: "engineering_core",
    entityType: "risk",
    entityId: item.id,
    sourceTimestamp: item.updatedAt ?? item.createdAt,
    storesCanonicalCopy: false,
  };
}

export function actionEvidence(action: CanonicalRiskActionRef): ChangeEvidenceReference {
  return {
    sourceDomain: "engineering_core",
    entityType: "action",
    entityId: action.id,
    sourceTimestamp: action.updatedAt,
    storesCanonicalCopy: false,
  };
}

export function changeStateEvidence(state: PublishedChangeStateRef): ChangeEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "change_state",
    entityId: state.stateId,
    sourceTimestamp: state.publishedAt ?? state.assessedAt,
    sourceVersion: state.version === undefined ? undefined : String(state.version),
    storesCanonicalCopy: false,
  };
}

export function isOpenRisk(item: CanonicalRiskRef): boolean {
  return item.open;
}

export function isCriticalOrHigh(item: CanonicalRiskRef): boolean {
  if (item.priority === "critical" || item.priority === "high") return true;
  return typeof item.score === "number" && item.score >= CANONICAL_RISK_HIGH_SCORE_THRESHOLD;
}

export function isCritical(item: CanonicalRiskRef): boolean {
  if (item.priority === "critical") return true;
  return typeof item.score === "number" && item.score >= CANONICAL_RISK_CRITICAL_SCORE_THRESHOLD;
}

export function isUnowned(item: CanonicalRiskRef): boolean {
  return !item.ownerId && !item.assignedTo;
}

export function isOverdue(item: { dueAt?: string; open: boolean }, generatedAt: string): boolean {
  if (!item.open || !item.dueAt) return false;
  const due = Date.parse(item.dueAt);
  const now = Date.parse(generatedAt);
  return Number.isFinite(due) && Number.isFinite(now) && due < now;
}

export function isStaleRecord(updatedAt: string | undefined, generatedAt: string): boolean {
  if (!updatedAt) return false;
  return classifyRiskChangeFreshness("ok", updatedAt, generatedAt) === "STALE";
}

export function interpretRiskMatrix(items: readonly CanonicalRiskRef[]): RiskMatrixSafety {
  const matrixIds = [...new Set(items.map((item) => item.matrixId).filter((id): id is string => Boolean(id)))];
  const missing = items.some((item) => !item.matrixId);
  const incompatible = matrixIds.length > 1 || (matrixIds.length === 1 && missing && items.length > 1);
  return {
    scale: CANONICAL_RISK_MATRIX_SCALE,
    matrixIds,
    compatible: !incompatible,
    silentlyNormalized: false,
    independentScoringImplemented: false,
    limitation: incompatible
      ? "incompatible_risk_matrices_not_normalized"
      : matrixIds.length === 0
        ? "risk_matrix_id_not_published"
        : undefined,
  };
}

export function classifyRiskHealth(slice: RiskSourceSlice): RiskHealthSummary {
  const readState = classifySourcedRegisterRead({
    bound: slice.bound,
    completeness: slice.completeness,
    availability: slice.availability,
  });
  if (readState === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Risk intelligence is unavailable.",
      reasonCodes: ["risk_source_unavailable"],
    };
  }
  if (readState === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: "Risk access denied.",
      reasonCodes: ["risk_forbidden"],
    };
  }
  if (readState === "unread") {
    return {
      classification: "UNKNOWN",
      headline: "Canonical risk register is unread or unbound.",
      reasonCodes: ["unread_risk_register"],
    };
  }
  if (readState === "unknown_completeness" || !registerReadMayEvaluateGreen(readState)) {
    return {
      classification: "UNKNOWN",
      headline: "Canonical risk register completeness is unknown.",
      reasonCodes: ["risk_register_completeness_unknown"],
    };
  }

  const open = slice.items.filter(isOpenRisk);
  const critical = open.filter(isCritical);
  if (critical.length > 0) {
    return {
      classification: "RED",
      headline: "Open critical canonical risk is present.",
      reasonCodes: ["open_critical_or_high_score_risk"],
    };
  }
  const high = open.filter((item) => isCriticalOrHigh(item) && !isCritical(item));
  if (high.length > 0) {
    return {
      classification: "AMBER",
      headline: "Open high canonical risk is present.",
      reasonCodes: ["open_elevated_risk"],
    };
  }
  return {
    classification: "GREEN",
    headline:
      slice.items.length === 0
        ? "Canonical risk register was read completely and has no applicable open risks."
        : "Canonical risk register is bound and has no open critical or high risks.",
    reasonCodes: ["no_open_elevated_risks"],
  };
}

export function classifyChangeHealth(
  latest: PublishedChangeStateRef | null,
  availability: CommandCentreAvailability,
): ChangeHealthSummary {
  if (availability === "error" || availability === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Change intelligence is unavailable.",
      reasonCodes: ["change_source_unavailable"],
    };
  }
  if (availability === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: "Change access denied.",
      reasonCodes: ["change_forbidden"],
    };
  }
  if (!latest || availability === "no_data") {
    return {
      classification: "UNKNOWN",
      headline: "No published change assessment.",
      reasonCodes: ["missing_published_change_assessment"],
    };
  }
  if (!latest.published) {
    return {
      classification: "UNKNOWN",
      statusContext: latest.statusContext,
      headline: "Change assessment is unpublished.",
      reasonCodes: ["change_unpublished"],
    };
  }
  if (latest.abstained || !latest.statusContext || latest.statusContext === "unknown") {
    return {
      classification: "UNKNOWN",
      statusContext: latest.statusContext ?? "unknown",
      headline: "Published change posture is unknown.",
      reasonCodes: ["change_posture_unknown"],
    };
  }
  if (latest.statusContext === "pending") {
    return {
      classification: "AMBER",
      statusContext: "pending",
      headline: "Published change posture is pending.",
      reasonCodes: ["change_status_pending"],
    };
  }
  return {
    classification: "GREEN" as ProjectHealthOverallClassification,
    statusContext: latest.statusContext,
    headline:
      latest.statusContext === "rejected_context"
        ? "Published change posture is rejected in source context."
        : "Published change posture is approved in source context.",
    reasonCodes: [`change_status_${latest.statusContext}`],
  };
}

export function interpretRiskPortfolio(input: {
  items: readonly CanonicalRiskRef[];
  actions: readonly CanonicalRiskActionRef[];
  generatedAt: string;
  matrix: RiskMatrixSafety;
}): RiskPortfolioSummary {
  const open = input.items.filter(isOpenRisk);
  const categoryCounts: Record<string, number> = {};
  if (input.matrix.compatible) {
    for (const item of open) {
      if (!item.category) continue;
      categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
    }
  }
  const overdueFromRisk = open.filter((item) => isOverdue(item, input.generatedAt)).length;
  const overdueFromActions = input.actions.filter(
    (action) =>
      action.open &&
      action.originatingObjectType === "risk" &&
      Boolean(action.originatingObjectId) &&
      isOverdue(action, input.generatedAt),
  ).length;
  return {
    openCount: open.length,
    criticalHighCount: open.filter(isCriticalOrHigh).length,
    overdueMitigationCount: overdueFromRisk + overdueFromActions,
    unownedCount: open.filter(isUnowned).length,
    staleReviewCount: open.filter((item) => isStaleRecord(item.updatedAt, input.generatedAt)).length,
    categoryCounts,
    numericalScoreImplemented: false,
    matricesNormalized: false,
  };
}

export function hasScheduleImpactIndication(state: PublishedChangeStateRef): boolean {
  const impact = state.impact?.schedule;
  return impact === "supported" || impact === "suspected";
}

export function hasCostImpactIndication(state: PublishedChangeStateRef): boolean {
  const impact = state.impact?.cost;
  return impact === "supported" || impact === "suspected";
}

export function isHighImpactChange(state: PublishedChangeStateRef): boolean {
  return state.impact?.schedule === "supported" || state.impact?.cost === "supported";
}

export function interpretChangePortfolio(input: {
  slice: ChangeSourceSlice;
  generatedAt: string;
}): ChangePortfolioSummary {
  const published = input.slice.history.filter((row) => row.published);
  const latest = input.slice.latest;
  const pending = published.filter((row) => row.statusContext === "pending");
  const stale =
    latest && classifyRiskChangeFreshness(input.slice.availability, latest.publishedAt ?? latest.assessedAt, input.generatedAt) === "STALE"
      ? 1
      : 0;
  return {
    openPendingCount: pending.length,
    highImpactCount: published.filter(isHighImpactChange).length,
    scheduleImpactIndicationCount: published.filter(hasScheduleImpactIndication).length,
    costImpactIndicationCount: published.filter(hasCostImpactIndication).length,
    staleAssessmentCount: stale,
    monetaryImpactsSummed: false,
    exposureInvented: false,
  };
}

export function interpretChangeImplications(latest: PublishedChangeStateRef | null): ChangePublishedImplications {
  if (!latest) {
    return {
      forecastPublished: false,
      monetaryAmountPublished: false,
      scheduleDaysPublished: false,
      summary: "No published change implications.",
    };
  }
  const parts = [
    latest.statusContext
      ? `Published change posture: ${latest.statusContext}.`
      : "Published change posture is unknown.",
    latest.impact?.schedule
      ? `Published schedule implication: ${latest.impact.schedule}.`
      : "Published schedule implication is not available.",
    latest.impact?.cost
      ? `Published cost implication: ${latest.impact.cost}.`
      : "Published cost implication is not available.",
    "Forecast implication, monetary amounts, and schedule-day effects are not published and were not calculated.",
  ];
  return {
    schedule: latest.impact?.schedule,
    cost: latest.impact?.cost,
    forecastPublished: false,
    monetaryAmountPublished: false,
    scheduleDaysPublished: false,
    summary: parts.join(" "),
  };
}

export function interpretRiskDataQuality(input: {
  slice: RiskSourceSlice;
  matrix: RiskMatrixSafety;
  generatedAt: string;
}): RiskDataQuality {
  const asOf = input.slice.sourceTimestamp ?? input.slice.items[0]?.updatedAt;
  const freshness = classifyRiskChangeFreshness(input.slice.availability, asOf, input.generatedAt);
  const missing: string[] = [];
  const limitations: string[] = [
    "risk_review_date_not_published",
    "risk_trend_unavailable",
    "pc_risk_overlay_not_used_as_canonical_register",
  ];
  if (!input.slice.bound) missing.push("canonical_risk_register");
  if (input.slice.items.some((item) => item.score === undefined)) missing.push("published_risk_score");
  if (freshness === "STALE") limitations.push("stale_canonical_risk_records");
  if (input.matrix.limitation) limitations.push(input.matrix.limitation);
  if (input.slice.availability === "no_data") limitations.push("canonical_risks_not_bound");
  return {
    asOf,
    source: "engineering_core",
    freshness,
    missing,
    limitations,
    registerBound: input.slice.bound,
  };
}

export function interpretChangeDataQuality(input: {
  slice: ChangeSourceSlice;
  generatedAt: string;
}): ChangeDataQuality {
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? latest?.recordedAt;
  const freshness = classifyRiskChangeFreshness(input.slice.availability, asOf, input.generatedAt);
  const missing: string[] = [];
  const limitations: string[] = [
    "change_monetary_impact_not_published",
    "change_schedule_days_not_published",
    "change_forecast_implication_not_published",
    "change_red_posture_not_published",
    "change_assessment_is_not_contractual_approval",
  ];
  if (!latest) missing.push("published_change_assessment");
  if (latest && !latest.impact?.schedule) missing.push("published_schedule_implication");
  if (latest && !latest.impact?.cost) missing.push("published_cost_implication");
  if (freshness === "STALE") limitations.push("stale_published_change");
  if (input.slice.availability === "no_data") limitations.push("absent_project_controls_change");
  return {
    asOf,
    publishedAt: latest?.publishedAt,
    source: "project_controls",
    freshness,
    completeness: latest?.dataSufficiency,
    missing,
    limitations,
    evidenceCount: latest?.evidenceCount,
    usableEvidenceCount: latest?.usableEvidenceCount,
  };
}

export function explicitRiskIdFromChangeEvidence(sourceRef: string, sourceKey: string): string | undefined {
  const refMatch = sourceRef.match(/^risk:(.+)$/i);
  if (refMatch?.[1]) return refMatch[1];
  const keyMatch = sourceKey.match(/^risk:(.+)$/i);
  if (keyMatch?.[1]) return keyMatch[1];
  return undefined;
}

export function interpretLinkedSignals(input: {
  risk: RiskSourceSlice;
  change: ChangeSourceSlice;
}): readonly RiskChangeLinkedSignal[] {
  if (!input.risk.bound) return [];
  const risksById = new Map(input.risk.items.map((item) => [item.id, item]));
  const signals: RiskChangeLinkedSignal[] = [];
  const seen = new Set<string>();
  const push = (signal: RiskChangeLinkedSignal) => {
    if (seen.has(signal.id)) return;
    seen.add(signal.id);
    signals.push(signal);
  };

  for (const action of input.risk.actions) {
    if (action.originatingObjectType !== "risk" || !action.originatingObjectId) continue;
    const risk = risksById.get(action.originatingObjectId);
    if (!risk) continue;
    push({
      id: `link:action:${action.id}:${risk.id}`,
      reasonCode: "risk_linked_to_canonical_action",
      explanation: `Canonical action ${action.id} originates from risk ${risk.id}.`,
      riskEvidence: riskEvidence(risk),
      changeOrActionEvidence: actionEvidence(action),
    });
  }

  if (input.change.latest && input.change.availability !== "error" && input.change.availability !== "unavailable") {
    for (const evidence of input.change.evidence) {
      if (evidence.revoked) continue;
      const linkedId =
        explicitRiskIdFromChangeEvidence(evidence.sourceRef, evidence.sourceKey) ??
        (evidence.sourceType === "project_intelligence" && risksById.has(evidence.sourceKey)
          ? evidence.sourceKey
          : undefined);
      if (!linkedId) continue;
      const risk = risksById.get(linkedId);
      if (!risk) continue;
      push({
        id: `link:change:${evidence.evidenceId}:${risk.id}`,
        reasonCode: "change_linked_to_canonical_risk",
        explanation: `Published change evidence ${evidence.evidenceId} explicitly references risk ${risk.id}.`,
        riskEvidence: riskEvidence(risk),
        changeOrActionEvidence: {
          sourceDomain: "project_controls",
          entityType: "change_evidence",
          entityId: evidence.evidenceId,
          sourceTimestamp: evidence.recordedAt,
          storesCanonicalCopy: false,
        },
      });
    }
  }

  return signals;
}

export function changePostureDeteriorated(slice: ChangeSourceSlice): boolean {
  const published = slice.history.filter((row) => row.published && row.statusContext);
  if (published.length < 2) return false;
  const latest = published[0]?.statusContext ?? "unknown";
  const prior = published[1]?.statusContext ?? "unknown";
  return CHANGE_PRESSURE_RANK[latest] > CHANGE_PRESSURE_RANK[prior];
}
