import type { CommandCentreAvailability } from "../command-centre/types";
import { COST_PROGRESS_STALE_MS } from "../cost-progress-intelligence/interpreter";
import type { ProjectHealthOverallClassification } from "../project-health/types";
import type {
  ForecastDataQuality,
  ForecastDomain,
  ForecastDomainSummary,
  ForecastEvidenceReference,
  ForecastFreshnessState,
  ForecastHealthSummary,
  ForecastObservation,
  ForecastPublicationKind,
  ForecastPublishedPosture,
  ForecastReadinessState,
  ForecastTrend,
  ForecastUnsupportedMetrics,
  PublishedCurrentPostureRef,
  PublishedForecastEvidenceRef,
  PublishedForecastStateRef,
  ForecastSourceSlice,
} from "./types";

export const FORECAST_STALE_MS = COST_PROGRESS_STALE_MS;

const POSTURE_RANK: Record<ForecastPublishedPosture, number> = {
  favourable: 1,
  stable: 1,
  recovery_possible: 2,
  uncertain: 2,
  unknown: 0,
  deteriorating: 3,
};

const CONTRIBUTOR_DOMAIN: Record<string, Exclude<ForecastDomain, "completion">> = {
  schedule_intelligence: "schedule",
  cost_intelligence: "cost",
  progress_intelligence: "progress",
  change_intelligence: "change",
};

export const UNSUPPORTED_FORECAST_METRICS: ForecastUnsupportedMetrics = {
  completionDate: "unavailable",
  monetaryAmount: "unavailable",
  probability: "unavailable",
  scenarioSelection: "unavailable",
  limitation:
    "Project Controls publishes advisory qualitative forecast posture only. Completion dates, monetary forecasts, probabilities, and scenario selection are not published.",
};

export function asForecastPosture(value: string | undefined): ForecastPublishedPosture | undefined {
  if (
    value === "favourable" ||
    value === "stable" ||
    value === "uncertain" ||
    value === "deteriorating" ||
    value === "recovery_possible" ||
    value === "unknown"
  ) {
    return value;
  }
  return undefined;
}

export function classifyForecastFreshness(
  availability: CommandCentreAvailability,
  asOf: string | undefined,
  generatedAt: string,
): ForecastFreshnessState {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return "UNAVAILABLE";
  }
  if (!asOf) return "UNKNOWN";
  const then = Date.parse(asOf);
  const now = Date.parse(generatedAt);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return "UNKNOWN";
  if (now - then > FORECAST_STALE_MS) return "STALE";
  return "CURRENT";
}

export function forecastStateEvidence(latest: PublishedForecastStateRef): ForecastEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType: "forecast_state",
    entityId: latest.stateId,
    sourceTimestamp: latest.publishedAt ?? latest.assessedAt ?? latest.recordedAt,
    sourceVersion: latest.version === undefined ? undefined : String(latest.version),
    storesCanonicalCopy: false,
  };
}

export function classifyForecastReadiness(input: {
  availability: CommandCentreAvailability;
  latest: PublishedForecastStateRef | null;
  freshness: ForecastFreshnessState;
}): ForecastReadinessState {
  if (input.availability === "forbidden") return "FORBIDDEN";
  if (input.availability === "error" || input.availability === "unavailable") return "UNAVAILABLE";
  if (!input.latest || input.availability === "no_data" || !input.latest.published) return "NOT_PRODUCED";
  if (input.latest.abstained || input.latest.dataSufficiency === "insufficient" || input.latest.dataSufficiency === "conflicting") {
    return "INSUFFICIENT_DATA";
  }
  if (input.freshness === "STALE" || input.latest.dataSufficiency === "stale") return "STALE";
  if (!input.latest.posture || input.latest.posture === "unknown") return "UNKNOWN";
  return "QUALITATIVE_ONLY";
}

export function classifyForecastHealth(
  latest: PublishedForecastStateRef | null,
  availability: CommandCentreAvailability,
  readiness: ForecastReadinessState,
): ForecastHealthSummary {
  if (availability === "forbidden") {
    return { classification: "UNKNOWN", headline: "Forecast access denied.", reasonCodes: ["forecast_forbidden"] };
  }
  if (availability === "error" || availability === "unavailable") {
    return {
      classification: "UNKNOWN",
      headline: "Forecast intelligence is unavailable.",
      reasonCodes: ["forecast_source_unavailable"],
    };
  }
  if (readiness === "NOT_PRODUCED") {
    return {
      classification: "UNKNOWN",
      headline: "No published Project Controls forecast assessment.",
      reasonCodes: ["forecast_not_produced"],
    };
  }
  if (readiness === "INSUFFICIENT_DATA") {
    return {
      classification: "UNKNOWN",
      posture: latest?.posture,
      headline: "Published forecast abstained or has insufficient evidence.",
      reasonCodes: ["forecast_insufficient_data"],
    };
  }
  if (!latest?.posture || latest.posture === "unknown") {
    return {
      classification: "UNKNOWN",
      posture: latest?.posture ?? "unknown",
      headline: "Published forecast posture is unknown.",
      reasonCodes: ["forecast_posture_unknown"],
    };
  }
  if (latest.posture === "deteriorating") {
    return {
      classification: "AMBER",
      posture: "deteriorating",
      headline: "Published advisory forecast posture is deteriorating.",
      reasonCodes: ["forecast_posture_deteriorating"],
    };
  }
  if (latest.posture === "uncertain") {
    return {
      classification: "AMBER",
      posture: "uncertain",
      headline: "Published advisory forecast posture is uncertain.",
      reasonCodes: ["forecast_posture_uncertain"],
    };
  }
  return {
    classification: "GREEN",
    posture: latest.posture,
    headline: `Published advisory forecast posture is ${latest.posture.replaceAll("_", " ")}.`,
    reasonCodes: [`forecast_posture_${latest.posture}`],
  };
}

