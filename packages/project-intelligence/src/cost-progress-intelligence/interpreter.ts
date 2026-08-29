import type { CommandCentreAvailability } from "../command-centre/types";
import type { ProjectHealthOverallClassification } from "../project-health/types";
import type {
  CostDataQuality,
  CostEvidenceReference,
  CostHealthSummary,
  CostMoneySafety,
  CostProgressConsistencySignal,
  CostProgressFreshnessState,
  CostProgressSourceSnapshot,
  CostPublishedMetrics,
  CostPublishedPosture,
  CostSourceSlice,
  ProgressDataQuality,
  ProgressEvidenceReference,
  ProgressHealthSummary,
  ProgressPublishedBand,
  ProgressPublishedMetrics,
  ProgressPublishedTrend,
  ProgressSourceSlice,
  PublishedCostStateRef,
  PublishedProgressAssessmentRef,
  UnsupportedEarnedValueMetrics,
} from "./types";

export const COST_PROGRESS_STALE_MS = 45 * 24 * 60 * 60 * 1000;

const COST_RANK: Record<CostPublishedPosture, number> = {
  unknown: 0,
  under: 1,
  within_tolerance: 1,
  attention_required: 2,
  over: 3,
};

export function asCostPosture(value: string | undefined): CostPublishedPosture | undefined {
  if (
    value === "within_tolerance" ||
    value === "over" ||
    value === "under" ||
    value === "attention_required" ||
    value === "unknown"
  ) {
    return value;
  }
  return undefined;
}

export function asProgressBand(value: string | undefined): ProgressPublishedBand | undefined {
  if (
    value === "not_started" ||
    value === "early" ||
    value === "in_progress" ||
    value === "advanced" ||
    value === "substantially_complete" ||
    value === "complete" ||
    value === "unavailable"
  ) {
    return value;
  }
  return undefined;
}

export function asProgressTrend(value: string | undefined): ProgressPublishedTrend | undefined {
  if (value === "improving" || value === "stable" || value === "declining" || value === "unknown") {
    return value;
  }
  return undefined;
}

export function classifyCostProgressFreshness(
  availability: CommandCentreAvailability,
  asOf: string | undefined,
  generatedAt: string,
): CostProgressFreshnessState {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return "UNAVAILABLE";
  }
  if (!asOf) return "UNKNOWN";
  const then = Date.parse(asOf);
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "UNKNOWN";
  if (now - then > COST_PROGRESS_STALE_MS) return "STALE";
  return "CURRENT";
}

export function costStateEvidence(state: PublishedCostStateRef): CostEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "cost_state",
    entityId: state.stateId,
    sourceTimestamp: state.publishedAt ?? state.assessedAt,
    sourceVersion: state.version === undefined ? undefined : String(state.version),
    storesCanonicalCopy: false,
  };
}

export function progressAssessmentEvidence(assessment: PublishedProgressAssessmentRef): ProgressEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "progress_assessment",
    entityId: assessment.assessmentId,
    sourceTimestamp: assessment.publishedAt ?? assessment.assessedAt,
    sourceVersion: assessment.version === undefined ? undefined : String(assessment.version),
    storesCanonicalCopy: false,
  };
}

