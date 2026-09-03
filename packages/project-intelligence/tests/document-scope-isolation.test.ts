import { describe, expect, it } from "vitest";
import { ProjectIntelligenceDocumentRetrievalService } from "../src/documents/retrieval-service";
import { DeterministicLocalEmbeddingAdapter } from "../src/documents/embedding-adapter";
import { InMemoryDocumentIndexAdapter } from "../src/documents/index-adapter";
import type { DocumentChunk } from "../src/documents/types";

function chunk(partial: Partial<DocumentChunk> & Pick<DocumentChunk, "stableChunkId" | "content">): DocumentChunk {
  return {
    id: partial.stableChunkId,
    tenantId: "t1",
    workspaceId: "w1",
    engineeringDocumentId: "d1",
    engineeringProjectId: "p1",
    revision: "A",
    processingVersion: "1",
    chunkIndex: 0,
    contentHash: `hash-${partial.stableChunkId}`,
    sectionPath: "3.4",
    pageStart: 1,
    pageEnd: 1,
    blockType: "paragraph",
    ...partial,
  };
}

describe("document retrieval isolation and fallback", () => {
  it("returns zero hits for another tenant, workspace, project, or document", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const allowed = chunk({ stableChunkId: "ok", content: "Section 3.4 test methods AS/NZS 4291.2" });
    const foreignTenant = chunk({
      stableChunkId: "other-tenant",
      content: "Section 3.4 test methods AS/NZS 4291.2",
      tenantId: "t-other",
    });
    const foreignWorkspace = chunk({
      stableChunkId: "other-ws",
      content: "Section 3.4 test methods AS/NZS 4291.2",
      workspaceId: "w-other",
    });
    const foreignProject = chunk({
      stableChunkId: "other-project",
      content: "Section 3.4 test methods AS/NZS 4291.2",
      engineeringProjectId: "p-other",
      engineeringDocumentId: "d-other",
    });
    const embedding = await embedder.embed({
      texts: [allowed.content, foreignTenant.content, foreignWorkspace.content, foreignProject.content],
    });
    await index.upsert([
      { ...allowed, embedding: embedding.embeddings[0] },
      { ...foreignTenant, embedding: embedding.embeddings[1] },
      { ...foreignWorkspace, embedding: embedding.embeddings[2] },
      { ...foreignProject, embedding: embedding.embeddings[3] },
    ]);
    const service = new ProjectIntelligenceDocumentRetrievalService(index, embedder);

    const tenantResult = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "test methods", scoreThreshold: 0.01 },
    );
    expect(tenantResult.hits.every((hit) => hit.chunk.tenantId === "t1" && hit.chunk.workspaceId === "w1")).toBe(true);
    expect(tenantResult.hits.some((hit) => hit.chunk.stableChunkId === "other-tenant")).toBe(false);

    const documentResult = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "test methods", filters: { engineeringDocumentIds: ["d1"] }, scoreThreshold: 0.01 },
    );
    expect(documentResult.hits.every((hit) => hit.chunk.engineeringDocumentId === "d1")).toBe(true);

    const otherDoc = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "test methods", filters: { engineeringDocumentIds: ["missing-doc"] }, scoreThreshold: 0.01 },
    );
    expect(otherDoc.hits).toHaveLength(0);
  });

  it("keeps authorised document-scope lexical hits even when rank is below the default threshold", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const allowed = chunk({ stableChunkId: "low-rank", content: "Section 3.4 test methods shall be in accordance with AS/NZS 4291.2" });
    const embedding = await embedder.embed({ texts: [allowed.content] });
    await index.upsert([{ ...allowed, embedding: embedding.embeddings[0] }]);
    const originalLexical = index.lexicalSearch.bind(index);
    index.lexicalSearch = async (query, filter, limit) => {
      const hits = await originalLexical(query, filter, limit);
      return hits.map((hit) => ({ ...hit, score: 0 }));
    };
    const service = new ProjectIntelligenceDocumentRetrievalService(index, {
      embed: async () => {
        throw new Error("embedding unavailable");
      },
    });
    const result = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "test methods", filters: { engineeringDocumentIds: ["d1"] }, scoreThreshold: 0.35 },
    );
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits[0]?.chunk.stableChunkId).toBe("low-rank");
  });

  it("falls back to lexical retrieval when embeddings fail", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const allowed = chunk({ stableChunkId: "lex", content: "Tolerance on Straightness t = 2(0.0025 l' + 0.05)" });
    const embedding = await embedder.embed({ texts: [allowed.content] });
    await index.upsert([{ ...allowed, embedding: embedding.embeddings[0] }]);
    const service = new ProjectIntelligenceDocumentRetrievalService(index, {
      embed: async () => {
        throw new Error("embedding unavailable");
      },
    });
    const result = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "straightness tolerance", scoreThreshold: 0.01 },
    );
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.vectorAttempted).toBe(false);
    expect(result.lexicalHitCount).toBeGreaterThan(0);
  });

  it("ranks clause text over cover pages and abstains when distinctive terms are absent", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const cover = chunk({
      stableChunkId: "cover",
      content: "AS 1755-1986 Australian Standard Conveyors Design construction installation and operation Safety requirements",
      pageStart: 1,
    });
    const platform = chunk({
      stableChunkId: "platform",
      content: "4.1 GENERAL. Safe access platforms shall be provided. 4.2.1 Platforms to be provided. Permanent platforms not less than 600 mm wide shall be provided.",
      pageStart: 11,
      sectionPath: "4.2.1",
      chunkIndex: 40,
    });
    const crossover = chunk({
      stableChunkId: "crossover",
      content: "4.2.3 Crossovers. Where walkways are provided on both sides of a conveyor, crossovers or underpasses should be provided.",
      pageStart: 11,
      sectionPath: "4.2.3",
      chunkIndex: 41,
    });
    const loading = chunk({
      stableChunkId: "loading",
      content: "The design and construction of mobile conveyors must account for various loading conditions and forces to ensure stability under normal operating conditions.",
      pageStart: 8,
      sectionPath: "3.2",
      chunkIndex: 20,
    });
    const thickness = chunk({
      stableChunkId: "guard-thickness",
      content: "Sheet metal guards shall be not less than 1.5 mm thick. For mesh guards, 9 mm mesh shall be not less than 1.5 mm thick.",
      pageStart: 14,
      sectionPath: "5.2.1",
      chunkIndex: 50,
    });
    const speedControl = chunk({
      stableChunkId: "speed-control",
      content: "The design of conveyors powered by internal combustion engines must include a positive shut-off for speed control and a fire extinguisher.",
      pageStart: 20,
      sectionPath: "7.1",
      chunkIndex: 70,
    });
    await index.upsert([cover, platform, crossover, loading, thickness, speedControl]);
    const service = new ProjectIntelligenceDocumentRetrievalService(index, {
      embed: async () => {
        throw new Error("embedding unavailable");
      },
    });
    const width = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What is the minimum platform width to access the conveyor?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(width.hits[0]?.chunk.stableChunkId).toBe("platform");
    expect(width.citations[0]?.excerpt).toMatch(/600 mm/);
    expect(width.citations[0]?.excerpt).toMatch(/4\.2\.1/);

    const absent = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What is the allowable wind load on the mast arm?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(absent.hits).toHaveLength(0);

    const seismic = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What is the seismic design category for the control building?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(seismic.hits).toHaveLength(0);

    const aircraft = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What aircraft wing spar alloy is specified in this document?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(aircraft.hits).toHaveLength(0);

    const nuclear = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What nuclear containment wall thickness is required?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(nuclear.hits).toHaveLength(0);
  });

  it("collapses overlapping same-page same-clause citations", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const first = chunk({
      stableChunkId: "crossover-a",
      content: "4.2.3 Crossovers. Where walkways are provided on both sides of a conveyor, crossovers or underpasses should be provided at intervals.",
      pageStart: 11,
      sectionPath: "4.2.3",
      chunkIndex: 41,
    });
    const overlap = chunk({
      stableChunkId: "crossover-b",
      content: "crossovers or underpasses should be provided at intervals not exceeding 100 m. See also 7.2.2.",
      pageStart: 11,
      sectionPath: "4.2.3 Crossovers",
      chunkIndex: 42,
    });
    await index.upsert([first, overlap]);
    const service = new ProjectIntelligenceDocumentRetrievalService(index, {
      embed: async () => {
        throw new Error("embedding unavailable");
      },
    });
    const result = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "What is the requirement for conveyor crossover?",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    const crossoverCitations = result.citations.filter((citation) => /4\.2\.3/.test(citation.sectionPath ?? ""));
    expect(crossoverCitations.length).toBe(1);
  });

  it("collapses duplicate ingestions with the same content hash and reports unique rank margin", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const gold = chunk({
      stableChunkId: "gold-a",
      content: "Sheet metal guards shall be not less than 1.5 mm thick.",
      pageStart: 14,
      contentHash: "same-hash",
    });
    const copy = chunk({
      stableChunkId: "gold-b",
      content: "Sheet metal guards shall be not less than 1.5 mm thick.",
      pageStart: 14,
      contentHash: "same-hash",
      chunkIndex: 2,
    });
    const next = chunk({
      stableChunkId: "placement",
      content: "Guard placement distances differ for mesh openings above 9 mm.",
      pageStart: 15,
      sectionPath: "5.2.3",
      contentHash: "other-hash",
      chunkIndex: 3,
    });
    await index.upsert([gold, copy, next]);
    const service = new ProjectIntelligenceDocumentRetrievalService(index, {
      embed: async () => {
        throw new Error("embedding unavailable");
      },
    });
    const result = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      {
        query: "what is the minimum sheet metal guard thickness",
        filters: { engineeringDocumentIds: ["d1"] },
        scoreThreshold: 0,
      },
    );
    expect(result.hits.filter((hit) => /1\.5 mm/.test(hit.chunk.content))).toHaveLength(1);
    expect(result.rank1Margin).toBeGreaterThan(0);
  });
});
