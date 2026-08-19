import type {
  BusinessRiskCategory,
  BusinessRiskLevel,
  BusinessRiskSettings,
  BusinessRiskToleranceRule,
  BusinessRiskToleranceStatus,
} from "@rtb/types";
import { BUSINESS_RISK_DEFAULT_THRESHOLDS } from "@rtb/types";

const RANK: Record<Exclude<BusinessRiskLevel, "unknown">, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  extreme: 3,
};

export function levelRank(level: BusinessRiskLevel): number | null {
  if (level === "unknown") return null;
  return RANK[level];
}

export function resolveMaxAcceptableLevel(
  settings: Pick<BusinessRiskSettings, "defaultMaxAcceptableLevel" | "rules"> | null | undefined,
  risk: { domain?: string | null; category?: BusinessRiskCategory | string | null },
): Exclude<BusinessRiskLevel, "unknown"> {
  const fallback = settings?.defaultMaxAcceptableLevel ?? BUSINESS_RISK_DEFAULT_THRESHOLDS.defaultMaxAcceptableLevel;
  const rules = settings?.rules ?? [];
  const domain = risk.domain ?? null;
  const category = risk.category ?? null;

  const scored = rules
    .map((rule) => {
      if (rule.category && rule.category !== category) return null;
      if (rule.domain && rule.domain !== domain) return null;
      let specificity = 0;
      if (rule.category) specificity += 2;
      if (rule.domain) specificity += 1;
      return { rule, specificity };
    })
    .filter((row): row is { rule: BusinessRiskToleranceRule; specificity: number } => Boolean(row));

  scored.sort((a, b) => b.specificity - a.specificity);
  return scored[0]?.rule.maxAcceptableLevel ?? fallback;
}

export function toleranceStatus(
  residualLevel: BusinessRiskLevel,
  maxAcceptable: Exclude<BusinessRiskLevel, "unknown">,
): BusinessRiskToleranceStatus {
  const residualRank = levelRank(residualLevel);
  if (residualRank === null) return "unknown";
  return residualRank > RANK[maxAcceptable] ? "outside" : "within";
}

export function defaultRiskSettings(): Pick<BusinessRiskSettings, "defaultMaxAcceptableLevel" | "rules" | "version"> {
  return {
    defaultMaxAcceptableLevel: BUSINESS_RISK_DEFAULT_THRESHOLDS.defaultMaxAcceptableLevel,
    rules: [],
    version: 1,
  };
}
