import type {
  BusinessEvidenceRef,
  BusinessGrowthLead,
  BusinessGrowthOpportunity,
  BusinessGrowthPipelineMetrics,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_GROWTH_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor, roundDiv, utcDateDiffDays } from "../finance/money";
import { OPEN_STAGES } from "./pipeline";

export interface GrowthSignalDraft {
  type: string;
  ruleId: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface GrowthRecommendationDraft {
  type: string;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact: string;
  confidence: "high" | "medium" | "low" | "unavailable";
}

function evidence(title: string, excerpt: string, sourceRef: string): BusinessEvidenceRef[] {
  return [{ sourceType: "growth_metric", sourceRef, title, excerpt }];
}

export function detectGrowthSignals(input: {
  leads: BusinessGrowthLead[];
  opportunities: BusinessGrowthOpportunity[];
  pipeline: BusinessGrowthPipelineMetrics;
  asOf?: string;
  thresholds?: typeof BUSINESS_GROWTH_DEFAULT_THRESHOLDS;
}): { signals: GrowthSignalDraft[]; recommendations: GrowthRecommendationDraft[] } {
  const t = input.thresholds ?? BUSINESS_GROWTH_DEFAULT_THRESHOLDS;
  const asOf = (input.asOf ?? new Date().toISOString()).slice(0, 10);
  const signals: GrowthSignalDraft[] = [];
  const recs: GrowthRecommendationDraft[] = [];
  const activeLeads = input.leads.filter((l) => !l.suppressed);
  const qualifiedLeads = activeLeads.filter(
    (l) => l.qualificationStatus === "qualified" || l.qualificationStatus === "converted",
  );

  if (qualifiedLeads.length < t.qualifiedLeadWarningCount) {
    signals.push({
      type: "growth.insufficient_qualified_pipeline",
      ruleId: "growth.insufficient_qualified_pipeline.v1",
      severity: qualifiedLeads.length === 0 ? "critical" : "warning",
      title: "Insufficient qualified leads",
      summary: `${qualifiedLeads.length} qualified lead(s) versus warning threshold ${t.qualifiedLeadWarningCount}.`,
      businessImpact: "high",
      evidence: evidence("Qualified leads", String(qualifiedLeads.length), "qualified_leads"),
      provenance: { domain: "growth", ruleId: "growth.insufficient_qualified_pipeline.v1", live: false },
    });
    recs.push({
      type: "growth.insufficient_qualified_pipeline",
      title: "Improve pipeline coverage",
      recommendationText:
        "Prioritise qualification of high-fit leads already in BOS. Business OS will not contact prospects.",
      rationaleSummary: "Qualified lead count is below the configured warning threshold.",
      expectedImpact: "Owner attention on qualification; not outreach.",
      confidence: "medium",
    });
  }

  const coverage = input.pipeline.pipelineCoverageBps;
  if (coverage !== null && BigInt(coverage) <= BigInt(t.pipelineCoverageWarningBps)) {
    const critical = BigInt(coverage) <= BigInt(t.pipelineCoverageCriticalBps);
    signals.push({
      type: "growth.pipeline_coverage_below_target",
      ruleId: "growth.pipeline_coverage_below_target.v1",
      severity: critical ? "critical" : "warning",
      title: "Pipeline coverage below target",
      summary: `Coverage is ${coverage} bps against warning ${t.pipelineCoverageWarningBps} bps.`,
      businessImpact: critical ? "critical" : "high",
      evidence: evidence("Pipeline coverage", `${coverage} bps`, "pipeline_coverage"),
      provenance: { domain: "growth", ruleId: "growth.pipeline_coverage_below_target.v1", live: false },
    });
    recs.push({
      type: "growth.pipeline_coverage_below_target",
      title: "Improve pipeline coverage",
      recommendationText: "Review open opportunity values against the configured revenue target. No CRM write is performed.",
      rationaleSummary: "Deterministic coverage is at or below the configured warning threshold.",
      expectedImpact: "Planning attention only.",
      confidence: "medium",
    });
  }

  if (activeLeads.length >= 3) {
    const qualifiedRate = roundDiv(BigInt(qualifiedLeads.length) * 10_000n, BigInt(activeLeads.length));
    if (qualifiedRate <= BigInt(t.qualificationRateWarningBps)) {
      signals.push({
        type: "growth.lead_qualification_deterioration",
        ruleId: "growth.lead_qualification_deterioration.v1",
        severity: "warning",
        title: "Lead qualification rate is low",
        summary: `Qualification rate is ${qualifiedRate.toString()} bps of ${activeLeads.length} leads.`,
        businessImpact: "medium",
        evidence: evidence("Qualification rate", qualifiedRate.toString(), "lead_qualification_rate"),
        provenance: { domain: "growth", ruleId: "growth.lead_qualification_deterioration.v1", live: false },
      });
      recs.push({
        type: "growth.lead_qualification_deterioration",
        title: "Prioritize high-fit leads",
        recommendationText: "Work the highest deterministic lead scores first. No emails or outreach are sent.",
        rationaleSummary: "Qualified-to-total lead ratio is at or below the configured threshold.",
        expectedImpact: "Internal qualification attention.",
        confidence: "medium",
      });
    }
  }

  const highValue = parseMinor(t.highValueMinor) ?? 0n;
  for (const opp of input.opportunities.filter((o) => OPEN_STAGES.includes(o.stage) && !o.suppressed)) {
    const value = parseMinor(opp.estimatedValueMinor);
    const staleDays = utcDateDiffDays(opp.updatedAt.slice(0, 10), asOf);
    if (!opp.nextAction && staleDays >= t.stagnationDays) {
      signals.push({
        type: "growth.opportunity_stagnation",
        ruleId: "growth.opportunity_stagnation.v1",
        severity: "watch",
        title: "Opportunity stagnation",
        summary: `${opp.name} has no next action and has not been updated for ${staleDays} days.`,
        businessImpact: "medium",
        evidence: evidence(opp.name, `stale ${staleDays} days`, opp.id),
        provenance: { domain: "growth", ruleId: "growth.opportunity_stagnation.v1", live: false },
      });
      recs.push({
        type: "growth.opportunity_stagnation",
        title: "Schedule next action",
        recommendationText: `Record a next internal action for ${opp.name}. Business OS does not message the prospect.`,
        rationaleSummary: "Open opportunity exceeded the stagnation day threshold without a next action.",
        expectedImpact: "Internal follow-up reminder.",
        confidence: "medium",
      });
    }
    if (value !== null && value >= highValue && !opp.nextAction) {
      signals.push({
        type: "growth.high_value_without_next_action",
        ruleId: "growth.high_value_without_next_action.v1",
        severity: "warning",
        title: "High-value opportunity without next action",
        summary: `${opp.name} has estimated value ${value.toString()} minor units and no next action.`,
        businessImpact: "high",
        evidence: evidence(opp.name, value.toString(), opp.id),
        provenance: { domain: "growth", ruleId: "growth.high_value_without_next_action.v1", live: false },
      });
      recs.push({
        type: "growth.high_value_without_next_action",
        title: "Investigate high-value opportunity",
        recommendationText: `Assign an owner and next internal action for ${opp.name}. No proposal is generated.`,
        rationaleSummary: "Open opportunity value meets the high-value threshold and next action is missing.",
        expectedImpact: "Owner attention; not commercial execution.",
        confidence: "medium",
      });
    }
  }

  if (input.pipeline.totalPipeline && input.pipeline.openCount > 1) {
    const totals = new Map<string, bigint>();
    for (const opp of input.opportunities.filter((o) => OPEN_STAGES.includes(o.stage) && !o.suppressed)) {
      if (opp.currency !== input.pipeline.currency) continue;
      const value = parseMinor(opp.estimatedValueMinor);
      if (value === null) continue;
      const key = opp.name.split("—")[0]?.trim() || opp.name;
      totals.set(key, (totals.get(key) ?? 0n) + value);
    }
    const pipelineMinor = parseMinor(input.pipeline.totalPipeline.minor);
    if (pipelineMinor && pipelineMinor > 0n) {
      for (const [key, value] of totals) {
        const share = (value * 10_000n) / pipelineMinor;
        if (share >= BigInt(t.concentrationWarningBps)) {
          signals.push({
            type: "growth.pipeline_concentration",
            ruleId: "growth.pipeline_concentration.v1",
            severity: "watch",
            title: "Pipeline concentrated in one name",
            summary: `${key} is ${share.toString()} bps of open pipeline.`,
            businessImpact: "medium",
            evidence: evidence(key, `${share.toString()} bps`, "total_pipeline"),
            provenance: { domain: "growth", ruleId: "growth.pipeline_concentration.v1", live: false },
          });
          recs.push({
            type: "growth.pipeline_concentration",
            title: "Diversify pipeline",
            recommendationText: "Review concentration of open value. No external prospecting is started.",
            rationaleSummary: "A single name exceeds the configured concentration threshold.",
            expectedImpact: "Risk visibility only.",
            confidence: "low",
          });
        }
      }
    }
  }

  if (input.pipeline.winRateBps !== null && BigInt(input.pipeline.winRateBps) <= BigInt(t.winRateWarningBps)) {
    signals.push({
      type: "growth.declining_win_rate",
      ruleId: "growth.declining_win_rate.v1",
      severity: "warning",
      title: "Win rate below threshold",
      summary: `Win rate is ${input.pipeline.winRateBps} bps on a sufficient closed sample.`,
      businessImpact: "medium",
      evidence: evidence("Win rate", `${input.pipeline.winRateBps} bps`, "win_rate"),
      provenance: { domain: "growth", ruleId: "growth.declining_win_rate.v1", live: false },
    });
  }

  const bestLead = [...activeLeads].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))[0];
  if (bestLead && (bestLead.score ?? 0) >= 50 && bestLead.qualificationStatus === "unqualified") {
    recs.push({
      type: "growth.prioritize_high_fit_lead",
      title: "Prioritize high-fit lead",
      recommendationText: `Review ${bestLead.organisationName} for qualification. Contact data is optional and outreach is not performed.`,
      rationaleSummary: "Deterministic lead score is high while qualification is still unqualified.",
      expectedImpact: "Internal qualification attention.",
      confidence: "medium",
    });
  }

  const unowned = input.opportunities.find((o) => OPEN_STAGES.includes(o.stage) && !o.owner && !o.suppressed);
  if (unowned) {
    recs.push({
      type: "growth.assign_owner",
      title: "Assign owner",
      recommendationText: `Assign an internal owner to ${unowned.name}. Business OS does not notify external parties.`,
      rationaleSummary: "An open opportunity has no owner.",
      expectedImpact: "Internal accountability.",
      confidence: "medium",
    });
  }

  return { signals, recommendations: recs };
}
