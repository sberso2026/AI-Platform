import { describe, expect, it } from "vitest";
import { BUSINESS_RISK_CONTRACT } from "./extensions";
import { BUSINESS_DECISION_IMPACT_DIMENSIONS } from "@rtb/types";

describe("BOS-9 Decision Intelligence integration", () => {
  it("keeps risk as a Decision Intelligence impact dimension and reuses decisions/actions", () => {
    expect(BUSINESS_DECISION_IMPACT_DIMENSIONS).toContain("risk");
    expect(BUSINESS_RISK_CONTRACT.reuses).toEqual([
      "business_os_signals",
      "business_os_recommendations",
      "business_os_kpis",
      "business_os_decisions",
      "business_os_actions",
    ]);
    expect(BUSINESS_RISK_CONTRACT.riskAcceptanceHumanOnly).toBe(true);
    expect(BUSINESS_RISK_CONTRACT.noAutonomousRiskAcceptance).toBe(true);
  });
});
