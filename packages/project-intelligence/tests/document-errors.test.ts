import { describe, expect, it } from "vitest";
import {
  DocumentIntelligenceError,
  PHASE_BRIEF_DOCUMENT_ERROR_CODES,
} from "../src/documents/errors";

describe("document errors", () => {
  it("exposes phase-brief document_* codes", () => {
    expect(PHASE_BRIEF_DOCUMENT_ERROR_CODES).toEqual([
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
    ]);
  });

  it("serializes a stable error envelope", () => {
    const error = new DocumentIntelligenceError("document_access_denied", "Denied", 403, { documentId: "d1" });
    expect(error.toEnvelope()).toEqual({
      error: {
        code: "document_access_denied",
        message: "Denied",
        details: { documentId: "d1" },
      },
    });
  });
});
