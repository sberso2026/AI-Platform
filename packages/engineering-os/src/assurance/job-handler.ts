import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler } from "@rtb/types";
import { ASSURANCE_JOB_TYPE } from "./types";
import type { EngineeringAssuranceService } from "./service";

export function createAssuranceEvaluateHandler(assurance: EngineeringAssuranceService): JobHandler {
  return {
    jobType: ASSURANCE_JOB_TYPE,
    async handle(job: BackgroundJob) {
      const payload = job.payload ?? {};
      const tenantId = String(payload.tenantId ?? job.tenant_id ?? "");
      const workspaceId = String(payload.workspaceId ?? job.workspace_id ?? "");
      if (!tenantId || !workspaceId) throw new Error("invalid_assurance_evaluate_job");
      const objectType = payload.objectType ? String(payload.objectType) : undefined;
      const objectId = payload.objectId ? String(payload.objectId) : undefined;
      const ruleId = payload.ruleId ? String(payload.ruleId) : undefined;
      return assurance.evaluateInternal(tenantId, workspaceId, { ruleId, objectType, objectId });
    },
  };
}

export function registerAssuranceEvaluateHandler(jobs: JobService, assurance: EngineeringAssuranceService): void {
  jobs.registerHandler(createAssuranceEvaluateHandler(assurance));
}
