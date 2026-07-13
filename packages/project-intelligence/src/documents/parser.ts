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
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function splitPages(text: string): string[] {
  const formFeed = text.split(/\f/);
  if (formFeed.length > 1) return formFeed.map((page) => page.trimEnd());
  return [text];
}

function detectTableBlock(lines: string[]): ParsedTable | null {
  if (lines.length < 2) return null;
  const delimiter = lines.every((line) => line.includes("|"))
    ? "|"
    : lines.every((line) => line.includes("\t"))
      ? "\t"
      : null;
  if (!delimiter) return null;
  const cells = lines.map((line) =>
    line
      .split(delimiter)
      .map((cell) => cell.trim())
      .filter((cell, index, arr) => !(delimiter === "|" && (index === 0 || index === arr.length - 1) && cell === "")),
  );
  if (cells.some((row) => row.length < 2)) return null;
  const [headers, ...rows] = cells;
  return { headers, rows };
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
      const rawBlocks = pageText.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
      const blocks: ParsedBlock[] = [];
      for (const raw of rawBlocks) {
        const lines = raw.split(/\n/).map((line) => line.trimEnd());
        const table = detectTableBlock(lines);
        if (table) {
          blocks.push({
            type: "table",
            text: raw,
            page: pageNumber,
            table: { ...table, page: pageNumber },
            confidence: 0.9,
          });
          continue;
        }
        const isHeading = lines.length === 1 && lines[0].length <= 120 && !lines[0].endsWith(".");
        blocks.push({
          type: isHeading ? "heading" : "paragraph",
          text: raw,
          page: pageNumber,
          sectionPath: isHeading ? lines[0] : undefined,
          confidence: 0.85,
        });
      }
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
