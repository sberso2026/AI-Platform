/**
 * Phase 16B public contracts — 0.2.0-enterprise-sso (not frozen at 1.0.0).
 */

export type ProviderLifecycleStatus =
  | "draft"
  | "pending_verification"
  | "active"
  | "disabled"
  | "invalid"
  | "revoked";

export type EnterpriseIdentityProviderReference = {
  providerId: string;
  tenantId: string;
  providerType: "microsoft_entra" | "generic_oidc" | "saml" | "okta" | "other";
  protocol: "oidc" | "saml2";
  status: ProviderLifecycleStatus;
};

export type EnterpriseIdentityProviderConfiguration = {
  providerId: string;
  tenantId: string;
  providerType: EnterpriseIdentityProviderReference["providerType"];
  protocol: "oidc";
  issuer: string;
  clientId: string;
  clientSecretRefId: string;
  metadataDiscoveryUri?: string;
  allowedAudience: string[];
  verifiedDomainIds: string[];
  claimMappingPolicyRef?: string;
  roleMappingPolicyRef?: string;
  status: ProviderLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  reviewStatus: "unreviewed" | "approved" | "rejected" | "expired";
  configurationVersion: number;
  secretReferenceIds: string[];
};

export type TenantSsoPolicy = {
  tenantId: string;
  mode:
    | "disabled"
    | "optional"
    | "required"
    | "required_for_privileged_users"
    | "required_for_all_users";
  fallbackBehavior:
    | "deny"
    | "local_auth_allowed"
    | "privileged_local_break_glass_only";
  passwordFallbackWhenRequired: false;
};

export type VerifiedIdentityDomain = {
  domainId: string;
  tenantId: string;
  providerId: string;
  domain: string;
  verificationMethod: "dns_txt" | "https_well_known" | "governed_manual_review";
  verificationStatus: "pending" | "verified" | "revoked" | "expired";
  verifiedAt: string | null;
  reviewAt?: string | null;
  evidenceRef?: string;
};

export type ExternalIdentityReference = {
  providerId: string;
  issuer: string;
  subject: string;
  email?: string;
  emailVerified: boolean;
};

export type ExternalIdentityBinding = {
  bindingId: string;
  providerId: string;
  issuer: string;
  subject: string;
  userId: string;
  tenantId: string;
  email?: string;
  displayName?: string;
  lastAuthenticatedAt?: string;
  status: "active" | "revoked" | "superseded";
  createdAt: string;
  verifiedAt: string | null;
  revokedAt?: string | null;
  supersededBy?: string | null;
  reason?: string;
  version: number;
};

export type IdentityClaimMapping = {
  mappingId: string;
  providerId: string;
  sourceClaim: string;
  targetAttribute: "email" | "display_name" | "groups" | "assurance" | "custom";
  mappingVersion: string;
};

export type EnterpriseRoleMapping = {
  mappingId: string;
  tenantId: string;
  providerId: string;
  externalGroupOrClaim: string;
  rtbRoleSlug: string;
  privileged: boolean;
  reviewStatus: "unreviewed" | "approved" | "rejected";
  mappingVersion: string;
};

export type FederatedMfaAssurance = {
  outcome: "verified_sufficient" | "verified_insufficient" | "not_provided" | "unknown";
  amr?: string[];
  acr?: string;
  aal?: string;
  providerAssuredMfa: boolean;
};

export type FederatedAuthenticationResult = {
  success: boolean;
  providerId?: string;
  externalSubject?: string;
  resolvedUserId?: string;
  resolvedTenantId?: string;
  assurance?: FederatedMfaAssurance;
  denialReason?:
    | "issuer_invalid"
    | "audience_invalid"
    | "tenant_mismatch"
    | "domain_unverified"
    | "policy_denied"
    | "linking_required"
    | "assurance_insufficient"
    | "provider_unhealthy"
    | "signature_invalid"
    | "token_expired"
    | "nonce_invalid"
    | "state_invalid"
    | "binding_invalid"
    | "membership_invalid"
    | "replay"
    | "jwks_unavailable"
    | "algorithm_invalid"
    | "open_redirect";
};

export type EnterpriseIdentityHealth = {
  providerId: string;
  tenantId: string;
  status: "healthy" | "degraded" | "unavailable" | "invalid" | "unknown";
  discoveryAvailable: boolean;
  jwksAvailable: boolean;
  metadataValid: boolean;
  lastSuccessfulAuthAt: string | null;
  lastValidatedAt: string | null;
  limitations?: string[];
};

export const PLATFORM_ENTERPRISE_IDENTITY_CONTRACTS_0_2_0 = [
  "EnterpriseIdentityProviderReference",
  "EnterpriseIdentityProviderConfiguration",
  "TenantSsoPolicy",
  "VerifiedIdentityDomain",
  "ExternalIdentityReference",
  "ExternalIdentityBinding",
  "IdentityClaimMapping",
  "EnterpriseRoleMapping",
  "FederatedAuthenticationResult",
  "FederatedMfaAssurance",
  "EnterpriseIdentityHealth",
] as const;
