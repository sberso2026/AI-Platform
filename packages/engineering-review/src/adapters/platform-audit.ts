import type { ReviewAuditEvent, ReviewAuditSink } from "../audit";

/**
 * Duck-typed bridge to platform AuditService.log without importing
 * @rtb/platform-core. Callers pass AuditService.log.bind(service) or an
 * equivalent function that writes audit_events.
 */
export type PlatformAuditLogFn = (input: {
  tenantId: string;
  workspaceId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) => Promise<unknown> | unknown;

export function createPlatformAuditAdapter(log: PlatformAuditLogFn): ReviewAuditSink {
  return {
    async record(event: ReviewAuditEvent): Promise<void> {
      await log({
        tenantId: event.tenantId,
        workspaceId: event.workspaceId,
        userId: event.actorId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: {
          projectId: event.projectId,
          ...(event.metadata ?? {}),
        },
      });
    },
  };
}
