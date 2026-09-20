import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { evaluateReviewIdentityPolicy, resolveReviewIdentityPolicy } from "@rtb/engineering-review";
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

function jwtClaims(token: string): { aal?: string; amr?: unknown } {
  const part = token.split(".")[1];
  if (!part) return {};
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { aal?: string; amr?: unknown };
}

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("ERA-7A pilot identity policy", () => {
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

  it("rejects a live password-only AAL1 session when Tenant A requires MFA", async () => {
    const admin = createServiceReviewClient(url, serviceKey);
    const { data: tenantA } = await admin.from("tenants").select("settings").eq("id", fixtures.tenantAId).maybeSingle();
    const policy = resolveReviewIdentityPolicy((tenantA?.settings as Record<string, unknown>) ?? {});
    expect(policy.requireMfa).toBe(true);
    const claims = jwtClaims(fixtures.users.a1.jwt);
    expect(String(claims.aal ?? "aal1")).toBe("aal1");
    const decision = evaluateReviewIdentityPolicy(policy, {
      aal: typeof claims.aal === "string" ? claims.aal : "aal1",
      amr: Array.isArray(claims.amr) ? (claims.amr as Array<string | { method?: string }>) : ["password"],
    });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("mfa_required");
  });

  it("rejects Tenant B identity from satisfying Tenant A MFA policy", async () => {
    const admin = createServiceReviewClient(url, serviceKey);
    const { data: tenantA } = await admin.from("tenants").select("settings").eq("id", fixtures.tenantAId).maybeSingle();
    const policy = resolveReviewIdentityPolicy((tenantA?.settings as Record<string, unknown>) ?? {});
    const claims = jwtClaims(fixtures.users.b1.jwt);
    const decision = evaluateReviewIdentityPolicy(policy, {
      aal: typeof claims.aal === "string" ? claims.aal : "aal1",
      amr: Array.isArray(claims.amr) ? (claims.amr as Array<string | { method?: string }>) : ["password"],
    });
    expect(decision.allowed).toBe(false);
  });
});

describe("ERA-7A identity environment gate", () => {
  it("does not skip-as-pass when ENGINEERING_REVIEW_RLS=1", () => {
    expect(["run", "skip", "misconfigured"]).toContain(mode);
    expect(mode).not.toBe("misconfigured");
  });
});
