/**
 * Phase 15I — Security & Assurance V1.0 Production GA.
 * First allowed use of Security & Assurance 1.0.0.
 */
export const SECURITY_ASSURANCE_VERSION = "1.0.0" as const;
export const SECURITY_ASSURANCE_STATUS = "ga" as const;
export const SECURITY_ASSURANCE_PHASE = "15I" as const;

export const SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION = "1.0.0" as const;
export const SecurityAssurancePublicContractsVersion = "1.0.0" as const;
export const SecurityAssurancePublicContractsFrozen = true as const;
/** Alias retained for Phase 15H readiness lineage. */
export const SecurityAssurancePublicContractsFrozenAt1_0_0 = true as const;

export const SECURITY_ASSURANCE_RELEASE_TAG =
  "security-assurance-v1.0.0" as const;
export const releaseTagMoved = false as const;

export const SecurityAssuranceManifestFrozen = true as const;
export const SecurityAssuranceV1GaCertified = true as const;
export const securityAssuranceV1GaCertified = true as const;
export const SecurityAssuranceV1Frozen = true as const;
export const productionSecurityAssuranceReady = true as const;

/** Immutable Phase 15H GA-readiness baseline. */
export const PHASE_15H_BASELINE_COMMIT =
  "e1d2d72170c3fa47bc2dddcd13b596890387666f" as const;
export const PHASE_15H_BASELINE_HOSTED_RUN = "31307998599" as const;
export const PHASE_15H_BASELINE_VERSION = "0.8.0-ga-readiness" as const;
export const SECURITY_ASSURANCE_PREVIOUS_VERSION =
  "0.8.0-ga-readiness" as const;

/** Immutable Phase 15G customer-assurance baseline. */
export const PHASE_15G_BASELINE_COMMIT =
  "a7b309fbb556ed96f03a8e1c206955e54d90f1b2" as const;
export const PHASE_15G_BASELINE_HOSTED_RUN = "31307150624" as const;
export const PHASE_15G_BASELINE_VERSION = "0.7.0-customer-assurance" as const;

/** Immutable Phase 15F compliance-intelligence baseline. */
export const PHASE_15F_BASELINE_COMMIT =
  "924b2eaa7f6bfc635d742c5310cff3a22ed5d446" as const;
export const PHASE_15F_BASELINE_HOSTED_RUN = "31306360885" as const;
export const PHASE_15F_BASELINE_VERSION = "0.6.0-compliance-intelligence" as const;

/** Immutable Phase 15E secure-compute baseline. */
export const PHASE_15E_BASELINE_COMMIT =
  "aa5150fc4acf287b50c973220c40d62b7f91687f" as const;
export const PHASE_15E_BASELINE_HOSTED_RUN = "31305116039" as const;
export const PHASE_15E_BASELINE_VERSION = "0.5.0-secure-compute" as const;

/** Immutable Phase 15D AI/data security baseline. */
export const PHASE_15D_BASELINE_COMMIT =
  "ef8efd2b4b30082e9c26ac867c65c51e3e39d207" as const;
export const PHASE_15D_BASELINE_HOSTED_RUN = "31301585089" as const;
export const PHASE_15D_BASELINE_VERSION = "0.4.0-ai-data-security" as const;

/** Immutable Phase 15C isolation baseline. */
export const PHASE_15C_BASELINE_COMMIT =
  "897383f5a95cf81847ee866c1c1fdac5012b25a5" as const;
export const PHASE_15C_BASELINE_HOSTED_RUN = "31300864126" as const;
export const PHASE_15C_BASELINE_VERSION = "0.3.0-isolation-assurance" as const;

/** Immutable Phase 15B foundation baseline. */
export const PHASE_15B_BASELINE_COMMIT =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15B_BASELINE_HOSTED_RUN = "31300106081" as const;
export const PHASE_15B_BASELINE_VERSION = "0.2.0-control-evidence" as const;

/** Immutable Phase 15A discovery baseline. */
export const PHASE_15A_BASELINE_COMMIT =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15A_BASELINE_HOSTED_RUN = "31298991321" as const;
export const PHASE_15A_BASELINE_VERSION = "0.1.0-discovery" as const;

/** Engineering OS V1.0 GA baseline (immutable). */
export const ENGINEERING_OS_V1_TAG = "engineering-os-v1.0.0" as const;
export const ENGINEERING_OS_V1_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;
export const ENGINEERING_OS_V1_HOSTED_RUN = "31298241500" as const;

/** V1 semantic invariants (fail-closed). */
export const SECURITY_ASSURANCE_V1_SEMANTICS = {
  controlDefinedNeqImplemented: true,
  controlImplementedNeqEffective: true,
  evidencePresentNeqSufficient: true,
  staleEvidenceNeqCurrentAssurance: true,
  automatedEvidenceNeqIndependentAssurance: true,
  frameworkMappingNeqCertification: true,
  findingNeqIncident: true,
  exceptionNeqRemediation: true,
  postureNeqCertification: true,
  customerAssuranceNeqCertification: true,
  absenceOfEvidenceIsUnknown: true,
  unknownDisclosureFailClosed: true,
  SecurityEvidenceProvenanceEnforced: true,
  SecurityEvidenceFreshnessEnforced: true,
  universalSecurityScorePresent: false,
  internalEvidenceCannotSatisfyIndependentAssurance: true,
} as const;
