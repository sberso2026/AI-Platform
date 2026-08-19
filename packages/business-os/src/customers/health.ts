import type {
  BusinessCustomer,
  BusinessCustomerFinancialFact,
  BusinessCustomerHealth,
  BusinessCustomerHealthComponent,
  BusinessCustomerHealthStatus,
  BusinessCustomerPaymentBehaviour,
  BusinessGrowthOpportunity,
  BusinessRevenueEngagementPlan,
} from "@rtb/types";
import { BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS, CUSTOMER_HEALTH_VERSION } from "@rtb/types";
import { parseMinor, utcDateDiffDays } from "../finance/money";

export const CUSTOMER_HEALTH_DISCLAIMER =
  "Customer health is a deterministic management ranking from supplied evidence. It is not a credit rating, consumer credit score, or predicted churn probability.";

export const CUSTOMER_HEALTH_WEIGHTS = {
  relationshipActivity: 15,
  revenueTrend: 15,
  contribution: 10,
  payment: 20,
  pipeline: 10,
  engagementRecency: 10,
  concentration: 10,
  unresolvedRisk: 10,
} as const;

function bandStatus(score: number | null, weight: number): BusinessCustomerHealthStatus {
  if (score === null) return "unknown";
  if (score >= weight * 0.75) return "healthy";
  if (score >= weight * 0.4) return "watch";
  if (score > 0) return "at_risk";
  return "critical";
}

