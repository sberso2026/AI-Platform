import { describe, expect, it, vi } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { createMemoryM365Store } from "./memory-store";
import { createTestM365ConnectorService } from "./service";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "./fixture";
import { M365_JOB_TYPE } from "./types";

function stubClient() {
  return { from() { return this; } } as never;
}

function admin() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
    actorUserId: "admin-1",
  });
}

describe("EOS-A16D SharePoint index job service", () => {
  it("enqueues engineering.m365.sharepoint.sync with tenant, workspace, and repository scope", async () => {
    const work = new EngineeringWorkContextService(stubClient(), createMemoryWorkContextStore());
    const information = new EngineeringInformationService(stubClient(), createMemoryInformationStore());
    const created: Array<Record<string, unknown>> = [];
    const jobs = {
      create: vi.fn(async (input: Record<string, unknown>) => {
        created.push(input);
        return { id: "job-1", ...input };
      }),
    };
    const connector = createTestM365ConnectorService({
      work,
      information,
      store: createMemoryM365Store(),
      jobs: jobs as never,
    });
    const result = await connector.enqueueSync(admin(), CRUSHER_FEED_TENANT, "repo-1", "initial");
    expect(result).toEqual({ queued: true, jobId: "job-1" });
    expect(jobs.create).toHaveBeenCalledTimes(1);
    expect(created[0]).toMatchObject({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      jobType: M365_JOB_TYPE,
      createdBy: "admin-1",
      payload: {
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        repositoryId: "repo-1",
        mode: "initial",
        actorUserId: "admin-1",
      },
    });
  });

  it("rejects enqueue when commerce tenant does not match the requested tenant", async () => {
    const work = new EngineeringWorkContextService(stubClient(), createMemoryWorkContextStore());
    const information = new EngineeringInformationService(stubClient(), createMemoryInformationStore());
    const jobs = { create: vi.fn() };
    const connector = createTestM365ConnectorService({
      work,
      information,
      store: createMemoryM365Store(),
      jobs: jobs as never,
    });
    await expect(connector.enqueueSync(admin(), "other-tenant", "repo-1", "initial")).rejects.toThrow();
    expect(jobs.create).not.toHaveBeenCalled();
  });
});
