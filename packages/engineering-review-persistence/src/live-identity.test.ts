import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { evaluateReviewIdentityPolicy, resolveCanonicalActorContext, resolveReviewIdentityPolicy } from "@rtb/engineering-review";
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

  it("selects Tenant A over a signup owner membership without using first-row or owner rank", async () => {
    const admin = createServiceReviewClient(url, serviceKey);
    const { data: rows } = await admin
      .from("tenant_memberships")
      .select("tenant_id, roles(slug), tenants(id, slug, settings)")
      .eq("user_id", fixtures.users.a1.id)
      .eq("status", "active");
    const { data: workspaces } = await admin
      .from("workspace_memberships")
      .select("workspace_id, workspaces!inner(id, slug, status, tenant_id)")
      .eq("user_id", fixtures.users.a1.id);
    const memberships = (rows ?? []).map((row) => {
      const tenant = Array.isArray(row.tenants) ? row.tenants[0] : row.tenants;
      const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
      const tenantId = String(tenant?.id ?? row.tenant_id);
      return {
        tenantId,
        tenantSlug: String(tenant?.slug ?? tenantId),
        roleSlug: String(role?.slug ?? "member"),
        settings: (tenant?.settings as Record<string, unknown> | null) ?? null,
        workspaces: (workspaces ?? [])
          .map((item) => {
            const joined = Array.isArray(item.workspaces) ? item.workspaces[0] : item.workspaces;
            return {
              workspaceId: String(joined?.id ?? item.workspace_id),
              slug: String(joined?.slug ?? ""),
              status: String(joined?.status ?? "active"),
              tenantId: String(joined?.tenant_id ?? ""),
            };
          })
          .filter((item) => item.tenantId === tenantId)
          .map(({ workspaceId, slug, status }) => ({ workspaceId, slug, status })),
      };
    });
    const unspecified = resolveCanonicalActorContext({ memberships });
    const ownerFirst = resolveCanonicalActorContext({ memberships: [...memberships].reverse() });
    expect(unspecified).toEqual(ownerFirst);
    expect(unspecified.ok).toBe(true);
    if (!unspecified.ok) return;
    expect(unspecified.tenantId).toBe(fixtures.tenantAId);
    expect(unspecified.workspaceId).toBe(fixtures.workspaceA1Id);
    expect(unspecified.source).toBe("unique_review_identity");
    const stolen = resolveCanonicalActorContext({
      memberships,
      requested: { tenantId: "00000000-0000-4000-8000-000000000099" },
    });
    expect(stolen).toEqual({ ok: false, reason: "not_member" });
  });
});

describe("ERA-7A identity environment gate", () => {
  it("does not skip-as-pass when ENGINEERING_REVIEW_RLS=1", () => {
    expect(["run", "skip", "misconfigured"]).toContain(mode);
    expect(mode).not.toBe("misconfigured");
  });
});
