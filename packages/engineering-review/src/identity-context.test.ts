import { describe, expect, it } from "vitest";
import { evaluateReviewIdentityPolicy, resolveReviewIdentityPolicy } from "./identity-policy";
import {
  evaluateCanonicalReviewAccess,
  hasExplicitReviewIdentitySettings,
  readRequestedCanonicalContext,
  resolveCanonicalActorContext,
  type CanonicalMembership,
} from "./identity-context";

const TENANT_X = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_OTHER = "33333333-3333-4333-8333-333333333333";
const WS_X = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const WS_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const WS_A2 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const WS_OTHER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

const signupX: CanonicalMembership = {
  tenantId: TENANT_X,
  tenantSlug: "signup-x",
  roleSlug: "owner",
  settings: { created_via: "signup" },
  workspaces: [{ workspaceId: WS_X, slug: "default", status: "active" }],
};

const reviewA: CanonicalMembership = {
  tenantId: TENANT_A,
  tenantSlug: "cert-er-a",
  roleSlug: "engineer",
  settings: { engineeringReview: { requireMfa: true, requireEnterpriseSso: false } },
  workspaces: [
    { workspaceId: WS_A2, slug: "cert-er-a2", status: "active" },
    { workspaceId: WS_A, slug: "cert-er-a1", status: "active" },
  ],
};

describe("ERA-7B canonical Review context", () => {
  it("A. keeps dual memberships distinct and does not collapse them by owner role", () => {
    const dual = [signupX, reviewA];
    expect(dual).toHaveLength(2);
    expect(signupX.roleSlug).toBe("owner");
    expect(hasExplicitReviewIdentitySettings(signupX.settings)).toBe(false);
    expect(hasExplicitReviewIdentitySettings(reviewA.settings)).toBe(true);
  });

  it("B. Active Tenant A + AAL1 -> mfa_required", () => {
    const access = evaluateCanonicalReviewAccess({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_A, workspaceId: WS_A },
      claims: { aal: "aal1", amr: ["password"] },
    });
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("mfa_required");
  });

  it("C. Active Tenant A + AAL2 -> authorized", () => {
    const access = evaluateCanonicalReviewAccess({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_A, workspaceId: WS_A },
      claims: { aal: "aal2", amr: ["password", "totp"] },
    });
    expect(access).toMatchObject({
      allowed: true,
      tenantId: TENANT_A,
      workspaceId: WS_A,
      source: "explicit",
    });
  });

  it("D. Active Tenant X does not resolve Tenant A workspace or projects", () => {
    const context = resolveCanonicalActorContext({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_X },
    });
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    expect(context.tenantId).toBe(TENANT_X);
    expect(context.workspaceId).toBe(WS_X);
    expect(context.workspaceId).not.toBe(WS_A);
    const policy = resolveReviewIdentityPolicy(context.settings);
    expect(policy.requireMfa).toBe(false);
    expect(
      evaluateReviewIdentityPolicy(policy, { aal: "aal1", amr: ["password"] }).allowed,
    ).toBe(true);
  });

  it("E. Changing tenant identifier without membership is denied", () => {
    const context = resolveCanonicalActorContext({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_OTHER },
    });
    expect(context).toEqual({ ok: false, reason: "not_member" });
  });

  it("F. Workspace must belong to the active tenant and the user must have access", () => {
    expect(
      resolveCanonicalActorContext({
        memberships: [signupX, reviewA],
        requested: { tenantId: TENANT_A, workspaceId: WS_X },
        requestedWorkspaceOwnership: { workspaceId: WS_X, tenantId: TENANT_X },
      }),
    ).toEqual({ ok: false, reason: "workspace_not_in_tenant" });
    expect(
      resolveCanonicalActorContext({
        memberships: [signupX, reviewA],
        requested: { tenantId: TENANT_A, workspaceId: WS_OTHER },
      }),
    ).toEqual({ ok: false, reason: "workspace_unauthorized" });
  });

  it("G. middleware and Review API inputs resolve identical context", () => {
    const memberships = [signupX, reviewA];
    const requested = readRequestedCanonicalContext({
      tenantCookie: TENANT_A,
      workspaceCookie: WS_A,
    });
    expect(requested.ok).toBe(true);
    if (!requested.ok) return;
    const middleware = resolveCanonicalActorContext({ memberships, requested });
    const api = resolveCanonicalActorContext({ memberships, requested });
    expect(middleware).toEqual(api);
    expect(middleware).toMatchObject({ ok: true, tenantId: TENANT_A, workspaceId: WS_A, source: "explicit" });
  });

  it("H. audit attribution uses the same tenant/workspace as the resolved Review actor", () => {
    const context = resolveCanonicalActorContext({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_A, workspaceId: WS_A },
    });
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    const audit = { tenantId: context.tenantId, workspaceId: context.workspaceId, actorId: "user-a1" };
    expect(audit.tenantId).toBe(TENANT_A);
    expect(audit.workspaceId).toBe(WS_A);
    expect(audit.tenantId).not.toBe(TENANT_X);
  });

  it("I. Owner role does not override an explicit authorized Review tenant", () => {
    const context = resolveCanonicalActorContext({
      memberships: [signupX, reviewA],
      requested: { tenantId: TENANT_A },
    });
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    expect(context.tenantId).toBe(TENANT_A);
    expect(context.roleSlug).toBe("engineer");
    expect(context.source).toBe("explicit");
  });

  it("J. does not use first-row or owner fallback when no explicit context is supplied", () => {
    const ownerFirst = resolveCanonicalActorContext({ memberships: [signupX, reviewA] });
    const reviewFirst = resolveCanonicalActorContext({ memberships: [reviewA, signupX] });
    expect(ownerFirst).toEqual(reviewFirst);
    expect(ownerFirst).toMatchObject({
      ok: true,
      tenantId: TENANT_A,
      source: "unique_review_identity",
    });
    if (ownerFirst.ok) {
      expect(ownerFirst.workspaceId).toBe(WS_A);
    }
  });

  it("prefers request headers over cookies and rejects invalid identifiers", () => {
    const requested = readRequestedCanonicalContext({
      tenantHeader: TENANT_A,
      tenantCookie: TENANT_X,
      workspaceHeader: WS_A,
      workspaceCookie: WS_X,
    });
    expect(requested).toEqual({ ok: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(readRequestedCanonicalContext({ tenantHeader: "not-a-uuid" })).toEqual({
      ok: false,
      reason: "invalid_identifier",
    });
  });

  it("requires explicit selection when two Review-identity tenants exist", () => {
    const secondReview: CanonicalMembership = {
      tenantId: TENANT_OTHER,
      tenantSlug: "cert-er-c",
      roleSlug: "engineer",
      settings: { engineeringReview: { requireMfa: true, requireEnterpriseSso: false } },
      workspaces: [{ workspaceId: WS_OTHER, slug: "ws-c", status: "active" }],
    };
    expect(resolveCanonicalActorContext({ memberships: [reviewA, secondReview] })).toEqual({
      ok: false,
      reason: "context_required",
    });
  });
});
