import { describe, expect, it } from "vitest";
import { buildGroundedAnswer } from "../src/documents/grounded-answer";
import { DocumentIntelligenceError } from "../src/documents/errors";

describe("grounded answer citations", () => {
  it("requires citations for answered status", () => {
    expect(() =>
      buildGroundedAnswer({
        draftAnswer: "Design pressure is 10 bar.",
        answerStatus: "answered",
        confidence: 0.9,
        citations: [],
        retrievalTraceId: "trace-1",
      }),
    ).toThrow(DocumentIntelligenceError);
  });

  it("returns answered contracts with citations", () => {
    const result = buildGroundedAnswer({
      draftAnswer: "Design pressure is 10 bar.",
      answerStatus: "answered",
      confidence: 0.91,
      citations: [
        {
          engineeringDocumentId: "doc-1",
          revision: "A",
          excerpt: "Design pressure is 10 bar.",
          evidenceScore: 0.91,
          chunkId: "chunk-1",
          documentNumber: "SPEC-001",
          documentTitle: "Process Spec",
        },
      ],
      retrievalTraceId: "trace-2",
      promptVersion: "doc-answer-v1",
    });

    expect(result.answerStatus).toBe("answered");
    expect(result.citations).toHaveLength(1);
    expect(result.documentsUsed).toEqual(["doc-1"]);
  });

  it("allows abstention without citations", () => {
    const result = buildGroundedAnswer({
      answerStatus: "abstained",
      confidence: 0.1,
      citations: [],
      retrievalTraceId: "trace-3",
      warnings: ["below_threshold"],
    });
    expect(result.answerStatus).toBe("abstained");
    expect(result.citations).toEqual([]);
  });
});
