import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  evaluateCanonicalReviewAccess,
  resolveCanonicalActorContext,
} from "@rtb/engineering-review/identity";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const TENANT_X = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const WS_X = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const WS_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

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

describe("ERA-7B Review tenant context wiring", () => {
  it("uses the same canonical resolver on middleware, login, kernel, and Review API", () => {
    const middleware = readApp("src/middleware.ts");
    const login = readApp("src/app/(auth)/login/page.tsx");
    const kernel = readApp("src/lib/kernel.ts");
    const guard = readApp("src/lib/review/with-review-api.ts");
    const runtime = readApp("src/lib/review/runtime.ts");
    const contextApi = readApp("src/app/api/platform/active-context/route.ts");
    expect(middleware).toContain("resolveRequestActorContext");
    expect(middleware).toContain("evaluateReviewIdentityPolicy");
    expect(kernel).toContain("resolveRequestActorContext");
    expect(kernel).not.toContain("ownerMembership");
    expect(guard).toContain("resolveAuthContext");
    expect(guard).toContain("evaluateReviewIdentityPolicy");
    expect(login).toContain("/api/platform/active-context");
    expect(login).not.toContain(".limit(1)");
    expect(middleware).not.toMatch(/tenant_memberships[\s\S]{0,400}\.limit\(1\)/);
    expect(contextApi).toContain("resolveCanonicalActorContext");
    expect(runtime).toContain("bindTrustedReviewAudit");
    expect(guard).toContain("tenantId: ctx.tenantId");
    expect(guard).toContain("workspaceId: ctx.workspaceId");
  });

  it("does not trust a browser-supplied tenant without membership", () => {
    expect(
      resolveCanonicalActorContext({
        memberships,
        requested: { tenantId: "00000000-0000-4000-8000-000000000099" },
      }),
    ).toEqual({ ok: false, reason: "not_member" });
    expect(readApp("src/app/api/platform/active-context/route.ts")).toContain("Requested tenant/workspace is not authorized");
  });

  it("keeps Tenant A MFA fail-closed and Tenant X isolated", () => {
    const aal1 = evaluateCanonicalReviewAccess({
      memberships,
      requested: { tenantId: TENANT_A, workspaceId: WS_A },
      claims: { aal: "aal1", amr: ["password"] },
    });
    const aal2 = evaluateCanonicalReviewAccess({
      memberships,
      requested: { tenantId: TENANT_A, workspaceId: WS_A },
      claims: { aal: "aal2", amr: ["password", "totp"] },
    });
    const tenantX = resolveCanonicalActorContext({
      memberships,
      requested: { tenantId: TENANT_X },
    });
    expect(aal1).toEqual({ allowed: false, reason: "mfa_required" });
    expect(aal2).toMatchObject({ allowed: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(tenantX).toMatchObject({ ok: true, tenantId: TENANT_X, workspaceId: WS_X });
  });
});
