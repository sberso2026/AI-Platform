import { describe, expect, it } from "vitest";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { createTestAttentionService } from "./service";
import type { AttentionDomainPorts } from "./service";

const TENANT = "tenant-a";
const WORKSPACE = "workspace-a";

function workCommerce() {
  return createTestCommerceExecutionContext({
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
  });
}

function projectReadCommerce() {
  return createTestCommerceExecutionContext({
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    policy: { productKey: "engineering-os", action: "project.read", seatRequired: true },
  });
}

function projectListAliasCommerce() {
  return createTestCommerceExecutionContext({
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    policy: { productKey: "engineering-os", action: "project.list", seatRequired: true },
  });
}

function ports(listActions: string[]): AttentionDomainPorts {
  const empty = async () => [];
  return {
    projects: {
      list: async (commerce: { authorization: { action: string } }) => {
        listActions.push(commerce.authorization.action);
        return [
          {
            id: "4729d258-f953-45f6-927c-2ba2450365a1",
            tenant_id: TENANT,
            workspace_id: WORKSPACE,
            project_code: "ER-A1",
            project_name: "Review Project A1",
          },
        ];
      },
    },
    workGenerator: { listPlans: empty },
    informationRequirements: { list: empty },
    work: { list: empty },
    preIssueReview: { latest: async () => ({ review: null }) },
    changeWorkbench: { listByProject: empty },
  } as unknown as AttentionDomainPorts;
}

describe("EOS authorized project action contract for attention", () => {
  it("discovers authorized projects only with canonical project.read commerce", async () => {
    const listed: string[] = [];
    const service = createTestAttentionService({ ports: ports(listed) });
    const day = await service.resolve(workCommerce(), TENANT, {
      projectCommerce: projectReadCommerce(),
    });
    expect(listed).toEqual(["project.read"]);
    expect(day.counts).toBeDefined();
  });

  it("fail-closes when the project commerce action is project.list instead of project.read", async () => {
    const listed: string[] = [];
    const service = createTestAttentionService({ ports: ports(listed) });
    await expect(
      service.resolve(workCommerce(), TENANT, { projectCommerce: projectListAliasCommerce() }),
    ).rejects.toBeInstanceOf(CommerceDomainError);
    try {
      await service.resolve(workCommerce(), TENANT, { projectCommerce: projectListAliasCommerce() });
    } catch (error) {
      expect((error as CommerceDomainError).code).toBe("action_mismatch");
      expect((error as CommerceDomainError).message).toBe("Action mismatch: expected project.read");
    }
    expect(listed).toEqual([]);
  });

  it("does not list projects using the work.list / analysis.read commerce context", async () => {
    const listed: string[] = [];
    const service = createTestAttentionService({ ports: ports(listed) });
    await expect(
      service.resolve(workCommerce(), TENANT, { projectCommerce: workCommerce() }),
    ).rejects.toMatchObject({
      code: "action_mismatch",
      message: "Action mismatch: expected project.read",
    });
    expect(listed).toEqual([]);
  });
});
