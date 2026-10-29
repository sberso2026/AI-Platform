/**
 * Phase 15B certification gates A–BT — Security & Assurance Foundation (72 gates).
 */
export const PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 15A baseline intact"],
  ["C", "Engineering OS V1 tag intact"],
  ["D", "Frozen module tags intact"],
  ["E", "Foundation version 0.2.0-control-evidence"],
  ["F", "Public contracts 0.2.0-control-evidence"],
  ["G", "Ownership matrix preserved"],
  ["H", "Control registry"],
  ["I", "Control lifecycle"],
  ["J", "Control implementation references"],
  ["K", "Evidence registry + provenance"],
  ["L", "Evidence freshness"],
  ["M", "Missing evidence fail-closed"],
  ["N", "Invalid/conflicting evidence"],
  ["O", "Assessment taxonomy"],
  ["P", "Assessment reproducibility"],
  ["Q", "Governed assessment review"],
  ["R", "Finding lifecycle"],
  ["S", "Exception expiry + approval governance"],
  ["T", "Posture composition"],
  ["U", "No universal security score"],
  ["V", "Framework many-to-many mapping"],
  ["W", "Framework mapping ≠ certification"],
  ["X", "External assurance semantics"],
  ["Y", "S01–S06 CLOSED preserved"],
  ["Z", "S07/S08 ownership preserved"],
  ["AA", "Tenant/workspace isolation in migration"],
  ["AB", "RLS policies present"],
  ["AC", "Classification handling"],
  ["AD", "Audit/event safety"],
  ["AE", "Timeline integrity"],
  ["AF", "KG reuse / no Security KG"],
  ["AG", "Platform Files reuse"],
  ["AH", "Policy Engine reuse"],
  ["AI", "Anti-duplication flags"],
  ["AJ", "Migration batch_90 integrity"],
  ["AK", "Unit tests"],
  ["AL", "Secret scan"],
  ["AM", "Browser E2E"],
  ["AN", "Accessibility markers"],
  ["AO", "Responsive UI markers"],
  ["AP", "Admin UI ready marker"],
  ["AQ", "Workflow exists"],
  ["AR", "Architecture test"],
  ["AS", "Phase 15B overview doc"],
  ["AT", "Contracts doc"],
  ["AU", "SecurityAssuranceFoundationReady"],
  ["AV", "Registry ready flags"],
  ["AW", "Evidence enforcement flags"],
  ["AX", "Automatic approval disabled"],
  ["AY", "Advanced runtimes unimplemented"],
  ["AZ", "implementsOwnAiStack=false"],
  ["BA", "EngineeringOSV1Intact"],
  ["BB", "Module V1 intact flags"],
  ["BC", "phase15CReady"],
  ["BD", "No Trust Center / Security Intelligence packages"],
  ["BE", "Artifact identity"],
  ["BF", "releaseEligible"],
  ["BG", "Outbox event types bounded"],
  ["BH", "IDOR surface least privilege notes"],
  ["BI", "JWT/authz reuse (no new IdP)"],
  ["BJ", "EOS version still 1.0.0"],
  ["BK", "Foundation package not 1.0.0"],
  ["BL", "Phase 15A discovery corpus preserved"],
  ["BM", "Semantics locks present"],
  ["BN", "security_assurance.assessment_review"],
  ["BO", "Posture dimensions complete"],
  ["BP", "No SIEM package"],
  ["BQ", "No second Policy Engine"],
  ["BR", "Event payload safety constraints"],
  ["BS", "phase15BReady remains true"],
  ["BT", "SecurityAssuranceBoundaryLocked"],
] as const;

export type Phase15bGateId =
  (typeof PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES)[number][0];

export const PHASE_15B_GATE_COUNT =
  PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES.length;

export const PHASE_15B_VERSION = "0.2.0-control-evidence" as const;
export const PHASE_15A_BASELINE =
  "4748972076f77e7392bb41ec664adddfeb677407" as const;
export const PHASE_15B_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15B_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15B_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15B_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15B_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15B_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15B_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15B_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
