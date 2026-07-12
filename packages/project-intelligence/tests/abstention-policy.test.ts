import { describe, expect, it } from "vitest";
import { detectConflictingCitations, evaluateAbstention } from "../src/documents/abstention";

describe("abstention policy", () => {
  it("abstains when evidence is below threshold", () => {
    const decision = evaluateAbstention({
      authorized: true,
      processingStatus: "ready",
      citations: [
        {
          engineeringDocumentId: "doc-1",
          revision: "A",
          excerpt: "weak match",
          evidenceScore: 0.1,
          chunkId: "c1",
        },
      ],
      maxScore: 0.1,
      scoreThreshold: 0.35,
      confidence: 0.1,
      confidenceThreshold: 0.5,
    });
    expect(decision).toMatchObject({ shouldAbstain: true, answerStatus: "abstained", reason: "below_threshold" });
  });

  it("marks incomplete processing as document_not_ready", () => {
    const decision = evaluateAbstention({
      authorized: true,
      processingStatus: "embedding",
      citations: [
        {
          engineeringDocumentId: "doc-1",
          revision: "A",
          excerpt: "partial",
          evidenceScore: 0.9,
          chunkId: "c1",
        },
      ],
      maxScore: 0.9,
      scoreThreshold: 0.35,
      confidence: 0.9,
      confidenceThreshold: 0.5,
    });
    expect(decision.answerStatus).toBe("document_not_ready");
  });

  it("detects conflicting excerpts for the same section", () => {
    expect(
      detectConflictingCitations([
        {
          engineeringDocumentId: "doc-1",
          revision: "A",
          sectionPath: "Pressure",
          excerpt: "10 bar",
          evidenceScore: 0.8,
          chunkId: "a",
        },
        {
          engineeringDocumentId: "doc-1",
          revision: "B",
          sectionPath: "Pressure",
          excerpt: "16 bar",
          evidenceScore: 0.8,
          chunkId: "b",
        },
      ]),
    ).toBe(true);
  });
});
