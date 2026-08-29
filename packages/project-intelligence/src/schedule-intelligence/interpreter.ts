import type { ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";
import type {
  PublishedScheduleAssessmentRef,
  PublishedScheduleEvidenceRef,
  ScheduleDataQuality,
  ScheduleFreshnessState,
  ScheduleHealthSummary,
  ScheduleMilestoneInsight,
  SchedulePublishedPosture,
  ScheduleRelatedContextRef,
  ScheduleTrend,
  ScheduleIntelligenceSourceSnapshot,
} from "./types";
import type { ScheduleEvidenceReference } from "./types";

export const SCHEDULE_STALE_MS = 45 * 24 * 60 * 60 * 1000;

const POSTURE_RANK: Record<SchedulePublishedPosture, number> = {
  unknown: 0,
  on_track: 1,
  at_risk: 2,
  missed: 3,
};

export function asPublishedPosture(value: string | undefined): SchedulePublishedPosture | undefined {
  if (value === "on_track" || value === "at_risk" || value === "missed" || value === "unknown") {
    return value;
  }
  return undefined;
}

export function classifyScheduleHealth(
  latest: PublishedScheduleAssessmentRef | null,
  availability: CommandCentreAvailability,
): ScheduleHealthSummary {
  if (availability === "error" || availability === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Schedule intelligence is unavailable.",
      reasonCodes: ["schedule_source_unavailable"],
    };
  }
  if (availability === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: "Schedule access denied.",
      reasonCodes: ["schedule_forbidden"],
    };
  }
  if (!latest || availability === "no_data") {
    return {
      classification: "UNKNOWN",
      headline: "No published schedule assessment.",
      reasonCodes: ["missing_published_schedule_assessment"],
    };
  }
  if (!latest.published) {
    return {
      classification: "UNKNOWN",
      posture: latest.posture,
      headline: "Schedule assessment is unpublished.",
      reasonCodes: ["schedule_unpublished"],
    };
  }
  if (latest.abstained || !latest.posture || latest.posture === "unknown") {
    return {
      classification: "UNKNOWN",
      posture: latest.posture ?? "unknown",
      headline: "Published schedule posture is unknown.",
      reasonCodes: ["schedule_posture_unknown"],
    };
  }
  if (latest.posture === "missed") {
    return {
      classification: "RED",
      posture: "missed",
      headline: "Published schedule posture is missed.",
      reasonCodes: ["schedule_milestone_missed"],
    };
  }
  if (latest.posture === "at_risk") {
    return {
      classification: "AMBER",
      posture: "at_risk",
      headline: "Published schedule posture is at risk.",
      reasonCodes: ["schedule_milestone_at_risk"],
    };
  }
  return {
    classification: "GREEN" as ProjectHealthOverallClassification,
    posture: "on_track",
    headline: "Published schedule posture is on track.",
    reasonCodes: ["schedule_milestone_on_track"],
  };
}

export function classifyScheduleFreshness(
  availability: CommandCentreAvailability,
  asOf: string | undefined,
  generatedAt: string,
): ScheduleFreshnessState {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return "UNAVAILABLE";
  }
  if (!asOf) return "UNKNOWN";
  const then = Date.parse(asOf);
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "UNKNOWN";
  if (now - then > SCHEDULE_STALE_MS) return "STALE";
  return "CURRENT";
}

export function assessmentEvidence(assessment: PublishedScheduleAssessmentRef): ScheduleEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "schedule_assessment",
    entityId: assessment.assessmentId,
    sourceTimestamp: assessment.publishedAt ?? assessment.assessedAt,
    sourceVersion: assessment.version === undefined ? undefined : String(assessment.version),
    storesCanonicalCopy: false,
  };
}

function milestoneEvidence(item: PublishedScheduleEvidenceRef): ScheduleEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "schedule_evidence",
    entityId: item.evidenceId,
    sourceTimestamp: item.recordedAt ?? item.observedAt,
    storesCanonicalCopy: false,
  };
}

const EXPLICIT_REF = /^(risk|decision|action|technical_query|change|finding):(.+)$/i;

export function relatedContextFromEvidence(item: PublishedScheduleEvidenceRef): ScheduleRelatedContextRef[] {
  const refs: ScheduleRelatedContextRef[] = [];
  if (item.sourceType === "project_intelligence" && item.sourceKey) {
    refs.push({
      sourceDomain: "project_intelligence",
      entityType: "finding",
      entityId: item.sourceKey,
      linkKind: "explicit_source_key",
      storesCanonicalCopy: false,
    });
  }
  if (item.sourceType === "inspection_intelligence" && item.sourceKey) {
    refs.push({
      sourceDomain: "inspection_intelligence",
      entityType: "finding",
      entityId: item.sourceKey,
      linkKind: "explicit_source_key",
      storesCanonicalCopy: false,
    });
  }
  const matched = item.sourceReference?.match(EXPLICIT_REF);
  if (matched) {
    const kind = matched[1].toLowerCase();
    const entityId = matched[2];
    const sourceDomain =
      kind === "finding"
        ? "project_intelligence"
        : kind === "change"
          ? "project_controls"
          : "engineering_core";
    const entityType =
      kind === "technical_query" ? "technical_query" : kind === "finding" ? "finding" : kind;
    refs.push({
      sourceDomain,
      entityType,
      entityId,
      linkKind: "explicit_source_reference",
      storesCanonicalCopy: false,
    });
  }
  return refs;
}

