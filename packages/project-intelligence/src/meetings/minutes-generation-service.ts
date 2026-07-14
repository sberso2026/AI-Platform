import { randomUUID } from "node:crypto";

import { DeterministicMeetingAiAdapter, type MeetingAiPort } from "./deterministic-meeting-ai-adapter";
import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor, MeetingSessionRow } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  assertCanIssueMinutes,
  assertMinutesStatusTransition,
  assertMinutesVersionMutable,
  assertNoAutoIssue,
  hashMinutesContent,
  nextMinutesVersionNumber,
} from "./minutes-versioning";
import {
  extractProposalsFromTranscript,
  type ExtractedProposalDraft,
} from "./proposal-extraction-service";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type { MeetingMinutesStatus } from "./types";

export type MinutesGenerationResult = {
  minutesId: string;
  versionId: string;
  versionNumber: number;
  status: MeetingMinutesStatus;
  contentHash: string;
  autoIssued: false;
};

export class MeetingMinutesGenerationService {
  private readonly meetings: ManualMeetingService;
  private readonly ai: MeetingAiPort;

  constructor(
    private readonly supabase: MeetingSupabaseClient,
    ai?: MeetingAiPort,
  ) {
    this.meetings = new ManualMeetingService(supabase);
    this.ai = ai ?? new DeterministicMeetingAiAdapter();
  }

