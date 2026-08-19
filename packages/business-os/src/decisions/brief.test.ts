import { describe, expect, it } from "vitest";
import { buildDecisionBrief } from "./brief";
import { compareOptions } from "./comparison";
import type { BusinessDecision, BusinessDecisionOption } from "@rtb/types";

describe("BOS-8 decision brief", () => {
  it("builds a structured brief without AI", () => {
    const decision: BusinessDecision = {
      id: "d1",
      tenantId: "t",
      workspaceId: "w",
      statement: "Hold spend",
      context: "Cash runway is short",
      status: "pending",
      isDemo: true,
      createdAt: "",
      updatedAt: "",
      reviewAt: "2026-08-26",
    };
    const options: BusinessDecisionOption[] = [
      {
        id: "o1",
        tenantId: "t",
        workspaceId: "w",
        decisionId: "d1",
        title: "Hold",
        status: "preferred",
        assumptions: [],
        constraints: [],
        reversibility: "reversible",
        generatedBy: "user",
        aiGenerated: false,
        sourceType: "demo",
        provenance: {},
        isDemo: true,
        createdAt: "",
        updatedAt: "",
      },
    ];
    const brief = buildDecisionBrief({
      decision,
      context: {
        id: "c1",
        tenantId: "t",
        workspaceId: "w",
        decisionId: "d1",
        question: "Should we hold spend?",
        domain: "finance",
        stakeholders: [],
        urgency: "critical",
        evidenceCompletenessBps: "0",
        assumptions: ["Runway is current"],
        constraints: ["Human approval"],
        sourceType: "demo",
        provenance: {},
        isDemo: true,
        createdAt: "",
        updatedAt: "",
      },
      evidence: [],
      options,
      comparison: compareOptions({ options, impacts: [] }),
    });
    expect(brief.requiresAi).toBe(false);
    expect(brief.generatedBy).toBe("deterministic_rule");
    expect(brief.decisionQuestion).toBe("Should we hold spend?");
    expect(brief.missingEvidence).toEqual(expect.arrayContaining(["No evidence linked"]));
    expect(brief.recommendation.advisoryOnly).toBe(true);
    expect(brief.recommendation.text).not.toMatch(/chain.of.thought|guaranteed/i);
  });
});
