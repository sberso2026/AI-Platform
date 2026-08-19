import { describe, expect, it } from "vitest";
import { computeDecisionPriority } from "./priority";
import { DECISION_PRIORITY_VERSION } from "@rtb/types";

describe("BOS-8 decision priority", () => {
  it("is deterministic, versioned, and never AI-authoritative", () => {
    const result = computeDecisionPriority({
      pending: true,
      dueAt: "2020-01-01T00:00:00.000Z",
      asOf: "2026-08-19T00:00:00.000Z",
      originatingSignalSeverity: "critical",
      financialImpactMinor: "20000000",
      reversibility: "irreversible",
    });
    expect(result.version).toBe(DECISION_PRIORITY_VERSION);
    expect(result.inspectable).toBe(true);
    expect(result.authoritativeAi).toBe(false);
    expect(result.priority).toBe("critical");
    expect(result.components.map((c) => c.id)).toEqual(
      expect.arrayContaining(["originating_signal", "deadline", "financial_impact", "reversibility"]),
    );
  });

  it("returns unknown when no scoring inputs are known", () => {
    const result = computeDecisionPriority({ pending: true });
    expect(result.priority).toBe("unknown");
    expect(result.missingInputs).toEqual(
      expect.arrayContaining(["originating_signal_severity", "due_at", "financial_impact"]),
    );
  });

  it("does not invent financial impact", () => {
    const result = computeDecisionPriority({
      pending: true,
      originatingSignalSeverity: "info",
    });
    expect(result.components.find((c) => c.id === "financial_impact")?.known).toBe(false);
    expect(result.missingInputs).toContain("financial_impact");
  });
});
