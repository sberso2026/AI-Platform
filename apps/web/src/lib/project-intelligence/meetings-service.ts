import {
  ManualMeetingService,
  MeetingParticipantService,
  TranscriptAppendService,
  allMeetingProviderCapabilityReports,
  type MeetingStatus,
  type ConsentStatus,
  type PrivacyClassification,
  type RecordingNoticeRequirement,
  MeetingIntelligenceError,
} from "@rtb/project-intelligence/server";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { createServiceClient } from "@/lib/supabase/service";

function requireWorkspace(context: CommerceHandlerContext): string {
  if (!context.ctx.workspaceId) {
    throw new MeetingIntelligenceError("meeting_access_denied", "Workspace is required", 403);
  }
  return context.ctx.workspaceId;
}

function actor(context: CommerceHandlerContext) {
  return {
    tenantId: context.ctx.tenantId,
    workspaceId: requireWorkspace(context),
    userId: context.ctx.userId,
    correlationId: context.correlationId,
  };
}

function client() {
  return createServiceClient() as unknown as ConstructorParameters<typeof ManualMeetingService>[0];
}

export async function listMeetings(context: CommerceHandlerContext) {
  return new ManualMeetingService(client()).listMeetings(actor(context));
}

export async function getMeeting(context: CommerceHandlerContext, meetingId: string) {
  return new ManualMeetingService(client()).getMeeting(actor(context), meetingId);
}

export async function createDraftMeeting(
  context: CommerceHandlerContext,
  body: {
    title?: string;
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
  },
) {
  if (!body.title?.trim()) {
    throw new MeetingIntelligenceError("meeting_validation_failed", "Title is required", 422);
  }
  return new ManualMeetingService(client()).createDraftMeeting(actor(context), {
    title: body.title,
    engineeringProjectId: body.engineeringProjectId,
    description: body.description,
    agenda: body.agenda,
    provider: body.provider ?? "manual",
    scheduledStartAt: body.scheduledStartAt,
    scheduledEndAt: body.scheduledEndAt,
    timezone: body.timezone,
    recordingNoticeRequired: body.recordingNoticeRequired,
    recordingNoticeText: body.recordingNoticeText,
    consentPolicy: body.consentPolicy,
    consentStatus: body.consentStatus,
    jurisdiction: body.jurisdiction,
    retentionPolicyId: body.retentionPolicyId,
    privacyClassification: body.privacyClassification,
  });
}

export async function updateDraftMeeting(
  context: CommerceHandlerContext,
  meetingId: string,
  body: Record<string, unknown>,
) {
  const expectedStateVersion = Number(body.expectedStateVersion);
  if (!Number.isFinite(expectedStateVersion) || expectedStateVersion < 1) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "expectedStateVersion is required",
      422,
    );
  }
  return new ManualMeetingService(client()).updateDraftMeeting(actor(context), {
    meetingId,
    expectedStateVersion,
    title: typeof body.title === "string" ? body.title : undefined,
    description: body.description === undefined ? undefined : (body.description as string | null),
    agenda: body.agenda === undefined ? undefined : (body.agenda as string | null),
    engineeringProjectId:
      body.engineeringProjectId === undefined
        ? undefined
        : (body.engineeringProjectId as string | null),
    scheduledStartAt:
      body.scheduledStartAt === undefined ? undefined : (body.scheduledStartAt as string | null),
    scheduledEndAt:
      body.scheduledEndAt === undefined ? undefined : (body.scheduledEndAt as string | null),
    timezone: body.timezone === undefined ? undefined : (body.timezone as string | null),
    recordingNoticeRequired: body.recordingNoticeRequired as RecordingNoticeRequirement | undefined,
    recordingNoticeText:
      body.recordingNoticeText === undefined
        ? undefined
        : (body.recordingNoticeText as string | null),
    consentPolicy:
      body.consentPolicy === undefined ? undefined : (body.consentPolicy as string | null),
    consentStatus: body.consentStatus as ConsentStatus | undefined,
    jurisdiction:
      body.jurisdiction === undefined ? undefined : (body.jurisdiction as string | null),
    retentionPolicyId:
      body.retentionPolicyId === undefined ? undefined : (body.retentionPolicyId as string | null),
    privacyClassification: body.privacyClassification as PrivacyClassification | undefined,
  });
}

export async function transitionMeeting(
  context: CommerceHandlerContext,
  meetingId: string,
  body: { toStatus?: string; expectedStateVersion?: number },
) {
  const expectedStateVersion = Number(body.expectedStateVersion);
  if (!body.toStatus || !Number.isFinite(expectedStateVersion)) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "toStatus and expectedStateVersion are required",
      422,
    );
  }
  return new ManualMeetingService(client()).transitionMeeting(
    actor(context),
    meetingId,
    body.toStatus as MeetingStatus,
    expectedStateVersion,
  );
}