export function interpretForecastTrend(
  history: readonly PublishedForecastStateRef[],
): ForecastTrend {
  const published = history.filter((row) => row.published && !row.abstained && row.posture && row.posture !== "unknown");
  if (published.length < 2) {
    return {
      available: false,
      explanation: "Forecast trend is unavailable — fewer than two comparable published forecast outputs.",
    };
  }
  const sorted = [...published].sort(
    (a, b) => Date.parse(b.publishedAt ?? b.recordedAt ?? "") - Date.parse(a.publishedAt ?? a.recordedAt ?? ""),
  );
  const latest = sorted[0];
  const prior = sorted[1];
  const from = prior.posture!;
  const to = latest.posture!;
  const fromRank = POSTURE_RANK[from];
  const toRank = POSTURE_RANK[to];
  const direction = toRank > fromRank ? "worsened" : toRank < fromRank ? "improved" : "unchanged";
  return {
    available: true,
    fromPosture: from,
    toPosture: to,
    fromVersion: prior.version,
    toVersion: latest.version,
    fromPublishedAt: prior.publishedAt,
    toPublishedAt: latest.publishedAt,
    direction,
    explanation: `Published forecast posture moved ${from} → ${to} between versions ${prior.version ?? "prior"} and ${latest.version ?? "latest"}.`,
  };
}

export function interpretForecastDomains(latest: PublishedForecastStateRef | null): readonly ForecastDomainSummary[] {
  const contributors = latest?.contributingContributors ?? [];
  const byDomain = new Map<Exclude<ForecastDomain, "completion">, PublishedForecastStateRef["contributingContributors"][number]>();
  for (const contributor of contributors) {
    const domain = CONTRIBUTOR_DOMAIN[contributor.contributorKey];
    if (domain) byDomain.set(domain, contributor);
  }

  const qualitative = (domain: Exclude<ForecastDomain, "completion">): ForecastDomainSummary => {
    const contributor = byDomain.get(domain);
    if (!latest?.published) {
      return {
        domain,
        readiness: "NOT_PRODUCED",
        publicationKind: "NOT_PUBLISHED",
        headline: `No published ${domain} forecast. Domain engines do not produce a ${domain} forecast.`,
        quantitativeValuePublished: false,
        completionDatePublished: false,
        monetaryAmountPublished: false,
        probabilityPublished: false,
      };
    }
    if (!contributor) {
      return {
        domain,
        readiness: "NOT_PRODUCED",
        publicationKind: "NOT_PUBLISHED",
        headline: `No ${domain} contributor signal on the published advisory forecast.`,
        quantitativeValuePublished: false,
        completionDatePublished: false,
        monetaryAmountPublished: false,
        probabilityPublished: false,
      };
    }
    const posture = asForecastPosture(contributor.postureOrIndication) ?? contributor.postureOrIndication;
    return {
      domain,
      readiness: latest.abstained ? "INSUFFICIENT_DATA" : "QUALITATIVE_ONLY",
      publicationKind: "QUALITATIVE_PUBLISHED",
      posture,
      contributorKey: contributor.contributorKey,
      headline: contributor.abstained
        ? `Published ${domain} contributor abstained.`
        : `Published ${domain} forecast signal is qualitative: ${posture ?? "unknown"}.`,
      quantitativeValuePublished: false,
      completionDatePublished: false,
      monetaryAmountPublished: false,
      probabilityPublished: false,
    };
  };

  return [
    qualitative("schedule"),
    qualitative("cost"),
    qualitative("progress"),
    {
      domain: "completion",
      readiness: "UNKNOWN",
      publicationKind: "UNSUPPORTED",
      headline: "Completion-date forecast is not published by Project Controls.",
      quantitativeValuePublished: false,
      completionDatePublished: false,
      monetaryAmountPublished: false,
      probabilityPublished: false,
    },
    qualitative("change"),
  ];
}

