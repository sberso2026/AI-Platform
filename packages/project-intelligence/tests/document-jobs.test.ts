import { describe, expect, it } from "vitest";
import {
  PROJECT_INTELLIGENCE_DOCUMENT_JOBS,
  buildDocumentJobIdempotencyKey,
  shouldRetryDocumentJob,
} from "../src/documents/jobs";

describe("document intelligence jobs", () => {
  it("defines the governed job catalogue", () => {
    expect(PROJECT_INTELLIGENCE_DOCUMENT_JOBS).toContain("project_intelligence.document.process");
    expect(PROJECT_INTELLIGENCE_DOCUMENT_JOBS).toContain("project_intelligence.document.retry");
  });

  it("builds stable idempotency keys and limits retries", () => {
    const key = buildDocumentJobIdempotencyKey({
      jobName: "project_intelligence.document.process",
      tenantId: "t1",
      workspaceId: "w1",
      engineeringDocumentId: "d1",
      sourceRevision: "A",
      processingVersion: "1",
    });
    expect(key).toContain("project_intelligence.document.process");
    expect(key).toContain("d1");

    const envelope = {
      jobName: "project_intelligence.document.process" as const,
      tenantId: "t1",
      workspaceId: "w1",
      engineeringDocumentId: "d1",
      sourceRevision: "A",
      processingVersion: "1",
      idempotencyKey: key,
      correlationId: "c1",
      attempt: 3,
      maxAttempts: 3,
    };
    expect(shouldRetryDocumentJob(envelope)).toBe(false);
    expect(shouldRetryDocumentJob({ ...envelope, attempt: 1 }, "document_revision_superseded")).toBe(false);
    expect(shouldRetryDocumentJob({ ...envelope, attempt: 1 }, "parser_failed")).toBe(true);
  });
});
