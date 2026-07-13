import { describe, expect, it } from "vitest";
import {
  ManualMeetingService,
  MeetingParticipantService,
  TranscriptAppendService,
  MEETING_EVENT_TYPES,
  eventTypeForTransition,
} from "@rtb/project-intelligence/server";

/**
 * Gate F/G/I/J/K service surface contracts (always-on unit tests).
 * Hosted durability is proven under CERTIFICATION=1 via RLS + browser flows.
 */
describe("Gate F — manual meeting service surface", () => {
  it("exports ManualMeetingService with lifecycle methods", () => {
    expect(typeof ManualMeetingService).toBe("function");
    expect(ManualMeetingService.prototype.createDraftMeeting).toBeTypeOf("function");
    expect(ManualMeetingService.prototype.transitionMeeting).toBeTypeOf("function");
    expect(ManualMeetingService.prototype.listMeetings).toBeTypeOf("function");
    expect(ManualMeetingService.prototype.listEvents).toBeTypeOf("function");
  });
});

describe("Gate G — participant service surface", () => {
  it("exports MeetingParticipantService with roster and consent methods", () => {
    expect(typeof MeetingParticipantService).toBe("function");
    expect(MeetingParticipantService.prototype.addParticipant).toBeTypeOf("function");
    expect(MeetingParticipantService.prototype.updateParticipant).toBeTypeOf("function");
    expect(MeetingParticipantService.prototype.listParticipants).toBeTypeOf("function");
  });
});

describe("Gate I/J — transcript durability and revisions surface", () => {
  it("exports TranscriptAppendService with append, ordered list, and revise", () => {
    expect(typeof TranscriptAppendService).toBe("function");
    expect(TranscriptAppendService.prototype.appendSegment).toBeTypeOf("function");
    expect(TranscriptAppendService.prototype.listSegments).toBeTypeOf("function");
    expect(TranscriptAppendService.prototype.reviseSegment).toBeTypeOf("function");
    expect(TranscriptAppendService.prototype.listRevisions).toBeTypeOf("function");
  });
});

describe("Gate K — events and audit surface", () => {
  it("defines meeting event types and transition event mapping", () => {
    expect(MEETING_EVENT_TYPES).toContain("meeting.created");
    expect(MEETING_EVENT_TYPES).toContain("transcript.segment_added");
    expect(MEETING_EVENT_TYPES).toContain("transcript.segment_revised");
    expect(MEETING_EVENT_TYPES).toContain("consent.updated");
    expect(eventTypeForTransition("draft", "scheduled")).toBe("meeting.scheduled");
    expect(eventTypeForTransition("live", "ended")).toBe("meeting.ended");
  });
});