export function interpretForecastDataQuality(input: {
  slice: ForecastSourceSlice;
  generatedAt: string;
}): ForecastDataQuality {
  const latest = input.slice.latest;
  const asOf = latest?.publishedAt ?? latest?.assessedAt ?? latest?.recordedAt;
  const freshness = classifyForecastFreshness(input.slice.availability, asOf, input.generatedAt);
  const forecastProduced = Boolean(latest?.published);
  const missing: string[] = [];
  const limitations: string[] = [
    "advisory_qualitative_forecast_only",
    "completion_date_not_published",
    "monetary_forecast_not_published",
    "probability_not_published",
    "scenario_identity_not_published",
    "forecast_is_not_a_health_dimension",
    "published_confidence_score_is_not_completion_probability",
  ];
  if (!latest) missing.push("published_forecast_assessment");
  if (latest?.abstained) limitations.push("forecast_assessment_abstained");
  if (freshness === "STALE") limitations.push("stale_published_forecast");
  if (input.slice.availability === "no_data") limitations.push("absent_project_controls_forecast");
  return {
    asOf,
    publishedAt: latest?.publishedAt,
    source: "project_controls",
    version: latest?.version,
    freshness,
    confidenceClass: latest?.confidenceClass,
    dataSufficiency: latest?.dataSufficiency,
    forecastProduced,
    missing,
    limitations: [...limitations, ...(latest?.limitations ?? [])],
    evidenceCount: latest?.evidenceCount,
    usableEvidenceCount: latest?.usableEvidenceCount,
  };
}

export function interpretForecastObservations(input: {
  latest: PublishedForecastStateRef | null;
  currentStates: readonly PublishedCurrentPostureRef[];
}): readonly ForecastObservation[] {
  const observations: ForecastObservation[] = [];
  const progress = input.currentStates.find((row) => row.domain === "progress" && row.published);

  if (!input.latest?.published) {
    if (progress?.posture === "declining") {
      observations.push({
        id: "obs:progress-declining-forecast-not-produced",
        reasonCode: "progress_declining_and_forecast_not_produced",
        explanation:
          "Published progress trend is declining and no forecast assessment is produced. This is an observation, not a causal conclusion.",
        forecastEvidence: {
          sourceDomain: "project_controls",
          entityType: "forecast_state",
          entityId: "none",
          storesCanonicalCopy: false,
        },
        currentStateEvidence: {
          sourceDomain: "project_controls",
          entityType: "progress_state",
          entityId: progress.assessmentId ?? "progress",
          sourceTimestamp: progress.publishedAt,
          storesCanonicalCopy: false,
        },
      });
    }
    return observations;
  }

  const forecastEvidence = forecastStateEvidence(input.latest);
  const deteriorating = input.latest.posture === "deteriorating";

  for (const current of input.currentStates) {
    if (!current.published) continue;
    const currentEvidence: ForecastEvidenceReference = {
      sourceDomain: "project_controls",
      entityType: `${current.domain}_state`,
      entityId: current.assessmentId ?? current.domain,
      sourceTimestamp: current.publishedAt,
      storesCanonicalCopy: false,
    };
    if (
      current.domain === "schedule" &&
      deteriorating &&
      (current.posture === "at_risk" || current.posture === "missed")
    ) {
      observations.push({
        id: "obs:schedule-amber-forecast-deteriorating",
        reasonCode: "current_schedule_concern_and_forecast_deteriorating",
        explanation:
          "Current published schedule posture is at risk or missed, and the published advisory forecast is deteriorating. This is an observation, not a causal conclusion.",
        forecastEvidence,
        currentStateEvidence: currentEvidence,
      });
    }
    if (
      current.domain === "cost" &&
      deteriorating &&
      (current.posture === "within_tolerance" || current.posture === "stable" || current.posture === "under")
    ) {
      observations.push({
        id: "obs:cost-stable-forecast-worsening",
        reasonCode: "current_cost_stable_and_forecast_worsening",
        explanation:
          "Current published cost posture is stable or within tolerance, and the published advisory forecast is deteriorating. This is an observation, not a causal conclusion.",
        forecastEvidence,
        currentStateEvidence: currentEvidence,
      });
    }
  }

  if (progress?.posture === "declining" && input.latest.abstained) {
    observations.push({
      id: "obs:progress-declining-forecast-abstained",
      reasonCode: "progress_declining_and_forecast_not_produced",
      explanation:
        "Published progress trend is declining and the forecast assessment abstained. This is an observation, not a causal conclusion.",
      forecastEvidence,
      currentStateEvidence: {
        sourceDomain: "project_controls",
        entityType: "progress_state",
        entityId: progress.assessmentId ?? "progress",
        sourceTimestamp: progress.publishedAt,
        storesCanonicalCopy: false,
      },
    });
  }
  return observations;
}

export function forecastEvidenceRefs(
  latest: PublishedForecastStateRef | null,
  evidence: readonly PublishedForecastEvidenceRef[],
): readonly ForecastEvidenceReference[] {
  const refs: ForecastEvidenceReference[] = [];
  if (latest) refs.push(forecastStateEvidence(latest));
  for (const row of evidence) {
    refs.push({
      sourceDomain: "project_controls",
      entityType: "forecast_evidence",
      entityId: row.evidenceId,
      sourceTimestamp: row.recordedAt ?? row.observedAt,
      storesCanonicalCopy: false,
    });
  }
  return refs;
}
