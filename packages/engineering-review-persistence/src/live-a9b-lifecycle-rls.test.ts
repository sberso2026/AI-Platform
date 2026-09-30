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

function entityId(body: unknown): string {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return String((body[0] as { id: string }).id);
  }
  if (body && typeof body === "object" && "id" in (body as { id?: string })) {
    return String((body as { id: string }).id);
  }
  return "";
}

describe.skipIf(!LIVE)("EOS-A9B live JWT RLS — lifecycle evidence and schedule mappings", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const mappingIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    if (mappingIds.length) {
      await rest(`engineering_lifecycle_schedule_mappings?id=in.(${mappingIds.join(",")})`, { method: "DELETE" }, serviceKey);
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("isolates schedule mappings and denies ordinary engineers from configuring them", async () => {
    const projectId = `a9b-${crypto.randomUUID()}`;
    const engineer = await rest(
      "engineering_lifecycle_schedule_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          source_system: "PROJECT_CONTROLS",
          schedule_object_id: "feed-design",
          schedule_phase_code: "FEED",
          expected_lifecycle_stage: "FEED",
          mapping_type: "ALIGNS_WITH",
          configured_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineer)).toBe(true);

    const admin = await rest(
      "engineering_lifecycle_schedule_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          source_system: "PROJECT_CONTROLS",
          schedule_object_id: "feed-design",
          schedule_phase_code: "FEED",
          expected_lifecycle_stage: "FEED",
          mapping_type: "ALIGNS_WITH",
          schedule_status: "active",
          configured_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(admin.status, JSON.stringify(admin.body)).toBeLessThan(300);
    const mappingId = entityId(admin.body) || ids(admin.body)[0];
    expect(mappingId).toBeTruthy();
    mappingIds.push(mappingId);

    const a1Read = await rest(
      `engineering_lifecycle_schedule_mappings?id=eq.${mappingId}&select=id`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(ids(a1Read.body)).toContain(mappingId);

    const a2Read = await rest(
      `engineering_lifecycle_schedule_mappings?id=eq.${mappingId}&select=id`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2Read.body)).not.toContain(mappingId);

    const b1Read = await rest(
      `engineering_lifecycle_schedule_mappings?id=eq.${mappingId}&select=id`,
      {},
      fixtures.users.b1.jwt,
    );
    expect(ids(b1Read.body)).not.toContain(mappingId);

    const anon = await rest(`engineering_lifecycle_schedule_mappings?id=eq.${mappingId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(mappingId);

    const crossWs = await rest(
      "engineering_lifecycle_schedule_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          project_id: projectId,
          source_system: "PROJECT_CONTROLS",
          schedule_object_id: "cross-ws",
          schedule_phase_code: "FEED",
          expected_lifecycle_stage: "FEED",
          mapping_type: "REFERENCE_ONLY",
          configured_by: fixtures.users.a2.id,
        }),
      },
      fixtures.users.a2.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const a2Req = await rest(
      `engineering_requirements?select=id&workspace_id=eq.${fixtures.workspaceA1Id}`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2Req.body)).toEqual([]);
  });
});
