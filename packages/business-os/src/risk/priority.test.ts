import { describe, expect, it } from "vitest";
import { computeRiskPriority } from "./priority";
import { financialExposure } from "./exposure";
import { defaultRiskSettings, resolveMaxAcceptableLevel, toleranceStatus } from "./tolerance";
import { assertObligationComplianceAllowed, obligationOverdue } from "./obligations";

describe("BOS-9 risk prioritisation", () => {
  it("is deterministic, versioned, and not AI-authoritative", () => {
    const result = computeRiskPriority({
      residualLevel: "extreme",
      financialExposureKnown: true,
      financialExposureHigh: true,
      reviewAt: "2020-01-01T00:00:00.000Z",
      asOf: "2026-08-19T00:00:00.000Z",
      ownerLabel: null,
      controlEffectiveness: "ineffective",
      outsideTolerance: true,
    });
    expect(result.version).toBe("risk_priority.v1");
    expect(result.inspectable).toBe(true);
    expect(result.authoritativeAi).toBe(false);
    expect(result.priority).toBe("critical");
    expect(result.components.length).toBeGreaterThan(3);
    expect(result.missingInputs).toContain("owner");
  });

  it("returns unknown when no components are known", () => {
    const result = computeRiskPriority({ residualLevel: "unknown" });
    expect(result.priority).toBe("unknown");
    expect(result.missingInputs).toEqual(expect.arrayContaining(["residual_level", "financial_exposure"]));
  });
});

describe("BOS-9 financial exposure reuse", () => {
  it("does not invent mixed-currency totals", () => {
    const mixed = financialExposure([
      { amountMinor: "100", currency: "AUD" },
      { amountMinor: "200", currency: "USD" },
    ]);
    expect(mixed.known).toBe(false);
    expect(mixed.mixedCurrency).toBe(true);
    expect(mixed.reason).toBe("mixed_currency");
    expect(financialExposure([]).reason).toBe("missing_financial_exposure");
  });
});

describe("BOS-9 risk tolerance", () => {
  it("uses explicit configurable thresholds", () => {
    const settings = {
      defaultMaxAcceptableLevel: "high" as const,
      rules: [{ category: "financial" as const, maxAcceptableLevel: "moderate" as const, requiresApproval: true }],
    };
    expect(resolveMaxAcceptableLevel(settings, { category: "financial" })).toBe("moderate");
    expect(resolveMaxAcceptableLevel(defaultRiskSettings(), { category: "operational" })).toBe("high");
    expect(toleranceStatus("extreme", "moderate")).toBe("outside");
    expect(toleranceStatus("moderate", "high")).toBe("within");
    expect(toleranceStatus("unknown", "low")).toBe("unknown");
  });
});

describe("BOS-9 obligations", () => {
  it("does not claim compliance without evidence and authorized confirmation", () => {
    expect(() => assertObligationComplianceAllowed("compliant", [], false)).toThrow("obligation_evidence_required");
    expect(() =>
      assertObligationComplianceAllowed("compliant", [{ sourceType: "doc", sourceRef: "a", title: "a" }], true),
    ).not.toThrow();
    expect(obligationOverdue("in_progress", "2020-01-01T00:00:00.000Z", "2026-08-19T00:00:00.000Z")).toBe(true);
    expect(obligationOverdue("compliant", "2020-01-01T00:00:00.000Z", "2026-08-19T00:00:00.000Z")).toBe(false);
  });
});
