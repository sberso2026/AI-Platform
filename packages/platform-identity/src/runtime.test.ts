import { describe, expect, it } from "vitest";
import {
  PLATFORM_IDENTITY_VERSION,
  PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION,
  PHASE_16A_BASELINE_COMMIT,
  PHASE_16B_BASELINE_COMMIT,
  PLATFORM_IDENTITY_V1_SEMANTICS,
} from "./version";
import {
  CustomerSsoProductionReady,
  S08CustomerSsoProductionReady,
  S07ExternalPenTestComplete,
  Tier1EnterpriseProductionReady,
  nearFinalTier1AttackSurfaceReadyForExternalPenTest,
  EnterpriseSsoRuntimeImplemented,
  EnterpriseOidcFederationReady,
  MicrosoftEntraEnterpriseSsoReady,
  passwordFallbackWhenRequired,
  knownEnterpriseIdentityCrossTenantLeakageDetected,
  SamlFederationImplemented,
  ScimProvisioningImplemented,
  JitProvisioningEnabled,
  phase16CReady,
} from "./runtime-flags";
import {
  assertNoCrossTenantLeak,
  buildControlledEntraFixture,
  completeFederatedLogin,
  createEmptyStore,
  discoverProviderByEmail,
  linkExternalIdentity,
  passwordFallbackAllowed,
  resolveRoleMappings,
  measurePerformanceBaselines,
} from "./domain/engine";
import { validateOidcIdToken, signHs256IdToken } from "./domain/oidc/validate";
import { createEnterpriseIdentityEvent } from "./domain/events";

import {
  ExternalPenTestReadinessReady,
  S07ClosureCriteriaLocked,
  FakeExternalPenTestResultPresent,
  InternalPenetrationTestOpinionIssued,
  ExternalPenTestComplete,
} from "./pen-test-readiness-flags";
import {
  TIER1_ATTACK_SURFACE_INVENTORY,
  S07_CLOSURE_CRITERIA,
  PEN_TEST_ENGAGEMENT_MODE,
} from "./domain/pen-test-readiness";

