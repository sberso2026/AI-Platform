import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateReviewRuntime, REVIEW_EOS_PROJECT_REF, REVIEW_STAGING_PROJECT_REF } from "@rtb/engineering-review/runtime";
import { evaluateCanonicalReviewAccess, resolveCanonicalActorContext } from "@rtb/engineering-review/identity";
import { sanitizeAuditMetadata } from "@rtb/engineering-review";

const WEB_ROOT = resolve(__dirname, "../../");
const REPO_ROOT = resolve(WEB_ROOT, "../..");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_X = "11111111-1111-4111-8111-111111111111";
const WS_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const WS_X = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const memberships = [
  {
    tenantId: TENANT_X,
    tenantSlug: "signup-x",
    roleSlug: "owner",
    settings: { created_via: "signup" },
    workspaces: [{ workspaceId: WS_X, slug: "default", status: "active" }],
  },
  {
    tenantId: TENANT_A,
    tenantSlug: "cert-er-a",
    roleSlug: "engineer",
    settings: { engineeringReview: { requireMfa: true, requireEnterpriseSso: false } },
    workspaces: [{ workspaceId: WS_A, slug: "cert-er-a1", status: "active" }],
  },
];

describe("ERA-7C staging login and MFA path", () => {
  it("refuses EOS for staging runtime and accepts the staging project ref", () => {
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_EOS_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }).ok,
    ).toBe(false);
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }),
    ).toEqual({ ok: true, projectRef: REVIEW_STAGING_PROJECT_REF });
    const script = readFileSync(resolve(REPO_ROOT, "scripts/review-staging.mjs"), "utf8");
    expect(script).toContain('EOS_REF = "wcydlhqiqdwgoaqrlget"');
    expect(script).toContain("Refusing to start Review staging against the EOS Supabase project.");
    expect(script).not.toMatch(/readFileSync\([^)]*apps\/web\/\.env\.local/);
    expect(script).toContain("projectRefFromJwt");
  });

  it("uses the configured public Supabase client and never ships service-role to the browser", () => {
    const client = readApp("src/lib/supabase/client.ts");
    const login = readApp("src/app/(auth)/login/page.tsx");
    const security = readApp("src/app/(platform)/settings/security/page.tsx");
    const challenge = readApp("src/app/(auth)/login/mfa/page.tsx");
    expect(client).toContain("resolvePublicSupabaseConfig");
    expect(login).toContain("createClient");
    expect(login).toContain("signInWithPassword");
    expect(login).toContain("postPasswordMfaDestination");
    expect(login).toContain("mapAuthError");
    expect(readApp("src/lib/supabase/public-config.ts")).not.toMatch(/SERVICE_ROLE|createServiceClient|sb_secret_/);
    for (const body of [client, login, security, challenge]) {
      expect(body).not.toMatch(/SERVICE_ROLE|createServiceClient|sb_secret_/);
    }
  });

  it("keeps canonical Tenant A / WS A1 and MFA fail-closed", () => {
    const selected = resolveCanonicalActorContext({ memberships });
    expect(selected).toMatchObject({ ok: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(
      evaluateCanonicalReviewAccess({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_A },
        claims: { aal: "aal1", amr: ["password"] },
      }),
    ).toEqual({ allowed: false, reason: "mfa_required" });
    expect(
      evaluateCanonicalReviewAccess({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_A },
        claims: { aal: "aal2", amr: ["password", "totp"] },
      }),
    ).toMatchObject({ allowed: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(
      resolveCanonicalActorContext({ memberships, requested: { tenantId: TENANT_X } }),
    ).toMatchObject({ ok: true, workspaceId: WS_X });
    expect(
      resolveCanonicalActorContext({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_X },
        requestedWorkspaceOwnership: { workspaceId: WS_X, tenantId: TENANT_X },
      }),
    ).toEqual({ ok: false, reason: "workspace_not_in_tenant" });
    expect(sanitizeAuditMetadata({ totpSecret: "secret", tenantId: TENANT_A })).toEqual({ tenantId: TENANT_A });
  });
});
