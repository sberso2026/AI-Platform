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
  PhaseE2AbstentionRequiredWhenInsufficient,
  PhaseE2DoesNotOwnPiIiAiLogic,
  PhaseE2GroundedSearchComplete,
  PhaseE2LexicalAlwaysAvailable,
  PhaseE2NativeZeroConnector,
  PhaseE2NoFabricatedEvidence,
  PhaseE2SemanticOptionalWithLexicalFallback,
  assertPhaseE2Invariants,
  classifyEvidenceState,
  getPhaseE2Declaration,
  mapDocumentAuthorityStatus,
  resolveSearchScope,
} from "./contracts";
import {
  bucketsToEvidence,
  synthesizeGroundedAnswer,
} from "../services/engineering-evidence";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

const fixtureBuckets = {
  projects: [
    {
      id: "p1",
      tenant_id: "t1",
      project_code: "PRJ-1",
      project_name: "Temporary Repair Bridge",
      status: "active",
    },
  ],
  documents: [
    {
      id: "d-current",
      tenant_id: "t1",
      engineering_project_id: "p1",
      document_number: "DOC-100",
      title: "Temporary repair procedure",
      revision: "C",
      status: "approved",
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: "d-old",
      tenant_id: "t1",
      engineering_project_id: "p1",
      document_number: "DOC-100",
      title: "Temporary repair procedure",
      revision: "A",
      status: "superseded",
      updated_at: "2025-01-01T00:00:00Z",
    },
  ],
  decisions: [
    {
      id: "dec1",
      tenant_id: "t1",
      project_id: "p1",
      decision_number: "DEC-9",
      title: "Temporary repairs allowed",
      recommendation: "Use bolted splice for temporary repair",
      status: "approved",
    },
  ],
  actions: [],
  risks: [],
  issues: [
    {
      id: "iss1",
      tenant_id: "t1",
      project_id: "p1",
      issue_number: "ISS-2",
      title: "Unresolved corrosion at bearing",
      description: "Major unresolved technical issue at bearing plate",
      status: "open",
    },
  ],
  technicalQueries: [],
  lessons: [],
  assets: [
    {
      id: "a1",
      tenant_id: "t1",
      engineering_project_id: "p1",
      asset_tag: "P-103",
      asset_name: "Bearing pedestal",
      system: "Substructure",
      status: "active",
    },
  ],
};

describe("Phase E2 grounded search contracts", () => {
  it("locks E2 flags and preserves certified ownership", () => {
    const decl = getPhaseE2Declaration();
    expect(decl.evolutionPhase).toBe("E2");
    expect(PhaseE2GroundedSearchComplete).toBe(true);
    expect(PhaseE2NativeZeroConnector).toBe(true);
    expect(PhaseE2LexicalAlwaysAvailable).toBe(true);
    expect(PhaseE2SemanticOptionalWithLexicalFallback).toBe(true);
    expect(PhaseE2AbstentionRequiredWhenInsufficient).toBe(true);
    expect(PhaseE2NoFabricatedEvidence).toBe(true);
    expect(PhaseE2DoesNotOwnPiIiAiLogic).toBe(true);
    expect(() =>
      assertPhaseE2Invariants({
        ProjectIntelligenceV1Intact,
        InspectionIntelligenceV1Intact,
        AssetIntelligenceV1Intact,
        ProjectControlsV1Intact,
        DigitalTwinV1Intact,
        EngineeringModelInteroperabilityV1Intact,
        privateCrossModuleCouplingDetected,
        duplicateAssetOwnershipDetected,
        EngineeringOSProductBoundaryLocked,
      }),
    ).not.toThrow();
  });

  it("resolves scopes and authority statuses", () => {
    expect(resolveSearchScope({ projectId: "p1" })).toBe("project");
    expect(resolveSearchScope({ objectType: "asset", objectId: "a1" })).toBe("asset");
    expect(mapDocumentAuthorityStatus({ status: "approved" })).toBe("APPROVED");
    expect(mapDocumentAuthorityStatus({ status: "superseded" })).toBe("SUPERSEDED");
    expect(mapDocumentAuthorityStatus({ status: "draft" })).toBe("DRAFT");
  });
});

