import { assessmentEvidence, lateMilestoneCount } from "./interpreter";
import type {
  ScheduleAttentionItem,
  ScheduleHealthSummary,
  ScheduleIntelligenceSourceSnapshot,
  ScheduleTrend,
} from "./types";

export function buildScheduleAttention(input: {
  snapshot: ScheduleIntelligenceSourceSnapshot;
  health: ScheduleHealthSummary;
  trend: ScheduleTrend;
  freshness: "CURRENT" | "STALE" | "UNKNOWN" | "UNAVAILABLE";
  generatedAt: string;
}): readonly ScheduleAttentionItem[] {
  const items: ScheduleAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: ScheduleAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  const latest = input.snapshot.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? input.generatedAt;

  if (!latest || input.snapshot.availability === "no_data") {
    push({
      id: "gap:missing-published-assessment",
      severity: "info",
      reasonCode: "missing_published_schedule_assessment",
      explanation: "No published Project Controls schedule assessment is available.",
      evidenceReference: {
        sourceDomain: "project_controls",
        entityType: "schedule_assessment",
        entityId: "none",
        storesCanonicalCopy: false,
      },
      asOf: input.generatedAt,
    });
    return items;
  }

  if (input.health.classification === "RED") {
    push({
      id: `health:red:${latest.assessmentId}`,
      severity: "red",
      reasonCode: input.health.reasonCodes[0] ?? "schedule_milestone_missed",
      explanation: input.health.headline,
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  } else if (input.health.classification === "AMBER") {
    push({
      id: `health:amber:${latest.assessmentId}`,
      severity: "amber",
      reasonCode: input.health.reasonCodes[0] ?? "schedule_milestone_at_risk",
      explanation: input.health.headline,
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  }

  if (typeof latest.declaredDateDeltaDays === "number" && latest.declaredDateDeltaDays > 0) {
    push({
      id: `variance:slip:${latest.assessmentId}`,
      severity: latest.declaredDateDeltaDays >= 14 ? "red" : "amber",
      reasonCode: "published_declared_date_slip",
      explanation: `Published declared-date delta is ${latest.declaredDateDeltaDays} day(s) after the declared baseline.`,
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  }

  for (const evidence of input.snapshot.evidence) {
    if (evidence.revoked) continue;
    if (evidence.kind !== "milestone_declaration" && evidence.scopeKind !== "milestone") continue;
    if (evidence.declaredPosture === "missed") {
      push({
        id: `milestone:missed:${evidence.evidenceId}`,
        severity: "red",
        reasonCode: "critical_milestone_late",
        explanation: `Published milestone evidence ${evidence.title || evidence.sourceKey} is missed.`,
        evidenceReference: {
          sourceDomain: "project_controls",
          entityType: "schedule_evidence",
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
      id: `freshness:stale:${latest.assessmentId}`,
      severity: "info",
      reasonCode: "stale_schedule_data",
      explanation: "Published schedule assessment is stale relative to the Command Centre as-of time.",
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  }

  if (input.trend.available && input.trend.healthChange === "deteriorated") {
    push({
      id: `trend:deteriorated:${latest.assessmentId}`,
      severity: "amber",
      reasonCode: "schedule_forecast_deteriorated",
      explanation: input.trend.explanation,
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  }

  if (lateMilestoneCount(input.snapshot.evidence) > 0 && input.health.classification !== "RED") {
    push({
      id: `milestones:late-count:${latest.assessmentId}`,
      severity: "red",
      reasonCode: "late_published_milestones",
      explanation: "Published milestone evidence includes one or more missed milestones.",
      evidenceReference: assessmentEvidence(latest),
      asOf,
    });
  }

  return items;
}

