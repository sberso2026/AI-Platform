/**
 * Phase 16A locked architecture decisions (fixtures for certification).
 * Discovery only — no production federation runtime.
 */

export const PROTOCOL_STRATEGY = {
  primaryV1FederationProtocol: "oidc_oauth2" as const,
  secondaryReservedProtocol: "saml2" as const,
  providerNeutral: true,
  microsoftEntraFirstClass: true,
  microsoftEntraExclusiveHardCodeForbidden: true,
} as const;

export const JIT_DECISION = {
  classification: "OPTIONAL" as const,
  requiredForInitialEnterpriseSso: false,
  deferredPrivilegedAutoGrant: true,
  defaultFederatedRoleBounded: true,
  uncontrolledGroupToAdminMappingForbidden: true,
} as const;

export const SCIM_DECISION = {
  classification: "POST_V1" as const,
  ssoAuthenticationDistinctFromLifecycleProvisioning: true,
  implementedInPhase16A: false,
  mayBecomeCustomerSpecificTier1Procurement: true,
} as const;

export const TENANT_SSO_POLICY_MODES = [
  "disabled",
  "optional",
  "required",
  "required_for_privileged_users",
  "required_for_all_users",
] as const;

export const FAIL_CLOSED_SEMANTICS = {
  authenticatedExternallyNeqAuthorizedInternally: true,
  ssoEnabledNeqMfaVerified: true,
  emailMatchNeqIdentityProof: true,
  domainMatchNeqTenantAuthorization: true,
  idpGroupNeqRtbPermission: true,
  jitUserNeqPrivilegedUser: true,
  ssoProviderConfiguredNeqProviderHealthy: true,
  providerUnavailableNeqPasswordFallbackWhenSsoRequired: true,
} as const;

export const MFA_ASSURANCE_STRATEGY = {
  ssoDoesNotEqualMfa: true,
  consumeAmrAcrAalWhenPresent: true,
  privilegedPathsRemainFailClosed: true,
  phase14dPrivilegedMfaPreserved: true,
  localAdditionalVerificationAllowedWhenRequired: true,
} as const;

export const CONDITIONAL_ACCESS_BOUNDARY = {
  customerIdpMayEnforceDeviceLocationRiskMfaCa: true,
  rtbConsumesAssuranceClaimsWhereAppropriate: true,
  rtbIsNotCustomerConditionalAccessEngine: true,
} as const;

export const PACKAGE_PLACEMENT = {
  ownershipPackage: "@rtb/platform-identity",
  authoritativeAuthRuntime: "@rtb/platform-core + Supabase Auth",
  securityAssuranceSsoPackageForbidden: true,
  engineeringOsSsoPackageForbidden: true,
  customerSsoPlatformPackageForbidden: true,
} as const;

export const S08_MINIMUM_IMPLEMENTATION_SCOPE = [
  "oidc_entra_first_class_federation",
  "tenant_sso_configuration",
  "issuer_audience_validation",
  "domain_verification",
  "claim_mapping",
  "account_linking_governed",
  "tenant_idp_isolation",
  "mfa_assurance_propagation",
  "session_revocation_handling",
  "admin_configuration_surface",
] as const;

export const S07_SEQUENCING = [
  "phase_16a_identity_discovery",
  "sso_implementation_certification",
  "near_final_tier1_deployment_surface",
  "independent_external_penetration_test",
] as const;
