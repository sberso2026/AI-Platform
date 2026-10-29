/** Canonical knowledge source registry + invalidation + reindex foundation. */

import { buildEos3Provenance } from "../commerce/eos3-provenance";
import type { Eos3AuthorityClass, Eos3KnowledgeTier } from "./eos3-knowledge-tiers";
import { TIER_AUTHORITY } from "./eos3-knowledge-tiers";

export type DocumentStatus = "draft" | "issued" | "approved" | "superseded" | "withdrawn" | "unknown";
export type SourceEffectiveState = "CURRENT" | "SUPERSEDED" | "HISTORICAL" | "WITHDRAWN" | "REVOKED";
export type IngestionStatus =
  | "REGISTER"
  | "VALIDATE"
  | "AUTHORIZE"
  | "EXTRACT"
  | "CHUNK"
  | "INDEX"
  | "VERIFY"
  | "AVAILABLE"
  | "INVALIDATED";

export type Eos3KnowledgeSource = {
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  sourceType: "canonical_object" | "controlled_document" | "enterprise" | "external" | "model";
  knowledgeTier: Eos3KnowledgeTier;
  authorityClass: Eos3AuthorityClass;
  revisionOrVersion: string | null;
  ownerId: string | null;
  documentStatus: DocumentStatus;
  effectiveState: SourceEffectiveState;
  jurisdictionContext: string | null;
  standardsProfileRef: string | null;
  accessScope: "workspace" | "project" | "tenant_denied";
  ingestionStatus: IngestionStatus;
  indexStatus: "not_indexed" | "indexed" | "stale" | "removed";
  contentFingerprint: string | null;
  indexFingerprint: string | null;
  containsSensitiveMarkers: boolean;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Eos3KnowledgeChunk = {
  chunkId: string;
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  text: string;
  pageOrSection: string | null;
  authorityClass: Eos3AuthorityClass;
  effectiveState: SourceEffectiveState;
  documentStatus: DocumentStatus;
  revisionOrVersion: string | null;
  ingestionRecordId: string;
  evidenceClassification: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION" | "RESULT" | "HUMAN_DECISION";
  embedding: number[] | null;
  instructionIsolated: true;
};

export type KnowledgeAuditAction =
  | "source_registered"
  | "source_indexed"
  | "source_superseded"
  | "source_removed"
  | "source_revoked"
  | "retrieval_performed"
  | "context_assembled"
  | "reindex_performed";

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

const SENSITIVE_PATTERNS = [/api[_-]?key/i, /secret/i, /bearer\s+[a-z0-9._-]+/i, /password\s*=/i];

export function containsSensitiveData(text: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(text));
}

export class Eos3KnowledgeRegistry {
  sources = new Map<string, Eos3KnowledgeSource>();
  chunks = new Map<string, Eos3KnowledgeChunk>();
  audit: Array<{ action: KnowledgeAuditAction; sourceId: string | null; at: string; detail: Record<string, unknown> }> =
    [];

