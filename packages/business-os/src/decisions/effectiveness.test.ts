import { describe, expect, it } from "vitest";
import { assessEffectiveness } from "./effectiveness";
import type { BusinessDecisionOutcome } from "@rtb/types";

function outcome(partial: Partial<BusinessDecisionOutcome>): BusinessDecisionOutcome {
  return {
    id: "o1",
    tenantId: "t",
    workspaceId: "w",
    decisionId: "d1",
    status: "pending",
    varianceState: "unknown",
    evidenceRefs: [],
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("BOS-8 decision effectiveness", () => {
  it("is unknown without an outcome", () => {
    expect(assessEffectiveness(null).status).toBe("unknown");
    expect(assessEffectiveness(null).measurementCoverage).toBe("none");
    expect(assessEffectiveness(null).authoritativeAi).toBe(false);
  });

  it("maps evidence-backed outcomes transparently", () => {
    expect(
      assessEffectiveness(
        outcome({
          status: "not_achieved",
          expectedOutcome: "Reduce leakage",
          actualOutcome: "Leakage increased",
          expectedValue: "1",
          actualValue: "2",
          evidenceRefs: [{ sourceType: "kpi", sourceRef: "profit_leakage_total", title: "Leakage" }],
        }),
      ).status,
    ).toBe("ineffective");
    expect(assessEffectiveness(outcome({ status: "inconclusive", expectedOutcome: "x", actualOutcome: "y" })).status).toBe(
      "inconclusive",
    );
    expect(assessEffectiveness(outcome({ status: "achieved", expectedValue: "1", actualValue: "1" })).status).toBe("effective");
  });
});
