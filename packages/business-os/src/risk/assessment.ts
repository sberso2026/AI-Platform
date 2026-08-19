import type { BusinessRiskImpact, BusinessRiskLevel, BusinessRiskLikelihood } from "@rtb/types";
import {
  BUSINESS_RISK_ASSESSMENT_METHOD,
  BUSINESS_RISK_ASSESSMENT_RULE,
  BUSINESS_RISK_IMPACT_SCORES,
  BUSINESS_RISK_LIKELIHOOD_SCORES,
} from "@rtb/types";

export function likelihoodScore(likelihood: BusinessRiskLikelihood): number | null {
  if (likelihood === "unknown") return null;
  return BUSINESS_RISK_LIKELIHOOD_SCORES[likelihood] ?? null;
}

export function impactScore(impact: BusinessRiskImpact): number | null {
  if (impact === "unknown") return null;
  return BUSINESS_RISK_IMPACT_SCORES[impact] ?? null;
}

export function scoreToLevel(score: number | null): BusinessRiskLevel {
  if (score === null || !Number.isFinite(score)) return "unknown";
  const bands = BUSINESS_RISK_ASSESSMENT_RULE.scoreBands;
  if (score >= bands.extreme.min && score <= bands.extreme.max) return "extreme";
  if (score >= bands.high.min && score <= bands.high.max) return "high";
  if (score >= bands.moderate.min && score <= bands.moderate.max) return "moderate";
  if (score >= bands.low.min && score <= bands.low.max) return "low";
  return "unknown";
}

export function assessInherent(
  likelihood: BusinessRiskLikelihood,
  impact: BusinessRiskImpact,
): {
  method: typeof BUSINESS_RISK_ASSESSMENT_METHOD;
  likelihood: BusinessRiskLikelihood;
  impact: BusinessRiskImpact;
  score: number | null;
  level: BusinessRiskLevel;
  note: string;
} {
  const l = likelihoodScore(likelihood);
  const i = impactScore(impact);
  const score = l === null || i === null ? null : l * i;
  return {
    method: BUSINESS_RISK_ASSESSMENT_METHOD,
    likelihood,
    impact,
    score,
    level: scoreToLevel(score),
    note: BUSINESS_RISK_ASSESSMENT_RULE.note,
  };
}

export function inherentScoreForLevel(level: BusinessRiskLevel): number | null {
  if (level === "unknown") return null;
  const bands = BUSINESS_RISK_ASSESSMENT_RULE.scoreBands[level];
  return bands.min;
}
