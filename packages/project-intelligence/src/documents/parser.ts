import { segmentEngineeringPage } from "./engineering-text";

export interface ParsedTable {
  title?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  page?: number;
  footnotes?: readonly string[];
}

export interface ParsedBlock {
  type: "heading" | "paragraph" | "table" | "list" | "caption" | "image" | "other";
  text: string;
  page?: number;
  sectionPath?: string;
  table?: ParsedTable;
  offsets?: { start: number; end: number };
  confidence?: number;
}

export interface ParsedDocumentPage {
  pageNumber: number;
  text: string;
  blocks: readonly ParsedBlock[];
}

export interface ParsedDocument {
  pages: readonly ParsedDocumentPage[];
  language?: string;
  parserProvider: string;
  parserVersion: string;
  confidence: number;
  warnings: readonly string[];
}

export interface DocumentParseInput {
  engineeringDocumentId: string;
  revision: string;
  mimeType: string;
  fileName?: string;
  bytes: Uint8Array;
  /** Safe request correlation for nested parser errors (never a secret). */
  correlationId?: string;
}

export interface ProjectIntelligenceDocumentParser {
  readonly provider: string;
  readonly version: string;
  supports(mimeType: string): boolean;
  parse(input: DocumentParseInput): Promise<ParsedDocument>;
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function splitPages(text: string): string[] {
  const formFeed = text.split(/\f/);
  if (formFeed.length > 1) return formFeed.map((page) => page.trimEnd());
  return [text];
}

export class NativeTextDocumentParser implements ProjectIntelligenceDocumentParser {
  readonly provider = "native-text";
  readonly version = "1.0.0";

  supports(mimeType: string): boolean {
    return mimeType === "text/plain" || mimeType.startsWith("text/");
  }

  async parse(input: DocumentParseInput): Promise<ParsedDocument> {
    if (!this.supports(input.mimeType)) {
      return {
        pages: [],
        parserProvider: this.provider,
        parserVersion: this.version,
        confidence: 0,
        warnings: [`unsupported mime type: ${input.mimeType}`],
      };
    }

    const text = decodeUtf8(input.bytes);
    const pageTexts = splitPages(text);
    const pages = pageTexts.map((pageText, index) => {
      const pageNumber = index + 1;
      const blocks = segmentEngineeringPage(pageText, pageNumber);
      return { pageNumber, text: pageText, blocks };
    });

    return {
      pages,
      language: "en",
      parserProvider: this.provider,
      parserVersion: this.version,
      confidence: pages.some((page) => page.blocks.length > 0) ? 0.85 : 0.2,
      warnings: pages.every((page) => page.blocks.length === 0) ? ["empty document"] : [],
    };
  }
}
