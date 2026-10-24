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

describe.skipIf(!LIVE)("EOS-A10A live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let refId = "";
  let policyId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20260930130000_eos_a10a_engineering_information_intelligence.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A10A migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
      if (refId) {
        await rest(`engineering_information_refs?id=eq.${refId}`, { method: "DELETE" }, serviceKey);
      }
      if (policyId) {
        await rest(`engineering_information_authority_policies?id=eq.${policyId}`, { method: "DELETE" }, serviceKey);
      }
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A10A tables are not on hosted Postgres");
    }
  });

  it("same workspace authorized read; other workspace, other tenant, and anonymous deny", async () => {
    refId = randomUUID();
    const inserted = await rest(
      "engineering_information_refs",
      {
        method: "POST",
        body: JSON.stringify({
          id: refId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          source_object_type: "document",
          source_object_id: fixtures.documentA1Id,
          information_type: "DESIGN_CRITERIA",
          source_kind: "DOCUMENT",
          purpose: "FOR_ENGINEERING_REVIEW",
          eligibility: "WORKING",
          source_facts: { revision: "A", revisionAuthority: "DOCUMENT_REVISION" },
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_information_refs?select=id,source_object_id&id=eq.${refId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(refId);

    const a2 = await rest(`engineering_information_refs?select=id&id=eq.${refId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_information_refs?select=id,source_object_id&id=eq.${refId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain(fixtures.documentA1Id);

    const anon = await rest(`engineering_information_refs?select=id&id=eq.${refId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);
  });

  it("normal engineer cannot mutate authority policy; admin can insert permitted policy", async () => {
    policyId = randomUUID();
    const payload = {
      id: policyId,
      tenant_id: fixtures.tenantAId,
      workspace_id: fixtures.workspaceA1Id,
      project_id: fixtures.projectA1Id,
      policy_id: "INF-AUTH-A10A-LIVE",
      policy_version: "v1",
      information_type: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      eligible_source_kinds: ["DOCUMENT"],
      eligible_source_object_types: ["document"],
      require_authoritative_source: true,
    };
    const engineer = await rest(
      "engineering_information_authority_policies",
      { method: "POST", body: JSON.stringify(payload) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineer), JSON.stringify(engineer.body)).toBe(true);

    const admin = await rest(
      "engineering_information_authority_policies",
      { method: "POST", body: JSON.stringify(payload) },
      fixtures.users.aAdmin.jwt,
    );
    expect(admin.status, JSON.stringify(admin.body)).toBeGreaterThanOrEqual(200);
    expect(admin.status).toBeLessThan(300);
  });
});
