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
  duplicateEngineeringToolFrameworkDetected,
  duplicateKnowledgeGraphDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE7Invariants,
  getPhaseE7Declaration,
  PhaseE7NoHiddenCotPersistence,
  PhaseE7NoSecondMemoryStore,
  PhaseE7ReusesPlatformMemory,
  rejectCotPersistence,
  rejectUnsupportedAiFactPromotion,
} from "./contracts";
import { EngineeringMemoryCaptureService } from "./capture";
import { EngineeringMemoryRetrievalService } from "./retrieval";
import { InMemoryEngineeringMemoryStore } from "./store";
import {
  applyMemoryToReasoning,
  deriveMemoryContextChips,
  memoryHitsToEvidence,
} from "./ask-bridge";
import type { EngineeringObjectReference } from "../phase-e3/contracts";
import { EngineeringReasoningService } from "../phase-e5/reasoning-service";
import { EngineeringToolInvocationService } from "../phase-e6/invocation";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

const subject = (
  objectId: string,
  tenantId = "t1",
  projectId: string | null = "p1",
): EngineeringObjectReference => ({
  objectType: "DECISION",
  objectId,
  tenantId,
  projectId,
  authority: "ENGINEERING_OS",
  provenance: {
    sourceType: "decision",
    sourceId: objectId,
    mechanism: "SYSTEM",
    timestamp: new Date().toISOString(),
  },
});

