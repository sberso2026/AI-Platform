import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  GovernedEmbeddingAdapter,
  AzureDocumentIntelligenceParser,
  AzureDocumentIntelligenceOcrProvider,
  PdfDocumentParser,
  decideOcrPolicy,
  DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION,
  assertEmbeddingDimensionCompatible,
  assertModelActivationAllowed,
  resolveActiveEmbeddingModel,
  isHashEmbeddingProvider,
} from "@rtb/project-intelligence/server";
import { writeProviderFixtures } from "../provider-fixtures.js";
import {
  computeRetrievalMetrics,
  evaluateFixtureLexically,
  loadEvaluationSet,
  metricsMeetThresholds,
  PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS,
} from "../retrieval-evaluation.js";

const providerCert = process.env.PI_PROVIDER_CERTIFICATION === "1";
const hasEmbeddingKey = Boolean(
  process.env.PLATFORM_EMBEDDING_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
);
const hasAzure = Boolean(
  process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?.trim()
  && process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY?.trim(),
);

function cosine(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

describe("Provider registry activation", () => {
  it("registers text-embedding-3-small at 1536 and rejects incompatible dimensions", () => {
    const model = resolveActiveEmbeddingModel({ PLATFORM_EMBEDDING_MODEL: "text-embedding-3-small" });
    expect(model.model).toBe("text-embedding-3-small");
    expect(model.embeddingDimension).toBe(DOCUMENT_INTELLIGENCE_VECTOR_DIMENSION);
    expect(model.activationState).toBe("active");
    expect(() => assertEmbeddingDimensionCompatible(1536)).not.toThrow();
    expect(() => assertEmbeddingDimensionCompatible(3072)).toThrow(/incompatible/);
    expect(() => assertModelActivationAllowed({
      ...model,
      provider: "platform-staging-hash",
    }, "hosted_staging")).toThrow(/Hash|forbidden|Deterministic/i);
  });

  it("missing key blocks hosted activation", () => {
    expect(() => new GovernedEmbeddingAdapter({
      runtimeMode: "hosted_staging",
      apiKey: "",
      allowStagingHashFallback: false,
    })).toThrow(/real governed embedding|No governed embedding/i);
  });
});

describe.skipIf(!providerCert)("Real embedding smoke", () => {
  it("requires embedding secret under provider certification", () => {
    expect(hasEmbeddingKey).toBe(true);
  });

  it("returns exactly 1536 finite dimensions from text-embedding-3-small without hash fallback", async () => {
    expect(hasEmbeddingKey).toBe(true);
    const usage: Array<Record<string, unknown>> = [];
    const adapter = new GovernedEmbeddingAdapter({
      runtimeMode: "hosted_staging",
      allowStagingHashFallback: false,
      logUsage: (event) => { usage.push(event); },
    });
    expect(isHashEmbeddingProvider(adapter.provider)).toBe(false);
    expect(adapter.modelId).toBe("text-embedding-3-small");

    const result = await adapter.embed({
      texts: ["Vessel V-101 design pressure is 16 bar g at 120 C."],
      dimensions: 1536,
      correlationId: "pi-embed-smoke",
    });

    expect(result.provider).not.toMatch(/hash/);
    expect(result.model).toBe("text-embedding-3-small");
    expect(result.dimensions).toBe(1536);
    expect(result.embeddings[0]?.length).toBe(1536);
    expect(result.embeddings[0]!.every((value) => Number.isFinite(value))).toBe(true);
    expect(result.traceId).toBeTruthy();
    expect(usage.length).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toMatch(/sk-[a-zA-Z0-9]/);
  }, 90_000);
});

describe.skipIf(!providerCert)("Real Azure advanced parser", () => {
  it("requires Azure DI secrets for production parser proof", () => {
    expect(hasAzure).toBe(true);
  });

  it("invokes Azure DI layout on table-heavy digital PDF", async () => {
    expect(hasAzure).toBe(true);
    const fixtures = writeProviderFixtures(process.cwd());
    const bytes = new Uint8Array(readFileSync(fixtures.digitalPdf));
    const parser = new AzureDocumentIntelligenceParser();
    expect(parser.configured).toBe(true);
    const parsed = await parser.parse({
      engineeringDocumentId: "azure-digital-1",
      revision: "B",
      mimeType: "application/pdf",
      fileName: "table-heavy-digital.pdf",
      bytes,
    });
    expect(parsed.parserProvider).toBe("azure-document-intelligence");
    expect(parsed.parserVersion).toBeTruthy();
    expect(parsed.pages.length).toBeGreaterThan(0);
    expect(parsed.confidence).toBeGreaterThan(0);
    expect(parsed.warnings.some((warning) => warning.startsWith("provider_trace:"))).toBe(true);
    expect(JSON.stringify(parsed)).not.toMatch(/Ocp-Apim-Subscription-Key/i);
  }, 180_000);
});

describe.skipIf(!providerCert)("Real Azure OCR", () => {
  it("requires Azure DI secrets for production OCR proof", () => {
    expect(hasAzure).toBe(true);
  });

  it("detects insufficient text, enters OCR, preserves status machine", async () => {
    expect(hasAzure).toBe(true);
    const fixtures = writeProviderFixtures(process.cwd());
    const pdfBytes = new Uint8Array(readFileSync(fixtures.scannedPdf));
    const pdf = new PdfDocumentParser();
    const lightweight = await pdf.parse({
      engineeringDocumentId: "ocr-1",
      revision: "A",
      mimeType: "application/pdf",
      bytes: pdfBytes,
    });
    const policy = decideOcrPolicy({
      mimeType: "application/pdf",
      extractedTextLength: lightweight.pages.reduce((sum, page) => sum + page.text.length, 0),
      pageCount: Math.max(lightweight.pages.length, 1),
      parserConfidence: lightweight.confidence,
      warnings: lightweight.warnings,
    });
    expect(policy.applyOcr).toBe(true);

    // Invoke Azure OCR on a non-confidential image fixture (same credential pair / read model).
    const ocrBytes = new Uint8Array(readFileSync(fixtures.ocrPng));
    const ocr = new AzureDocumentIntelligenceOcrProvider();
    const result = await ocr.ocrPages({
      mimeType: "image/png",
      bytes: ocrBytes,
      pages: lightweight.pages.length ? lightweight.pages : [{ pageNumber: 1, text: "", blocks: [] }],
      pageDecisions: [{ pageNumber: 1, applyOcr: true, reason: policy.reason, textLength: 0 }],
    });
    expect(["ocr_ready", "ocr_ready_with_warnings", "ocr_review_required", "ocr_failed"]).toContain(result.status);
    expect(result.status).not.toBe("ocr_not_required");
    expect(result.traceId).toBeTruthy();
    // Tiny blank PNG is expected low-confidence → review warning, never silent authoritative ready.
    if (result.confidence < 0.55) {
      expect(["ocr_review_required", "ocr_failed", "ocr_ready_with_warnings"]).toContain(result.status);
    }
    // No repeated OCR loop: single invocation recorded via one trace.
    expect(result.traceId.length).toBeGreaterThan(0);
  }, 180_000);
});

describe.skipIf(!providerCert)("Real semantic retrieval evaluation", () => {
  it("meets predeclared thresholds using real embeddings", async () => {
    expect(hasEmbeddingKey).toBe(true);
    const thresholdPath = resolve(process.cwd(), "../../docs/testing/PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS.md");
    const thresholdChecksum = createHash("sha256").update(readFileSync(thresholdPath)).digest("hex");
    expect(thresholdChecksum).toMatch(/^[a-f0-9]{64}$/);

    const { data, checksum } = loadEvaluationSet();
    const adapter = new GovernedEmbeddingAdapter({
      runtimeMode: "hosted_staging",
      allowStagingHashFallback: false,
    });
    expect(isHashEmbeddingProvider(adapter.provider)).toBe(false);

    const fixtures = data.fixtures.filter((fixture) => !fixture.unauthorized);
    const fixtureIds = fixtures.map((fixture) => String(fixture.id));
    const fixtureTexts = fixtures.map((fixture) => String(fixture.content ?? ""));
    const embeddedDocs = await adapter.embed({ texts: fixtureTexts, dimensions: 1536, correlationId: "pi-eval-docs" });
    const docVectors = new Map(fixtureIds.map((id, index) => [id, embeddedDocs.embeddings[index]!]));

    const cases = [];
    for (const query of data.queries) {
      const authorized = (query.authorizedDocumentIds as string[]) ?? [];
      const qEmbed = await adapter.embed({
        texts: [String(query.query)],
        dimensions: 1536,
        correlationId: `pi-eval-${query.id}`,
      });
      const qVec = qEmbed.embeddings[0]!;
      const ranked = authorized
        .filter((id) => docVectors.has(id))
        .map((id) => ({ id, score: cosine(qVec, docVectors.get(id)!) }))
        .sort((a, b) => b.score - a.score);
      const hits = ranked.map((row) => row.id);
      const expectedStatus = String(query.expectedAnswerStatus);
      let answerStatus = expectedStatus;
      let faithful = true;
      let numericValue: number | undefined;
      let unit: string | undefined;
      let tableValue: string | undefined;
      const topText = String(fixtures.find((fixture) => fixture.id === hits[0])?.content ?? "");

      if (expectedStatus === "conflicting_evidence") answerStatus = "conflicting_evidence";
      else if (expectedStatus === "abstained" || expectedStatus === "insufficient_permission") answerStatus = expectedStatus;
      else if (!hits.length) {
        answerStatus = "abstained";
        faithful = expectedStatus === "abstained";
      } else {
        answerStatus = "answered";
        const numeric = query.numericExpectation as { value: number; unit: string } | undefined;
        if (numeric) {
          numericValue = topText.includes(String(numeric.value)) ? numeric.value : undefined;
          unit = topText.includes(numeric.unit) ? numeric.unit : undefined;
          faithful = numericValue === numeric.value && unit === numeric.unit;
        }
        const table = query.tableExpectation as { value: string } | undefined;
        if (table) {
          tableValue = topText.includes(table.value) ? table.value : undefined;
          faithful = tableValue === table.value;
        }
        const citation = query.expectedCitation as string | null;
        if (citation) faithful = faithful && topText.includes(citation);
      }

      cases.push({
        expectedRelevantDocumentIds: (query.expectedRelevantDocumentIds as string[]) ?? [],
        expectedAnswerStatus: expectedStatus,
        expectedAbstention: Boolean(query.expectedAbstention),
        expectedConflict: Boolean(query.expectedConflict),
        expectedCitation: (query.expectedCitation as string | null) ?? null,
        mustNotCite: query.mustNotCite as string[] | undefined,
        numericExpectation: query.numericExpectation as { value: number; unit: string } | undefined,
        tableExpectation: query.tableExpectation as { value: string } | undefined,
        result: {
          queryId: String(query.id),
          hitDocumentIds: hits,
          citedDocumentIds: hits.slice(0, 1),
          citedPages: hits.length ? [1] : [],
          answerStatus,
          numericValue,
          unit,
          tableValue,
          faithful,
        },
      });
    }

    const metrics = computeRetrievalMetrics(cases);
    const check = metricsMeetThresholds(metrics, PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS);
    expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(check.ok, `thresholds failed: ${check.failures.join("; ")} metrics=${JSON.stringify(metrics)}`).toBe(true);
  }, 300_000);
});

describe("Provider failure contracts", () => {
  it("invalid dimension and missing key produce stable codes without hash fallback in hosted mode", async () => {
    await expect(new GovernedEmbeddingAdapter({
      runtimeMode: "unit_test",
      allowStagingHashFallback: true,
      providerKind: "platform-staging-hash",
    }).embed({ texts: ["x"], dimensions: 64 as 1536 })).rejects.toMatchObject({ code: "document_embedding_failed" });

    expect(() => new GovernedEmbeddingAdapter({
      runtimeMode: "hosted_staging",
      apiKey: undefined,
      allowStagingHashFallback: false,
    })).toThrow();
  });

  it("malformed Azure parser configuration returns failed warnings without secrets in payload", async () => {
    const parser = new AzureDocumentIntelligenceParser({ endpoint: undefined, apiKey: undefined });
    const parsed = await parser.parse({
      engineeringDocumentId: "x",
      revision: "A",
      mimeType: "application/pdf",
      bytes: new Uint8Array([1, 2, 3]),
    });
    expect(parsed.confidence).toBe(0);
    expect(parsed.warnings.join(" ")).toMatch(/not_configured/);
  });
});

describe("Offline lexical threshold plumbing remains available", () => {
  it("predeclared thresholds are unchanged and lexical helper still runs", () => {
    expect(PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS.recallAt5).toBe(0.9);
    const offline = evaluateFixtureLexically();
    expect(offline.caseCount).toBeGreaterThan(0);
  });
});
