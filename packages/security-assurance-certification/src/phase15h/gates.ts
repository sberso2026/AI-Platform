/**
 * Phase 15H certification gates A–BR — Security & Assurance V1 GA Readiness (70 gates).
 */
export const PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15G baseline intact"],
  ["C", "Phase 15F–15A regression"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.8.0-ga-readiness"],
  ["G", "Status ga_readiness / contracts not 1.0.0"],
  ["H", "Ownership / unknown=0"],
  ["I", "Architecture chain"],
  ["J", "MUST_NEVER_OWN boundary"],
  ["K", "Public contracts review"],
  ["L", "Control/evidence integrity"],
  ["M", "Assessment governance"],
  ["N", "Framework claim safety"],
  ["O", "Customer disclosure / projection"],
  ["P", "External assurance / S07 S08"],
  ["Q", "Tenant isolation / IDOR"],
  ["R", "RLS migration lineage"],
  ["S", "Security flags / anti-automation"],
  ["T", "Anti-duplication"],
  ["U", "Operations runbook"],
  ["V", "Observability health signals"],
  ["W", "Backup/restore truth"],
  ["X", "Upgrade path 0.7.0→1.0.0 candidate"],
  ["Y", "Performance baselines"],
  ["Z", "Commercial packaging"],
  ["AA", "Entitlements server-side"],
  ["AB", "Capability maturity matrix"],
  ["AC", "GA gap register complete"],
  ["AD", "Gap classification no UNKNOWN"],
  ["AE", "Open BLOCKER=0"],
  ["AF", "Open REQUIRED_BEFORE_GA=0"],
  ["AG", "securityAssuranceV1GaReady decision"],
  ["AH", "securityAssuranceV1GaCertified=false"],
  ["AI", "phase15IReady"],
  ["AJ", "Contracts not frozen 1.0.0"],
  ["AK", "UI v1-readiness marker"],
  ["AL", "Unit tests"],
  ["AM", "Secret scan"],
  ["AN", "Browser E2E"],
  ["AO", "Accessibility"],
  ["AP", "Responsive"],
  ["AQ", "Architecture test"],
  ["AR", "Workflow exists"],
  ["AS", "Foundation+Isolation+AI/SC+Compliance+Customer ready"],
  ["AT", "Advanced products unimplemented"],
  ["AU", "EngineeringOSV1Intact"],
  ["AV", "Module V1 intact"],
  ["AW", "No GA-only migration rewrite"],
  ["AX", "Artifact identity"],
  ["AY", "releaseEligible"],
  ["AZ", "CustomerTrustCenterImplemented=false"],
  ["BA", "S07ExternalPenTestComplete=false"],
  ["BB", "S08CustomerSsoProductionReady=false"],
  ["BC", "EOS still 1.0.0"],
  ["BD", "Package not 1.0.0"],
  ["BE", "Phase 15H docs"],
  ["BF", "Tier-1 distinct from subsystem GA"],
  ["BG", "No Trust Center/GRC/SIEM packages"],
  ["BH", "Internal/customer separation preserved"],
  ["BI", "Evidence absence remains unknown"],
  ["BJ", "Posture no universal score"],
  ["BK", "Migration inventory batch_90–95"],
  ["BL", "GaReadinessAssessmentComplete"],
  ["BM", "Capability matrix ready flag"],
  ["BN", "Gap register ready flag"],
  ["BO", "Operations runbook ready flag"],
  ["BP", "Commercial packaging defined flag"],
  ["BQ", "SecurityAssuranceBoundaryLocked"],
  ["BR", "No Phase 15I started"],
] as const;

export type Phase15hGateId =
  (typeof PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES)[number][0];

export const PHASE_15H_GATE_COUNT =
  PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES.length;

export const PHASE_15H_VERSION = "0.8.0-ga-readiness" as const;
export const PHASE_15G_BASELINE =
  "a7b309fbb556ed96f03a8e1c206955e54d90f1b2" as const;
export const PHASE_15F_BASELINE =
  "924b2eaa7f6bfc635d742c5310cff3a22ed5d446" as const;
export const PHASE_15E_BASELINE =
  "aa5150fc4acf287b50c973220c40d62b7f91687f" as const;
export const PHASE_15D_BASELINE =
  "ef8efd2b4b30082e9c26ac867c65c51e3e39d207" as const;
export const PHASE_15C_BASELINE =
  "897383f5a95cf81847ee866c1c1fdac5012b25a5" as const;
export const PHASE_15B_BASELINE =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15H_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15H_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15H_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15H_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15H_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15H_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15H_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15H_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
