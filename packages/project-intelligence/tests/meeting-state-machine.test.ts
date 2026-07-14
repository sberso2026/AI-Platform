import { describe, expect, it } from "vitest";
import {
  assertPhase6c3bManualTransition,
  assertMeetingTransition,
  canTransitionMeetingStatus,
  PHASE_6C3B_MANUAL_TRANSITIONS,
  allowedMeetingTransitions,
} from "../src/meetings/meeting-state-machine";
import { assertConsentAllowsLifecycleTransition } from "../src/meetings/consent-policy";
import { MEETING_STATUSES, MEETING_PROVIDER_STATUS, type MeetingStatus } from "../src/meetings/types";
import { MeetingIntelligenceError } from "../src/meetings/errors";
import { assertMeetingsUsesProjectIntelligenceApp } from "../src/meetings/access";

describe("meeting state machine", () => {
  it("defines all required statuses", () => {
    expect(MEETING_STATUSES).toContain("draft");
    expect(MEETING_STATUSES).toContain("archived");
    expect(MEETING_STATUSES).toHaveLength(17);
  });

  it("allows the Phase 6C-3B manual happy path", () => {
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

  it("allows cancel/fail/archive branches required by 6C-3B", () => {
    expect(canTransitionMeetingStatus("draft", "cancelled")).toBe(true);
    expect(canTransitionMeetingStatus("scheduled", "cancelled")).toBe(true);
    expect(canTransitionMeetingStatus("connecting", "failed")).toBe(true);
    expect(canTransitionMeetingStatus("connected", "failed")).toBe(true);
    expect(canTransitionMeetingStatus("recording", "failed")).toBe(true);
    expect(canTransitionMeetingStatus("live", "failed")).toBe(true);
    expect(canTransitionMeetingStatus("ended", "archived")).toBe(true);
  });

  it("protects archived as terminal", () => {
    expect(allowedMeetingTransitions("archived")).toEqual([]);
    expect(() => assertMeetingTransition("archived", "draft")).toThrow(MeetingIntelligenceError);
  });

  it("forbids fabricating downstream AI states via 6C-3B manual API", () => {
    expect(() => assertPhase6c3bManualTransition("ended", "processing")).toThrow(/6C-3B/);
    expect(() => assertPhase6c3bManualTransition("processing", "minutes_draft")).toThrow(/6C-3B/);
  });

  it("still allows ended→processing in the full state machine for future phases", () => {
    expect(canTransitionMeetingStatus("ended", "processing")).toBe(true);
  });

  it("covers every PHASE_6C3B_MANUAL_TRANSITIONS entry as allowed", () => {
    for (const [from, to] of PHASE_6C3B_MANUAL_TRANSITIONS) {
      expect(canTransitionMeetingStatus(from, to)).toBe(true);
    }
  });

  it("rejects unknown jumps", () => {
    expect(() => assertMeetingTransition("draft", "live")).toThrow(MeetingIntelligenceError);
    expect(() => assertMeetingTransition("draft", "completed")).toThrow(MeetingIntelligenceError);
  });
});

describe("consent policy", () => {
  it("blocks live when recording notice required and consent pending", () => {
    expect(() => assertConsentAllowsLifecycleTransition({
      recordingNoticeRequired: "required",
      consentStatus: "pending",
      toStatus: "live",
    })).toThrow(/consent/);
  });

  it("allows live when consent granted", () => {
    expect(() => assertConsentAllowsLifecycleTransition({
      recordingNoticeRequired: "required",
      consentStatus: "granted",
      toStatus: "live",
    })).not.toThrow();
  });

  it("allows live when notice not required", () => {
    expect(() => assertConsentAllowsLifecycleTransition({
      recordingNoticeRequired: "not_required",
      consentStatus: "pending",
      toStatus: "recording",
    })).not.toThrow();
  });
});

describe("provider and entitlement contracts", () => {
  it("marks external providers unavailable", () => {
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
    expect(MEETING_PROVIDER_STATUS.microsoft_teams).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.zoom).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.google_meet).toBe("unavailable");
  });

  it("rejects meeting_intelligence stub and separate meetings app keys", () => {
    expect(() => assertMeetingsUsesProjectIntelligenceApp("meeting_intelligence")).toThrow();
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project-intelligence-meetings")).toThrow();
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project_intelligence")).not.toThrow();
  });
});
