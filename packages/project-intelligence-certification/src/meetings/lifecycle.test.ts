import { describe, expect, it } from "vitest";
import {
  MEETING_STATUSES,
  PHASE_6C3B_MANUAL_TRANSITIONS,
  allowedMeetingTransitions,
  assertMeetingTransition,
  assertPhase6c3bManualTransition,
  canTransitionMeetingStatus,
  MeetingIntelligenceError,
  type MeetingStatus,
} from "@rtb/project-intelligence";

describe("Gate E — meeting lifecycle state machine", () => {
  it("exports all required statuses", () => {
    expect(MEETING_STATUSES).toHaveLength(17);
    expect(MEETING_STATUSES).toContain("draft");
    expect(MEETING_STATUSES).toContain("archived");
  });

  it("allows every Phase 6C-3B manual transition", () => {
    expect(PHASE_6C3B_MANUAL_TRANSITIONS.length).toBeGreaterThan(0);
    for (const [from, to] of PHASE_6C3B_MANUAL_TRANSITIONS) {
      expect(canTransitionMeetingStatus(from, to)).toBe(true);
      expect(() => assertPhase6c3bManualTransition(from, to)).not.toThrow();
    }
  });

  it("allows the manual happy path", () => {
    const path: MeetingStatus[] = [
      "draft",
      "scheduled",
      "connecting",
      "connected",
      "recording",
      "live",
      "paused",
      "live",
      "ended",
    ];
    for (let i = 0; i < path.length - 1; i += 1) {
      expect(() => assertPhase6c3bManualTransition(path[i]!, path[i + 1]!)).not.toThrow();
    }
  });

  it("forbids invalid jumps and deferred AI user flows", () => {
    expect(() => assertMeetingTransition("draft", "live")).toThrow(MeetingIntelligenceError);
    expect(() => assertPhase6c3bManualTransition("ended", "processing")).toThrow(MeetingIntelligenceError);
    expect(() => assertPhase6c3bManualTransition("processing", "minutes_draft")).toThrow(MeetingIntelligenceError);
  });

  it("protects archived as terminal", () => {
    expect(allowedMeetingTransitions("archived")).toEqual([]);
    expect(() => assertMeetingTransition("archived", "draft")).toThrow(MeetingIntelligenceError);
  });
});
