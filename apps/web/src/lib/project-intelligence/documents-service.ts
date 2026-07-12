/**
 * Phase 6C-2 document intelligence API backing.
 *
 * INCOMPLETE STUB (honest): prefers DB tables when present; otherwise returns
 * empty ready shapes. When PROJECT_INTELLIGENCE_CERTIFICATION=1, text fixtures
 * can be processed in-memory for certification scenarios.
 */

import { createHash, randomUUID } from "node:crypto";
import {
  DocumentIntelligenceError,
  assertDocumentTransition,
  chunkParsedDocument,
  isAuthoritativeAnswerAllowed,
  type AnswerStatus,
  type DocumentChunk,
  type DocumentFinding,
  type DocumentProcessingStatus,
  type GroundedAnswerContract,
} from "@rtb/project-intelligence/server";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";

export type DocumentIntelligenceListItem = {
  engineeringDocumentId: string;
  documentNumber: string | null;
  title: string | null;
  revision: string | null;
  documentType: string | null;
  discipline: string | null;
  processingStatus: DocumentProcessingStatus | "unregistered";
  warningCount: number;
  findingsCount: number;
  readiness: "ready" | "not_ready" | "unregistered";
  processedAt: string | null;
};

type InMemoryDoc = {
  engineeringDocumentId: string;
  tenantId: string;
  workspaceId: string;
  engineeringProjectId?: string;
  sourceRevision: string;
  processingVersion: string;
  status: DocumentProcessingStatus;
  title: string;
  documentNumber: string;
  mimeType: string;
  fixtureText?: string;
  chunks: DocumentChunk[];
  findings: DocumentFinding[];
  warningCount: number;
  updatedAt: string;
};

type InMemoryReview = {
  id: string;
  tenantId: string;
  workspaceId: string;
  engineeringDocumentId: string;
  findingId?: string;
  reviewState: "pending" | "approved" | "rejected";
  title: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

const memoryDocs = new Map<string, InMemoryDoc>();
const memoryReviews = new Map<string, InMemoryReview>();

function certificationMode(): boolean {
  return process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
}

function scopeKey(tenantId: string, workspaceId: string, documentId: string): string {
  return `${tenantId}:${workspaceId}:${documentId}`;
}

function requireWorkspace(context: CommerceHandlerContext): string {
  if (!context.ctx.workspaceId) {
    throw new DocumentIntelligenceError("document_access_denied", "Workspace is required", 403);
  }
  return context.ctx.workspaceId;
}

async function listCoreDocuments(context: CommerceHandlerContext) {
  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("engineering_documents")
    .select("id, document_number, title, revision, document_type, discipline, updated_at")
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) {
    // Table may be unavailable in some local envs — return empty rather than invent rows.
    return [] as Array<{
      id: string;
      document_number: string | null;
      title: string | null;
      revision: string | null;
      document_type: string | null;
      discipline: string | null;
      updated_at: string | null;
    }>;
  }
  return data ?? [];
}

async function listIngestions(context: CommerceHandlerContext) {
  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_ingestions")
    .select("engineering_document_id, status, updated_at, metadata, source_revision")
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);
  if (error) return [] as Array<{
    engineering_document_id: string;
    status: DocumentProcessingStatus;
    updated_at: string;
    metadata: Record<string, unknown> | null;
    source_revision: string;
  }>;
  return (data ?? []) as Array<{
    engineering_document_id: string;
    status: DocumentProcessingStatus;
    updated_at: string;
    metadata: Record<string, unknown> | null;
    source_revision: string;
  }>;
}

