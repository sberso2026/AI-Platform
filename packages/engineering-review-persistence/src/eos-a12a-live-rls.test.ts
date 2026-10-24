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

describe.skipIf(!LIVE)("EOS-A12A live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let policyId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001000000_eos_a12a_artifact_template_governance.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A12A migration applied failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (policyId) await rest(`engineering_artifact_template_policies?id=eq.${policyId}`, { method: "DELETE" }, serviceKey);
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A12A tables are not on hosted Postgres");
    }
  });

  it("authorized engineer reads applicable template policy metadata; other workspace, other tenant, and anonymous deny", async () => {
    policyId = randomUUID();
    const inserted = await rest(
      "engineering_artifact_template_policies",
      {
        method: "POST",
        body: JSON.stringify({
          id: policyId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          artifact_type: "DESIGN_REPORT",
          template_code: "ABC-ENG-REPORT",
          template_version: "6.0.0",
          name: "ABC Engineering Design Report",
          source_class: "PROJECT_CLIENT_APPROVED",
          status: "ACTIVE",
          disciplines: [],
          work_types: [],
          lifecycle_stages: [],
          packaged_asset_key: "EAT-REPORT-DESIGN",
          presentation_kind: "COMBINED",
          branding: { companyName: "ABC Engineering" },
          fallback_policy: "OFFICIAL_TEMPLATE_REQUIRED",
          active: true,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    const adminInserted = inserted.status >= 200 && inserted.status < 300;
    if (!adminInserted) {
      const seeded = await rest(
        "engineering_artifact_template_policies",
        {
          method: "POST",
          body: JSON.stringify({
            id: policyId,
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA1Id,
            project_id: fixtures.projectA1Id,
            artifact_type: "DESIGN_REPORT",
            template_code: "ABC-ENG-REPORT",
            template_version: "6.0.0",
            name: "ABC Engineering Design Report",
            source_class: "PROJECT_CLIENT_APPROVED",
            status: "ACTIVE",
            disciplines: [],
            work_types: [],
            lifecycle_stages: [],
            packaged_asset_key: "EAT-REPORT-DESIGN",
            presentation_kind: "COMBINED",
            branding: { companyName: "ABC Engineering" },
            fallback_policy: "OFFICIAL_TEMPLATE_REQUIRED",
            active: true,
          }),
        },
        serviceKey,
      );
      expect(seeded.status, JSON.stringify(seeded.body)).toBeGreaterThanOrEqual(200);
      expect(seeded.status).toBeLessThan(300);
    }

    const own = await rest(`engineering_artifact_template_policies?select=id,template_code&id=eq.${policyId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(policyId);

    const a2 = await rest(`engineering_artifact_template_policies?select=id&id=eq.${policyId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_artifact_template_policies?select=id,template_code&id=eq.${policyId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("ABC-ENG-REPORT");

    const anon = await rest(`engineering_artifact_template_policies?select=id&id=eq.${policyId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot mutate template policy", async () => {
    const engineerInsert = await rest(
      "engineering_artifact_template_policies",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          artifact_type: "DESIGN_REPORT",
          template_code: "ENGINEER-FORGED",
          template_version: "1.0.0",
          name: "Forged",
          source_class: "COMPANY_OFFICIAL",
          status: "ACTIVE",
          packaged_asset_key: "EAT-REPORT-DESIGN",
          presentation_kind: "COMBINED",
          fallback_policy: "OFFICIAL_TEMPLATE_REQUIRED",
          active: true,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerInsert) || (engineerInsert.status >= 400), JSON.stringify(engineerInsert.body)).toBe(true);

    const engineerDelete = await rest(
      `engineering_artifact_template_policies?id=eq.${policyId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_artifact_template_policies?select=id&id=eq.${policyId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(policyId);
  });
});
