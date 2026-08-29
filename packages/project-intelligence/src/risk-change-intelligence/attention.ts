import {
  actionEvidence,
  changePostureDeteriorated,
  changeStateEvidence,
  hasCostImpactIndication,
  hasScheduleImpactIndication,
  isCritical,
  isCriticalOrHigh,
  isOpenRisk,
  isOverdue,
  isStaleRecord,
  isUnowned,
  riskEvidence,
} from "./interpreter";
import type {
  ChangeAttentionItem,
  ChangeHealthSummary,
  ChangeSourceSlice,
  RiskAttentionItem,
  RiskChangeFreshnessState,
  RiskHealthSummary,
  RiskSourceSlice,
} from "./types";

export function buildRiskAttention(input: {
  slice: RiskSourceSlice;
  health: RiskHealthSummary;
  freshness: RiskChangeFreshnessState;
  generatedAt: string;
}): readonly RiskAttentionItem[] {
  const items: RiskAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: RiskAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  if (!input.slice.bound || input.slice.availability === "no_data") {
    push({
      id: "gap:unread-risk-register",
      severity: "info",
      reasonCode: "missing_unread_risk_evidence",
      explanation: "Canonical risk register is unread or unbound. This is not treated as low risk.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "risk",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.slice.items.length === 0) {
    push({
      id: "gap:empty-risk-register",
      severity: "info",
      reasonCode: "missing_unread_risk_evidence",
      explanation: "Canonical risk register is empty. Empty is not treated as low risk.",
      evidenceReference: {
        sourceDomain: "engineering_core",
        entityType: "risk",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  for (const risk of input.slice.items.filter(isOpenRisk)) {
    const asOf = risk.updatedAt ?? input.generatedAt;
    if (isCritical(risk)) {
      push({
        id: `risk:critical:${risk.id}`,
        severity: "red",
        reasonCode: "open_critical_risk",
        explanation: `Open canonical risk ${risk.id} is critical.`,
        evidenceReference: riskEvidence(risk),
        canonicalRiskId: risk.id,
        asOf,
      });
    } else if (isCriticalOrHigh(risk)) {
      push({
        id: `risk:high:${risk.id}`,
        severity: "amber",
        reasonCode: "open_high_risk",
        explanation: `Open canonical risk ${risk.id} is high.`,
        evidenceReference: riskEvidence(risk),
        canonicalRiskId: risk.id,
        asOf,
      });
    }
    if (isOverdue(risk, input.generatedAt)) {
      push({
        id: `risk:overdue:${risk.id}`,
        severity: "amber",
        reasonCode: "overdue_risk_treatment",
        explanation: `Open canonical risk ${risk.id} has an overdue due date.`,
        evidenceReference: riskEvidence(risk),
        canonicalRiskId: risk.id,
        asOf,
      });
    }
    if (isUnowned(risk)) {
      push({
        id: `risk:unowned:${risk.id}`,
        severity: "amber",
        reasonCode: "unowned_risk",
        explanation: `Open canonical risk ${risk.id} has no owner or assignee.`,
        evidenceReference: riskEvidence(risk),
        canonicalRiskId: risk.id,
        asOf,
      });
    }
    if (isStaleRecord(risk.updatedAt, input.generatedAt)) {
      push({
        id: `risk:stale:${risk.id}`,
        severity: "info",
        reasonCode: "stale_risk_review",
        explanation: `Canonical risk ${risk.id} has not been updated within the freshness window. A dedicated review date is not published.`,
        evidenceReference: riskEvidence(risk),
        canonicalRiskId: risk.id,
        asOf,
      });
    }
  }

  for (const action of input.slice.actions) {
    if (action.originatingObjectType !== "risk" || !action.originatingObjectId) continue;
    if (!isOverdue(action, input.generatedAt)) continue;
    const risk = input.slice.items.find((item) => item.id === action.originatingObjectId);
    if (!risk) continue;
    push({
      id: `risk:overdue-action:${action.id}`,
      severity: "amber",
      reasonCode: "overdue_risk_treatment",
      explanation: `Canonical action ${action.id} originating from risk ${risk.id} is overdue.`,
      evidenceReference: actionEvidence(action),
      canonicalRiskId: risk.id,
      asOf: action.updatedAt ?? input.generatedAt,
    });
  }

  if (input.health.classification === "RED" && !items.some((item) => item.severity === "red")) {
    const first = input.slice.items.find((item) => isOpenRisk(item) && isCritical(item));
    if (first) {
      push({
        id: `health:red:${first.id}`,
        severity: "red",
        reasonCode: input.health.reasonCodes[0] ?? "open_critical_or_high_score_risk",
        explanation: input.health.headline,
        evidenceReference: riskEvidence(first),
        canonicalRiskId: first.id,
        asOf: first.updatedAt ?? input.generatedAt,
      });
    }
  }

  return items;
}

export function buildChangeAttention(input: {
  slice: ChangeSourceSlice;
  health: ChangeHealthSummary;
  freshness: RiskChangeFreshnessState;
  generatedAt: string;
}): readonly ChangeAttentionItem[] {
  const items: ChangeAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: ChangeAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? input.generatedAt;

  if (!latest || input.slice.availability === "no_data") {
    push({
      id: "gap:missing-published-change",
      severity: "info",
      reasonCode: "insufficient_change_evidence",
      explanation: "No published Project Controls change assessment is available.",
      evidenceReference: {
        sourceDomain: "project_controls",
        entityType: "change_state",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.health.classification === "AMBER" || input.health.classification === "RED") {
    push({
      id: `health:${input.health.classification.toLowerCase()}:${latest.stateId}`,
      severity: input.health.classification === "RED" ? "red" : "amber",
      reasonCode: input.health.reasonCodes[0] ?? "change_status_pending",
      explanation: input.health.headline,
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }

  if (latest.impact?.schedule === "supported" || latest.impact?.cost === "supported") {
    push({
      id: `impact:high:${latest.stateId}`,
      severity: "amber",
      reasonCode: "unresolved_high_impact_change",
      explanation: "Published change impact context is supported for schedule or cost. No impact amount is published.",
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }
  if (hasScheduleImpactIndication(latest)) {
    push({
      id: `impact:schedule:${latest.stateId}`,
      severity: "info",
      reasonCode: "published_schedule_implication",
      explanation: `Published schedule implication is ${latest.impact?.schedule}. Schedule days were not calculated.`,
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }
  if (hasCostImpactIndication(latest)) {
    push({
      id: `impact:cost:${latest.stateId}`,
      severity: "info",
      reasonCode: "published_cost_implication",
      explanation: `Published cost implication is ${latest.impact?.cost}. Monetary impact was not calculated.`,
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }

  if (changePostureDeteriorated(input.slice)) {
    push({
      id: `trend:deteriorated:${latest.stateId}`,
      severity: "amber",
      reasonCode: "change_trend_deteriorated",
      explanation: "Published change posture deteriorated between published assessments.",
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }

  if (input.freshness === "STALE") {
    push({
      id: `freshness:stale:${latest.stateId}`,
      severity: "info",
      reasonCode: "stale_change_assessment",
      explanation: "Published change assessment is stale relative to the as-of time.",
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }

  if (
    latest.dataSufficiency === "insufficient" ||
    latest.dataSufficiency === "limited" ||
    latest.dataSufficiency === "conflicting"
  ) {
    push({
      id: `quality:insufficient:${latest.stateId}`,
      severity: "info",
      reasonCode: "insufficient_change_evidence",
      explanation: `Published change evidence sufficiency is ${latest.dataSufficiency}.`,
      evidenceReference: changeStateEvidence(latest),
      asOf,
    });
  }

  return items;
}