  async generateFromTranscriptAndProposals(input: {
    actor: ManualMeetingActor;
    meetingId: string;
    processingRunId: string;
    proposals?: readonly ExtractedProposalDraft[];
    meeting?: MeetingSessionRow;
  }): Promise<MinutesGenerationResult> {
    const meeting = input.meeting
      ?? await this.meetings.getMeeting(input.actor, input.meetingId);

    const { data: segmentRows, error: segError } = await awaitList(
      this.supabase
        .from("project_intelligence_transcript_segments")
        .select("id,text,normalized_text,logical_sequence,speaker_id,speaker_label,start_time_ms,end_time_ms")
        .eq("meeting_session_id", meeting.id)
        .eq("tenant_id", meeting.tenant_id)
        .eq("workspace_id", meeting.workspace_id)
        .eq("status", "active")
        .order("logical_sequence", { ascending: true }),
    );
    if (segError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load transcript for minutes: ${segError.message}`,
        500,
      );
    }

    const segments = (segmentRows ?? []).map((row) => ({
      id: String(row.id),
      text: String(row.normalized_text ?? row.text ?? ""),
      speakerId: row.speaker_id == null ? null : String(row.speaker_id),
      speakerLabel: row.speaker_label == null ? null : String(row.speaker_label),
      startTimeMs: row.start_time_ms == null ? null : Number(row.start_time_ms),
      endTimeMs: row.end_time_ms == null ? null : Number(row.end_time_ms),
      logicalSequence: Number(row.logical_sequence ?? 0),
    }));

    const proposals = input.proposals ?? extractProposalsFromTranscript(segments);
    const minutesOut = await this.ai.generateMinutes({
      title: meeting.title,
      transcriptLines: segments.map((s) => s.text).filter(Boolean),
      proposals,
    });

    const existing = await this.loadMinutes(meeting.id, meeting.tenant_id, meeting.workspace_id);
    const correlationId = input.actor.correlationId ?? meeting.correlation_id ?? randomUUID();
    const contentHash = minutesOut.contentHash
      || hashMinutesContent(minutesOut.markdown, minutesOut.bodyJson);

    if (!existing) {
      const minutesId = randomUUID();
      const versionId = randomUUID();
      const { error: minError } = await awaitMutation(
        this.supabase.from("project_intelligence_meeting_minutes").insert({
          id: minutesId,
          tenant_id: meeting.tenant_id,
          workspace_id: meeting.workspace_id,
          meeting_session_id: meeting.id,
          status: "generated",
          current_version: 1,
          processing_run_id: input.processingRunId,
          correlation_id: correlationId,
        }),
      );
      if (minError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to create minutes: ${minError.message}`,
          500,
        );
      }
      const { error: verError } = await awaitMutation(
        this.supabase.from("project_intelligence_meeting_minutes_versions").insert({
          id: versionId,
          tenant_id: meeting.tenant_id,
          workspace_id: meeting.workspace_id,
          meeting_session_id: meeting.id,
          minutes_id: minutesId,
          version_number: 1,
          body_markdown: minutesOut.markdown,
          body_json: minutesOut.bodyJson,
          status: "generated",
          content_format: "markdown+json",
          processing_run_id: input.processingRunId,
          model: minutesOut.model,
          prompt_version: minutesOut.promptVersion,
          content_hash: contentHash,
          meeting_state_version: meeting.state_version,
          created_by: input.actor.userId,
          correlation_id: correlationId,
        }),
      );
      if (verError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to create minutes version: ${verError.message}`,
          500,
        );
      }
      return {
        minutesId,
        versionId,
        versionNumber: 1,
        status: "generated",
        contentHash,
        autoIssued: false,
      };
    }

    const latestVersion = await this.loadLatestVersion(
      existing.id,
      meeting.tenant_id,
      meeting.workspace_id,
    );
    if (latestVersion) {
      assertMinutesVersionMutable({
        status: latestVersion.status as MeetingMinutesStatus,
        issuedAt: latestVersion.issued_at == null ? null : String(latestVersion.issued_at),
      });
    }

    const nextVersion = nextMinutesVersionNumber(Number(existing.current_version));
    const versionId = randomUUID();
    const { error: updateErr } = await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_minutes")
        .update({
          status: "generated",
          current_version: nextVersion,
          processing_run_id: input.processingRunId,
          correlation_id: correlationId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id),
    );
    if (updateErr) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to update minutes: ${updateErr.message}`,
        500,
      );
    }

    if (latestVersion?.id) {
      await awaitMutation(
        this.supabase
          .from("project_intelligence_meeting_minutes_versions")
          .update({ status: "superseded", superseded_by: versionId })
          .eq("id", latestVersion.id),
      );
    }

    const { error: verError } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_minutes_versions").insert({
        id: versionId,
        tenant_id: meeting.tenant_id,
        workspace_id: meeting.workspace_id,
        meeting_session_id: meeting.id,
        minutes_id: existing.id,
        version_number: nextVersion,
        body_markdown: minutesOut.markdown,
        body_json: minutesOut.bodyJson,
        status: "generated",
        content_format: "markdown+json",
        processing_run_id: input.processingRunId,
        model: minutesOut.model,
        prompt_version: minutesOut.promptVersion,
        content_hash: contentHash,
        meeting_state_version: meeting.state_version,
        created_by: input.actor.userId,
        correlation_id: correlationId,
      }),
    );
    if (verError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to append minutes version: ${verError.message}`,
        500,
      );
    }

    return {
      minutesId: existing.id,
      versionId,
      versionNumber: nextVersion,
      status: "generated",
      contentHash,
      autoIssued: false,
    };
  }

  async markReviewPending(minutesId: string, tenantId: string, workspaceId: string): Promise<void> {
    const minutes = await this.requireMinutes(minutesId, tenantId, workspaceId);
    assertMinutesStatusTransition(minutes.status as MeetingMinutesStatus, "review_pending");
    const { error } = await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_minutes")
        .update({ status: "review_pending", updated_at: new Date().toISOString() })
        .eq("id", minutesId)
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to mark minutes review_pending: ${error.message}`,
        500,
      );
    }
  }

  /** Guard against accidental auto-issue from pipeline code paths. */
  forbidAutoIssue(actorKind: "human" | "ai" | "system" = "ai"): never {
    assertNoAutoIssue(actorKind);
    throw new MeetingIntelligenceError(
      "meeting_ai_cannot_approve",
      "Minutes issue requires human approval path",
      403,
    );
  }

  assertIssueAllowed(status: MeetingMinutesStatus, actorKind: "human" | "ai" | "system"): void {
    assertNoAutoIssue(actorKind);
    assertCanIssueMinutes(status);
  }

  private async loadMinutes(meetingId: string, tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .select("*")
      .eq("meeting_session_id", meetingId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load minutes: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) return null;
    return asRecord(data) as { id: string; current_version: number; status: string };
  }

  private async requireMinutes(minutesId: string, tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_minutes")
      .select("*")
      .eq("id", minutesId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError("minutes_not_found", "Minutes not found", 404, { minutesId });
    }
    return asRecord(data);
  }

  private async loadLatestVersion(minutesId: string, tenantId: string, workspaceId: string) {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_minutes_versions")
        .select("*")
        .eq("minutes_id", minutesId)
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("version_number", { ascending: false })
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load minutes version: ${error.message}`,
        500,
      );
    }
    return (data ?? [])[0] ?? null;
  }
}
