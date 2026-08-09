/**
 * Phase 15A certification gates A–BL — Security & Assurance Discovery (64 gates).
 */
export const PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Engineering OS V1 tag intact"],
  ["C", "Frozen module tags intact"],
  ["D", "Discovery version 0.1.0-discovery"],
  ["E", "Existing control inventory"],
  ["F", "Ownership matrix"],
  ["G", "Domain model"],
  ["H", "Control framework"],
  ["I", "Policy Engine reuse"],
  ["J", "Evidence and posture model"],
  ["K", "Continuous monitoring architecture"],
  ["L", "Isolation Assurance boundary"],
  ["M", "Artifact Integrity boundary"],
  ["N", "AI Trust boundary"],
  ["O", "Secure Compute boundary"],
  ["P", "Privileged Access boundary"],
  ["Q", "Data Governance boundary"],
  ["R", "Secure SDLC boundary"],
  ["S", "Supply Chain / Threat Intel boundary"],
  ["T", "Incident/Resilience boundary"],
  ["U", "Backup Assurance boundary"],
  ["V", "External integration boundary"],
  ["W", "Customer Assurance boundary"],
  ["X", "Framework mapping honesty"],
  ["Y", "External assurance boundary"],
  ["Z", "Tier-1 S07/S08 ownership"],
  ["AA", "Capability maturity matrix"],
  ["AB", "Draft contracts 0.1.0-draft"],
  ["AC", "Package placement Platform-level"],
  ["AD", "Commercial boundary"],
  ["AE", "No universal security score"],
  ["AF", "Event/KG/workflow/file boundaries"],
  ["AG", "Anti-duplication flags"],
  ["AH", "Gap register"],
  ["AI", "Implementation roadmap"],
  ["AJ", "SecurityAssuranceDiscoveryReady"],
  ["AK", "Ownership/Boundary locked flags"],
  ["AL", "Architecture defined flags"],
  ["AM", "Runtime unimplemented flags"],
  ["AN", "EngineeringOSV1Intact"],
  ["AO", "Module V1 intact flags"],
  ["AP", "Phase 14 S01–S06 CLOSED preserved"],
  ["AQ", "No Sec&A inside engineering-os"],
  ["AR", "No Trust Center package"],
  ["AS", "No Security Intelligence package"],
  ["AT", "Unit tests"],
  ["AU", "Secret scan"],
  ["AV", "Workflow exists"],
  ["AW", "Platform architecture test"],
  ["AX", "Phase 15A overview"],
  ["AY", "Architecture boundaries doc"],
  ["AZ", "Public contracts draft"],
  ["BA", "phase15BReady"],
  ["BB", "S07 remains Tier-1"],
  ["BC", "S08 owned by Identity"],
  ["BD", "No ISO certification claim"],
  ["BE", "Artifact identity"],
  ["BF", "releaseEligible"],
  ["BG", "UNKNOWN ownership none"],
  ["BH", "Boundary MUST_NEVER_OWN IdP"],
  ["BI", "Boundary MUST_NEVER_OWN SIEM"],
  ["BJ", "EOS GA version still 1.0.0"],
  ["BK", "Discovery package not 1.0.0"],
  ["BL", "SecurityAssuranceBoundaryLocked"],
] as const;

export type Phase15aGateId =
  (typeof PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES)[number][0];

export const PHASE_15A_GATE_COUNT =
  PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES.length;

export const PHASE_15A_VERSION = "0.1.0-discovery" as const;
export const PHASE_15A_EOS_TAG = "engineering-os-v1.0.0" as const;
export const PHASE_15A_EOS_COMMIT =
  "3bfc02478f50ce17f7a81e4e312986c9e1377535" as const;

export const PHASE_15A_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_15A_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_15A_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_15A_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_15A_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_15A_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
