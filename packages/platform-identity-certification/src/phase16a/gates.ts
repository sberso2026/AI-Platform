/**
 * Phase 16A certification gates — Platform Enterprise SSO Discovery.
 */
export const PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Security & Assurance V1 tag intact"],
  ["C", "Engineering OS V1 tag intact"],
  ["D", "Frozen module tags intact"],
  ["E", "Discovery version 0.1.0-enterprise-sso-discovery"],
  ["F", "Identity footprint inventory"],
  ["G", "Identity ownership locked"],
  ["H", "Protocol strategy locked"],
  ["I", "Entra first-class boundary"],
  ["J", "Provider-neutral architecture"],
  ["K", "Tenant SSO policy"],
  ["L", "Domain verification architecture"],
  ["M", "User/tenant binding"],
  ["N", "Account linking"],
  ["O", "JIT decision"],
  ["P", "SCIM decision"],
  ["Q", "Role/group mapping"],
  ["R", "MFA assurance"],
  ["S", "Conditional Access boundary"],
  ["T", "Session security"],
  ["U", "Offboarding"],
  ["V", "Break-glass boundary"],
  ["W", "Multi-tenant IdP isolation"],
  ["X", "Security & Assurance evidence boundary"],
  ["Y", "Audit reuse"],
  ["Z", "Events reuse"],
  ["AA", "Threat model"],
  ["AB", "Fail-closed semantics"],
  ["AC", "Customer UX"],
  ["AD", "Admin UX"],
  ["AE", "Commercial boundary"],
  ["AF", "S07 sequencing"],
  ["AG", "Tier-1 readiness flags false"],
  ["AH", "Draft contracts 0.1.0-draft"],
  ["AI", "Package placement"],
  ["AJ", "Gap register"],
  ["AK", "Implementation roadmap"],
  ["AL", "Anti-duplication"],
  ["AM", "SecurityAssuranceV1Intact"],
  ["AN", "EngineeringOSV1Intact"],
  ["AO", "Module V1 intact flags"],
  ["AP", "No production SSO runtime"],
  ["AQ", "Unit tests"],
  ["AR", "Secret scan"],
  ["AS", "Workflow exists"],
  ["AT", "Platform architecture test"],
  ["AU", "Phase 16A overview"],
  ["AV", "Ownership matrix UNKNOWN=0"],
  ["AW", "phase16BReady"],
  ["AX", "S08 remains incomplete"],
  ["AY", "S07 remains incomplete"],
  ["AZ", "No Sec&A V1 contract mutation"],
  ["BA", "No EOS V1 mutation"],
  ["BB", "Artifact identity"],
  ["BC", "releaseEligible"],
  ["BD", "Discovery package not 1.0.0"],
  ["BE", "securityAssuranceOwnsCustomerSso=false"],
] as const;

export type Phase16aGateId =
  (typeof PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES)[number][0];

export const PHASE_16A_GATE_COUNT =
  PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES.length;

export const PHASE_16A_VERSION = "0.1.0-enterprise-sso-discovery" as const;
export const PHASE_16A_SA_TAG = "security-assurance-v1.0.0" as const;
export const PHASE_16A_SA_COMMIT =
  "cf3e9eff49c1314ea16e115dcde26cd45e520121" as const;
export const PHASE_16A_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_16A_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;
export const PHASE_16A_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_16A_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_16A_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_16A_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_16A_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_16A_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
