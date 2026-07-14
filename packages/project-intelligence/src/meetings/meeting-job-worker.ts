import { randomUUID } from "node:crypto";

import {
  DeterministicMeetingAiAdapter,
  type MeetingAiPort,
} from "./deterministic-meeting-ai-adapter";
import { MeetingIntelligenceError } from "./errors";
import type { ManualMeetingActor } from "./manual-meeting-service";
import { MeetingMinutesGenerationService } from "./minutes-generation-service";
import { assertWorkerMeetingTransition } from "./meeting-state-machine";
import { MeetingProposalExtractionService } from "./proposal-extraction-service";
import {
  asRecord,
  awaitMutation,
  type MeetingWorkerClient,
} from "./supabase-types";
import { MeetingTranscriptNormalizationService } from "./transcript-normalization-service";
import { MEETING_JOB_TYPES, type MeetingJobType, type MeetingStatus } from "./types";

export type MeetingWorkerOptions = {
  workerId?: string;
  batchSize?: number;
  leaseSeconds?: number;
  ai?: MeetingAiPort | null;
  /** When false and AI not injected, fail closed with processing_ai_unavailable. */
  allowDeterministicFallback?: boolean;
};

type MeetingJobRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  meeting_session_id: string;
  processing_run_id: string | null;
  job_type: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  correlation_id: string | null;
};

/**
 * Durable meeting job worker — mirrors document worker claim/lease/retry/dead-letter patterns.
 * process_transcript: normalize → extract proposals → generate minutes → processing→minutes_draft→review_pending.
 */
export class ProjectIntelligenceMeetingWorker {
  private readonly workerId: string;
  private readonly batchSize: number;
  private readonly leaseSeconds: number;
  private readonly ai: MeetingAiPort | null;
  private readonly allowDeterministicFallback: boolean;

  constructor(
    private readonly supabase: MeetingWorkerClient,
    options: MeetingWorkerOptions = {},
  ) {
    this.workerId = options.workerId ?? `pi-meeting-worker-${randomUUID().slice(0, 8)}`;
    this.batchSize = options.batchSize ?? 5;
    this.leaseSeconds = options.leaseSeconds ?? 180;
    this.allowDeterministicFallback = options.allowDeterministicFallback ?? true;
    if (options.ai) {
      this.ai = options.ai;
    } else if (this.allowDeterministicFallback) {
      this.ai = new DeterministicMeetingAiAdapter();
    } else {
      this.ai = null;
    }
  }

  get identity(): string {
    return this.workerId;
  }

  async releaseExpiredLeases(): Promise<number> {
    const { data, error } = await this.supabase.rpc("pi_meeting_release_expired_leases");
    if (error) throw new Error(error.message);
    return Number(data ?? 0);
  }

  async processBatch(): Promise<{ claimed: number; completed: number; failed: number }> {
    await this.releaseExpiredLeases();
    const { data, error } = await this.supabase.rpc("pi_meeting_claim_jobs", {
      p_worker_id: this.workerId,
      p_limit: this.batchSize,
      p_lease_seconds: this.leaseSeconds,
    });
    if (error) throw new Error(`pi_meeting_claim_jobs failed: ${error.message}`);
    const jobs = (Array.isArray(data) ? data : []).map((row) => asRecord(row) as unknown as MeetingJobRow);
    let completed = 0;
    let failed = 0;
    for (const job of jobs) {
      try {
        await this.runJob(job);
        completed += 1;
      } catch (reason) {
        failed += 1;
        try {
          await this.failJob(job, reason);
        } catch (failError) {
          console.error("pi meeting worker failJob error", failError);
        }
      }
    }
    return { claimed: jobs.length, completed, failed };
  }

  private requireAi(): MeetingAiPort {
    if (!this.ai) {
      throw new MeetingIntelligenceError(
        "processing_ai_unavailable",
        "Governed meeting AI unavailable; preserve transcript and allow retry",
        503,
      );
    }
    return this.ai;
  }

