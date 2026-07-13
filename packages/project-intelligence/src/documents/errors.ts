import type { DocumentProcessingStatus } from "./types";

export type DocumentIntelligenceErrorCode =
  | "document_not_found"
  | "document_access_denied"
  | "document_unsupported_file_type"
  | "document_file_too_large"
  | "document_source_file_unavailable"
  | "document_parser_failed"
  | "document_password_required"
  | "document_parser_timeout"
  | "document_normalization_failed"
  | "document_chunking_failed"
  | "document_embedding_failed"
  | "document_indexing_failed"
  | "document_extraction_failed"
  | "document_processing_version_incompatible"
  | "document_revision_superseded"
  | "document_transition_invalid"
  | "document_not_ready"
  | "document_insufficient_evidence"
  | "document_citation_required"
  | "document_conflict_requires_review";

const STATUS_BY_CODE: Partial<Record<DocumentIntelligenceErrorCode, number>> = {
  document_not_found: 404,
  document_access_denied: 403,
  document_unsupported_file_type: 422,
  document_file_too_large: 422,
  document_source_file_unavailable: 404,
  document_parser_failed: 500,
  document_password_required: 422,
  document_parser_timeout: 504,
  document_normalization_failed: 500,
  document_chunking_failed: 500,
  document_embedding_failed: 500,
  document_indexing_failed: 500,
  document_extraction_failed: 500,
  document_processing_version_incompatible: 409,
  document_revision_superseded: 409,
  document_transition_invalid: 409,
  document_not_ready: 409,
  document_insufficient_evidence: 422,
  document_citation_required: 422,
  document_conflict_requires_review: 409,
};

export class DocumentIntelligenceError extends Error {
  readonly name = "DocumentIntelligenceError";

  constructor(
    readonly code: DocumentIntelligenceErrorCode,
    message: string,
    readonly statusCode: number = STATUS_BY_CODE[code] ?? 400,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }

  toEnvelope(): {
    error: {
      code: DocumentIntelligenceErrorCode;
      message: string;
      details: Record<string, unknown>;
    };
  } {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}

/** Phase-brief codes mapped onto the document_* contract. */
export const PHASE_BRIEF_DOCUMENT_ERROR_CODES = [
  "document_not_found",
  "document_access_denied",
  "document_unsupported_file_type",
  "document_file_too_large",
  "document_source_file_unavailable",
  "document_parser_failed",
  "document_password_required",
  "document_parser_timeout",
  "document_normalization_failed",
  "document_chunking_failed",
  "document_embedding_failed",
  "document_indexing_failed",
  "document_extraction_failed",
  "document_processing_version_incompatible",
  "document_revision_superseded",
] as const satisfies readonly DocumentIntelligenceErrorCode[];

export function isTerminalFailureStatus(status: DocumentProcessingStatus): boolean {
  return status === "failed" || status === "cancelled" || status === "superseded" || status === "archived";
}
