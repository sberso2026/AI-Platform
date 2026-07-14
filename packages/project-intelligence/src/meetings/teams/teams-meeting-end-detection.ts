import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";

export type MeetingEndDetectionResult = {
  detected: boolean;
  method: "graph_end_datetime" | "transcript_available" | "manual_ended" | "unavailable";
  endedAt: string | null;
  limitation: string | null;
};

/**
 * Detect meeting end using supported Graph signals only.
 * Does not fabricate end detection. Documents fallback when Graph lacks a direct signal.
 */
export class TeamsMeetingEndDetectionService {
  constructor(private readonly graph: MicrosoftGraphClientPort) {}

  async detect(input: {
    providerMeetingId: string;
    correlationId: string;
    transcriptAvailable?: boolean;
    piMeetingStatus?: string | null;
  }): Promise<MeetingEndDetectionResult> {
    const meeting = await this.graph.getOnlineMeeting(
      input.providerMeetingId,
      input.correlationId,
    );

    if (meeting?.endDateTime) {
      const ended = Date.parse(meeting.endDateTime);
      if (Number.isFinite(ended) && ended <= Date.now()) {
        return {
          detected: true,
          method: "graph_end_datetime",
          endedAt: meeting.endDateTime,
          limitation: null,
        };
      }
    }

    if (input.transcriptAvailable) {
      return {
        detected: true,
        method: "transcript_available",
        endedAt: new Date().toISOString(),
        limitation:
          "Graph did not expose a definitive endDateTime; classified as ended via post-meeting transcript availability.",
      };
    }

    if (input.piMeetingStatus === "ended" || input.piMeetingStatus === "processing") {
      return {
        detected: true,
        method: "manual_ended",
        endedAt: new Date().toISOString(),
        limitation:
          "Meeting end was established from PI lifecycle state; Graph end signal unavailable for this configuration.",
      };
    }

    return {
      detected: false,
      method: "unavailable",
      endedAt: null,
      limitation:
        "Graph configuration does not expose a direct meeting-end notification for this tenant; post-meeting transcript or PI end transition required.",
    };
  }
}
