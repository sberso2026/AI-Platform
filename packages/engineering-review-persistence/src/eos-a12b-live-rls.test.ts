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
import { ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A12B live JWT RLS", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let ackId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001120000_eos_a12b_engineering_attention.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A12B migration applied failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready" && ackId) {
      await rest(`engineering_attention_acknowledgements?id=eq.${ackId}`, { method: "DELETE" }, serviceKey);
    }
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A12B tables are not on hosted Postgres");
    }
  });

  it("authorized user reads own acknowledgement; other workspace, other tenant, and anonymous deny", async () => {
    ackId = randomUUID();
    const inserted = await rest(
      "engineering_attention_acknowledgements",
      {
        method: "POST",
        body: JSON.stringify({
          id: ackId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          user_id: fixtures.users.a1.id,
          fingerprint: "requirement|req-1|WAITING_ON_OTHERS|project-a|AWAITING_INFORMATION",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(inserted.status, JSON.stringify(inserted.body)).toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(`engineering_attention_acknowledgements?select=id,fingerprint&id=eq.${ackId}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(ackId);

    const a2 = await rest(`engineering_attention_acknowledgements?select=id&id=eq.${ackId}`, {}, fixtures.users.a2.jwt);
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(`engineering_attention_acknowledgements?select=id,fingerprint&id=eq.${ackId}`, {}, fixtures.users.b1.jwt);
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);
    expect(JSON.stringify(b1.body)).not.toContain("WAITING_ON_OTHERS");

    const anon = await rest(`engineering_attention_acknowledgements?select=id&id=eq.${ackId}`);
    expect(anon.status).toBe(200);
    expect(ids(anon.body)).toEqual([]);
  });

  it("engineer cannot insert an acknowledgement for another user", async () => {
    const forged = await rest(
      "engineering_attention_acknowledgements",
      {
        method: "POST",
        body: JSON.stringify({
          id: randomUUID(),
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          user_id: fixtures.users.a2.id,
          fingerprint: "forged-recipient",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(forged) || (forged.status >= 400), JSON.stringify(forged.body)).toBe(true);
  });
});
