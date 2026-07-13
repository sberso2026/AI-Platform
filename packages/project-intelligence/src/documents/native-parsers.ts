import type { DocumentParseInput, ParsedDocument, ProjectIntelligenceDocumentParser } from "./parser";
import { NativeTextDocumentParser } from "./parser";

export class PdfDocumentParser implements ProjectIntelligenceDocumentParser {
  readonly provider = "pdf-text";
  readonly version = "1.0.0";

  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  async parse(input: DocumentParseInput): Promise<ParsedDocument> {
    const mod = await import("pdf-parse");
    const PDFParseCtor = (mod as { PDFParse?: new (opts: { data: Buffer }) => {
      getText: () => Promise<{ text?: string; total?: number; pages?: Array<{ text?: string }> }>;
    } }).PDFParse;
    if (!PDFParseCtor) {
      throw new Error("pdf-parse PDFParse export unavailable");
    }
    const parser = new PDFParseCtor({ data: Buffer.from(input.bytes) });
    const extracted = await parser.getText();
    const text = (extracted.text ?? "").replace(/\n\n-- \d+ of \d+ --\n\n/g, "\n").trim();
    const pageCount = Math.max(extracted.total ?? extracted.pages?.length ?? 1, 1);
    const native = new NativeTextDocumentParser();
    const asText = await native.parse({
      ...input,
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(text || " "),
    });
    const charsPerPage = text.length / pageCount;
    const ocrLikely = text.length < 40 || charsPerPage < 20;
    return {
      ...asText,
      parserProvider: this.provider,
      parserVersion: this.version,
      confidence: ocrLikely ? 0.35 : Math.max(asText.confidence, 0.7),
      warnings: [
        ...asText.warnings,
        ...(ocrLikely ? ["insufficient_extracted_text:ocr_recommended"] : []),
      ],
    };
  }
}

export class DocxDocumentParser implements ProjectIntelligenceDocumentParser {
  readonly provider = "docx-mammoth";
  readonly version = "1.0.0";

  supports(mimeType: string): boolean {
    return mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      || mimeType === "application/msword";
  }

  async parse(input: DocumentParseInput): Promise<ParsedDocument> {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: Buffer.from(input.bytes) });
    const text = (result.value ?? "").trim();
    const native = new NativeTextDocumentParser();
    const asText = await native.parse({
      ...input,
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(text || " "),
    });
    return {
      ...asText,
      parserProvider: this.provider,
      parserVersion: this.version,
      confidence: text ? 0.8 : 0.2,
      warnings: [
        ...asText.warnings,
        ...((result.messages ?? []).map((message) => `docx:${message.message}`)),
      ],
    };
  }
}
