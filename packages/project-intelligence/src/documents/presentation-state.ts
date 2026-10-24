import type { DocumentProcessingStatus } from "./types";
import { isAuthoritativeAnswerAllowed } from "./ingestion-state-machine";

export const DOCUMENT_INGESTION_PRESENTATION_STATES = [
  "metadata_only",
  "queued",
  "processing",
  "indexed",
  "partial",
  "failed",
] as const;

export type DocumentIngestionPresentationState =
  (typeof DOCUMENT_INGESTION_PRESENTATION_STATES)[number];

const PROCESSING = new Set<DocumentProcessingStatus>([
  "fetching",
  "validating",
  "parsing",
  "normalizing",
  "chunking",
  "embedding",
  "indexing",
  "extracting",
  "validating_output",
]);

export interface DocumentIngestionPresentation {
  state: DocumentIngestionPresentationState;
  label: string;
  aiSearchable: boolean;
  pagesIndexed: number;
  chunkCount: number;
  warnings: readonly string[];
  processingStatus: string | null;
}

export function mapDocumentIngestionPresentation(input: {
  hasSourceFile: boolean;
  processingStatus?: string | null;
  chunkCount?: number | null;
  pagesIndexed?: number | null;
  warningCount?: number | null;
  warnings?: readonly string[] | null;
  jobStatus?: string | null;
}): DocumentIngestionPresentation {
  const chunkCount = Number(input.chunkCount ?? 0);
  const pagesIndexed = Number(input.pagesIndexed ?? 0);
  const warnings = [...(input.warnings ?? [])];
  const status = (input.processingStatus ?? "").trim();
  const jobStatus = (input.jobStatus ?? "").trim();

  let state: DocumentIngestionPresentationState = "metadata_only";
  if (!input.hasSourceFile) {
    state = "metadata_only";
  } else if (jobStatus === "dead_letter" || status === "failed" || status === "cancelled") {
    state = "failed";
  } else if (status === "ready") {
    state = chunkCount > 0 ? "indexed" : "partial";
  } else if (status === "ready_with_warnings") {
    state = "partial";
  } else if (status === "queued" || status === "retry_pending" || jobStatus === "queued") {
    state = "queued";
  } else if (PROCESSING.has(status as DocumentProcessingStatus) || jobStatus === "running" || jobStatus === "claimed") {
    state = "processing";
  } else if (input.hasSourceFile && !status) {
    state = "metadata_only";
  }

  const aiSearchable =
    (state === "indexed" || state === "partial")
    && chunkCount > 0
    && isAuthoritativeAnswerAllowed((status || "failed") as DocumentProcessingStatus);

  const labels: Record<DocumentIngestionPresentationState, string> = {
    metadata_only: "Register only — source text not searchable",
    queued: "Queued for indexing",
    processing: "Indexing in progress",
    indexed: "Ready for questions",
    partial: "Partly indexed — some content may be missing",
    failed: "Indexing failed",
  };

  return {
    state,
    label: labels[state],
    aiSearchable,
    pagesIndexed,
    chunkCount,
    warnings,
    processingStatus: status || null,
  };
}
