import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BusinessContextGraphService } from "../context/service";
import { createMemoryGraphPort } from "../context/graph-port";
import { demoContextRecords, BOS_10_DEMO_CUSTOMER_ID } from "../context/demo";
import { BosConnectorsService, BOS_12_PERFORMANCE_BOUNDS } from "./service";
import { createMemoryConnectorStore } from "./store";
import { AiWorkforceService } from "../workforce/service";
import { allowPolicyPort, createMemoryAgentRegistry, createMemoryWorkforceStore } from "../workforce/store";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};
const HUMAN = { userId: SCOPE.userId, actorType: "human" as const };

describe("BOS-12 performance bounds", () => {
  it("bounds dashboard, graph, agent context, connector sync, search, and diagnostics", async () => {
    const graph = createMemoryGraphPort();
    const kernel = createPlatformKernel({} as SupabaseClient);
    const audit = new AuditService({} as SupabaseClient);
    const context = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
    const connectors = new BosConnectorsService({} as SupabaseClient, kernel, audit, {
      store: createMemoryConnectorStore(),
    });
    const workforce = new AiWorkforceService({} as SupabaseClient, kernel, audit, context, {
      store: createMemoryWorkforceStore(),
      registry: createMemoryAgentRegistry(),
      policy: allowPolicyPort(),
      connectors,
    });

    const mark = async (fn: () => Promise<unknown>) => {
      const started = Date.now();
      await fn();
      return Date.now() - started;
    };

    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    expect(await mark(() => connectors.overview(SCOPE))).toBeLessThan(BOS_12_PERFORMANCE_BOUNDS.dashboardMs);
    expect(await mark(() => context.customerContext(SCOPE, BOS_10_DEMO_CUSTOMER_ID))).toBeLessThan(
      BOS_12_PERFORMANCE_BOUNDS.graphContextMs,
    );
    expect(
      await mark(() =>
        context.agentContext(SCOPE, { entityType: "customer", entityId: BOS_10_DEMO_CUSTOMER_ID }),
      ),
    ).toBeLessThan(BOS_12_PERFORMANCE_BOUNDS.agentContextMs);
    const installed = await connectors.configure(SCOPE, { connectorId: "xero", mode: "fixture" }, HUMAN);
    expect(await mark(() => connectors.sync(SCOPE, { installationId: installed.id }, HUMAN))).toBeLessThan(
      BOS_12_PERFORMANCE_BOUNDS.connectorSyncMs,
    );
    expect(await mark(() => context.search(SCOPE, "Customer"))).toBeLessThan(BOS_12_PERFORMANCE_BOUNDS.searchMs);
    expect(await mark(() => connectors.diagnostics(SCOPE))).toBeLessThan(BOS_12_PERFORMANCE_BOUNDS.diagnosticsMs);
    expect(await mark(() => workforce.diagnostics(SCOPE))).toBeLessThan(BOS_12_PERFORMANCE_BOUNDS.diagnosticsMs);
  });
});
