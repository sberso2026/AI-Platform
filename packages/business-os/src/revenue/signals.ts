import type {
  BusinessEvidenceRef,
  BusinessGrowthOpportunity,
  BusinessRevenueBidEvaluation,
  BusinessRevenueEngagementPlan,
  BusinessRevenuePricingEvaluation,
  BusinessRevenueProposal,
  BusinessRevenueProposalRequirement,
  BusinessSignalSeverity,
} from "@rtb/types";
import { parseMinor, utcDateDiffDays } from "../finance/money";

export interface RevenueSignalDraft {
  type: string;
  ruleId: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface RevenueRecommendationDraft {
  type: string;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact: string;
  confidence: "high" | "medium" | "low" | "unavailable";
}

function evidence(title: string, excerpt: string, sourceRef: string): BusinessEvidenceRef[] {
  return [{ sourceType: "revenue_metric", sourceRef, title, excerpt }];
}

const HIGH_VALUE = 50_000_000n;

export function detectRevenueSignals(input: {
  opportunities: BusinessGrowthOpportunity[];
  engagements: BusinessRevenueEngagementPlan[];
  proposals: BusinessRevenueProposal[];
  requirements: BusinessRevenueProposalRequirement[];
  evaluations: BusinessRevenuePricingEvaluation[];
  bids: BusinessRevenueBidEvaluation[];
  asOf?: string;
}): { signals: RevenueSignalDraft[]; recommendations: RevenueRecommendationDraft[] } {
  const asOf = input.asOf ?? new Date().toISOString().slice(0, 10);
  const signals: RevenueSignalDraft[] = [];
  const recommendations: RevenueRecommendationDraft[] = [];
  const qualified = input.opportunities.filter(
    (o) =>
      !o.suppressed &&
      (o.stage === "qualified" ||
        o.stage === "discovery" ||
        o.stage === "proposal_ready" ||
        o.stage === "proposal"),
  );

  for (const opp of qualified) {
    const value = parseMinor(opp.estimatedValueMinor);
    const hasPlan = input.engagements.some((e) => e.opportunityId === opp.id && e.status !== "cancelled");
    if (value !== null && value >= HIGH_VALUE && !hasPlan) {
      signals.push({
        type: "revenue.missing_engagement_plan",
        ruleId: "revenue.missing_engagement_plan.v1",
        severity: "warning",
        title: "High-value opportunity missing engagement plan",
        summary: `${opp.name} has no engagement plan.`,
        businessImpact: "high",
        evidence: evidence("Opportunity", opp.name, opp.id),
        provenance: { domain: "revenue", ruleId: "revenue.missing_engagement_plan.v1", live: false },
      });
      recommendations.push({
        type: "revenue.prepare_engagement_plan",
        title: `Prepare engagement plan for ${opp.name}`,
        recommendationText: "Create an internal engagement plan. Do not contact the prospect from BOS-4.",
        rationaleSummary: "High-value qualified opportunity has no engagement plan.",
        expectedImpact: "Owner attention on commercial preparation.",
        confidence: "high",
      });
    }
    if (!opp.nextAction) {
      signals.push({
        type: "revenue.opportunity_without_next_action",
        ruleId: "revenue.opportunity_without_next_action.v1",
        severity: "watch",
        title: "Opportunity has no next action",
        summary: `${opp.name} has no next action recorded.`,
        businessImpact: "medium",
        evidence: evidence("Opportunity", opp.name, opp.id),
        provenance: { domain: "revenue", ruleId: "revenue.opportunity_without_next_action.v1", live: false },
      });
    }
  }

  for (const req of input.requirements) {
    if (req.mandatory && (req.complianceStatus === "unsatisfied" || req.complianceStatus === "unknown")) {
      signals.push({
        type: "revenue.unresolved_requirement",
        ruleId: "revenue.unresolved_requirement.v1",
        severity: "warning",
        title: "Proposal requirement unresolved",
        summary: req.requirement,
        businessImpact: "high",
        evidence: evidence("Requirement", req.requirement, req.id),
        provenance: { domain: "revenue", ruleId: "revenue.unresolved_requirement.v1", live: false },
      });
      recommendations.push({
        type: "revenue.revise_proposal_response",
        title: "Complete missing proposal response",
        recommendationText: "Supply evidence before marking the requirement satisfied. AI cannot mark it satisfied.",
        rationaleSummary: "A mandatory requirement is unsatisfied or unknown.",
        expectedImpact: "Proposal completeness.",
        confidence: "high",
      });
    }
  }

  for (const proposal of input.proposals) {
    if (proposal.status === "superseded" || proposal.status === "withdrawn") continue;
    const created = proposal.createdAt.slice(0, 10);
    if (utcDateDiffDays(created, asOf) >= 14 && proposal.status !== "ready_to_send" && proposal.status !== "approved") {
      signals.push({
        type: "revenue.proposal_overdue",
        ruleId: "revenue.proposal_overdue.v1",
        severity: "watch",
        title: "Proposal overdue for internal review",
        summary: `${proposal.title} has been open for 14 or more days.`,
        businessImpact: "medium",
        evidence: evidence("Proposal", proposal.title, proposal.id),
        provenance: { domain: "revenue", ruleId: "revenue.proposal_overdue.v1", live: false },
      });
    }
    if (!proposal.evidenceRefs.length) {
      signals.push({
        type: "revenue.missing_proposal_evidence",
        ruleId: "revenue.missing_proposal_evidence.v1",
        severity: "info",
        title: "Proposal is missing evidence references",
        summary: proposal.title,
        businessImpact: "low",
        evidence: evidence("Proposal", proposal.title, proposal.id),
        provenance: { domain: "revenue", ruleId: "revenue.missing_proposal_evidence.v1", live: false },
      });
    }
  }

  for (const evaluation of input.evaluations) {
    if (evaluation.violations.some((v) => v.ruleId.includes("min_target_margin"))) {
      signals.push({
        type: "revenue.pricing_below_margin",
        ruleId: "revenue.pricing_below_margin.v1",
        severity: "critical",
        title: "Pricing below margin threshold",
        summary: evaluation.violations.map((v) => v.message).join(" "),
        businessImpact: "critical",
        evidence: evidence("Pricing", evaluation.grossMarginBps ?? "unknown", "pricing"),
        provenance: { domain: "revenue", ruleId: "revenue.pricing_below_margin.v1", live: false },
      });
      recommendations.push({
        type: "revenue.review_pricing",
        title: "Review pricing and escalate if needed",
        recommendationText: "A human must approve any pricing exception. The agent cannot approve.",
        rationaleSummary: "Guardrail detected margin below the configured minimum.",
        expectedImpact: "Prevent unapproved low-margin bids.",
        confidence: "high",
      });
    }
    if (evaluation.violations.some((v) => v.ruleId.includes("max_discount"))) {
      signals.push({
        type: "revenue.discount_exceeds_authority",
        ruleId: "revenue.discount_exceeds_authority.v1",
        severity: "warning",
        title: "Discount exceeds authority",
        summary: evaluation.violations.find((v) => v.ruleId.includes("max_discount"))?.message ?? "Discount exception",
        businessImpact: "high",
        evidence: evidence("Discount", evaluation.discountBps ?? "unknown", "pricing"),
        provenance: { domain: "revenue", ruleId: "revenue.discount_exceeds_authority.v1", live: false },
      });
      recommendations.push({
        type: "revenue.escalate_pricing_approval",
        title: "Escalate pricing approval",
        recommendationText: "Record a BOS-1 Decision for the discount exception. Do not send a proposal.",
        rationaleSummary: "Discount is above the workspace authority threshold.",
        expectedImpact: "Governed commercial approval.",
        confidence: "high",
      });
    }
  }

  const pendingBids = input.bids.filter((b) => !b.decisionId);
  if (pendingBids.length) {
    signals.push({
      type: "revenue.bid_decision_pending",
      ruleId: "revenue.bid_decision_pending.v1",
      severity: "watch",
      title: "Bid/no-bid decision pending",
      summary: `${pendingBids.length} advisory evaluation(s) await a human decision.`,
      businessImpact: "medium",
      evidence: evidence("Bid evaluations", String(pendingBids.length), "bid"),
      provenance: { domain: "revenue", ruleId: "revenue.bid_decision_pending.v1", live: false },
    });
    const rec = pendingBids[0]?.recommendation;
    recommendations.push({
      type: "revenue.bid_decision",
      title: rec === "do_not_pursue" ? "Do not pursue opportunity (advisory)" : "Record a bid/no-bid decision",
      recommendationText:
        "Use the BOS-1 Decision record. The ranking is advisory and is not a win probability.",
      rationaleSummary: "An evaluation exists without a human decision.",
      expectedImpact: "Clear commercial direction.",
      confidence: "medium",
    });
  }

  return { signals, recommendations };
}
