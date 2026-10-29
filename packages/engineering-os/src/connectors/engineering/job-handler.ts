import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler, JobType } from "@rtb/types";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EXTERNAL_JOB_TYPE } from "./types";
import type { EngineeringExternalConnectorService } from "./service";

export function createExternalConnectorSyncHandler(connector: EngineeringExternalConnectorService): JobHandler {
  return {
    jobType: EXTERNAL_JOB_TYPE as JobType,
    async handle(job: BackgroundJob) {
      const payload = job.payload ?? {};
      const tenantId = String(payload.tenantId ?? job.tenant_id ?? "");
      const workspaceId = String(payload.workspaceId ?? job.workspace_id ?? "");
      const connectionId = String(payload.connectionId ?? "");
      if (!tenantId || !workspaceId || !connectionId) throw new Error("invalid_external_connector_sync_job");
      const commerce = createTestCommerceExecutionContext({
        tenantId,
        workspaceId,
        actorUserId: typeof payload.actorUserId === "string" ? payload.actorUserId : "connector-job",
        policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
      });
      const result = await connector.runSync(commerce, tenantId, connectionId);
      return result as unknown as Record<string, unknown>;
    },
  };
}

export function registerExternalConnectorSyncHandler(jobs: JobService, connector: EngineeringExternalConnectorService): void {
  jobs.registerHandler(createExternalConnectorSyncHandler(connector));
}
