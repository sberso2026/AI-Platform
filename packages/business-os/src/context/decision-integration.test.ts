import { describe, expect, it } from "vitest";
import { createBusinessOS } from "../business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { BusinessContextGraphService } from "./service";
import { createMemoryGraphPort } from "./graph-port";
import { AuditService } from "@rtb/platform-core";
import { demoContextRecords, BOS_10_DEMO_DECISION_ID } from "./demo";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};

describe("BOS-10 Decision Intelligence integration", () => {
  it("suggests graph context without auto-including it as decision evidence", async () => {
    const graph = createMemoryGraphPort();
    const kernel = createPlatformKernel({} as SupabaseClient);
    const context = new BusinessContextGraphService({} as SupabaseClient, kernel, new AuditService({} as SupabaseClient), graph);
    const bos = createBusinessOS({} as SupabaseClient, kernel);
    bos.decisionAction.bindContextGraph((scope, id) => context.suggestEvidence(scope, id));
    await context.applyRecords(SCOPE, demoContextRecords(SCOPE));
    const suggested = await bos.decisionAction.suggestGraphEvidence(SCOPE, BOS_10_DEMO_DECISION_ID);
    expect(suggested.included).toBe(false);
    expect(suggested.adjacencyIsNotCausation).toBe(true);
    expect(suggested.suggestions.length).toBeGreaterThan(0);
    expect(suggested.note.toLowerCase()).toContain("explicit");
  });
});
