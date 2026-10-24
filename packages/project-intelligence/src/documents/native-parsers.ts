import { randomUUID } from "node:crypto";
import { configurePdfJsWorker } from "./configure-pdfjs-worker";
import { DocumentIntelligenceError, type DocumentIntelligenceErrorCode } from "./errors";
import { ensureNodeDomMatrix } from "./dom-matrix-polyfill";
import {
  NativeTextDocumentParser,
  type DocumentParseInput,
  type ParsedDocument,
  type ParsedDocumentPage,
  type ProjectIntelligenceDocumentParser,
} from "./parser";
import { segmentEngineeringPage } from "./engineering-text";

function isExceptionInstance(error: unknown, ctor: unknown): boolean {
  return typeof ctor === "function" && error instanceof (ctor as new (...args: never[]) => object);
}

function mapPdfParseError(
  error: unknown,
  correlationId: string,
  exceptions: { PasswordException?: unknown; AbortException?: unknown; InvalidPDFException?: unknown } = {},
): DocumentIntelligenceError {
  if (error instanceof DocumentIntelligenceError) {
    return new DocumentIntelligenceError(error.code, error.message, error.statusCode, {
      ...error.details,
      correlationId: (error.details.correlationId as string | undefined) ?? correlationId,
    });
  }

  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  const lower = `${name} ${message}`.toLowerCase();

  let code: DocumentIntelligenceErrorCode = "document_parser_failed";
  let statusCode = 500;
  let safeMessage = "PDF text parser failed";

  if (
    isExceptionInstance(error, exceptions.PasswordException)
    || name === "PasswordException"
    || lower.includes("password")
  ) {
    code = "document_password_required";
    statusCode = 422;
    safeMessage = "PDF requires a password";
  } else if (
    isExceptionInstance(error, exceptions.AbortException)
    || name === "AbortException"
    || lower.includes("timeout")
    || lower.includes("aborted")
  ) {
    code = "document_parser_timeout";
    statusCode = 504;
    safeMessage = "PDF text parser timed out";
  } else if (
    isExceptionInstance(error, exceptions.InvalidPDFException)
    || name === "InvalidPDFException"
    || name === "FormatError"
    || lower.includes("invalid pdf")
    || lower.includes("invalidpdf")
  ) {
    code = "document_parser_failed";
    statusCode = 422;
    safeMessage = "Invalid PDF";
  }

  return new DocumentIntelligenceError(code, `${safeMessage}${message ? `: ${message.slice(0, 180)}` : ""}`, statusCode, {
    correlationId,
    parserProvider: "pdf-text",
    parserErrorName: name || undefined,
  });
}

export class PdfDocumentParser implements ProjectIntelligenceDocumentParser {
  readonly provider = "pdf-text";
  readonly version = "1.0.0";

  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  async parse(input: DocumentParseInput): Promise<ParsedDocument> {
    const correlationId = input.correlationId ?? randomUUID();
    if (!this.supports(input.mimeType)) {
      throw new DocumentIntelligenceError(
        "document_unsupported_file_type",
        "PDF text parser requires application/pdf",
        422,
        { correlationId, mimeType: input.mimeType },
      );
    }

    ensureNodeDomMatrix();
    const pdfParse = await import("pdf-parse");
    const { PDFParse, AbortException, InvalidPDFException, PasswordException } = pdfParse;
    await configurePdfJsWorker(PDFParse);
    const parser = new PDFParse({ data: Buffer.from(input.bytes) });
    try {
      const extracted = await parser.getText();
      const pages = pdfPagesFromExtracted(extracted);
      const combinedText = pages.map((page) => page.text).join("\n").trim();
      const pageCount = Math.max(pages.length, extracted.total ?? 1, 1);
      const charsPerPage = combinedText.length / pageCount;
      const ocrLikely = combinedText.length < 40 || charsPerPage < 20;
      const parsedPages: ParsedDocumentPage[] = pages.map((page) => ({
        pageNumber: page.pageNumber,
        text: page.text,
        blocks: segmentEngineeringPage(page.text, page.pageNumber),
      }));
      const warnings = [
        ...(ocrLikely ? ["insufficient_extracted_text:ocr_recommended"] : []),
        ...(ocrLikely ? ["native_text_preferred_ocr_not_applied_silently"] : []),
        `correlation:${correlationId}`,
        ...(input.fileName ? [`fileName:${input.fileName}`] : []),
        `pages:${parsedPages.length}`,
      ];

      return {
        pages: parsedPages.length ? parsedPages : [{ pageNumber: 1, text: " ", blocks: [] }],
        language: "en",
        parserProvider: this.provider,
        parserVersion: this.version,
        confidence: ocrLikely ? 0.35 : parsedPages.some((page) => page.blocks.length > 0) ? 0.75 : 0.2,
        warnings,
      };
    } catch (error) {
      throw mapPdfParseError(error, correlationId, {
        AbortException,
        InvalidPDFException,
        PasswordException,
      });
    } finally {
      try {
        await parser.destroy();
      } catch {
        // Cleanup must not mask the original parse outcome.
      }
    }
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

type PdfExtractedPage = { text?: string; num?: number; pageNumber?: number } | string;

function pdfPagesFromExtracted(extracted: {
  text?: string;
  total?: number;
  pages?: PdfExtractedPage[];
}): Array<{ pageNumber: number; text: string }> {
  const rawPages = extracted.pages;
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    return rawPages.map((page, index) => {
      if (typeof page === "string") {
        return { pageNumber: index + 1, text: page.replace(/\n\n-- \d+ of \d+ --\n\n/g, "\n").trim() };
      }
      return {
        pageNumber: Number(page.num ?? page.pageNumber ?? index + 1),
        text: String(page.text ?? "").replace(/\n\n-- \d+ of \d+ --\n\n/g, "\n").trim(),
      };
    });
  }
  const concatenated = String(extracted.text ?? "").replace(/\n\n-- \d+ of \d+ --\n\n/g, "\n\f");
  const split = concatenated.split(/\f/).map((page) => page.trim());
  if (split.length > 1) {
    return split.map((text, index) => ({ pageNumber: index + 1, text }));
  }
  return [{ pageNumber: 1, text: concatenated.trim() }];
}

