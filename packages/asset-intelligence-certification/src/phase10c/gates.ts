/**
 * Phase 10C certification gates.
 */
export const PHASE_10C_ASSET_INTELLIGENCE_CRITICALITY_GATES = [
  ["A", "Repository identity"],
  ["B", "PI v1 tag integrity"],
  ["C", "II v1 tag integrity"],
  ["D", "Phase 10B baseline"],
  ["E", "Phase 10B.1 hosted baseline"],
  ["F", "Ownership lock"],
  ["G", "Criticality model"],
  ["H", "Criticality engine path"],
  ["I", "Health Index model separation"],
  ["J", "Health Composition Engine"],
  ["K", "Health composition with criticality"],
  ["L", "Workflow SDK review"],
  ["M", "Hosted criticality persistence"],
  ["N", "Hosted health index persistence"],
  ["O", "Events"],
  ["P", "Docs and version"],
  ["Q", "Tests and secrets"],
  ["R", "Artifact identity"],
  ["S", "Production memory prohibition"],
  ["T", "Phase 10D readiness"],
] as const;

export type Phase10cGateId = (typeof PHASE_10C_ASSET_INTELLIGENCE_CRITICALITY_GATES)[number][0];
