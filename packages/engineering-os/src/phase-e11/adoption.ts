/**
 * Privacy-safe engineer adoption instrumentation.
 * No hidden CoT or sensitive document content.
 */

export const EngineeringAdoptionEventTypes = [
  "ask_used",
  "evidence_opened",
  "why_opened",
  "tool_invoked",
  "action_accepted",
  "action_edited",
  "action_rejected",
  "fallback_or_abstention",
  "task_completed",
  "feedback_useful",
  "feedback_not_useful",
] as const;
export type EngineeringAdoptionEventType =
  (typeof EngineeringAdoptionEventTypes)[number];

export const EngineeringFeedbackReasonTaxonomy = [
  "saved_time",
  "found_evidence",
  "clear_explanation",
  "wrong_context",
  "missing_evidence",
  "not_trustworthy",
  "other",
] as const;
export type EngineeringFeedbackReason =
  (typeof EngineeringFeedbackReasonTaxonomy)[number];

export type EngineeringAdoptionEvent = {
  type: EngineeringAdoptionEventType;
  at: string;
  tenantIdHash: string;
  /** Opaque surface id only — never document body or CoT. */
  surface?: string;
  reason?: EngineeringFeedbackReason;
  /** Explicitly forbids sensitive payloads. */
  containsDocumentContent: false;
  containsHiddenCot: false;
};

export function createAdoptionEvent(input: {
  type: EngineeringAdoptionEventType;
  tenantId: string;
  surface?: string;
  reason?: EngineeringFeedbackReason;
  now?: Date;
}): EngineeringAdoptionEvent {
  if (input.type.startsWith("feedback_") && !input.reason && input.type !== "feedback_useful") {
    // optional reason — allowed empty for useful/not useful
  }
  return {
    type: input.type,
    at: (input.now ?? new Date()).toISOString(),
    tenantIdHash: hashTenant(input.tenantId),
    surface: input.surface,
    reason: input.reason,
    containsDocumentContent: false,
    containsHiddenCot: false,
  };
}

function hashTenant(tenantId: string): string {
  let h = 0;
  for (let i = 0; i < tenantId.length; i++) {
    h = (h * 31 + tenantId.charCodeAt(i)) | 0;
  }
  return `t_${(h >>> 0).toString(16)}`;
}

/** In-memory sink for tests / local instrumentation (not a second analytics platform). */
export class EngineeringAdoptionEventBuffer {
  private events: EngineeringAdoptionEvent[] = [];

  record(event: EngineeringAdoptionEvent) {
    if (event.containsDocumentContent || event.containsHiddenCot) {
      throw new Error("Adoption telemetry must not include document content or hidden CoT");
    }
    this.events.push(event);
  }

  list() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }

  counts(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of this.events) {
      out[e.type] = (out[e.type] ?? 0) + 1;
    }
    return out;
  }
}
