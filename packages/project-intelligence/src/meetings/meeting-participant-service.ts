import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor, MeetingSessionRow } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type { ConsentStatus } from "./types";
import { CONSENT_STATUSES } from "./types";

export type MeetingParticipantRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  meeting_session_id: string;
  user_id: string | null;
  external_participant_id: string | null;
  display_name: string;
  email: string | null;
  role: string;
  speaker_id: string | null;
  attendance_status: string;
  consent_status: ConsentStatus;
  joined_at: string | null;
  left_at: string | null;
  source: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AddParticipantInput = {
  meetingId: string;
  displayName: string;
  email?: string | null;
  userId?: string | null;
  externalParticipantId?: string | null;
  role?: string;
  speakerId?: string | null;
  source?: string;
  consentStatus?: ConsentStatus;
  includeEmail?: boolean;
};

function mapParticipant(row: Record<string, unknown>, includeEmail: boolean): MeetingParticipantRow {
  return {
    id: String(row.id),
    tenant_id: String(row.tenant_id),
    workspace_id: String(row.workspace_id),
    meeting_session_id: String(row.meeting_session_id),
    user_id: row.user_id == null ? null : String(row.user_id),
    external_participant_id:
      row.external_participant_id == null ? null : String(row.external_participant_id),
    display_name: String(row.display_name),
    email: includeEmail && row.email != null ? String(row.email) : null,
    role: String(row.role ?? "attendee"),
    speaker_id: row.speaker_id == null ? null : String(row.speaker_id),
    attendance_status: String(row.attendance_status ?? "invited"),
    consent_status: row.consent_status as ConsentStatus,
    joined_at: row.joined_at == null ? null : String(row.joined_at),
    left_at: row.left_at == null ? null : String(row.left_at),
    source: String(row.source ?? "manual"),
    metadata: asRecord(row.metadata),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class MeetingParticipantService {
  private readonly meetings: ManualMeetingService;

  constructor(private readonly supabase: MeetingSupabaseClient) {
    this.meetings = new ManualMeetingService(supabase);
  }

  async listParticipants(
    actor: ManualMeetingActor,
    meetingId: string,
    options: { includeEmail?: boolean } = {},
  ): Promise<MeetingParticipantRow[]> {
    await this.meetings.getMeeting(actor, meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_participants")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .order("created_at", { ascending: true }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list participants: ${error.message}`,
        500,
      );
    }
    return (data ?? []).map((row) => mapParticipant(row, options.includeEmail === true));
  }

  async addParticipant(
    actor: ManualMeetingActor,
    input: AddParticipantInput,
  ): Promise<MeetingParticipantRow> {
    const meeting = await this.meetings.getMeeting(actor, input.meetingId);
    this.assertNotLegalHoldDelete(meeting);

    const displayName = input.displayName?.trim();
    if (!displayName) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "Participant display name is required",
        422,
      );
    }
    if (
      input.consentStatus
      && !(CONSENT_STATUSES as readonly string[]).includes(input.consentStatus)
    ) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "Invalid participant consent status",
        422,
        { consentStatus: input.consentStatus },
      );
    }

    const correlationId = actor.correlationId ?? randomUUID();
    const row = {
      tenant_id: meeting.tenant_id,
      workspace_id: meeting.workspace_id,
      meeting_session_id: meeting.id,
      user_id: input.userId ?? null,
      external_participant_id: input.externalParticipantId ?? null,
      display_name: displayName,
      email: input.email ?? null,
      role: input.role ?? "attendee",
      speaker_id: input.speakerId ?? null,
      attendance_status: "invited",
      consent_status: input.consentStatus ?? "not_requested",
      source: input.source ?? "manual",
      metadata: {},
    };

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_participants")
      .insert(row)
      .select("*")
      .single();

    if (error || !data || Array.isArray(data)) {
      if (error?.message?.includes("pi_meeting_participants_external_uidx") || error?.code === "23505") {
        throw new MeetingIntelligenceError(
          "meeting_participant_conflict",
          "Duplicate provider participant identity for this meeting",
          409,
          { externalParticipantId: input.externalParticipantId },
        );
      }
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to add participant: ${error?.message ?? "no row"}`,
        500,
      );
    }

    const participant = mapParticipant(data, input.includeEmail === true);
    await this.insertEvent(actor, meeting, "participant.added", correlationId, {
      participantId: participant.id,
      displayName: participant.display_name,
      speakerId: participant.speaker_id,
    });
    return participant;
  }

  async updateParticipant(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
    patch: {
      displayName?: string;
      email?: string | null;
      role?: string;
      attendanceStatus?: string;
      consentStatus?: ConsentStatus;
      speakerId?: string | null;
      includeEmail?: boolean;
    },
  ): Promise<MeetingParticipantRow> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    const current = await this.getParticipant(actor, meetingId, participantId, true);
    const correlationId = actor.correlationId ?? randomUUID();

    const update: Record<string, unknown> = {};
    if (patch.displayName !== undefined) update.display_name = patch.displayName.trim();
    if (patch.email !== undefined) update.email = patch.email;
    if (patch.role !== undefined) update.role = patch.role;
    if (patch.attendanceStatus !== undefined) update.attendance_status = patch.attendanceStatus;
    if (patch.speakerId !== undefined) update.speaker_id = patch.speakerId;
    if (patch.consentStatus !== undefined) {
      if (!(CONSENT_STATUSES as readonly string[]).includes(patch.consentStatus)) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          "Invalid participant consent status",
          422,
          { consentStatus: patch.consentStatus },
        );
      }
      update.consent_status = patch.consentStatus;
    }

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_participants")
      .update(update)
      .eq("id", participantId)
      .eq("meeting_session_id", meetingId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to update participant: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_not_found",
        "Participant not found",
        404,
        { participantId },
      );
    }

    const updated = mapParticipant(data, patch.includeEmail === true);
    await this.insertEvent(actor, meeting, "participant.updated", correlationId, {
      participantId,
      patch: Object.keys(update),
    });
    if (patch.consentStatus && patch.consentStatus !== current.consent_status) {
      await this.insertEvent(actor, meeting, "consent.updated", correlationId, {
        scope: "participant",
        participantId,
        previousConsent: current.consent_status,
        newConsent: patch.consentStatus,
      });
    }
    return updated;
  }

  async removeParticipant(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
  ): Promise<void> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    if (meeting.legal_hold) {
      throw new MeetingIntelligenceError(
        "meeting_legal_hold",
        "Participants cannot be removed while legal hold is active",
        409,
        { meetingId },
      );
    }
    await this.getParticipant(actor, meetingId, participantId, false);
    const { error } = await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_participants")
        .delete()
        .eq("id", participantId)
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to remove participant: ${error.message}`,
        500,
      );
    }
  }

  async recordJoin(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
  ): Promise<MeetingParticipantRow> {
    await this.getParticipant(actor, meetingId, participantId, false);
    const joinedAt = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_participants")
      .update({ joined_at: joinedAt, attendance_status: "joined" })
      .eq("id", participantId)
      .eq("meeting_session_id", meetingId)
      .select("*")
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_not_found",
        "Participant not found",
        404,
        { participantId },
      );
    }
    return mapParticipant(data, false);
  }

  async recordLeave(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
  ): Promise<MeetingParticipantRow> {
    const leftAt = new Date().toISOString();
    await this.getParticipant(actor, meetingId, participantId, false);
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_participants")
      .update({ left_at: leftAt, attendance_status: "left" })
      .eq("id", participantId)
      .eq("meeting_session_id", meetingId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .select("*")
      .maybeSingle();
    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_not_found",
        "Participant not found",
        404,
        { participantId },
      );
    }
    return mapParticipant(data, false);
  }

  async updateConsent(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
    consentStatus: ConsentStatus,
  ): Promise<MeetingParticipantRow> {
    return this.updateParticipant(actor, meetingId, participantId, {
      consentStatus,
      includeEmail: false,
    });
  }

  async assignSpeakerIdentity(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
    speakerId: string,
  ): Promise<MeetingParticipantRow> {
    if (!speakerId.trim()) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "speaker_id is required",
        422,
      );
    }
    return this.updateParticipant(actor, meetingId, participantId, {
      speakerId: speakerId.trim(),
      includeEmail: false,
    });
  }

  private async getParticipant(
    actor: ManualMeetingActor,
    meetingId: string,
    participantId: string,
    includeEmail: boolean,
  ): Promise<MeetingParticipantRow> {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_participants")
      .select("*")
      .eq("id", participantId)
      .eq("meeting_session_id", meetingId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load participant: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_not_found",
        "Participant not found",
        404,
        { participantId, meetingId },
      );
    }
    return mapParticipant(data, includeEmail);
  }

  private assertNotLegalHoldDelete(meeting: MeetingSessionRow): void {
    if (meeting.legal_hold && meeting.status === "archived") {
      throw new MeetingIntelligenceError(
        "meeting_legal_hold",
        "Meeting is under legal hold",
        409,
        { meetingId: meeting.id },
      );
    }
  }

  private async insertEvent(
    actor: ManualMeetingActor,
    meeting: MeetingSessionRow,
    eventType: string,
    correlationId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: meeting.tenant_id,
        workspace_id: meeting.workspace_id,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meeting.id,
        event_type: eventType,
        event_source: "manual",
        actor_user_id: actor.userId,
        previous_state: meeting.status,
        new_state: meeting.status,
        payload,
        correlation_id: correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to audit participant event: ${error.message}`,
        500,
      );
    }
  }
}
