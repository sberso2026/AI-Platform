/**
 * Phase 15F certification gates A–BR — Compliance Intelligence Foundation (70 gates).
 */
export const PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15E baseline intact"],
  ["C", "Phase 15D–15A regression"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.6.0-compliance-intelligence"],
  ["G", "Contracts 0.6.0-compliance-intelligence"],
  ["H", "Ownership / reuse boundary"],
  ["I", "Framework/version registry"],
  ["J", "ISO27001_2022 framework"],
  ["K", "NIST_CSF_2_0 framework"],
  ["L", "ESSENTIAL_EIGHT framework"],
  ["M", "SOC2_TSC scaffold"],
  ["N", "Requirement mapping"],
  ["O", "Many-to-many control mapping"],
  ["P", "Cross-framework RTB control reuse"],
  ["Q", "Evidence mapping"],
  ["R", "Provenance preservation"],
  ["S", "Evidence freshness"],
  ["T", "Stale evidence handling"],
  ["U", "Missing evidence fail-closed"],
  ["V", "Partial support semantics"],
  ["W", "Unsupported semantics"],
  ["X", "Not-applicable semantics"],
  ["Y", "External-assurance requirement"],
  ["Z", "Internal evidence cannot satisfy external-only"],
  ["AA", "Gaps != incidents"],
  ["AB", "No automatic remediation"],
  ["AC", "No automatic certification/claims"],
  ["AD", "Anti-duplication"],
  ["AE", "Prior dimensions preserved"],
  ["AF", "Posture no universal score"],
  ["AG", "Events compliance.*"],
  ["AH", "Workflow compliance_review"],
  ["AI", "Admin UI marker"],
  ["AJ", "Migration batch_94"],
  ["AK", "RLS tenant/workspace"],
  ["AL", "Unit tests"],
  ["AM", "Secret scan"],
  ["AN", "Browser E2E"],
  ["AO", "Accessibility"],
  ["AP", "Responsive"],
  ["AQ", "Architecture test"],
  ["AR", "Workflow exists"],
  ["AS", "ComplianceIntelligenceReady flags"],
  ["AT", "Advanced products unimplemented"],
  ["AU", "EngineeringOSV1Intact"],
  ["AV", "Module V1 intact"],
  ["AW", "phase15GReady"],
  ["AX", "Artifact identity"],
  ["AY", "releaseEligible"],
  ["AZ", "Semantics / claim safety locks"],
  ["BA", "Foundation+Isolation+AI/data+SC still ready"],
  ["BB", "No Trust Center/GRC packages"],
  ["BC", "EOS still 1.0.0"],
  ["BD", "Package not 1.0.0"],
  ["BE", "Compliance docs"],
  ["BF", "Sole control never infers compliance"],
  ["BG", "FrameworkMappingRegistry reused"],
  ["BH", "ComplianceIntelligenceImplemented=true"],
  ["BI", "compliance_intelligence posture dimension"],
  ["BJ", "Gap recommended human action"],
  ["BK", "duplicateSecurityControlRegistryDetected=false"],
  ["BL", "duplicateSecurityEvidenceRegistryDetected=false"],
  ["BM", "No global framework compliant label"],
  ["BN", "automaticControlCreationEnabled=false"],
  ["BO", "SecurityAssuranceBoundaryLocked"],
  ["BP", "Unknown never silent supported"],
  ["BQ", "ExternalAssuranceRequirementImplemented"],
  ["BR", "ComplianceGapAssessmentImplemented"],
] as const;

export type Phase15fGateId =
  (typeof PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES)[number][0];

export const PHASE_15F_GATE_COUNT =
  PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES.length;

export const PHASE_15F_VERSION = "0.6.0-compliance-intelligence" as const;
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
export const PHASE_15F_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15F_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15F_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15F_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15F_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15F_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15F_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15F_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
