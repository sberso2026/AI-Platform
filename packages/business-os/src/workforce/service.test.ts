import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BusinessContextGraphService } from "../context/service";
import { createMemoryGraphPort } from "../context/graph-port";
import { demoContextRecords, BOS_10_DEMO_CUSTOMER_ID } from "../context/demo";
import { AiWorkforceService } from "./service";
import { allowPolicyPort, createMemoryAgentRegistry, createMemoryWorkforceStore, denyPolicyPort } from "./store";
import { AI_WORKFORCE_CONTRACT } from "./extensions";
import { getBusinessOsFoundationDeclaration } from "../version";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};

const APPROVER = { ...SCOPE, userId: "44444444-4444-4444-8444-444444444444" };
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };
const AGENT_ACTOR = { userId: SCOPE.userId, actorType: "agent" as const, agentId: "agent-1" };

function harness(policy = allowPolicyPort()) {
  const graph = createMemoryGraphPort();
  const kernel = createPlatformKernel({} as SupabaseClient);
  const audit = new AuditService({} as SupabaseClient);
  const context = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
  const store = createMemoryWorkforceStore();
  const registry = createMemoryAgentRegistry();
  const workforce = new AiWorkforceService({} as SupabaseClient, kernel, audit, context, {
    store,
    registry,
    policy,
  });
  return { workforce, context, store, registry };
}

async function readyAdvisor(workforce: AiWorkforceService, context: BusinessContextGraphService) {
  await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
  const installed = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
  await workforce.enable(SCOPE, installed.id, HUMAN);
  return installed;
}

describe("BOS-11 AI Workforce contracts", () => {
  it("reuses Kernel/Intelligence and forbids a second AI stack", () => {
    const { workforce } = harness();
    expect(workforce.contract()).toEqual(AI_WORKFORCE_CONTRACT);
    expect(workforce.contract().implemented).toBe(true);
    expect(workforce.contract().implementsOwnAiStack).toBe(false);
    expect(workforce.status().duplicateAgentRuntimeDetected).toBe(false);
    expect(workforce.status().autonomousApprovalEnabled).toBe(false);
    expect(workforce.status().directProviderAccess).toBe(false);
    expect(workforce.status().unrestrictedGraphAccess).toBe(false);
    expect(workforce.status().canonicalDomainMutationBypass).toBe(false);
    expect(workforce.status().crossTenantAgentAccess).toBe(false);
    expect(getBusinessOsFoundationDeclaration().duplicateAgentRuntimeDetected).toBe(false);
    expect(() => workforce.executeArbitrary()).toThrow("unrestricted_agent_execution_forbidden");
    expect(() => workforce.callModelProvider()).toThrow("direct_provider_access_forbidden");
    expect(() => workforce.mutateCanonicalRecord()).toThrow("canonical_domain_mutation_forbidden");
    expect(() => workforce.mutateEngineeringRecord()).toThrow("engineering_os_internal_projection_forbidden");
    expect(() => workforce.selfRegister()).toThrow("self_registration_forbidden");
    expect(() => workforce.selfEnable()).toThrow("self_enable_forbidden");
    expect(() => workforce.selfApprove()).toThrow("self_approval_forbidden");
    expect(() => workforce.autonomousApprove()).toThrow("autonomous_approval_forbidden");
    expect(() => workforce.unrestrictedGraph()).toThrow("unrestricted_graph_query_forbidden");
  });
});

describe("BOS-11 agent lifecycle", () => {
  it("installs catalog agents only and blocks self-registration and unknown slugs", async () => {
    const { workforce } = harness();
    await expect(workforce.install(SCOPE, { slug: "rogue-agent" }, HUMAN)).rejects.toThrow("self_registration_forbidden");
    await expect(workforce.install(SCOPE, { slug: "business-advisor" }, AGENT_ACTOR)).rejects.toThrow(
      "self_registration_forbidden",
    );
    const installed = await workforce.install(SCOPE, { slug: "business-observer" }, HUMAN);
    expect(installed.status).toBe("installed");
    expect(installed.authority).toBe("observe");
    expect(installed.os).toBe("business");
    await expect(workforce.enable(SCOPE, installed.id, AGENT_ACTOR)).rejects.toThrow("self_enable_forbidden");
    const enabled = await workforce.enable(SCOPE, installed.id, HUMAN);
    expect(enabled.status).toBe("enabled");
    const suspended = await workforce.suspend(SCOPE, installed.id, HUMAN);
    expect(suspended.status).toBe("suspended");
    const revoked = await workforce.revoke(SCOPE, installed.id, HUMAN);
    expect(revoked.status).toBe("revoked");
  });

  it("does not escalate authority above the catalog definition", async () => {
    const { workforce } = harness();
    const installed = await workforce.install(SCOPE, { slug: "business-observer" }, HUMAN);
    await expect(
      workforce.configure(SCOPE, installed.id, { authority: "execute_with_approval" }, HUMAN),
    ).rejects.toThrow("invalid_authority");
  });
});

