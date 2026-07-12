import { describe, expect, it } from "vitest";
import {
  UnavailableLegacyDocumentAdapter,
  createLegacyDocumentAdapter,
} from "@rtb/project-intelligence/server";

describe("Phase 6C-2 legacy capability equivalence adapter", () => {
  it("is unavailable by default and never silently falls back", async () => {
    const adapter = createLegacyDocumentAdapter();
    const availability = await adapter.availability({
      correlationId: "eq-doc-1",
      timeoutMs: 1000,
    });
    expect(availability.available).toBe(false);
    expect(availability.reason).toBeTruthy();
    await expect(
      adapter.listDocuments({ correlationId: "eq-doc-1", timeoutMs: 1000 }),
    ).rejects.toThrow(/not configured|unavailable|Legacy/i);
  });

  it("supports an injected fixture adapter for equivalence harness samples", async () => {
    const fixture = {
      async availability() {
        return { available: true, correlationId: "eq" };
      },
      async listDocuments() {
        return [{ legacyDocumentId: "L1", title: "Spec", revision: "A", processingStatus: "ready" }];
      },
      async listChunks() {
        return [{ legacyChunkId: "C1", legacyDocumentId: "L1", content: "16 bar g", page: 1 }];
      },
      async listFindings() {
        return [{ legacyFindingId: "F1", legacyDocumentId: "L1", findingType: "missing_approval", title: "Approval" }];
      },
      async sampleAnswers() {
        return [
          { query: "design pressure", answerStatus: "answered", citationCount: 1, abstained: false },
          { query: "unknown", answerStatus: "abstained", citationCount: 0, abstained: true },
        ];
      },
    };
    const adapter = createLegacyDocumentAdapter(fixture);
    const samples = await adapter.sampleAnswers({ correlationId: "eq", timeoutMs: 1000 });
    expect(samples).toHaveLength(2);
    expect(samples[1]?.abstained).toBe(true);
    expect(new UnavailableLegacyDocumentAdapter()).toBeInstanceOf(UnavailableLegacyDocumentAdapter);
  });
});
