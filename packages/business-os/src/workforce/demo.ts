import { BOS_10_DEMO_CUSTOMER_ID } from "../context/demo";
import type { OwnerCommandScope } from "../owner-command/service";
import { BUSINESS_WORKFORCE_CATALOG } from "./catalog";
import type { WorkforceActor, WorkforceInstallation, WorkforceRun, WorkforceTask } from "./ports";

export type WorkforceDemoHost = {
  install(
    scope: OwnerCommandScope,
    input: { slug: string; config?: Record<string, unknown> },
    actor: WorkforceActor,
  ): Promise<WorkforceInstallation>;
  enable(scope: OwnerCommandScope, id: string, actor: WorkforceActor): Promise<WorkforceInstallation>;
  requestTask(
    scope: OwnerCommandScope,
    input: { installationId: string; intent: string; entityType?: string; entityId?: string; toolId?: string },
    actor: WorkforceActor,
  ): Promise<{ task: WorkforceTask | null; run: WorkforceRun; approval: unknown }>;
};

export async function demoWorkforceSeed(
  service: WorkforceDemoHost,
  scope: OwnerCommandScope,
  actor: WorkforceActor,
) {
  const installations = [];
  for (const entry of BUSINESS_WORKFORCE_CATALOG) {
    const installed = await service.install(scope, { slug: entry.slug, config: { demo: true } }, actor);
    installations.push(installed);
  }
  const observer = installations.find((row) => row.catalogSlug === "business-observer")!;
  const advisor = installations.find((row) => row.catalogSlug === "business-advisor")!;
  const requester = installations.find((row) => row.catalogSlug === "business-execution-requester")!;
  await service.enable(scope, observer.id, actor);
  await service.enable(scope, advisor.id, actor);
  await service.enable(scope, requester.id, actor);

  const advisory = await service.requestTask(
    scope,
    {
      installationId: advisor.id,
      intent: "summarise customer context",
      entityType: "customer",
      entityId: BOS_10_DEMO_CUSTOMER_ID,
      toolId: "bos.context.entity",
    },
    actor,
  );
  const pending = await service.requestTask(
    scope,
    {
      installationId: requester.id,
      intent: "request execution review",
      entityType: "customer",
      entityId: BOS_10_DEMO_CUSTOMER_ID,
      toolId: "bos.context.entity",
    },
    actor,
  );

  return {
    created: true,
    isDemo: true as const,
    liveIntegrations: false,
    unsafeExternalWrites: false,
    installations,
    advisoryRunId: advisory.run.id,
    pendingApprovalRunId: pending.run.id,
  };
}
