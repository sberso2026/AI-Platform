import { createPlatformAuditAdapter, type ReviewAuditSink } from "@rtb/engineering-review";
import { AuditService } from "@rtb/platform-core";
import type { ReviewSqlClient } from "./client";

/**
 * Bind ReviewAuditSink to platform AuditService.log.
 * Existing RTB policy: audit insert failure is logged and returns null —
 * it does not fail the originating business operation.
 */
export function bindPlatformReviewAudit(client: ReviewSqlClient): ReviewAuditSink {
  const service = new AuditService(client as never);
  return createPlatformAuditAdapter(async (input) => service.log(input));
}
