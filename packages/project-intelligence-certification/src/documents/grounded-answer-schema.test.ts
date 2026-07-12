import { describe, expect, it } from "vitest";
import { ANSWER_STATUSES, type GroundedAnswerContract } from "@rtb/project-intelligence";

function assertGroundedAnswerContract(value: GroundedAnswerContract): void {
  expect(ANSWER_STATUSES).toContain(value.answerStatus);
  expect(value.confidence).toBeGreaterThanOrEqual(0);
  expect(value.confidence).toBeLessThanOrEqual(1);
  expect(value.retrievalTraceId.length).toBeGreaterThan(0);
  expect(Array.isArray(value.citations)).toBe(true);
  expect(Array.isArray(value.evidence)).toBe(true);
  expect(Array.isArray(value.documentsUsed)).toBe(true);
  expect(Array.isArray(value.processingVersions)).toBe(true);
  expect(Array.isArray(value.warnings)).toBe(true);
  expect(value.generatedAt.length).toBeGreaterThan(0);
  if (value.answerStatus === "answered") {
    expect(value.answer?.length ?? 0).toBeGreaterThan(0);
    expect(value.citations.length, "factual answers require citations").toBeGreaterThan(0);
    for (const citation of value.citations) {
      expect(citation.engineeringDocumentId).toBeTruthy();
      expect(citation.revision).toBeTruthy();
      expect(citation.excerpt).toBeTruthy();
      expect(citation.chunkId).toBeTruthy();
    }
  }
}

describe("Phase 6C-2 grounded answer schema", () => {
  it("requires citations for factual answered responses", () => {
    const answered: GroundedAnswerContract = {
      answer: "Design pressure is 16 bar g",
      answerStatus: "answered",
      confidence: 0.9,
      citations: [{
        engineeringDocumentId: "doc-1",
        revision: "A",
        excerpt: "Design pressure is 16 bar g",
        evidenceScore: 0.91,
        chunkId: "chunk-1",
      }],
      evidence: [{
        engineeringDocumentId: "doc-1",
        revision: "A",
        excerpt: "Design pressure is 16 bar g",
        evidenceScore: 0.91,
        chunkId: "chunk-1",
      }],
      documentsUsed: ["doc-1"],
      retrievalTraceId: "trace-1",
      processingVersions: ["1"],
      warnings: [],
      generatedAt: new Date().toISOString(),
    };
    assertGroundedAnswerContract(answered);
  });

  it("accepts abstained responses without answer text", () => {
    const abstained: GroundedAnswerContract = {
      answerStatus: "abstained",
      confidence: 0.1,
      citations: [],
      evidence: [],
      documentsUsed: [],
      retrievalTraceId: "trace-2",
      processingVersions: ["1"],
      warnings: ["insufficient evidence"],
      generatedAt: new Date().toISOString(),
    };
    assertGroundedAnswerContract(abstained);
    expect(abstained.answer).toBeUndefined();
  });

  it("rejects answered payloads that omit citations", () => {
    const invalid: GroundedAnswerContract = {
      answer: "unsupported claim",
      answerStatus: "answered",
      confidence: 0.99,
      citations: [],
      evidence: [],
      documentsUsed: ["doc-1"],
      retrievalTraceId: "trace-3",
      processingVersions: ["1"],
      warnings: [],
      generatedAt: new Date().toISOString(),
    };
    expect(() => assertGroundedAnswerContract(invalid)).toThrow(/citations/i);
  });
});
