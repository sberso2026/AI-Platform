import { describe, expect, it } from "vitest";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { BusinessContextGraphService } from "../context/service";
import { createMemoryGraphPort } from "../context/graph-port";
import { AiWorkforceService } from "./service";
import { allowPolicyPort, createMemoryAgentRegistry, createMemoryWorkforceStore } from "./store";

describe("BOS-11 Engineering OS boundary", () => {
  it("forbids Engineering mutation and does not duplicate Engineering agents", () => {
    const graph = createMemoryGraphPort();
    const kernel = createPlatformKernel({} as SupabaseClient);
    const audit = new AuditService({} as SupabaseClient);
    const context = new BusinessContextGraphService({} as SupabaseClient, kernel, audit, graph);
    const workforce = new AiWorkforceService({} as SupabaseClient, kernel, audit, context, {
      store: createMemoryWorkforceStore(),
      registry: createMemoryAgentRegistry(),
      policy: allowPolicyPort(),
    });
    expect(() => workforce.mutateEngineeringRecord()).toThrow("engineering_os_internal_projection_forbidden");
    expect(workforce.catalog().every((row) => row.os === "business")).toBe(true);
    expect(workforce.catalog().some((row) => row.slug.includes("engineering"))).toBe(false);
  });
});
