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
const TAG = { eos_a5e_ext_tools: true };

describe.skipIf(!LIVE)("EOS-A5E live JWT RLS — External Tool profiles", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const profileIds: string[] = [];
  const assignmentIds: string[] = [];

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
    if (assignmentIds.length) {
      await svc(`engineering_external_tool_assignments?id=in.(${assignmentIds.join(",")})`, { method: "DELETE" });
    }
    if (profileIds.length) {
      await svc(`engineering_external_tool_profiles?id=in.(${profileIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("admin may configure platform profiles; execute user cannot; tenant/workspace isolation holds", async () => {
    const created = await svc("engineering_external_tool_profiles", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        tool_code: `spacegass-a5e-${Date.now()}`,
        name: "SPACE GASS",
        vendor: "SPACE GASS",
        category: "ANALYSIS_SIMULATION",
        enabled: true,
        integration_modes: ["EXECUTION_ADAPTER"],
        installation_status: "NOT_INSTALLED",
        licence_status: "UNAVAILABLE",
        automation_permission: "REQUIRES_CONFIRMATION",
        capabilities: [],
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

    expect(ids((await rest(`engineering_external_tool_profiles?id=eq.${profileId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      profileId,
    ]);
    expect(ids((await rest(`engineering_external_tool_profiles?id=eq.${profileId}`, {}, fixtures.users.b1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_external_tool_profiles?id=eq.${profileId}`)).body)).toEqual([]);

    expect(
      mutationDenied(
        await rest(
          `engineering_external_tool_profiles?id=eq.${profileId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ executable_path: "C:\\\\forged.exe", licence_status: "AVAILABLE" }),
          },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);

    const adminPatch = await rest(
      `engineering_external_tool_profiles?id=eq.${profileId}`,
      { method: "PATCH", body: JSON.stringify({ automation_basis: "governance-record-only" }) },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminPatch.status, JSON.stringify(adminPatch.body)).toBeLessThan(300);

    const assigned = await svc("engineering_external_tool_assignments", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        profile_id: profileId,
        allowed: true,
        permitted_capabilities: ["LINEAR_STATIC_ANALYSIS"],
        unit_system: "SI",
      }),
    });
    expect(assigned.status, JSON.stringify(assigned.body)).toBeLessThan(300);
    const assignmentId = ids(assigned.body)[0];
    assignmentIds.push(assignmentId);

    expect(ids((await rest(`engineering_external_tool_assignments?id=eq.${assignmentId}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      assignmentId,
    ]);
    expect(ids((await rest(`engineering_external_tool_assignments?id=eq.${assignmentId}`, {}, fixtures.users.a2.jwt)).body)).toEqual([]);
    expect(
      mutationDenied(
        await rest(
          "engineering_external_tool_assignments",
          {
            method: "POST",
            body: JSON.stringify({
              tenant_id: fixtures.tenantAId,
              workspace_id: fixtures.workspaceA2Id,
              profile_id: profileId,
              allowed: true,
            }),
          },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
  });
});
