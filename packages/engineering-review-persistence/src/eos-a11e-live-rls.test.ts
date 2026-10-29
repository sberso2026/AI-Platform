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

describe.skipIf(!LIVE)("EOS-A11E live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let assessmentId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930200000_eos_a11e_change_impact_option_construction.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A11E migration applied failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (assessmentId) await rest(`engineering_impact_assessments?id=eq.${assessmentId}`, { method: "DELETE" }, serviceKey);
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A11E tables are not on hosted Postgres");
    }
  });

  it("authorized engineer inserts and reads own workspace impact assessments; other workspace, other tenant, and anonymous deny", async () => {
    assessmentId = randomUUID();
    const inserted = await rest(
      "engineering_impact_assessments",
      {
        method: "POST",
        body: JSON.stringify({
          id: assessmentId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          source_object_type: "change",
          source_object_id: "chg-live-a11e",
          workflow: "CHANGE_IMPACT",
          policy_code: "EOS-A11E-IMPACT-ASSESSMENT",
          policy_version: "1.0.0",
          status: "REVIEW_REQUIRED",
          completeness: "COMPLETE",
          traversal_status: "COMPLETE",
          staleness: "CURRENT",
          source_fingerprint: "live-rls-a11e",
          graph_fingerprint: "live-rls-a11e-graph",
          snapshot: { binaryContentCopied: false, humanReviewRequired: true },
          view_project_mismatch: false,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_impact_assessments?select=id,policy_code&id=eq.${assessmentId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(assessmentId);

    const a2 = await rest(`engineering_impact_assessments?select=id&id=eq.${assessmentId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_impact_assessments?select=id,policy_code&id=eq.${assessmentId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("EOS-A11E-IMPACT-ASSESSMENT");

    const anon = await rest(`engineering_impact_assessments?select=id&id=eq.${assessmentId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot delete impact assessments", async () => {
    const engineerDelete = await rest(
      `engineering_impact_assessments?id=eq.${assessmentId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDelete) || ids(engineerDelete.body).length === 0, JSON.stringify(engineerDelete.body)).toBe(true);
    const stillThere = await rest(`engineering_impact_assessments?select=id&id=eq.${assessmentId}`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body)).toContain(assessmentId);
  });
});
