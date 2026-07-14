import type { ManualMeetingActor } from "../manual-meeting-service";
import type { MeetingSupabaseClient } from "../supabase-types";
import { MeetingTranscriptIngestionService } from "../transcript-ingestion";
import { throwTeamsError, type TeamsTranscriptMode } from "./capability-contract";
import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";

export type TeamsTranscriptIngestResult = {
  transcriptMode: TeamsTranscriptMode;
  segmentCount: number;
  duplicateCount: number;
  latencyMetrics: {
    firstSegmentLatencyMs: number | null;
    medianSegmentLatencyMs: number | null;
    p95SegmentLatencyMs: number | null;
    completionLatencyMs: number;
    retryCount: number;
    missedEventCount: number;
    duplicateSuppressionCount: number;
  };
};

/**
 * Post-meeting transcript retrieval into the certified PI transcript model.
 * Does not claim live_transcript.
 */
export class MicrosoftTeamsTranscriptAdapter {
  readonly transcriptMode: TeamsTranscriptMode = "post_meeting";

  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly graph: MicrosoftGraphClientPort,
    private readonly ingestion = new MeetingTranscriptIngestionService(db),
  ) {}

  async ingestPostMeetingTranscript(input: {
    actor: ManualMeetingActor;
    meetingId: string;
    providerMeetingId: string;
    correlationId: string;
    consentSatisfied: boolean;
  }): Promise<TeamsTranscriptIngestResult> {
    if (!input.consentSatisfied) {
      throwTeamsError(
        "teams_transcript_access_denied",
        "Participant/recording consent is required before Teams transcript retrieval",
      );
    }

    const started = Date.now();
    let segments;
    try {
      segments = await this.graph.listTranscriptSegments(
        input.providerMeetingId,
        input.correlationId,
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "teams_transcript_access_denied") {
        throwTeamsError("teams_transcript_access_denied", "Teams transcript access denied");
      }
      throwTeamsError("teams_transcript_unavailable", "Teams transcript unavailable");
    }

    if (!segments.length) {
      throwTeamsError("teams_transcript_unavailable", "Teams transcript has no segments");
    }

    let duplicateCount = 0;
    const latencies: number[] = [];
    for (const segment of segments) {
      const before = Date.now();
      const result = await this.ingestion.ingest(input.actor, {
        meetingId: input.meetingId,
        providerEventId: `teams:${segment.providerEventId}`,
        text: segment.text,
        startTimeMs: segment.startTimeMs,
        endTimeMs: segment.endTimeMs,
        speakerId: segment.speakerId,
        speakerLabel: segment.speakerLabel,
        source: "microsoft_teams",
        providerSequence: segment.providerSequence,
        providerTimestamp: segment.providerTimestamp,
      });
      latencies.push(Date.now() - before);
      if (result.idempotent) {
        duplicateCount += 1;
      }
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : null;

    return {
      transcriptMode: this.transcriptMode,
      segmentCount: segments.length,
      duplicateCount,
      latencyMetrics: {
        firstSegmentLatencyMs: latencies[0] ?? null,
        medianSegmentLatencyMs: median,
        p95SegmentLatencyMs: p95,
        completionLatencyMs: Date.now() - started,
        retryCount: 0,
        missedEventCount: 0,
        duplicateSuppressionCount: duplicateCount,
      },
    };
  }
}
