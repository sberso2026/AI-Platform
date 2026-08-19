import { describe, expect, it } from "vitest";
import { computeWorkProgress } from "./progress";
import { milestone, work } from "./test-work";

describe("BOS-7 work progress", () => {
  it("uses user-supplied progress including zero and never invents a value", () => {
    expect(computeWorkProgress(work({ progressBps: "0" }), []).progressBps).toBe("0");
    expect(computeWorkProgress(work({ progressBps: "3500" }), []).method).toBe("user_supplied");
  });

  it("stays unknown when progress and milestone weights are missing", () => {
    const result = computeWorkProgress(work({ progressBps: null }), [milestone()]);
    expect(result.progressBps).toBeNull();
    expect(result.method).toBe("unknown");
    expect(result.missingInputs).toContain("explicit_milestone_weights");
  });

  it("does not invent equal weights when some weights are missing", () => {
    const result = computeWorkProgress(work({ progressBps: null }), [
      milestone({ id: "a", weightBps: "5000", status: "completed" }),
      milestone({ id: "b", weightBps: null, status: "not_started" }),
    ]);
    expect(result.progressBps).toBeNull();
    expect(result.method).toBe("unknown");
  });

  it("derives weighted milestone progress only when weights are explicit and sum to 10000 bps", () => {
    const result = computeWorkProgress(work({ progressBps: null }), [
      milestone({ id: "a", weightBps: "4000", status: "completed" }),
      milestone({ id: "b", weightBps: "6000", status: "in_progress" }),
    ]);
    expect(result.method).toBe("weighted_milestones");
    expect(result.progressBps).toBe("4000");
  });

  it("rejects weights that do not sum to 10000 bps", () => {
    const result = computeWorkProgress(work({ progressBps: null }), [
      milestone({ id: "a", weightBps: "4000", status: "completed" }),
      milestone({ id: "b", weightBps: "4000", status: "completed" }),
    ]);
    expect(result.progressBps).toBeNull();
    expect(result.missingInputs).toContain("milestone_weights_must_sum_to_10000_bps");
  });
});
