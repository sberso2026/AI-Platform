import { createHash, randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor, MeetingSessionRow } from "./manual-meeting-service";
import { ManualMeetingService } from "./manual-meeting-service";
import {
  assertUserCannotSetWorkerOwnedStatus,
  assertWorkerMeetingTransition,
} from "./meeting-state-machine";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "./supabase-types";
import type { MeetingJobType, MeetingStatus } from "./types";
import { MEETING_JOB_TYPES } from "./types";

export type EnqueueProcessingResult = {
  accepted: true;
  jobId: string;
  processingRunId: string;
  reused: boolean;
};

export type MeetingProcessingStatusView = {
  meetingId: string;
  meetingStatus: MeetingStatus;
  processingRunId: string | null;
  processingRunStatus: string | null;
  jobId: string | null;
  jobStatus: string | null;
  jobType: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  canRetry: boolean;
};

function buildProcessIdempotencyKey(meetingId: string, stateVersion: number, checksum: string): string {
  return [
    "project_intelligence.meeting.process_transcript",
    meetingId,
    String(stateVersion),
    checksum,
  ].join(":");
}

async function checksumMeetingTranscript(
  supabase: MeetingSupabaseClient,
  meeting: MeetingSessionRow,
): Promise<string> {
  const { data, error } = await awaitList(
    supabase
      .from("project_intelligence_transcript_segments")
      .select("id,content_checksum,text,logical_sequence,revision_number")
      .eq("meeting_session_id", meeting.id)
      .eq("tenant_id", meeting.tenant_id)
      .eq("workspace_id", meeting.workspace_id)
      .eq("status", "active")
      .order("logical_sequence", { ascending: true }),
  );
  if (error) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      `Unable to checksum transcript: ${error.message}`,
      500,
    );
  }
  const material = (data ?? [])
    .map((row) =>
      [
        row.id,
        row.logical_sequence,
        row.revision_number,
        row.content_checksum ?? createHash("sha256").update(String(row.text ?? "")).digest("hex"),
      ].join(":"),
    )
    .join("|");
  return createHash("sha256").update(material || "empty-transcript").digest("hex");
}

export class MeetingProcessingService {
  private readonly meetings: ManualMeetingService;

  constructor(private readonly supabase: MeetingSupabaseClient) {
    this.meetings = new ManualMeetingService(supabase);
  }

