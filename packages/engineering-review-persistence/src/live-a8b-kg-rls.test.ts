import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, restFetch } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";
const TAG = { eos_a8b_kg: true };

describe.skipIf(!LIVE)("EOS-A8B live JWT RLS — Platform KG thread projection", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    if (edgeIds.length) {
      await svc(`knowledge_edges?id=in.(${edgeIds.join(",")})`, { method: "DELETE" });
    }
    if (nodeIds.length) {
      await svc(`knowledge_nodes?id=in.(${nodeIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("isolates projected KG rows by tenant and does not leak counts to other tenants or anonymous callers", async () => {
    const sourceRef = `eos-thread:analysis_request:${crypto.randomUUID()}`;
    const created = await svc("knowledge_nodes", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        node_type: "engineering_thread_object",
        title: "A8B projection node",
        source_ref: sourceRef,
        content: { object_type: "analysis_request" },
        metadata: {
          family: "engineering-thread-projection",
          workspace_id: fixtures.workspaceA1Id,
          eos_a8b_kg: true,
        },
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const nodeId = ids(created.body)[0];
    nodeIds.push(nodeId);

    const a1 = await rest(`knowledge_nodes?id=eq.${nodeId}&select=id,metadata`, {}, fixtures.users.a1.jwt);
    expect(a1.status).toBeLessThan(300);
    expect(ids(a1.body)).toContain(nodeId);

    const b1 = await rest(`knowledge_nodes?id=eq.${nodeId}&select=id`, {}, fixtures.users.b1.jwt);
    expect(ids(b1.body)).not.toContain(nodeId);
    expect(JSON.stringify(b1.body)).not.toMatch(/A8B projection node/);

    const anon = await rest(`knowledge_nodes?id=eq.${nodeId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(nodeId);

    const a2SameTenant = await rest(`knowledge_nodes?id=eq.${nodeId}&select=id,workspace_id`, {}, fixtures.users.a2.jwt);
    expect(a2SameTenant.status).toBeLessThan(300);
    expect(
      ids(a2SameTenant.body).includes(nodeId),
      "Platform KG SQL RLS is tenant-scoped; same-tenant other-workspace rows may be visible. Product KG reads remain uncertified.",
    ).toBe(true);
  });
});
