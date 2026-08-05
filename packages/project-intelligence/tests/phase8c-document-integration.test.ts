import { describe, expect, it } from "vitest";
import {
  assertDocumentIntelligenceSharedServices,
  assertFindingsHandoffCannotMutateCore,
  applyDocumentReviewAction,
  createDocumentFindingsHandoff,
  DOCUMENT_REVIEW_ACTIONS,
} from "../src/index";

describe("Phase 8C document intelligence domain", () => {
  it("binds shared services", () => {
    expect(() => assertDocumentIntelligenceSharedServices()).not.toThrow();
  });

  it("creates findings handoff without Core mutation", () => {
    const handoff = createDocumentFindingsHandoff({
      id: "cand-1",
      findingType: "conflicting_requirement",
      title: "Conflict",
      confidence: 0.8,
      evidence: [
        {
          engineeringDocumentId: "doc-1",
          revision: "B",
          excerpt: "must",
          evidenceScore: 0.9,
          chunkId: "ch-1",
        },
      ],
      engineeringDocumentId: "doc-1",
      traceId: "trace-1",
    });
    expect(() => assertFindingsHandoffCannotMutateCore(handoff)).not.toThrow();
  });

  it("covers all review actions", () => {
    for (const action of DOCUMENT_REVIEW_ACTIONS) {
      const result = applyDocumentReviewAction({
        action,
        reviewerUserId: "reviewer-1",
        comment: "note",
        assignedToUserId: "reviewer-2",
        evidenceIds: ["e1"],
      });
      expect(result.coreMutationApplied).toBe(false);
      expect(result.decidedBy).toBe("reviewer-1");
    }
  });
});
