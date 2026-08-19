import { describe, expect, it } from "vitest";
import { detectDecisionSignals, lessonIsOrganisationalKnowledge } from "./signals";
import type { BusinessDecision, BusinessDecisionLesson } from "@rtb/types";

const decision: BusinessDecision = {
  id: "d1",
  tenantId: "t",
  workspaceId: "w",
  statement: "Hold spend",
  status: "pending",
  isDemo: true,
  createdAt: "",
  updatedAt: "",
};

describe("BOS-8 decision signals and lessons", () => {
  it("flags overdue, missing evidence, approved without action, and blocked actions", () => {
    const missing = detectDecisionSignals({
      decision,
      context: {
        id: "c",
        tenantId: "t",
        workspaceId: "w",
        decisionId: "d1",
        question: "Hold?",
        domain: "finance",
        stakeholders: [],
        urgency: "critical",
        dueAt: "2020-01-01T00:00:00.000Z",
        evidenceCompletenessBps: "0",
        assumptions: [],
        constraints: [],
        sourceType: "demo",
        provenance: {},
        isDemo: true,
        createdAt: "",
        updatedAt: "",
      },
      evidence: [],
      actions: [],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(missing.map((d) => d.ruleId)).toEqual(
      expect.arrayContaining(["decision.overdue.v1", "decision.missing_evidence.v1"]),
    );

    const approved = detectDecisionSignals({
      decision: { ...decision, status: "approved", reviewAt: "2020-01-01" },
      evidence: [],
      actions: [
        {
          id: "a1",
          tenantId: "t",
          workspaceId: "w",
          decisionId: "d1",
          title: "Collect invoices",
          status: "blocked",
          priority: "high",
          completionEvidence: { blocker: "Owner confirmation" },
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(approved.map((d) => d.ruleId)).toEqual(
      expect.arrayContaining(["decision.action_blocked.v1", "decision.outcome_review_overdue.v1"]),
    );

    const noAction = detectDecisionSignals({
      decision: { ...decision, status: "approved" },
      evidence: [],
      actions: [],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(noAction.map((d) => d.ruleId)).toContain("decision.approved_without_action.v1");
    expect([...missing, ...approved].every((d) => d.recommendationText.match(/advisory|no autonomous|do not/i))).toBe(true);
  });

  it("does not treat AI lesson drafts as organisational knowledge", () => {
    const lesson = {
      status: "proposed_ai",
      draftSource: "platform_ai_director",
    } as BusinessDecisionLesson;
    expect(lessonIsOrganisationalKnowledge(lesson)).toBe(false);
    expect(lessonIsOrganisationalKnowledge({ ...lesson, status: "accepted" })).toBe(true);
  });
});
