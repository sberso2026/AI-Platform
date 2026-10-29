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

describe.skipIf(!LIVE)("EOS-A8D live JWT RLS — Assurance governance and Review citations", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const conditionIds: string[] = [];
  const citationIds: string[] = [];
  const settingIds: string[] = [];
  const runIds: string[] = [];
  const extraPackageIds: string[] = [];

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
    if (citationIds.length) {
      await svc(`engineering_assurance_review_citations?id=in.(${citationIds.join(",")})`, { method: "DELETE" });
    }
    if (settingIds.length) {
      await svc(`engineering_assurance_rule_settings?id=in.(${settingIds.join(",")})`, { method: "DELETE" });
    }
    if (runIds.length) {
      await svc(`engineering_assurance_evaluation_runs?id=in.(${runIds.join(",")})`, { method: "DELETE" });
    }
    if (conditionIds.length) {
      await svc(`engineering_assurance_conditions?id=in.(${conditionIds.join(",")})`, { method: "DELETE" });
    }
    if (extraPackageIds.length) {
      await svc(`engineering_review_packages?id=in.(${extraPackageIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("validates Review citations, isolates rule settings, and never auto-creates Findings", async () => {
    const fingerprint = `a8d-${crypto.randomUUID()}`;
    const created = await svc("engineering_assurance_conditions", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        fingerprint,
        rule_id: "A8C-DEC-001",
        rule_version: "v1",
        condition_code: "A8C-DEC-001:v1",
        condition_type: "MISSING_SUPPORTING_EVIDENCE",
        assurance_domain: "DECISION",
        root_object_type: "decision",
        root_object_id: crypto.randomUUID(),
        status: "OPEN",
        materiality: "UNASSESSED",
        explanation: "Synthetic A8D RLS condition",
        would_resolve_if: "Add governed evidence",
        digital_thread_path: "decision:synthetic",
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const conditionId = entityId(created.body) || ids(created.body)[0];
    expect(conditionId).toBeTruthy();
    conditionIds.push(conditionId);

    const findingsBefore = await rest(
      `engineering_review_findings?review_package_id=eq.${fixtures.packageA1Id}&select=id`,
      {},
      fixtures.users.a1.jwt,
    );
    const findingCountBefore = ids(findingsBefore.body).length;

    const citation = await rest(
      "engineering_assurance_review_citations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          condition_id: conditionId,
          review_package_id: fixtures.packageA1Id,
          created_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(citation.status, JSON.stringify(citation.body)).toBeLessThan(300);
    const citationId = entityId(citation.body) || ids(citation.body)[0];
    citationIds.push(citationId);

    const findingsAfter = await rest(
      `engineering_review_findings?review_package_id=eq.${fixtures.packageA1Id}&select=id`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(ids(findingsAfter.body)).toHaveLength(findingCountBefore);

    const a2CitationRead = await rest(
      `engineering_assurance_review_citations?id=eq.${citationId}&select=id`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2CitationRead.body)).not.toContain(citationId);

    const otherPkg = await svc("engineering_review_packages", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA2Id,
        project_id: fixtures.projectA2Id,
        name: `A8D transient A2 package ${crypto.randomUUID()}`,
        status: "ready",
        documents: [],
        created_by: fixtures.users.a2.id,
      }),
    });
    expect(otherPkg.status, JSON.stringify(otherPkg.body)).toBeLessThan(300);
    const otherPkgId = entityId(otherPkg.body) || ids(otherPkg.body)[0];
    extraPackageIds.push(otherPkgId);

    const crossWs = await svc("engineering_assurance_review_citations", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        condition_id: conditionId,
        review_package_id: otherPkgId,
      }),
    });
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const crossTenant = await svc("engineering_assurance_review_citations", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantBId,
        workspace_id: fixtures.workspaceB1Id,
        condition_id: conditionId,
        review_package_id: fixtures.packageA1Id,
      }),
    });
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);

    const anon = await rest(`engineering_assurance_review_citations?id=eq.${citationId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(citationId);

    const a1Setting = await rest(
      "engineering_assurance_rule_settings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          rule_id: "A8C-DEC-001",
          rule_version: "v1",
          enabled: false,
          configured_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1Setting)).toBe(true);

    const adminSetting = await rest(
      "engineering_assurance_rule_settings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          rule_id: "A8C-DEC-001",
          rule_version: "v1",
          enabled: false,
          configured_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminSetting.status, JSON.stringify(adminSetting.body)).toBeLessThan(300);
    const settingId = entityId(adminSetting.body) || ids(adminSetting.body)[0];
    settingIds.push(settingId);

    const a2Setting = await rest(
      `engineering_assurance_rule_settings?id=eq.${settingId}&select=id,rule_id`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2Setting.body)).not.toContain(settingId);

    const a1DeleteSetting = await rest(
      `engineering_assurance_rule_settings?id=eq.${settingId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1DeleteSetting)).toBe(true);

    const run = await rest(
      "engineering_assurance_evaluation_runs",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          started_at: new Date().toISOString(),
          completeness: "PARTIAL",
          truncated: true,
          link_count: 2000,
          link_limit: 2000,
          remaining_scope_unknown: true,
          ruleset_fingerprint: "a8d-live",
          reason: "link_scan_limit_reached",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(run.status, JSON.stringify(run.body)).toBeLessThan(300);
    const runId = entityId(run.body) || ids(run.body)[0];
    runIds.push(runId);

    const a1DeleteHistory = await rest(
      `engineering_assurance_conditions?id=eq.${conditionId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(a1DeleteHistory)).toBe(true);

    const b1Read = await rest(`engineering_assurance_conditions?id=eq.${conditionId}&select=id`, {}, fixtures.users.b1.jwt);
    expect(ids(b1Read.body)).not.toContain(conditionId);
  });
});
