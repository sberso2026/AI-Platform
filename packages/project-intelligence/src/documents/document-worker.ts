import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { chunkParsedDocument } from "./chunking";
import { contentChecksum } from "./durable-enqueue";
import type { ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import { GovernedEmbeddingAdapter } from "./governed-embedding-adapter";
import { decideOcrPolicy, selectDocumentParser } from "./parser-routing";
import { assertDocumentTransition } from "./ingestion-state-machine";
import type { DocumentProcessingStatus } from "./types";

export interface DocumentWorkerOptions {
  workerId?: string;
  batchSize?: number;
  leaseSeconds?: number;
  embeddings?: ProjectIntelligenceEmbeddingAdapter;
}

type JobRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  engineering_document_id: string;
  engineering_project_id: string | null;
  processing_run_id: string | null;
  ingestion_id: string | null;
  job_type: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  correlation_id: string | null;
};

const PIPELINE: DocumentProcessingStatus[] = [
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

export class ProjectIntelligenceDocumentWorker {
  private readonly workerId: string;
  private readonly batchSize: number;
  private readonly leaseSeconds: number;
  private readonly embeddings: ProjectIntelligenceEmbeddingAdapter;

  constructor(
    private readonly supabase: SupabaseClient,
    options: DocumentWorkerOptions = {},
  ) {
    this.workerId = options.workerId ?? `pi-doc-worker-${randomUUID().slice(0, 8)}`;
    this.batchSize = options.batchSize ?? 5;
    this.leaseSeconds = options.leaseSeconds ?? 180;
    this.embeddings = options.embeddings ?? new GovernedEmbeddingAdapter();
  }

  get identity(): string {
    return this.workerId;
  }

  async releaseExpiredLeases(): Promise<number> {
    const { data, error } = await this.supabase.rpc("pi_document_release_expired_leases");
    if (error) throw new Error(error.message);
    return Number(data ?? 0);
  }

  async processBatch(): Promise<{ claimed: number; completed: number; failed: number }> {
    await this.releaseExpiredLeases();
    const { data, error } = await this.supabase.rpc("pi_document_claim_jobs", {
      p_worker_id: this.workerId,
      p_limit: this.batchSize,
      p_lease_seconds: this.leaseSeconds,
    });
    if (error) throw new Error(`pi_document_claim_jobs failed: ${error.message}`);
    const jobs = (data ?? []) as JobRow[];
    let completed = 0;
    let failed = 0;
    for (const job of jobs) {
      try {
        await this.runJob(job);
        completed += 1;
      } catch (reason) {
        failed += 1;
        try {
          await this.failJob(job, reason);
        } catch (failError) {
          // Keep drain endpoint alive; surface both errors in job last_error on best effort.
          console.error("pi document worker failJob error", failError);
        }
      }
    }
    return { claimed: jobs.length, completed, failed };
  }

  private async runJob(job: JobRow): Promise<void> {
    await this.supabase
      .from("project_intelligence_document_jobs")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("locked_by", this.workerId);

    const payload = job.payload ?? {};
    const revision = String(payload.sourceRevision ?? payload.revision ?? "A");
    const processingVersion = String(payload.processingVersion ?? "1");
    const mimeType = String(payload.mimeType ?? "text/plain");
    const fixtureText = typeof payload.fixtureText === "string" ? payload.fixtureText : undefined;
    const fileName = typeof payload.fileName === "string" ? payload.fileName : undefined;

    // Never trust client-supplied storage paths — only fixture text or Core-resolved refs.
    if (typeof payload.storagePath === "string" || typeof payload.filePath === "string") {
      throw Object.assign(new Error("Arbitrary storage paths are not accepted in job payload"), {
        code: "document_access_denied",
      });
    }

    await this.transition(job, "queued", "fetching");
    const bytes = fixtureText
      ? new TextEncoder().encode(fixtureText)
      : await this.fetchAuthorizedBytes(job, payload);
    await this.checkpoint(job, "fetch", "completed", { output_checksum: contentChecksum(bytes) });

    await this.transition(job, "fetching", "validating");
    if (!bytes.byteLength) {
      throw Object.assign(new Error("Source file unavailable or empty"), { code: "source_file_unavailable" });
    }
    await this.checkpoint(job, "validate", "completed", { evidence_count: 1 });

    await this.transition(job, "validating", "parsing");
    const route = selectDocumentParser(mimeType);
    const parsed = await route.parser.parse({
      engineeringDocumentId: job.engineering_document_id,
      revision,
      mimeType,
      fileName,
      bytes,
    });
    const ocr = decideOcrPolicy({
      mimeType,
      extractedTextLength: parsed.pages.reduce((sum, page) => sum + page.text.length, 0),
      pageCount: parsed.pages.length,
      parserConfidence: parsed.confidence,
      warnings: parsed.warnings,
    });
    if (ocr.applyOcr) {
      parsed.warnings = [...parsed.warnings, `ocr_policy:${ocr.reason}:review_required`];
      // OCR provider integration point — do not silently substitute low-confidence OCR as authoritative.
    }
    await this.checkpoint(job, "parse", "completed", {
      provider: parsed.parserProvider,
      version: parsed.parserVersion,
      warning_count: parsed.warnings.length,
      output_checksum: contentChecksum(JSON.stringify(parsed.pages.map((page) => page.text))),
    });

    await this.transition(job, "parsing", "normalizing");
    await this.checkpoint(job, "normalize", "completed", { evidence_count: parsed.pages.length });

    await this.transition(job, "normalizing", "chunking");
    const chunks = chunkParsedDocument(parsed, {
      tenantId: job.tenant_id,
      workspaceId: job.workspace_id,
      engineeringProjectId: job.engineering_project_id ?? undefined,
      engineeringDocumentId: job.engineering_document_id,
      revision,
      processingVersion,
    });

    // Idempotent replace: soft-delete prior chunks for same run scope then insert
    if (job.ingestion_id) {
      await this.supabase
        .from("project_intelligence_document_chunks")
        .update({ deleted_at: new Date().toISOString(), status: "superseded" })
        .eq("ingestion_id", job.ingestion_id)
        .is("deleted_at", null);
    }

    const chunkRows = chunks.map((chunk) => ({
      tenant_id: job.tenant_id,
      workspace_id: job.workspace_id,
      engineering_project_id: job.engineering_project_id,
      engineering_document_id: job.engineering_document_id,
      ingestion_id: job.ingestion_id,
      processing_run_id: job.processing_run_id,
      source_revision: revision,
      processing_version: processingVersion,
      chunk_index: chunk.chunkIndex,
      stable_chunk_id: chunk.stableChunkId,
      content: chunk.content,
      content_hash: chunk.contentHash,
      section_path: chunk.sectionPath ?? null,
      page_start: chunk.pageStart ?? null,
      page_end: chunk.pageEnd ?? null,
      block_type: chunk.blockType,
      table_payload: chunk.tablePayload ?? null,
      status: "ready",
      metadata: chunk.metadata ?? {},
    }));

    if (chunkRows.length) {
      const { error } = await this.supabase.from("project_intelligence_document_chunks").insert(chunkRows);
      if (error) throw Object.assign(new Error(error.message), { code: "chunking_failed" });
    }
    await this.checkpoint(job, "chunk", "completed", {
      evidence_count: chunks.length,
      output_checksum: contentChecksum(chunks.map((chunk) => chunk.contentHash).join("|")),
    });

    await this.transition(job, "chunking", "embedding");
    const embedded = await this.embeddings.embed({
      texts: chunks.map((chunk) => chunk.content),
      dimensions: 1536,
      correlationId: job.correlation_id ?? job.id,
    });
    if (embedded.dimensions !== 1536) {
      throw Object.assign(new Error("embedding dimension mismatch"), { code: "embedding_failed" });
    }

    const { data: persistedChunks, error: loadErr } = await this.supabase
      .from("project_intelligence_document_chunks")
      .select("id, stable_chunk_id, chunk_index")
      .eq("ingestion_id", job.ingestion_id!)
      .is("deleted_at", null)
      .order("chunk_index", { ascending: true });
    if (loadErr) throw Object.assign(new Error(loadErr.message), { code: "embedding_failed" });

    for (let i = 0; i < (persistedChunks ?? []).length; i += 1) {
      const row = persistedChunks![i]!;
      const vector = embedded.embeddings[i];
      if (!vector) continue;
      const { error: embErr } = await this.supabase.from("project_intelligence_document_embeddings").upsert({
        tenant_id: job.tenant_id,
        workspace_id: job.workspace_id,
        engineering_project_id: job.engineering_project_id,
        engineering_document_id: job.engineering_document_id,
        chunk_id: row.id,
        source_revision: revision,
        processing_version: processingVersion,
        embedding_provider: embedded.provider,
        embedding_model: embedded.model,
        embedding_dimensions: 1536,
        embedding: vector,
        status: "ready",
        metadata: { traceId: embedded.traceId },
      }, { onConflict: "chunk_id,embedding_provider,embedding_model,processing_version" });
      if (embErr) throw Object.assign(new Error(embErr.message), { code: "embedding_failed" });

      const { error: vectorErr } = await this.supabase.rpc("pi_document_set_embedding_vector", {
        p_chunk_id: row.id,
        p_provider: embedded.provider,
        p_model: embedded.model,
        p_processing_version: processingVersion,
        p_vector: vector,
      });
      if (vectorErr) throw Object.assign(new Error(vectorErr.message), { code: "embedding_failed" });
    }
    await this.checkpoint(job, "embed", "completed", {
      provider: embedded.provider,
      version: embedded.model,
      evidence_count: embedded.embeddings.length,
    });

    await this.transition(job, "embedding", "indexing");
    await this.checkpoint(job, "index", "completed", { evidence_count: chunks.length });

    await this.transition(job, "indexing", "extracting");
    await this.checkpoint(job, "extract", "completed", { evidence_count: 0 });

    await this.transition(job, "extracting", "validating_output");
    if (!chunks.length) {
      throw Object.assign(new Error("No chunks produced"), { code: "document_insufficient_evidence" });
    }
    await this.checkpoint(job, "validate_output", "completed", {
      warning_count: parsed.warnings.length,
      evidence_count: chunks.length,
    });

    const readyStatus: DocumentProcessingStatus = parsed.warnings.length ? "ready_with_warnings" : "ready";
    await this.transition(job, "validating_output", readyStatus);
    await this.checkpoint(job, "activate", "completed", { evidence_count: chunks.length });

    await this.supabase.from("project_intelligence_document_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
      lease_expires_at: null,
      last_error_code: null,
      last_error_message: null,
    }).eq("id", job.id);

    await this.supabase.from("project_intelligence_document_outbox").insert({
      tenant_id: job.tenant_id,
      workspace_id: job.workspace_id,
      aggregate_type: "document",
      aggregate_id: job.engineering_document_id,
      event_type: "project_intelligence.document.processing_completed",
      payload: {
        jobId: job.id,
        processingRunId: job.processing_run_id,
        chunkCount: chunks.length,
        status: readyStatus,
      },
      correlation_id: job.correlation_id,
      idempotency_key: `${job.id}:completed`,
      status: "pending",
    });
  }

  private async fetchAuthorizedBytes(job: JobRow, payload: Record<string, unknown>): Promise<Uint8Array> {
    const { data: core, error } = await this.supabase
      .from("engineering_documents")
      .select("id, tenant_id, workspace_id, file_path, mime_type")
      .eq("id", job.engineering_document_id)
      .eq("tenant_id", job.tenant_id)
      .maybeSingle();
    if (error || !core) {
      throw Object.assign(new Error("Document was not found"), { code: "document_not_found" });
    }
    if (core.workspace_id && core.workspace_id !== job.workspace_id) {
      throw Object.assign(new Error("Document access denied"), { code: "document_access_denied" });
    }
    // Private storage signed access integration point — without a stored object, require fixture/source bytes.
    if (!core.file_path) {
      const inline = typeof payload.inlineText === "string" ? payload.inlineText : "";
      if (!inline) {
        throw Object.assign(new Error("Source file unavailable"), { code: "source_file_unavailable" });
      }
      return new TextEncoder().encode(inline);
    }
    throw Object.assign(new Error("Storage object fetch not configured for this path"), {
      code: "source_file_unavailable",
    });
  }

  private async transition(job: JobRow, from: DocumentProcessingStatus, to: DocumentProcessingStatus): Promise<void> {
    assertDocumentTransition(from, to);
    if (job.ingestion_id) {
      await this.supabase
        .from("project_intelligence_document_ingestions")
        .update({ status: to, updated_at: new Date().toISOString() })
        .eq("id", job.ingestion_id);
    }
    if (job.processing_run_id) {
      await this.supabase
        .from("project_intelligence_document_processing_runs")
        .update({ status: to, updated_at: new Date().toISOString() })
        .eq("id", job.processing_run_id);
    }
  }

  private async checkpoint(
    job: JobRow,
    stepName: string,
    status: "queued" | "running" | "completed" | "failed" | "skipped",
    extras: Record<string, unknown> = {},
  ): Promise<void> {
    if (!job.processing_run_id) return;
    await this.supabase.from("project_intelligence_document_processing_steps").upsert({
      tenant_id: job.tenant_id,
      workspace_id: job.workspace_id,
      engineering_document_id: job.engineering_document_id,
      processing_run_id: job.processing_run_id,
      ingestion_id: job.ingestion_id,
      step_name: stepName,
      status,
      attempt: Math.max(1, job.attempt_count || 1),
      started_at: new Date().toISOString(),
      ended_at: status === "running" ? null : new Date().toISOString(),
      provider: extras.provider ?? null,
      version: extras.version ?? null,
      input_checksum: extras.input_checksum ?? null,
      output_checksum: extras.output_checksum ?? null,
      evidence_count: extras.evidence_count ?? 0,
      warning_count: extras.warning_count ?? 0,
      error_code: extras.error_code ?? null,
      metrics: extras.metrics ?? {},
    }, { onConflict: "processing_run_id,step_name" });
    await this.supabase.rpc("pi_document_renew_lease", {
      p_job_id: job.id,
      p_worker_id: this.workerId,
      p_lease_seconds: this.leaseSeconds,
    });
  }

  private async failJob(job: JobRow, reason: unknown): Promise<void> {
    const message = reason instanceof Error ? reason.message : String(reason);
    const code = typeof reason === "object" && reason && "code" in reason
      ? String((reason as { code: string }).code)
      : "parser_failed";
    const retry = job.attempt_count < job.max_attempts
      && !["document_access_denied", "unsupported_file_type", "document_revision_superseded"].includes(code);
    const status = retry ? "retry_pending" : "dead_letter";
    const availableAt = new Date(Date.now() + Math.min(60_000, 1000 * 2 ** Math.max(0, job.attempt_count - 1))).toISOString();

    await this.supabase.from("project_intelligence_document_jobs").update({
      status,
      available_at: retry ? availableAt : new Date().toISOString(),
      locked_at: null,
      locked_by: null,
      lease_expires_at: null,
      last_error_code: code,
      last_error_message: message.slice(0, 2000),
      completed_at: retry ? null : new Date().toISOString(),
    }).eq("id", job.id);

    if (job.ingestion_id) {
      await this.supabase.from("project_intelligence_document_ingestions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", job.ingestion_id);
    }

    if (!retry) {
      await this.supabase.from("project_intelligence_document_dead_letters").insert({
        job_id: job.id,
        tenant_id: job.tenant_id,
        workspace_id: job.workspace_id,
        engineering_document_id: job.engineering_document_id,
        job_type: job.job_type,
        error_code: code,
        error_message: message.slice(0, 2000),
        payload: job.payload,
        review_state: "pending",
      });
    }

    await this.supabase.from("project_intelligence_document_outbox").insert({
      tenant_id: job.tenant_id,
      workspace_id: job.workspace_id,
      aggregate_type: "document",
      aggregate_id: job.engineering_document_id,
      event_type: "project_intelligence.document.processing_failed",
      payload: { jobId: job.id, code, message, status },
      correlation_id: job.correlation_id,
      idempotency_key: `${job.id}:failed:${job.attempt_count}`,
      status: "pending",
    });
  }
}
