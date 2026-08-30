import {
  classifyForecastFreshness,
  forecastStateEvidence,
} from "./interpreter";
import type {
  ForecastAttentionItem,
  ForecastDomainSummary,
  ForecastHealthSummary,
  ForecastSourceSlice,
  ForecastTrend,
} from "./types";

export function buildForecastAttention(input: {
  slice: ForecastSourceSlice;
  health: ForecastHealthSummary;
  domains: readonly ForecastDomainSummary[];
  trend: ForecastTrend;
  generatedAt: string;
}): readonly ForecastAttentionItem[] {
  const items: ForecastAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: ForecastAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? input.generatedAt;
  const evidence = latest
    ? forecastStateEvidence(latest)
    : {
        sourceDomain: "project_controls" as const,
        entityType: "forecast_state",
        entityId: "none",
        storesCanonicalCopy: false as const,
      };

  if (input.slice.availability === "error" || input.slice.availability === "unavailable") {
    push({
      id: "gap:forecast-unavailable",
      severity: "info",
      reasonCode: "forecast_source_unavailable",
      domain: "forecast",
      explanation: "Forecast source is unavailable. Other Command Centre sections remain independent.",
      evidenceReference: evidence,
      asOf: input.generatedAt,
    });
    return items;
  }

  if (!latest || !latest.published) {
    push({
      id: "gap:forecast-not-produced",
      severity: "info",
      reasonCode: "forecast_not_produced",
      domain: "forecast",
      explanation: "No published Project Controls forecast assessment. This is not a healthy forecast.",
      evidenceReference: evidence,
      asOf: input.generatedAt,
    });
  }

  if (latest?.published && (latest.abstained || latest.dataSufficiency === "insufficient")) {
    push({
      id: "gap:forecast-insufficient",
      severity: "amber",
      reasonCode: "forecast_insufficient_data",
      domain: "forecast",
      explanation: "Published forecast has insufficient or abstained evidence and is not treated as available.",
      evidenceReference: evidence,
      asOf,
      publishedAt: latest.publishedAt,
      limitations: ["insufficient_forecast_basis"],
    });
  }

  const freshness = classifyForecastFreshness(
    input.slice.availability,
    latest?.publishedAt ?? latest?.assessedAt,
    input.generatedAt,
  );
  if (latest?.published && (freshness === "STALE" || latest.dataSufficiency === "stale")) {
    push({
      id: "gap:forecast-stale",
      severity: "info",
      reasonCode: "forecast_stale",
      domain: "forecast",
      explanation: "Published forecast is stale and must not be treated as current.",
      evidenceReference: evidence,
      asOf,
      publishedAt: latest.publishedAt,
    });
  }

  if (latest?.confidenceClass === "low") {
    push({
      id: "gap:forecast-low-confidence",
      severity: "info",
      reasonCode: "forecast_low_confidence",
      domain: "forecast",
      explanation: "Published forecast confidence class is low.",
      evidenceReference: evidence,
      asOf,
      publishedAt: latest.publishedAt,
      limitations: ["published_confidence_score_is_not_completion_probability"],
    });
  }

  if (input.trend.available && input.trend.direction === "worsened") {
    push({
      id: "trend:forecast-deterioration",
      severity: "amber",
      reasonCode: "forecast_deterioration",
      domain: "forecast",
      explanation: input.trend.explanation,
      evidenceReference: evidence,
      asOf,
      publishedAt: latest?.publishedAt,
    });
  }

  if (latest?.posture === "deteriorating") {
    push({
      id: "posture:forecast-deteriorating",
      severity: "amber",
      reasonCode: "forecast_posture_deteriorating",
      domain: "forecast",
      explanation: "Published advisory forecast posture is deteriorating.",
      evidenceReference: evidence,
      asOf,
      publishedAt: latest.publishedAt,
    });
  }

  for (const domain of input.domains) {
    if (domain.publicationKind === "UNSUPPORTED") continue;
    const posture = String(domain.posture ?? "");
    if (posture === "deteriorating" || posture === "declining" || posture === "over" || posture === "at_risk") {
      push({
        id: `domain:${domain.domain}:concern`,
        severity: "amber",
        reasonCode: `${domain.domain}_forecast_concern`,
        domain: domain.domain,
        explanation: domain.headline,
        evidenceReference: evidence,
        asOf,
        publishedAt: latest?.publishedAt,
        limitations: ["qualitative_contributor_signal_only"],
      });
    }
  }

  return items;
}
