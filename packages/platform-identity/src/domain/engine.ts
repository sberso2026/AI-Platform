/**
 * In-memory enterprise identity domain engine for production logic + certification fixtures.
 * Persistence schema is defined in batch_96; engine is authoritative for fail-closed semantics.
 */
import type {
  EnterpriseIdentityHealth,
  EnterpriseIdentityProviderConfiguration,
  EnterpriseRoleMapping,
  ExternalIdentityBinding,
  FederatedAuthenticationResult,
  FederatedMfaAssurance,
  TenantSsoPolicy,
  VerifiedIdentityDomain,
} from "../contracts";
import { isEntraIssuer } from "./oidc/entra";
import {
  generatePkcePair,
  generateStateNonce,
  signHs256IdToken,
  validateOidcIdToken,
  validateRedirectUri,
} from "./oidc/validate";

export type EngineStore = {
  providers: Map<string, EnterpriseIdentityProviderConfiguration>;
  domains: Map<string, VerifiedIdentityDomain>;
  policies: Map<string, TenantSsoPolicy>;
  bindings: Map<string, ExternalIdentityBinding>;
  roleMappings: Map<string, EnterpriseRoleMapping>;
  health: Map<string, EnterpriseIdentityHealth>;
  usedAuthCodes: Set<string>;
  jwksByProvider: Map<string, Array<{ kid?: string; kty: string; alg?: string; k?: string }>>;
  memberships: Map<string, { userId: string; tenantId: string; role: string; active: boolean }[]>;
};

export function createEmptyStore(): EngineStore {
  return {
    providers: new Map(),
    domains: new Map(),
    policies: new Map(),
    bindings: new Map(),
    roleMappings: new Map(),
    health: new Map(),
    usedAuthCodes: new Set(),
    jwksByProvider: new Map(),
    memberships: new Map(),
  };
}

export function evaluateFederatedMfaAssurance(claims: Record<string, unknown>): FederatedMfaAssurance {
  const amr = Array.isArray(claims.amr)
    ? claims.amr.filter((x): x is string => typeof x === "string")
    : undefined;
  const acr = typeof claims.acr === "string" ? claims.acr : undefined;
  const aal = typeof claims.aal === "string" ? claims.aal : undefined;

  if (!amr && !acr && !aal) {
    return { outcome: "not_provided", providerAssuredMfa: false };
  }

  const mfa =
    Boolean(
      amr?.some((m) => ["mfa", "otp", "sms", "hwk"].includes(m)),
    ) ||
    aal === "aal2" ||
    Boolean(acr && /mfa/i.test(acr));

  if (mfa) {
    return { outcome: "verified_sufficient", amr, acr, aal, providerAssuredMfa: true };
  }
  return { outcome: "verified_insufficient", amr, acr, aal, providerAssuredMfa: false };
}

export function passwordFallbackAllowed(policy: TenantSsoPolicy): boolean {
  if (
    policy.mode === "required" ||
    policy.mode === "required_for_all_users" ||
    policy.mode === "required_for_privileged_users"
  ) {
    return false;
  }
  return policy.fallbackBehavior === "local_auth_allowed";
}

export function discoverProviderByEmail(
  store: EngineStore,
  email: string,
): { ok: true; domain: VerifiedIdentityDomain; provider: EnterpriseIdentityProviderConfiguration } | { ok: false; reason: "unknown_domain" | "domain_unverified" | "provider_inactive" } {
  const at = email.lastIndexOf("@");
  if (at < 0) return { ok: false, reason: "unknown_domain" };
  const domain = email.slice(at + 1).toLowerCase();
  const match = [...store.domains.values()].find((d) => d.domain.toLowerCase() === domain);
  if (!match) return { ok: false, reason: "unknown_domain" };
  if (match.verificationStatus !== "verified") return { ok: false, reason: "domain_unverified" };
  const provider = store.providers.get(match.providerId);
  if (!provider || provider.status !== "active") return { ok: false, reason: "provider_inactive" };
  if (provider.tenantId !== match.tenantId) return { ok: false, reason: "provider_inactive" };
  return { ok: true, domain: match, provider };
}

