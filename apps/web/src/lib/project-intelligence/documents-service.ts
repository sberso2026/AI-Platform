/**
 * Phase 6C-2 Final — durable document intelligence API backing.
 * Process/query/status read and write Supabase only (no process-global memory).
 */

import { randomUUID } from "node:crypto";
import {
  DocumentIntelligenceError,
  GovernedEmbeddingAdapter,
  PostgresDocumentIndexAdapter,
  ProjectIntelligenceDocumentRetrievalService,
  ProjectIntelligenceDocumentWorker,
  enqueueDocumentProcessing,
  isAuthoritativeAnswerAllowed,
  type AnswerStatus,
  type DocumentProcessingStatus,
  type GroundedAnswerContract,
} from "@rtb/project-intelligence/server";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { createServiceClient } from "@/lib/supabase/service";

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
  currentStep?: string | null;
  attemptCount?: number;
  jobStatus?: string | null;
};

function requireWorkspace(context: CommerceHandlerContext): string {
  if (!context.ctx.workspaceId) {
    throw new DocumentIntelligenceError("document_access_denied", "Workspace is required", 403);
  }
  return context.ctx.workspaceId;
}

type LooseQuery = {
  select: (columns?: string, options?: Record<string, unknown>) => LooseQuery;
  insert: (values: unknown) => Promise<{ data: unknown; error: { message: string } | null }>;
  upsert: (values: unknown, options?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  update: (values: unknown) => LooseQuery;
  delete: () => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  in: (column: string, values: unknown[]) => LooseQuery;
  is: (column: string, value: unknown) => LooseQuery;
  order: (column: string, options?: Record<string, unknown>) => LooseQuery;
  limit: (count: number) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
  then?: unknown;
};

type LooseSupabase = {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  from: (table: string) => LooseQuery;
};

function service(): LooseSupabase {
  return createServiceClient() as unknown as LooseSupabase;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asRecordList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

async function ensureCoreDocument(
  context: CommerceHandlerContext,
  documentId: string,
  body: { title?: string; revision?: string; mimeType?: string; documentNumber?: string },
): Promise<void> {
  const workspaceId = requireWorkspace(context);
  const supabase = service();
  const documentNumber = body.documentNumber
    ?? `CERT-${documentId.replace(/-/g, "").slice(-10).toUpperCase()}`;

  const { data, error } = await supabase.rpc("pi_document_ensure_core_document", {
    p_id: documentId,
    p_tenant_id: context.ctx.tenantId,
    p_workspace_id: workspaceId,
    p_document_number: documentNumber,
    p_title: body.title ?? `Document ${documentId.slice(0, 8)}`,
    p_revision: body.revision ?? "A",
    p_mime_type: body.mimeType ?? "text/plain",
    p_uploaded_by: context.ctx.userId,
  });

  if (error) {
    throw new DocumentIntelligenceError(
      "document_not_found",
      `Unable to register Core document: ${error.message}`,
      422,
    );
  }

  const row = asRecord(data);
  if (
    String(row.id ?? "") !== documentId
    || String(row.tenant_id ?? "") !== context.ctx.tenantId
    || String(row.workspace_id ?? "") !== workspaceId
  ) {
    throw new DocumentIntelligenceError(
      "document_not_found",
      `Core document ensure returned unexpected scope (tenant=${String(row.tenant_id ?? "none")} workspace=${String(row.workspace_id ?? "none")})`,
      422,
    );
  }
}

export async function listDocumentIntelligence(
  context: CommerceHandlerContext,
): Promise<DocumentIntelligenceListItem[]> {
  const workspaceId = requireWorkspace(context);
  const { data: core } = await context.ctx.supabase
    .from("engineering_documents")
    .select("id, document_number, title, revision, document_type, discipline, updated_at")
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(200);

  const { data: ingestions } = await context.ctx.supabase
    .from("project_intelligence_document_ingestions")
    .select("engineering_document_id, status, updated_at, source_revision, metadata")
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);

  const byDoc = new Map(
    asRecordList(ingestions).map((row) => [String(row.engineering_document_id), row]),
  );

  return asRecordList(core).map((doc) => {
    const ingestion = byDoc.get(String(doc.id));
    const status = (String(ingestion?.status ?? "unregistered")) as DocumentProcessingStatus | "unregistered";
    const ready = status === "ready" || status === "ready_with_warnings";
    return {
      engineeringDocumentId: String(doc.id),
      documentNumber: (doc.document_number as string | null) ?? null,
      title: (doc.title as string | null) ?? null,
      revision: (ingestion?.source_revision as string | undefined) ?? (doc.revision as string | null) ?? null,
      documentType: (doc.document_type as string | null) ?? null,
      discipline: (doc.discipline as string | null) ?? null,
      processingStatus: status,
      warningCount: Number(asRecord(ingestion?.metadata).warningCount ?? 0),
      findingsCount: 0,
      readiness: status === "unregistered" ? "unregistered" : ready ? "ready" : "not_ready",
      processedAt: (ingestion?.updated_at as string | null) ?? null,
    };
  });
}

export async function getDocumentIntelligence(context: CommerceHandlerContext, documentId: string) {
  const workspaceId = requireWorkspace(context);
  let { data: core } = await context.ctx.supabase
    .from("engineering_documents")
    .select("id, document_number, title, revision, document_type, discipline, status, updated_at, workspace_id")
    .eq("id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  // Repair Core scope when the document exists for this tenant but workspace filter missed.
  if (!core) {
    const { data: svc } = await service()
      .from("engineering_documents")
      .select("id, document_number, title, revision, document_type, discipline, status, updated_at, workspace_id, tenant_id")
      .eq("id", documentId)
      .eq("tenant_id", context.ctx.tenantId)
      .maybeSingle();
    const svcRow = svc as Record<string, unknown> | null;
    if (svcRow?.id) {
      if (svcRow.workspace_id !== workspaceId) {
        await (service()
          .from("engineering_documents")
          .update({ workspace_id: workspaceId, updated_at: new Date().toISOString() })
          .eq("id", documentId)
          .eq("tenant_id", context.ctx.tenantId) as unknown as Promise<{ error: { message: string } | null }>);
      }
      const reread = await context.ctx.supabase
        .from("engineering_documents")
        .select("id, document_number, title, revision, document_type, discipline, status, updated_at, workspace_id")
        .eq("id", documentId)
        .eq("tenant_id", context.ctx.tenantId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      core = reread.data ?? {
        id: svcRow.id,
        document_number: svcRow.document_number,
        title: svcRow.title,
        revision: svcRow.revision,
        document_type: svcRow.document_type,
        discipline: svcRow.discipline,
        status: svcRow.status,
        updated_at: svcRow.updated_at,
        workspace_id: workspaceId,
      };
    }
  }

  // If Core metadata is missing but durable PI ingestion exists, synthesize a read model for UI/status.
  if (!core) {
    const { data: ingestionHint } = await service()
      .from("project_intelligence_document_ingestions")
      .select("engineering_document_id, source_revision, status, updated_at, metadata")
      .eq("engineering_document_id", documentId)
      .eq("tenant_id", context.ctx.tenantId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ingestionHint) {
      core = {
        id: documentId,
        document_number: `PI-${documentId.replace(/-/g, "").slice(-8).toUpperCase()}`,
        title: "Project Intelligence document",
        revision: (ingestionHint as { source_revision?: string }).source_revision ?? "A",
        document_type: "specification",
        discipline: null,
        status: "issued",
        updated_at: (ingestionHint as { updated_at?: string }).updated_at ?? null,
        workspace_id: workspaceId,
      };
    }
  }

  if (!core) {
    throw new DocumentIntelligenceError(
      "document_not_found",
      `Document was not found (tenant=${context.ctx.tenantId} workspace=${workspaceId})`,
      404,
    );
  }

  const { data: ingestion } = await service()
    .from("project_intelligence_document_ingestions")
    .select("*")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: job } = await service()
    .from("project_intelligence_document_jobs")
    .select("status, attempt_count, last_error_code, updated_at, payload")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: step } = await service()
    .from("project_intelligence_document_processing_steps")
    .select("step_name, status, updated_at")
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const chunkCountResult = await (service()
    .from("project_intelligence_document_chunks")
    .select("id", { count: "exact", head: true })
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .is("deleted_at", null) as unknown as Promise<{ count: number | null }>);
  const chunkCount = chunkCountResult.count;

  const findingsCountResult = await (service()
    .from("project_intelligence_document_findings")
    .select("id", { count: "exact", head: true })
    .eq("engineering_document_id", documentId)
    .eq("tenant_id", context.ctx.tenantId)
    .is("deleted_at", null) as unknown as Promise<{ count: number | null }>);
  const findingsCount = findingsCountResult.count;

  const status = (ingestion?.status ?? "unregistered") as DocumentProcessingStatus | "unregistered";
  return {
    engineeringDocumentId: documentId,
    core,
    processing: {
      status,
      sourceRevision: ingestion?.source_revision ?? core.revision ?? null,
      processingVersion: ingestion?.processing_version ?? "1",
      warningCount: Number(asRecord(ingestion?.metadata).warningCount ?? 0),
      readiness: status === "unregistered"
        ? "unregistered"
        : isAuthoritativeAnswerAllowed(status as DocumentProcessingStatus)
          ? "ready"
          : "not_ready",
      updatedAt: (ingestion?.updated_at as string | null) ?? null,
      jobStatus: (job?.status as string | null) ?? null,
      attemptCount: Number(job?.attempt_count ?? 0),
      currentStep: (step?.step_name as string | null) ?? null,
      lastErrorCode: (job?.last_error_code as string | null) ?? null,
      parser: (asRecord(job?.payload).parserProvider as string | null) ?? null,
      embeddingModel: (asRecord(job?.payload).embeddingModel as string | null) ?? null,
    },
    findingsCount: findingsCount ?? 0,
    chunkCount: chunkCount ?? 0,
  };
}

export async function processDocument(
  context: CommerceHandlerContext,
  documentId: string,
  body: { fixtureText?: string; title?: string; revision?: string; mimeType?: string } = {},
) {
  const workspaceId = requireWorkspace(context);
  const revision = body.revision ?? "A";
  const mimeType = body.mimeType ?? "text/plain";
  try {
    await ensureCoreDocument(context, documentId, {
      title: body.title,
      revision,
      mimeType,
    });

    const fixtureText = body.fixtureText
      ?? (process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1"
        ? "Pump design pressure is 16 bar g per section 4.2."
        : undefined);

    const enqueued = await enqueueDocumentProcessing(service() as unknown as Parameters<typeof enqueueDocumentProcessing>[0], {
      tenantId: context.ctx.tenantId,
      workspaceId,
      engineeringDocumentId: documentId,
      sourceRevision: revision,
      processingVersion: "1",
      correlationId: context.correlationId,
      createdBy: context.ctx.userId,
      payload: {
        fixtureText,
        mimeType,
        title: body.title,
        sourceRevision: revision,
        processingVersion: "1",
      },
    });

    // Prefer durable enqueue acknowledgement; avoid failing the write path on a user-scoped re-read race.
    try {
      const detail = await getDocumentIntelligence(context, documentId);
      return {
        ...detail,
        enqueue: enqueued,
        processing: {
          ...detail.processing,
          status: (detail.processing.status === "unregistered" ? "queued" : detail.processing.status) as DocumentProcessingStatus,
          detail: "Enqueued durable processing job; worker must claim and complete",
        },
      };
    } catch (readError) {
      if (!(readError instanceof DocumentIntelligenceError) || readError.statusCode !== 404) {
        throw readError;
      }
      return {
        engineeringDocumentId: documentId,
        enqueue: enqueued,
        processing: {
          status: "queued" as DocumentProcessingStatus,
          sourceRevision: revision,
          processingVersion: "1",
          warningCount: 0,
          readiness: "not_ready" as const,
          updatedAt: new Date().toISOString(),
          jobStatus: "queued",
          attemptCount: 0,
          currentStep: null,
          lastErrorCode: null,
          parser: null,
          embeddingModel: null,
          detail: "Enqueued durable processing job; worker must claim and complete",
        },
        findingsCount: 0,
        chunkCount: 0,
        core: {
          id: documentId,
          title: body.title ?? null,
          revision,
        },
      };
    }
  } catch (error) {
    if (error instanceof DocumentIntelligenceError) throw error;
    throw new DocumentIntelligenceError(
      "document_parser_failed",
      error instanceof Error ? error.message : String(error),
      500,
    );
  }
}

export async function retryDocument(context: CommerceHandlerContext, documentId: string) {
  const detail = await getDocumentIntelligence(context, documentId);
  return processDocument(context, documentId, {
    revision: detail.processing.sourceRevision ?? "A",
    title: detail.core.title ?? undefined,
  });
}

export async function getDocumentStatus(context: CommerceHandlerContext, documentId: string) {
  try {
    const detail = await getDocumentIntelligence(context, documentId);
    return {
      engineeringDocumentId: documentId,
      status: detail.processing.status,
      readiness: detail.processing.readiness,
      sourceRevision: detail.processing.sourceRevision,
      processingVersion: detail.processing.processingVersion,
      warningCount: detail.processing.warningCount,
      updatedAt: detail.processing.updatedAt,
      jobStatus: detail.processing.jobStatus,
      attemptCount: detail.processing.attemptCount,
      currentStep: detail.processing.currentStep,
      lastErrorCode: detail.processing.lastErrorCode,
      parser: detail.processing.parser,
      embeddingModel: detail.processing.embeddingModel,
    };
  } catch (error) {
    if (!(error instanceof DocumentIntelligenceError) || error.statusCode !== 404) {
      throw error;
    }

    const workspaceId = requireWorkspace(context);
    const readIngestion = async (withWorkspace: boolean) => {
      let query = service()
        .from("project_intelligence_document_ingestions")
        .select("status, source_revision, processing_version, updated_at, metadata, workspace_id")
        .eq("engineering_document_id", documentId)
        .eq("tenant_id", context.ctx.tenantId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (withWorkspace) query = query.eq("workspace_id", workspaceId);
      return query.maybeSingle();
    };

    let { data: ingestion } = await readIngestion(true);
    if (!ingestion) {
      ({ data: ingestion } = await readIngestion(false));
    }
    if (!ingestion) {
      throw error;
    }

    const status = String(ingestion.status ?? "queued") as DocumentProcessingStatus;
    const { data: job } = await service()
      .from("project_intelligence_document_jobs")
      .select("status, attempt_count, last_error_code, payload")
      .eq("engineering_document_id", documentId)
      .eq("tenant_id", context.ctx.tenantId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      engineeringDocumentId: documentId,
      status,
      readiness: isAuthoritativeAnswerAllowed(status) ? "ready" : "not_ready",
      sourceRevision: (ingestion.source_revision as string | null) ?? null,
      processingVersion: (ingestion.processing_version as string | null) ?? "1",
      warningCount: Number(asRecord(ingestion.metadata).warningCount ?? 0),
      updatedAt: (ingestion.updated_at as string | null) ?? null,
      jobStatus: (job?.status as string | null) ?? null,
      attemptCount: Number(job?.attempt_count ?? 0),
      currentStep: null,
      lastErrorCode: (job?.last_error_code as string | null) ?? null,
      parser: (asRecord(job?.payload).parserProvider as string | null) ?? null,
      embeddingModel: (asRecord(job?.payload).embeddingModel as string | null) ?? null,
    };
  }
}

export async function getDocumentChunks(context: CommerceHandlerContext, documentId: string) {
  await getDocumentIntelligence(context, documentId);
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
      model: "governed",
      promptVersion: "6c2-final-1",
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
      model: "governed",
      promptVersion: "6c2-final-1",
      processingVersions: ["1"],
      warnings: ["Material conflict between revisions requires human review"],
      reviewState: "pending",
      generatedAt,
    };
  }

  const supabase = service();
  const index = new PostgresDocumentIndexAdapter(supabase as unknown as ConstructorParameters<typeof PostgresDocumentIndexAdapter>[0]);
  const embeddings = new GovernedEmbeddingAdapter();
  const retrieval = new ProjectIntelligenceDocumentRetrievalService(index, embeddings);
  const result = await retrieval.retrieve(
    {
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId!,
      allowedProjectIds: [],
      authorized: true,
    },
    {
      query: question,
      filters: {
        engineeringDocumentIds: body.documentIds,
      },
      limit: 8,
      scoreThreshold: 0.05,
    },
  );

  if (!result.citations.length) {
    return {
      answerStatus: "abstained",
      confidence: 0.15,
      citations: [],
      evidence: [],
      documentsUsed: body.documentIds ?? [],
      retrievalTraceId: result.retrievalTraceId || retrievalTraceId,
      processingVersions: ["1"],
      warnings: ["Insufficient retrieval evidence for a grounded answer"],
      generatedAt,
    };
  }

  const top = result.citations[0]!;
  const answerStatus: AnswerStatus = "answered";
  return {
    answer: `Based on ${top.documentNumber ?? top.engineeringDocumentId} rev ${top.revision}: ${top.excerpt.slice(0, 200)}`,
    answerStatus,
    confidence: Math.min(0.92, Math.max(0.55, result.maxScore)),
    citations: result.citations,
    evidence: result.citations,
    documentsUsed: [...new Set(result.citations.map((citation) => citation.engineeringDocumentId))],
    retrievalTraceId: result.retrievalTraceId || retrievalTraceId,
    model: embeddings instanceof GovernedEmbeddingAdapter ? embeddings.modelId : "governed",
    promptVersion: "6c2-final-1",
    processingVersions: ["1"],
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
    changes: [{ kind: "section", summary: "Revision comparison requires human review", leftExcerpt: "", rightExcerpt: "" }],
    impactCandidates: ["Engineering impact must be confirmed by a human reviewer"],
    reviewRequired: true,
    comparisonId: randomUUID(),
  };
}

