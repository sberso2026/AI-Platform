/**
 * Phase 14D certification gates A–BL — Engineering OS Pre-GA Security Closure.
 */
export const PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 14C baseline intact"],
  ["C", "Phase 14B product integration intact"],
  ["D", "Frozen V1 tags intact"],
  ["E", "Version 0.12.0-security-closure"],
  ["F", "S01 privileged MFA policy"],
  ["G", "S01 privileged MFA enforcement"],
  ["H", "S01 break-glass governance"],
  ["I", "S01 break-glass audit"],
  ["J", "S02 dependency SCA ready"],
  ["K", "S02 SCA CI enforced"],
  ["L", "S02 critical unresolved false"],
  ["M", "S03 unified incident response"],
  ["N", "S03 incident runbook"],
  ["O", "S03 incident fixtures"],
  ["P", "S04 secret lifecycle"],
  ["Q", "S04 rotation procedure"],
  ["R", "S04 emergency revocation"],
  ["S", "S04 secret scan clean"],
  ["T", "S05 classification AI policy"],
  ["U", "S05 classification AI enforcement"],
  ["V", "S05 sensitive logging policy"],
  ["W", "S05 sensitive logging enforcement"],
  ["X", "S05 Policy Engine reuse"],
  ["Y", "S05 AI Runtime reuse"],
  ["Z", "S06 backup procedure"],
  ["AA", "S06 restore test passed"],
  ["AB", "S06 backup integrity"],
  ["AC", "S06 RPO status known"],
  ["AD", "S06 RTO status known"],
  ["AE", "Gap register S01–S06 CLOSED"],
  ["AF", "REQUIRED_BEFORE_GA open = 0"],
  ["AG", "Readiness matrix updated"],
  ["AH", "engineeringOsSecurityGaGatePassed true"],
  ["AI", "securityClosureRequiredBeforeGa false"],
  ["AJ", "productionEngineeringOSReady false"],
  ["AK", "engineeringOSV1GaCertified false"],
  ["AL", "knownCrossTenantLeakageDetected false"],
  ["AM", "implementsOwnAiStack false"],
  ["AN", "duplicatePolicyEngineDetected false"],
  ["AO", "Phase14CSecurityBaselineIntact"],
  ["AP", "Phase14BProductIntegrationIntact"],
  ["AQ", "FrozenV1ModulesIntact"],
  ["AR", "No Security & Assurance package"],
  ["AS", "No Trust Center package"],
  ["AT", "Unit tests"],
  ["AU", "Dependency SCA run"],
  ["AV", "Platform restore certification"],
  ["AW", "Secret scan"],
  ["AX", "Workflow exists"],
  ["AY", "Platform architecture test"],
  ["AZ", "S07 remains Tier-1"],
  ["BA", "S08 remains Tier-1"],
  ["BB", "External assurance not claimed"],
  ["BC", "phase14EReady"],
  ["BD", "Middleware privileged MFA hook"],
  ["BE", "Incident evidence preservation"],
  ["BF", "Artifact identity"],
  ["BG", "releaseEligible"],
  ["BH", "SCA report artifact"],
  ["BI", "Restore artifact"],
  ["BJ", "Gap register GA decision flipped"],
  ["BK", "No ISO/SOC claims"],
  ["BL", "Security closure overview"],
] as const;

export type Phase14dGateId =
  (typeof PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES)[number][0];

export const PHASE_14D_GATE_COUNT =
  PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES.length;

export const PHASE_14D_EOS_VERSION = "0.12.0-security-closure" as const;
export const PHASE_14C_COMMIT =
  "5fd29af093e009e7e2aaf961c797141f452cc1c2" as const;
export const PHASE_14B_COMMIT =
  "70ae39837ac9e2cd3039b344ca083004884238c6" as const;

export const PHASE_14D_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_14D_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_14D_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_14D_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_14D_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_14D_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
