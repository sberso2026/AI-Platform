/**
 * Phase 15C certification gates A–BR — Isolation Assurance (70 gates).
 */
export const PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15B baseline intact"],
  ["C", "Phase 15A regression corpus"],
  ["D", "Engineering OS V1 tag intact"],
  ["E", "Frozen module tags intact"],
  ["F", "Version 0.3.0-isolation-assurance"],
  ["G", "Contracts 0.3.0-isolation-assurance"],
  ["H", "Ownership — does not own enforcement"],
  ["I", "Probe registry"],
  ["J", "Probe versioning / no unrestricted code"],
  ["K", "Database/RLS isolation"],
  ["L", "API/IDOR isolation"],
  ["M", "File isolation"],
  ["N", "Search isolation"],
  ["O", "KG isolation"],
  ["P", "AI context isolation"],
  ["Q", "Background job isolation"],
  ["R", "Event isolation"],
  ["S", "Execution host isolation"],
  ["T", "Solver workspace isolation"],
  ["U", "Cache applicability"],
  ["V", "Evidence provenance"],
  ["W", "Evidence freshness"],
  ["X", "Probe error semantics"],
  ["Y", "Isolation assessment"],
  ["Z", "Isolation findings"],
  ["AA", "Posture integration isolation-only"],
  ["AB", "Control mapping"],
  ["AC", "Scheduled/repeatable assurance contract"],
  ["AD", "Release-gate contract"],
  ["AE", "Production safety"],
  ["AF", "Admin UI isolation marker"],
  ["AG", "Isolation events"],
  ["AH", "Audit/timeline"],
  ["AI", "Workflow reuse isolation_review"],
  ["AJ", "Migration batch_91"],
  ["AK", "RLS on isolation tables"],
  ["AL", "Tenant/workspace isolation"],
  ["AM", "IDOR least privilege"],
  ["AN", "Performance baselines recorded"],
  ["AO", "No remediation / no RLS mutation"],
  ["AP", "Anti-duplication"],
  ["AQ", "Unit tests"],
  ["AR", "Secret scan"],
  ["AS", "Browser E2E"],
  ["AT", "Accessibility"],
  ["AU", "Responsive"],
  ["AV", "Architecture test"],
  ["AW", "Workflow exists"],
  ["AX", "IsolationAssuranceReady flags"],
  ["AY", "Plane assessed flags"],
  ["AZ", "Leakage flags false"],
  ["BA", "Advanced products unimplemented"],
  ["BB", "implementsOwnAiStack=false"],
  ["BC", "EngineeringOSV1Intact"],
  ["BD", "Module V1 intact"],
  ["BE", "phase15DReady"],
  ["BF", "Artifact identity"],
  ["BG", "releaseEligible"],
  ["BH", "Semantics locks"],
  ["BI", "Foundation still ready"],
  ["BJ", "No SIEM/Trust Center packages"],
  ["BK", "EOS still 1.0.0"],
  ["BL", "Package not 1.0.0"],
  ["BM", "Isolation docs"],
  ["BN", "knownCrossTenantLeakageDetected=false"],
  ["BO", "knownCrossWorkspaceLeakageDetected=false"],
  ["BP", "Failed probe never PASS fallback"],
  ["BQ", "CACHE not_applicable truthful"],
  ["BR", "SecurityAssuranceBoundaryLocked"],
] as const;

export type Phase15cGateId =
  (typeof PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES)[number][0];

export const PHASE_15C_GATE_COUNT =
  PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES.length;

export const PHASE_15C_VERSION = "0.3.0-isolation-assurance" as const;
export const PHASE_15B_BASELINE =
  "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15C_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15C_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15C_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15C_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15C_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15C_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15C_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15C_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
