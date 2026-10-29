import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  duplicateMemoryFrameworkDetected,
  duplicateWorkflowEngineDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE8Invariants,
  getPhaseE8Declaration,
  PhaseE8NoAutonomousApproval,
  PhaseE8NoSecondWorkflowFramework,
  PhaseE8ReusesPlatformWorkflowEngine,
} from "./contracts";
import { EngineeringActionProposalService } from "./proposal-service";
import { FixtureEngineeringDomainExecutor } from "./domain-executor";
import { InMemoryEngineeringActionProposalStore } from "./store";
import {
  buildProposalInputFromAsk,
  toolResultMayPrefill,
} from "./ask-bridge";
import { emitMemoryCandidateFromCompletedAction } from "./e7-handoff";
import { EngineeringMemoryCaptureService } from "../phase-e7/capture";
import { InMemoryEngineeringMemoryStore } from "../phase-e7/store";
import type { EngineeringToolResult } from "../phase-e6/contracts";

function baseCreate(
  overrides: Partial<Parameters<EngineeringActionProposalService["create"]>[0]> = {},
) {
  return {
    tenantId: "t1",
    projectId: "p1",
    userId: "u1",
    actionType: "CREATE_ACTION" as const,
    proposedPayload: { title: "Follow up bracing", description: "Track temporary repair" },
    sourceContext: {
      tenantId: "t1",
      projectId: "p1",
      objectType: "decision",
      objectId: "dec-1",
      askQuery: "what should we do next?",
      contextResolvedAt: "2026-08-11T00:00:00.000Z",
    },
    evidenceRefs: ["dec-1", "doc-1"],
    permissions: ["engineering_action.propose"],
    ...overrides,
  };
}

async function approveAndExecute(
  svc: EngineeringActionProposalService,
  proposalId: string,
  opts: {
    permissions?: string[];
    idempotencyKey?: string;
    freshness?: string;
    externalWritePolicyEnabled?: boolean;
  } = {},
) {
  const p = await svc.getForReview("t1", proposalId);
  const approved = await svc.approve({
    tenantId: "t1",
    proposalId,
    userId: "reviewer",
    expectedPayloadHash: p!.provenance.payloadHash,
    permissions: opts.permissions ?? [
      "engineering_action.approve",
      "engineering_action.approve_safety",
      "engineering_action.execute",
    ],
  });
  return svc.execute({
    tenantId: "t1",
    proposalId: approved.proposalId,
    userId: "reviewer",
    permissions: opts.permissions ?? ["engineering_action.execute"],
    idempotencyKey: opts.idempotencyKey,
    contextFreshnessToken: opts.freshness ?? approved.sourceContext.contextFreshnessToken,
    externalWritePolicyEnabled: opts.externalWritePolicyEnabled,
  });
}

