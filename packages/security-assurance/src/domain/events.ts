/**
 * Bounded security_assurance.* events — metadata/refs only.
 * Reuses Platform Event Bus; no duplicate bus.
 */

export const SECURITY_ASSURANCE_EVENT_TYPES = [
  "security_assurance.evidence_recorded",
  "security_assurance.assessment_completed",
  "security_assurance.finding_opened",
  "security_assurance.exception_changed",
  "security_assurance.posture_published",
  "security_assurance.isolation.probe_completed",
  "security_assurance.isolation.assessment_completed",
  "security_assurance.isolation.finding_opened",
  "security_assurance.isolation.posture_updated",
] as const;

export type SecurityAssuranceEventType =
  (typeof SECURITY_ASSURANCE_EVENT_TYPES)[number];

export type SecurityAssuranceEvent = {
  eventType: SecurityAssuranceEventType;
  tenantId: string;
  workspaceId: string;
  occurredAt: string;
  /** Identifier refs only — no raw sensitive payloads */
  refs: Record<string, string>;
  containsSensitivePayload: false;
};

export function createSecurityAssuranceEvent(
  input: Omit<SecurityAssuranceEvent, "containsSensitivePayload">,
): SecurityAssuranceEvent {
  return { ...input, containsSensitivePayload: false };
}
