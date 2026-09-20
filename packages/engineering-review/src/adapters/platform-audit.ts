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

const FORBIDDEN_AUDIT_KEYS = [
  "extractedtext",
  "extracted_text",
  "span",
  "content",
  "password",
  "secret",
  "service_role",
  "apikey",
  "api_key",
];

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_AUDIT_KEYS.some((item) => lower.includes(item))) continue;
    if (typeof value === "string" && value.length > 200) continue;
    output[key] = value;
  }
  return output;
}

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
        metadata: sanitizeAuditMetadata({
          projectId: event.projectId,
          ...(event.metadata ?? {}),
        }),
      });
    },
  };
}
