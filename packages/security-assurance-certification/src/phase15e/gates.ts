/**
 * Phase 15E certification gates A–BR — Secure Compute Assurance (70 gates).
 */
export const PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15D baseline intact"],
  ["C", "Phase 15C/15B/15A regression"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.5.0-secure-compute"],
  ["G", "Contracts 0.5.0-secure-compute"],
  ["H", "Ownership / reuse boundary"],
  ["I", "Missing identity fail-closed"],
  ["J", "WORKLOAD_IDENTITY plane"],
  ["K", "TENANT_WORKSPACE_SCOPE plane"],
  ["L", "EXECUTION_AUTHORIZATION plane"],
  ["M", "RUNTIME_ISOLATION plane"],
  ["N", "FILESYSTEM_SCOPE plane"],
  ["O", "NETWORK_EGRESS plane"],
  ["P", "SECRET_ACCESS plane"],
  ["Q", "RESOURCE_LIMITS plane"],
  ["R", "EXECUTION_TIMEOUT plane"],
  ["S", "ARTEFACT_INTEGRITY plane"],
  ["T", "EXECUTION_PROVENANCE plane"],
  ["U", "OUTPUT_HANDLING plane"],
  ["V", "TEMPORARY_DATA plane"],
  ["W", "LOGGING_TELEMETRY plane"],
  ["X", "HOST_POSTURE plane"],
  ["Y", "Cross-tenant execution denial"],
  ["Z", "Cross-workspace execution denial"],
  ["AA", "Role-insufficient denial"],
  ["AB", "Policy linkage"],
  ["AC", "Runtime isolation assessment"],
  ["AD", "Timeout/error != PASS"],
  ["AE", "Artefact/hash evidence"],
  ["AF", "Unsupported control != PASS"],
  ["AG", "No confidential computing claim"],
  ["AH", "Probe error != PASS"],
  ["AI", "Findings != incidents"],
  ["AJ", "No autonomous remediation"],
  ["AK", "Anti-duplication"],
  ["AL", "Isolation+AI/data dimensions preserved"],
  ["AM", "Posture no universal score"],
  ["AN", "Events secure_compute.*"],
  ["AO", "Workflow secure_compute_review"],
  ["AP", "Admin UI marker"],
  ["AQ", "Migration batch_93"],
  ["AR", "RLS tenant/workspace"],
  ["AS", "Unit tests"],
  ["AT", "Secret scan"],
  ["AU", "Browser E2E"],
  ["AV", "Accessibility"],
  ["AW", "Responsive"],
  ["AX", "Architecture test"],
  ["AY", "Workflow exists"],
  ["AZ", "SecureComputeAssuranceReady flags"],
  ["BA", "Advanced products unimplemented"],
  ["BB", "EngineeringOSV1Intact"],
  ["BC", "Module V1 intact"],
  ["BD", "phase15FReady"],
  ["BE", "Artifact identity"],
  ["BF", "releaseEligible"],
  ["BG", "Semantics locks"],
  ["BH", "Foundation+Isolation+AI/data still ready"],
  ["BI", "No SIEM/TEE/Trust Center packages"],
  ["BJ", "EOS still 1.0.0"],
  ["BK", "Package not 1.0.0"],
  ["BL", "Secure compute docs"],
  ["BM", "Secret non-exposure in evidence"],
  ["BN", "Provenance implemented"],
  ["BO", "Integrity assessment implemented"],
  ["BP", "Background-job scope"],
  ["BQ", "duplicateExecutionHostDetected=false"],
  ["BR", "SecurityAssuranceBoundaryLocked"],
] as const;

export type Phase15eGateId =
  (typeof PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES)[number][0];

export const PHASE_15E_GATE_COUNT =
  PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES.length;

export const PHASE_15E_VERSION = "0.5.0-secure-compute" as const;
export const PHASE_15D_BASELINE =
  "ef8efd2b4b30082e9c26ac867c65c51e3e39d207" as const;
export const PHASE_15C_BASELINE =
  "897383f5a95cf81847ee866c1c1fdac5012b25a5" as const;
export const PHASE_15B_BASELINE =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15E_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15E_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15E_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15E_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15E_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15E_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15E_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15E_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
