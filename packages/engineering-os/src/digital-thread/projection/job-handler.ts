import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler } from "@rtb/types";
import type { CanonicalGovernedLink } from "./types";
import { THREAD_PROJECTION_JOB_TYPE } from "./types";
import type { EngineeringDigitalThreadProjectionService } from "./service";

export type CanonicalLinkLoader = {
  loadWorkspaceLinks(tenantId: string, workspaceId: string): Promise<CanonicalGovernedLink[]>;
};

export function createThreadProjectionJobHandler(
  projection: EngineeringDigitalThreadProjectionService,
  loader: CanonicalLinkLoader,
): JobHandler {
  return {
    jobType: THREAD_PROJECTION_JOB_TYPE,
    async handle(job: BackgroundJob) {
      const payload = job.payload ?? {};
      const tenantId = String(payload.tenantId ?? job.tenant_id ?? "");
      const workspaceId = String(payload.workspaceId ?? job.workspace_id ?? "");
      const mode = String(payload.mode ?? "rebuild");
      if (!tenantId || !workspaceId) throw new Error("invalid_thread_projection_job");
      const links = await loader.loadWorkspaceLinks(tenantId, workspaceId);
      if (mode === "reconcile") {
        const report = await projection.reconcileWorkspace(tenantId, workspaceId, links);
        return {
          mode,
          canonical: report.canonical,
          projected: report.projected,
          missing: report.missing.length,
          duplicates: report.duplicates.length,
          orphans: report.orphans.length,
          staleVersion: report.staleVersion.length,
          wrongWorkspace: report.wrongWorkspace.length,
        };
      }
      const rebuilt = await projection.rebuildWorkspace(tenantId, workspaceId, links);
      return { mode, signature: rebuilt.signature, edgeCount: rebuilt.edgeCount };
    },
  };
}

export function registerThreadProjectionJobHandler(
  jobs: JobService,
  projection: EngineeringDigitalThreadProjectionService,
  loader: CanonicalLinkLoader,
): void {
  jobs.registerHandler(createThreadProjectionJobHandler(projection, loader));
}