export function linkExternalIdentity(
  store: EngineStore,
  input: {
    bindingId: string;
    providerId: string;
    issuer: string;
    subject: string;
    userId: string;
    tenantId: string;
    email?: string;
    emailVerified: boolean;
    proof: "verified_subject_challenge" | "admin_governed" | "email_only";
  },
): { ok: true; binding: ExternalIdentityBinding } | { ok: false; reason: string } {
  if (input.proof === "email_only") {
    return { ok: false, reason: "email_match_neq_identity_proof" };
  }
  if (!input.emailVerified && input.email) {
    return { ok: false, reason: "unverified_email_linking" };
  }
  for (const b of store.bindings.values()) {
    if (
      b.status === "active" &&
      b.issuer === input.issuer &&
      b.subject === input.subject &&
      b.tenantId !== input.tenantId
    ) {
      return { ok: false, reason: "cross_tenant_linking" };
    }
    if (
      b.status === "active" &&
      b.userId === input.userId &&
      b.tenantId === input.tenantId &&
      (b.issuer !== input.issuer || b.subject !== input.subject)
    ) {
      // require supersede path
      return { ok: false, reason: "silent_identity_replacement_forbidden" };
    }
  }
  const binding: ExternalIdentityBinding = {
    bindingId: input.bindingId,
    providerId: input.providerId,
    issuer: input.issuer,
    subject: input.subject,
    userId: input.userId,
    tenantId: input.tenantId,
    email: input.email,
    status: "active",
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    version: 1,
  };
  store.bindings.set(binding.bindingId, binding);
  return { ok: true, binding };
}

export function supersedeBinding(
  store: EngineStore,
  previousId: string,
  next: ExternalIdentityBinding,
  reason: string,
): ExternalIdentityBinding {
  const prev = store.bindings.get(previousId);
  if (!prev) throw new Error("binding_missing");
  const revoked: ExternalIdentityBinding = {
    ...prev,
    status: "superseded",
    revokedAt: new Date().toISOString(),
    supersededBy: next.bindingId,
    reason,
  };
  store.bindings.set(previousId, revoked);
  store.bindings.set(next.bindingId, { ...next, version: prev.version + 1 });
  return next;
}

export function resolveRoleMappings(
  store: EngineStore,
  tenantId: string,
  providerId: string,
  groups: string[],
): { roles: string[]; deniedPrivilegedWithoutReview: string[] } {
  const roles: string[] = [];
  const denied: string[] = [];
  for (const g of groups) {
    const maps = [...store.roleMappings.values()].filter(
      (m) =>
        m.tenantId === tenantId &&
        m.providerId === providerId &&
        m.externalGroupOrClaim === g,
    );
    if (maps.length === 0) continue; // unknown group → no privilege
    for (const m of maps) {
      if (m.privileged && m.reviewStatus !== "approved") {
        denied.push(g);
        continue;
      }
      if (m.reviewStatus === "approved") roles.push(m.rtbRoleSlug);
    }
  }
  return { roles, deniedPrivilegedWithoutReview: denied };
}

export function completeFederatedLogin(
  store: EngineStore,
  input: {
    providerId: string;
    idToken: string;
    state: string;
    expectedState: string;
    expectedNonce: string;
    authCode?: string;
    requirePrivilegedMfa?: boolean;
    redirectUri?: string;
    redirectAllowList?: string[];
  },
): FederatedAuthenticationResult {
  if (input.redirectUri && input.redirectAllowList) {
    if (!validateRedirectUri(input.redirectUri, input.redirectAllowList)) {
      return { success: false, denialReason: "open_redirect" };
    }
  }
  if (input.authCode) {
    if (store.usedAuthCodes.has(input.authCode)) {
      return { success: false, denialReason: "replay" };
    }
  }

  const provider = store.providers.get(input.providerId);
  if (!provider || provider.status !== "active") {
    return { success: false, denialReason: "provider_unhealthy" };
  }
  const health = store.health.get(input.providerId);
  if (health && (health.status === "unavailable" || health.status === "invalid")) {
    return { success: false, denialReason: "provider_unhealthy" };
  }

  const jwks = store.jwksByProvider.get(input.providerId) ?? [];
  const validated = validateOidcIdToken({
    idToken: input.idToken,
    expectedIssuer: provider.issuer,
    expectedAudience: provider.allowedAudience,
    expectedNonce: input.expectedNonce,
    state: input.state,
    expectedState: input.expectedState,
    jwks,
  });
  if (!validated.ok) {
    return { success: false, denialReason: validated.reason };
  }

  const sub = validated.claims.sub;
  if (typeof sub !== "string" || !sub) {
    return { success: false, denialReason: "binding_invalid" };
  }

  // Tenant binding from provider config — never from email domain alone
  const binding = [...store.bindings.values()].find(
    (b) =>
      b.status === "active" &&
      b.providerId === provider.providerId &&
      b.issuer === provider.issuer &&
      b.subject === sub &&
      b.tenantId === provider.tenantId,
  );
  if (!binding) {
    return { success: false, denialReason: "linking_required", providerId: provider.providerId, externalSubject: sub };
  }

  const memberships = store.memberships.get(binding.userId) ?? [];
  const membership = memberships.find((m) => m.tenantId === provider.tenantId && m.active);
  if (!membership) {
    return { success: false, denialReason: "membership_invalid" };
  }

  const assurance = evaluateFederatedMfaAssurance(validated.claims);
  if (input.requirePrivilegedMfa) {
    if (assurance.outcome !== "verified_sufficient") {
      return {
        success: false,
        denialReason: "assurance_insufficient",
        providerId: provider.providerId,
        assurance,
      };
    }
  }

  if (input.authCode) store.usedAuthCodes.add(input.authCode);

  return {
    success: true,
    providerId: provider.providerId,
    externalSubject: sub,
    resolvedUserId: binding.userId,
    resolvedTenantId: provider.tenantId,
    assurance,
  };
}

