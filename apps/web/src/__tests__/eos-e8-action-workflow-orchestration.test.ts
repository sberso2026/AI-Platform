/**
 * Phase E8 smoke — action proposal orchestration + workflow ownership lock.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE8ActionWorkflowOrchestrationComplete,
  PhaseE8NoSecondWorkflowFramework,
  PhaseE8ReusesPlatformWorkflowEngine,
  EngineeringActionProposalService,
  getPhaseE8Declaration,
  phaseE8Ready,
  duplicateWorkflowEngineDetected,
} from "@rtb/engineering-os";

describe("eos-e8-action-workflow-orchestration", () => {
  it("exports E8 readiness and Platform Workflow ownership lock", async () => {
    expect(phaseE8Ready).toBe(true);
    expect(PhaseE8ActionWorkflowOrchestrationComplete).toBe(true);
    expect(PhaseE8NoSecondWorkflowFramework).toBe(true);
    expect(PhaseE8ReusesPlatformWorkflowEngine).toBe(true);
    expect(duplicateWorkflowEngineDetected).toBe(false);
    expect(getPhaseE8Declaration().platformWorkflowOwner).toBe("platform_kernel");

    const svc = new EngineeringActionProposalService();
    const proposal = await svc.create({
      tenantId: "t-web",
      projectId: "p1",
      userId: "u1",
      actionType: "CREATE_ACTION",
      proposedPayload: { title: "Web smoke action" },
      sourceContext: {
        tenantId: "t-web",
        projectId: "p1",
        contextResolvedAt: new Date().toISOString(),
      },
      evidenceRefs: ["ev-1"],
      permissions: ["engineering_action.propose"],
    });
    expect(proposal.provenance.autonomousApproval).toBe(false);
    expect(proposal.approvalState).toBe("READY_FOR_REVIEW");
  });
});
