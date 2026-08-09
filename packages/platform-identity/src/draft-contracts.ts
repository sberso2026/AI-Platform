/**
 * Phase 16A draft public contracts — 0.1.0-draft only.
 * Not frozen. No database / runtime persistence.
 */

export type EnterpriseIdentityProviderReference = {
  providerId: string;
  tenantId: string;
  providerType: "microsoft_entra" | "okta" | "google_workspace" | "generic_oidc" | "generic_saml";
  protocol: "oidc" | "saml2";
  status: "draft" | "configured" | "verified" | "enabled" | "disabled" | "unhealthy";
};

export type EnterpriseIdentityProviderConfiguration = {
  providerId: string;
  tenantId: string;
  workspaceScope?: string | null;
  providerType: EnterpriseIdentityProviderReference["providerType"];
  protocol: "oidc" | "saml2";
  issuer: string;
  clientApplicationRef: string;
  allowedDomains: string[];
  claimMappings: IdentityClaimMapping[];
  roleMappingPolicyId?: string;
  status: EnterpriseIdentityProviderReference["status"];
  createdAt: string;
  reviewStatus: "unreviewed" | "approved" | "rejected" | "expired";
  metadataVersion: string;
  /** Secrets/certs live in platform secrets — never plaintext here. */
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
  domain: string;
  verificationMethod: "dns_txt" | "https_well_known" | "admin_confirmed_manual_review";
  verifiedAt: string | null;
  status: "pending" | "verified" | "revoked" | "expired";
};

export type ExternalIdentityReference = {
  externalSubject: string;
  providerId: string;
  issuer: string;
  email?: string;
  emailVerified: boolean;
  linkedUserId?: string;
  tenantId: string;
};

export type IdentityClaimMapping = {
  mappingId: string;
  providerId: string;
  sourceClaim: string;
  targetAttribute:
    | "email"
    | "display_name"
    | "groups"
    | "assurance"
    | "custom";
  transform?: string;
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

export type FederatedAuthenticationResult = {
  success: boolean;
  providerId: string;
  externalSubject?: string;
  resolvedUserId?: string;
  resolvedTenantId?: string;
  assurance?: {
    amr?: string[];
    acr?: string;
    aal?: string;
    providerAssuredMfa: boolean;
  };
  denialReason?:
    | "issuer_invalid"
    | "audience_invalid"
    | "tenant_mismatch"
    | "domain_unverified"
    | "policy_denied"
    | "linking_required"
    | "assurance_insufficient"
    | "provider_unhealthy";
};

export type EnterpriseIdentityHealth = {
  providerId: string;
  tenantId: string;
  healthy: boolean;
  lastValidatedAt: string | null;
  metadataReachable: boolean;
  jwksReachable?: boolean;
  limitations?: string[];
};

export const PLATFORM_ENTERPRISE_IDENTITY_DRAFT_CONTRACTS = [
  "EnterpriseIdentityProviderReference",
  "EnterpriseIdentityProviderConfiguration",
  "TenantSsoPolicy",
  "VerifiedIdentityDomain",
  "ExternalIdentityReference",
  "IdentityClaimMapping",
  "EnterpriseRoleMapping",
  "FederatedAuthenticationResult",
  "EnterpriseIdentityHealth",
] as const;