export function classifyCostHealth(
  latest: PublishedCostStateRef | null,
  availability: CommandCentreAvailability,
): CostHealthSummary {
  if (availability === "error" || availability === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Cost intelligence is unavailable.",
      reasonCodes: ["cost_source_unavailable"],
    };
  }
  if (availability === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: "Cost access denied.",
      reasonCodes: ["cost_forbidden"],
    };
  }
  if (!latest || availability === "no_data") {
    return {
      classification: "UNKNOWN",
      headline: "No published cost assessment.",
      reasonCodes: ["missing_published_cost_assessment"],
    };
  }
  if (!latest.published) {
    return {
      classification: "UNKNOWN",
      posture: latest.posture,
      headline: "Cost assessment is unpublished.",
      reasonCodes: ["cost_unpublished"],
    };
  }
  if (latest.abstained || !latest.posture || latest.posture === "unknown") {
    return {
      classification: "UNKNOWN",
      posture: latest.posture ?? "unknown",
      headline: "Published cost posture is unknown.",
      reasonCodes: ["cost_posture_unknown"],
    };
  }
  if (latest.posture === "over") {
    return {
      classification: "RED",
      posture: "over",
      headline: "Published cost posture is over tolerance.",
      reasonCodes: ["cost_posture_over"],
    };
  }
  if (latest.posture === "attention_required") {
    return {
      classification: "AMBER",
      posture: "attention_required",
      headline: "Published cost posture requires attention.",
      reasonCodes: ["cost_posture_attention_required"],
    };
  }
  return {
    classification: "GREEN" as ProjectHealthOverallClassification,
    posture: latest.posture,
    headline:
      latest.posture === "under"
        ? "Published cost posture is under tolerance."
        : "Published cost posture is within tolerance.",
    reasonCodes: [`cost_posture_${latest.posture}`],
  };
}

export function classifyProgressHealth(
  latest: PublishedProgressAssessmentRef | null,
  availability: CommandCentreAvailability,
): ProgressHealthSummary {
  if (availability === "error" || availability === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Progress intelligence is unavailable.",
      reasonCodes: ["progress_source_unavailable"],
    };
  }
  if (availability === "forbidden") {
    return {
      classification: "UNKNOWN",
      headline: "Progress access denied.",
      reasonCodes: ["progress_forbidden"],
    };
  }
  if (!latest || availability === "no_data") {
    return {
      classification: "UNKNOWN",
      headline: "No published progress assessment.",
      reasonCodes: ["missing_published_progress_assessment"],
    };
  }
  if (!latest.published) {
    return {
      classification: "UNKNOWN",
      band: latest.band,
      trendDirection: latest.trendDirection,
      headline: "Progress assessment is unpublished.",
      reasonCodes: ["progress_unpublished"],
    };
  }
  if (
    latest.abstained ||
    latest.band === "unavailable" ||
    latest.trendDirection === "unknown" && !latest.band
  ) {
    return {
      classification: "UNKNOWN",
      band: latest.band,
      trendDirection: latest.trendDirection,
      headline: "Published progress posture is unknown.",
      reasonCodes: ["progress_posture_unknown"],
    };
  }
  if (latest.trendDirection === "declining") {
    return {
      classification: "AMBER",
      band: latest.band,
      trendDirection: "declining",
      headline: "Published progress trend is declining.",
      reasonCodes: ["progress_trend_declining"],
    };
  }
  return {
    classification: "GREEN",
    band: latest.band,
    trendDirection: latest.trendDirection,
    headline: "Published progress is advisory and not declining.",
    reasonCodes: ["progress_published_advisory"],
  };
}

export function interpretCostMoney(slice: CostSourceSlice): CostMoneySafety {
  const latest = slice.latest;
  const currencies = new Set<string>();
  if (latest?.currencyCode) currencies.add(latest.currencyCode.toUpperCase());
  if (latest?.basisCurrencyCode) currencies.add(latest.basisCurrencyCode.toUpperCase());
  for (const row of slice.evidence) {
    if (row.revoked) continue;
    if (row.currencyCode) currencies.add(row.currencyCode.toUpperCase());
  }
  const list = [...currencies];
  const compatible = list.length <= 1 || Boolean(latest?.conversionRef);
  return {
    currencyCode: latest?.currencyCode,
    currencies: list,
    compatible,
    amountsPublished: false,
    mixedCurrenciesAggregated: false,
    exchangeRateInferred: false,
    limitation: compatible
      ? list.length === 0
        ? "currency_not_published"
        : undefined
      : "incompatible_currencies_not_aggregated",
  };
}

