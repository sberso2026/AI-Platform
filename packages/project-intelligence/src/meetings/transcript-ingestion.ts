import { createHash, randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import {
  buildResumeToken,
  detectSequenceGaps,
  nextLogicalSequence,
  parseResumeToken,
  sortTranscriptSegments,
  type TranscriptOrderingFields,
  type TranscriptResumeCursor,
  type TranscriptSequenceGap,
} from "./transcript-ordering";

export type DurableTranscriptSegment = TranscriptOrderingFields & {
  id: string;
  tenantId: string;
  workspaceId: string;
  engineeringProjectId: string | null;
  meetingSessionId: string;
  providerEventId: string;
  speakerId: string | null;
  speakerLabel: string | null;
  sequenceNumber: number;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
  confidence: number | null;
  language: string | null;
  source: string;
  status: string;
  correlationId: string | null;
  providerTimestamp: string | null;
  serverReceivedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type IngestTranscriptInput = {
  meetingId: string;
  providerEventId: string;
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  speakerId?: string | null;
  speakerLabel?: string | null;
  confidence?: number | null;
  language?: string | null;
  source?: string;
  providerSequence?: number | null;
  providerTimestamp?: string | null;
};

export type TranscriptRealtimePublication = {
  channel: string;
  event: "transcript.segment_added";
  meetingSessionId: string;
  segmentId: string;
  logicalSequence: number;
  correlationId: string;
  publishedAt: string;
  persisted: true;
};

function mapSegment(row: Record<string, unknown>): DurableTranscriptSegment {
  const logical =
    row.logical_sequence == null ? Number(row.sequence_number) : Number(row.logical_sequence);
  const serverReceivedAt = String(row.server_received_at ?? row.created_at);
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    engineeringProjectId: row.engineering_project_id
      ? String(row.engineering_project_id)
      : null,
    meetingSessionId: String(row.meeting_session_id),
    providerEventId: String(row.provider_event_id),
    speakerId: row.speaker_id == null ? null : String(row.speaker_id),
    speakerLabel: row.speaker_label == null ? null : String(row.speaker_label),
    sequenceNumber: Number(row.sequence_number),
    logicalSequence: logical,
    providerSequence: row.provider_sequence == null ? null : Number(row.provider_sequence),
    providerTimestamp: row.provider_timestamp == null ? null : String(row.provider_timestamp),
    serverReceivedAt,
    revisionNumber: Number(row.revision_number ?? 1),
    startTimeMs: Number(row.start_time_ms),
    endTimeMs: Number(row.end_time_ms),
    text: String(row.text),
    confidence: row.confidence == null ? null : Number(row.confidence),
    language: row.language == null ? null : String(row.language),
    source: String(row.source ?? "manual"),
    status: String(row.status ?? "active"),
    correlationId: row.correlation_id == null ? null : String(row.correlation_id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class MeetingTranscriptSequenceService {
  constructor(private readonly supabase: MeetingSupabaseClient) {}

  async maxLogicalSequence(meetingId: string, tenantId: string, workspaceId: string): Promise<number> {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("logical_sequence,sequence_number")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("logical_sequence", { ascending: false })
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read transcript sequence: ${error.message}`,
        500,
      );
    }
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row) return -1;
    if (row.logical_sequence != null) return Number(row.logical_sequence);
    return Number(row.sequence_number ?? -1);
  }

  observeGaps(segments: readonly DurableTranscriptSegment[]): TranscriptSequenceGap[] {
    return detectSequenceGaps(segments.map((s) => s.logicalSequence));
  }
}

/** Persist-before-broadcast publisher: builds publication records only after durable write. */
export class MeetingTranscriptRealtimePublisher {
  publishAfterPersist(input: {
    meetingSessionId: string;
    segmentId: string;
    logicalSequence: number;
    correlationId: string;
  }): TranscriptRealtimePublication {
    return {
      channel: `project-intelligence:meetings:${input.meetingSessionId}:transcript`,
      event: "transcript.segment_added",
      meetingSessionId: input.meetingSessionId,
      segmentId: input.segmentId,
      logicalSequence: input.logicalSequence,
      correlationId: input.correlationId,
      publishedAt: new Date().toISOString(),
      persisted: true,
    };
  }
}

export class MeetingTranscriptRecoveryService {
  constructor(
    private readonly supabase: MeetingSupabaseClient,
    private readonly meetings = new ManualMeetingService(supabase),
  ) {}

  async replayFromCursor(
    actor: ManualMeetingActor,
    cursor: TranscriptResumeCursor | string,
  ): Promise<{
    cursor: TranscriptResumeCursor;
    segments: DurableTranscriptSegment[];
    gaps: TranscriptSequenceGap[];
  }> {
    const parsed = typeof cursor === "string" ? parseResumeToken(cursor) : cursor;
    if (!parsed) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "Invalid transcript resume token",
        422,
      );
    }
    await this.meetings.getMeeting(actor, parsed.meetingSessionId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("*")
        .eq("meeting_session_id", parsed.meetingSessionId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .gt("logical_sequence", parsed.lastAcknowledgedLogicalSequence)
        .order("logical_sequence", { ascending: true })
        .order("revision_number", { ascending: true }),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to replay transcript: ${error.message}`,
        500,
      );
    }
    const segments = sortTranscriptSegments((data ?? []).map(mapSegment));
    const last = segments.at(-1)?.logicalSequence ?? parsed.lastAcknowledgedLogicalSequence;
    return {
      cursor: {
        meetingSessionId: parsed.meetingSessionId,
        lastAcknowledgedLogicalSequence: last,
        resumeToken: buildResumeToken({
          meetingSessionId: parsed.meetingSessionId,
          lastAcknowledgedLogicalSequence: last,
        }),
      },
      segments,
      gaps: detectSequenceGaps(segments.map((s) => s.logicalSequence)),
    };
  }
}

export class MeetingTranscriptIngestionService {
  private readonly meetings: ManualMeetingService;
  private readonly sequences: MeetingTranscriptSequenceService;
  private readonly publisher: MeetingTranscriptRealtimePublisher;

  constructor(private readonly supabase: MeetingSupabaseClient) {
    this.meetings = new ManualMeetingService(supabase);
    this.sequences = new MeetingTranscriptSequenceService(supabase);
    this.publisher = new MeetingTranscriptRealtimePublisher();
  }

  async ingest(
    actor: ManualMeetingActor,
    input: IngestTranscriptInput,
  ): Promise<{
    segment: DurableTranscriptSegment;
    publication: TranscriptRealtimePublication;
    idempotent: boolean;
  }> {
    const meeting = await this.meetings.getMeeting(actor, input.meetingId);
    const text = input.text?.trim();
    if (!text) {
      throw new MeetingIntelligenceError("meeting_validation_failed", "Transcript text is required", 422);
    }
    if (!input.providerEventId?.trim()) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "provider_event_id is required",
        422,
      );
    }
    if (input.endTimeMs < input.startTimeMs) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "end_time_ms must be >= start_time_ms",
        422,
      );
    }

    const existing = await this.findByProviderEvent(
      actor,
      input.meetingId,
      input.providerEventId.trim(),
    );
    if (existing) {
      return {
        segment: existing,
        publication: this.publisher.publishAfterPersist({
          meetingSessionId: existing.meetingSessionId,
          segmentId: existing.id,
          logicalSequence: existing.logicalSequence,
          correlationId: existing.correlationId ?? actor.correlationId ?? randomUUID(),
        }),
        idempotent: true,
      };
    }

    const maxLogical = await this.sequences.maxLogicalSequence(
      input.meetingId,
      actor.tenantId,
      actor.workspaceId,
    );
    const logicalSequence = nextLogicalSequence(maxLogical);
    const correlationId = actor.correlationId ?? randomUUID();
    const serverReceivedAt = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("project_intelligence_transcript_segments")
      .insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: input.meetingId,
        provider_event_id: input.providerEventId.trim(),
        speaker_id: input.speakerId ?? null,
        speaker_label: input.speakerLabel ?? null,
        sequence_number: logicalSequence,
        logical_sequence: logicalSequence,
        provider_sequence: input.providerSequence ?? null,
        provider_timestamp: input.providerTimestamp ?? null,
        server_received_at: serverReceivedAt,
        start_time_ms: input.startTimeMs,
        end_time_ms: input.endTimeMs,
        text,
        confidence: input.confidence ?? null,
        language: input.language ?? null,
        revision_number: 1,
        source: input.source ?? "manual",
        status: "active",
        correlation_id: correlationId,
      })
      .select("*")
      .single();

    if (error) {
      if (/unique|duplicate/i.test(error.message)) {
        const again = await this.findByProviderEvent(
          actor,
          input.meetingId,
          input.providerEventId.trim(),
        );
        if (again) {
          return {
            segment: again,
            publication: this.publisher.publishAfterPersist({
              meetingSessionId: again.meetingSessionId,
              segmentId: again.id,
              logicalSequence: again.logicalSequence,
              correlationId: again.correlationId ?? correlationId,
            }),
            idempotent: true,
          };
        }
        throw new MeetingIntelligenceError(
          "meeting_transcript_conflict",
          "Transcript segment conflicts with an existing event",
          409,
        );
      }
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to persist transcript segment: ${error.message}`,
        500,
      );
    }

    const segment = mapSegment(data as Record<string, unknown>);
    await this.writeEvent(actor, meeting, segment, correlationId);

    const publication = this.publisher.publishAfterPersist({
      meetingSessionId: segment.meetingSessionId,
      segmentId: segment.id,
      logicalSequence: segment.logicalSequence,
      correlationId,
    });

    return { segment, publication, idempotent: false };
  }

  async listOrdered(
    actor: ManualMeetingActor,
    meetingId: string,
  ): Promise<{ segments: DurableTranscriptSegment[]; gaps: TranscriptSequenceGap[] }> {
    await this.meetings.getMeeting(actor, meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list transcript segments: ${error.message}`,
        500,
      );
    }
    const segments = sortTranscriptSegments((data ?? []).map(mapSegment));
    return { segments, gaps: detectSequenceGaps(segments.map((s) => s.logicalSequence)) };
  }

  private async findByProviderEvent(
    actor: ManualMeetingActor,
    meetingId: string,
    providerEventId: string,
  ): Promise<DurableTranscriptSegment | null> {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .eq("provider_event_id", providerEventId)
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to check transcript idempotency: ${error.message}`,
        500,
      );
    }
    const row = (data ?? [])[0];
    return row ? mapSegment(row as Record<string, unknown>) : null;
  }

  private async writeEvent(
    actor: ManualMeetingActor,
    meeting: { id: string; engineering_project_id: string | null },
    segment: DurableTranscriptSegment,
    correlationId: string,
  ): Promise<void> {
    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meeting.id,
        event_type: "transcript.segment_added",
        event_source: "api",
        provider_event_id: `transcript-ingest:${segment.providerEventId}`,
        actor_user_id: actor.userId,
        payload: {
          segmentId: segment.id,
          logicalSequence: segment.logicalSequence,
          checksum: createHash("sha256").update(segment.text).digest("hex"),
        },
        correlation_id: correlationId,
      }),
    );
  }
}