export function projectMilestones(
  evidence: readonly PublishedScheduleEvidenceRef[],
  assessment: PublishedScheduleAssessmentRef | null,
): ScheduleMilestoneInsight[] {
  const items = evidence.filter(
    (row) => !row.revoked && (row.kind === "milestone_declaration" || row.scopeKind === "milestone"),
  );
  const mapped = items.map((row) => {
    const title = row.title || row.sourceReference || row.sourceKey || row.evidenceId;
    return {
      milestoneId: row.scopeReferenceId || row.evidenceId,
      title,
      baselineDate: row.declaredBaselineDate,
      currentOrForecastDate: row.declaredCurrentDate,
      publishedStatus: row.declaredPosture,
      publishedVarianceDays: assessment?.declaredDateDeltaDays,
      criticalityPublished: false as const,
      evidenceReference: milestoneEvidence(row),
      relatedContext: relatedContextFromEvidence(row),
    };
  });
  const rank = (status?: SchedulePublishedPosture) => POSTURE_RANK[status ?? "unknown"];
  return mapped.sort((a, b) => rank(b.publishedStatus) - rank(a.publishedStatus));
}

export function lateMilestoneCount(evidence: readonly PublishedScheduleEvidenceRef[]): number {
  return evidence.filter(
    (row) =>
      !row.revoked &&
      (row.kind === "milestone_declaration" || row.scopeKind === "milestone") &&
      row.declaredPosture === "missed",
  ).length;
}

export function interpretTrend(snapshot: ScheduleIntelligenceSourceSnapshot): ScheduleTrend {
  const published = snapshot.history.filter((row) => row.published);
  if (published.length < 2) {
    return { available: false, explanation: "Trend unavailable — fewer than two published schedule assessments." };
  }
  const latest = published[0];
  const prior = published[1];
  const latestPosture = latest.posture ?? "unknown";
  const priorPosture = prior.posture ?? "unknown";
  const latestRank = POSTURE_RANK[latestPosture];
  const priorRank = POSTURE_RANK[priorPosture];
  const healthChange =
    latestRank > priorRank ? "deteriorated" : latestRank < priorRank ? "improved" : latestPosture === priorPosture ? "unchanged" : "unknown";
  const publishedDeltaChangeDays =
    typeof latest.declaredDateDeltaDays === "number" && typeof prior.declaredDateDeltaDays === "number"
      ? latest.declaredDateDeltaDays - prior.declaredDateDeltaDays
      : undefined;
  const lateMilestoneCountChange =
    snapshot.evidence.length || snapshot.priorEvidence.length
      ? lateMilestoneCount(snapshot.evidence) - lateMilestoneCount(snapshot.priorEvidence)
      : undefined;
  const parts = [`Published posture moved ${priorPosture} → ${latestPosture}.`];
  if (typeof publishedDeltaChangeDays === "number" && publishedDeltaChangeDays > 0) {
    parts.push("Published declared-date slip increased.");
  }
  if (typeof lateMilestoneCountChange === "number" && lateMilestoneCountChange > 0) {
    parts.push("Published late milestone count increased.");
  }
  return {
    available: true,
    fromPosture: priorPosture,
    toPosture: latestPosture,
    healthChange,
    publishedDeltaChangeDays,
    lateMilestoneCountChange,
    explanation: parts.join(" "),
  };
}

export function interpretForecast(latest: PublishedScheduleAssessmentRef | null): ProjectScheduleForecast {
  if (!latest) {
    return {
      computedCompletionPublished: false,
      summary: "Forecast completion is not published by Project Controls schedule assessments.",
    };
  }
  const parts: string[] = [];
  if (latest.declaredCurrentDate) {
    parts.push(`Declared current/forecast date: ${latest.declaredCurrentDate}.`);
  } else {
    parts.push("No declared current/forecast date on the published assessment.");
  }
  if (typeof latest.declaredDateDeltaDays === "number") {
    parts.push(`Published declared-date delta: ${latest.declaredDateDeltaDays} day(s).`);
  }
  parts.push("Computed forecast completion is not published.");
  return {
    declaredCurrentDate: latest.declaredCurrentDate,
    declaredBaselineDate: latest.declaredBaselineDate,
    publishedVarianceDays: latest.declaredDateDeltaDays,
    computedCompletionPublished: false,
    summary: parts.join(" "),
  };
}

type ProjectScheduleForecast = {
  declaredCurrentDate?: string;
  declaredBaselineDate?: string;
  publishedVarianceDays?: number;
  computedCompletionPublished: false;
  summary: string;
};

export function interpretDataQuality(input: {
  availability: CommandCentreAvailability;
  latest: PublishedScheduleAssessmentRef | null;
  generatedAt: string;
}): ScheduleDataQuality {
  const asOf = input.latest?.publishedAt ?? input.latest?.assessedAt ?? input.latest?.recordedAt;
  const freshness = classifyScheduleFreshness(input.availability, asOf, input.generatedAt);
  const missing: string[] = [];
  const limitations: string[] = [
    "critical_path_not_published",
    "float_not_published",
    "computed_forecast_completion_not_published",
  ];
  if (!input.latest) missing.push("published_schedule_assessment");
  if (input.latest && input.latest.declaredDateDeltaDays === undefined) {
    missing.push("published_declared_date_delta");
    limitations.push("declared_date_delta_not_published");
  }
  if (input.latest && !input.latest.declaredBaselineDate) missing.push("declared_baseline_date");
  if (input.latest && !input.latest.declaredCurrentDate) missing.push("declared_current_date");
  if (freshness === "STALE") limitations.push("stale_published_schedule");
  if (input.availability === "no_data") limitations.push("absent_project_controls_schedule");
  return {
    asOf,
    source: "project_controls",
    freshness,
    completeness: input.latest?.dataSufficiency,
    missing,
    limitations,
    evidenceCount: input.latest?.evidenceCount,
    usableEvidenceCount: input.latest?.usableEvidenceCount,
  };
}