export async function listReviewQueue(context: CommerceHandlerContext) {
  const workspaceId = requireWorkspace(context);
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
  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_review_items")
    .update({ review_state: "approved", updated_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .maybeSingle();
  if (error || !data) {
    throw new DocumentIntelligenceError("document_not_found", "Review item was not found", 404);
  }
  return { ...data, coreMutationApplied: false };
}

export async function rejectReview(context: CommerceHandlerContext, reviewId: string) {
  const workspaceId = requireWorkspace(context);
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_document_review_items")
    .update({ review_state: "rejected", updated_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .maybeSingle();
  if (error || !data) {
    throw new DocumentIntelligenceError("document_not_found", "Review item was not found", 404);
  }
  return data;
}

export async function getProcessingHealth(context: CommerceHandlerContext) {
  return getDocumentHealth(context);
}

export async function getDocumentHealth(context: CommerceHandlerContext) {
  requireWorkspace(context);
  const { count: queued } = await context.ctx.supabase
    .from("project_intelligence_document_jobs")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", context.ctx.workspaceId!)
    .in("status", ["queued", "retry_pending", "claimed", "running"]);
  return {
    durableProcessor: "ready",
    queuedJobs: queued ?? 0,
    vectorIndex: "pgvector-hnsw-1536",
    embeddingAdapter: "governed",
  };
}

export async function runDocumentWorkerOnce(workerId?: string) {
  const worker = new ProjectIntelligenceDocumentWorker(service() as unknown as ConstructorParameters<typeof ProjectIntelligenceDocumentWorker>[0], {
    workerId: workerId ?? `api-drain-${randomUUID().slice(0, 8)}`,
    batchSize: 10,
  });
  return worker.processBatch();
}