describe("BOS-11 isolation and suppression", () => {
  it("isolates tenant/workspace installations and runs", async () => {
    const { workforce, context } = harness();
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const other = {
      tenantId: "55555555-5555-4555-8555-555555555555",
      workspaceId: "66666666-6666-4666-8666-666666666666",
      userId: SCOPE.userId,
    };
    await context.applyRecords(other, demoContextRecords(other));
    const home = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
    await workforce.enable(SCOPE, home.id, HUMAN);
    const away = await workforce.install(other, { slug: "business-advisor" }, HUMAN);
    await workforce.enable(other, away.id, HUMAN);
    expect(home.id).not.toBe(away.id);
    expect((await workforce.listAgents(SCOPE)).installations.every((row) => row.tenantId === SCOPE.tenantId)).toBe(true);
    expect((await workforce.listAgents(other)).installations.every((row) => row.tenantId === other.tenantId)).toBe(true);
  });

  it("does not expose suppressed contacts through agent context consumption", async () => {
    const { workforce, context } = harness();
    const installed = await readyAdvisor(workforce, context);
    const result = await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "observe",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    expect(JSON.stringify(result)).not.toContain("Hidden Person");
    const hidden = await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "observe",
        entityType: "contact",
        entityId: "bos10-contact-suppressed",
      },
      HUMAN,
    );
    expect(hidden.run.state).toBe("blocked");
    expect(JSON.stringify(hidden)).not.toContain("Hidden Person");
  });
});

describe("BOS-11 authority, tools, and approval", () => {
  it("defaults to read-only advisory completion without approval", async () => {
    const { workforce, context } = harness();
    const installed = await readyAdvisor(workforce, context);
    const result = await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "recommend",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
        toolId: "bos.context.entity",
      },
      HUMAN,
    );
    expect(result.run.state).toBe("completed");
    expect(result.approval).toBeNull();
    expect(result.run.explanation.chainOfThoughtExposed).toBe(false);
    expect(result.run.toolCalls[0]?.toolId).toBe("bos.context.entity");
  });

  it("requires independent human approval for execution authority and forbids self-approval", async () => {
    const { workforce, context } = harness();
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const installed = await workforce.install(SCOPE, { slug: "business-execution-requester" }, HUMAN);
    await workforce.enable(SCOPE, installed.id, HUMAN);
    const result = await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "request execution",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    expect(result.run.state).toBe("awaiting_approval");
    expect(result.approval?.decision).toBe("pending");
    await expect(
      workforce.decideApproval(SCOPE, { approvalId: result.approval!.id, decision: "approved" }, HUMAN),
    ).rejects.toThrow("self_approval_forbidden");
    await expect(
      workforce.decideApproval(SCOPE, { approvalId: result.approval!.id, decision: "approved" }, AGENT_ACTOR),
    ).rejects.toThrow("self_approval_forbidden");
    const approved = await workforce.decideApproval(
      APPROVER,
      { approvalId: result.approval!.id, decision: "approved" },
      { userId: APPROVER.userId, actorType: "human" },
    );
    expect(approved.run.state).toBe("completed");
  });

  it("rejects forbidden tools, direct provider calls, and canonical writes", async () => {
    const { workforce, context } = harness();
    const installed = await readyAdvisor(workforce, context);
    await expect(
      workforce.requestTask(
        SCOPE,
        {
          installationId: installed.id,
          intent: "write",
          entityType: "customer",
          entityId: BOS_10_DEMO_CUSTOMER_ID,
          toolId: "bos.canonical.write",
        },
        HUMAN,
      ),
    ).resolves.toMatchObject({ run: { state: "failed", failureCode: "forbidden_tool" } });
    await expect(
      workforce.requestTask(
        SCOPE,
        {
          installationId: installed.id,
          intent: "write",
          entityType: "customer",
          entityId: BOS_10_DEMO_CUSTOMER_ID,
          toolId: "direct.model.provider",
        },
        HUMAN,
      ),
    ).resolves.toMatchObject({ run: { state: "failed" } });
  });

  it("rejects policy denials fail-closed", async () => {
    const { workforce, context } = harness(denyPolicyPort());
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const installed = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
    await workforce.enable(SCOPE, installed.id, HUMAN);
    await expect(
      workforce.requestTask(
        SCOPE,
        {
          installationId: installed.id,
          intent: "recommend",
          entityType: "customer",
          entityId: BOS_10_DEMO_CUSTOMER_ID,
        },
        HUMAN,
      ),
    ).rejects.toThrow("policy_rejected");
  });
});

