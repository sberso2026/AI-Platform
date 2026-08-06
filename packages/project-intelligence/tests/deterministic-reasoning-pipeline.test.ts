import { describe, expect, it } from "vitest";
import {
  EngineeringKnowledgeGraph,
  REASONING_PIPELINE_STAGES,
  classifyIntent,
  decideAbstention,
  drillDownPathFor,
  runDeterministicReasoningPipeline,
  validatePermissions,
} from "../src/index";

function fixtureGraph(scope = { tenantId: "t1", workspaceId: "w1" }) {
  const g = new EngineeringKnowledgeGraph();
  g.upsertNode({
    refId: "doc-1",
    kind: "document",
    owner: "document_intelligence",
    title: "Valve leak procedure",
    snippet: "Isolation valve leak testing requirements",
    ...scope,
    drillDownPath: drillDownPathFor("document", "doc-1"),
    storesBusinessRecord: false,
  });
  g.upsertNode({
    refId: "find-1",
    kind: "finding",
    owner: "findings_intelligence",
    title: "Valve leak risk finding",
    snippet: "Candidate finding about valve leak",
    ...scope,
    drillDownPath: drillDownPathFor("finding", "find-1"),
    storesBusinessRecord: false,
  });
  g.upsertNode({
    refId: "risk-1",
    kind: "risk",
    owner: "engineering_core",
    title: "Hydrocarbon leak risk",
    snippet: "Core risk register for leak",
    ...scope,
    drillDownPath: drillDownPathFor("risk", "risk-1"),
    storesBusinessRecord: false,
  });
  g.link({
    edgeId: "e1",
    fromRefId: "find-1",
    toRefId: "doc-1",
    edgeType: "derived_from",
    ...scope,
  });
  g.link({
    edgeId: "e2",
    fromRefId: "find-1",
    toRefId: "risk-1",
    edgeType: "supports",
    ...scope,
  });
  return g;
}

describe("deterministic reasoning pipeline", () => {
  it("exposes the full ordered stage list", () => {
    expect([...REASONING_PIPELINE_STAGES]).toEqual([
      "question",
      "intent_classification",
      "permission_validation",
      "knowledge_graph_traversal",
      "hybrid_retrieval",
      "evidence_ranking",
      "conflict_detection",
      "reasoning",
      "grounded_answer",
      "citations",
      "confidence",
      "abstention",
      "drill_down",
    ]);
  });

  it("classifies intent and validates permissions deterministically", () => {
    expect(classifyIntent("What is the impact of the valve leak?").intent).toBe("impact");
    expect(classifyIntent("Are there conflicts about the leak?").intent).toBe("conflict_probe");
    expect(
      validatePermissions({
        tenantId: "t",
        workspaceId: "w",
        seatAssigned: false,
        workspaceAssigned: true,
        canReadKnowledge: true,
      }).failure,
    ).toBe("seat_not_assigned");
  });

  it("runs Question→…→Drill-down and returns a grounded cited answer", () => {
    const result = runDeterministicReasoningPipeline({
      question: "What do we know about the valve leak risk finding?",
      graph: fixtureGraph(),
      permissions: {
        tenantId: "t1",
        workspaceId: "w1",
        seatAssigned: true,
        workspaceAssigned: true,
        canReadKnowledge: true,
      },
      vectorBoosts: new Map([["doc-1", 0.7]]),
    });

    expect(result.deterministic).toBe(true);
    expect(result.usesPlatformAiRuntime).toBe(true);
    expect(result.implementsPrivateAiClient).toBe(false);
    expect(result.duplicateOwnership).toBe(false);
    expect(result.pipeline).toEqual(REASONING_PIPELINE_STAGES);
    expect(result.stageTrace.map((s) => s.stage)).toEqual([...REASONING_PIPELINE_STAGES]);
    expect(result.status).toBe("answered");
    expect(result.abstained).toBe(false);
    expect(result.answer.length).toBeGreaterThan(0);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.45);
    expect(result.drillDown.length).toBeGreaterThan(0);
    expect(result.drillDown[0]!.path).toContain("/engineering");
  });

  it("abstains when permission fails or evidence conflicts", () => {
    const denied = runDeterministicReasoningPipeline({
      question: "valve leak",
      graph: fixtureGraph(),
      permissions: {
        tenantId: "t1",
        workspaceId: "w1",
        seatAssigned: true,
        workspaceAssigned: true,
        canReadKnowledge: false,
      },
    });
    expect(denied.status).toBe("abstained");
    expect(denied.abstentionReason).toBe("knowledge_read_denied");

    const conflict = decideAbstention({
      permitted: true,
      permissionFailure: null,
      citations: [
        {
          owner: "document_intelligence",
          kind: "document",
          refId: "a",
          excerpt: "x",
          score: 0.9,
          drillDownPath: "/x",
        },
      ],
      confidence: 0.9,
      minConfidence: 0.45,
      minCitations: 1,
      scoreThreshold: 0.2,
      ranked: [],
      conflicts: [{ kind: "opposing_snippets", refIds: ["a", "b"], detail: "oppose" }],
    });
    expect(conflict.abstain).toBe(true);
    expect(conflict.reason).toBe("material_conflict");
  });
});
