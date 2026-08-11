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
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE5Invariants,
  getPhaseE5Declaration,
  PhaseE5AdvisoryUnlessCertifiedGoverned,
  PhaseE5NoHiddenCotExposure,
  PhaseE5ReasoningExplainabilityComplete,
} from "./contracts";
import {
  EngineeringReasoningService,
  assembleAuthorisedEvidence,
  stripFabricatedAuthorityClaims,
} from "./reasoning-service";
import type { EngineeringEvidence } from "../phase-e2/contracts";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

function ev(partial: Partial<EngineeringEvidence> & Pick<EngineeringEvidence, "sourceId" | "title">): EngineeringEvidence {
  return {
    sourceType: "document",
    canonicalObjectId: partial.sourceId,
    authorityStatus: "APPROVED",
    sourceLocation: `/engineering/documents/${partial.sourceId}`,
    excerpt: partial.excerpt ?? partial.title,
    provenance: "engineering_os_native",
    permissionsApplied: true,
    ...partial,
  };
}

describe("Phase E5 reasoning & explainability", () => {
  it("14. locks E0–E4 invariants", () => {
    expect(PhaseE5ReasoningExplainabilityComplete).toBe(true);
    expect(PhaseE5NoHiddenCotExposure).toBe(true);
    expect(PhaseE5AdvisoryUnlessCertifiedGoverned).toBe(true);
    expect(getPhaseE5Declaration().basisKinds).toContain("EVIDENCE_BASED");
    assertPhaseE5Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("1. factual evidence-based answer", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "What does the temporary repair procedure say?",
      evidence: [
        ev({
          sourceId: "d1",
          title: "Temporary repair procedure",
          excerpt: "Use bolted splice for temporary repair",
          authorityStatus: "APPROVED",
        }),
      ],
    });
    expect(res.abstained).toBe(false);
    expect(res.basis.some((b) => b.kind === "EVIDENCE_BASED")).toBe(true);
    expect(res.answer).toMatch(/bolted splice/i);
    expect(res.why.chainOfThoughtExposed).toBe(false);
    expect(res.authorityStatus).toBe("ADVISORY");
  });

  it("2. derived conclusion", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "Derive a conclusion about temporary repairs",
      requestedIntent: "derive_supported_conclusion",
      evidence: [
        ev({
          sourceId: "dec1",
          title: "DEC-9 Temporary repairs allowed",
          excerpt: "Temporary bolted splice accepted",
          sourceType: "decision",
        }),
      ],
    });
    expect(res.mode).toBe("derive_supported_conclusion");
    expect(res.basis.some((b) => b.kind === "DERIVED")).toBe(true);
    expect(res.answer).toMatch(/derived|Supported conclusion/i);
  });

  it("3. explicit assumption", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "Summarise draft guidance",
      evidence: [
        ev({
          sourceId: "d-draft",
          title: "Draft guidance",
          excerpt: "Pending review",
          authorityStatus: "DRAFT",
        }),
      ],
    });
    expect(res.assumptions.some((a) => a.explicit && /DRAFT/i.test(a.statement))).toBe(true);
    expect(res.basis.some((b) => b.kind === "ASSUMED")).toBe(true);
  });

  it("4. insufficient evidence abstention", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "What is the approved load rating for Pier 99?",
      evidence: [],
    });
    expect(res.abstained).toBe(true);
    expect(res.basis[0]?.kind).toBe("INSUFFICIENT_EVIDENCE");
    expect(res.authorityStatus).toBe("ABSTAINED");
    expect(res.limitations.some((l) => /Missing:/i.test(l))).toBe(true);
    expect(res.confidence).toBeNull();
  });

  it("5. conflicting sources", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "Is temporary repair allowed?",
      evidence: [
        ev({
          sourceId: "d-a",
          title: "Temporary repair procedure",
          excerpt: "Allowed",
          authorityStatus: "APPROVED",
          conflicting: true,
        }),
        ev({
          sourceId: "d-b",
          title: "Temporary repair procedure",
          excerpt: "Not allowed",
          authorityStatus: "SUPERSEDED",
          conflicting: true,
          supersededWarning: true,
        }),
      ],
    });
    expect(res.basis.some((b) => b.kind === "CONFLICTING")).toBe(true);
    expect(res.answer).toMatch(/disagree|conflict/i);
    expect(res.authorityStatus).toBe("REQUIRES_HUMAN_REVIEW");
  });

  it("6. superseded vs current retained", async () => {
    const assembled = assembleAuthorisedEvidence([
      ev({
        sourceId: "d-new",
        title: "Procedure",
        excerpt: "Rev C",
        authorityStatus: "APPROVED",
        revision: "C",
      }),
      ev({
        sourceId: "d-old",
        title: "Procedure",
        excerpt: "Rev A",
        authorityStatus: "SUPERSEDED",
        revision: "A",
        supersededWarning: true,
      }),
    ]);
    expect(assembled.evidence.some((e) => e.authorityStatus === "SUPERSEDED")).toBe(true);
    expect(assembled.limitations.some((l) => /superseded/i.test(l))).toBe(true);
  });

  it("7. connector + native evidence", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "SAP Notification 48192 and DEC-103",
      evidence: [
        ev({
          sourceId: "dec-103",
          title: "Engineering Decision DEC-103",
          excerpt: "Review SAP notification",
          sourceType: "decision",
        }),
        ev({
          sourceId: "SAP:48192",
          title: "SAP Notification 48192",
          excerpt: "Pier settlement",
          provenance: "connector_external",
          sourceType: "issue",
        }),
      ],
    });
    expect(res.evidence.some((e) => e.provenance === "engineering_os_native")).toBe(true);
    expect(res.evidence.some((e) => e.provenance === "connector_external")).toBe(true);
    expect(res.limitations.some((l) => /native.*connector|connector.*native/i.test(l))).toBe(true);
  });

  it("8. unauthorized evidence exclusion", () => {
    const assembled = assembleAuthorisedEvidence([
      ev({ sourceId: "ok", title: "OK", excerpt: "ok" }),
      ev({
        sourceId: "bad",
        title: "Bad",
        excerpt: "secret",
        permissionsApplied: false,
      }),
    ]);
    expect(assembled.evidence.map((e) => e.sourceId)).toEqual(["ok"]);
    expect(JSON.stringify(assembled)).not.toMatch(/hidden/i);
  });

  it("9. cross-tenant attack — filtered evidence never enters reasoning", async () => {
    // Upstream retrieval must drop other-tenant rows; reasoning only sees authorised set.
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "cross tenant",
      evidence: [
        ev({ sourceId: "mine", title: "Tenant A record", excerpt: "local" }),
      ],
    });
    expect(res.evidence.every((e) => e.sourceId !== "other-tenant")).toBe(true);
    expect(res.why.platformInternalsExposed).toBe(false);
  });

  it("10. reasoning-provider outage → retrieval-only", async () => {
    const svc = new EngineeringReasoningService({
      refine: async () => ({ content: "", failed: true }),
    });
    const res = await svc.reason({
      query: "explain temporary repair",
      evidence: [
        ev({
          sourceId: "d1",
          title: "Temporary repair procedure",
          excerpt: "Use bolted splice",
        }),
      ],
    });
    expect(res.degradedToRetrievalOnly).toBe(true);
    expect(res.answer).toMatch(/bolted splice|Evidence-based/i);
    expect(res.limitations.some((l) => /provider failed|retrieval/i.test(l))).toBe(true);
  });

  it("11. no fake standard/calculation", () => {
    const cleaned = stripFabricatedAuthorityClaims(
      "Per AS/NZS 1170 the calculated stress = 120 MPa approved by Alice",
    );
    expect(cleaned).not.toMatch(/AS\/NZS 1170/);
    expect(cleaned).not.toMatch(/calculated stress = 120/);
    expect(cleaned).not.toMatch(/approved by Alice/i);

    // Reasoning without tool must not claim formal verification
  });

  it("11b. no formal verification claim without tool", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "verify the structural calculation",
      evidence: [
        ev({
          sourceId: "d1",
          title: "Calc note metadata",
          excerpt: "Metadata only — body not extracted",
        }),
      ],
    });
    expect(res.answer).not.toMatch(/design verification completed|calculation is certified/i);
    expect(res.answer).toMatch(/not an engineering approval or certified calculation/i);
    expect(res.applicableRules.some((r) => !r.applied)).toBe(true);
  });

  it("12. Why? provenance correctness", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "why was temporary repair allowed?",
      evidence: [
        ev({
          sourceId: "dec1",
          title: "DEC-9",
          excerpt: "Temporary repairs allowed",
          sourceType: "decision",
        }),
      ],
    });
    expect(res.why.finding).toBeTruthy();
    expect(res.why.keyEvidence[0]?.sourceId).toBe("dec1");
    expect(res.why.keyEvidence[0]?.provenance).toBe("engineering_os_native");
    expect(res.why.chainOfThoughtExposed).toBe(false);
    expect(res.mode).toBe("explain");
  });

  it("13. advisory/human-authority state", async () => {
    const svc = new EngineeringReasoningService();
    const res = await svc.reason({
      query: "recommend next action for the splice",
      requestedIntent: "recommend_next_action",
      evidence: [
        ev({
          sourceId: "act1",
          title: "Install splice",
          excerpt: "Open action",
          sourceType: "action",
        }),
      ],
    });
    expect(res.recommendedNextActions.every((a) => a.requiresHumanReview && !a.autonomousApproval)).toBe(
      true,
    );
    expect(res.answer).toMatch(/advisory/i);
    expect(["ADVISORY", "REQUIRES_HUMAN_REVIEW"]).toContain(res.authorityStatus);
  });

  it("Ask path attaches E5 reasoning", async () => {
    const retrieval = new EngineeringRetrievalService({
      search: async () => ({
        projects: [],
        documents: [
          {
            id: "d1",
            tenant_id: "t1",
            title: "Temporary repair procedure",
            status: "approved",
            recommendation: "Use bolted splice",
          },
        ],
        assets: [],
        decisions: [],
        actions: [],
        risks: [],
        issues: [],
        technical_queries: [],
        lessons: [],
      }),
    });
    const result = await runGroundedEngineeringAsk({
      commerce: {} as never,
      retrieval,
      query: { tenantId: "t1", userId: "u1", query: "temporary repair procedure" },
    });
    expect(result.meta.phase).toBe("E5");
    expect(result.why?.chainOfThoughtExposed).toBe(false);
    expect(result.reasoning?.basis.some((b) => b.kind === "EVIDENCE_BASED")).toBe(true);
  });
});
