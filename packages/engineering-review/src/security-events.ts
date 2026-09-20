/**
 * Security events for Review operators. Counts, codes, and IDs only.
 * Must never include engineering document content or secrets.
 */
export const REVIEW_SECURITY_EVENT_NAMES = [
  "review.authn_failed",
  "review.authz_failed",
  "review.identity_assurance_failed",
  "review.cross_workspace_attempt",
  "review.cross_tenant_attempt",
  "review.privileged_action",
  "review.execution_failed",
  "review.audit_failed",
  "review.repeated_access_denied",
  "review.external_upload_blocked",
] as const;

export type ReviewSecurityEventName = (typeof REVIEW_SECURITY_EVENT_NAMES)[number];

export type ReviewSecurityEvent = {
  name: ReviewSecurityEventName;
  at: string;
  actorId?: string;
  tenantId?: string;
  workspaceId?: string;
  requestId?: string;
  code?: string;
  resourceType?: string;
  resourceId?: string;
};

export const REVIEW_SECURITY_ALERT_EVENTS: readonly ReviewSecurityEventName[] = [
  "review.cross_workspace_attempt",
  "review.cross_tenant_attempt",
  "review.repeated_access_denied",
  "review.audit_failed",
  "review.identity_assurance_failed",
];

const FORBIDDEN = ["extractedtext", "span", "password", "secret", "service_role", "apikey", "content"];

export function assertSecurityEventSafe(event: ReviewSecurityEvent): void {
  const lower = JSON.stringify(event).toLowerCase();
  for (const key of FORBIDDEN) {
    if (lower.includes(key)) {
      throw new Error(`security_event_content_forbidden:${key}`);
    }
  }
}

export class InMemoryReviewSecuritySink {
  readonly events: ReviewSecurityEvent[] = [];

  record(event: ReviewSecurityEvent): void {
    assertSecurityEventSafe(event);
    this.events.push(event);
  }
}
