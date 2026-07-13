import { randomUUID } from "node:crypto";
import {
  AbortException,
  InvalidPDFException,
  PasswordException,
  PDFParse,
} from "pdf-parse";
import { DocumentIntelligenceError, type DocumentIntelligenceErrorCode } from "./errors";
import type { DocumentParseInput, ParsedDocument, ProjectIntelligenceDocumentParser } from "./parser";
import { NativeTextDocumentParser } from "./parser";

function mapPdfParseError(error: unknown, correlationId: string): DocumentIntelligenceError {
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
    error instanceof PasswordException
    || name === "PasswordException"
    || lower.includes("password")
  ) {
    code = "document_password_required";
    statusCode = 422;
    safeMessage = "PDF requires a password";
  } else if (
    error instanceof AbortException
    || name === "AbortException"
    || lower.includes("timeout")
    || lower.includes("aborted")
  ) {
    code = "document_parser_timeout";
    statusCode = 504;
    safeMessage = "PDF text parser timed out";
  } else if (
    error instanceof InvalidPDFException
    || name === "InvalidPDFException"
    || name === "FormatError"
    || lower.includes("invalid pdf")
    || lower.includes("invalidpdf")
  ) {
    code = "document_parser_failed";
    statusCode = 422;
    safeMessage = "Invalid PDF";
  }

  return new DocumentIntelligenceError(code, safeMessage, statusCode, {
    correlationId,
    parserProvider: "pdf-text",
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

    const parser = new PDFParse({ data: Buffer.from(input.bytes) });
    try {
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
      const warnings = [
        ...asText.warnings,
        ...(ocrLikely ? ["insufficient_extracted_text:ocr_recommended"] : []),
        `correlation:${correlationId}`,
        ...(input.fileName ? [`fileName:${input.fileName}`] : []),
      ];

      return {
        ...asText,
        parserProvider: this.provider,
        parserVersion: this.version,
        confidence: ocrLikely ? 0.35 : Math.max(asText.confidence, 0.7),
        warnings,
      };
    } catch (error) {
      throw mapPdfParseError(error, correlationId);
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
