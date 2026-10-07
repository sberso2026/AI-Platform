import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { anonReadDenied, ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A10C live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let requirementId = "";
  let packageId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930150000_eos_a10c_information_requirements_handover.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A10C migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (packageId) {
        await rest(`engineering_handover_package_items?package_id=eq.${packageId}`, { method: "DELETE" }, serviceKey);
        await rest(`engineering_handover_packages?id=eq.${packageId}`, { method: "DELETE" }, serviceKey);
      }
      if (requirementId) {
        await rest(`engineering_information_requirement_satisfactions?requirement_id=eq.${requirementId}`, { method: "DELETE" }, serviceKey);
        await rest(`engineering_information_requirements?id=eq.${requirementId}`, { method: "DELETE" }, serviceKey);
      }
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A10C tables are not on hosted Postgres");
    }
  });

  it("same workspace authorized read; other workspace, other tenant, and anonymous deny", async () => {
    requirementId = randomUUID();
    const inserted = await rest(
      "engineering_information_requirements",
      {
        method: "POST",
        body: JSON.stringify({
          id: requirementId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          requirement_type: "DESIGN_CRITERIA",
          information_type: "DESIGN_CRITERIA",
          purpose: "FOR_ENGINEERING_REVIEW",
          title: "A10C live design criteria",
          why_required: "Required to start foundation calculation.",
          provider_kind: "DISCIPLINE",
          provider_discipline: "STRUCTURAL",
          consumer_kind: "DISCIPLINE",
          consumer_discipline: "STRUCTURAL",
          status: "PLANNED",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_information_requirements?select=id,title&id=eq.${requirementId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(requirementId);

    const a2 = await rest(`engineering_information_requirements?select=id&id=eq.${requirementId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_information_requirements?select=id,title&id=eq.${requirementId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("A10C live design criteria");

    const anon = await rest(`engineering_information_requirements?select=id&id=eq.${requirementId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer may update permitted requirement workflow; admin-only delete is retained", async () => {
    packageId = randomUUID();
    const pkg = await rest(
      "engineering_handover_packages",
      {
        method: "POST",
        body: JSON.stringify({
          id: packageId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          display_name: "A10C live handover",
          state: "DRAFT",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(pkg.status, JSON.stringify(pkg.body)).toBeGreaterThanOrEqual(200);
    expect(pkg.status).toBeLessThan(300);

    const engineerDelete = await rest(
      `engineering_handover_packages?id=eq.${packageId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_handover_packages?select=id&id=eq.${packageId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(packageId);
  });
});
