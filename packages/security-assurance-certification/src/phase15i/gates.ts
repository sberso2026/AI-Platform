/**
 * Phase 15I certification gates A–BT — Security & Assurance V1.0 Production GA (72 gates).
 */
export const PHASE_15I_SECURITY_ASSURANCE_GA_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15H baseline intact"],
  ["C", "Phase 15G–15A regression baselines"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 1.0.0"],
  ["G", "Status ga"],
  ["H", "Public contracts 1.0.0 frozen"],
  ["I", "Manifest 1.0.0 frozen"],
  ["J", "Release tag declared"],
  ["K", "V1 product boundary"],
  ["L", "MUST_NEVER_OWN"],
  ["M", "Capability maturity freeze"],
  ["N", "Control/evidence semantics"],
  ["O", "Evidence provenance/freshness"],
  ["P", "Assessment governance"],
  ["Q", "Findings/exceptions"],
  ["R", "Posture no universal score"],
  ["S", "Isolation assurance"],
  ["T", "AI/data assurance"],
  ["U", "Secure compute assurance"],
  ["V", "Compliance intelligence"],
  ["W", "Framework claim safety"],
  ["X", "External assurance"],
  ["Y", "Customer assurance"],
  ["Z", "Disclosure safety"],
  ["AA", "CustomerTrustCenterImplemented=false"],
  ["AB", "S07 incomplete Tier-1"],
  ["AC", "S08 incomplete Tier-1"],
  ["AD", "Tier-1 deployment doc"],
  ["AE", "Commercial packaging"],
  ["AF", "Entitlements server-side"],
  ["AG", "Operations doc"],
  ["AH", "Backup/restore truth"],
  ["AI", "Observability health"],
  ["AJ", "Security anti-automation"],
  ["AK", "Anti-duplication"],
  ["AL", "Migration lineage batch_90–95"],
  ["AM", "No GA rewrite migration"],
  ["AN", "Upgrade 0.7.0→1.0.0"],
  ["AO", "Historical traceability"],
  ["AP", "Performance baselines"],
  ["AQ", "UI v1-ready marker"],
  ["AR", "Unit tests"],
  ["AS", "Secret scan"],
  ["AT", "Browser E2E"],
  ["AU", "Accessibility"],
  ["AV", "Responsive"],
  ["AW", "Architecture test"],
  ["AX", "Workflow exists"],
  ["AY", "15A–15H architecture regression"],
  ["AZ", "Foundation+dimensions ready"],
  ["BA", "EngineeringOSV1Intact"],
  ["BB", "Module V1 intact"],
  ["BC", "SecurityAssuranceV1GaCertified"],
  ["BD", "SecurityAssuranceV1Frozen"],
  ["BE", "productionSecurityAssuranceReady"],
  ["BF", "Artifact identity"],
  ["BG", "Release tag integrity"],
  ["BH", "releaseEligible"],
  ["BI", "Ownership unknown=0"],
  ["BJ", "Contracts doc frozen"],
  ["BK", "Manifest moduleRegistryDrift=false"],
  ["BL", "internalEvidenceCannotSatisfyIndependentAssurance"],
  ["BM", "automaticExceptionApprovalEnabled=false"],
  ["BN", "implementsOwnAiStack=false"],
  ["BO", "duplicateToolFramework/ExecutionHost=false"],
  ["BP", "No continuous monitoring / threat-intel / Trust Center packages"],
  ["BQ", "Phase 15I docs"],
  ["BR", "securityAssuranceV1GaReady remains true"],
  ["BS", "EOS still 1.0.0 frozen"],
  ["BT", "No next feature phase started"],
] as const;

export type Phase15iGateId =
  (typeof PHASE_15I_SECURITY_ASSURANCE_GA_GATES)[number][0];

export const PHASE_15I_GATE_COUNT = PHASE_15I_SECURITY_ASSURANCE_GA_GATES.length;

export const PHASE_15I_VERSION = "1.0.0" as const;
export const PHASE_15I_RELEASE_TAG = "security-assurance-v1.0.0" as const;
export const PHASE_15H_BASELINE =
  "e1d2d72170c3fa47bc2dddcd13b596890387666f" as const;
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
export const PHASE_15I_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15I_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15I_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15I_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15I_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15I_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15I_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15I_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