describe("BOS-11 handoffs, budget, memory, and audit", () => {
  it("bounds handoffs, trims permissions, and rejects cycles", async () => {
    const { workforce, context } = harness();
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const advisor = await workforce.install(SCOPE, { slug: "business-advisor" }, HUMAN);
    const observer = await workforce.install(SCOPE, { slug: "business-observer" }, HUMAN);
    await workforce.enable(SCOPE, advisor.id, HUMAN);
    await workforce.enable(SCOPE, observer.id, HUMAN);
    const result = await workforce.requestTask(
      SCOPE,
      {
        installationId: advisor.id,
        intent: "recommend",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    const first = await workforce.requestHandoff(SCOPE, { runId: result.run.id, toSlug: "business-observer" }, HUMAN);
    expect(first.trimmedAuthority).toBe("observe");
    expect(first.trimmedTools.every((tool) => tool.startsWith("bos.context."))).toBe(true);
    await expect(
      workforce.requestHandoff(SCOPE, { runId: result.run.id, toSlug: "business-observer" }, HUMAN),
    ).rejects.toThrow("handoff_limit_exceeded");
  });

  it("enforces runtime/token budget", async () => {
    const { workforce, context, store } = harness();
    const installed = await readyAdvisor(workforce, context);
    await store.upsertSettings(SCOPE, {
      maxHandoffs: 2,
      maxToolCalls: 0,
      maxRuntimeMs: 30_000,
      maxTokens: 4_000,
      staleContextHours: 24,
    });
    const result = await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "recommend",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    expect(result.run.state).toBe("failed");
    expect(result.run.failureCode).toBe("budget_exceeded");
  });

  it("isolates generated memory from canonical records and other tenants", async () => {
    const { workforce, context, store } = harness();
    const installed = await readyAdvisor(workforce, context);
    await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "recommend",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    const mine = await store.retrieveMemory(SCOPE.tenantId, `${SCOPE.workspaceId}:${installed.id}`);
    expect(mine[0]?.authoritative).toBe(false);
    expect(mine[0]?.generated).toBe(true);
    const other = await store.retrieveMemory("99999999-9999-4999-8999-999999999999", `${SCOPE.workspaceId}:${installed.id}`);
    expect(other).toEqual([]);
  });

  it("records audit metadata without secrets or chain-of-thought", async () => {
    const { workforce, context, store } = harness();
    const installed = await readyAdvisor(workforce, context);
    await workforce.requestTask(
      SCOPE,
      {
        installationId: installed.id,
        intent: "recommend",
        entityType: "customer",
        entityId: BOS_10_DEMO_CUSTOMER_ID,
      },
      HUMAN,
    );
    const audit = await store.listAudit(SCOPE);
    expect(audit.some((row) => row.action === "install")).toBe(true);
    expect(audit.some((row) => row.action === "task_requested")).toBe(true);
    expect(audit.some((row) => row.action === "policy_check")).toBe(true);
    expect(JSON.stringify(audit)).not.toMatch(/chain-of-thought|sk-|secret/i);
  });
});

describe("BOS-11 demo", () => {
  it("seeds deterministic demo workforce fixtures without live writes", async () => {
    const { workforce } = harness();
    const demo = await workforce.seedDemo(SCOPE, HUMAN);
    expect(demo.isDemo).toBe(true);
    expect(demo.liveIntegrations).toBe(false);
    expect(demo.unsafeExternalWrites).toBe(false);
    expect(demo.installations).toHaveLength(5);
    const again = await workforce.seedDemo(SCOPE, HUMAN);
    expect(again.installations).toHaveLength(5);
  });
});
