/**
 * Phase 16B certification gates — Platform Enterprise SSO / S08 closure.
 */
export const PHASE_16B_PLATFORM_ENTERPRISE_SSO_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 16A baseline intact"],
  ["C", "Security & Assurance V1 tag intact"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.2.0-enterprise-sso"],
  ["G", "Ownership locked"],
  ["H", "Provider configuration"],
  ["I", "OIDC federation"],
  ["J", "Entra first-class"],
  ["K", "Issuer validation"],
  ["L", "Audience validation"],
  ["M", "JWKS/signature validation"],
  ["N", "State validation"],
  ["O", "Nonce validation"],
  ["P", "PKCE support"],
  ["Q", "SSO policy"],
  ["R", "Password fallback denial"],
  ["S", "Domain verification"],
  ["T", "Discovery"],
  ["U", "Identity binding"],
  ["V", "Binding history"],
  ["W", "Account linking"],
  ["X", "Tenant/user resolution"],
  ["Y", "JIT boundary"],
  ["Z", "Role mapping"],
  ["AA", "MFA assurance"],
  ["AB", "Session lifecycle"],
  ["AC", "Logout"],
  ["AD", "Offboarding"],
  ["AE", "Provider health"],
  ["AF", "Tenant isolation"],
  ["AG", "Issuer/audience confusion"],
  ["AH", "Key rotation posture"],
  ["AI", "Customer UI"],
  ["AJ", "Admin UI marker"],
  ["AK", "Audit"],
  ["AL", "Events"],
  ["AM", "Security & Assurance evidence boundary"],
  ["AN", "S08 closure"],
  ["AO", "S07 preservation"],
  ["AP", "SAML boundary"],
  ["AQ", "SCIM boundary"],
  ["AR", "Secrets"],
  ["AS", "Migration batch_96"],
  ["AT", "RLS"],
  ["AU", "Operations doc"],
  ["AV", "Threat-model regression"],
  ["AW", "Performance baselines"],
  ["AX", "Unit tests"],
  ["AY", "Secret scan"],
  ["AZ", "Browser E2E"],
  ["BA", "Accessibility"],
  ["BB", "Responsive"],
  ["BC", "Workflow exists"],
  ["BD", "Architecture test"],
  ["BE", "Anti-duplication"],
  ["BF", "Frozen integrity flags"],
  ["BG", "nearFinalTier1AttackSurface"],
  ["BH", "Tier1 still false"],
  ["BI", "Artifact identity"],
  ["BJ", "releaseEligible"],
  ["BK", "phase16CReady"],
  ["BL", "No package 1.0.0"],
  ["BM", "Controlled Entra not fabricated live claim"],
] as const;

export type Phase16bGateId =
  (typeof PHASE_16B_PLATFORM_ENTERPRISE_SSO_GATES)[number][0];

export const PHASE_16B_GATE_COUNT = PHASE_16B_PLATFORM_ENTERPRISE_SSO_GATES.length;

export const PHASE_16B_VERSION = "0.2.0-enterprise-sso" as const;
export const PHASE_16A_BASELINE =
  "af1e0425c77c516d4cf99a42d5e3eab9bee7206e" as const;
export const PHASE_16B_SA_TAG = "security-assurance-v1.0.0" as const;
export const PHASE_16B_SA_COMMIT =
  "cf3e9eff49c1314ea16e115dcde26cd45e520121" as const;
export const PHASE_16B_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_16B_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;
export const PHASE_16B_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_16B_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_16B_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_16B_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_16B_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_16B_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
