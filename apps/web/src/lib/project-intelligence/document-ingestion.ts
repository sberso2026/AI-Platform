/**
 * Canonical document ingest enqueue + presentation.
 * Intentionally does not import @rtb/project-intelligence/server so ordinary
 * document APIs (upload-complete, document GET, Ask) do not load PDF parsers.
 */

import {
  enqueueDocumentProcessing,
  mapDocumentIngestionPresentation,
} from "@rtb/project-intelligence/retrieval";
import { createServiceClient } from "@/lib/supabase/service";

type LooseQuery = {
  select: (columns?: string, options?: Record<string, unknown>) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  in: (column: string, values: unknown[]) => LooseQuery;
  is: (column: string, value: unknown) => LooseQuery;
  order: (column: string, options?: Record<string, unknown>) => LooseQuery;
  limit: (count: number) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
};

type LooseSupabase = {
  from: (table: string) => LooseQuery;
};

function service(): LooseSupabase {
  return createServiceClient() as unknown as LooseSupabase;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function enqueueCanonicalDocumentIngestion(input: {
  tenantId: string;
  workspaceId: string;
  documentId: string;
  engineeringProjectId?: string | null;
  revision: string;
  mimeType: string;
  fileName?: string;
  createdBy?: string;
  correlationId?: string;
  reindex?: boolean;
}) {
  const processingVersion = input.reindex ? `reindex-${Date.now()}` : "1";
  const enqueued = await enqueueDocumentProcessing(createServiceClient(), {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    engineeringDocumentId: input.documentId,
    engineeringProjectId: input.engineeringProjectId ?? undefined,
    sourceRevision: input.revision,
    processingVersion,
    correlationId: input.correlationId,
    createdBy: input.createdBy,
    payload: {
      mimeType: input.mimeType,
      fileName: input.fileName,
      sourceRevision: input.revision,
      processingVersion,
      reindex: Boolean(input.reindex),
    },
  });
  try {
    const { drainDocumentJobsInBackground } = await import("./documents-service");
    await drainDocumentJobsInBackground();
  } catch (error) {
    console.error("document worker drain failed", error);
  }
  return enqueued;
}

export async function getEngineeringDocumentIngestionPresentation(input: {
  tenantId: string;
  workspaceId: string;
  documentId: string;
  hasSourceFile: boolean;
}) {
  const supabase = service();
  const { data: ingestion } = await supabase
    .from("project_intelligence_document_ingestions")
    .select("status, metadata, updated_at")
    .eq("engineering_document_id", input.documentId)
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: job } = await supabase
    .from("project_intelligence_document_jobs")
    .select("status, last_error_message, payload")
    .eq("engineering_document_id", input.documentId)
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const chunkCountResult = await (supabase
    .from("project_intelligence_document_chunks")
    .select("id, page_start", { count: "exact" })
    .eq("engineering_document_id", input.documentId)
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null) as unknown as Promise<{
      count: number | null;
      data: Array<{ page_start?: number | null }> | null;
    }>);

  const pages = new Set(
    (chunkCountResult.data ?? [])
      .map((row) => row.page_start)
      .filter((page): page is number => typeof page === "number" && page > 0),
  );
  const warnings: string[] = [];
  const metadata = asRecord(ingestion?.metadata);
  if (Number(metadata.warningCount ?? 0) > 0) {
    warnings.push("Some content could not be extracted completely.");
  }
  if (asRecord(job?.payload).lexicalFallback) {
    warnings.push("Keyword search is active; similarity search is not available for this index.");
  }
  if (job?.last_error_message && (ingestion?.status === "failed" || job?.status === "dead_letter")) {
    warnings.push("Indexing did not finish. Try again or contact support.");
  }

  return mapDocumentIngestionPresentation({
    hasSourceFile: input.hasSourceFile,
    processingStatus: (ingestion?.status as string | null) ?? null,
    chunkCount: chunkCountResult.count ?? 0,
    pagesIndexed: pages.size,
    warnings,
    jobStatus: (job?.status as string | null) ?? null,
  });
}

export async function listEngineeringDocumentIngestionSummaries(input: {
  tenantId: string;
  workspaceId: string;
  documents: Array<{ id: string; file_path?: string | null }>;
}) {
  const ids = input.documents.map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return new Map<string, ReturnType<typeof mapDocumentIngestionPresentation>>();
  const supabase = service();
  const ingestions = await (supabase
    .from("project_intelligence_document_ingestions")
    .select("engineering_document_id, status, metadata, updated_at")
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .in("engineering_document_id", ids)
    .order("updated_at", { ascending: false })
    .limit(200) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
  }>);
  const jobs = await (supabase
    .from("project_intelligence_document_jobs")
    .select("engineering_document_id, status, last_error_message, payload, updated_at")
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .in("engineering_document_id", ids)
    .order("updated_at", { ascending: false })
    .limit(200) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
  }>);
  const chunks = await (supabase
    .from("project_intelligence_document_chunks")
    .select("engineering_document_id, page_start")
    .eq("tenant_id", input.tenantId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .in("engineering_document_id", ids)
    .limit(4000) as unknown as Promise<{
    data: Array<{ engineering_document_id?: string; page_start?: number | null }> | null;
  }>);

  const latestIngestion = new Map<string, Record<string, unknown>>();
  for (const row of ingestions.data ?? []) {
    const id = String(row.engineering_document_id ?? "");
    if (id && !latestIngestion.has(id)) latestIngestion.set(id, row);
  }
  const latestJob = new Map<string, Record<string, unknown>>();
  for (const row of jobs.data ?? []) {
    const id = String(row.engineering_document_id ?? "");
    if (id && !latestJob.has(id)) latestJob.set(id, row);
  }
  const chunkCount = new Map<string, { count: number; pages: Set<number> }>();
  for (const row of chunks.data ?? []) {
    const id = String(row.engineering_document_id ?? "");
    if (!id) continue;
    const current = chunkCount.get(id) ?? { count: 0, pages: new Set<number>() };
    current.count += 1;
    if (typeof row.page_start === "number" && row.page_start > 0) current.pages.add(row.page_start);
    chunkCount.set(id, current);
  }

  const summaries = new Map<string, ReturnType<typeof mapDocumentIngestionPresentation>>();
  for (const document of input.documents) {
    const ingestion = latestIngestion.get(document.id);
    const job = latestJob.get(document.id);
    const chunk = chunkCount.get(document.id);
    summaries.set(
      document.id,
      mapDocumentIngestionPresentation({
        hasSourceFile: Boolean(document.file_path),
        processingStatus: (ingestion?.status as string | null) ?? null,
        chunkCount: chunk?.count ?? 0,
        pagesIndexed: chunk?.pages.size ?? 0,
        jobStatus: (job?.status as string | null) ?? null,
      }),
    );
  }
  return summaries;
}