describe("Phase 16B Platform Enterprise SSO", () => {
  it("preserves S08 closure and public contracts on 16C readiness version", () => {
    expect(PLATFORM_IDENTITY_VERSION).toBe("0.3.0-pen-test-readiness");
    expect(PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION).toBe(
      "0.2.0-enterprise-sso",
    );
    expect(PHASE_16A_BASELINE_COMMIT).toBe(
      "af1e0425c77c516d4cf99a42d5e3eab9bee7206e",
    );
    expect(PHASE_16B_BASELINE_COMMIT).toBe(
      "0078c9b67021b695c5a4137905247818dd945d83",
    );
    expect(EnterpriseSsoRuntimeImplemented).toBe(true);
    expect(EnterpriseOidcFederationReady).toBe(true);
    expect(MicrosoftEntraEnterpriseSsoReady).toBe(true);
    expect(CustomerSsoProductionReady).toBe(true);
    expect(S08CustomerSsoProductionReady).toBe(true);
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(Tier1EnterpriseProductionReady).toBe(false);
    expect(nearFinalTier1AttackSurfaceReadyForExternalPenTest).toBe(true);
    expect(phase16CReady).toBe(true);
    expect(passwordFallbackWhenRequired).toBe(false);
    expect(SamlFederationImplemented).toBe(false);
    expect(ScimProvisioningImplemented).toBe(false);
    expect(JitProvisioningEnabled).toBe(false);
  });

  it("certifies controlled Entra OIDC happy path", () => {
    const fx = buildControlledEntraFixture(createEmptyStore());
    expect(fx.isEntra).toBe(true);
    const result = completeFederatedLogin(fx.store, {
      providerId: fx.providerId,
      idToken: fx.idToken,
      state: fx.state,
      expectedState: fx.state,
      expectedNonce: fx.nonce,
      authCode: "code-1",
      requirePrivilegedMfa: true,
      redirectUri: "https://app.example/auth/callback",
      redirectAllowList: ["https://app.example/auth/callback"],
    });
    expect(result.success).toBe(true);
    expect(result.resolvedTenantId).toBe(fx.tenantId);
    expect(result.assurance?.outcome).toBe("verified_sufficient");
  });

  it("fail-closes issuer/audience/signature/state/nonce/expiry/replay", () => {
    const fx = buildControlledEntraFixture(createEmptyStore());
    const now = Math.floor(Date.now() / 1000);

    expect(
      validateOidcIdToken({
        idToken: fx.idToken,
        expectedIssuer: "https://evil.example/",
        expectedAudience: fx.clientId,
        expectedNonce: fx.nonce,
        state: fx.state,
        expectedState: fx.state,
        jwks: fx.store.jwksByProvider.get(fx.providerId)!,
      }).ok,
    ).toBe(false);

    expect(
      completeFederatedLogin(fx.store, {
        providerId: fx.providerId,
        idToken: fx.idToken,
        state: "wrong",
        expectedState: fx.state,
        expectedNonce: fx.nonce,
      }).denialReason,
    ).toBe("state_invalid");

    const expired = signHs256IdToken(
      {
        iss: fx.issuer,
        aud: fx.clientId,
        sub: "entra-subject-user-1",
        nonce: fx.nonce,
        exp: now - 120,
        iat: now - 200,
      },
      fx.secret,
    );
    expect(
      completeFederatedLogin(fx.store, {
        providerId: fx.providerId,
        idToken: expired,
        state: fx.state,
        expectedState: fx.state,
        expectedNonce: fx.nonce,
      }).denialReason,
    ).toBe("token_expired");

    const badAud = signHs256IdToken(
      {
        iss: fx.issuer,
        aud: "wrong-aud",
        sub: "entra-subject-user-1",
        nonce: fx.nonce,
        exp: now + 600,
        iat: now,
      },
      fx.secret,
    );
    expect(
      completeFederatedLogin(fx.store, {
        providerId: fx.providerId,
        idToken: badAud,
        state: fx.state,
        expectedState: fx.state,
        expectedNonce: fx.nonce,
      }).denialReason,
    ).toBe("audience_invalid");

    completeFederatedLogin(fx.store, {
      providerId: fx.providerId,
      idToken: fx.idToken,
      state: fx.state,
      expectedState: fx.state,
      expectedNonce: fx.nonce,
      authCode: "replay-1",
    });
    expect(
      completeFederatedLogin(fx.store, {
        providerId: fx.providerId,
        idToken: fx.idToken,
        state: fx.state,
        expectedState: fx.state,
        expectedNonce: fx.nonce,
        authCode: "replay-1",
      }).denialReason,
    ).toBe("replay");
  });

  it("enforces domain discovery, linking, roles, and isolation", () => {
    const fx = buildControlledEntraFixture(createEmptyStore());
    expect(discoverProviderByEmail(fx.store, "user@acme.example").ok).toBe(true);
    expect(discoverProviderByEmail(fx.store, "user@unknown.example").ok).toBe(false);

    const linkFail = linkExternalIdentity(fx.store, {
      bindingId: "x",
      providerId: fx.providerId,
      issuer: fx.issuer,
      subject: "other",
      userId: fx.userId,
      tenantId: fx.tenantId,
      email: "a@b.c",
      emailVerified: true,
      proof: "email_only",
    });
    expect(linkFail.ok).toBe(false);

    const roles = resolveRoleMappings(fx.store, fx.tenantId, fx.providerId, [
      "Acme.Users",
      "Acme.Admins",
      "Unknown",
    ]);
    expect(roles.roles).toContain("member");
    expect(roles.deniedPrivilegedWithoutReview).toContain("Acme.Admins");

    expect(assertNoCrossTenantLeak(fx.store, fx.providerId, "victim-tenant")).toBe(
      true,
    );
    expect(knownEnterpriseIdentityCrossTenantLeakageDetected).toBe(false);

    const policy = fx.store.policies.get(fx.tenantId)!;
    expect(passwordFallbackAllowed(policy)).toBe(false);
    expect(PLATFORM_IDENTITY_V1_SEMANTICS.passwordFallbackWhenRequired).toBe(
      false,
    );
  });

  it("emits metadata-only events and records performance baselines", () => {
    const ev = createEnterpriseIdentityEvent("identity.enterprise.login.succeeded", {
      providerId: "p1",
      tenantId: "t1",
    });
    expect(ev.payload.containsSensitivePayload).toBe(false);
    expect(() =>
      createEnterpriseIdentityEvent("identity.enterprise.login.denied", {
        token: "x",
      } as never),
    ).toThrow();
    const b = measurePerformanceBaselines();
    expect(b.oidcCallbackValidationMs).toBeLessThan(1000);
  });
});

describe("Phase 16C pen-test readiness", () => {
  it("locks readiness without completing S07", () => {
    expect(ExternalPenTestReadinessReady).toBe(true);
    expect(S07ClosureCriteriaLocked).toBe(true);
    expect(ExternalPenTestComplete).toBe(false);
    expect(FakeExternalPenTestResultPresent).toBe(false);
    expect(InternalPenetrationTestOpinionIssued).toBe(false);
    expect(S07_CLOSURE_CRITERIA.internalTestsInsufficient).toBe(true);
    expect(PEN_TEST_ENGAGEMENT_MODE.mode).toBe("grey_box_hybrid");
    expect(
      TIER1_ATTACK_SURFACE_INVENTORY.some((e) => e.classification === "IN_SCOPE"),
    ).toBe(true);
    expect(
      TIER1_ATTACK_SURFACE_INVENTORY.some(
        (e) => e.classification === "EXTERNAL_PROVIDER",
      ),
    ).toBe(true);
  });
});
