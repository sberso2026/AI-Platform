import type { ReviewOwnership } from "./ownership";

/**
 * Review audit events. Mapped to platform `audit_events` by an adapter
 * outside this package — the domain does not import @rtb/platform-core.
 */
export const REVIEW_AUDIT_ACTIONS = [
  "review_package.created",
  "review_run.created",
  "review_run.started",
  "review_run.completed",
  "review_run.failed",
  "review_finding.created",
  "review_evidence.verified",
  "review_finding.disposition",
  "review_finding.closed",
] as const;

export type ReviewAuditAction = (typeof REVIEW_AUDIT_ACTIONS)[number];

export type ReviewAuditEvent = ReviewOwnership & {
  action: ReviewAuditAction;
  resourceType: string;
  resourceId: string;
  actorId?: string;
  at: string;
  metadata?: Readonly<Record<string, unknown>>;
};

export interface ReviewAuditSink {
  record(event: ReviewAuditEvent): Promise<void> | void;
}

export class InMemoryReviewAuditSink implements ReviewAuditSink {
  readonly events: ReviewAuditEvent[] = [];

  record(event: ReviewAuditEvent): void {
    this.events.push(event);
  }
}

export function createReviewAuditEvent(input: ReviewAuditEvent): ReviewAuditEvent {
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    actorId: input.actorId,
    at: input.at,
    metadata: input.metadata,
  };
}