export function computeCustomerHealth(input: {
  customer: BusinessCustomer;
  facts: BusinessCustomerFinancialFact[];
  payment: BusinessCustomerPaymentBehaviour;
  opportunities: BusinessGrowthOpportunity[];
  engagements: BusinessRevenueEngagementPlan[];
  concentrationShareBps?: string | null;
  operationalIssueCount?: number | null;
  asOf?: string;
}): BusinessCustomerHealth {
  const asOf = input.asOf ?? new Date().toISOString().slice(0, 10);
  const missingComponents: string[] = [];
  const components: BusinessCustomerHealthComponent[] = [];
  const t = BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS;

  const latestEngagement = [...input.engagements].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const activityDays = latestEngagement
    ? utcDateDiffDays(latestEngagement.updatedAt.slice(0, 10), asOf)
    : input.customer.updatedAt
      ? utcDateDiffDays(input.customer.updatedAt.slice(0, 10), asOf)
      : null;
  if (activityDays === null) {
    components.push({
      id: "relationship_activity",
      label: "Relationship activity",
      weight: CUSTOMER_HEALTH_WEIGHTS.relationshipActivity,
      status: "unknown",
      score: null,
      evidence: "No relationship activity timestamp.",
    });
    missingComponents.push("relationship_activity");
  } else {
    const score =
      activityDays <= 21
        ? CUSTOMER_HEALTH_WEIGHTS.relationshipActivity
        : activityDays <= t.inactivityDays
          ? 8
          : 0;
    components.push({
      id: "relationship_activity",
      label: "Relationship activity",
      weight: CUSTOMER_HEALTH_WEIGHTS.relationshipActivity,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.relationshipActivity),
      score,
      evidence: `Last internal activity ${activityDays} day(s) ago.`,
    });
  }

  const orderedFacts = [...input.facts].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const currentRev = parseMinor(orderedFacts[0]?.revenueMinor ?? null);
  const previousRev = parseMinor(orderedFacts[1]?.revenueMinor ?? null);
  if (currentRev === null || previousRev === null) {
    components.push({
      id: "revenue_trend",
      label: "Revenue trend",
      weight: CUSTOMER_HEALTH_WEIGHTS.revenueTrend,
      status: "unknown",
      score: null,
      evidence: "Two comparable revenue periods are required.",
    });
    missingComponents.push("revenue_trend");
  } else {
    const score = currentRev >= previousRev ? CUSTOMER_HEALTH_WEIGHTS.revenueTrend : currentRev > previousRev / 2n ? 6 : 0;
    components.push({
      id: "revenue_trend",
      label: "Revenue trend",
      weight: CUSTOMER_HEALTH_WEIGHTS.revenueTrend,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.revenueTrend),
      score,
      evidence: `Current ${currentRev.toString()} vs previous ${previousRev.toString()} minor units.`,
    });
  }

  const contrib = parseMinor(orderedFacts[0]?.grossContributionMinor ?? null);
  const cost = parseMinor(orderedFacts[0]?.directCostMinor ?? null);
  if (orderedFacts[0] && parseMinor(orderedFacts[0].revenueMinor) !== null && cost === null) {
    components.push({
      id: "contribution",
      label: "Contribution",
      weight: CUSTOMER_HEALTH_WEIGHTS.contribution,
      status: "unknown",
      score: null,
      evidence: "Revenue is known but cost is unavailable, so profitability remains unknown.",
    });
    missingComponents.push("contribution");
  } else if (contrib === null) {
    components.push({
      id: "contribution",
      label: "Contribution",
      weight: CUSTOMER_HEALTH_WEIGHTS.contribution,
      status: "unknown",
      score: null,
      evidence: "Gross contribution was not supplied.",
    });
    missingComponents.push("contribution");
  } else {
    const score = contrib > 0n ? CUSTOMER_HEALTH_WEIGHTS.contribution : 0;
    components.push({
      id: "contribution",
      label: "Contribution",
      weight: CUSTOMER_HEALTH_WEIGHTS.contribution,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.contribution),
      score,
      evidence: `Gross contribution ${contrib.toString()} minor units.`,
    });
  }

  const overdueBps = parseMinor(input.payment.overdueRatioBps);
  if (overdueBps === null) {
    components.push({
      id: "payment",
      label: "Payment behaviour",
      weight: CUSTOMER_HEALTH_WEIGHTS.payment,
      status: "unknown",
      score: null,
      evidence: "Receivable facts are missing.",
    });
    missingComponents.push("payment");
  } else {
    const score =
      overdueBps <= 500n ? CUSTOMER_HEALTH_WEIGHTS.payment : overdueBps <= BigInt(t.overdueRatioWarningBps) ? 10 : 0;
    components.push({
      id: "payment",
      label: "Payment behaviour",
      weight: CUSTOMER_HEALTH_WEIGHTS.payment,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.payment),
      score,
      evidence: `Overdue ratio ${overdueBps.toString()} bps. Not a credit rating.`,
    });
  }

  const open = input.opportunities.filter(
    (o) => o.stage !== "won" && o.stage !== "lost" && !o.suppressed,
  );
  components.push({
    id: "pipeline",
    label: "Active pipeline",
    weight: CUSTOMER_HEALTH_WEIGHTS.pipeline,
    status: open.length ? "healthy" : "watch",
    score: open.length ? CUSTOMER_HEALTH_WEIGHTS.pipeline : Math.round(CUSTOMER_HEALTH_WEIGHTS.pipeline / 2),
    evidence: open.length ? `${open.length} open opportunity(ies).` : "No open opportunities.",
  });

  if (activityDays === null) {
    components.push({
      id: "engagement_recency",
      label: "Engagement recency",
      weight: CUSTOMER_HEALTH_WEIGHTS.engagementRecency,
      status: "unknown",
      score: null,
      evidence: "Engagement recency unknown.",
    });
    missingComponents.push("engagement_recency");
  } else {
    const score = activityDays <= 30 ? CUSTOMER_HEALTH_WEIGHTS.engagementRecency : activityDays <= 90 ? 5 : 0;
    components.push({
      id: "engagement_recency",
      label: "Engagement recency",
      weight: CUSTOMER_HEALTH_WEIGHTS.engagementRecency,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.engagementRecency),
      score,
      evidence: `Internal engagement age ${activityDays} day(s).`,
    });
  }

  const share = parseMinor(input.concentrationShareBps ?? null);
  if (share === null) {
    components.push({
      id: "concentration",
      label: "Concentration importance",
      weight: CUSTOMER_HEALTH_WEIGHTS.concentration,
      status: "unknown",
      score: null,
      evidence: "Comparable attributed revenue is unavailable.",
    });
    missingComponents.push("concentration");
  } else {
    const score = share >= 3000n ? CUSTOMER_HEALTH_WEIGHTS.concentration : share >= 1000n ? 6 : 3;
    components.push({
      id: "concentration",
      label: "Concentration importance",
      weight: CUSTOMER_HEALTH_WEIGHTS.concentration,
      status: "watch",
      score,
      evidence: `Share of attributed revenue ${share.toString()} bps.`,
    });
  }

  if (input.operationalIssueCount == null) {
    components.push({
      id: "unresolved_risk",
      label: "Unresolved operational issues",
      weight: CUSTOMER_HEALTH_WEIGHTS.unresolvedRisk,
      status: "unknown",
      score: null,
      evidence: "Operational issue evidence was not supplied.",
    });
    missingComponents.push("unresolved_risk");
  } else {
    const count = input.operationalIssueCount;
    const score =
      count <= 0 ? CUSTOMER_HEALTH_WEIGHTS.unresolvedRisk : count === 1 ? 5 : 0;
    components.push({
      id: "unresolved_risk",
      label: "Unresolved operational issues",
      weight: CUSTOMER_HEALTH_WEIGHTS.unresolvedRisk,
      status: bandStatus(score, CUSTOMER_HEALTH_WEIGHTS.unresolvedRisk),
      score,
      evidence: `${count} at-risk or blocked customer work item(s) from Work & Operations evidence.`,
    });
  }

  const scored = components.filter((c) => c.score !== null);
  let status: BusinessCustomerHealthStatus = "unknown";
  let score: number | null = null;
  if (scored.length >= t.healthMinKnownComponents) {
    const total = scored.reduce((sum, c) => sum + (c.score ?? 0), 0);
    const available = scored.reduce((sum, c) => sum + c.weight, 0);
    score = available === 0 ? null : Math.round((total / available) * 100);
    if (score === null) status = "unknown";
    else if (score >= 75) status = "healthy";
    else if (score >= 55) status = "watch";
    else if (score >= 35) status = "at_risk";
    else status = "critical";
  }

  return {
    status,
    score,
    components,
    missingComponents,
    version: CUSTOMER_HEALTH_VERSION,
    method: "deterministic_customer_health_v1",
    disclaimer: CUSTOMER_HEALTH_DISCLAIMER,
  };
}
