import type { DocumentProcessingStatus } from "./types";
import { DocumentIntelligenceError } from "./errors";

const TRANSITIONS: Readonly<Record<DocumentProcessingStatus, readonly DocumentProcessingStatus[]>> = {
  registered: ["queued", "cancelled", "archived"],
  queued: ["fetching", "cancelled", "retry_pending"],
  fetching: ["validating", "failed", "cancelled", "retry_pending"],
  validating: ["parsing", "failed", "cancelled", "retry_pending"],
  parsing: ["normalizing", "failed", "cancelled", "retry_pending"],
  normalizing: ["chunking", "failed", "cancelled", "retry_pending"],
  chunking: ["embedding", "failed", "cancelled", "retry_pending"],
  embedding: ["indexing", "failed", "cancelled", "retry_pending"],
  indexing: ["extracting", "failed", "cancelled", "retry_pending"],
  extracting: ["validating_output", "failed", "cancelled", "retry_pending"],
  validating_output: ["ready", "ready_with_warnings", "failed", "retry_pending"],
  ready: ["superseded", "archived", "retry_pending"],
  ready_with_warnings: ["ready", "superseded", "archived", "retry_pending"],
  retry_pending: ["queued", "cancelled", "archived"],
  failed: ["retry_pending", "cancelled", "archived"],
  cancelled: ["archived", "retry_pending"],
  superseded: ["archived"],
  archived: [],
};

export interface DocumentIngestionTransitionAudit {
  action: "status_transition";
  fromStatus: DocumentProcessingStatus;
  toStatus: DocumentProcessingStatus;
  eventId: string;
  correlationId?: string;
  actorId?: string;
  details?: Record<string, unknown>;
}

export function allowedDocumentTransitions(status: DocumentProcessingStatus): readonly DocumentProcessingStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionDocumentStatus(from: DocumentProcessingStatus, to: DocumentProcessingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertDocumentTransition(
  from: DocumentProcessingStatus,
  to: DocumentProcessingStatus,
): void {
  if (!canTransitionDocumentStatus(from, to)) {
    throw new DocumentIntelligenceError(
      "document_transition_invalid",
      "Document processing status transition is not allowed",
      409,
      { from, to },
    );
  }
}

export function buildTransitionAudit(
  from: DocumentProcessingStatus,
  to: DocumentProcessingStatus,
  eventId: string,
  extras: Omit<DocumentIngestionTransitionAudit, "action" | "fromStatus" | "toStatus" | "eventId"> = {},
): DocumentIngestionTransitionAudit {
  assertDocumentTransition(from, to);
  return {
    action: "status_transition",
    fromStatus: from,
    toStatus: to,
    eventId,
    ...extras,
  };
}

export function isAuthoritativeAnswerAllowed(status: DocumentProcessingStatus): boolean {
  return status === "ready" || status === "ready_with_warnings";
}
