import type {
  BusinessCustomer,
  BusinessCustomerConcentration,
  BusinessCustomerHealth,
  BusinessCustomerPaymentBehaviour,
  BusinessEvidenceRef,
  BusinessGrowthOpportunity,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor, utcDateDiffDays } from "../finance/money";

export interface CustomerSignalDraft {
  type: string;
  ruleId: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface CustomerRecommendationDraft {
  type: string;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact: string;
  confidence: "high" | "medium" | "low" | "unavailable";
}

function evidence(title: string, excerpt: string, sourceRef: string): BusinessEvidenceRef[] {
  return [{ sourceType: "customer_metric", sourceRef, title, excerpt }];
}

export function detectCustomerSignals(input: {
  customers: BusinessCustomer[];
  healthById: Map<string, BusinessCustomerHealth>;
  paymentById: Map<string, BusinessCustomerPaymentBehaviour>;
  opportunitiesById: Map<string, BusinessGrowthOpportunity[]>;
  concentration: BusinessCustomerConcentration;
  asOf?: string;
}): { signals: CustomerSignalDraft[]; recommendations: CustomerRecommendationDraft[] } {
  const asOf = input.asOf ?? new Date().toISOString().slice(0, 10);
  const t = BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS;
  const signals: CustomerSignalDraft[] = [];
  const recommendations: CustomerRecommendationDraft[] = [];

  const top = parseMinor(input.concentration.topCustomerShareBps);
  if (top !== null && top >= BigInt(t.topCustomerConcentrationWarningBps)) {
    signals.push({
      type: "customer.concentration_high",
      ruleId: "customer.concentration_high.v1",
      severity: "warning",
      title: "Customer concentration high",
      summary: `Top customer share is ${top.toString()} bps of attributed revenue.`,
      businessImpact: "high",
      evidence: evidence("Concentration", top.toString(), "concentration"),
      provenance: { domain: "customer", ruleId: "customer.concentration_high.v1", live: false },
    });
    recommendations.push({
      type: "customer.diversify_concentration",
      title: "Diversify customer concentration",
      recommendationText: "Review dependency on the largest attributed customer. Advisory only.",
      rationaleSummary: "Top-customer share exceeds the configured threshold.",
      expectedImpact: "Reduce revenue concentration risk.",
      confidence: "high",
    });
  }

  for (const customer of input.customers) {
    if (customer.archivedAt || customer.customerStatus === "archived") continue;
    const health = input.healthById.get(customer.id);
    if (health && (health.status === "at_risk" || health.status === "critical")) {
      signals.push({
        type: "customer.health_deteriorated",
        ruleId: "customer.health_deteriorated.v1",
        severity: health.status === "critical" ? "critical" : "warning",
        title: "Customer health deteriorated",
        summary: `${customer.organisationName} health is ${health.status}. Not a credit rating.`,
        businessImpact: "high",
        evidence: evidence("Health", health.status, customer.id),
        provenance: { domain: "customer", ruleId: "customer.health_deteriorated.v1", live: false },
      });
      recommendations.push({
        type: "customer.review_at_risk",
        title: `Review at-risk customer ${customer.organisationName}`,
        recommendationText: "Prepare an internal retention review. Do not contact the customer from BOS-5.",
        rationaleSummary: "Deterministic health is at_risk or critical.",
        expectedImpact: "Owner attention on relationship quality.",
        confidence: "medium",
      });
    }

    const payment = input.paymentById.get(customer.id);
    const overdue = parseMinor(payment?.overdueRatioBps ?? null);
    if (overdue !== null && overdue >= BigInt(t.overdueRatioWarningBps)) {
      signals.push({
        type: "customer.overdue_receivables",
        ruleId: "customer.overdue_receivables.v1",
        severity: "warning",
        title: "Overdue customer receivables",
        summary: `${customer.organisationName} overdue ratio ${overdue.toString()} bps.`,
        businessImpact: "high",
        evidence: evidence("Overdue ratio", overdue.toString(), customer.id),
        provenance: { domain: "customer", ruleId: "customer.overdue_receivables.v1", live: false },
      });
      recommendations.push({
        type: "customer.investigate_payment_delay",
        title: `Investigate payment delay for ${customer.organisationName}`,
        recommendationText: "Review attributed AR facts internally. This is not a credit decision or collection action.",
        rationaleSummary: "Overdue ratio exceeds the configured threshold.",
        expectedImpact: "Understand payment behaviour with evidence.",
        confidence: "high",
      });
    }

    const activityDays = utcDateDiffDays(customer.updatedAt.slice(0, 10), asOf);
    const valueHint = input.opportunitiesById.get(customer.id)?.some((o) => parseMinor(o.estimatedValueMinor) !== null && (parseMinor(o.estimatedValueMinor) ?? 0n) >= 50_000_000n);
    if (activityDays >= t.inactivityDays && valueHint) {
      signals.push({
        type: "customer.high_value_inactivity",
        ruleId: "customer.high_value_inactivity.v1",
        severity: "watch",
        title: "High-value customer inactivity",
        summary: `${customer.organisationName} has no recent internal update.`,
        businessImpact: "medium",
        evidence: evidence("Inactivity days", String(activityDays), customer.id),
        provenance: { domain: "customer", ruleId: "customer.high_value_inactivity.v1", live: false },
      });
    }

    const lost = (input.opportunitiesById.get(customer.id) ?? []).filter((o) => o.stage === "lost");
    if (lost.length >= 2) {
      signals.push({
        type: "customer.repeated_lost_opportunities",
        ruleId: "customer.repeated_lost_opportunities.v1",
        severity: "watch",
        title: "Repeated lost opportunities",
        summary: `${customer.organisationName} has ${lost.length} lost opportunities.`,
        businessImpact: "medium",
        evidence: evidence("Lost count", String(lost.length), customer.id),
        provenance: { domain: "customer", ruleId: "customer.repeated_lost_opportunities.v1", live: false },
      });
    }

    if (!customer.relationshipOwner) {
      signals.push({
        type: "customer.missing_relationship_owner",
        ruleId: "customer.missing_relationship_owner.v1",
        severity: "info",
        title: "Missing relationship owner",
        summary: customer.organisationName,
        businessImpact: "low",
        evidence: evidence("Customer", customer.organisationName, customer.id),
        provenance: { domain: "customer", ruleId: "customer.missing_relationship_owner.v1", live: false },
      });
      recommendations.push({
        type: "customer.assign_owner",
        title: `Assign relationship owner for ${customer.organisationName}`,
        recommendationText: "Set an internal owner. BOS-5 does not message the customer.",
        rationaleSummary: "No relationship owner is recorded.",
        expectedImpact: "Clear internal accountability.",
        confidence: "high",
      });
    }

    if (utcDateDiffDays(customer.updatedAt.slice(0, 10), asOf) >= 120) {
      signals.push({
        type: "customer.evidence_stale",
        ruleId: "customer.evidence_stale.v1",
        severity: "info",
        title: "Customer evidence stale",
        summary: customer.organisationName,
        businessImpact: "low",
        evidence: evidence("Updated at", customer.updatedAt, customer.id),
        provenance: { domain: "customer", ruleId: "customer.evidence_stale.v1", live: false },
      });
      recommendations.push({
        type: "customer.update_information",
        title: `Update customer information for ${customer.organisationName}`,
        recommendationText: "Refresh internal records. Do not infer outreach consent.",
        rationaleSummary: "Customer record has not been updated for 120 days.",
        expectedImpact: "Improve evidence freshness.",
        confidence: "medium",
      });
    }

    if (health && (health.status === "at_risk" || health.status === "critical")) {
      recommendations.push({
        type: "customer.prepare_retention_review",
        title: `Prepare retention review for ${customer.organisationName}`,
        recommendationText:
          "This is a retention_risk_signal for internal review. It is not a statistical churn prediction.",
        rationaleSummary: "Health deterioration is a risk indicator, not a statistical churn model.",
        expectedImpact: "Structured internal review.",
        confidence: "medium",
      });
    }
  }

  return { signals, recommendations };
}