export function interpretCostMetrics(latest: PublishedCostStateRef | null, money: CostMoneySafety): CostPublishedMetrics {
  if (!latest) {
    return {
      monetaryVariancePublished: false,
      budgetAmountPublished: false,
      actualAmountPublished: false,
      committedAmountPublished: false,
      forecastAmountPublished: false,
      contingencyAmountPublished: false,
      summary: "No published cost metrics.",
    };
  }
  const parts = [
    latest.posture ? `Published cost posture: ${latest.posture}.` : "Published cost posture is unknown.",
    latest.varianceAttribution
      ? `Published variance attribution: ${latest.varianceAttribution}.`
      : "Published variance attribution is not available.",
    money.currencyCode ? `Canonical currency: ${money.currencyCode}.` : "Currency is not published.",
    "Monetary amounts, contingency drawdown, and cost forecast values are not published.",
  ];
  if (!money.compatible) {
    parts.push("Multiple currencies are present and were not aggregated.");
  }
  return {
    posture: latest.posture,
    varianceAttribution: latest.varianceAttribution,
    basisKind: latest.basisKind,
    currencyCode: money.currencyCode,
    monetaryVariancePublished: false,
    budgetAmountPublished: false,
    actualAmountPublished: false,
    committedAmountPublished: false,
    forecastAmountPublished: false,
    contingencyAmountPublished: false,
    summary: parts.join(" "),
  };
}

export function interpretProgressMetrics(latest: PublishedProgressAssessmentRef | null): ProgressPublishedMetrics {
  if (!latest) {
    return {
      plannedProgressPublished: false,
      progressVarianceVersusPlanPublished: false,
      physicalPercentCertified: false,
      summary: "No published progress metrics.",
    };
  }
  const parts = [
    latest.band ? `Published progress band: ${latest.band}.` : "Published progress band is not available.",
    latest.trendDirection
      ? `Published trend: ${latest.trendDirection}.`
      : "Published trend is not available.",
  ];
  if (typeof latest.indicatedCompletion === "number") {
    parts.push(`Published indicated completion: ${latest.indicatedCompletion}.`);
  } else {
    parts.push("Published indicated completion is not available.");
  }
  parts.push("Planned progress, plan variance, and certified physical percent complete are not published.");
  return {
    band: latest.band,
    trendDirection: latest.trendDirection,
    indicatedCompletion: latest.indicatedCompletion,
    plannedProgressPublished: false,
    progressVarianceVersusPlanPublished: false,
    physicalPercentCertified: false,
    summary: parts.join(" "),
  };
}