  register(input: {
    tenantId: string;
    workspaceId: string;
    projectId?: string | null;
    sourceType: Eos3KnowledgeSource["sourceType"];
    knowledgeTier: Eos3KnowledgeTier;
    ownerId: string | null;
    revisionOrVersion?: string | null;
    documentStatus?: DocumentStatus;
    effectiveState?: SourceEffectiveState;
    jurisdictionContext?: string | null;
    standardsProfileRef?: string | null;
    contentFingerprint?: string | null;
  }): Eos3KnowledgeSource {
    if (!input.ownerId && input.sourceType !== "model") {
      throw new Error("unowned_source_not_indexable");
    }
    const sourceId = id();
    const source: Eos3KnowledgeSource = {
      sourceId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId ?? null,
      sourceType: input.sourceType,
      knowledgeTier: input.knowledgeTier,
      authorityClass: TIER_AUTHORITY[input.knowledgeTier],
      revisionOrVersion: input.revisionOrVersion ?? null,
      ownerId: input.ownerId,
      documentStatus: input.documentStatus ?? "unknown",
      effectiveState: input.effectiveState ?? "CURRENT",
      jurisdictionContext: input.jurisdictionContext ?? null,
      standardsProfileRef: input.standardsProfileRef ?? null,
      accessScope: "workspace",
      ingestionStatus: "REGISTER",
      indexStatus: "not_indexed",
      contentFingerprint: input.contentFingerprint ?? null,
      indexFingerprint: null,
      containsSensitiveMarkers: false,
      provenance: buildEos3Provenance({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId ?? null,
        objectId: sourceId,
        revisionId: null,
        source: "eos3.knowledge.registry",
        actorId: input.ownerId,
        authority: "knowledge_registrar",
        method: "register",
        toolOrModel: null,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
      createdAt: now(),
      updatedAt: now(),
    };
    this.sources.set(sourceId, source);
    this.audit.push({ action: "source_registered", sourceId, at: now(), detail: { sourceType: source.sourceType } });
    return source;
  }

  advanceIngestion(sourceId: string, next: IngestionStatus): void {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error("source_not_found");
    this.sources.set(sourceId, { ...s, ingestionStatus: next, updatedAt: now() });
  }

  addChunk(input: {
    sourceId: string;
    text: string;
    pageOrSection?: string | null;
    evidenceClassification?: Eos3KnowledgeChunk["evidenceClassification"];
    embedding?: number[] | null;
  }): Eos3KnowledgeChunk {
    const s = this.sources.get(input.sourceId);
    if (!s) throw new Error("source_not_found");
    if (containsSensitiveData(input.text)) {
      this.sources.set(input.sourceId, { ...s, containsSensitiveMarkers: true, updatedAt: now() });
      throw new Error("sensitive_data_indexing_denied");
    }
    if (s.ingestionStatus === "INVALIDATED" || s.effectiveState === "REVOKED" || s.effectiveState === "WITHDRAWN") {
      throw new Error("source_not_indexable");
    }
    const chunk: Eos3KnowledgeChunk = {
      chunkId: id(),
      sourceId: s.sourceId,
      tenantId: s.tenantId,
      workspaceId: s.workspaceId,
      projectId: s.projectId,
      text: input.text,
      pageOrSection: input.pageOrSection ?? null,
      authorityClass: s.authorityClass,
      effectiveState: s.effectiveState,
      documentStatus: s.documentStatus,
      revisionOrVersion: s.revisionOrVersion,
      ingestionRecordId: s.sourceId,
      evidenceClassification: input.evidenceClassification ?? "FACT",
      embedding: input.embedding ?? null,
      instructionIsolated: true,
    };
    this.chunks.set(chunk.chunkId, chunk);
    return chunk;
  }

  markIndexed(sourceId: string, indexFingerprint: string): void {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error("source_not_found");
    this.sources.set(sourceId, {
      ...s,
      ingestionStatus: "AVAILABLE",
      indexStatus: "indexed",
      indexFingerprint,
      updatedAt: now(),
    });
    this.audit.push({ action: "source_indexed", sourceId, at: now(), detail: { indexFingerprint } });
  }

  invalidate(sourceId: string, reason: "superseded" | "withdrawn" | "deleted" | "access_revoked" | "reclassified"): void {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error("source_not_found");
    const effectiveState: SourceEffectiveState =
      reason === "superseded"
        ? "SUPERSEDED"
        : reason === "withdrawn" || reason === "deleted"
          ? "WITHDRAWN"
          : reason === "access_revoked"
            ? "REVOKED"
            : "SUPERSEDED";
    this.sources.set(sourceId, {
      ...s,
      effectiveState,
      documentStatus: reason === "superseded" ? "superseded" : reason === "withdrawn" ? "withdrawn" : s.documentStatus,
      ingestionStatus: "INVALIDATED",
      indexStatus: "removed",
      updatedAt: now(),
    });
    for (const [cid, chunk] of this.chunks) {
      if (chunk.sourceId === sourceId) {
        this.chunks.set(cid, { ...chunk, effectiveState, embedding: null });
      }
    }
    this.audit.push({
      action: reason === "superseded" ? "source_superseded" : reason === "access_revoked" ? "source_revoked" : "source_removed",
      sourceId,
      at: now(),
      detail: { reason },
    });
  }

  detectStaleIndex(): string[] {
    const stale: string[] = [];
    for (const s of this.sources.values()) {
      if (
        s.indexStatus === "indexed" &&
        s.contentFingerprint &&
        s.indexFingerprint &&
        s.contentFingerprint !== s.indexFingerprint
      ) {
        stale.push(s.sourceId);
        this.sources.set(s.sourceId, { ...s, indexStatus: "stale" });
      }
      if (s.effectiveState === "REVOKED" && s.indexStatus === "indexed") {
        stale.push(s.sourceId);
      }
    }
    return stale;
  }

  /** Idempotent reindex: rebuild fingerprints from current chunks without inventing content. */
  reindex(sourceId: string): { idempotent: true; chunkCount: number } {
    const s = this.sources.get(sourceId);
    if (!s) throw new Error("source_not_found");
    if (s.effectiveState === "REVOKED" || s.effectiveState === "WITHDRAWN") {
      throw new Error("cannot_reindex_invalid_source");
    }
    const related = [...this.chunks.values()].filter((c) => c.sourceId === sourceId);
    const fp = `idx:${sourceId}:${related.length}:${s.contentFingerprint ?? "none"}`;
    this.sources.set(sourceId, {
      ...s,
      indexStatus: "indexed",
      indexFingerprint: fp,
      contentFingerprint: s.contentFingerprint ?? fp,
      ingestionStatus: "AVAILABLE",
      updatedAt: now(),
    });
    this.audit.push({ action: "reindex_performed", sourceId, at: now(), detail: { chunkCount: related.length } });
    return { idempotent: true, chunkCount: related.length };
  }
}
