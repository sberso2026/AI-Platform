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
const TAG = { eos_a7a_discipline: true };

describe.skipIf(!LIVE)("EOS-A7A live JWT RLS — Discipline Intelligence", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const profileIds: string[] = [];
  const projectDisciplineIds: string[] = [];

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
    if (projectDisciplineIds.length) {
      await svc(`engineering_project_disciplines?id=in.(${projectDisciplineIds.join(",")})`, { method: "DELETE" });
    }
    if (profileIds.length) {
      await svc(`engineering_discipline_profiles?id=in.(${profileIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("admin may certify overlays; execute user cannot; workspace/tenant isolation holds", async () => {
    await svc(
      `engineering_project_disciplines?project_id=eq.${fixtures.projectA1Id}&discipline_code=eq.STRUCTURAL`,
      { method: "DELETE" },
    );
    await svc(
      `engineering_discipline_profiles?tenant_id=eq.${fixtures.tenantAId}&discipline_code=eq.STRUCTURAL`,
      { method: "DELETE" },
    );
    const created = await svc("engineering_discipline_profiles", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        discipline_code: "STRUCTURAL",
        discipline_key: "structural",
        enabled: true,
        capabilities: [{ key: "LINEAR_STRUCTURAL_ANALYSIS", declaredStatus: "TOOL_DEPENDENT", effectiveStatus: "BLOCKED" }],
        standards: [{ standardCode: "AS 4100", sourceReference: "reference only" }],
        metadata: TAG,
      }),
    });
    if (created.status >= 400) {
      expect(String(created.body)).not.toMatch(/does not exist|42P01/i);
    }
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const profileId = ids(created.body)[0];
    expect(profileId).toBeTruthy();
    profileIds.push(profileId);

    expect(ids((await rest(`engineering_discipline_profiles?id=eq.${profileId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      profileId,
    ]);
    expect(ids((await rest(`engineering_discipline_profiles?id=eq.${profileId}`, {}, fixtures.users.b1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_discipline_profiles?id=eq.${profileId}`)).body)).toEqual([]);

    expect(
      mutationDenied(
        await rest(
          `engineering_discipline_profiles?id=eq.${profileId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              capabilities: [{ key: "LINEAR_STRUCTURAL_ANALYSIS", declaredStatus: "CERTIFIED", effectiveStatus: "CERTIFIED" }],
            }),
          },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);

    const adminPatch = await rest(
      `engineering_discipline_profiles?id=eq.${profileId}`,
      { method: "PATCH", body: JSON.stringify({ metadata: { ...TAG, note: "admin-only" } }) },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminPatch.status, JSON.stringify(adminPatch.body)).toBeLessThan(300);

    const assigned = await svc("engineering_project_disciplines", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        project_id: fixtures.projectA1Id,
        discipline_code: "STRUCTURAL",
        enabled: true,
      }),
    });
    expect(assigned.status, JSON.stringify(assigned.body)).toBeLessThan(300);
    const assignmentId = ids(assigned.body)[0];
    assignmentId && projectDisciplineIds.push(assignmentId);

    expect(ids((await rest(`engineering_project_disciplines?id=eq.${assignmentId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      assignmentId,
    ]);
    expect(ids((await rest(`engineering_project_disciplines?id=eq.${assignmentId}`, {}, fixtures.users.a2.jwt)).body)).toEqual([]);
    expect(
      mutationDenied(
        await rest(
          "engineering_project_disciplines",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              workspace_id: fixtures.workspaceA2Id,
              project_id: fixtures.projectA2Id,
              discipline_code: "MECHANICAL",
              enabled: true,
            }),
          },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
  });
});
