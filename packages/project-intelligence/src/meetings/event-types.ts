import type { MeetingEventType, MeetingStatus } from "./types";

export function eventTypeForTransition(
  from: MeetingStatus,
  to: MeetingStatus,
): MeetingEventType {
  if (to === "scheduled") return "meeting.scheduled";
  if (to === "connecting") return "meeting.connecting";
  if (to === "connected") return "meeting.connected";
  if (to === "recording") return "meeting.recording_started";
  if (to === "live" && from === "paused") return "meeting.resumed";
  if (to === "live") return "meeting.live";
  if (to === "paused") return "meeting.paused";
  if (to === "ended") return "meeting.ended";
  if (to === "processing") return "meeting.processing_enqueued";
  if (to === "failed") return "meeting.failed";
  if (to === "cancelled") return "meeting.cancelled";
  if (to === "archived") return "meeting.archived";
  return "meeting.created";
}
