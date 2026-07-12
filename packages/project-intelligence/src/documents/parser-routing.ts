import type { DocumentParseInput, ParsedDocument, ProjectIntelligenceDocumentParser } from "./parser";
import { NativeTextDocumentParser } from "./parser";

export type { ProjectIntelligenceDocumentParser };

export interface ParserRouteDecision {
  parser: ProjectIntelligenceDocumentParser;
  reason: string;
  ocrRecommended: boolean;
}

export class PdfDocumentParser implements ProjectIntelligenceDocumentParser {
  readonly provider = "pdf-text";
  readonly version = "1.0.0";

  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  async parse(input: DocumentParseInput): Promise<ParsedDocument> {
    const mod = await import("pdf-parse");
    const pdfParse = ((mod as { default?: unknown }).default ?? mod) as (buf: Buffer) => Promise<{ text?: string; numpages?: number }>;
    const parsed = await pdfParse(Buffer.from(input.bytes));
    const text = (parsed.text ?? "").trim();
    const native = new NativeTextDocumentParser();
    const asText = await native.parse({
      ...input,
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(text || " "),
    });
    const charsPerPage = text.length / Math.max(parsed.numpages ?? 1, 1);
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

/** Placeholder advanced parser interface — Docling/Azure adapters plug in here. */
export class AdvancedDocumentParserStub implements ProjectIntelligenceDocumentParser {
  readonly provider = "advanced-stub";
  readonly version = "0.0.0";

  supports(): boolean {
    return false;
  }

  async parse(): Promise<ParsedDocument> {
    return {
      pages: [],
      parserProvider: this.provider,
      parserVersion: this.version,
      confidence: 0,
      warnings: ["advanced parser not configured"],
    };
  }
}

export function selectDocumentParser(mimeType: string, parsers?: ProjectIntelligenceDocumentParser[]): ParserRouteDecision {
  const catalog = parsers ?? [
    new NativeTextDocumentParser(),
    new PdfDocumentParser(),
    new DocxDocumentParser(),
  ];
  const match = catalog.find((parser) => parser.supports(mimeType));
  if (!match) {
    return {
      parser: new NativeTextDocumentParser(),
      reason: "fallback_native_unsupported_mime",
      ocrRecommended: mimeType === "application/pdf",
    };
  }
  return {
    parser: match,
    reason: `routed:${match.provider}`,
    ocrRecommended: match.provider === "pdf-text",
  };
}

export interface OcrDecision {
  applyOcr: boolean;
  reason: string;
}

export function decideOcrPolicy(input: {
  mimeType: string;
  extractedTextLength: number;
  pageCount: number;
  parserConfidence: number;
  warnings: readonly string[];
}): OcrDecision {
  if (input.mimeType !== "application/pdf") {
    return { applyOcr: false, reason: "non_pdf" };
  }
  if (input.warnings.some((warning) => warning.includes("ocr_recommended"))) {
    return { applyOcr: true, reason: "parser_warning" };
  }
  if (input.extractedTextLength < 40) {
    return { applyOcr: true, reason: "insufficient_text" };
  }
  if (input.parserConfidence < 0.45) {
    return { applyOcr: true, reason: "low_confidence" };
  }
  const density = input.extractedTextLength / Math.max(input.pageCount, 1);
  if (density < 20) {
    return { applyOcr: true, reason: "scanned_density" };
  }
  return { applyOcr: false, reason: "text_extractable" };
}
