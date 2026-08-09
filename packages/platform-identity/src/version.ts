/**
 * Phase 16A — Platform Enterprise Identity / Customer SSO Discovery.
 * Discovery / architecture lock only. Not production SSO.
 */
export const PLATFORM_IDENTITY_VERSION = "0.1.0-enterprise-sso-discovery" as const;
export const PLATFORM_IDENTITY_STATUS = "discovery" as const;
export const PLATFORM_IDENTITY_PHASE = "16A" as const;

export const PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION =
  "0.1.0-draft" as const;

/** Certified Security & Assurance V1.0 baseline (immutable). */
export const SECURITY_ASSURANCE_V1_TAG = "security-assurance-v1.0.0" as const;
export const SECURITY_ASSURANCE_V1_COMMIT =
  "cf3e9eff49c1314ea16e115dcde26cd45e520121" as const;

/** Engineering OS V1.0 GA baseline (immutable). */
export const ENGINEERING_OS_V1_TAG = "engineering-os-v1.0.0" as const;
export const ENGINEERING_OS_V1_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PLATFORM_IDENTITY_V1_SEMANTICS = {
  authenticatedExternallyNeqAuthorizedInternally: true,
  ssoEnabledNeqMfaVerified: true,
  emailMatchNeqIdentityProof: true,
  domainMatchNeqTenantAuthorization: true,
  idpGroupNeqRtbPermission: true,
  jitUserNeqPrivilegedUser: true,
  ssoProviderConfiguredNeqProviderHealthy: true,
  ssoRequiredNeqPasswordFallback: true,
} as const;
