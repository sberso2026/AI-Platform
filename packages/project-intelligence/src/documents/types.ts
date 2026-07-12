import { z } from "zod";

export const DOCUMENT_PROCESSING_STATUSES = [
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
] as const;

export type DocumentProcessingStatus = (typeof DOCUMENT_PROCESSING_STATUSES)[number];

export const DocumentProcessingStatusSchema = z.enum(DOCUMENT_PROCESSING_STATUSES);

export const ANSWER_STATUSES = [
  "answered",
  "partially_answered",
  "abstained",
  "conflicting_evidence",
  "document_not_ready",
  "insufficient_permission",
] as const;

export type AnswerStatus = (typeof ANSWER_STATUSES)[number];

export const AnswerStatusSchema = z.enum(ANSWER_STATUSES);

export const DOCUMENT_BLOCK_TYPES = [
  "text",
  "heading",
  "paragraph",
  "table",
  "list",
  "caption",
  "image",
  "other",
] as const;

export type DocumentBlockType = (typeof DOCUMENT_BLOCK_TYPES)[number];

export interface DocumentCitation {
  engineeringDocumentId: string;
  documentNumber?: string;
  documentTitle?: string;
  revision: string;
  pageStart?: number;
  pageEnd?: number;
  sectionPath?: string;
  excerpt: string;
  evidenceScore: number;
  chunkId: string;
  sourceCoordinates?: Record<string, unknown>;
}

export interface DocumentChunk {
  id: string;
  engineeringDocumentId: string;
  revision: string;
  processingVersion: string;
  chunkIndex: number;
  stableChunkId: string;
  content: string;
  contentHash: string;
  sectionPath?: string;
  pageStart?: number;
  pageEnd?: number;
  blockType: DocumentBlockType;
  tablePayload?: Record<string, unknown>;
  tenantId: string;
  workspaceId: string;
  engineeringProjectId?: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentFinding {
  id: string;
  findingType: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  confidence: number;
  evidence: readonly DocumentCitation[];
  affectedDocumentIds: readonly string[];
  engineeringProjectId?: string;
  suggestedReviewAction?: string;
  reviewState: "pending" | "in_review" | "approved" | "rejected" | "deferred";
  model?: string;
  promptVersion?: string;
}

export interface GroundedAnswerContract {
  answer?: string;
  answerStatus: AnswerStatus;
  confidence: number;
  citations: readonly DocumentCitation[];
  evidence: readonly DocumentCitation[];
  documentsUsed: readonly string[];
  retrievalTraceId: string;
  model?: string;
  promptVersion?: string;
  processingVersions: readonly string[];
  warnings: readonly string[];
  reviewState?: string;
  generatedAt: string;
}

export const READY_PROCESSING_STATUSES: readonly DocumentProcessingStatus[] = [
  "ready",
  "ready_with_warnings",
];

export function isReadyProcessingStatus(status: DocumentProcessingStatus): boolean {
  return READY_PROCESSING_STATUSES.includes(status);
}