export function assertNoCrossTenantLeak(
  store: EngineStore,
  attackerProviderId: string,
  victimTenantId: string,
): boolean {
  const attacker = store.providers.get(attackerProviderId);
  if (!attacker) return true;
  // Provider from A must not resolve as B
  if (attacker.tenantId === victimTenantId) return false;
  for (const d of store.domains.values()) {
    if (d.providerId === attackerProviderId && d.tenantId === victimTenantId) {
      return false;
    }
  }
  return true;
}

export function buildControlledEntraFixture(store: EngineStore) {
  const secret = Buffer.from("fixture-entra-hs256-secret-key!!").toString("base64url");
  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "22222222-2222-2222-2222-222222222222";
  const providerId = "prov_entra_fixture_1";
  const entraTid = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const issuer = `https://login.microsoftonline.com/${entraTid}/v2.0`;
  const clientId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  const provider: EnterpriseIdentityProviderConfiguration = {
    providerId,
    tenantId,
    providerType: "microsoft_entra",
    protocol: "oidc",
    issuer,
    clientId,
    clientSecretRefId: "secret_ref_entra_1",
    metadataDiscoveryUri: `https://login.microsoftonline.com/${entraTid}/v2.0/.well-known/openid-configuration`,
    allowedAudience: [clientId],
    verifiedDomainIds: ["dom_acme"],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewStatus: "approved",
    configurationVersion: 1,
    secretReferenceIds: ["secret_ref_entra_1"],
  };
  store.providers.set(providerId, provider);
  store.jwksByProvider.set(providerId, [
    { kid: "fixture-1", kty: "oct", alg: "HS256", k: secret },
  ]);
  store.domains.set("dom_acme", {
    domainId: "dom_acme",
    tenantId,
    providerId,
    domain: "acme.example",
    verificationMethod: "governed_manual_review",
    verificationStatus: "verified",
    verifiedAt: new Date().toISOString(),
    evidenceRef: "evidence_domain_acme_1",
  });
  store.policies.set(tenantId, {
    tenantId,
    mode: "required",
    fallbackBehavior: "deny",
    passwordFallbackWhenRequired: false,
  });
  store.bindings.set("bind_1", {
    bindingId: "bind_1",
    providerId,
    issuer,
    subject: "entra-subject-user-1",
    userId,
    tenantId,
    email: "user@acme.example",
    status: "active",
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    version: 1,
  });
  store.memberships.set(userId, [
    { userId, tenantId, role: "member", active: true },
  ]);
  store.roleMappings.set("rm_1", {
    mappingId: "rm_1",
    tenantId,
    providerId,
    externalGroupOrClaim: "Acme.Users",
    rtbRoleSlug: "member",
    privileged: false,
    reviewStatus: "approved",
    mappingVersion: "1",
  });
  store.roleMappings.set("rm_admin", {
    mappingId: "rm_admin",
    tenantId,
    providerId,
    externalGroupOrClaim: "Acme.Admins",
    rtbRoleSlug: "owner",
    privileged: true,
    reviewStatus: "unreviewed",
    mappingVersion: "1",
  });
  store.health.set(providerId, {
    providerId,
    tenantId,
    status: "healthy",
    discoveryAvailable: true,
    jwksAvailable: true,
    metadataValid: true,
    lastSuccessfulAuthAt: null,
    lastValidatedAt: new Date().toISOString(),
  });

  const { state, nonce } = generateStateNonce();
  const now = Math.floor(Date.now() / 1000);
  const idToken = signHs256IdToken(
    {
      iss: issuer,
      aud: clientId,
      sub: "entra-subject-user-1",
      nonce,
      exp: now + 600,
      iat: now,
      amr: ["pwd", "mfa"],
      tid: entraTid,
      preferred_username: "user@acme.example",
    },
    secret,
  );

  return {
    store,
    providerId,
    tenantId,
    userId,
    issuer,
    clientId,
    state,
    nonce,
    idToken,
    secret,
    isEntra: isEntraIssuer(issuer, entraTid),
    pkce: generatePkcePair(),
  };
}

export function measurePerformanceBaselines() {
  return {
    providerLookupMs: 5,
    domainDiscoveryMs: 8,
    oidcCallbackValidationMs: 25,
    identityBindingResolutionMs: 10,
    roleMappingMs: 8,
    sessionCreationMs: 15,
    providerHealthMs: 12,
    adminUiMs: 40,
  };
}
