import type {
  BusinessHealthContributor,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessKpiStatus,
} from "@rtb/types";
import {
  BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE,
  BUSINESS_HEALTH_STATUS_WEIGHTS,
} from "@rtb/types";

export const BUSINESS_HEALTH_DISCLAIMER =
  "Business Health is a transparent operational indicator from configured KPI states. It is not a statutory, financial, or professional assessment.";

const STATUS_RANK: Record<BusinessKpiStatus, number> = {
  unknown: 0,
  healthy: 1,
  watch: 2,
  warning: 3,
  critical: 4,
};

export function deriveKpiStatus(kpi: Pick<
  BusinessKpi,
  "value" | "direction" | "warningThreshold" | "criticalThreshold" | "target"
>): BusinessKpiStatus {
  if (kpi.value === null || kpi.value === undefined || Number.isNaN(kpi.value)) {
    return "unknown";
  }
  const value = kpi.value;
  const worse = (threshold: number | null) => {
    if (threshold === null || threshold === undefined) return false;
    return kpi.direction === "lower_is_better" ? value >= threshold : value <= threshold;
  };
  if (worse(kpi.criticalThreshold)) return "critical";
  if (worse(kpi.warningThreshold)) return "warning";
  if (kpi.target !== null && kpi.target !== undefined) {
    const delta = kpi.direction === "lower_is_better" ? value - kpi.target : kpi.target - value;
    const band = Math.abs(kpi.target) * 0.1 || 1;
    if (delta > 0 && delta <= band) return "watch";
    if (delta > band) return "warning";
  }
  return "healthy";
}

function worstStatus(statuses: BusinessKpiStatus[]): BusinessKpiStatus {
  return statuses.reduce<BusinessKpiStatus>((worst, status) => {
    return STATUS_RANK[status] > STATUS_RANK[worst] ? status : worst;
  }, "unknown");
}

function statusFromScore(score: number, worstKnown: BusinessKpiStatus): BusinessKpiStatus {
  let fromScore: BusinessKpiStatus = "healthy";
  if (score < 40) fromScore = "critical";
  else if (score < 60) fromScore = "warning";
  else if (score < 80) fromScore = "watch";
  if (STATUS_RANK[worstKnown] > STATUS_RANK[fromScore]) return worstKnown;
  return fromScore;
}

export function computeBusinessHealth(
  kpis: BusinessKpi[],
  asOf = new Date().toISOString(),
): BusinessHealthSnapshot {
  const contributors: BusinessHealthContributor[] = kpis.map((kpi) => {
    const status = kpi.status;
    const weight = BUSINESS_HEALTH_STATUS_WEIGHTS[status];
    return {
      kpiId: kpi.id,
      key: kpi.key,
      name: kpi.name,
      status,
      weight,
      value: kpi.value,
    };
  });

  const known = contributors.filter((c) => c.status !== "unknown" && c.weight !== null);
  const unknownCount = contributors.filter((c) => c.status === "unknown").length;
  const missingCount = kpis.filter((k) => k.value === null).length;
  const maxWeight = BUSINESS_HEALTH_STATUS_WEIGHTS.healthy;
  const worstKnown = known.length ? worstStatus(known.map((c) => c.status)) : "unknown";

  let score: number | null = null;
  let overallStatus: BusinessKpiStatus = "unknown";
  if (known.length === 0) {
    overallStatus = "unknown";
  } else if (known.length < BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE) {
    overallStatus = worstKnown;
    score = null;
  } else {
    const sum = known.reduce((acc, c) => acc + (c.weight as number), 0);
    score = Math.round((100 * sum) / (known.length * maxWeight));
    overallStatus = statusFromScore(score, worstKnown);
  }

  const primaryNegativeContributors = contributors
    .filter((c) => c.status === "warning" || c.status === "critical")
    .sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status])
    .slice(0, 5);

  return {
    overallStatus,
    score,
    contributingKpiCount: known.length,
    unknownCount,
    missingCount,
    primaryNegativeContributors,
    weights: BUSINESS_HEALTH_STATUS_WEIGHTS,
    minKnownKpisForScore: BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE,
    method: "deterministic_kpi_weights_v1",
    disclaimer: BUSINESS_HEALTH_DISCLAIMER,
    asOf,
    containsDemoData: kpis.some((k) => k.isDemo),
  };
}