  private async runJob(job: MeetingJobRow): Promise<void> {
    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_jobs")
        .update({ status: "running", updated_at: new Date().toISOString() })
        .eq("id", job.id)
        .eq("locked_by", this.workerId),
    );

    if (job.processing_run_id) {
      await awaitMutation(
        this.supabase
          .from("project_intelligence_meeting_processing_runs")
          .update({
            status: "running",
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.processing_run_id),
      );
    }

    const jobType = job.job_type as MeetingJobType;
    if (jobType === MEETING_JOB_TYPES[0] || jobType === "project_intelligence.meeting.retry") {
      await this.processTranscriptPipeline(job);
    } else if (jobType === "project_intelligence.meeting.extract_proposals") {
      await this.extractOnly(job);
    } else if (jobType === "project_intelligence.meeting.generate_minutes") {
      await this.minutesOnly(job);
    } else if (
      jobType === "project_intelligence.meeting.refresh_evidence"
      || jobType === "project_intelligence.meeting.cleanup"
    ) {
      // Catalogue stubs — no Core mutation.
    } else {
      throw Object.assign(new Error(`Unsupported meeting job type: ${job.job_type}`), {
        code: "meeting_validation_failed",
      });
    }

    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          locked_at: null,
          locked_by: null,
          lease_expires_at: null,
          last_error_code: null,
          last_error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id),
    );

    if (job.processing_run_id) {
      await awaitMutation(
        this.supabase
          .from("project_intelligence_meeting_processing_runs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.processing_run_id),
      );
    }

    await this.publishOutbox(job, "meeting.processing_completed", {
      jobId: job.id,
      processingRunId: job.processing_run_id,
    });
  }

  private async processTranscriptPipeline(job: MeetingJobRow): Promise<void> {
    const ai = this.requireAi();
    const actor = this.actorForJob(job);
    const meetingId = job.meeting_session_id;
    const processingRunId = job.processing_run_id ?? randomUUID();

    const normalization = new MeetingTranscriptNormalizationService(this.supabase);
    await normalization.normalizeMeetingTranscript({
      tenantId: job.tenant_id,
      workspaceId: job.workspace_id,
      meetingSessionId: meetingId,
    });

    const extraction = new MeetingProposalExtractionService(this.supabase, ai);
    const proposals = await extraction.extractAndPersist({
      actor,
      meetingId,
      processingRunId,
    });

    const minutesService = new MeetingMinutesGenerationService(this.supabase, ai);
    const generated = await minutesService.generateFromTranscriptAndProposals({
      actor,
      meetingId,
      processingRunId,
      proposals,
    });

    await this.transitionMeeting(job, "processing", "minutes_draft");
    await minutesService.markReviewPending(generated.minutesId, job.tenant_id, job.workspace_id);
    await this.transitionMeeting(job, "minutes_draft", "review_pending");
  }

  private async extractOnly(job: MeetingJobRow): Promise<void> {
    const extraction = new MeetingProposalExtractionService(this.supabase, this.requireAi());
    await extraction.extractAndPersist({
      actor: this.actorForJob(job),
      meetingId: job.meeting_session_id,
      processingRunId: job.processing_run_id ?? randomUUID(),
    });
  }

  private async minutesOnly(job: MeetingJobRow): Promise<void> {
    const minutes = new MeetingMinutesGenerationService(this.supabase, this.requireAi());
    await minutes.generateFromTranscriptAndProposals({
      actor: this.actorForJob(job),
      meetingId: job.meeting_session_id,
      processingRunId: job.processing_run_id ?? randomUUID(),
    });
  }

  private actorForJob(job: MeetingJobRow): ManualMeetingActor {
    return {
      tenantId: job.tenant_id,
      workspaceId: job.workspace_id,
      userId: "00000000-0000-0000-0000-000000000000",
      correlationId: job.correlation_id ?? job.id,
    };
  }

  private async transitionMeeting(
    job: MeetingJobRow,
    from: MeetingStatus,
    to: MeetingStatus,
  ): Promise<void> {
    assertWorkerMeetingTransition(from, to);
    const { data: session } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .select("id,status,state_version")
      .eq("id", job.meeting_session_id)
      .eq("tenant_id", job.tenant_id)
      .eq("workspace_id", job.workspace_id)
      .maybeSingle();
    if (!session || Array.isArray(session)) {
      throw new MeetingIntelligenceError("meeting_not_found", "Meeting not found for worker transition", 404);
    }
    const row = asRecord(session);
    if (String(row.status) !== from) {
      if (String(row.status) === to) return;
      throw new MeetingIntelligenceError(
        "meeting_transition_invalid",
        "Unexpected meeting status during worker pipeline",
        409,
        { expected: from, actual: row.status },
      );
    }
    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_sessions")
        .update({
          status: to,
          state_version: Number(row.state_version) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.meeting_session_id)
        .eq("state_version", row.state_version)
        .eq("status", from),
    );
  }

  private async publishOutbox(
    job: MeetingJobRow,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await awaitMutation(
      this.supabase.from("project_intelligence_meeting_outbox").insert({
        tenant_id: job.tenant_id,
        workspace_id: job.workspace_id,
        aggregate_type: "meeting",
        aggregate_id: job.meeting_session_id,
        event_type: eventType,
        payload,
        correlation_id: job.correlation_id,
        idempotency_key: `${job.id}:${eventType}:${job.attempt_count}`,
        status: "pending",
      }),
    );
  }

  private async failJob(job: MeetingJobRow, reason: unknown): Promise<void> {
    const message = reason instanceof Error ? reason.message : String(reason);
    const code = reason instanceof MeetingIntelligenceError
      ? reason.code
      : typeof reason === "object" && reason && "code" in reason
        ? String((reason as { code: string }).code)
        : "processing_failed";

    const retry = job.attempt_count < job.max_attempts
      && !["meeting_access_denied", "meeting_legal_hold"].includes(code);
    const status = retry ? "retry_pending" : "dead_letter";
    const availableAt = new Date(
      Date.now() + Math.min(60_000, 1000 * 2 ** Math.max(0, job.attempt_count - 1)),
    ).toISOString();

    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_jobs")
        .update({
          status,
          available_at: retry ? availableAt : new Date().toISOString(),
          locked_at: null,
          locked_by: null,
          lease_expires_at: null,
          last_error_code: code,
          last_error_message: message.slice(0, 2000),
          completed_at: retry ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id),
    );

    if (job.processing_run_id) {
      await awaitMutation(
        this.supabase
          .from("project_intelligence_meeting_processing_runs")
          .update({
            status: "failed",
            error_code: code,
            error_message: message.slice(0, 2000),
            completed_at: retry ? null : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.processing_run_id),
      );
    }

    if (!retry) {
      await awaitMutation(
        this.supabase.from("project_intelligence_meeting_dead_letters").insert({
          job_id: job.id,
          tenant_id: job.tenant_id,
          workspace_id: job.workspace_id,
          meeting_session_id: job.meeting_session_id,
          job_type: job.job_type,
          error_code: code,
          error_message: message.slice(0, 2000),
          payload: job.payload,
          review_state: "pending",
        }),
      );
      await this.failMeetingSession(job);
    }

    await this.publishOutbox(job, "meeting.processing_failed", {
      jobId: job.id,
      code,
      message,
      status,
    });
  }

  private async failMeetingSession(job: MeetingJobRow): Promise<void> {
    const { data } = await this.supabase
      .from("project_intelligence_meeting_sessions")
      .select("id,status,state_version")
      .eq("id", job.meeting_session_id)
      .maybeSingle();
    if (!data || Array.isArray(data)) return;
    const row = asRecord(data);
    if (!["processing", "minutes_draft"].includes(String(row.status))) return;
    await awaitMutation(
      this.supabase
        .from("project_intelligence_meeting_sessions")
        .update({
          status: "failed",
          state_version: Number(row.state_version) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.meeting_session_id)
        .eq("state_version", row.state_version),
    );
  }
}
