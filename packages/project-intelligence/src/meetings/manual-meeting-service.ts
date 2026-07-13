import { randomUUID } from "node:crypto";

import { assertConsentAllowsLifecycleTransition } from "./consent-policy";
import { MeetingIntelligenceError } from "./errors";
import { eventTypeForTransition } from "./event-types";
import {
  assertPhase6c3bManualTransition,
  buildMeetingTransitionAudit,
} from "./meeting-state-machine";
import { assertManualProviderOnly } from "./providers";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type {
  ConsentStatus,
  MeetingProvider,
  MeetingStatus,
  PrivacyClassification,
  RecordingNoticeRequirement,
} from "./types";
import {
  CONSENT_STATUSES,
  PRIVACY_CLASSIFICATIONS,
  RECORDING_NOTICE_REQUIREMENTS,
  isMeetingStatus,
} from "./types";

export type MeetingSessionRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  engineering_project_id: string | null;
  title: string;
  description: string | null;
  agenda: string | null;
  provider: MeetingProvider;
  status: MeetingStatus;
  state_version: number;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  timezone: string | null;
  organizer_user_id: string | null;
  recording_notice_required: RecordingNoticeRequirement;
  recording_notice_text: string | null;
  consent_policy: string | null;
  consent_status: ConsentStatus;
  jurisdiction: string | null;
  retention_policy_id: string | null;
  legal_hold: boolean;
  privacy_classification: PrivacyClassification;
  metadata: Record<string, unknown>;
  correlation_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ManualMeetingActor = {
  tenantId: string;
  workspaceId: string;
  userId: string;
  correlationId?: string;
};

export type CreateDraftMeetingInput = {
  title: string;
  engineeringProjectId?: string | null;
  description?: string | null;
  agenda?: string | null;
  provider?: string;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  timezone?: string | null;
  recordingNoticeRequired?: RecordingNoticeRequirement;
  recordingNoticeText?: string | null;
  consentPolicy?: string | null;
  consentStatus?: ConsentStatus;
  jurisdiction?: string | null;
  retentionPolicyId?: string | null;
  privacyClassification?: PrivacyClassification;
  metadata?: Record<string, unknown>;
};

export type UpdateDraftMeetingInput = {
  meetingId: string;
  expectedStateVersion: number;
  title?: string;
  description?: string | null;
  agenda?: string | null;
  engineeringProjectId?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  timezone?: string | null;
  recordingNoticeRequired?: RecordingNoticeRequirement;
  recordingNoticeText?: string | null;
  consentPolicy?: string | null;
  consentStatus?: ConsentStatus;
  jurisdiction?: string | null;
  retentionPolicyId?: string | null;
  privacyClassification?: PrivacyClassification;
  metadata?: Record<string, unknown>;
};

