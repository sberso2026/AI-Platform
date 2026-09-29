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
const TAG = { eos_a8a_thread: true };

describe.skipIf(!LIVE)("EOS-A8A live JWT RLS — Digital Thread object links", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const requestIds: string[] = [];
  const linkIds: string[] = [];

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
    if (linkIds.length) {
      await svc(`engineering_object_links?id=in.(${linkIds.join(",")})`, { method: "DELETE" });
    }
    if (requestIds.length) {
      await svc(`engineering_analysis_requests?id=in.(${requestIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("does not leak unauthorized linked analysis objects or hidden relationship metadata", async () => {
    const createRequest = async (workspaceId: string, jwt: string) => {
      const created = await rest(
        "engineering_analysis_requests",
        {
          method: "POST",
          body: JSON.stringify({
            tenant_id: fixtures.tenantAId,
            workspace_id: workspaceId,
            project_id: workspaceId === fixtures.workspaceA1Id ? fixtures.projectA1Id : fixtures.projectA2Id,
            discipline: "STRUCTURAL",
            capability: "LINEAR_STRUCTURAL_ANALYSIS",
            requested_by: fixtures.users.a1.id,
            status: "blocked",
            metadata: TAG,
          }),
        },
        jwt,
      );
      expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
      const id = ids(created.body)[0];
      requestIds.push(id);
      return id;
    };

    const a1Request = await createRequest(fixtures.workspaceA1Id, fixtures.users.a1.jwt);
    const a1Peer = await createRequest(fixtures.workspaceA1Id, fixtures.users.a1.jwt);
    const a2Created = await svc("engineering_analysis_requests", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA2Id,
        project_id: fixtures.projectA2Id,
        discipline: "STRUCTURAL",
        capability: "LINEAR_STRUCTURAL_ANALYSIS",
        requested_by: fixtures.users.a2.id,
        status: "blocked",
        metadata: TAG,
      }),
    });
    expect(a2Created.status, JSON.stringify(a2Created.body)).toBeLessThan(300);
    const a2Request = ids(a2Created.body)[0];
    requestIds.push(a2Request);

    const sameWs = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "analysis_request",
          from_id: a1Request,
          to_type: "analysis_request",
          to_id: a1Peer,
          relationship: "DEPENDS_ON",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(sameWs.status, JSON.stringify(sameWs.body)).toBeLessThan(400);
    const sameId = ids(sameWs.body)[0];
    if (sameId) linkIds.push(sameId);

    expect(ids((await rest(`engineering_object_links?id=eq.${sameId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([sameId]);
    expect(ids((await rest(`engineering_object_links?id=eq.${sameId}`, {}, fixtures.users.a2.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_object_links?id=eq.${sameId}`, {}, fixtures.users.b1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_object_links?id=eq.${sameId}`)).body)).toEqual([]);

    const crossWs = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "analysis_request",
          from_id: a1Request,
          to_type: "analysis_request",
          to_id: a2Request,
          relationship: "DEPENDS_ON",
          relationship_governed: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const hidden = await svc("engineering_object_links", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        from_type: "analysis_request",
        from_id: a1Request,
        to_type: "analysis_request",
        to_id: a2Request,
        relationship: "USES",
        relationship_governed: true,
      }),
    });
    if (hidden.status < 300) {
      const hiddenId = ids(hidden.body)[0];
      if (hiddenId) linkIds.push(hiddenId);
      const a1Hidden = await rest(`engineering_object_links?id=eq.${hiddenId}`, {}, fixtures.users.a1.jwt);
      expect(ids(a1Hidden.body)).toEqual([]);
      expect(JSON.stringify(a1Hidden.body)).not.toMatch(/USES/);
    }
  });
});
