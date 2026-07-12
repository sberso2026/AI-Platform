import type { DocumentParseInput, ParsedDocument, ProjectIntelligenceDocumentParser } from "./parser";
import { NativeTextDocumentParser } from "./parser";
import { DocxDocumentParser, PdfDocumentParser } from "./native-parsers";
import {
  ProjectIntelligenceParserRouter,
  type DocumentRoutingCharacteristics,
  type ParserRouteDecision as RouterDecision,
} from "./parser-router";

export type { ProjectIntelligenceDocumentParser };
export type {
  OcrStatus,
  DocumentRoutingCharacteristics,
  OcrExecutionResult,
  OcrPageDecision,
} from "./parser-router";
export {
  ProjectIntelligenceParserRouter,
  PlatformStructuredDocumentParser,
  AzureDocumentIntelligenceParser,
  PlatformLocalOcrProvider,
  AzureDocumentIntelligenceOcrProvider,
  decidePageLevelOcr,
} from "./parser-router";
export { PdfDocumentParser, DocxDocumentParser } from "./native-parsers";

export interface ParserRouteDecision {
  parser: ProjectIntelligenceDocumentParser;
  reason: string;
  ocrRecommended: boolean;
  route?: RouterDecision["route"];
}

/** @deprecated Prefer ProjectIntelligenceParserRouter — kept for compatibility. */
export class AdvancedDocumentParserStub implements ProjectIntelligenceDocumentParser {
  readonly provider = "advanced-stub";
  readonly version = "0.0.0";

  supports(): boolean {
    return false;
  }

  async parse(_input?: DocumentParseInput): Promise<ParsedDocument> {
    return {
      pages: [],
      parserProvider: this.provider,
      parserVersion: this.version,
      confidence: 0,
      warnings: ["advanced parser not configured"],
    };
  }
}

const defaultRouter = new ProjectIntelligenceParserRouter();

export function selectDocumentParser(
  mimeType: string,
  parsers?: ProjectIntelligenceDocumentParser[],
  characteristics?: Partial<DocumentRoutingCharacteristics>,
): ParserRouteDecision {
  if (parsers?.length) {
    const match = parsers.find((parser) => parser.supports(mimeType));
    if (!match) {
      return {
        parser: new NativeTextDocumentParser(),
        reason: "fallback_native_unsupported_mime",
        ocrRecommended: mimeType === "application/pdf",
        route: "native_text",
      };
    }
    return {
      parser: match,
      reason: `routed:${match.provider}`,
      ocrRecommended: match.provider === "pdf-text",
      route: match.provider.includes("structured") || match.provider.includes("azure")
        ? "advanced_structured"
        : mimeType.includes("word")
          ? "docx"
          : mimeType === "application/pdf"
            ? "pdf_text"
            : "native_text",
    };
  }

  const decision = defaultRouter.route({
    mimeType,
    ...characteristics,
  });
  return {
    parser: decision.parser,
    reason: decision.reason,
    ocrRecommended: decision.ocrRecommended,
    route: decision.route,
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
  if (input.mimeType !== "application/pdf" && !input.mimeType.startsWith("image/")) {
    return { applyOcr: false, reason: "non_ocr_mime" };
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
