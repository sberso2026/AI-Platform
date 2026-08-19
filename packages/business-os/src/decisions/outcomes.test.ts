import { describe, expect, it } from "vitest";
import { assertOutcomeEvidence, compareExpectedVsActual } from "./outcomes";

describe("BOS-8 expected vs actual", () => {
  it("computes variance when metric, unit, currency, scale, and period match", () => {
    const result = compareExpectedVsActual({
      expectedValue: 10,
      actualValue: 7,
      expectedMetricKey: "runway",
      actualMetricKey: "runway",
      expectedUnit: "months",
      actualUnit: "months",
      expectedPeriod: "2026-Q3",
      actualPeriod: "2026-Q3",
    });
    expect(result.comparable).toBe(true);
    expect(result.varianceState).toBe("computed");
    expect(result.varianceValue).toBe("-3");
  });

  it("returns unknown for mixed currencies", () => {
    const result = compareExpectedVsActual({
      expectedValue: 50000,
      actualValue: 40000,
      expectedMetricKey: "at_risk",
      actualMetricKey: "at_risk",
      expectedCurrency: "AUD",
      actualCurrency: "USD",
      expectedScale: 2,
      actualScale: 2,
    });
    expect(result.varianceState).toBe("unknown");
    expect(result.varianceValue).toBeNull();
    expect(result.reason).toBe("currency_mismatch");
  });

  it("does not infer achieved outcomes without evidence", () => {
    expect(() =>
      assertOutcomeEvidence({
        status: "achieved",
        evidenceRefs: [],
        explanation: null,
        actualValue: null,
        actualOutcome: null,
      }),
    ).toThrow("outcome_evidence_required");
  });
});
