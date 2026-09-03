import { describe, expect, it } from "vitest";
import { NativeTextDocumentParser } from "../src/documents/parser";
import { chunkParsedDocument } from "../src/documents/chunking";
import { extractStandardReferences, segmentEngineeringPage } from "../src/documents/engineering-text";
import { mapDocumentIngestionPresentation } from "../src/documents/presentation-state";
import { isAuthorizedDocumentObjectPath } from "../src/documents/storage-fetch";

const FIXTURE = `AS/NZS 1252:1996
High-strength steel bolts with associated nuts and washers

Section 3.4 Test Methods

The test methods for determining the mechanical properties of high-strength nuts shall be in accordance with AS/NZS 4291.2.

Figure 2.3 Tolerance on Straightness of High-Strength Steel Bolts

t = 2(0.0025 l' + 0.05)
`;

describe("engineering document intelligence", () => {
  it("splits single-newline clause headings the way PDF text often arrives", () => {
    const page = [
      "AS 1755-1986",
      "4.2 ACCESS",
      "4.2.1 Minimum platform width",
      "The minimum width of a platform to access the conveyor shall be 600 mm.",
      "4.2.3 Crossovers",
      "Crossover provisions shall comply with 7.2.2.",
    ].join("\n");
    const blocks = segmentEngineeringPage(page, 11);
    expect(blocks.some((block) => /4\.2\.1/.test(block.sectionPath ?? block.text))).toBe(true);
    expect(blocks.some((block) => /4\.2\.3/.test(block.sectionPath ?? block.text))).toBe(true);
    expect(blocks.every((block) => !/5 AS 1755/i.test(block.sectionPath ?? ""))).toBe(true);
  });

  it("does not treat standard running headers as section paths", () => {
    const page = [
      "AS 1755—1986",
      "4.2 ACCESS",
      "AND MAINTENANCE",
      "4.2.1 Minimum platform width",
      "The minimum width of a platform to access the conveyor shall be 600 mm.",
      "5 AS 1755—1986",
    ].join("\n");
    const blocks = segmentEngineeringPage(page, 11);
    expect(blocks.some((block) => block.sectionPath === "4.2.1" || block.sectionPath?.startsWith("4.2.1"))).toBe(true);
    expect(blocks.some((block) => block.sectionPath === "AND MAINTENANCE")).toBe(false);
  });

  it("segments clauses, figures, and equations without naive character splits", () => {
    const blocks = segmentEngineeringPage(FIXTURE, 15);
    expect(blocks.some((block) => block.type === "heading" && /3\.4/.test(block.text))).toBe(true);
    expect(blocks.some((block) => block.type === "image" && /Figure 2\.3/.test(block.text))).toBe(true);
    expect(blocks.some((block) => /t\s*=\s*2/.test(block.text))).toBe(true);
    expect(extractStandardReferences(FIXTURE)).toEqual(expect.arrayContaining(["AS/NZS 1252", "AS/NZS 4291.2"]));
  });

  it("segments Windows CRLF documents into the same engineering units", async () => {
    const parser = new NativeTextDocumentParser();
    const parsed = await parser.parse({
      engineeringDocumentId: "doc-crlf",
      revision: "1996",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(FIXTURE.replace(/\n/g, "\r\n")),
    });
    expect(parsed.pages[0]?.blocks.length).toBeGreaterThan(1);
    const chunks = chunkParsedDocument(parsed, {
      tenantId: "t1",
      workspaceId: "w1",
      engineeringDocumentId: "doc-crlf",
      revision: "1996",
      processingVersion: "1",
    });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.some((chunk) => /3\.4/.test(chunk.sectionPath ?? chunk.content))).toBe(true);
    expect(chunks.some((chunk) => /Figure 2\.3/.test(chunk.content))).toBe(true);
  });

  it("keeps figure units atomic and provenance-complete after chunking", async () => {
    const parser = new NativeTextDocumentParser();
    const parsed = await parser.parse({
      engineeringDocumentId: "doc-1",
      revision: "1996",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(FIXTURE),
    });
    const chunks = chunkParsedDocument(parsed, {
      tenantId: "t1",
      workspaceId: "w1",
      engineeringProjectId: "p1",
      engineeringDocumentId: "doc-1",
      revision: "1996",
      processingVersion: "1",
    });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.tenantId === "t1" && chunk.workspaceId === "w1")).toBe(true);
    expect(chunks.every((chunk) => chunk.engineeringDocumentId === "doc-1")).toBe(true);
    const figure = chunks.find((chunk) => chunk.blockType === "image" || /Figure 2\.3/.test(chunk.content));
    expect(figure).toBeTruthy();
    expect(figure?.pageStart).toBe(1);
    expect(figure?.metadata?.figureAuthoritative).toBe(false);
    expect(figure?.content).toMatch(/t\s*=\s*2/);
  });

  it("preserves page numbers across form-feed pages", async () => {
    const parser = new NativeTextDocumentParser();
    const parsed = await parser.parse({
      engineeringDocumentId: "doc-pages",
      revision: "A",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode("Section 3.4 Test Methods\n\nIn accordance with AS/NZS 4291.2.\fFigure 2.3\n\nt = 2(0.0025 l' + 0.05)"),
    });
    expect(parsed.pages).toHaveLength(2);
    expect(parsed.pages[0]?.pageNumber).toBe(1);
    expect(parsed.pages[1]?.pageNumber).toBe(2);
    const chunks = chunkParsedDocument(parsed, {
      tenantId: "t1",
      workspaceId: "w1",
      engineeringDocumentId: "doc-pages",
      revision: "A",
      processingVersion: "1",
    });
    expect(chunks.some((chunk) => chunk.pageStart === 2)).toBe(true);
  });

  it("never reports metadata-only documents as AI searchable", () => {
    const hidden = mapDocumentIngestionPresentation({
      hasSourceFile: true,
      processingStatus: null,
      chunkCount: 0,
    });
    expect(hidden.state).toBe("metadata_only");
    expect(hidden.aiSearchable).toBe(false);

    const indexed = mapDocumentIngestionPresentation({
      hasSourceFile: true,
      processingStatus: "ready",
      chunkCount: 8,
      pagesIndexed: 15,
    });
    expect(indexed.state).toBe("indexed");
    expect(indexed.aiSearchable).toBe(true);
  });

  it("rejects storage paths outside tenant/workspace/document scope", () => {
    expect(isAuthorizedDocumentObjectPath("t1/w1/d1/A/file.pdf", "t1", "w1", "d1")).toBe(true);
    expect(isAuthorizedDocumentObjectPath("other/w1/d1/A/file.pdf", "t1", "w1", "d1")).toBe(false);
    expect(isAuthorizedDocumentObjectPath("t1/w1/../secret.pdf", "t1", "w1", "d1")).toBe(false);
  });
});