  /**
   * Enqueue durable processing without running AI inline.
   * Transitions ended → processing when needed; persists run + job + outbox first.
   */
  async enqueueProcessing(
    actor: ManualMeetingActor,
    meetingId: string,
  ): Promise<EnqueueProcessingResult> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);

    if ((["processing", "minutes_draft"] as MeetingStatus[]).includes(meeting.status)) {
      const active = await this.findActiveRunAndJob(meeting);
      if (active) {
        return {
          accepted: true,
          jobId: active.jobId,
          processingRunId: active.processingRunId,
          reused: true,
        };
      }
    }

    if (meeting.status !== "ended" && meeting.status !== "failed") {
      throw new MeetingIntelligenceError(
        "processing_invalid_state",
        "Processing can only be enqueued from ended (or failed for retry)",
        409,
        { status: meeting.status },
      );
    }

    const transcriptChecksum = await checksumMeetingTranscript(this.supabase, meeting);
    const idempotencyKey = buildProcessIdempotencyKey(
      meeting.id,
      meeting.state_version,
      transcriptChecksum,
    );

    const existingJob = await this.findJobByIdempotency(actor, idempotencyKey);
    if (existingJob) {
      return {
        accepted: true,
        jobId: String(existingJob.id),
        processingRunId: String(existingJob.processing_run_id),
        reused: true,
      };
    }

    const correlationId = actor.correlationId ?? meeting.correlation_id ?? randomUUID();
    const processingRunId = randomUUID();
    const jobId = randomUUID();

    const transitioned = await this.workerTransitionMeeting(
      actor,
      meeting,
      "processing",
      correlationId,
    );

    const { error: runError } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_processing_runs").insert({
        id: processingRunId,
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        meeting_session_id: meeting.id,
        status: "queued",
        processing_version: "1",
        transcript_revision_checksum: transcriptChecksum,
        meeting_state_version: transitioned.state_version,
        generated_by: "enqueue",
        correlation_id: correlationId,
        metadata: { enqueuedBy: actor.userId },
      }),
    );
    if (runError) {
      if (runError.code === "23505") {
        const active = await this.findActiveRunAndJob(transitioned);
        if (active) {
          return {
            accepted: true,
            jobId: active.jobId,
            processingRunId: active.processingRunId,
            reused: true,
          };
        }
      }
      throw new MeetingIntelligenceError(
        "processing_already_active",
        `Unable to create processing run: ${runError.message}`,
        409,
      );
    }

    const { error: jobError } = await awaitMutation(
      this.supabase.from("project_intelligence_meeting_jobs").insert({
        id: jobId,
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        meeting_session_id: meeting.id,
        processing_run_id: processingRunId,
        job_type: MEETING_JOB_TYPES[0],
        status: "queued",
        attempt_count: 0,
        max_attempts: 5,
        available_at: new Date().toISOString(),
        payload: {
          meetingId: meeting.id,
          transcriptChecksum,
          processingVersion: "1",
        },
        idempotency_key: idempotencyKey,
        correlation_id: correlationId,
      }),
    );
    if (jobError) {
      if (jobError.code === "23505") {
        const again = await this.findJobByIdempotency(actor, idempotencyKey);
        if (again) {
          return {
            accepted: true,
            jobId: String(again.id),
            processingRunId: String(again.processing_run_id),
            reused: true,
          };
        }
      }
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to enqueue meeting job: ${jobError.message}`,
        500,
      );
    }

    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_outbox").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        aggregate_type: "meeting",
        aggregate_id: meeting.id,
        event_type: "meeting.processing_enqueued",
        payload: { jobId, processingRunId, meetingId: meeting.id },
        correlation_id: correlationId,
        idempotency_key: `${idempotencyKey}:enqueued`,
        status: "pending",
      }),
    );

    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_events").insert({
        tenant_id: actor.tenantId,
        workspace_id: actor.workspaceId,
        engineering_project_id: meeting.engineering_project_id,
        meeting_session_id: meeting.id,
        event_type: "meeting.processing_enqueued",
        event_source: "manual",
        actor_user_id: actor.userId,
        previous_state: meeting.status,
        new_state: "processing",
        payload: { jobId, processingRunId },
        correlation_id: correlationId,
        occurred_at: new Date().toISOString(),
      }),
    );

    return { accepted: true, jobId, processingRunId, reused: false };
  }

  async getProcessingStatus(
    actor: ManualMeetingActor,
    meetingId: string,
  ): Promise<MeetingProcessingStatusView> {
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    const { data: runs } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_processing_runs")
        .select("*")
        .eq("meeting_session_id", meetingId)
        .eq("tenant_id", actor.tenantId)
        .eq("workspace_id", actor.workspaceId)
        .order("created_at", { ascending: false })
        .limit(1),
    );
    const run = (runs ?? [])[0] ?? null;
    let job: Record<string, unknown> | null = null;
    if (run) {
      const { data: jobs } = await awaitList(
        this.supabase
          .from("project_intelligence_meeting_jobs")
          .select("*")
          .eq("processing_run_id", String(run.id))
          .eq("tenant_id", actor.tenantId)
          .eq("workspace_id", actor.workspaceId)
          .order("created_at", { ascending: false })
          .limit(1),
      );
      job = (jobs ?? [])[0] ?? null;
    }

    const jobStatus = job ? String(job.status) : null;
    const runStatus = run ? String(run.status) : null;
    const canRetry =
      meeting.status === "failed"
      || jobStatus === "dead_letter"
      || jobStatus === "failed"
      || runStatus === "failed";

    return {
      meetingId,
      meetingStatus: meeting.status,
      processingRunId: run ? String(run.id) : null,
      processingRunStatus: runStatus,
      jobId: job ? String(job.id) : null,
      jobStatus,
      jobType: job ? String(job.job_type) : null,
      lastErrorCode: job?.last_error_code == null
        ? (run?.error_code == null ? null : String(run.error_code))
        : String(job.last_error_code),
      lastErrorMessage: job?.last_error_message == null
        ? (run?.error_message == null ? null : String(run.error_message))
        : String(job.last_error_message),
      canRetry,
    };
  }

  async retryProcessing(
    actor: ManualMeetingActor,
    meetingId: string,
  ): Promise<EnqueueProcessingResult> {
    const status = await this.getProcessingStatus(actor, meetingId);
    if (!status.canRetry && status.meetingStatus !== "ended") {
      throw new MeetingIntelligenceError(
        "processing_retry_invalid",
        "Meeting processing is not in a retryable state",
        409,
        { status },
      );
    }

    if (status.meetingStatus === "processing" || status.meetingStatus === "minutes_draft") {
      throw new MeetingIntelligenceError(
        "processing_already_active",
        "An active processing pipeline already exists",
        409,
      );
    }

    // Move failed → processing via enqueue path (or ended → processing).
    const meeting = await this.meetings.getMeeting(actor, meetingId);
    if (meeting.status === "failed") {
      // enqueueProcessing accepts failed and will transition to processing.
      return this.enqueueProcessing(actor, meetingId);
    }
    if (meeting.status === "ended") {
      return this.enqueueProcessing(actor, meetingId);
    }
    throw new MeetingIntelligenceError(
      "processing_retry_invalid",
      "Retry requires ended or failed meeting status",
      409,
      { status: meeting.status },
    );
  }

  /** Guard used by API layers that forward arbitrary status transitions. */
  assertUserTransitionAllowed(toStatus: MeetingStatus): void {
    assertUserCannotSetWorkerOwnedStatus(toStatus);
  }

  private async workerTransitionMeeting(
    actor: ManualMeetingActor,
    meeting: MeetingSessionRow,
    toStatus: MeetingStatus,
    correlationId: string,
  ): Promise<MeetingSessionRow> {
    if (meeting.status === toStatus) return meeting;
    assertWorkerMeetingTransition(meeting.status, toStatus);
    const patch: Record<string, unknown> = {
      status: toStatus,
      state_version: meeting.state_version + 1,
      updated_by: actor.userId,
      correlation_id: correlationId,
    };
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .update(patch)
      .eq("id", meeting.id)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("state_version", meeting.state_version)
      .eq("status", meeting.status)
      .select("*")
      .maybeSingle();
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to transition meeting for processing: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) {
      throw new MeetingIntelligenceError(
        "meeting_concurrency_conflict",
        "Meeting was updated by another request during enqueue",
        409,
      );
    }
    return {
      ...meeting,
      status: toStatus,
      state_version: meeting.state_version + 1,
      correlation_id: correlationId,
    };
  }

  private async findJobByIdempotency(actor: ManualMeetingActor, key: string) {
    const { data, error } = await this.supabase
      .from("project_intelligence_meeting_jobs")
      .select("*")
      .eq("idempotency_key", key)
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .maybeSingle();
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to lookup job idempotency: ${error.message}`,
        500,
      );
    }
    if (!data || Array.isArray(data)) return null;
    return asRecord(data);
  }

  private async findActiveRunAndJob(meeting: MeetingSessionRow): Promise<{
    jobId: string;
    processingRunId: string;
  } | null> {
    const { data: runs } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_processing_runs")
        .select("*")
        .eq("meeting_session_id", meeting.id)
        .eq("tenant_id", meeting.tenant_id)
        .eq("workspace_id", meeting.workspace_id)
        .order("created_at", { ascending: false })
        .limit(5),
    );
    const active = (runs ?? []).find((row) =>
      ["queued", "claimed", "running", "retry_pending"].includes(String(row.status)),
    );
    if (!active) return null;
    const { data: jobs } = await awaitList(
      this.supabase
        .from("project_intelligence_meeting_jobs")
        .select("*")
        .eq("processing_run_id", String(active.id))
        .eq("tenant_id", meeting.tenant_id)
        .eq("workspace_id", meeting.workspace_id)
        .order("created_at", { ascending: false })
        .limit(1),
    );
    const job = (jobs ?? [])[0];
    if (!job) return null;
    return { jobId: String(job.id), processingRunId: String(active.id) };
  }
}

export function isMeetingJobType(value: string): value is MeetingJobType {
  return (MEETING_JOB_TYPES as readonly string[]).includes(value);
}
