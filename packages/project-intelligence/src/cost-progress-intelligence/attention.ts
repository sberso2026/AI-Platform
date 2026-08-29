import {
  costPostureDeteriorated,
  costStateEvidence,
  progressAssessmentEvidence,
  progressDeteriorated,
} from "./interpreter";
import type {
  CostAttentionItem,
  CostHealthSummary,
  CostProgressFreshnessState,
  CostSourceSlice,
  ProgressAttentionItem,
  ProgressHealthSummary,
  ProgressSourceSlice,
} from "./types";

export function buildCostAttention(input: {
  slice: CostSourceSlice;
  health: CostHealthSummary;
  freshness: CostProgressFreshnessState;
  generatedAt: string;
}): readonly CostAttentionItem[] {
  const items: CostAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: CostAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? input.generatedAt;

  if (!latest || input.slice.availability === "no_data") {
    push({
      id: "gap:missing-published-cost",
      severity: "info",
      reasonCode: "missing_published_cost_assessment",
      explanation: "No published Project Controls cost assessment is available.",
      evidenceReference: {
        sourceDomain: "project_controls",
        entityType: "cost_state",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.health.classification === "RED") {
    push({
      id: `health:red:${latest.stateId}`,
      severity: "red",
      reasonCode: input.health.reasonCodes[0] ?? "cost_posture_over",
      explanation: input.health.headline,
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
    push({
      id: `variance:overrun:${latest.stateId}`,
      severity: "red",
      reasonCode: "published_cost_overrun",
      explanation: "Published cost posture is over tolerance. No monetary overrun amount is published.",
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
  } else if (input.health.classification === "AMBER") {
    push({
      id: `health:amber:${latest.stateId}`,
      severity: "amber",
      reasonCode: input.health.reasonCodes[0] ?? "cost_posture_attention_required",
      explanation: input.health.headline,
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
  }

  if (latest.varianceAttribution && latest.varianceAttribution !== "explained_by_approved_change") {
    push({
      id: `variance:attribution:${latest.stateId}`,
      severity: input.health.classification === "RED" ? "red" : "info",
      reasonCode: "published_cost_variance_attribution",
      explanation: `Published variance attribution is ${latest.varianceAttribution}.`,
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
  }

  if (costPostureDeteriorated(input.slice)) {
    push({
      id: `trend:deteriorated:${latest.stateId}`,
      severity: "amber",
      reasonCode: "cost_forecast_deteriorated",
      explanation: "Published cost posture deteriorated between published assessments. No forecast amount is published.",
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
  }

  for (const evidence of input.slice.evidence) {
    if (evidence.revoked) continue;
    if (evidence.kind !== "commitment_reference") continue;
    if (evidence.declaredDirection === "over_basis" || evidence.declaredDirection === "attention_required") {
      push({
        id: `commitment:pressure:${evidence.evidenceId}`,
        severity: "amber",
        reasonCode: "committed_cost_pressure",
        explanation:
          "Published commitment evidence indicates pressure relative to basis. No committed amount is published.",
        evidenceReference: {
          sourceDomain: "project_controls",
          entityType: "cost_evidence",
          entityId: evidence.evidenceId,
          sourceTimestamp: evidence.recordedAt,
          storesCanonicalCopy: false,
        },
        asOf: evidence.recordedAt ?? asOf,
      });
    }
  }

  if (input.freshness === "STALE") {
    push({
      id: `freshness:stale:${latest.stateId}`,
      severity: "info",
      reasonCode: "stale_cost_data",
      explanation: "Published cost assessment is stale relative to the Command Centre as-of time.",
      evidenceReference: costStateEvidence(latest),
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
      reasonCode: "insufficient_cost_evidence",
      explanation: `Published cost evidence sufficiency is ${latest.dataSufficiency}.`,
      evidenceReference: costStateEvidence(latest),
      asOf,
    });
  }

  return items;
}

export function buildProgressAttention(input: {
  slice: ProgressSourceSlice;
  health: ProgressHealthSummary;
  freshness: CostProgressFreshnessState;
  generatedAt: string;
}): readonly ProgressAttentionItem[] {
  const items: ProgressAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: ProgressAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? input.generatedAt;

  if (!latest || input.slice.availability === "no_data") {
    push({
      id: "gap:missing-published-progress",
      severity: "info",
      reasonCode: "missing_published_progress_assessment",
      explanation: "No published Project Controls progress assessment is available.",
      evidenceReference: {
        sourceDomain: "project_controls",
        entityType: "progress_assessment",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.health.classification === "AMBER" || input.health.classification === "RED") {
    push({
      id: `health:${input.health.classification.toLowerCase()}:${latest.assessmentId}`,
      severity: input.health.classification === "RED" ? "red" : "amber",
      reasonCode: input.health.reasonCodes[0] ?? "progress_trend_declining",
      explanation: input.health.headline,
      evidenceReference: progressAssessmentEvidence(latest),
      asOf,
    });
  }

  if (latest.trendDirection === "declining") {
    push({
      id: `trend:declining:${latest.assessmentId}`,
      severity: "amber",
      reasonCode: "published_progress_concern",
      explanation: "Published progress trend is declining. Plan variance is not published.",
      evidenceReference: progressAssessmentEvidence(latest),
      asOf,
    });
  }

  if (progressDeteriorated(input.slice)) {
    push({
      id: `trend:deteriorated:${latest.assessmentId}`,
      severity: "amber",
      reasonCode: "progress_deteriorated",
      explanation: "Published progress deteriorated between published assessments.",
      evidenceReference: progressAssessmentEvidence(latest),
      asOf,
    });
  }

  if (input.freshness === "STALE") {
    push({
      id: `freshness:stale:${latest.assessmentId}`,
      severity: "info",
      reasonCode: "stale_progress_data",
      explanation: "Published progress assessment is stale relative to the Command Centre as-of time.",
      evidenceReference: progressAssessmentEvidence(latest),
      asOf,
    });
  }

  if (
    latest.dataSufficiency === "insufficient" ||
    latest.dataSufficiency === "limited" ||
    latest.dataSufficiency === "conflicting"
  ) {
    push({
      id: `quality:insufficient:${latest.assessmentId}`,
      severity: "info",
      reasonCode: "insufficient_progress_evidence",
      explanation: `Published progress evidence sufficiency is ${latest.dataSufficiency}.`,
      evidenceReference: progressAssessmentEvidence(latest),
      asOf,
    });
  }

  return items;
}
