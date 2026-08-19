import type {
  BusinessDecisionEffectiveness,
  BusinessDecisionOutcome,
  BusinessEvidenceRef,
} from "@rtb/types";
import { DECISION_EFFECTIVENESS_VERSION } from "@rtb/types";

export function assessEffectiveness(outcome: BusinessDecisionOutcome | null, extraEvidence: BusinessEvidenceRef[] = []): BusinessDecisionEffectiveness {
  if (!outcome) {
    return {
      status: "unknown",
      expectedOutcome: null,
      actualOutcome: null,
      evidence: extraEvidence,
      measurementCoverage: "none",
      version: DECISION_EFFECTIVENESS_VERSION,
      authoritativeAi: false,
    };
  }
  const evidence = [...(outcome.evidenceRefs ?? []), ...extraEvidence];
  const hasExpected = Boolean(outcome.expectedOutcome || outcome.expectedValue != null);
  const hasActual = Boolean(outcome.actualOutcome || outcome.actualValue != null);
  const coverage = hasExpected && hasActual ? "full" : hasExpected || hasActual ? "partial" : "none";
  const base = {
    expectedOutcome: outcome.expectedOutcome ?? (outcome.expectedValue != null ? String(outcome.expectedValue) : null),
    actualOutcome: outcome.actualOutcome ?? (outcome.actualValue != null ? String(outcome.actualValue) : null),
    evidence,
    measurementCoverage: coverage as BusinessDecisionEffectiveness["measurementCoverage"],
    version: DECISION_EFFECTIVENESS_VERSION,
    authoritativeAi: false as const,
  };
  if (outcome.status === "pending" || outcome.status === "measuring") {
    return { ...base, status: "unknown" };
  }
  if (outcome.status === "cancelled") {
    return { ...base, status: "unknown" };
  }
  if (outcome.status === "inconclusive") {
    return { ...base, status: "inconclusive" };
  }
  if (coverage === "none") {
    return { ...base, status: "unknown" };
  }
  if (outcome.status === "achieved") return { ...base, status: "effective" };
  if (outcome.status === "partially_achieved") return { ...base, status: "partially_effective" };
  if (outcome.status === "not_achieved") return { ...base, status: "ineffective" };
  return { ...base, status: "unknown" };
}
