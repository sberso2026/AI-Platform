import { createPlatformAuditAdapter, type ReviewAuditSink } from "@rtb/engineering-review";
import { AuditService } from "@rtb/platform-core";
import type { ReviewSqlClient } from "./client";
import { emitReviewSecurityAlert } from "./security-alert";

/**
 * Bind ReviewAuditSink to platform AuditService.log.
 * Existing RTB policy: audit insert failure is logged and returns null —
 * it does not fail the originating business operation.
 *
 * Trusted path: pass a **service-role** client after a user-authorized
 * business operation. Do not bind a user JWT client — audit_events is not
 * a user-writable table, and user-forgeable audit rows are forbidden.
 */
export function bindPlatformReviewAudit(client: ReviewSqlClient): ReviewAuditSink {
  const service = new AuditService(client as never);
  return createPlatformAuditAdapter(async (input) => {
    const result = await service.log(input);
    if (result == null) {
      await emitReviewSecurityAlert({
        name: "review.audit_failed",
        at: new Date().toISOString(),
        actorId: input.userId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        code: "audit_insert_failed",
        resourceType: input.resourceType,
        resourceId: input.resourceId,
      });
    }
    return result;
  });
}

export function bindTrustedReviewAudit(serviceRoleClient: ReviewSqlClient): ReviewAuditSink {
  return bindPlatformReviewAudit(serviceRoleClient);
}
