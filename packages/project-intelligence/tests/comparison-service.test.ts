import { describe, expect, it } from "vitest";
import { ProjectIntelligenceDocumentComparisonService } from "../src/documents/comparison-service";

describe("document revision comparison", () => {
  it("detects added and removed lines and always requires human review", () => {
    const result = new ProjectIntelligenceDocumentComparisonService().compare({
      engineeringDocumentId: "00000000-0000-4000-8000-00000000c6c8",
      baseRevision: "A",
      targetRevision: "B",
      baseText: "Design pressure 16 bar g\nMaterial ASTM A216",
      targetText: "Design pressure 20 bar g\nMaterial ASTM A216",
    });

    expect(result.requiresHumanReview).toBe(true);
    expect(result.changes.some((change) => change.kind === "removed" && change.excerpt.includes("16"))).toBe(true);
    expect(result.changes.some((change) => change.kind === "added" && change.excerpt.includes("20"))).toBe(true);
    expect(result.impactCandidates.length).toBeGreaterThan(0);
    expect(result.evidence.every((item) => item.engineeringDocumentId)).toBe(true);
  });
});
