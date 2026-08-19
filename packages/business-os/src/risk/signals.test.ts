import { describe, expect, it } from "vitest";
import { detectRiskSignals } from "./signals";
import type { BusinessRiskRegisterRow } from "@rtb/types";
import { computeRiskPriority } from "./priority";

function row(partial: Partial<BusinessRiskRegisterRow["risk"]> & { reference: string; title: string }): BusinessRiskRegisterRow {
  const risk = {
    id: partial.id ?? "r1",
    tenantId: "t",
    workspaceId: "w",
    description: null,
    category: "financial" as const,
    domain: "finance",
    nature: "threat" as const,
    ownerLabel: "Owner",
    status: "open" as const,
    sourceType: "demo",
    sourceRef: "x",
    identifiedAt: "2026-01-01T00:00:00.000Z",
    reviewAt: null,
    closedAt: null,
    acceptedAt: null,
    acceptedBy: null,
    linkedDecisionId: null,
    toleranceExceptionAt: null,
    toleranceExceptionBy: null,
    toleranceExceptionRationale: null,
    provenance: {},
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
  return {
    risk,
    latestAssessment: null,
    inherentLevel: "extreme",
    residualLevel: "extreme",
    toleranceStatus: "outside",
    toleranceException: false,
    treatmentStrategy: null,
    controlCount: 0,
    evidencedControlCount: 0,
    evidenceFreshness: "missing",
    priority: computeRiskPriority({ residualLevel: "extreme", outsideTolerance: true }),
  };
}

describe("BOS-9 risk signals", () => {
  it("emits evidence-backed outside-tolerance and extreme residual signals", () => {
    const drafts = detectRiskSignals({
      row: row({ reference: "RSK-0001", title: "Cash" }),
      controls: [],
      obligations: [],
      actions: [],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(drafts.some((d) => d.ruleId === "risk.outside_tolerance.v1")).toBe(true);
    expect(drafts.some((d) => d.ruleId === "risk.extreme_residual.v1")).toBe(true);
    expect(drafts.every((d) => d.evidence.length > 0)).toBe(true);
    expect(drafts.every((d) => d.provenance.ruleId)).toBeTruthy();
  });

  it("flags overdue treatment actions and untested controls", () => {
    const drafts = detectRiskSignals({
      row: row({ id: "r2", reference: "RSK-0002", title: "Delivery", category: "operational", domain: "operations" }),
      controls: [
        {
          id: "c1",
          tenantId: "t",
          workspaceId: "w",
          name: "Stand-up",
          description: null,
          controlType: "detective",
          ownerLabel: null,
          status: "implemented",
          effectiveness: "untested",
          frequency: "weekly",
          evidenceRefs: [],
          testedAt: null,
          reviewAt: null,
          provenance: {},
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      obligations: [],
      actions: [
        {
          id: "a1",
          tenantId: "t",
          workspaceId: "w",
          title: "Recover work",
          status: "open",
          priority: "high",
          dueDate: "2020-01-01",
          completionEvidence: {},
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(drafts.some((d) => d.ruleId === "risk.control_untested.v1")).toBe(true);
    expect(drafts.some((d) => d.ruleId === "risk.treatment_action_overdue.v1")).toBe(true);
  });
});
