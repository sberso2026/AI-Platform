import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler, JobType } from "@rtb/types";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { M365_JOB_TYPE } from "./types";
import type { EngineeringM365ConnectorService } from "./service";

export function createSharePointSyncHandler(connector: EngineeringM365ConnectorService): JobHandler {
  return {
    jobType: M365_JOB_TYPE as JobType,
    async handle(job: BackgroundJob) {
      const payload = job.payload ?? {};
      const tenantId = String(payload.tenantId ?? job.tenant_id ?? "");
      const workspaceId = String(payload.workspaceId ?? job.workspace_id ?? "");
      const repositoryId = String(payload.repositoryId ?? "");
      const mode = payload.mode === "initial" || payload.mode === "resync" ? payload.mode : "delta";
      if (!tenantId || !workspaceId || !repositoryId) throw new Error("invalid_sharepoint_sync_job");
      const commerce = createTestCommerceExecutionContext({
        tenantId,
        workspaceId,
        actorUserId: typeof payload.actorUserId === "string" ? payload.actorUserId : "connector-job",
        policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
      });
      const result = await connector.runSync(commerce, tenantId, repositoryId, mode);
      return result as unknown as Record<string, unknown>;
    },
  };
}

export function registerSharePointSyncHandler(jobs: JobService, connector: EngineeringM365ConnectorService): void {
  jobs.registerHandler(createSharePointSyncHandler(connector));
}
