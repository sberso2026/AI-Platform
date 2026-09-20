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
  "review.malware_detected",
  "review.scanner_failed",
  "review.service_role_misuse",
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
  "review.authn_failed",
  "review.authz_failed",
  "review.identity_assurance_failed",
  "review.cross_workspace_attempt",
  "review.cross_tenant_attempt",
  "review.repeated_access_denied",
  "review.audit_failed",
  "review.execution_failed",
  "review.malware_detected",
  "review.scanner_failed",
  "review.service_role_misuse",
];

export type ReviewSecurityAlertSeverity = "low" | "medium" | "high" | "critical";

export const REVIEW_SECURITY_ALERT_SEVERITY: Record<ReviewSecurityEventName, ReviewSecurityAlertSeverity> = {
  "review.authn_failed": "medium",
  "review.authz_failed": "medium",
  "review.identity_assurance_failed": "high",
  "review.cross_workspace_attempt": "high",
  "review.cross_tenant_attempt": "critical",
  "review.privileged_action": "high",
  "review.execution_failed": "medium",
  "review.audit_failed": "high",
  "review.repeated_access_denied": "high",
  "review.external_upload_blocked": "medium",
  "review.malware_detected": "critical",
  "review.scanner_failed": "high",
  "review.service_role_misuse": "critical",
};

export type ReviewSecurityAlertDestination = "structured_log" | "webhook";

export function shouldAlertReviewSecurityEvent(name: ReviewSecurityEventName): boolean {
  return REVIEW_SECURITY_ALERT_EVENTS.includes(name);
}

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
