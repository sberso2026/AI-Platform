/**
 * Privacy-safe Engineering OS adoption telemetry (client).
 * No document content or hidden CoT (containsHiddenCot must remain false).
 */

import {
  createAdoptionEvent,
  EngineeringAdoptionEventBuffer,
  type EngineeringAdoptionEventType,
  type EngineeringFeedbackReason,
} from "@rtb/engineering-os/browser";

const buffer = new EngineeringAdoptionEventBuffer();

export function recordEngineeringAdoptionEvent(input: {
  type: EngineeringAdoptionEventType;
  tenantId?: string;
  surface?: string;
  reason?: EngineeringFeedbackReason;
}) {
  const event = createAdoptionEvent({
    type: input.type,
    tenantId: input.tenantId ?? "local",
    surface: input.surface,
    reason: input.reason,
  });
  buffer.record(event);
  try {
    const key = "rtb.engineering.adoption.events.v1";
    const prev = sessionStorage.getItem(key);
    const list = prev ? (JSON.parse(prev) as unknown[]) : [];
    list.push(event);
    sessionStorage.setItem(key, JSON.stringify(list.slice(-100)));
  } catch {
    // ignore storage failures
  }
  return event;
}

export function getLocalAdoptionBuffer() {
  return buffer;
}