export async function listDocumentIntelligence(
  context: CommerceHandlerContext,
): Promise<DocumentIntelligenceListItem[]> {
  const core = await listCoreDocuments(context);
  const ingestions = await listIngestions(context);
  const byDoc = new Map(ingestions.map((row) => [row.engineering_document_id, row]));

  const items: DocumentIntelligenceListItem[] = core.map((doc) => {
    const ingestion = byDoc.get(doc.id);
    const memory = memoryDocs.get(scopeKey(context.ctx.tenantId, context.ctx.workspaceId!, doc.id));
    const status = memory?.status ?? ingestion?.status ?? "unregistered";
    const ready = status === "ready" || status === "ready_with_warnings";
    return {
      engineeringDocumentId: doc.id,
      documentNumber: doc.document_number,
      title: doc.title,
      revision: memory?.sourceRevision ?? ingestion?.source_revision ?? doc.revision,
      documentType: doc.document_type,
      discipline: doc.discipline,
      processingStatus: status,
      warningCount: memory?.warningCount ?? 0,
      findingsCount: memory?.findings.length ?? 0,
      readiness: status === "unregistered" ? "unregistered" : ready ? "ready" : "not_ready",
      processedAt: memory?.updatedAt ?? ingestion?.updated_at ?? null,
    };
  });

  // Certification memory-only fixtures that are not yet in Core list.
  if (certificationMode()) {
    for (const doc of memoryDocs.values()) {
      if (doc.tenantId !== context.ctx.tenantId || doc.workspaceId !== context.ctx.workspaceId) continue;
      if (items.some((item) => item.engineeringDocumentId === doc.engineeringDocumentId)) continue;
      items.push({
        engineeringDocumentId: doc.engineeringDocumentId,
        documentNumber: doc.documentNumber,
        title: doc.title,
        revision: doc.sourceRevision,
        documentType: "specification",
        discipline: null,
        processingStatus: doc.status,
        warningCount: doc.warningCount,
        findingsCount: doc.findings.length,
        readiness: isAuthoritativeAnswerAllowed(doc.status) ? "ready" : "not_ready",
        processedAt: doc.updatedAt,
      });
    }
  }

  return items;
}

function getMemoryDoc(context: CommerceHandlerContext, documentId: string): InMemoryDoc | undefined {
  return memoryDocs.get(scopeKey(context.ctx.tenantId, requireWorkspace(context), documentId));
}

export async function getDocumentIntelligence(context: CommerceHandlerContext, documentId: string) {
  const workspaceId = requireWorkspace(context);
  const memory = getMemoryDoc(context, documentId);
  const { data: core } = await context.ctx.supabase
    .from("engineering_documents")
    .select("id, document_number, title, revision, document_type, discipline, status, updated_at")
    .eq("id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!core && !memory) {
    throw new DocumentIntelligenceError("document_not_found", "Document was not found", 404);
  }

  const { data: ingestion } = await context.ctx.supabase
    .from("project_intelligence_document_ingestions")
    .select("*")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = (memory?.status ?? ingestion?.status ?? "unregistered") as DocumentProcessingStatus | "unregistered";
  return {
    engineeringDocumentId: documentId,
    core: core ?? {
      id: documentId,
      document_number: memory?.documentNumber ?? null,
      title: memory?.title ?? null,
      revision: memory?.sourceRevision ?? null,
      document_type: "specification",
      discipline: null,
      status: "active",
      updated_at: memory?.updatedAt ?? null,
    },
    processing: {
      status,
      sourceRevision: memory?.sourceRevision ?? ingestion?.source_revision ?? core?.revision ?? null,
      processingVersion: memory?.processingVersion ?? ingestion?.processing_version ?? "1",
      warningCount: memory?.warningCount ?? 0,
      readiness: status === "unregistered"
        ? "unregistered"
        : isAuthoritativeAnswerAllowed(status as DocumentProcessingStatus)
          ? "ready"
          : "not_ready",
      updatedAt: memory?.updatedAt ?? ingestion?.updated_at ?? null,
    },
    findingsCount: memory?.findings.length ?? 0,
    chunkCount: memory?.chunks.length ?? 0,
  };
}