function mapSession(row: Record<string, unknown>): MeetingSessionRow {
  return {
    id: String(row.id),
    tenant_id: String(row.tenant_id),
    workspace_id: String(row.workspace_id),
    engineering_project_id: row.engineering_project_id ? String(row.engineering_project_id) : null,
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    agenda: row.agenda == null ? null : String(row.agenda),
    provider: row.provider as MeetingProvider,
    status: row.status as MeetingStatus,
    state_version: Number(row.state_version),
    scheduled_start_at: row.scheduled_start_at == null ? null : String(row.scheduled_start_at),
    scheduled_end_at: row.scheduled_end_at == null ? null : String(row.scheduled_end_at),
    actual_start_at: row.actual_start_at == null ? null : String(row.actual_start_at),
    actual_end_at: row.actual_end_at == null ? null : String(row.actual_end_at),
    timezone: row.timezone == null ? null : String(row.timezone),
    organizer_user_id: row.organizer_user_id == null ? null : String(row.organizer_user_id),
    recording_notice_required: row.recording_notice_required as RecordingNoticeRequirement,
    recording_notice_text: row.recording_notice_text == null ? null : String(row.recording_notice_text),
    consent_policy: row.consent_policy == null ? null : String(row.consent_policy),
    consent_status: row.consent_status as ConsentStatus,
    jurisdiction: row.jurisdiction == null ? null : String(row.jurisdiction),
    retention_policy_id: row.retention_policy_id == null ? null : String(row.retention_policy_id),
    legal_hold: Boolean(row.legal_hold),
    privacy_classification: row.privacy_classification as PrivacyClassification,
    metadata: asRecord(row.metadata),
    correlation_id: row.correlation_id == null ? null : String(row.correlation_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    archived_at: row.archived_at == null ? null : String(row.archived_at),
  };
}

function validateEnums(input: {
  recordingNoticeRequired?: string;
  consentStatus?: string;
  privacyClassification?: string;
}): void {
  if (
    input.recordingNoticeRequired
    && !(RECORDING_NOTICE_REQUIREMENTS as readonly string[]).includes(input.recordingNoticeRequired)
  ) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Invalid recording notice requirement",
      422,
      { recordingNoticeRequired: input.recordingNoticeRequired },
    );
  }
  if (input.consentStatus && !(CONSENT_STATUSES as readonly string[]).includes(input.consentStatus)) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Invalid consent status",
      422,
      { consentStatus: input.consentStatus },
    );
  }
  if (
    input.privacyClassification
    && !(PRIVACY_CLASSIFICATIONS as readonly string[]).includes(input.privacyClassification)
  ) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Invalid privacy classification",
      422,
      { privacyClassification: input.privacyClassification },
    );
  }
}

export class ManualMeetingService {
  constructor(private readonly supabase: MeetingSupabaseClient) {}

  async listMeetings(actor: ManualMeetingActor): Promise<MeetingSessionRow[]> {
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_sessions")
        .select("*")
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .order("created_at", { ascending: false }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list meetings: ${error.message}`,
        500,
      );
    }
    return (data ?? []).map(mapSession);
  }

  async getMeeting(actor: ManualMeetingActor, meetingId: string): Promise<MeetingSessionRow> {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .select("*")
      .eq("id", meetingId)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load meeting: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError("meeting_not_found", "Meeting not found", 404, { meetingId });
    }
    return mapSession(data);
  }

  async createDraftMeeting(
    actor: ManualMeetingActor,
    input: CreateDraftMeetingInput,
  ): Promise<MeetingSessionRow> {
    const title = input.title?.trim();
    if (!title) {
      throw new MeetingIntelligenceError("meeting_validation_failed", "Title is required", 422);
    }
    const provider = input.provider ?? "manual";
    assertManualProviderOnly(provider);
    validateEnums(input);

    const correlationId = actor.correlationId ?? randomUUID();
    const row = {
      tenant_id: actor.tenantId,
      workspace_id: actor.workspaceId,
      engineering_project_id: input.engineeringProjectId ?? null,
      title,
      description: input.description ?? null,
      agenda: input.agenda ?? null,
      provider: "manual",
      status: "draft",
      state_version: 1,
      scheduled_start_at: input.scheduledStartAt ?? null,
      scheduled_end_at: input.scheduledEndAt ?? null,
      timezone: input.timezone ?? null,
      organizer_user_id: actor.userId,
      created_by: actor.userId,
      updated_by: actor.userId,
      recording_notice_required: input.recordingNoticeRequired ?? "unknown",
      recording_notice_text: input.recordingNoticeText ?? null,
      consent_policy: input.consentPolicy ?? null,
      consent_status: input.consentStatus ?? "not_requested",
      jurisdiction: input.jurisdiction ?? null,
      retention_policy_id: input.retentionPolicyId ?? null,
      privacy_classification: input.privacyClassification ?? "internal",
      metadata: input.metadata ?? {},
      correlation_id: correlationId,
    };

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .insert(row)
      .select("*")
      .single();

    if (error || !data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to create meeting: ${error?.message ?? "no row"}`,
        500,
      );
    }

    const session = mapSession(data);
    await this.insertEvent({
      actor,
      meeting: session,
      eventType: "meeting.created",
      previousState: null,
      newState: "draft",
      correlationId,
      payload: { title },
    });