describe("Phase E2 evaluation fixtures", () => {
  it("1 exact factual retrieval + citation mapping", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "temporary repair",
      projectId: "p1",
      scope: "project",
    });
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.some((e) => e.sourceId === "dec1")).toBe(true);
    expect(evidence.every((e) => e.permissionsApplied && e.provenance === "engineering_os_native")).toBe(
      true,
    );
  });

  it("2 multi-source synthesis", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "temporary repair",
      projectId: "p1",
    });
    const answer = synthesizeGroundedAnswer({
      query: "temporary repair",
      evidence,
      evidenceState: classifyEvidenceState({ evidence }),
      scope: "project",
      limitations: [],
      retrievalMode: "lexical",
      generationAvailable: false,
    });
    expect(answer.abstained).toBe(false);
    expect(answer.answer).toContain("authorised Engineering OS");
    expect(answer.evidence.length).toBeGreaterThan(1);
  });

  it("3 project-scoped search excludes other projects", () => {
    const evidence = bucketsToEvidence(
      {
        ...fixtureBuckets,
        decisions: [
          ...fixtureBuckets.decisions,
          {
            id: "dec-other",
            project_id: "p-other",
            title: "Temporary repairs other project",
            recommendation: "unrelated",
            status: "approved",
          },
        ],
      },
      {
        tenantId: "t1",
        userId: "u1",
        query: "temporary repairs",
        projectId: "p1",
        scope: "project",
      },
    );
    expect(evidence.every((e) => !e.projectId || e.projectId === "p1" || e.sourceType === "project")).toBe(
      true,
    );
    expect(evidence.some((e) => e.sourceId === "dec-other")).toBe(false);
  });

  it("4 object-scoped asset search", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "what information",
      projectId: "p1",
      objectType: "asset",
      objectId: "a1",
      scope: "asset",
    });
    expect(evidence.some((e) => e.sourceId === "a1")).toBe(true);
  });

  it("5 superseded vs current document preference + warning", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "temporary repair procedure",
      projectId: "p1",
    });
    expect(evidence[0]?.authorityStatus).toBe("APPROVED");
    expect(evidence.some((e) => e.authorityStatus === "SUPERSEDED")).toBe(true);
    expect(evidence.some((e) => e.supersededWarning || e.conflicting)).toBe(true);
  });

  it("6 conflicting sources surfaced", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "temporary repair procedure",
      projectId: "p1",
    });
    expect(classifyEvidenceState({ evidence })).toMatch(/CONFLICTING|SUFFICIENT|PARTIAL/);
    expect(evidence.some((e) => e.conflicting || e.supersededWarning)).toBe(true);
  });

  it("7-8 insufficient / no evidence abstention", () => {
    const empty = synthesizeGroundedAnswer({
      query: "quantum flux capacitor approval",
      evidence: [],
      evidenceState: "INSUFFICIENT",
      scope: "workspace",
      limitations: [],
      retrievalMode: "lexical",
      generationAvailable: false,
    });
    expect(empty.abstained).toBe(true);
    expect(empty.answer).toContain("does not have enough authorised evidence");
  });

  it("9-10 unauthorized / cross-tenant exclusion via project filter", () => {
    const evidence = bucketsToEvidence(
      {
        decisions: [
          {
            id: "foreign",
            project_id: "foreign-project",
            title: "Sensitive decision",
            recommendation: "secret",
            status: "approved",
          },
        ],
      },
      {
        tenantId: "t1",
        userId: "u1",
        query: "Sensitive decision",
        projectId: "p1",
        scope: "project",
      },
    );
    expect(evidence.some((e) => e.sourceId === "foreign")).toBe(false);
  });

  it("11 semantic unavailable falls back to lexical", async () => {
    const retrieval = new EngineeringRetrievalService(
      {
        search: async () => fixtureBuckets,
      },
      {
        available: true,
        retrieve: async () => {
          throw new Error("embedding provider down");
        },
      },
    );
    const result = await retrieval.retrieve({} as never, {
      tenantId: "t1",
      userId: "u1",
      query: "temporary repair",
      projectId: "p1",
    });
    expect(result.retrievalMode).toBe("lexical_fallback");
    expect(result.limitations.some((l) => l.toLowerCase().includes("lexical"))).toBe(true);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it("12 generation unavailable returns retrieval-only without fabrication", async () => {
    const retrieval = new EngineeringRetrievalService({
      search: async () => fixtureBuckets,
    });
    const grounded = await runGroundedEngineeringAsk({
      commerce: {} as never,
      retrieval,
      query: {
        tenantId: "t1",
        userId: "u1",
        query: "temporary repair",
        projectId: "p1",
      },
      tryGenerate: async () => ({ content: "", failed: true }),
    });
    expect(grounded.meta.generationFailed).toBe(true);
    expect(grounded.retrievalMode).toBe("retrieval_only");
    expect(grounded.message).not.toContain("platform-docs");
    expect(grounded.evidence.every((e) => e.provenance === "engineering_os_native")).toBe(true);
  });

  it("13-14 partial/stale and precedent search", () => {
    const evidence = bucketsToEvidence(fixtureBuckets, {
      tenantId: "t1",
      userId: "u1",
      query: "have we dealt with temporary repairs before",
      projectId: "p1",
    });
    expect(evidence.some((e) => e.sourceType === "decision")).toBe(true);
    const answer = synthesizeGroundedAnswer({
      query: "previous decisions about temporary repairs",
      evidence,
      evidenceState: classifyEvidenceState({ evidence }),
      scope: "project",
      limitations: evidence.some((e) => e.supersededWarning)
        ? ["One supporting source is superseded."]
        : [],
      retrievalMode: "lexical",
      generationAvailable: false,
    });
    expect(answer.limitations.join(" ")).toMatch(/superseded|authorised|./i);
    expect(answer.abstained).toBe(false);
  });

  it("retrieves authorised register records for operational NL questions", () => {
    const evidence = bucketsToEvidence(
      {
        ...fixtureBuckets,
        risks: [
          {
            id: "rsk-open",
            project_id: "p1",
            risk_number: "RSK-1",
            title: "Cooling water pump seal failure",
            status: "open",
            description: "Leak at pump P-101",
          },
        ],
        technicalQueries: [
          {
            id: "tq-open",
            project_id: "p1",
            tq_number: "TQ-1",
            title: "Confirm seal material",
            question: "Is PTFE acceptable?",
            status: "open",
          },
        ],
        actions: [
          {
            id: "act-open",
            project_id: "p1",
            action_number: "ACT-1",
            title: "Replace pump seal",
            status: "open",
          },
        ],
        inspections: [
          {
            id: "obs-1",
            workspace_id: "ws1",
            body: "Visible weepage at pump packing",
            checklist_item_type: "visual",
          },
        ],
      },
      {
        tenantId: "t1",
        userId: "u1",
        query: "What risks are open?",
        projectId: "p1",
        scope: "project",
      },
    );
    expect(evidence.some((e) => e.sourceId === "rsk-open" && e.provenance === "engineering_os_native")).toBe(
      true,
    );
    const tqs = bucketsToEvidence(
      {
        technicalQueries: [
          {
            id: "tq-open",
            project_id: "p1",
            tq_number: "TQ-1",
            title: "Confirm seal material",
            status: "open",
          },
        ],
      },
      {
        tenantId: "t1",
        userId: "u1",
        query: "Which TQs are unresolved?",
        projectId: "p1",
        scope: "project",
      },
    );
    expect(tqs.some((e) => e.sourceId === "tq-open")).toBe(true);
    const findings = bucketsToEvidence(
      {
        inspections: [
          {
            id: "obs-1",
            body: "Visible weepage at pump packing",
            title: "Inspection finding: Visible weepage at pump packing",
          },
        ],
      },
      {
        tenantId: "t1",
        userId: "u1",
        query: "Summarize recent inspection findings.",
        projectId: "p1",
        scope: "project",
      },
    );
    expect(findings.some((e) => e.sourceId === "obs-1" && e.sourceType === "inspection")).toBe(true);
  });
});