describe("Phase E8 action & workflow orchestration", () => {
  it("21. E0-E7 invariants + Platform Workflow ownership", () => {
    expect(PhaseE8NoSecondWorkflowFramework).toBe(true);
    expect(PhaseE8ReusesPlatformWorkflowEngine).toBe(true);
    expect(PhaseE8NoAutonomousApproval).toBe(true);
    expect(getPhaseE8Declaration().platformWorkflowOwner).toBe("platform_kernel");
    expect(duplicateWorkflowEngineDetected).toBe(false);
    assertPhaseE8Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      duplicateWorkflowEngineDetected,
      duplicateMemoryFrameworkDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("1. create action proposal", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    expect(p.actionType).toBe("CREATE_ACTION");
    expect(p.approvalState).toBe("READY_FOR_REVIEW");
    expect(p.provenance.autonomousApproval).toBe(false);
    expect(p.proposedPayload.projectId).toBe("p1");
    expect(p.evidenceRefs).toContain("dec-1");
  });

  it("2. draft response", async () => {
    const svc = new EngineeringActionProposalService();
    const input = buildProposalInputFromAsk({
      tenantId: "t1",
      projectId: "p1",
      userId: "u1",
      kind: "draft_response",
      draftText: "Proposed TQ reply citing evidence",
      evidenceRefs: ["tq-1"],
      objectType: "technical_query",
      objectId: "tq-1",
    });
    const p = await svc.create(input);
    expect(p.actionType).toBe("DRAFT_TQ_RESPONSE");
    expect(p.proposedPayload.status).toBe("draft");
    expect(p.provenance.llmGeneratedDraft).toBe(true);
    const done = await approveAndExecute(svc, p.proposalId);
    expect(done.approvalState).toBe("COMPLETED");
    expect(done.domainResultType).toBe("technical_query_draft_response");
  });

  it("3. decision draft", async () => {
    const executor = new FixtureEngineeringDomainExecutor();
    const events: Array<{ eventType: string }> = [];
    const svc = new EngineeringActionProposalService(
      new InMemoryEngineeringActionProposalStore(),
      executor,
      { publish: async (e) => events.push(e) },
      { start: async () => ({ id: "wf-1" }) },
    );
    const p = await svc.create(
      baseCreate({
        actionType: "CREATE_DECISION_DRAFT",
        proposedPayload: { title: "Approve temporary brace", status: "draft" },
      }),
    );
    const done = await approveAndExecute(svc, p.proposalId);
    expect(done.approvalState).toBe("COMPLETED");
    expect(done.domainResultType).toBe("decision");
    expect(events.some((e) => e.eventType === "engineering.action_proposal.completed")).toBe(
      true,
    );
  });

  it("4. risk/issue draft", async () => {
    const svc = new EngineeringActionProposalService();
    const risk = await svc.create(
      baseCreate({
        actionType: "CREATE_RISK_DRAFT",
        proposedPayload: { title: "Brace failure risk", status: "draft" },
      }),
    );
    const issue = await svc.create(
      baseCreate({
        actionType: "CREATE_ISSUE_DRAFT",
        proposedPayload: { title: "Missing as-built", status: "draft" },
      }),
    );
    expect((await approveAndExecute(svc, risk.proposalId)).domainResultType).toBe("risk");
    expect((await approveAndExecute(svc, issue.proposalId)).domainResultType).toBe("issue");
  });

  it("5. context prefill", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(
      baseCreate({
        proposedPayload: { title: "Only title" },
      }),
    );
    expect(p.proposedPayload.projectId).toBe("p1");
    expect(p.proposedPayload.objectId).toBe("dec-1");
    expect(p.proposedPayload.objectType).toBe("decision");
  });

  it("6. evidence linkage", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(
      baseCreate({
        actionType: "LINK_EVIDENCE",
        evidenceRefs: ["ev-a", "ev-b"],
        proposedPayload: { title: "Link evidence", fromId: "dec-1", toId: "doc-1" },
      }),
    );
    expect(p.evidenceRefs).toEqual(["ev-a", "ev-b"]);
    expect(p.provenance.evidenceRefs).toEqual(["ev-a", "ev-b"]);
  });

  it("7. edit before approval", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    const edited = await svc.edit({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "u1",
      expectedPayloadHash: p.provenance.payloadHash,
      proposedPayload: { title: "Updated follow-up", assigneeId: "eng-2" },
    });
    expect(edited.proposedPayload.title).toBe("Updated follow-up");
    expect(edited.proposedPayload.assigneeId).toBe("eng-2");
    expect(edited.provenance.payloadHash).not.toBe(p.provenance.payloadHash);
    expect(edited.approvalState).toBe("READY_FOR_REVIEW");
  });

  it("8. reject", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    const rejected = await svc.reject({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
      note: "Not required",
    });
    expect(rejected.approvalState).toBe("REJECTED");
  });

  it("9. approval required", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(
      baseCreate({
        actionType: "CREATE_DECISION_DRAFT",
        proposedPayload: { title: "Needs approval", status: "draft" },
      }),
    );
    expect(p.authorityRequired).toBe("APPROVAL_REQUIRED");
    await expect(
      svc.execute({
        tenantId: "t1",
        proposalId: p.proposalId,
        userId: "u1",
        permissions: ["engineering_action.execute"],
      }),
    ).rejects.toThrow(/not_approved/);
  });

  it("10. unauthorized execution", async () => {
    const svc = new EngineeringActionProposalService(
      undefined,
      undefined,
      {},
      {},
      {
        hasPermission: async ({ action }) => action !== "engineering_action.execute",
      },
    );
    const p = await svc.create(baseCreate());
    await svc.approve({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
      expectedPayloadHash: p.provenance.payloadHash,
      permissions: ["engineering_action.approve"],
    });
    await expect(
      svc.execute({
        tenantId: "t1",
        proposalId: p.proposalId,
        userId: "u1",
        permissions: [],
      }),
    ).rejects.toThrow(/unauthorized_execution/);
  });

  it("11. cross-tenant attack", async () => {
    const svc = new EngineeringActionProposalService();
    await expect(
      svc.create(
        baseCreate({
          targetObject: {
            objectType: "decision",
            objectId: "x",
            tenantId: "other-tenant",
          },
        }),
      ),
    ).rejects.toThrow(/cross_tenant/);
  });

  it("12. payload tamper", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    await expect(
      svc.approve({
        tenantId: "t1",
        proposalId: p.proposalId,
        userId: "reviewer",
        expectedPayloadHash: "tampered-hash",
        permissions: ["engineering_action.approve"],
      }),
    ).rejects.toThrow(/payload_tamper/);
  });

  it("13. duplicate/idempotent execution", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    const first = await approveAndExecute(svc, p.proposalId, {
      idempotencyKey: "idem-1",
    });
    const second = await svc.execute({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
      permissions: ["engineering_action.execute"],
      idempotencyKey: "idem-1",
      contextFreshnessToken: first.sourceContext.contextFreshnessToken,
    });
    expect(first.approvalState).toBe("COMPLETED");
    expect(second.proposalId).toBe(first.proposalId);
    expect(second.domainResultId).toBe(first.domainResultId);
  });

  it("14. stale context", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    await svc.approve({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
      expectedPayloadHash: p.provenance.payloadHash,
      permissions: ["engineering_action.approve"],
    });
    const stale = await svc.execute({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
      permissions: ["engineering_action.execute"],
      contextFreshnessToken: "stale-token",
    });
    expect(stale.approvalState).toBe("READY_FOR_REVIEW");
    expect(stale.failureReason).toMatch(/stale_context/);
  });

  it("15. domain failure", async () => {
    const executor = new FixtureEngineeringDomainExecutor();
    executor.failNext = true;
    const svc = new EngineeringActionProposalService(
      new InMemoryEngineeringActionProposalStore(),
      executor,
    );
    const p = await svc.create(baseCreate());
    const failed = await approveAndExecute(svc, p.proposalId);
    expect(failed.approvalState).toBe("FAILED");
    expect(failed.failureReason).toBe("domain_service_failure");
  });

  it("16. workflow failure", async () => {
    const executor = new FixtureEngineeringDomainExecutor();
    executor.workflowOutage = true;
    const svc = new EngineeringActionProposalService(
      new InMemoryEngineeringActionProposalStore(),
      executor,
    );
    const p = await svc.create(
      baseCreate({
        actionType: "CREATE_DECISION_DRAFT",
        proposedPayload: { title: "Decision", status: "draft" },
      }),
    );
    const failed = await approveAndExecute(svc, p.proposalId);
    expect(failed.approvalState).toBe("FAILED");
    expect(failed.failureReason).toBe("workflow_outage");
  });

  it("17. external-write blocked", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(
      baseCreate({
        actionType: "PREPARE_EXTERNAL_WRITE",
        proposedPayload: { title: "SAP write prep", system: "sap" },
      }),
    );
    expect(p.authorityRequired).toBe("EXTERNAL_WRITE");
    const blocked = await approveAndExecute(svc, p.proposalId, {
      permissions: ["engineering_action.approve", "engineering_action.execute"],
      externalWritePolicyEnabled: false,
    });
    expect(blocked.approvalState).toBe("FAILED");
    expect(blocked.failureReason).toMatch(/external_write/);
  });

  it("18. tool-result provenance", async () => {
    const okTool: EngineeringToolResult = {
      invocationId: "inv-ok",
      toolId: "eos.evidence_keyword_check",
      toolVersion: "1.0.0-e6",
      inputs: { haystack: "a", needle: "a" },
      assumptions: [],
      output: { matched: true },
      outputKind: "CHECKED",
      status: "SUCCESS",
      applicableRuleRefs: [],
      evidenceRefs: ["ev-1"],
      provenance: {
        mechanism: "GOVERNED_TOOL",
        toolId: "eos.evidence_keyword_check",
        toolVersion: "1.0.0-e6",
        executor: "engineering_os_e6",
        platformRegistryOwner: "platform_intelligence",
        llmGenerated: false,
        inputHash: "h1",
        outputHash: "h2",
      },
      executedAt: new Date().toISOString(),
      durationMs: 1,
      limitations: [],
      warnings: [],
      authorityStatus: "REQUIRES_HUMAN_REVIEW",
      reviewRequired: true,
      immutable: true,
    };
    expect(toolResultMayPrefill(okTool).ok).toBe(true);
    expect(
      toolResultMayPrefill({
        ...okTool,
        status: "FAILED",
        outputKind: "FAILED",
        authorityStatus: "FAILED",
      }).ok,
    ).toBe(false);

    const svc = new EngineeringActionProposalService();
    const input = buildProposalInputFromAsk({
      tenantId: "t1",
      userId: "u1",
      kind: "create_action",
      toolResult: okTool,
      evidenceRefs: ["ev-1"],
    });
    const p = await svc.create(input);
    expect(p.toolResultRefs).toContain("inv-ok");
    expect(p.provenance.mechanism).toBe("TOOL_PREFILL");
  });

  it("19. memory candidate after completed action", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    const done = await approveAndExecute(svc, p.proposalId);
    const memory = new EngineeringMemoryCaptureService(new InMemoryEngineeringMemoryStore());
    const emitted = await emitMemoryCandidateFromCompletedAction({
      proposal: done,
      capture: memory,
    });
    expect(emitted.emitted).toBe(true);
    expect(emitted.memoryId).toBeTruthy();
  });

  it("20. rejected proposal not promoted", async () => {
    const svc = new EngineeringActionProposalService();
    const p = await svc.create(baseCreate());
    const rejected = await svc.reject({
      tenantId: "t1",
      proposalId: p.proposalId,
      userId: "reviewer",
    });
    const memory = new EngineeringMemoryCaptureService();
    const emitted = await emitMemoryCandidateFromCompletedAction({
      proposal: rejected,
      capture: memory,
    });
    expect(emitted.emitted).toBe(false);
    expect(emitted.reason).toBe("rejected_proposal_not_promoted");
  });
});
