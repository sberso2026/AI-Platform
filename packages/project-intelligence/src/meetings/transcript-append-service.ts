import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";

export type TranscriptSegmentRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  engineering_project_id: string | null;
  meeting_session_id: string;
  provider_event_id: string;
  speaker_id: string | null;
  speaker_label: string | null;
  sequence_number: number;
  start_time_ms: number;
  end_time_ms: number;
  text: string;
  confidence: number | null;
  language: string | null;
  revision_number: number;
  source: string;
  status: string;
  correlation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AppendSegmentInput = {
  meetingId: string;
  providerEventId: string;
  text: string;
  sequenceNumber?: number;
  startTimeMs: number;
  endTimeMs: number;
  speakerId?: string | null;
  speakerLabel?: string | null;
  confidence?: number | null;
  language?: string | null;
  source?: string;
};

function mapSegment(row: Record<string, unknown>): TranscriptSegmentRow {
  return {
    id: String(row.id),
    tenant_id: String(row.tenant_id),
    workspace_id: String(row.workspace_id),
    engineering_project_id: row.engineering_project_id
      ? String(row.engineering_project_id)
      : null,
    meeting_session_id: String(row.meeting_session_id),
    provider_event_id: String(row.provider_event_id),
    speaker_id: row.speaker_id == null ? null : String(row.speaker_id),
    speaker_label: row.speaker_label == null ? null : String(row.speaker_label),
    sequence_number: Number(row.sequence_number),
    start_time_ms: Number(row.start_time_ms),
    end_time_ms: Number(row.end_time_ms),
    text: String(row.text),
    confidence: row.confidence == null ? null : Number(row.confidence),
    language: row.language == null ? null : String(row.language),
    revision_number: Number(row.revision_number ?? 1),
    source: String(row.source ?? "manual"),
    status: String(row.status ?? "active"),
    correlation_id: row.correlation_id == null ? null : String(row.correlation_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class TranscriptAppendService {
  private readonly meetings: ManualMeetingService;

  constructor(private readonly supabase: MeetingSupabaseClient) {
    this.meetings = new ManualMeetingService(supabase);
  }

  async listSegments(
    actor: ManualMeetingActor,
    meetingId: string,
  ): Promise<TranscriptSegmentRow[]> {
    await this.meetings.getMeeting(actor, meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .order("sequence_number", { ascending: true }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list transcript segments: ${error.message}`,
        500,
      );
    }
    return (data ?? []).map(mapSegment);
  }

  async appendSegment(
    actor: ManualMeetingActor,
    input: AppendSegmentInput,
  ): Promise<TranscriptSegmentRow> {
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
    if (
      input.confidence != null
      && (input.confidence < 0 || input.confidence > 1)
    ) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "confidence must be between 0 and 1",
        422,
      );
    }

    const existing = await this.supabase
      .from("project_intelligence_transcript_segments")
      .select("*")
      .eq("meeting_session_id", meeting.id)
      .eq("provider_event_id", input.providerEventId.trim())
      .maybeSingle();
    if (existing.data && !Array.isArray(existing.data)) {
      return mapSegment(existing.data);
    }

    const existingSegments = await this.listSegments(actor, meeting.id);
    const nextSequence =
      input.sequenceNumber
      ?? (existingSegments.reduce((max, s) => Math.max(max, s.sequence_number), 0) + 1);

    const correlationId = actor.correlationId ?? randomUUID();
    const serverReceivedAt = new Date().toISOString();
    const row = {
      tenant_id: meeting.tenant_id,
      workspace_id: meeting.workspace_id,
      engineering_project_id: meeting.engineering_project_id,
      meeting_session_id: meeting.id,
      provider_event_id: input.providerEventId.trim(),
      speaker_id: input.speakerId ?? null,
      speaker_label: input.speakerLabel ?? null,
      sequence_number: nextSequence,
      logical_sequence: nextSequence,
      provider_sequence: input.sequenceNumber ?? null,
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
    };

    const { data, error } = await this.supabase
      .from("project_intelligence_transcript_segments")
      .insert(row)
      .select("*")
      .single();

    if (error || !data || Array.isArray(data)) {
      if (error?.code === "23505") {
        const again = await this.supabase
          .from("project_intelligence_transcript_segments")
          .select("*")
          .eq("meeting_session_id", meeting.id)
          .eq("provider_event_id", input.providerEventId.trim())
          .maybeSingle();
        if (again.data && !Array.isArray(again.data)) return mapSegment(again.data);
        throw new MeetingIntelligenceError(
          "meeting_transcript_conflict",
          "Transcript segment conflicts with an existing sequence or provider event",
          409,
        );
      }
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to append transcript segment: ${error?.message ?? "no row"}`,
        500,
      );
    }

    const segment = mapSegment(data);
    await this.insertEvent(actor, meeting, "transcript.segment_added", correlationId, {
      segmentId: segment.id,
      sequenceNumber: segment.sequence_number,
      providerEventId: segment.provider_event_id,
    }, input.providerEventId.trim());
    return segment;
  }

  async reviseSegment(
    actor: ManualMeetingActor,
    meetingId: string,
    segmentId: string,
    revisedText: string,
    revisionReason?: string,
  ): Promise<TranscriptSegmentRow> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    const text = revisedText?.trim();
    if (!text) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "Revised transcript text is required",
        422,
      );
    }

    const { data: currentRaw, error: loadError } = await this.supabase
      .from("project_intelligence_transcript_segments")
      .select("*")
      .eq("id", segmentId)
      .eq("meeting_session_id", meetingId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();

    if (loadError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load transcript segment: ${loadError.message}`,
        500,
      );
    }
    if (!currentRaw || Array.isArray(currentRaw)) {
      throw new MeetingIntelligenceError(
        "meeting_not_found",
        "Transcript segment not found",
        404,
        { segmentId },
      );
    }

    const current = mapSegment(currentRaw);
    const nextRevision = current.revision_number + 1;
    const correlationId = actor.correlationId ?? randomUUID();

    const { error: revError } = await awaitMutation(
      this.supabase
        .from("project_intelligence_transcript_revisions")
        .insert({
          tenant_id: meeting.tenant_id,
          workspace_id: meeting.workspace_id,
          meeting_session_id: meeting.id,
          transcript_segment_id: current.id,
          revision_number: nextRevision,
          previous_text: current.text,
          revised_text: text,
          revision_reason: revisionReason ?? "manual_correction",
          revised_by: actor.userId,
          correlation_id: correlationId,
        }),
    );

    if (revError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to record transcript revision: ${revError.message}`,
        500,
      );
    }

    const { data, error } = await this.supabase
      .from("project_intelligence_transcript_segments")
      .update({
        text,
        revision_number: nextRevision,
        correlation_id: correlationId,
      })
      .eq("id", current.id)
      .eq("revision_number", current.revision_number)
      .select("*")
      .maybeSingle();

    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_transcript_conflict",
        "Transcript segment was revised concurrently",
        409,
        { segmentId },
      );
    }

    const updated = mapSegment(data);
    await this.insertEvent(actor, meeting, "transcript.segment_revised", correlationId, {
      segmentId,
      revisionNumber: nextRevision,
      previousText: current.text,
      revisedText: text,
    });
    return updated;
  }

  async listRevisions(
    actor: ManualMeetingActor,
    meetingId: string,
    segmentId: string,
  ): Promise<Record<string, unknown>[]> {
    await this.meetings.getMeeting(actor, meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_revisions")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("transcript_segment_id", segmentId)
        .eq("tenant_id", actor.tenantId)
        .order("revision_number", { ascending: true }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list transcript revisions: ${error.message}`,
        500,
      );
    }
    return data ?? [];
  }

  private async insertEvent(
    actor: ManualMeetingActor,
    meeting: {
      tenant_id: string;
      workspace_id: string;
      engineering_project_id: string | null;
      id: string;
      status: string;
    },
    eventType: string,
    correlationId: string,
    payload: Record<string, unknown>,
    providerEventId?: string,
  ): Promise<void> {
    const { error } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: meeting.tenant_id,
        workspace_id: meeting.workspace_id,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meeting.id,
        event_type: eventType,
        event_source: "manual",
        provider_event_id: providerEventId ?? null,
        actor_user_id: actor.userId,
        previous_state: meeting.status,
        new_state: meeting.status,
        payload,
        correlation_id: correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );

    if (error && error.code !== "23505") {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to audit transcript event: ${error.message}`,
        500,
      );
    }
  }
}
