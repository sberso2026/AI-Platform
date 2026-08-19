import { describe, expect, it } from "vitest";
import { computeCapacityMetrics } from "./capacity";

describe("BOS-7 capacity facts", () => {
  it("computes utilization only when available and committed hours are both sourced", () => {
    const result = computeCapacityMetrics({
      availableHoursMinor: "40000",
      committedHoursMinor: "52000",
    });
    expect(result.utilizationBps).toBe("13000");
    expect(result.capacityStatus).toBe("overcommitted");
  });

  it("does not fabricate capacity when hours are missing", () => {
    expect(computeCapacityMetrics({}).capacityStatus).toBe("unknown");
    expect(computeCapacityMetrics({ availableHoursMinor: "100" }).capacityStatus).toBe("unknown");
    expect(computeCapacityMetrics({ committedHoursMinor: "100" }).capacityStatus).toBe("unknown");
  });

  it("treats committed hours with zero available as overcommitted", () => {
    expect(
      computeCapacityMetrics({ availableHoursMinor: "0", committedHoursMinor: "100" }).capacityStatus,
    ).toBe("overcommitted");
  });
});
