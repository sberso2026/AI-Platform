import { describe, expect, it } from "vitest";
import {
  EngineeringKnowledgeGraph,
  KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES,
  assertKnowledgeIntelligenceSharedServices,
  assertNoKnowledgePrivateInfrastructure,
  drillDownPathFor,
  generateKnowledgeGroundedAnswer,
  hybridSearchNodes,
} from "../src/index";

describe("Phase 8G knowledge intelligence domain", () => {
  it("binds shared services without private stacks or ownership clones", () => {
    expect(() => assertKnowledgeIntelligenceSharedServices()).not.toThrow();
    expect(() =>
      assertNoKnowledgePrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateEmbeddingClient: false,
        storesDuplicateBusinessRecords: false,
      }),
    ).not.toThrow();
    expect(KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES).toContain("ai_context");
    expect(KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES).toContain("audit");
  });

  it("stores refs only and supports traversal, impact, and hybrid cited search", () => {
    const g = new EngineeringKnowledgeGraph();
    const scope = { tenantId: "t1", workspaceId: "w1" };
    g.upsertNode({
      refId: "doc-1",
      kind: "document",
      owner: "document_intelligence",
      title: "Valve leak procedure",
      snippet: "leak test valve",
      ...scope,
      drillDownPath: drillDownPathFor("document", "doc-1"),
      storesBusinessRecord: false,
    });
    g.upsertNode({
      refId: "find-1",
      kind: "finding",
      owner: "findings_intelligence",
      title: "Valve leak finding",
      snippet: "finding about valve leak",
      ...scope,
      drillDownPath: drillDownPathFor("finding", "find-1"),
      storesBusinessRecord: false,
    });
    g.link({
      edgeId: "e1",
      fromRefId: "find-1",
      toRefId: "doc-1",
      edgeType: "derived_from",
      ...scope,
    });
    expect(() => g.assertNoDuplicateOwnership()).not.toThrow();

    const neighbors = g.neighbors("find-1", scope, 1);
    expect(neighbors.nodes.some((n) => n.refId === "doc-1")).toBe(true);
    const impact = g.impactAnalysis("find-1", scope);
    expect(impact.dependsOn.some((n) => n.refId === "doc-1")).toBe(true);

    const search = hybridSearchNodes(g.listNodes(scope), {
      query: "valve leak",
      ...scope,
    }, new Map([["doc-1", 0.8]]));
    expect(search.hybrid).toBe(true);
    expect(search.duplicateOwnership).toBe(false);
    expect(search.hits.length).toBeGreaterThan(0);
    expect(search.hits[0]!.citations.length).toBeGreaterThan(0);
    expect(search.hits.some((h) => h.source === "hybrid")).toBe(true);

    const answer = generateKnowledgeGroundedAnswer({
      query: "valve leak",
      hits: search.hits,
      retrievalTraceId: search.retrievalTraceId,
    });
    expect(answer.usesPlatformAiRuntime).toBe(true);
    expect(answer.implementsPrivateAiClient).toBe(false);
    expect(answer.status).toBe("answered");
    expect(answer.citations.length).toBeGreaterThan(0);
  });

  it("rejects nodes that claim business record ownership", () => {
    const g = new EngineeringKnowledgeGraph();
    expect(() =>
      g.upsertNode({
        refId: "bad",
        kind: "document",
        owner: "document_intelligence",
        title: "Bad",
        tenantId: "t",
        workspaceId: "w",
        drillDownPath: "/x",
        storesBusinessRecord: true as false,
      }),
    ).toThrow(/business records/i);
  });
});
