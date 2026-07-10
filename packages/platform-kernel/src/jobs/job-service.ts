import type { Json, SupabaseClient } from "@rtb/database";
import type { BackgroundJob, JobHandler, JobType } from "@rtb/types";

export interface CreateJobInput {
  tenantId: string;
  workspaceId?: string;
  jobType: JobType | string;
  payload?: Record<string, unknown>;
  priority?: number;
  scheduledFor?: string;
  createdBy?: string;
  maxRetries?: number;
}

export class JobService {
  private handlers = new Map<string, JobHandler>();

  constructor(private readonly supabase: SupabaseClient) {}

  registerHandler(handler: JobHandler): void {
    this.handlers.set(handler.jobType, handler);
  }

  async create(input: CreateJobInput): Promise<BackgroundJob> {
    const { data, error } = await this.supabase
      .from("background_jobs")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        job_type: input.jobType,
        payload: (input.payload ?? {}) as Json,
        priority: input.priority ?? 100,
        scheduled_for: input.scheduledFor ?? null,
        created_by: input.createdBy ?? null,
        max_retries: input.maxRetries ?? 3,
        status: "pending",
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create job: ${error?.message}`);
    return mapJob(data);
  }

  async list(tenantId: string, limit = 50): Promise<BackgroundJob[]> {
    const { data, error } = await this.supabase
      .from("background_jobs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list jobs: ${error.message}`);
    return (data ?? []).map(mapJob);
  }

  async process(jobId: string): Promise<BackgroundJob> {
    const { data: job, error } = await this.supabase
      .from("background_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !job) throw new Error("Job not found");

    const jobRow = job as Record<string, unknown>;
    const handler = this.handlers.get(jobRow.job_type as string);
    if (!handler) {
      await this.supabase
        .from("background_jobs")
        .update({ status: "failed", error_message: `No handler for ${jobRow.job_type}` })
        .eq("id", jobId);
      throw new Error(`No handler registered for job type: ${jobRow.job_type}`);
    }

    const attemptNumber = (jobRow.retry_count as number) + 1;
    await this.supabase.from("job_attempts").insert({
      job_id: jobId,
      attempt_number: attemptNumber,
      status: "running",
    });

    await this.supabase
      .from("background_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", jobId);

    try {
      const result = await handler.handle(mapJob(jobRow));
      const { data: updated } = await this.supabase
        .from("background_jobs")
        .update({
          status: "completed",
          result: result as Json,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .select()
        .single();

      await this.supabase
        .from("job_attempts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("job_id", jobId)
        .eq("attempt_number", attemptNumber);

      return mapJob(updated!);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Job failed";
      const newRetryCount = (jobRow.retry_count as number) + 1;
      const status = newRetryCount >= (jobRow.max_retries as number) ? "failed" : "pending";

      const { data: updated } = await this.supabase
        .from("background_jobs")
        .update({
          status,
          retry_count: newRetryCount,
          error_message: errorMessage,
        })
        .eq("id", jobId)
        .select()
        .single();

      await this.supabase
        .from("job_attempts")
        .update({ status: "failed", error_message: errorMessage, completed_at: new Date().toISOString() })
        .eq("job_id", jobId)
        .eq("attempt_number", attemptNumber);

      return mapJob(updated!);
    }
  }
}

function mapJob(row: Record<string, unknown>): BackgroundJob {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    job_type: row.job_type as string,
    status: row.status as BackgroundJob["status"],
    priority: row.priority as number,
    payload: (row.payload as Record<string, unknown>) ?? {},
    result: row.result as Record<string, unknown> | undefined,
    retry_count: row.retry_count as number,
    max_retries: row.max_retries as number,
    error_message: row.error_message as string | undefined,
    scheduled_for: row.scheduled_for as string | undefined,
    started_at: row.started_at as string | undefined,
    completed_at: row.completed_at as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