export function interpretCostDataQuality(input: {
  slice: CostSourceSlice;
  generatedAt: string;
}): CostDataQuality {
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? latest?.recordedAt;
  const freshness = classifyCostProgressFreshness(input.slice.availability, asOf, input.generatedAt);
  const missing: string[] = [];
  const limitations: string[] = [
    "monetary_amounts_not_published",
    "earned_value_metrics_not_published",
    "cost_forecast_amount_not_published",
    "contingency_amount_not_published",
  ];
  if (!latest) missing.push("published_cost_assessment");
  if (latest && !latest.varianceAttribution) missing.push("published_variance_attribution");
  if (latest && !latest.currencyCode) missing.push("currency_code");
  if (freshness === "STALE") limitations.push("stale_published_cost");
  if (input.slice.availability === "no_data") limitations.push("absent_project_controls_cost");
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

export function interpretProgressDataQuality(input: {
  slice: ProgressSourceSlice;
  generatedAt: string;
}): ProgressDataQuality {
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? latest?.recordedAt;
  const freshness = classifyCostProgressFreshness(input.slice.availability, asOf, input.generatedAt);
  const missing: string[] = [];
  const limitations: string[] = [
    "planned_progress_not_published",
    "progress_variance_versus_plan_not_published",
    "physical_percent_complete_not_certified",
    "earned_value_metrics_not_published",
  ];
  if (!latest) missing.push("published_progress_assessment");
  if (latest && latest.indicatedCompletion === undefined) missing.push("published_indicated_completion");
  if (freshness === "STALE") limitations.push("stale_published_progress");
  if (input.slice.availability === "no_data") limitations.push("absent_project_controls_progress");
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

export const UNSUPPORTED_EARNED_VALUE: UnsupportedEarnedValueMetrics = {
  published: false,
  ev: "unavailable",
  pv: "unavailable",
  ac: "unavailable",
  cpi: "unavailable",
  spi: "unavailable",
  eac: "unavailable",
  etc: "unavailable",
  vac: "unavailable",
  limitation: "earned_value_metrics_not_published",
};

export function interpretConsistency(input: {
  cost: CostSourceSlice;
  progress: ProgressSourceSlice;
  costHealth: CostHealthSummary;
  progressHealth: ProgressHealthSummary;
}): CostProgressConsistencySignal {
  const costOk =
    Boolean(input.cost.latest?.published) &&
    input.cost.availability !== "error" &&
    input.cost.availability !== "unavailable" &&
    input.cost.availability !== "forbidden" &&
    input.cost.availability !== "no_data";
  const progressOk =
    Boolean(input.progress.latest?.published) &&
    input.progress.availability !== "error" &&
    input.progress.availability !== "unavailable" &&
    input.progress.availability !== "forbidden" &&
    input.progress.availability !== "no_data";
  if (!costOk || !progressOk || !input.cost.latest || !input.progress.latest) {
    return {
      available: false,
      explanation: "Cost and progress consistency is unavailable until both published source states exist.",
    };
  }

  const costConcern = input.costHealth.classification === "RED" || input.costHealth.classification === "AMBER";
  const progressConcern = input.progressHealth.classification === "AMBER" || input.progressHealth.classification === "RED";
  const band = input.progress.latest.band;
  const progressLow = input.progress.latest.trendDirection === "declining" || band === "early" || band === "not_started";
  const progressImproving =
    input.progress.latest.trendDirection === "improving" ||
    band === "advanced" ||
    band === "substantially_complete" ||
    band === "complete";

  const costEvidence = costStateEvidence(input.cost.latest);
  const progressEvidence = progressAssessmentEvidence(input.progress.latest);

  if (costConcern && progressLow) {
    return {
      available: true,
      consistent: false,
      reasonCode: "cost_concern_with_low_published_progress",
      explanation:
        "Cost and progress signals are inconsistent. Published cost posture indicates concern while published progress remains early, not started, or declining.",
      costEvidence,
      progressEvidence,
    };
  }
  if (costConcern && progressImproving && !progressConcern) {
    return {
      available: true,
      consistent: false,
      reasonCode: "progress_improving_while_cost_worsens",
      explanation:
        "Cost and progress signals are inconsistent. Published progress is improving or advanced while published cost posture indicates concern.",
      costEvidence,
      progressEvidence,
    };
  }
  if (!costConcern && progressConcern) {
    return {
      available: true,
      consistent: false,
      reasonCode: "progress_concern_without_cost_concern",
      explanation:
        "Cost and progress signals are inconsistent. Published progress indicates concern while published cost posture does not.",
      costEvidence,
      progressEvidence,
    };
  }

  return {
    available: true,
    consistent: true,
    reasonCode: "cost_progress_aligned",
    explanation: "Published cost and progress postures are aligned.",
    costEvidence,
    progressEvidence,
  };
}

export function costPostureDeteriorated(slice: CostSourceSlice): boolean {
  const published = slice.history.filter((row) => row.published);
  if (published.length < 2) return false;
  const latest = published[0]?.posture ?? "unknown";
  const prior = published[1]?.posture ?? "unknown";
  return COST_RANK[latest] > COST_RANK[prior];
}

export function progressDeteriorated(slice: ProgressSourceSlice): boolean {
  const published = slice.history.filter((row) => row.published);
  if (published.length < 2) return false;
  const latest = published[0];
  const prior = published[1];
  if (latest.trendDirection === "declining" && prior.trendDirection !== "declining") return true;
  if (
    typeof latest.indicatedCompletion === "number" &&
    typeof prior.indicatedCompletion === "number" &&
    latest.indicatedCompletion < prior.indicatedCompletion
  ) {
    return true;
  }
  return false;
}