    return session;
  }

  async updateDraftMeeting(
    actor: ManualMeetingActor,
    input: UpdateDraftMeetingInput,
  ): Promise<MeetingSessionRow> {
    const current = await this.getMeeting(actor, input.meetingId);
    if (current.status !== "draft") {
      throw new MeetingIntelligenceError(
        "meeting_transition_invalid",
        "Only draft meetings can be updated with draft fields",
        409,
        { status: current.status },
      );
    }
    if (current.state_version !== input.expectedStateVersion) {
      throw new MeetingIntelligenceError(
        "meeting_concurrency_conflict",
        "Meeting was updated by another request",
        409,
        { expected: input.expectedStateVersion, actual: current.state_version },
      );
    }
    validateEnums(input);

    const patch: Record<string, unknown> = {
      updated_by: actor.userId,
      state_version: current.state_version + 1,
      correlation_id: actor.correlationId ?? current.correlation_id ?? randomUUID(),
    };
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.description !== undefined) patch.description = input.description;
    if (input.agenda !== undefined) patch.agenda = input.agenda;
    if (input.engineeringProjectId !== undefined) {
      patch.engineering_project_id = input.engineeringProjectId;
    }
    if (input.scheduledStartAt !== undefined) patch.scheduled_start_at = input.scheduledStartAt;
    if (input.scheduledEndAt !== undefined) patch.scheduled_end_at = input.scheduledEndAt;
    if (input.timezone !== undefined) patch.timezone = input.timezone;
    if (input.recordingNoticeRequired !== undefined) {
      patch.recording_notice_required = input.recordingNoticeRequired;
    }
    if (input.recordingNoticeText !== undefined) {
      patch.recording_notice_text = input.recordingNoticeText;
    }
    if (input.consentPolicy !== undefined) patch.consent_policy = input.consentPolicy;
    if (input.consentStatus !== undefined) patch.consent_status = input.consentStatus;
    if (input.jurisdiction !== undefined) patch.jurisdiction = input.jurisdiction;
    if (input.retentionPolicyId !== undefined) patch.retention_policy_id = input.retentionPolicyId;
    if (input.privacyClassification !== undefined) {
      patch.privacy_classification = input.privacyClassification;
    }
    if (input.metadata !== undefined) patch.metadata = input.metadata;

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .update(patch)
      .eq("id", current.id)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("state_version", current.state_version)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to update meeting: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_concurrency_conflict",
        "Meeting was updated by another request",
        409,
        { expected: input.expectedStateVersion },
      );
    }

    const updated = mapSession(data);
    if (input.consentStatus !== undefined && input.consentStatus !== current.consent_status) {
      await this.insertEvent({
        actor,
        meeting: updated,
        eventType: "consent.updated",
        previousState: current.status,
        newState: updated.status,
        correlationId: String(patch.correlation_id),
        payload: {
          previousConsent: current.consent_status,
          newConsent: updated.consent_status,
        },
      });
    }
    if (
      input.privacyClassification !== undefined
      && input.privacyClassification !== current.privacy_classification
    ) {
      await this.insertEvent({
        actor,
        meeting: updated,
        eventType: "privacy.updated",
        previousState: current.status,
        newState: updated.status,
        correlationId: String(patch.correlation_id),
        payload: {
          previousPrivacy: current.privacy_classification,
          newPrivacy: updated.privacy_classification,
        },
      });
    }
    return updated;
  }

  async transitionMeeting(
    actor: ManualMeetingActor,
    meetingId: string,
    toStatus: MeetingStatus,
    expectedStateVersion: number,
  ): Promise<MeetingSessionRow> {
    if (!isMeetingStatus(toStatus)) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "Invalid meeting status",
        422,
        { toStatus },
      );
    }

    const current = await this.getMeeting(actor, meetingId);

    if (current.status === toStatus) {
      // Idempotent repeated transition
      return current;
    }

    assertPhase6c3bManualTransition(current.status, toStatus);
    assertConsentAllowsLifecycleTransition({
      recordingNoticeRequired: current.recording_notice_required,
      consentStatus: current.consent_status,
      toStatus,
    });

    if (current.state_version !== expectedStateVersion) {
      throw new MeetingIntelligenceError(
        "meeting_concurrency_conflict",
        "Meeting was updated by another request",
        409,
        { expected: expectedStateVersion, actual: current.state_version },
      );
    }

    const correlationId = actor.correlationId ?? current.correlation_id ?? randomUUID();
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: toStatus,
      state_version: current.state_version + 1,
      updated_by: actor.userId,
      correlation_id: correlationId,
    };

    if (toStatus === "connecting" || toStatus === "live" || toStatus === "recording") {
      if (!current.actual_start_at) patch.actual_start_at = now;
    }
    if (toStatus === "ended" || toStatus === "failed" || toStatus === "cancelled") {
      patch.actual_end_at = now;
    }
    if (toStatus === "archived") {
      patch.archived_at = now;
    }

    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .update(patch)
      .eq("id", current.id)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("state_version", current.state_version)
      .eq("status", current.status)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to transition meeting: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_concurrency_conflict",
        "Meeting was updated by another request",
        409,
        { expected: expectedStateVersion },
      );
    }

    const updated = mapSession(data);
    const eventType = eventTypeForTransition(current.status, toStatus);
    const audit = buildMeetingTransitionAudit(current.status, toStatus, "pending", {
      correlationId,
      actorId: actor.userId,
    });
    const eventId = await this.insertEvent({
      actor,
      meeting: updated,
      eventType,
      previousState: current.status,
      newState: toStatus,
      correlationId,
      payload: { ...audit },
    });

    return { ...updated, metadata: { ...updated.metadata, lastTransitionEventId: eventId } };
  }

  async scheduleMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "scheduled", expectedStateVersion);
  }
  async startConnecting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "connecting", expectedStateVersion);
  }
  async markConnected(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "connected", expectedStateVersion);
  }
  async startRecording(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "recording", expectedStateVersion);
  }
  async markLive(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "live", expectedStateVersion);
  }
  async pauseMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "paused", expectedStateVersion);
  }
  async resumeMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "live", expectedStateVersion);
  }
  async endMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "ended", expectedStateVersion);
  }
  async cancelMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "cancelled", expectedStateVersion);
  }
  async failMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "failed", expectedStateVersion);
  }
  async archiveMeeting(actor: ManualMeetingActor, meetingId: string, expectedStateVersion: number) {
    return this.transitionMeeting(actor, meetingId, "archived", expectedStateVersion);
  }

  async listEvents(actor: ManualMeetingActor, meetingId: string) {
    await this.getMeeting(actor, meetingId);
    const { data, error } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_events")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .order("occurred_at", { ascending: true }),
    );

    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list events: ${error.message}`,
        500,
      );
    }
    return data ?? [];
  }

  private async insertEvent(input: {
    actor: ManualMeetingActor;
    meeting: MeetingSessionRow;
    eventType: string;
    previousState: MeetingStatus | null;
    newState: MeetingStatus | null;
    correlationId: string;
    payload?: Record<string, unknown>;
    providerEventId?: string | null;
  }): Promise<string> {
    const id = randomUUID();
    const { error } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        id,
        tenant_id: input.meeting.tenant_id,
        workspace_id: input.meeting.workspace_id,
        engineering_project_id: input.meeting.engineering_project_id,
        meeting_session_id: input.meeting.id,
        event_type: input.eventType,
        event_source: "manual",
        provider_event_id: input.providerEventId ?? null,
        actor_user_id: input.actor.userId,
        previous_state: input.previousState,
        new_state: input.newState,
        payload: input.payload ?? {},
        correlation_id: input.correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );

    if (error) {
      if (error.code === "23505" && input.providerEventId) {
        return id;
      }
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to create meeting event: ${error.message}`,
        500,
      );
    }
    return id;
  }
}
