import type {
  BusinessEvidenceRef,
  BusinessRiskLevel,
  BusinessRiskPriority,
} from "@rtb/types";
import { BUSINESS_RISK_PRIORITY_METHOD } from "@rtb/types";
import { levelRank } from "./tolerance";

const PRIORITY_RANK = {
  unknown: -1,
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
  critical: 4,
} as const;

function scoreToPriority(score: number | null): BusinessRiskPriority["priority"] {
  if (score === null) return "unknown";
  if (score >= 8) return "critical";
  if (score >= 6) return "urgent";
  if (score >= 4) return "high";
  if (score >= 2) return "normal";
  return "low";
}

function contributionFromScore(points: number): BusinessRiskPriority["components"][number]["contribution"] {
  if (points >= 3) return "critical";
  if (points >= 2) return "urgent";
  if (points >= 1) return "high";
  return "none";
}

export interface RiskPriorityInput {
  residualLevel: BusinessRiskLevel;
  financialExposureKnown?: boolean;
  financialExposureHigh?: boolean;
  mixedCurrency?: boolean;
  reviewAt?: string | null;
  asOf?: string;
  ownerLabel?: string | null;
  controlEffectiveness?: string | null;
  outsideTolerance?: boolean | "unknown";
  evidence?: BusinessEvidenceRef[];
}

export function computeRiskPriority(input: RiskPriorityInput): BusinessRiskPriority {
  const asOf = input.asOf ?? new Date().toISOString();
  const missingInputs: string[] = [];
  const components: BusinessRiskPriority["components"] = [];
  let score = 0;
  let known = 0;

  const residualRank = levelRank(input.residualLevel);
  if (residualRank === null) {
    missingInputs.push("residual_level");
    components.push({
      id: "residual_level",
      label: "Residual risk",
      value: input.residualLevel,
      contribution: "none",
      known: false,
    });
  } else {
    const points = residualRank;
    score += points;
    known += 1;
    components.push({
      id: "residual_level",
      label: "Residual risk",
      value: input.residualLevel,
      contribution: contributionFromScore(points),
      known: true,
    });
  }

  if (input.mixedCurrency) {
    missingInputs.push("financial_exposure_mixed_currency");
    components.push({
      id: "financial_exposure",
      label: "Financial exposure",
      value: "unknown",
      contribution: "none",
      known: false,
    });
  } else if (input.financialExposureKnown) {
    const points = input.financialExposureHigh ? 2 : 1;
    score += points;
    known += 1;
    components.push({
      id: "financial_exposure",
      label: "Financial exposure",
      value: input.financialExposureHigh ? "high" : "known",
      contribution: contributionFromScore(points),
      known: true,
    });
  } else {
    missingInputs.push("financial_exposure");
    components.push({
      id: "financial_exposure",
      label: "Financial exposure",
      value: "unknown",
      contribution: "none",
      known: false,
    });
  }

  if (!input.reviewAt) {
    missingInputs.push("review_at");
    components.push({
      id: "review_timing",
      label: "Review timing",
      value: null,
      contribution: "none",
      known: false,
    });
  } else {
    const overdue = new Date(input.reviewAt).getTime() < new Date(asOf).getTime();
    const points = overdue ? 2 : 0;
    score += points;
    known += 1;
    components.push({
      id: "review_timing",
      label: "Review timing",
      value: input.reviewAt,
      contribution: contributionFromScore(points),
      known: true,
    });
  }

  if (!input.ownerLabel) {
    missingInputs.push("owner");
    score += 1;
    components.push({
      id: "owner",
      label: "Risk owner",
      value: null,
      contribution: "high",
      known: true,
    });
    known += 1;
  } else {
    known += 1;
    components.push({
      id: "owner",
      label: "Risk owner",
      value: input.ownerLabel,
      contribution: "none",
      known: true,
    });
  }

  const effectiveness = input.controlEffectiveness ?? null;
  if (!effectiveness || effectiveness === "unknown") {
    missingInputs.push("control_effectiveness");
    components.push({
      id: "control_effectiveness",
      label: "Control effectiveness",
      value: effectiveness,
      contribution: "none",
      known: false,
    });
  } else {
    const points = effectiveness === "ineffective" ? 2 : effectiveness === "untested" || effectiveness === "partially_effective" ? 1 : 0;
    score += points;
    known += 1;
    components.push({
      id: "control_effectiveness",
      label: "Control effectiveness",
      value: effectiveness,
      contribution: contributionFromScore(points),
      known: true,
    });
  }

  if (input.outsideTolerance === "unknown" || input.outsideTolerance === undefined) {
    missingInputs.push("tolerance_status");
    components.push({
      id: "tolerance",
      label: "Tolerance",
      value: "unknown",
      contribution: "none",
      known: false,
    });
  } else {
    const points = input.outsideTolerance ? 3 : 0;
    score += points;
    known += 1;
    components.push({
      id: "tolerance",
      label: "Tolerance",
      value: input.outsideTolerance ? "outside" : "within",
      contribution: contributionFromScore(points),
      known: true,
    });
  }

    const priority = residualRank === null || known === 0 ? "unknown" : scoreToPriority(score);
    return {
      priority,
      score: residualRank === null || known === 0 ? null : score,
    components,
    evidence: input.evidence ?? [],
    missingInputs,
    version: BUSINESS_RISK_PRIORITY_METHOD,
    inspectable: true,
    authoritativeAi: false,
  };
}

export function priorityRank(priority: BusinessRiskPriority["priority"]): number {
  return PRIORITY_RANK[priority];
}
