import { describe, expect, it } from "vitest";
import { DeterministicLocalEmbeddingAdapter } from "../src/documents/embedding-adapter";
import { InMemoryDocumentIndexAdapter } from "../src/documents/index-adapter";
import { ProjectIntelligenceDocumentRetrievalService } from "../src/documents/retrieval-service";
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
    contentHash: "hash",
    sectionPath: "4.2",
    pageStart: 1,
    pageEnd: 1,
    blockType: "paragraph",
    ...partial,
  };
}

describe("hybrid retrieval filters", () => {
  it("never returns cross-tenant or cross-workspace chunks", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const allowed = chunk({
      stableChunkId: "ok",
      content: "Design pressure is 16 bar g",
    });
    const foreign = chunk({
      stableChunkId: "bad",
      content: "Design pressure is 16 bar g",
      tenantId: "other-tenant",
      workspaceId: "other-workspace",
      engineeringDocumentId: "d2",
    });
    const embedding = await embedder.embed({ texts: [allowed.content, foreign.content] });
    await index.upsert([
      { ...allowed, embedding: embedding.embeddings[0] },
      { ...foreign, embedding: embedding.embeddings[1] },
    ]);

    const service = new ProjectIntelligenceDocumentRetrievalService(index, embedder);
    const result = await service.retrieve(
      {
        tenantId: "t1",
        workspaceId: "w1",
        allowedProjectIds: ["p1"],
        authorized: true,
      },
      {
        query: "design pressure",
        limit: 10,
        scoreThreshold: 0.01,
      },
    );

    expect(result.hits.every((hit) => hit.chunk.tenantId === "t1" && hit.chunk.workspaceId === "w1")).toBe(true);
    expect(result.hits.some((hit) => hit.chunk.stableChunkId === "bad")).toBe(false);
  });
});
