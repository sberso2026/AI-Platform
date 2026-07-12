/**
 * Governed document-intelligence job names for outbox / scheduler wiring.
 * Processing must remain idempotent and revision-aware.
 */

export const PROJECT_INTELLIGENCE_DOCUMENT_JOBS = [
  "project_intelligence.document.process",
  "project_intelligence.document.retry",
  "project_intelligence.document.embed",
  "project_intelligence.document.index",
  "project_intelligence.document.extract",
  "project_intelligence.document.compare",
  "project_intelligence.document.cleanup",
  "project_intelligence.document.reindex",
] as const;

export type ProjectIntelligenceDocumentJobName = (typeof PROJECT_INTELLIGENCE_DOCUMENT_JOBS)[number];

export interface DocumentJobEnvelope {
  jobName: ProjectIntelligenceDocumentJobName;
  tenantId: string;
  workspaceId: string;
  engineeringDocumentId: string;
  sourceRevision: string;
  processingVersion: string;
  idempotencyKey: string;
  correlationId: string;
  attempt: number;
  maxAttempts: number;
}

export function buildDocumentJobIdempotencyKey(parts: {
  jobName: ProjectIntelligenceDocumentJobName;
  tenantId: string;
  workspaceId: string;
  engineeringDocumentId: string;
  sourceRevision: string;
  processingVersion: string;
}): string {
  return [
    parts.jobName,
    parts.tenantId,
    parts.workspaceId,
    parts.engineeringDocumentId,
    parts.sourceRevision,
    parts.processingVersion,
  ].join("|");
}

export function shouldRetryDocumentJob(envelope: DocumentJobEnvelope, failureCode?: string): boolean {
  if (envelope.attempt >= envelope.maxAttempts) return false;
  if (failureCode === "document_revision_superseded") return false;
  if (failureCode === "document_access_denied") return false;
  if (failureCode === "unsupported_file_type") return false;
  return true;
}