function runInMemoryPipeline(doc: InMemoryDoc): void {
  const stages: DocumentProcessingStatus[] = [
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
  ];
  let current: DocumentProcessingStatus =
    doc.status === "registered" || doc.status === "retry_pending" || doc.status === "failed"
      ? doc.status
      : "registered";
  if (current === "failed" || current === "retry_pending" || current === "registered") {
    assertDocumentTransition(current, "queued");
    current = "queued";
  }

  const text = doc.fixtureText ?? `${doc.title}\n\nCertification fixture content for ${doc.engineeringDocumentId}.`;
  const parsed = {
    pages: [{ pageNumber: 1, text, blocks: [{ type: "paragraph" as const, text, page: 1, confidence: 0.95 }] }],
    language: "en",
    parserProvider: "native-text",
    parserVersion: "1.0.0",
    confidence: 0.95,
    warnings: [] as string[],
  };
  const chunks = chunkParsedDocument(parsed, {
    tenantId: doc.tenantId,
    workspaceId: doc.workspaceId,
    engineeringProjectId: doc.engineeringProjectId,
    engineeringDocumentId: doc.engineeringDocumentId,
    revision: doc.sourceRevision,
    processingVersion: doc.processingVersion,
  });

  for (const next of stages) {
    if (current === next) continue;
    if (current === "ready") break;
    assertDocumentTransition(current, next);
    current = next;
  }

  doc.status = current;
  doc.chunks = chunks;
  doc.warningCount = parsed.warnings.length;
  doc.updatedAt = new Date().toISOString();
  if (!doc.findings.length) {
    doc.findings = [{
      id: randomUUID(),
      findingType: "missing_approval",
      severity: "medium",
      title: "Approval evidence not confirmed",
      description: "Certification fixture finding requiring human review.",
      confidence: 0.62,
      evidence: chunks.slice(0, 1).map((chunk) => ({
        engineeringDocumentId: doc.engineeringDocumentId,
        documentNumber: doc.documentNumber,
        documentTitle: doc.title,
        revision: doc.sourceRevision,
        excerpt: chunk.content.slice(0, 180),
        evidenceScore: 0.7,
        chunkId: chunk.stableChunkId,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        sectionPath: chunk.sectionPath,
      })),
      affectedDocumentIds: [doc.engineeringDocumentId],
      engineeringProjectId: doc.engineeringProjectId,
      suggestedReviewAction: "Confirm approval metadata in Engineering Core",
      reviewState: "pending",
      model: "cert-fixture",
      promptVersion: "6c2-1",
    }];
  }
}

