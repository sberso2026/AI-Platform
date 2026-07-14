import { randomUUID } from "node:crypto";
import {
  ManualMeetingService,
  MeetingParticipantService,
  TranscriptAppendService,
  MeetingProcessingService,
  MeetingReviewService,
  MeetingMinutesGenerationService,
  MeetingEngineeringCoreWriteAdapter,
  MeetingTranscriptRecoveryService,
  MeetingTranscriptIngestionService,
  ProjectIntelligenceMeetingWorker,
  allMeetingProviderCapabilityReports,
  buildResumeToken,
  isMeetingJobType,
  type MeetingStatus,
  type ConsentStatus,
  type PrivacyClassification,
  type RecordingNoticeRequirement,
  type MeetingJobType,
  type MeetingProposalReviewState,
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
  const ordered = await new MeetingTranscriptIngestionService(client()).listOrdered(
    actor(context),
    meetingId,
  );
  return {
    segments: ordered.segments,
    gaps: ordered.gaps,
  };
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

export async function enqueueMeetingProcessing(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  return new MeetingProcessingService(client()).enqueueProcessing(actor(context), meetingId);
}

export async function getMeetingProcessingStatus(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  return new MeetingProcessingService(client()).getProcessingStatus(actor(context), meetingId);
}

export async function retryMeetingProcessing(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  return new MeetingProcessingService(client()).retryProcessing(actor(context), meetingId);
}

export async function listMeetingProposals(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  return new MeetingReviewService(client()).listProposals(actor(context), meetingId);
}

export async function getMeetingProposal(
  context: CommerceHandlerContext,
  proposalId: string,
) {
  return new MeetingReviewService(client()).getProposal(actor(context), proposalId);
}

export async function patchMeetingProposal(
  context: CommerceHandlerContext,
  proposalId: string,
  body: Record<string, unknown>,
) {
  return new MeetingReviewService(client()).patchProposal(actor(context), proposalId, {
    title: typeof body.title === "string" ? body.title : undefined,
    description:
      body.description === undefined ? undefined : (body.description as string | null),
    notes: typeof body.notes === "string" ? body.notes : undefined,
    reviewState:
      typeof body.reviewState === "string"
        ? (body.reviewState as MeetingProposalReviewState)
        : undefined,
  });
}

export async function approveMeetingProposal(
  context: CommerceHandlerContext,
  proposalId: string,
  notes?: string,
) {
  return new MeetingReviewService(client()).approveProposal(actor(context), proposalId, notes);
}

export async function rejectMeetingProposal(
  context: CommerceHandlerContext,
  proposalId: string,
  notes?: string,
) {
  return new MeetingReviewService(client()).rejectProposal(actor(context), proposalId, notes);
}

export async function requestMeetingProposalChanges(
  context: CommerceHandlerContext,
  proposalId: string,
  notes?: string,
) {
  return new MeetingReviewService(client()).requestProposalChanges(
    actor(context),
    proposalId,
    notes,
  );
}

export async function convertProposalToCore(
  context: CommerceHandlerContext,
  proposalId: string,
) {
  return new MeetingEngineeringCoreWriteAdapter(client()).convertApprovedProposal(
    actor(context),
    proposalId,
  );
}

export async function generateMinutes(
  context: CommerceHandlerContext,
  meetingId: string,
  body: { processingRunId?: string } = {},
) {
  const act = actor(context);
  let processingRunId = typeof body.processingRunId === "string" ? body.processingRunId : null;
  if (!processingRunId) {
    const status = await new MeetingProcessingService(client()).getProcessingStatus(
      act,
      meetingId,
    );
    processingRunId = status.processingRunId ?? randomUUID();
  }
  return new MeetingMinutesGenerationService(client()).generateFromTranscriptAndProposals({
    actor: act,
    meetingId,
    processingRunId,
  });
}

export async function listMinutes(context: CommerceHandlerContext, meetingId: string) {
  return new MeetingMinutesGenerationService(client()).listMinutes(actor(context), meetingId);
}

export async function listMinutesVersions(context: CommerceHandlerContext, meetingId: string) {
  return new MeetingMinutesGenerationService(client()).listMinutesVersions(
    actor(context),
    meetingId,
  );
}

export async function getMinutesVersion(context: CommerceHandlerContext, versionId: string) {
  return new MeetingMinutesGenerationService(client()).getMinutesVersion(
    actor(context),
    versionId,
  );
}

export async function submitMinutesReview(
  context: CommerceHandlerContext,
  minutesId: string,
) {
  return new MeetingReviewService(client()).submitMinutesReview(actor(context), minutesId);
}

export async function approveMinutes(context: CommerceHandlerContext, minutesId: string) {
  return new MeetingReviewService(client()).approveMinutes(actor(context), minutesId);
}

export async function requestMinutesChanges(
  context: CommerceHandlerContext,
  minutesId: string,
  notes?: string,
) {
  return new MeetingReviewService(client()).requestMinutesChanges(
    actor(context),
    minutesId,
    notes,
  );
}

export async function issueMinutes(context: CommerceHandlerContext, minutesId: string) {
  return new MeetingReviewService(client()).issueMinutes(actor(context), minutesId);
}

export async function listMeetingEvidence(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  return new MeetingReviewService(client()).listEvidence(actor(context), meetingId);
}

export async function replayTranscript(
  context: CommerceHandlerContext,
  meetingId: string,
  query: { cursor?: string | null; resumeToken?: string | null },
) {
  const resume =
    typeof query.resumeToken === "string" && query.resumeToken.trim()
      ? query.resumeToken.trim()
      : null;
  const rawCursor = typeof query.cursor === "string" ? query.cursor.trim() : "";
  const numericCursor = /^-?\d+$/.test(rawCursor) ? Number(rawCursor) : null;
  const token =
    resume
    || (numericCursor != null
      ? buildResumeToken({
          meetingSessionId: meetingId,
          lastAcknowledgedLogicalSequence: numericCursor,
        })
      : rawCursor
        || buildResumeToken({
          meetingSessionId: meetingId,
          lastAcknowledgedLogicalSequence: -1,
        }));
  return new MeetingTranscriptRecoveryService(client()).replayFromCursor(actor(context), token);
}

export async function runMeetingWorkerOnce(options?: {
  workerId?: string;
  jobTypes?: MeetingJobType[];
  batchSize?: number;
}) {
  const worker = new ProjectIntelligenceMeetingWorker(
    client() as unknown as ConstructorParameters<typeof ProjectIntelligenceMeetingWorker>[0],
    {
      workerId: options?.workerId ?? `api-meeting-drain-${randomUUID().slice(0, 8)}`,
      batchSize: options?.batchSize ?? 5,
      allowDeterministicFallback: true,
    },
  );
  const result = await worker.processBatch();
  return {
    ...result,
    workerId: worker.identity,
    jobTypeFilter: options?.jobTypes ?? null,
  };
}

export function parseMeetingJobTypeFilter(raw: unknown): MeetingJobType[] | undefined {
  if (raw == null) return undefined;
  const values = Array.isArray(raw) ? raw : [raw];
  const filtered: MeetingJobType[] = [];
  for (const value of values) {
    if (typeof value !== "string") {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        "jobTypes entries must be strings",
        422,
      );
    }
    if (!isMeetingJobType(value)) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unsupported meeting job type: ${value}`,
        422,
        { jobType: value },
      );
    }
    filtered.push(value);
  }
  return filtered;
}

export function meetingsHealthPayload() {
  return {
    schema: "batch_38+39_project_intelligence_meeting_processing",
    rls: "enabled",
    accessGuard: "requireProjectIntelligenceMeetingsAccess",
    application: "project-intelligence",
    feature: "meetings",
    notApplication: "meeting_intelligence",
    manualProvider: "certified",
    transcriptPersistence: "project_intelligence_transcript_segments",
    events: "project_intelligence_meeting_events",
    privacyConfiguration: "recording_notice_required + consent_status + privacy_classification",
    providers: allMeetingProviderCapabilityReports(),
    externalJoinActionsEnabled: false,
    processing: true,
    jobQueue: "project_intelligence_meeting_jobs",
    processingRuns: "project_intelligence_meeting_processing_runs",
    minutesPages: true,
    reviewPages: true,
    aiExtraction: true,
    coreWriteAdapter: "MeetingEngineeringCoreWriteAdapter",
    transcriptOrdering: "logical_sequence",
    transcriptReplay: true,
  };
}
