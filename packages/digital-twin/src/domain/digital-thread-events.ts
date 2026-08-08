/**
 * Phase 12K — Digital Thread domain events (identifiers only).
 */

export const DIGITAL_THREAD_DOMAIN_EVENTS = [
  "engineering.digital_twin.thread.composed",
  "engineering.digital_twin.thread.reviewed",
  "engineering.digital_twin.thread.published",
  "engineering.digital_twin.thread.integrity_changed",
] as const;

export type DigitalThreadDomainEvent = (typeof DIGITAL_THREAD_DOMAIN_EVENTS)[number];

export function assertDigitalThreadEventNoEvidencePayload(
  payload: Record<string, unknown>,
): void {
  const serialized = JSON.stringify(payload);
  if (serialized.length > 8_192) {
    throw new Error("digital_thread_event_payload_too_large");
  }
  const forbidden = [
    "confidentialEvidence",
    "evidencePayload",
    "rawDocument",
    "timeSeriesPoints",
    "solverBinary",
    "meshPayload",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error("digital_thread_event_must_not_carry_confidential_evidence");
    }
  }
}