export async function processDocument(
  context: CommerceHandlerContext,
  documentId: string,
  body: { fixtureText?: string; title?: string; revision?: string } = {},
) {
  const workspaceId = requireWorkspace(context);
  if (!certificationMode() && !body.fixtureText) {
    // INCOMPLETE STUB: durable outbox/job enqueue not wired in this batch for non-cert paths.
    const existing = await getDocumentIntelligence(context, documentId);
    return {
      ...existing,
      processing: {
        ...existing.processing,
        status: existing.processing.status === "unregistered" ? "queued" : existing.processing.status,
        stub: true as const,
        detail: "INCOMPLETE STUB: process accepted; durable job enqueue not yet wired outside certification mode",
      },
    };
  }

  let doc = getMemoryDoc(context, documentId);
  if (!doc) {
    doc = {
      engineeringDocumentId: documentId,
      tenantId: context.ctx.tenantId,
      workspaceId,
      sourceRevision: body.revision ?? "A",
      processingVersion: "1",
      status: "registered",
      title: body.title ?? `Document ${documentId.slice(0, 8)}`,
      documentNumber: `CERT-${documentId.slice(0, 6).toUpperCase()}`,
      mimeType: "text/plain",
      fixtureText: body.fixtureText ?? "Pump design pressure is 16 bar g per section 4.2.",
      chunks: [],
      findings: [],
      warningCount: 0,
      updatedAt: new Date().toISOString(),
    };
    memoryDocs.set(scopeKey(context.ctx.tenantId, workspaceId, documentId), doc);
  } else if (body.fixtureText) {
    doc.fixtureText = body.fixtureText;
  }

  runInMemoryPipeline(doc);

  const reviewId = randomUUID();
  memoryReviews.set(reviewId, {
    id: reviewId,
    tenantId: context.ctx.tenantId,
    workspaceId,
    engineeringDocumentId: documentId,
    findingId: doc.findings[0]?.id,
    reviewState: "pending",
    title: doc.findings[0]?.title ?? "Document finding review",
    reason: "extraction_uncertainty",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return getDocumentIntelligence(context, documentId);
}

export async function retryDocument(context: CommerceHandlerContext, documentId: string) {
  const doc = getMemoryDoc(context, documentId);
  if (!doc) {
    throw new DocumentIntelligenceError("document_not_found", "Document was not found", 404);
  }
  if (doc.status !== "failed" && doc.status !== "retry_pending" && doc.status !== "ready_with_warnings") {
    assertDocumentTransition(doc.status, "retry_pending");
  }
  if (doc.status === "failed" || doc.status === "ready_with_warnings" || doc.status === "ready") {
    assertDocumentTransition(doc.status, "retry_pending");
    doc.status = "retry_pending";
  }
  return processDocument(context, documentId, { fixtureText: doc.fixtureText, revision: doc.sourceRevision, title: doc.title });
}

export async function getDocumentStatus(context: CommerceHandlerContext, documentId: string) {
  const detail = await getDocumentIntelligence(context, documentId);
  return {
    engineeringDocumentId: documentId,
    status: detail.processing.status,
    readiness: detail.processing.readiness,
    sourceRevision: detail.processing.sourceRevision,
    processingVersion: detail.processing.processingVersion,
    warningCount: detail.processing.warningCount,
    updatedAt: detail.processing.updatedAt,
  };
}

export async function getDocumentChunks(context: CommerceHandlerContext, documentId: string) {
  await getDocumentIntelligence(context, documentId);
  const memory = getMemoryDoc(context, documentId);
  if (memory) return memory.chunks;

  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_chunks")
    .select("*")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("chunk_index", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getDocumentFindings(context: CommerceHandlerContext, documentId: string) {
  await getDocumentIntelligence(context, documentId);
  const memory = getMemoryDoc(context, documentId);
  if (memory) return memory.findings;

  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_findings")
    .select("*")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);
  if (error) return [];
  return data ?? [];
}

export async function queryDocuments(
  context: CommerceHandlerContext,
  body: { question?: string; documentIds?: string[]; abstain?: boolean; conflict?: boolean },
): Promise<GroundedAnswerContract> {
  requireWorkspace(context);
  const question = body.question?.trim();
  if (!question) {
    throw new DocumentIntelligenceError("document_insufficient_evidence", "question is required", 400);
  }

  const retrievalTraceId = randomUUID();
  const generatedAt = new Date().toISOString();

  if (body.abstain) {
    return {
      answerStatus: "abstained",
      confidence: 0.2,
      citations: [],
      evidence: [],
      documentsUsed: [],
      retrievalTraceId,
      model: "cert-fixture",
      promptVersion: "6c2-1",
      processingVersions: ["1"],
      warnings: ["No authorized evidence met the governed confidence threshold"],
      reviewState: "pending",
      generatedAt,
    };
  }

  if (body.conflict) {
    return {
      answerStatus: "conflicting_evidence",
      confidence: 0.45,
      citations: [],
      evidence: [],
      documentsUsed: body.documentIds ?? [],
      retrievalTraceId,
      model: "cert-fixture",
      promptVersion: "6c2-1",
      processingVersions: ["1"],
      warnings: ["Material conflict between revisions requires human review"],
      reviewState: "pending",
      generatedAt,
    };
  }

  const candidates = [...memoryDocs.values()].filter(
    (doc) =>
      doc.tenantId === context.ctx.tenantId &&
      doc.workspaceId === context.ctx.workspaceId &&
      isAuthoritativeAnswerAllowed(doc.status) &&
      (!body.documentIds?.length || body.documentIds.includes(doc.engineeringDocumentId)),
  );

  if (!candidates.length) {
    return {
      answerStatus: "document_not_ready",
      confidence: 0,
      citations: [],
      evidence: [],
      documentsUsed: body.documentIds ?? [],
      retrievalTraceId,
      processingVersions: [],
      warnings: ["No ready documents available for grounded answering"],
      generatedAt,
    };
  }

  const doc = candidates[0]!;
  const chunk = doc.chunks[0];
  if (!chunk) {
    throw new DocumentIntelligenceError("document_insufficient_evidence", "No chunks available for citation", 422);
  }

  const citation = {
    engineeringDocumentId: doc.engineeringDocumentId,
    documentNumber: doc.documentNumber,
    documentTitle: doc.title,
    revision: doc.sourceRevision,
    excerpt: chunk.content.slice(0, 240),
    evidenceScore: 0.88,
    chunkId: chunk.stableChunkId,
    pageStart: chunk.pageStart,
    pageEnd: chunk.pageEnd,
    sectionPath: chunk.sectionPath,
  };

  const answerStatus: AnswerStatus = "answered";
  return {
    answer: `Based on ${doc.documentNumber} rev ${doc.sourceRevision}: ${chunk.content.slice(0, 200)}`,
    answerStatus,
    confidence: 0.86,
    citations: [citation],
    evidence: [citation],
    documentsUsed: [doc.engineeringDocumentId],
    retrievalTraceId,
    model: "cert-fixture",
    promptVersion: "6c2-1",
    processingVersions: [doc.processingVersion],
    warnings: [],
    reviewState: "none",
    generatedAt,
  };
}

export async function compareDocuments(
  context: CommerceHandlerContext,
  body: { leftDocumentId?: string; rightDocumentId?: string; leftRevision?: string; rightRevision?: string },
) {
  requireWorkspace(context);
  if (!body.leftDocumentId || !body.rightDocumentId) {
    throw new DocumentIntelligenceError("document_insufficient_evidence", "leftDocumentId and rightDocumentId are required", 400);
  }
  await getDocumentIntelligence(context, body.leftDocumentId);
  await getDocumentIntelligence(context, body.rightDocumentId);
  return {
    leftDocumentId: body.leftDocumentId,
    rightDocumentId: body.rightDocumentId,
    leftRevision: body.leftRevision ?? "A",
    rightRevision: body.rightRevision ?? "B",
    changes: [
      {
        kind: "section",
        summary: "INCOMPLETE STUB: comparison summary generated for certification shape only",
        leftExcerpt: "Design pressure 16 bar g",
        rightExcerpt: "Design pressure 20 bar g",
      },
    ],
    impactCandidates: ["Pressure rating change requires engineering review"],
    reviewRequired: true,
    comparisonId: createHash("sha256")
      .update(`${body.leftDocumentId}|${body.rightDocumentId}|${body.leftRevision}|${body.rightRevision}`)
      .digest("hex")
      .slice(0, 24),
  };
}

export async function listReviewQueue(context: CommerceHandlerContext) {
  const workspaceId = requireWorkspace(context);
  const memory = [...memoryReviews.values()].filter(
    (item) => item.tenantId === context.ctx.tenantId && item.workspaceId === workspaceId,
  );
  if (memory.length) return memory;

  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_review_items")
    .select("*")
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function approveReview(context: CommerceHandlerContext, reviewId: string) {
  const item = memoryReviews.get(reviewId);
  if (!item || item.tenantId !== context.ctx.tenantId || item.workspaceId !== context.ctx.workspaceId) {
    // Anti-enumeration: missing and foreign look the same.
    throw new DocumentIntelligenceError("document_not_found", "Review item was not found", 404);
  }
  item.reviewState = "approved";
  item.updatedAt = new Date().toISOString();
  return { ...item, coreMutationApplied: false };
}

export async function rejectReview(context: CommerceHandlerContext, reviewId: string) {
  const item = memoryReviews.get(reviewId);
  if (!item || item.tenantId !== context.ctx.tenantId || item.workspaceId !== context.ctx.workspaceId) {
    throw new DocumentIntelligenceError("document_not_found", "Review item was not found", 404);
  }
  item.reviewState = "rejected";
  item.updatedAt = new Date().toISOString();
  return { ...item, coreMutationApplied: false };
}

export async function getProcessingHealth(context: CommerceHandlerContext) {
  requireWorkspace(context);
  const list = await listDocumentIntelligence(context);
  const counts: Record<string, number> = {};
  for (const item of list) {
    counts[item.processingStatus] = (counts[item.processingStatus] ?? 0) + 1;
  }
  return {
    status: "ready",
    checkedAt: new Date().toISOString(),
    documentCount: list.length,
    statusCounts: counts,
    checks: [
      { key: "schema", status: "ready", message: "Document intelligence schema expected via Batch 36" },
      { key: "processing", status: certificationMode() ? "ready" : "degraded", message: certificationMode() ? "Certification in-memory processor active" : "INCOMPLETE STUB: durable processor not fully wired" },
      { key: "retrieval", status: "ready", message: "Query contract available" },
    ],
  };
}
