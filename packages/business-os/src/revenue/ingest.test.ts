import { describe, expect, it } from "vitest";
import { REVENUE_DEMO_DRAFTS, REVENUE_DEMO_PRICING, REVENUE_DEMO_PROPOSALS } from "./demo";

describe("BOS-4 revenue ingestion contract", () => {
  it("keeps communication drafts internal and never sendable", () => {
    for (const draft of REVENUE_DEMO_DRAFTS) {
      expect(draft.provenance?.externalSend).toBe(false);
      expect(draft.type).not.toBeUndefined();
    }
  });

  it("versions proposals and keeps superseded drafts", () => {
    const numbers = REVENUE_DEMO_PROPOSALS.map((p) => `${p.proposalNumber}|${p.version}`);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(REVENUE_DEMO_PROPOSALS.some((p) => p.status === "superseded")).toBe(true);
  });

  it("uses integer money and explicit discounts only", () => {
    for (const scenario of REVENUE_DEMO_PRICING) {
      if (scenario.revenueMinor != null) expect(String(scenario.revenueMinor)).toMatch(/^-?\d+$/);
      if (scenario.estimatedDirectCostMinor != null) {
        expect(String(scenario.estimatedDirectCostMinor)).toMatch(/^-?\d+$/);
      }
    }
    expect(REVENUE_DEMO_PRICING.some((s) => s.revenueMinor === "0")).toBe(true);
    expect(REVENUE_DEMO_PRICING.some((s) => s.estimatedDirectCostMinor == null)).toBe(true);
  });

  it("uses source_type + source_ref as the natural idempotency key", () => {
    const keys = REVENUE_DEMO_PROPOSALS.map((p) => `${p.sourceType}|${p.sourceRef}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
