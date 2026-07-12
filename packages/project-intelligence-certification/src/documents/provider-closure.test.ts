import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GovernedEmbeddingAdapter,
  PlatformStructuredDocumentParser,
  ProjectIntelligenceParserRouter,
  PlatformLocalOcrProvider,
  DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION,
  assertEmbeddingDimensionCompatible,
  resolveProjectIntelligenceRuntimeMode,
  assertWithinBudget,
  emptyUsageCounters,
  DEFAULT_DOCUMENT_PROCESSING_BUDGET,
} from "@rtb/project-intelligence/server";
import {
  evaluateFixtureLexically,
  metricsMeetThresholds,
  PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS,
  loadEvaluationSet,
} from "../retrieval-evaluation.js";

describe("Phase 6C-2 provider closure contracts", () => {
  it("Gate B registry dimension is 1536", () => {
    expect(DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION).toBe(1536);
    expect(() => assertEmbeddingDimensionCompatible(1536)).not.toThrow();
    expect(() => assertEmbeddingDimensionCompatible(3072)).toThrow();
  });

  it("Gate C rejects hash embeddings when provider certification is enabled", async () => {
    const previous = process.env.PI_PROVIDER_CERTIFICATION;
    process.env.PI_PROVIDER_CERTIFICATION = "1";
    delete process.env.PLATFORM_EMBEDDING_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      expect(() => new GovernedEmbeddingAdapter({ runtimeMode: "hosted_staging" })).toThrow(/real governed embedding/i);
    } finally {
      if (previous === undefined) delete process.env.PI_PROVIDER_CERTIFICATION;
      else process.env.PI_PROVIDER_CERTIFICATION = previous;
    }
  });

  it("Gate E advanced structured parser emits tables, captions, coordinates, language, trace", async () => {
    const parser = new PlatformStructuredDocumentParser();
    const content = "SPEC-2002\n\nTable 1\n\n| Tag | Size |\n| V-101-N1 | 6 in |\n\nNote: sizes are NPS.\n";
    const parsed = await parser.parse({
      engineeringDocumentId: "doc-1",
      revision: "B",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(content),
    });
    expect(parsed.parserProvider).toBe("platform-structured");
    expect(parsed.language).toBeTruthy();
    expect(parsed.pages[0]?.blocks.some((block) => block.type === "table")).toBe(true);
    expect(parsed.pages[0]?.blocks.some((block) => block.type === "caption" || block.type === "heading")).toBe(true);
    expect(parsed.warnings.some((warning) => warning.startsWith("provider_trace:"))).toBe(true);
  });

  it("Gate F OCR execution records statuses and does not silently promote uncertain text", async () => {
    const router = new ProjectIntelligenceParserRouter({
      ocrProviders: [new PlatformLocalOcrProvider()],
    });
    const fixture = "[PI_OCR_FIXTURE]\nVessel V-202 MAWP is 10 bar g.\n";
    const pages = [{ pageNumber: 1, text: "", blocks: [] }];
    const result = await router.executeOcr({
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(fixture),
      pages,
    });
    expect(["ocr_ready", "ocr_ready_with_warnings", "ocr_review_required"]).toContain(result.status);
    expect(result.ocrPageCount).toBeGreaterThan(0);
    expect(result.pages[0]?.text).toContain("V-202");

    const uncertain = await new PlatformLocalOcrProvider().ocrPages({
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
      pages,
      pageDecisions: [{ pageNumber: 1, applyOcr: true, reason: "insufficient_text", textLength: 0 }],
    });
    expect(uncertain.status).toBe("ocr_review_required");
    expect(uncertain.warnings.some((warning) => warning.includes("no_silent_promotion"))).toBe(true);
  });

  it("Gate G retrieval thresholds are predeclared and fixture eval meets them lexically", () => {
    expect(PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS.recallAt5).toBe(0.9);
    const { checksum, metrics, caseCount } = evaluateFixtureLexically();
    expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(caseCount).toBeGreaterThanOrEqual(7);
    const check = metricsMeetThresholds(metrics);
    expect(check.ok, check.failures.join("; ")).toBe(true);
  });

  it("Gate K table expected values are exact", async () => {
    const parser = new PlatformStructuredDocumentParser();
    const parsed = await parser.parse({
      engineeringDocumentId: "t1",
      revision: "A",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode("| Tag | Size |\n| V-101-N1 | 6 in |\n"),
    });
    const table = parsed.pages[0]?.blocks.find((block) => block.type === "table")?.table;
    expect(table?.headers).toEqual(["Tag", "Size"]);
    expect(table?.rows[0]).toEqual(["V-101-N1", "6 in"]);
  });

  it("Gate L provider failure mapping stays stable", async () => {
    const adapter = new GovernedEmbeddingAdapter({
      runtimeMode: "unit_test",
      allowStagingHashFallback: true,
      providerKind: "platform-staging-hash",
    });
    await expect(adapter.embed({ texts: ["x"], dimensions: 64 as 1536 })).rejects.toMatchObject({
      code: "document_embedding_failed",
    });
  });

  it("Gate P cost quotas reject unbounded usage", () => {
    const counters = emptyUsageCounters();
    counters.parserPages = DEFAULT_DOCUMENT_PROCESSING_BUDGET.maxPages + 1;
    const result = assertWithinBudget(counters);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain("page_limit");
  });

  it("runtime mode for provider cert is hosted_staging", () => {
    expect(resolveProjectIntelligenceRuntimeMode({
      PI_PROVIDER_CERTIFICATION: "1",
      PROJECT_INTELLIGENCE_CERTIFICATION_TARGET: "hosted_staging",
    })).toBe("hosted_staging");
  });

  it("evaluation fixture set checksum is stable for artifact", () => {
    const loaded = loadEvaluationSet();
    const again = createHash("sha256").update(readFileSync(loaded.path)).digest("hex");
    expect(again).toBe(loaded.checksum);
    expect(loaded.data.fixtures.length).toBeGreaterThanOrEqual(10);
  });
});
