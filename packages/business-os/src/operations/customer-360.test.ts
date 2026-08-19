import { describe, expect, it } from "vitest";
import type { BusinessCustomerOperationsEvidence } from "@rtb/types";

describe("BOS-7 customer 360 operations evidence contract", () => {
  it("exposes bounded aggregation rather than embedding customer algorithms", () => {
    const evidence: BusinessCustomerOperationsEvidence = {
      available: true,
      activeWorkCount: 2,
      completedWorkCount: 1,
      atRiskWorkCount: 1,
      work: [
        {
          id: "w1",
          reference: "JOB-1",
          name: "Harbour",
          status: "active",
          progressBps: "3500",
          health: "at_risk",
          plannedFinish: "2026-07-31",
        },
      ],
      signalTypes: ["operations.work_overdue"],
    };
    expect(evidence.available).toBe(true);
    expect(evidence.work?.[0]?.health).toBe("at_risk");
  });
});