export async function listParticipants(context: CommerceHandlerContext, meetingId: string) {
  return new MeetingParticipantService(client()).listParticipants(actor(context), meetingId, {
    includeEmail: false,
  });
}

export async function addParticipant(
  context: CommerceHandlerContext,
  meetingId: string,
  body: Record<string, unknown>,
) {
  return new MeetingParticipantService(client()).addParticipant(actor(context), {
    meetingId,
    displayName: String(body.displayName ?? ""),
    email: body.email == null ? null : String(body.email),
    userId: body.userId == null ? null : String(body.userId),
    externalParticipantId:
      body.externalParticipantId == null ? null : String(body.externalParticipantId),
    role: body.role == null ? undefined : String(body.role),
    speakerId: body.speakerId == null ? null : String(body.speakerId),
    consentStatus: body.consentStatus as ConsentStatus | undefined,
    includeEmail: false,
  });
}

export async function updateParticipant(
  context: CommerceHandlerContext,
  meetingId: string,
  participantId: string,
  body: Record<string, unknown>,
) {
  const service = new MeetingParticipantService(client());
  if (typeof body.consentStatus === "string" && Object.keys(body).length === 1) {
    return service.updateConsent(
      actor(context),
      meetingId,
      participantId,
      body.consentStatus as ConsentStatus,
    );
  }
  if (typeof body.speakerId === "string" && Object.keys(body).length === 1) {
    return service.assignSpeakerIdentity(
      actor(context),
      meetingId,
      participantId,
      body.speakerId,
    );
  }
  if (body.action === "join") {
    return service.recordJoin(actor(context), meetingId, participantId);
  }
  if (body.action === "leave") {
    return service.recordLeave(actor(context), meetingId, participantId);
  }
  return service.updateParticipant(actor(context), meetingId, participantId, {
    displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    email: body.email === undefined ? undefined : (body.email as string | null),
    role: typeof body.role === "string" ? body.role : undefined,
    attendanceStatus:
      typeof body.attendanceStatus === "string" ? body.attendanceStatus : undefined,
    consentStatus: body.consentStatus as ConsentStatus | undefined,
    speakerId: body.speakerId === undefined ? undefined : (body.speakerId as string | null),
    includeEmail: false,
  });
}

export async function listTranscript(context: CommerceHandlerContext, meetingId: string) {
  return new TranscriptAppendService(client()).listSegments(actor(context), meetingId);
}

export async function appendTranscript(
  context: CommerceHandlerContext,
  meetingId: string,
  body: Record<string, unknown>,
) {
  return new TranscriptAppendService(client()).appendSegment(actor(context), {
    meetingId,
    providerEventId: String(body.providerEventId ?? ""),
    text: String(body.text ?? ""),
    sequenceNumber:
      body.sequenceNumber == null ? undefined : Number(body.sequenceNumber),
    startTimeMs: Number(body.startTimeMs ?? 0),
    endTimeMs: Number(body.endTimeMs ?? 0),
    speakerId: body.speakerId == null ? null : String(body.speakerId),
    speakerLabel: body.speakerLabel == null ? null : String(body.speakerLabel),
    confidence: body.confidence == null ? null : Number(body.confidence),
    language: body.language == null ? null : String(body.language),
    source: typeof body.source === "string" ? body.source : "manual",
  });
}

export async function reviseTranscript(
  context: CommerceHandlerContext,
  meetingId: string,
  segmentId: string,
  body: Record<string, unknown>,
) {
  return new TranscriptAppendService(client()).reviseSegment(
    actor(context),
    meetingId,
    segmentId,
    String(body.revisedText ?? body.text ?? ""),
    typeof body.revisionReason === "string" ? body.revisionReason : undefined,
  );
}

export async function listMeetingEvents(context: CommerceHandlerContext, meetingId: string) {
  return new ManualMeetingService(client()).listEvents(actor(context), meetingId);
}

export function meetingsHealthPayload() {
  return {
    schema: "batch_38_project_intelligence_meeting_foundation",
    rls: "enabled",
    accessGuard: "requireProjectIntelligenceMeetingsAccess",
    application: "project-intelligence",
    feature: "meetings",
    notApplication: "meeting_intelligence",
    manualProvider: "certified_candidate",
    transcriptPersistence: "project_intelligence_transcript_segments",
    events: "project_intelligence_meeting_events",
    privacyConfiguration: "recording_notice_required + consent_status + privacy_classification",
    providers: allMeetingProviderCapabilityReports(),
    externalJoinActionsEnabled: false,
    minutesPages: false,
    reviewPages: false,
    aiExtraction: false,
  };
}
