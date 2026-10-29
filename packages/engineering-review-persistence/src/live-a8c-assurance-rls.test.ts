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

function totalFromRange(contentRange: string | null): number | null {
  if (!contentRange) return null;
  const match = contentRange.match(/\/(\d+|\*)$/);
  if (!match) return null;
  if (match[1] === "*") return null;
  return Number(match[1]);
}

describe.skipIf(!LIVE)("EOS-A8C live JWT RLS — Engineering Assurance Conditions", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const conditionIds: string[] = [];

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
    if (conditionIds.length) {
      await svc(`engineering_assurance_conditions?id=in.(${conditionIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("isolates conditions by workspace and tenant and denies anonymous access", async () => {
    const fingerprint = `a8c-${crypto.randomUUID()}`;
    const created = await svc("engineering_assurance_conditions", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        fingerprint,
        rule_id: "A8C-REQ-001",
        rule_version: "v1",
        condition_code: "A8C-REQ-001:v1",
        condition_type: "MISSING_ALLOCATION",
        assurance_domain: "REQUIREMENT",
        root_object_type: "requirement",
        root_object_id: crypto.randomUUID(),
        status: "OPEN",
        materiality: "UNASSESSED",
        explanation: "Synthetic A8C RLS row",
        would_resolve_if: "Allocate the requirement",
        digital_thread_path: "requirement:synthetic",
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const id = entityId(created.body) || ids(created.body)[0];
    expect(id).toBeTruthy();
    conditionIds.push(id);

    const a1 = await rest(`engineering_assurance_conditions?id=eq.${id}&select=id,explanation`, {}, fixtures.users.a1.jwt);
    expect(ids(a1.body)).toContain(id);

    const a2 = await rest(`engineering_assurance_conditions?id=eq.${id}&select=id,explanation`, {}, fixtures.users.a2.jwt);
    expect(ids(a2.body)).not.toContain(id);
    expect(JSON.stringify(a2.body)).not.toMatch(/Synthetic A8C RLS row/);

    const b1 = await rest(`engineering_assurance_conditions?id=eq.${id}&select=id`, {}, fixtures.users.b1.jwt);
    expect(ids(b1.body)).not.toContain(id);

    const anon = await rest(`engineering_assurance_conditions?id=eq.${id}&select=id`, {});
    expect(ids(anon.body)).not.toContain(id);

    const a2Count = await rest(
      `engineering_assurance_conditions?id=eq.${id}&select=id`,
      { headers: { Prefer: "count=exact" } },
      fixtures.users.a2.jwt,
    );
    const a2Total = totalFromRange(a2Count.contentRange);
    expect(a2Total === null || a2Total === 0).toBe(true);

    const a2Patch = await rest(
      `engineering_assurance_conditions?id=eq.${id}`,
      { method: "PATCH", body: JSON.stringify({ status: "ACKNOWLEDGED", disposition_rationale: "cross-ws" }) },
      fixtures.users.a2.jwt,
    );
    expect(mutationDenied(a2Patch)).toBe(true);

    const a1Patch = await rest(
      `engineering_assurance_conditions?id=eq.${id}`,
      { method: "PATCH", body: JSON.stringify({ status: "ACKNOWLEDGED", disposition: "DEFER", disposition_rationale: "A1 acknowledge" }) },
      fixtures.users.a1.jwt,
    );
    expect(a1Patch.status).toBeLessThan(300);

    const a1Delete = await rest(`engineering_assurance_conditions?id=eq.${id}`, { method: "DELETE" }, fixtures.users.a1.jwt);
    expect(mutationDenied(a1Delete)).toBe(true);

    const missingRules = await rest("engineering_assurance_rule_config?select=id", {}, fixtures.users.a1.jwt);
    expect(missingRules.status === 404 || missingRules.status >= 400).toBe(true);
  });
});
