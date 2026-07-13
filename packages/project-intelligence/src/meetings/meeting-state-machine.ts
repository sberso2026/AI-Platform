import { MeetingIntelligenceError } from "./errors";
import type { MeetingStatus } from "./types";

/**
 * Full meeting lifecycle transitions.
 * Phase 6C-3B user flows use the manual path through ended (+ cancel/fail/archive).
 * Downstream AI states exist for future phases but are not entered by normal 6C-3B flows.
 */
const TRANSITIONS: Readonly<Record<MeetingStatus, readonly MeetingStatus[]>> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["connecting", "cancelled"],
  connecting: ["connected", "failed", "cancelled"],
  connected: ["recording", "failed", "cancelled"],
  recording: ["transcribing", "live", "failed", "cancelled"],
  transcribing: ["live", "failed", "cancelled"],
  live: ["paused", "ended", "failed"],
  paused: ["live", "ended", "failed"],
  ended: ["archived", "processing"],
  processing: ["minutes_draft", "failed"],
  minutes_draft: ["review_pending", "failed"],
  review_pending: ["approved", "failed"],
  approved: ["completed", "failed"],
  completed: ["archived"],
  failed: ["archived", "draft"],
  cancelled: ["archived"],
  archived: [],
};

/** Transitions allowed via Phase 6C-3B manual session APIs (no AI pipeline). */
export const PHASE_6C3B_MANUAL_TRANSITIONS: ReadonlyArray<readonly [MeetingStatus, MeetingStatus]> = [
  ["draft", "scheduled"],
  ["draft", "cancelled"],
  ["scheduled", "connecting"],
  ["scheduled", "cancelled"],
  ["connecting", "connected"],
  ["connecting", "failed"],
  ["connecting", "cancelled"],
  ["connected", "recording"],
  ["connected", "failed"],
  ["connected", "cancelled"],
  ["recording", "live"],
  ["recording", "failed"],
  ["recording", "cancelled"],
  ["live", "paused"],
  ["live", "ended"],
  ["live", "failed"],
  ["paused", "live"],
  ["paused", "ended"],
  ["paused", "failed"],
  ["ended", "archived"],
  ["failed", "archived"],
  ["cancelled", "archived"],
];

export interface MeetingTransitionAudit {
  action: "meeting_status_transition";
  fromStatus: MeetingStatus;
  toStatus: MeetingStatus;
  eventId: string;
  correlationId?: string;
  actorId?: string;
  details?: Record<string, unknown>;
}

export function allowedMeetingTransitions(status: MeetingStatus): readonly MeetingStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionMeetingStatus(from: MeetingStatus, to: MeetingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertMeetingTransition(from: MeetingStatus, to: MeetingStatus): void {
  if (!canTransitionMeetingStatus(from, to)) {
    throw new MeetingIntelligenceError(
      "meeting_transition_invalid",
      "Meeting status transition is not allowed",
      409,
      { from, to },
    );
  }
}

/** Reject user-flow transitions that would enter deferred AI pipeline states in 6C-3B. */
export function assertPhase6c3bManualTransition(from: MeetingStatus, to: MeetingStatus): void {
  assertMeetingTransition(from, to);
  const allowed = PHASE_6C3B_MANUAL_TRANSITIONS.some(([a, b]) => a === from && b === to);
  if (!allowed) {
    throw new MeetingIntelligenceError(
      "meeting_transition_invalid",
      "Meeting status transition is not available in Phase 6C-3B manual foundation",
      409,
      { from, to, phase: "6C-3B" },
    );
  }
}

export function buildMeetingTransitionAudit(
  from: MeetingStatus,
  to: MeetingStatus,
  eventId: string,
  extras: Omit<MeetingTransitionAudit, "action" | "fromStatus" | "toStatus" | "eventId"> = {},
): MeetingTransitionAudit {
  assertMeetingTransition(from, to);
  return {
    action: "meeting_status_transition",
    fromStatus: from,
    toStatus: to,
    eventId,
    ...extras,
  };
}

export function isTerminalMeetingStatus(status: MeetingStatus): boolean {
  return status === "archived" || (TRANSITIONS[status].length === 0);
}

export function isMeetingEvidencePreservingArchive(from: MeetingStatus, to: MeetingStatus): boolean {
  return to === "archived" && from !== "archived";
}
