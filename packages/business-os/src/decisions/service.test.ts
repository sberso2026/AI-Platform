import { describe, expect, it } from "vitest";
import { createBusinessOS } from "../business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { DECISION_ACTION_INTELLIGENCE_CONTRACT, BUSINESS_RISK_CONTRACT } from "./extensions";
import { computeActionIntelligence } from "./action-intelligence";

describe("BOS-8 decision action service guards", () => {
  it("forbids autonomous approval, external execution, and historical evidence rewrite", () => {
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.decisionAction).toBeDefined();
    expect(() => bos.decisionAction.approveAutonomously()).toThrow("autonomous_approval_forbidden");
    expect(() => bos.decisionAction.executeExternalAction()).toThrow("external_execution_forbidden");
    expect(() => bos.decisionAction.rewriteHistoricalEvidence()).toThrow("historical_evidence_rewrite_forbidden");
    expect(bos.decisionAction.contract()).toEqual(DECISION_ACTION_INTELLIGENCE_CONTRACT);
    expect(bos.decisionAction.contract().implemented).toBe(true);
    expect(bos.decisionAction.contract().noAutonomousApproval).toBe(true);
    expect(bos.decisionAction.businessRisk().available).toBe(true);
    expect(BUSINESS_RISK_CONTRACT.implemented).toBe(true);
    expect(bos.workOperations.decisionAction().available).toBe(true);
  });

  it("reuses existing actions rather than a second task table", () => {
    const intel = computeActionIntelligence({
      actions: [
        {
          id: "a1",
          tenantId: "t",
          workspaceId: "w",
          decisionId: "d1",
          title: "Blocked",
          status: "blocked",
          priority: "critical",
          dueDate: "2020-01-01",
          completionEvidence: { blocker: "Awaiting owner" },
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "a2",
          tenantId: "t",
          workspaceId: "w",
          title: "Overdue",
          status: "open",
          priority: "high",
          dueDate: "2020-01-01",
          completionEvidence: {},
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      decisions: [
        {
          id: "d1",
          tenantId: "t",
          workspaceId: "w",
          statement: "Hold",
          status: "pending",
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      asOf: new Date("2026-08-19T00:00:00.000Z"),
    });
    expect(intel.blocked).toHaveLength(1);
    expect(intel.overdue).toHaveLength(1);
    expect(intel.decisionCritical.map((a) => a.id)).toContain("a1");
    expect(intel.unresolvedDependencies[0]?.blocker).toBe("Awaiting owner");
  });
});
