import { describe, expect, it } from "vitest";
import {
  DOCUMENT_PROCESSING_STATUSES,
  assertDocumentTransition,
  canTransitionDocumentStatus,
  isAuthoritativeAnswerAllowed,
} from "@rtb/project-intelligence";
import { DocumentIntelligenceError } from "@rtb/project-intelligence";

describe("Phase 6C-2 document processing state contracts", () => {
  it("exposes the full ingestion lifecycle statuses", () => {
    expect(DOCUMENT_PROCESSING_STATUSES).toEqual([
      "registered",
      "queued",
      "fetching",
      "validating",
      "parsing",
      "normalizing",
      "chunking",
      "embedding",
      "indexing",
      "extracting",
      "validating_output",
      "ready",
      "ready_with_warnings",
      "retry_pending",
      "failed",
      "cancelled",
      "superseded",
      "archived",
    ]);
  });

  it("allows registered → queued and rejects ready → parsing", () => {
    expect(canTransitionDocumentStatus("registered", "queued")).toBe(true);
    expect(canTransitionDocumentStatus("ready", "parsing")).toBe(false);
    expect(() => assertDocumentTransition("ready", "parsing")).toThrow(DocumentIntelligenceError);
  });

  it("only ready and ready_with_warnings authorize answers", () => {
    expect(isAuthoritativeAnswerAllowed("ready")).toBe(true);
    expect(isAuthoritativeAnswerAllowed("ready_with_warnings")).toBe(true);
    expect(isAuthoritativeAnswerAllowed("failed")).toBe(false);
    expect(isAuthoritativeAnswerAllowed("chunking")).toBe(false);
  });
});
