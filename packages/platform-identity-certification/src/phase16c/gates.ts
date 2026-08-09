/**
 * Phase 16C certification gates — Tier-1 external pen-test readiness.
 */
export const PHASE_16C_TIER1_PEN_TEST_READINESS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 16B baseline intact"],
  ["C", "Security & Assurance V1 tag intact"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.3.0-pen-test-readiness"],
  ["G", "Attack-surface inventory"],
  ["H", "Scope document"],
  ["I", "Rules of engagement"],
  ["J", "Environment readiness"],
  ["K", "Tenant fixtures"],
  ["L", "SSO surface preserved"],
  ["M", "Authorization/IDOR categories"],
  ["N", "API surface categories"],
  ["O", "Web surface methodology"],
  ["P", "AI surface categories"],
  ["Q", "File/artifact surface"],
  ["R", "Execution host surface"],
  ["S", "Security & Assurance surface"],
  ["T", "Logging evidence requirements"],
  ["U", "Prohibited testing"],
  ["V", "Severity model"],
  ["W", "Finding governance"],
  ["X", "Remediation workflow"],
  ["Y", "Retest criteria"],
  ["Z", "S07 closure criteria locked"],
  ["AA", "External assurance integration"],
  ["AB", "Customer-assurance boundary"],
  ["AC", "Tester selection criteria"],
  ["AD", "Evidence/assessor package"],
  ["AE", "Environment parity"],
  ["AF", "Operations during test"],
  ["AG", "Post-test cleanup"],
  ["AH", "Engagement mode documented"],
  ["AI", "S08 preserved true"],
  ["AJ", "S07 remains false"],
  ["AK", "Tier1 remains false"],
  ["AL", "No fake external pen-test result"],
  ["AM", "No internal pen-test opinion"],
  ["AN", "Readiness flags true"],
  ["AO", "Frozen integrity flags"],
  ["AP", "Public contracts still 0.2.0-enterprise-sso"],
  ["AQ", "Secret scan"],
  ["AR", "Unit tests"],
  ["AS", "Architecture test"],
  ["AT", "Browser readiness marker"],
  ["AU", "Workflow exists"],
  ["AV", "Artifact identity"],
  ["AW", "releaseEligible"],
  ["AX", "ExternalPenTestReadinessReady"],
] as const;

export type Phase16cGateId =
  (typeof PHASE_16C_TIER1_PEN_TEST_READINESS_GATES)[number][0];

export const PHASE_16C_GATE_COUNT =
  PHASE_16C_TIER1_PEN_TEST_READINESS_GATES.length;

export const PHASE_16C_VERSION = "0.3.0-pen-test-readiness" as const;
export const PHASE_16B_BASELINE =
  "0078c9b67021b695c5a4137905247818dd945d83" as const;
export const PHASE_16C_SA_TAG = "security-assurance-v1.0.0" as const;
export const PHASE_16C_SA_COMMIT =
  "cf3e9eff49c1314ea16e115dcde26cd45e520121" as const;
export const PHASE_16C_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_16C_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;
export const PHASE_16C_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_16C_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_16C_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_16C_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_16C_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_16C_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
