import type { BusinessDecisionOutcome, BusinessDecisionOutcomeStatus } from "@rtb/types";

export interface OutcomeComparison {
  varianceValue: string | null;
  varianceState: "computed" | "unknown";
  comparable: boolean;
  reason?: string;
}

function norm(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return value.trim();
}

export function compareExpectedVsActual(input: {
  expectedValue?: string | number | null;
  actualValue?: string | number | null;
  expectedMetricKey?: string | null;
  actualMetricKey?: string | null;
  expectedUnit?: string | null;
  actualUnit?: string | null;
  expectedCurrency?: string | null;
  actualCurrency?: string | null;
  expectedScale?: number | null;
  actualScale?: number | null;
  expectedPeriod?: string | null;
  actualPeriod?: string | null;
}): OutcomeComparison {
  const expected = input.expectedValue;
  const actual = input.actualValue;
  if (expected === null || expected === undefined || expected === "" || actual === null || actual === undefined || actual === "") {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "missing_value" };
  }
  if (norm(input.expectedMetricKey) && norm(input.actualMetricKey) && norm(input.expectedMetricKey) !== norm(input.actualMetricKey)) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "metric_mismatch" };
  }
  if (norm(input.expectedUnit) && norm(input.actualUnit) && norm(input.expectedUnit)?.toLowerCase() !== norm(input.actualUnit)?.toLowerCase()) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "unit_mismatch" };
  }
  const expectedCurrency = norm(input.expectedCurrency)?.toUpperCase() ?? null;
  const actualCurrency = norm(input.actualCurrency)?.toUpperCase() ?? null;
  if (expectedCurrency && actualCurrency && expectedCurrency !== actualCurrency) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "currency_mismatch" };
  }
  if (
    input.expectedScale != null &&
    input.actualScale != null &&
    input.expectedScale !== input.actualScale
  ) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "scale_mismatch" };
  }
  if (norm(input.expectedPeriod) && norm(input.actualPeriod) && norm(input.expectedPeriod) !== norm(input.actualPeriod)) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "period_mismatch" };
  }
  const expectedNum = Number(expected);
  const actualNum = Number(actual);
  if (!Number.isFinite(expectedNum) || !Number.isFinite(actualNum)) {
    return { varianceValue: null, varianceState: "unknown", comparable: false, reason: "non_numeric" };
  }
  const variance = actualNum - expectedNum;
  return {
    varianceValue: String(variance),
    varianceState: "computed",
    comparable: true,
  };
}

export function outcomeRequiresEvidence(status: BusinessDecisionOutcomeStatus): boolean {
  return status === "achieved" || status === "partially_achieved" || status === "not_achieved" || status === "inconclusive";
}

export function assertOutcomeEvidence(outcome: Pick<BusinessDecisionOutcome, "status" | "evidenceRefs" | "explanation" | "actualValue" | "actualOutcome">): void {
  if (!outcomeRequiresEvidence(outcome.status)) return;
  const hasEvidence =
    (outcome.evidenceRefs?.length ?? 0) > 0 ||
    Boolean(outcome.explanation) ||
    outcome.actualValue != null ||
    Boolean(outcome.actualOutcome);
  if (!hasEvidence) {
    throw new Error("outcome_evidence_required");
  }
}
