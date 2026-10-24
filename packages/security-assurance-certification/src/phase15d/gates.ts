/**
 * Phase 15D certification gates A–BP — AI & Data Security Assurance (68 gates).
 */
export const PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15C baseline intact"],
  ["C", "Phase 15B/15A regression"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.4.0-ai-data-security"],
  ["G", "Contracts 0.4.0-ai-data-security"],
  ["H", "Ownership / reuse boundary"],
  ["I", "Classification fail-closed"],
  ["J", "DATA_INGESTION plane"],
  ["K", "DATA_STORAGE plane"],
  ["L", "RETRIEVAL plane"],
  ["M", "AI_CONTEXT plane"],
  ["N", "PROMPT plane"],
  ["O", "MODEL_PROVIDER plane"],
  ["P", "TOOL_INPUT plane"],
  ["Q", "TOOL_OUTPUT plane"],
  ["R", "MODEL_OUTPUT plane"],
  ["S", "PERSISTENCE plane"],
  ["T", "LOGGING_TELEMETRY plane"],
  ["U", "DATA_EGRESS plane"],
  ["V", "Provider unknown fail-closed"],
  ["W", "Sensitive exposure assessment"],
  ["X", "Evidence provenance/freshness"],
  ["Y", "Probe error != PASS"],
  ["Z", "Findings != incidents"],
  ["AA", "No autonomous remediation"],
  ["AB", "Anti-duplication"],
  ["AC", "Isolation dimension preserved"],
  ["AD", "Posture no universal score"],
  ["AE", "Events ai_data.*"],
  ["AF", "Workflow ai_data_review"],
  ["AG", "Admin UI marker"],
  ["AH", "Migration batch_92"],
  ["AI", "RLS tenant/workspace"],
  ["AJ", "Unit tests"],
  ["AK", "Secret scan"],
  ["AL", "Browser E2E"],
  ["AM", "Accessibility"],
  ["AN", "Responsive"],
  ["AO", "Architecture test"],
  ["AP", "Workflow exists"],
  ["AQ", "AiDataSecurityReady flags"],
  ["AR", "Advanced products unimplemented"],
  ["AS", "implementsOwnAiStack=false"],
  ["AT", "EngineeringOSV1Intact"],
  ["AU", "Module V1 intact"],
  ["AV", "phase15EReady"],
  ["AW", "Artifact identity"],
  ["AX", "releaseEligible"],
  ["AY", "Semantics locks"],
  ["AZ", "Foundation+Isolation still ready"],
  ["BA", "No SIEM/DLP/Trust Center packages"],
  ["BB", "EOS still 1.0.0"],
  ["BC", "Package not 1.0.0"],
  ["BD", "AI/data docs"],
  ["BE", "No prompt-injection completeness claim"],
  ["BF", "Secret non-exposure in evidence"],
  ["BG", "Data-flow evidence implemented"],
  ["BH", "Provider assurance implemented"],
  ["BI", "Cross-tenant context denial"],
  ["BJ", "Unauthorized retrieval denial"],
  ["BK", "Tool scope/provenance"],
  ["BL", "Logging secret non-exposure"],
  ["BM", "Egress assessment"],
  ["BN", "duplicateAiStackDetected=false"],
  ["BO", "duplicateSecretManagerDetected=false"],
  ["BP", "SecurityAssuranceBoundaryLocked"],
] as const;

export type Phase15dGateId =
  (typeof PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES)[number][0];

export const PHASE_15D_GATE_COUNT =
  PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES.length;

export const PHASE_15D_VERSION = "0.4.0-ai-data-security" as const;
export const PHASE_15C_BASELINE =
  "897383f5a95cf81847ee866c1c1fdac5012b25a5" as const;
export const PHASE_15B_BASELINE =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15D_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15D_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15D_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15D_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15D_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15D_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15D_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15D_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
