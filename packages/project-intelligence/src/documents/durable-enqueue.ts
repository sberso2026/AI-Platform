import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { buildDocumentJobIdempotencyKey } from "./jobs";

export interface EnqueueDocumentProcessingInput {
  tenantId: string;
  workspaceId: string;
  engineeringDocumentId: string;
  engineeringProjectId?: string;
  sourceRevision: string;
  processingVersion?: string;
  correlationId?: string;
  createdBy?: string;
  payload?: Record<string, unknown>;
  jobType?: string;
}

export interface EnqueueDocumentProcessingResult {
  ingestionId: string;
  processingRunId: string;
  jobId: string;
  outboxId: string | null;
  reused: boolean;
}

export async function enqueueDocumentProcessing(
  supabase: SupabaseClient,
  input: EnqueueDocumentProcessingInput,
): Promise<EnqueueDocumentProcessingResult> {
  const processingVersion = input.processingVersion ?? "1";
  const correlationId = input.correlationId ?? randomUUID();
  const idempotencyKey = buildDocumentJobIdempotencyKey({
    jobName: "project_intelligence.document.process",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    engineeringDocumentId: input.engineeringDocumentId,
    sourceRevision: input.sourceRevision,
    processingVersion,
  });

  const { data: coreDoc, error: coreError } = await supabase
    .from("engineering_documents")
    .select("id, tenant_id, workspace_id")
    .eq("id", input.engineeringDocumentId)
    .maybeSingle();
  if (coreError) {
    throw new Error(`engineering_documents lookup failed: ${coreError.message}`);
  }
  if (!coreDoc) {
    throw new Error("engineering_documents row is required before durable enqueue");
  }
  if (String((coreDoc as { tenant_id?: string }).tenant_id) !== input.tenantId) {
    throw new Error("engineering_documents tenant_id does not match enqueue tenant scope");
  }

  const { data, error } = await supabase.rpc("pi_document_enqueue_processing", {
    p_tenant_id: input.tenantId,
    p_workspace_id: input.workspaceId,
    p_engineering_document_id: input.engineeringDocumentId,
    p_engineering_project_id: input.engineeringProjectId ?? null,
    p_source_revision: input.sourceRevision,
    p_processing_version: processingVersion,
    p_correlation_id: correlationId,
    p_idempotency_key: idempotencyKey,
    p_payload: {
      ...(input.payload ?? {}),
      jobType: input.jobType ?? "project_intelligence.document.process",
    },
    p_created_by: input.createdBy ?? null,
  });

  if (error) {
    throw new Error(`pi_document_enqueue_processing failed: ${error.message}`);
  }

  const row = data as {
    ingestion_id: string;
    processing_run_id: string;
    job_id: string;
    outbox_id: string | null;
    reused?: boolean;
  };

  return {
    ingestionId: row.ingestion_id,
    processingRunId: row.processing_run_id,
    jobId: row.job_id,
    outboxId: row.outbox_id,
    reused: Boolean(row.reused),
  };
}

export function contentChecksum(value: string | Uint8Array): string {
  const buf = typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
  return createHash("sha256").update(buf).digest("hex");
}
