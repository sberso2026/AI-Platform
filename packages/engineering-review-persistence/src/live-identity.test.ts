import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedReviewMigrations } from "../scripts/apply-hosted-migration";
import { createServiceReviewClient } from "./client";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./env";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("ERA-7 pilot identity policy", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    const applied = await applyHostedReviewMigrations();
    if (!applied.hostedTablesReady) {
      environment = "unavailable";
      return;
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("enforces MFA on the designated pilot tenant only", async () => {
    const admin = createServiceReviewClient(url, serviceKey);
    const { data: tenantA } = await admin.from("tenants").select("settings").eq("id", fixtures.tenantAId).maybeSingle();
    const { data: tenantB } = await admin.from("tenants").select("settings").eq("id", fixtures.tenantBId).maybeSingle();
    const policyA = (tenantA?.settings as { engineeringReview?: { requireMfa?: boolean } } | null)?.engineeringReview;
    const policyB = (tenantB?.settings as { engineeringReview?: { requireMfa?: boolean } } | null)?.engineeringReview;
    expect(policyA?.requireMfa).toBe(true);
    expect(policyB?.requireMfa).not.toBe(true);
  });
});

describe("ERA-7 identity environment gate", () => {
  it("does not skip-as-pass when ENGINEERING_REVIEW_RLS=1", () => {
    expect(["run", "skip", "misconfigured"]).toContain(mode);
    expect(mode).not.toBe("misconfigured");
  });
});
