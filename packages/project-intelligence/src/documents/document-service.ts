import { createHash } from "node:crypto";
import { chunkParsedDocument } from "./chunking";
import type { ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import { DocumentIntelligenceError } from "./errors";
import type { IndexedDocumentChunk, ProjectIntelligenceDocumentIndexAdapter } from "./index-adapter";
import {
  assertDocumentTransition,
  buildTransitionAudit,
  isAuthoritativeAnswerAllowed,
  type DocumentIngestionTransitionAudit,
} from "./ingestion-state-machine";
import type { ProjectIntelligenceDocumentParser } from "./parser";
import { NativeTextDocumentParser } from "./parser";
import { buildGroundedAnswer } from "./grounded-answer";
import { evaluateAbstention } from "./abstention";
import { ProjectIntelligenceDocumentRetrievalService } from "./retrieval-service";
import { validateDocumentStoragePolicy } from "./storage-policy";
import type { DocumentProcessingStatus, GroundedAnswerContract } from "./types";

export interface DocumentProcessRequest {
  tenantId: string;
  workspaceId: string;
  engineeringProjectId?: string;
  engineeringDocumentId: string;
  revision: string;
  processingVersion?: string;
  mimeType: string;
  fileName?: string;
  bytes: Uint8Array;
  idempotencyKey?: string;
  actorId?: string;
  correlationId?: string;
}

export interface DocumentProcessingRecord {
  engineeringDocumentId: string;
  revision: string;
  processingVersion: string;
  status: DocumentProcessingStatus;
  confidence: number;
  warnings: string[];
  chunkCount: number;
  audits: DocumentIngestionTransitionAudit[];
  idempotencyKey?: string;
}

export interface DocumentQueryRequest {
  tenantId: string;
  workspaceId: string;
  allowedProjectIds: readonly string[];
  authorized: boolean;
  query: string;
  engineeringProjectIds?: readonly string[];
  engineeringDocumentIds?: readonly string[];
  processingStatusByDocument?: Readonly<Record<string, DocumentProcessingStatus>>;
  draftAnswer?: string;
  confidence?: number;
  model?: string;
  promptVersion?: string;
}

export class ProjectIntelligenceDocumentService {
  private readonly records = new Map<string, DocumentProcessingRecord>();
  private readonly retrieval: ProjectIntelligenceDocumentRetrievalService;

  constructor(
    private readonly parser: ProjectIntelligenceDocumentParser = new NativeTextDocumentParser(),
    private readonly embeddings: ProjectIntelligenceEmbeddingAdapter,
    private readonly index: ProjectIntelligenceDocumentIndexAdapter,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {
    this.retrieval = new ProjectIntelligenceDocumentRetrievalService(index, embeddings);
  }

  private key(documentId: string, revision: string, processingVersion: string): string {
    return `${documentId}:${revision}:${processingVersion}`;
  }

  getStatus(engineeringDocumentId: string, revision: string, processingVersion = "1"): DocumentProcessingRecord | null {
    return this.records.get(this.key(engineeringDocumentId, revision, processingVersion)) ?? null;
  }

  async process(request: DocumentProcessRequest): Promise<DocumentProcessingRecord> {
    validateDocumentStoragePolicy({
      mimeType: request.mimeType,
      fileName: request.fileName,
      sizeBytes: request.bytes.byteLength,
    });

    const processingVersion = request.processingVersion ?? "1";
    const recordKey = this.key(request.engineeringDocumentId, request.revision, processingVersion);
    const existing = this.records.get(recordKey);
    if (existing && request.idempotencyKey && existing.idempotencyKey === request.idempotencyKey) {
      return existing;
    }

    const audits: DocumentIngestionTransitionAudit[] = [];
    let status: DocumentProcessingStatus = "registered";
    const transition = (to: DocumentProcessingStatus, actionSuffix: string) => {
      const eventId = `${request.correlationId ?? "proc"}-${actionSuffix}-${audits.length}`;
      audits.push(buildTransitionAudit(status, to, eventId, { actorId: request.actorId, correlationId: request.correlationId }));
      status = to;
    };

    transition("queued", "queued");
    transition("fetching", "fetching");
    transition("validating", "validating");

    if (!this.parser.supports(request.mimeType) && request.mimeType !== "application/pdf" && !request.mimeType.includes("wordprocessingml")) {
      transition("failed", "failed");
      throw new DocumentIntelligenceError("document_unsupported_file_type", "Parser does not support MIME type", 422, {
        mimeType: request.mimeType,
      });
    }

    transition("parsing", "parsing");
    let parsed;
    try {
      parsed = await this.parser.parse({
        engineeringDocumentId: request.engineeringDocumentId,
        revision: request.revision,
        mimeType: request.mimeType === "application/pdf" || request.mimeType.includes("wordprocessingml")
          ? "text/plain"
          : request.mimeType,
        fileName: request.fileName,
        bytes: request.bytes,
      });
    } catch (error) {
      transition("failed", "parser");
      throw new DocumentIntelligenceError("document_parser_failed", "Document parser failed", 500, {
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    transition("normalizing", "normalizing");
    transition("chunking", "chunking");
    const chunks = chunkParsedDocument(parsed, {
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      engineeringProjectId: request.engineeringProjectId,
      engineeringDocumentId: request.engineeringDocumentId,
      revision: request.revision,
      processingVersion,
    });

    transition("embedding", "embedding");
    const embedded = await this.embeddings.embed({
      texts: chunks.map((chunk) => chunk.content),
      dimensions: 1536,
      correlationId: request.correlationId,
    });

    transition("indexing", "indexing");
    const indexed: IndexedDocumentChunk[] = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embedded.embeddings[index],
    }));
    await this.index.upsert(indexed);

    transition("extracting", "extracting");
    transition("validating_output", "validating_output");
    const warnings = [...parsed.warnings];
    const nextStatus: DocumentProcessingStatus = warnings.length ? "ready_with_warnings" : "ready";
    transition(nextStatus, nextStatus);

    const record: DocumentProcessingRecord = {
      engineeringDocumentId: request.engineeringDocumentId,
      revision: request.revision,
      processingVersion,
      status: nextStatus,
      confidence: parsed.confidence,
      warnings,
      chunkCount: chunks.length,
      audits,
      idempotencyKey: request.idempotencyKey,
    };
    this.records.set(recordKey, record);
    return record;
  }

  async retry(engineeringDocumentId: string, revision: string, processingVersion = "1"): Promise<DocumentProcessingRecord> {
    const current = this.getStatus(engineeringDocumentId, revision, processingVersion);
    if (!current) {
      throw new DocumentIntelligenceError("document_not_found", "Document processing record was not found", 404, {
        engineeringDocumentId,
        revision,
      });
    }
    assertDocumentTransition(current.status, "retry_pending");
    const updated: DocumentProcessingRecord = {
      ...current,
      status: "retry_pending",
      audits: [
        ...current.audits,
        buildTransitionAudit(current.status, "retry_pending", `retry-${createHash("sha1").update(this.now()).digest("hex").slice(0, 10)}`),
      ],
    };
    this.records.set(this.key(engineeringDocumentId, revision, processingVersion), updated);
    return updated;
  }

  async query(request: DocumentQueryRequest): Promise<GroundedAnswerContract> {
    const retrieval = await this.retrieval.retrieve(
      {
        tenantId: request.tenantId,
        workspaceId: request.workspaceId,
        allowedProjectIds: request.allowedProjectIds,
        authorized: request.authorized,
      },
      {
        query: request.query,
        filters: {
          engineeringProjectIds: request.engineeringProjectIds,
          engineeringDocumentIds: request.engineeringDocumentIds,
        },
      },
    );

    const processingStatuses = Object.values(request.processingStatusByDocument ?? {});
    const blockingStatus = processingStatuses.find((status) => !isAuthoritativeAnswerAllowed(status));
    const abstention = evaluateAbstention({
      authorized: request.authorized,
      processingStatus: blockingStatus,
      citations: retrieval.citations,
      maxScore: retrieval.maxScore,
      scoreThreshold: 0.35,
      confidence: request.confidence ?? retrieval.maxScore,
      confidenceThreshold: 0.5,
    });

    if (abstention.shouldAbstain) {
      return buildGroundedAnswer({
        answerStatus: abstention.answerStatus,
        confidence: request.confidence ?? retrieval.maxScore,
        citations: [],
        evidence: retrieval.citations,
        retrievalTraceId: retrieval.retrievalTraceId,
        model: request.model,
        promptVersion: request.promptVersion,
        warnings: [abstention.reason],
        generatedAt: this.now(),
      });
    }

    return buildGroundedAnswer({
      draftAnswer: request.draftAnswer ?? retrieval.citations[0]?.excerpt,
      answerStatus: "answered",
      confidence: request.confidence ?? retrieval.maxScore,
      citations: retrieval.citations,
      retrievalTraceId: retrieval.retrievalTraceId,
      model: request.model,
      promptVersion: request.promptVersion,
      processingVersions: processingStatuses.length ? ["1"] : [],
      generatedAt: this.now(),
    });
  }
}
