import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, mutationDenied, restFetch } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";
const TAG = { eos_a7b_analysis: true };

describe.skipIf(!LIVE)("EOS-A7B live JWT RLS — Analysis Request", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const requestIds: string[] = [];

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
    if (requestIds.length) {
      await svc(`engineering_analysis_execution_plans?analysis_request_id=in.(${requestIds.join(",")})`, { method: "DELETE" });
      await svc(`engineering_analysis_results?analysis_request_id=in.(${requestIds.join(",")})`, { method: "DELETE" });
      await svc(`engineering_analysis_requests?id=in.(${requestIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("workspace members can read; execute user may create; isolation and anonymous deny hold", async () => {
    const created = await rest(
      "engineering_analysis_requests",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          discipline: "STRUCTURAL",
          capability: "LINEAR_STRUCTURAL_ANALYSIS",
          requested_by: fixtures.users.a1.id,
          status: "draft",
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    if (created.status >= 400) {
      expect(String(created.body)).not.toMatch(/does not exist|42P01/i);
    }
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const requestId = ids(created.body)[0];
    expect(requestId).toBeTruthy();
    requestIds.push(requestId);

    expect(ids((await rest(`engineering_analysis_requests?id=eq.${requestId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      requestId,
    ]);
    expect(ids((await rest(`engineering_analysis_requests?id=eq.${requestId}`, {}, fixtures.users.a2.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_analysis_requests?id=eq.${requestId}`, {}, fixtures.users.b1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_analysis_requests?id=eq.${requestId}`)).body)).toEqual([]);

    expect(
      mutationDenied(
        await rest(
          `engineering_analysis_requests?id=eq.${requestId}`,
          { method: "PATCH", body: JSON.stringify({ status: "ready" }) },
          fixtures.users.a2.jwt,
        ),
      ),
    ).toBe(true);

    const eraFinding = await rest(`engineering_review_findings?id=eq.${fixtures.findingA1Id}`, {}, fixtures.users.a1.jwt);
    expect(eraFinding.status).toBeLessThan(300);
    expect(ids(eraFinding.body)).toEqual([fixtures.findingA1Id]);
  });
});
