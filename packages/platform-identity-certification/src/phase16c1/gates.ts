/**
 * Phase 16C.1 certification gates — internal adversarial security & S07 deferral.
 */
export const PHASE_16C1_INTERNAL_ADVERSARIAL_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 16C baseline intact"],
  ["C", "Phase 16B / S08 preserved"],
  ["D", "Security & Assurance V1 tag intact"],
  ["E", "Engineering OS V1 tag intact"],
  ["F", "Frozen module tags intact"],
  ["G", "Version 0.3.1-internal-adversarial"],
  ["H", "S07 deferral documented"],
  ["I", "S07 not waived"],
  ["J", "External pen test still required for Tier-1"],
  ["K", "S07 remains false"],
  ["L", "ExternalPenTestPerformed false"],
  ["M", "Independent opinion not issued"],
  ["N", "Tier1 remains false"],
  ["O", "S08 remains true"],
  ["P", "16C readiness artifacts preserved"],
  ["Q", "Internal validation docs"],
  ["R", "Test matrix"],
  ["S", "Findings register"],
  ["T", "Regression runbook"],
  ["U", "Adversarial suite ready"],
  ["V", "Tenant A/B fixtures"],
  ["W", "Zero open CRITICAL"],
  ["X", "Zero open HIGH"],
  ["Y", "Adversarial suite execution"],
  ["Z", "knownCrossTenantLeakageDetected false"],
  ["AA", "Non-claim semantics"],
  ["AB", "Frozen integrity flags"],
  ["AC", "Public contracts still 0.2.0-enterprise-sso"],
  ["AD", "Secret scan"],
  ["AE", "Unit tests"],
  ["AF", "Architecture test"],
  ["AG", "Browser marker"],
  ["AH", "Workflow exists"],
  ["AI", "SCA audit informational"],
  ["AJ", "Artifact identity"],
  ["AK", "releaseEligible"],
  ["AL", "InternalAdversarialSecurityValidationReady"],
] as const;

export type Phase16c1GateId =
  (typeof PHASE_16C1_INTERNAL_ADVERSARIAL_GATES)[number][0];

export const PHASE_16C1_GATE_COUNT =
  PHASE_16C1_INTERNAL_ADVERSARIAL_GATES.length;

export const PHASE_16C1_VERSION = "0.3.1-internal-adversarial" as const;
export const PHASE_16C_BASELINE =
  "2999b103d35ce600ced3a15f2e39eef146c48236" as const;
export const PHASE_16B_BASELINE =
  "0078c9b67021b695c5a4137905247818dd945d83" as const;
export const PHASE_16C1_SA_TAG = "security-assurance-v1.0.0" as const;
export const PHASE_16C1_SA_COMMIT =
  "cf3e9eff49c1314ea16e115dcde26cd45e520121" as const;
export const PHASE_16C1_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_16C1_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;
export const PHASE_16C1_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_16C1_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_16C1_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_16C1_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_16C1_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_16C1_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