describe("Phase E7 passive engineering memory", () => {
  it("18. E0-E6 invariants + Platform Memory/KG ownership", () => {
    expect(PhaseE7NoSecondMemoryStore).toBe(true);
    expect(PhaseE7ReusesPlatformMemory).toBe(true);
    expect(PhaseE7NoHiddenCotPersistence).toBe(true);
    expect(getPhaseE7Declaration().platformMemoryOwner).toBe("platform_kernel");
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    assertPhaseE7Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      duplicateKnowledgeGraphDetected,
      duplicateMemoryFrameworkDetected: false,
      EngineeringOSProductBoundaryLocked,
    });
    expect(duplicateEngineeringToolFrameworkDetected).toBe(false);
  });

  it("1. approved decision capture", async () => {
    const capture = new EngineeringMemoryCaptureService();
    const { record, deduped } = await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-1"),
      summary: "Temporary repair approved pending permanent fix",
      fact: "Decision DEC-1 approved temporary bracing",
      evidenceRefs: ["dec-1"],
      sourceType: "decision",
      sourceId: "dec-1",
      authorityStatus: "APPROVED",
      eventType: "engineering.decision.approved",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });
    expect(deduped).toBe(false);
    expect(record?.authorityStatus).toBe("APPROVED");
    expect(record?.subject.objectId).toBe("dec-1");
    expect(record?.provenance.containsCot).toBe(false);
    expect(record?.provenance.platformMemoryOwner).toBe("platform_kernel");
  });

  it("2. draft/unapproved isolation from default retrieval", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-draft"),
      summary: "Draft recommendation only",
      evidenceRefs: ["dec-draft"],
      sourceType: "decision",
      sourceId: "dec-draft",
      authorityStatus: "DRAFT",
      createdBy: "u1",
    });
    const { hits } = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "recommendation",
    });
    expect(hits.every((h) => h.record.authorityStatus !== "DRAFT")).toBe(true);
  });

  it("3. tool-result capture from immutable EngineeringToolResult", async () => {
    const capture = new EngineeringMemoryCaptureService();
    const inv = new EngineeringToolInvocationService();
    const toolResult = await inv.invoke({
      tenantId: "t1",
      userId: "u1",
      toolId: "eos.evidence_keyword_check",
      inputs: { haystack: "brace approved", needle: "brace" },
      permissions: ["engineering_tool.execute", "engineering_tool.discover"],
    });
    expect(toolResult.provenance.llmGenerated).toBe(false);
    const { record, blockedReason } = await capture.captureToolResult({
      tenantId: "t1",
      projectId: "p1",
      userId: "u1",
      subject: subject("obj-tool"),
      toolResult,
    });
    expect(blockedReason).toBeUndefined();
    expect(record?.sourceType).toBe("tool_result");
    expect(record?.memoryClass).toBe("WORKING_CONTEXT");
    expect(record?.authorityStatus).not.toBe("APPROVED");
  });

  it("4. failed tool not promoted", async () => {
    const capture = new EngineeringMemoryCaptureService();
    const { record, blockedReason } = await capture.captureToolResult({
      tenantId: "t1",
      userId: "u1",
      subject: subject("obj-fail"),
      toolResult: {
        invocationId: "inv-fail",
        toolId: "eos.rectangle_area",
        toolVersion: "1.0.0-e6",
        inputs: {},
        assumptions: [],
        output: null,
        outputKind: "FAILED",
        status: "FAILED",
        applicableRuleRefs: [],
        evidenceRefs: [],
        provenance: {
          mechanism: "GOVERNED_TOOL",
          toolId: "eos.rectangle_area",
          toolVersion: "1.0.0-e6",
          executor: "engineering_os_e6",
          platformRegistryOwner: "platform_intelligence",
          llmGenerated: false,
          inputHash: "x",
          outputHash: null,
        },
        executedAt: new Date().toISOString(),
        durationMs: 1,
        limitations: ["failed"],
        warnings: [],
        authorityStatus: "FAILED",
        reviewRequired: true,
        immutable: true,
      },
    });
    expect(record).toBeNull();
    expect(blockedReason).toBe("failed_or_incomplete_tool_not_promoted");

    // WORKING_CONTEXT cannot auto-become ORGANISATIONAL_KNOWLEDGE
    const ok = await capture.capture({
      tenantId: "t1",
      subject: subject("wc1"),
      summary: "Working note",
      evidenceRefs: ["wc1"],
      sourceType: "explicit_capture",
      sourceId: "wc1",
      authorityStatus: "OBSERVED",
      createdBy: "u1",
      memoryClass: "WORKING_CONTEXT",
    });
    const promo = await capture.promote({
      tenantId: "t1",
      memoryId: ok.record!.memoryId,
      targetClass: "ORGANISATIONAL_KNOWLEDGE",
      actorUserId: "u1",
    });
    expect(promo.blockedReason).toContain("working_context_cannot_auto");
  });

  it("5. dedupe same source/object/event", async () => {
    const capture = new EngineeringMemoryCaptureService();
    const a = await capture.capture({
      tenantId: "t1",
      subject: subject("dec-dup"),
      summary: "Same decision",
      evidenceRefs: ["dec-dup"],
      sourceType: "decision",
      sourceId: "dec-dup",
      authorityStatus: "APPROVED",
      eventType: "engineering.decision.approved",
      createdBy: "u1",
    });
    const b = await capture.capture({
      tenantId: "t1",
      subject: subject("dec-dup"),
      summary: "Same decision again",
      evidenceRefs: ["dec-dup"],
      sourceType: "decision",
      sourceId: "dec-dup",
      authorityStatus: "APPROVED",
      eventType: "engineering.decision.approved",
      createdBy: "u1",
    });
    expect(b.deduped).toBe(true);
    expect(b.record?.memoryId).toBe(a.record?.memoryId);
  });

  it("6. superseded memory traceable but not current", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    const first = await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-old"),
      summary: "Use temporary brace",
      evidenceRefs: ["dec-old"],
      sourceType: "decision",
      sourceId: "dec-old",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });
    const second = await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-new"),
      summary: "Permanent repair required",
      evidenceRefs: ["dec-new"],
      sourceType: "decision",
      sourceId: "dec-new",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });
    await capture.supersede({
      tenantId: "t1",
      memoryId: first.record!.memoryId,
      supersededByMemoryId: second.record!.memoryId,
    });
    const current = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "brace repair",
      includeSuperseded: false,
    });
    expect(current.hits.every((h) => h.record.authorityStatus !== "SUPERSEDED")).toBe(true);
    const withSuperseded = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "brace",
      includeSuperseded: true,
    });
    expect(withSuperseded.hits.some((h) => h.record.authorityStatus === "SUPERSEDED")).toBe(true);
    expect(
      withSuperseded.hits.find((h) => h.record.authorityStatus === "SUPERSEDED")?.presentedAsCurrent,
    ).toBe(false);
  });

  it("7. conflicting memories surfaced not merged", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("same-obj"),
      summary: "Approve temporary repair",
      evidenceRefs: ["a"],
      sourceType: "decision",
      sourceId: "dec-a",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("same-obj"),
      summary: "Reject temporary repair",
      evidenceRefs: ["b"],
      sourceType: "decision",
      sourceId: "dec-b",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    const { hits, limitations } = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      subjectObjectId: "same-obj",
      query: "temporary repair",
    });
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits.some((h) => h.conflictWithMemoryIds.length > 0)).toBe(true);
    expect(limitations.some((l) => /Conflicting/i.test(l))).toBe(true);
  });

  it("8. project-scoped retrieval", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("d1", "t1", "p1"),
      summary: "Project one lesson",
      evidenceRefs: ["d1"],
      sourceType: "lesson",
      sourceId: "d1",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    await capture.capture({
      tenantId: "t1",
      projectId: "p2",
      subject: subject("d2", "t1", "p2"),
      summary: "Project two lesson",
      evidenceRefs: ["d2"],
      sourceType: "lesson",
      sourceId: "d2",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    const { hits } = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "lesson",
    });
    expect(hits.every((h) => h.record.projectId === "p1")).toBe(true);
  });

  it("9. similar precedent retrieval", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-prec"),
      summary: "Similar bracing decision for temporary loads",
      evidenceRefs: ["dec-prec"],
      sourceType: "decision",
      sourceId: "dec-prec",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "ENGINEERING_KNOWLEDGE",
    });
    const hits = await retrieval.findSimilarPrecedents({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "bracing temporary loads",
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.record.sourceType).toBe("decision");
  });

  it("10. provenance back to source", async () => {
    const capture = new EngineeringMemoryCaptureService();
    const { record } = await capture.capture({
      tenantId: "t1",
      subject: subject("dec-prov"),
      summary: "Provenance check",
      evidenceRefs: ["ev-1", "ev-2"],
      sourceType: "decision",
      sourceId: "dec-prov",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    expect(record?.provenance.originalEvidenceRefs).toEqual(["ev-1", "ev-2"]);
    expect(record?.sourceId).toBe("dec-prov");
    expect(record?.provenance.llmGenerated).toBe(false);
  });

  it("11. source revocation blocks retrieval leak", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("sec-1"),
      summary: "Restricted conclusion",
      evidenceRefs: ["sec-1"],
      sourceType: "decision",
      sourceId: "sec-1",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      access: { restricted: true },
    });
    await store.revokeSourceAccess("t1", "sec-1");
    const { hits } = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "Restricted",
      authorisedSourceIds: ["sec-1"],
    });
    expect(hits.length).toBe(0);
  });

  it("12. retention/delete policy soft-deletes by default", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const { record } = await capture.capture({
      tenantId: "t1",
      subject: subject("ret-1"),
      summary: "Retained then archived",
      evidenceRefs: ["ret-1"],
      sourceType: "lesson",
      sourceId: "ret-1",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    await store.applyRetention("t1", record!.memoryId, {
      action: "SOFT_DELETE",
      hardDeletePermitted: false,
      reason: "source_deleted",
    });
    expect(await store.getById("t1", record!.memoryId)).toBeNull();
  });

  it("13. cross-tenant attack blocked", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "tenant-a",
      subject: subject("xa", "tenant-a"),
      summary: "Secret tenant A",
      evidenceRefs: ["xa"],
      sourceType: "decision",
      sourceId: "xa",
      authorityStatus: "APPROVED",
      createdBy: "u1",
    });
    const { hits } = await retrieval.retrieve({
      tenantId: "tenant-b",
      userId: "attacker",
      query: "Secret",
    });
    expect(hits.length).toBe(0);
  });

  it("14. unauthorized memory exclusion", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      subject: subject("authz"),
      summary: "Need explicit auth",
      evidenceRefs: ["authz"],
      sourceType: "decision",
      sourceId: "authz",
      authorityStatus: "APPROVED",
      createdBy: "owner",
      access: { restricted: true, authorizedUserIds: ["owner"] },
    });
    const denied = await retrieval.retrieve({
      tenantId: "t1",
      userId: "other",
      query: "Need explicit",
      authorisedSourceIds: [],
    });
    expect(denied.hits.length).toBe(0);
    const allowed = await retrieval.retrieve({
      tenantId: "t1",
      userId: "owner",
      query: "Need explicit",
      authorisedSourceIds: ["authz"],
    });
    expect(allowed.hits.length).toBe(1);
  });

  it("15. no CoT persistence", async () => {
    expect(() => rejectCotPersistence()).toThrow(/hidden_cot/);
    const capture = new EngineeringMemoryCaptureService();
    await expect(
      capture.capture({
        tenantId: "t1",
        subject: subject("cot"),
        summary: "Includes chain-of-thought scratchpad",
        evidenceRefs: ["cot"],
        sourceType: "decision",
        sourceId: "cot",
        authorityStatus: "OBSERVED",
        createdBy: "u1",
      }),
    ).rejects.toThrow(/hidden_cot/);
  });

  it("16. no unsupported AI fact promotion", async () => {
    expect(() => rejectUnsupportedAiFactPromotion()).toThrow(/unsupported_ai/);
    const capture = new EngineeringMemoryCaptureService();
    await expect(
      capture.capture({
        tenantId: "t1",
        subject: subject("ai-fact"),
        summary: "Model invented a code clause",
        sourceType: "engineering_conclusion",
        sourceId: "",
        authorityStatus: "APPROVED",
        createdBy: "llm",
        evidenceRefs: [],
      }),
    ).rejects.toThrow(/unsupported_ai/);
  });

  it("17. E5 Why? memory provenance", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    const retrieval = new EngineeringMemoryRetrievalService(store);
    await capture.capture({
      tenantId: "t1",
      projectId: "p1",
      subject: subject("dec-why"),
      summary: "Why temporary repair was allowed",
      fact: "Approved under temporary condition assessment",
      evidenceRefs: ["dec-why"],
      sourceType: "decision",
      sourceId: "dec-why",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });
    const { hits } = await retrieval.retrieve({
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      query: "temporary repair",
    });
    const reasoning = await new EngineeringReasoningService().reason({
      query: "why was temporary repair allowed?",
      evidence: memoryHitsToEvidence(hits),
    });
    const withMemory = applyMemoryToReasoning(reasoning, hits);
    expect(withMemory.why.chainOfThoughtExposed).toBe(false);
    expect(withMemory.why.ruleOrToolBasis.some((l) => /E7 memory context/i.test(l))).toBe(true);
    expect(withMemory.why.keyEvidence.some((e) => e.sourceId === "dec-why")).toBe(true);
    expect(deriveMemoryContextChips(hits).previousDecision).toBe(true);
  });

  it("Ask path uses memory as context (E7 phase meta)", async () => {
    const store = new InMemoryEngineeringMemoryStore();
    const capture = new EngineeringMemoryCaptureService(store);
    await capture.capture({
      tenantId: "tenant-ask",
      projectId: "proj-1",
      subject: subject("dec-ask", "tenant-ask", "proj-1"),
      summary: "Prior bracing decision for similar scope",
      evidenceRefs: ["dec-ask"],
      sourceType: "decision",
      sourceId: "dec-ask",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });

    const commerce = {
      tenantId: "tenant-ask",
      userId: "u1",
      permissions: ["engineering.search", "engineering.ai.execute"],
    } as never;

    const result = await runGroundedEngineeringAsk({
      commerce,
      retrieval: new EngineeringRetrievalService({
        search: async () => ({
          projects: [],
          documents: [],
          assets: [],
          decisions: [
            {
              id: "dec-ask",
              tenant_id: "tenant-ask",
              title: "Prior bracing decision",
              status: "approved",
              project_id: "proj-1",
            },
          ],
          actions: [],
          risks: [],
          issues: [],
          technical_queries: [],
          lessons: [],
        }),
      }),
      query: {
        tenantId: "tenant-ask",
        userId: "u1",
        projectId: "proj-1",
        query: "have we dealt with bracing before?",
        limit: 5,
      },
      skipReasoning: false,
      memoryStore: store,
      memoryCapture: capture,
    });

    expect(result.memoryHits?.length).toBeGreaterThan(0);
    expect(result.meta.phase).toBe("E7");
    expect(result.meta.chainOfThoughtExposed).toBe(false);
    expect(result.limitations.some((l) => /memory/i.test(l))).toBe(true);
  });
});
