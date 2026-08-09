/**
 * Phase 16C.1 — Internal adversarial security validation & S07 deferral.
 * Does NOT complete S07. Does NOT substitute for independent external pen test.
 */
export const PLATFORM_IDENTITY_VERSION = "0.3.1-internal-adversarial" as const;
export const PLATFORM_IDENTITY_STATUS = "internal_adversarial" as const;
export const PLATFORM_IDENTITY_PHASE = "16C.1" as const;

export const PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION =
  "0.2.0-enterprise-sso" as const;

/** Phase 16C pen-test readiness baseline (immutable). */
export const PHASE_16C_BASELINE_COMMIT =
  "2999b103d35ce600ced3a15f2e39eef146c48236" as const;
export const PHASE_16C_BASELINE_HOSTED_RUN = "31311869194" as const;
export const PHASE_16C_BASELINE_VERSION = "0.3.0-pen-test-readiness" as const;

/** Phase 16B enterprise SSO baseline (immutable). */
export const PHASE_16B_BASELINE_COMMIT =
  "0078c9b67021b695c5a4137905247818dd945d83" as const;
export const PHASE_16B_BASELINE_HOSTED_RUN = "31310620360" as const;
export const PHASE_16B_BASELINE_VERSION = "0.2.0-enterprise-sso" as const;

/** Phase 16A discovery baseline (immutable). */
export const PHASE_16A_BASELINE_COMMIT =
  "af1e0425c77c516d4cf99a42d5e3eab9bee7206e" as const;
export const PHASE_16A_BASELINE_HOSTED_RUN = "31309905950" as const;
export const PHASE_16A_BASELINE_VERSION =
  "0.1.0-enterprise-sso-discovery" as const;

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
  passwordFallbackWhenRequired: false,
  externalFindingNeqSelfAssessment: true,
  internalTestsCannotSatisfyS07: true,
  internalAdversarialNeqExternalPenTest: true,
} as const;
