import { describe, expect, it } from "vitest";
import { computeWorkHealth } from "./health";
import { computeWorkProgress } from "./progress";
import { computeCostProgress } from "./cost-progress";
import { detectOperationalSignals } from "./signals";
import { milestone, work } from "./test-work";
import type { BusinessWorkCostFact } from "@rtb/types";

function fact(amount: string): BusinessWorkCostFact {
  return {
    id: "c1",
    tenantId: "t",
    workspaceId: "w",
    workId: "w1",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    costType: "labour",
    amountMinor: amount,
    currency: "AUD",
    scale: 2,
    valueState: "actual",
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "",
    updatedAt: "",
  };
}

describe("BOS-7 work health and delivery risk", () => {
  it("is deterministic and transparent, not an opaque score or enterprise Business Health", () => {
    const item = work({
      plannedFinish: "2026-07-01",
      progressBps: "2000",
      owner: null,
      status: "on_hold",
    });
    const progress = computeWorkProgress(item, []);
    const costProgress = computeCostProgress({
      work: item,
      facts: [fact("900000")],
      progressBps: progress.progressBps,
    });
    const health = computeWorkHealth({
      work: item,
      milestones: [milestone({ status: "blocked", dueAt: "2026-07-01" })],
      actionLinks: [],
      progress,
      costProgress,
      capacity: [],
      asOf: "2026-08-19",
    });
    expect(health.method).toBe("deterministic_work_health_v1");
    expect(health.disclaimer).not.toMatch(/llm|opaque/i);
    expect(health.components.map((c) => c.id)).toEqual(
      expect.arrayContaining(["schedule", "progress", "cost_progress", "blocked", "owner", "freshness"]),
    );
    expect(["at_risk", "critical"]).toContain(health.status);

    const signals = detectOperationalSignals({
      work: item,
      milestones: [milestone({ name: "Hold review", status: "blocked", dueAt: "2026-07-01" })],
      progress,
      costProgress,
      health,
      capacity: [],
      highValue: true,
      asOf: "2026-08-19",
      staleDays: 14,
    });
    expect(signals.map((s) => s.ruleId)).toEqual(
      expect.arrayContaining([
        "operations.work_overdue.v1",
        "operations.work_blocked.v1",
        "operations.cost_progress_variance.v1",
      ]),
    );
    expect(signals.every((s) => s.evidence.length > 0 && s.provenance.ruleId)).toBe(true);
  });

  it("does not claim delay probability", () => {
    const item = work({ plannedFinish: "2026-08-20", progressBps: "9000" });
    const progress = computeWorkProgress(item, []);
    const health = computeWorkHealth({
      work: item,
      milestones: [],
      actionLinks: [],
      progress,
      costProgress: computeCostProgress({ work: item, facts: [], progressBps: progress.progressBps }),
      capacity: [],
      asOf: "2026-08-19",
    });
    expect(JSON.stringify(health)).not.toMatch(/p50 delay|predicted delay probability/i);
    expect(health.disclaimer).toMatch(/not a statistical delay probability/i);
  });
});
