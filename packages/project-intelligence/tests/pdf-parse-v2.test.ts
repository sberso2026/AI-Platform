import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { PDFParse } from "pdf-parse";
import { DocumentIntelligenceError } from "../src/documents/errors";
import { PdfDocumentParser } from "../src/documents/native-parsers";

/** Minimal one-page PDF with extractable text (non-confidential). */
function buildTextPdf(lines: string[]): Uint8Array {
  const textOps = lines
    .map((line, index) => {
      const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      const y = 720 - index * 18;
      return `BT /F1 12 Tf 72 ${y} Td (${escaped}) Tj ET`;
    })
    .join("\n");
  const stream = `${textOps}\n`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${Buffer.byteLength(stream)} >>stream\n${stream}endstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

function buildEmptyTextPdf(): Uint8Array {
  const stream = "\n";
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj\n",
    `4 0 obj<< /Length ${Buffer.byteLength(stream)} >>stream\n${stream}endstream\nendobj\n`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

describe("PdfDocumentParser pdf-parse v2", () => {
  it("import contract exposes PDFParse class and not a callable default", async () => {
    const mod = await import("pdf-parse");
    expect(typeof mod.PDFParse).toBe("function");
    expect(typeof (mod as { default?: unknown }).default).not.toBe("function");
    const source = readFileSync(resolve(process.cwd(), "src/documents/native-parsers.ts"), "utf8");
    expect(source).toContain("PDFParse");
    expect(source).toContain('await import("pdf-parse")');
    expect(source).not.toMatch(/from\s+["']pdf-parse["']/);
    expect(source).not.toMatch(/mod\.default\s*\?\?\s*mod/);
    expect(source).not.toMatch(/await\s+pdfParse\s*\(/);
    expect(source).toContain("ensureNodeDomMatrix");
    expect(source).toContain("configurePdfJsWorker");
  });

  it("polyfills DOMMatrix before pdf-parse on serverless-like globals", async () => {
    const previous = (globalThis as { DOMMatrix?: unknown }).DOMMatrix;
    // @ts-expect-error test isolation
    delete (globalThis as { DOMMatrix?: unknown }).DOMMatrix;
    try {
      const parser = new PdfDocumentParser();
      const parsed = await parser.parse({
        engineeringDocumentId: "pdf-dommatrix-1",
        revision: "A",
        mimeType: "application/pdf",
        fileName: "valid-text.pdf",
        bytes: buildTextPdf(["AS 1755 conveyor platform width."]),
        correlationId: "corr-dommatrix",
      });
      expect(parsed.pages.length).toBeGreaterThan(0);
      expect((globalThis as { DOMMatrix?: unknown }).DOMMatrix).toBeTypeOf("function");
    } finally {
      if (previous) (globalThis as { DOMMatrix?: unknown }).DOMMatrix = previous;
    }
  });

  it("extracts expected text from a valid text PDF and destroys the parser", async () => {
    const destroy = vi.spyOn(PDFParse.prototype, "destroy");
    const parser = new PdfDocumentParser();
    const bytes = buildTextPdf([
      "Vessel V-101 design pressure is 16 bar g.",
      "Material ASTM A216 WCB.",
    ]);
    const parsed = await parser.parse({
      engineeringDocumentId: "pdf-valid-1",
      revision: "A",
      mimeType: "application/pdf",
      fileName: "valid-text.pdf",
      bytes,
      correlationId: "corr-valid-pdf",
    });

    expect(parser.provider).toBe("pdf-text");
    expect(parsed.parserProvider).toBe("pdf-text");
    expect(parsed.pages.length).toBeGreaterThanOrEqual(1);
    expect(parsed.pages.map((page) => page.text).join("\n")).toMatch(/16 bar g/);
    expect(parsed.warnings.join(" ")).toMatch(/correlation:corr-valid-pdf/);
    expect(parsed.confidence).toBeGreaterThan(0.5);
    expect(destroy).toHaveBeenCalled();
    destroy.mockRestore();
  });

  it("extracts usable content from a table-like PDF without corrupting routing metadata", async () => {
    const parser = new PdfDocumentParser();
    const bytes = buildTextPdf([
      "Table 1 Nozzle Schedule",
      "Tag | Size | Rating | Service",
      "V-101-N1 | 6 in | 150# | Inlet",
    ]);
    const parsed = await parser.parse({
      engineeringDocumentId: "pdf-table-1",
      revision: "B",
      mimeType: "application/pdf",
      fileName: "table-heavy-digital.pdf",
      bytes,
      correlationId: "corr-table-pdf",
    });

    const text = parsed.pages.map((page) => page.text).join("\n");
    expect(text).toMatch(/Nozzle Schedule/);
    expect(text).toMatch(/V-101-N1/);
    expect(parsed.parserProvider).toBe("pdf-text");
    expect(parsed.warnings.join(" ")).toMatch(/fileName:table-heavy-digital\.pdf/);
  });

  it("maps invalid PDF to document_parser_failed and still destroys the parser", async () => {
    const destroy = vi.spyOn(PDFParse.prototype, "destroy");
    const parser = new PdfDocumentParser();
    await expect(parser.parse({
      engineeringDocumentId: "pdf-invalid-1",
      revision: "A",
      mimeType: "application/pdf",
      bytes: new TextEncoder().encode("not-a-pdf"),
      correlationId: "corr-invalid-pdf",
    })).rejects.toMatchObject({
      code: "document_parser_failed",
      details: expect.objectContaining({ correlationId: "corr-invalid-pdf" }),
    });
    expect(destroy).toHaveBeenCalled();
    destroy.mockRestore();
  });

  it("marks empty PDF extraction as insufficient text for OCR routing", async () => {
    const parser = new PdfDocumentParser();
    const parsed = await parser.parse({
      engineeringDocumentId: "pdf-empty-1",
      revision: "A",
      mimeType: "application/pdf",
      bytes: buildEmptyTextPdf(),
      correlationId: "corr-empty-pdf",
    });
    expect(parsed.warnings.join(" ")).toMatch(/insufficient_extracted_text/);
    expect(parsed.confidence).toBeLessThan(0.5);
  });

  it("loads the pdf.js worker into globalThis before parse", async () => {
    const { configurePdfJsWorker } = await import("../src/documents/configure-pdfjs-worker");
    const { PDFParse } = await import("pdf-parse");
    const configured = await configurePdfJsWorker(PDFParse);
    expect(configured.length).toBeGreaterThan(0);
    expect((globalThis as { pdfjsWorker?: { WorkerMessageHandler?: unknown } }).pdfjsWorker?.WorkerMessageHandler).toBeTruthy();
  });

  it("does not leak stack traces or paths in parser error envelopes", async () => {
    const parser = new PdfDocumentParser();
    try {
      await parser.parse({
        engineeringDocumentId: "pdf-safe-err",
        revision: "A",
        mimeType: "application/pdf",
        bytes: new Uint8Array([0, 1, 2, 3]),
        correlationId: "corr-safe-err",
      });
      throw new Error("expected parse failure");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentIntelligenceError);
      const envelope = (error as DocumentIntelligenceError).toEnvelope();
      const serialized = JSON.stringify(envelope);
      expect(envelope.error.details.correlationId).toBe("corr-safe-err");
      expect(serialized).not.toMatch(/node_modules|\\Users\\|stack|sk-/i);
    }
  });
});
