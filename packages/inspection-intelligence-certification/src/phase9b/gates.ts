export const PHASE_9B_INSPECTION_VERTICAL_SLICE_GATES = [
  ["A", "Repository identity"],
  ["B", "Project Intelligence v1 tag integrity"],
  ["C", "Phase 9A baseline identity"],
  ["D", "Mandatory architectural reservations"],
  ["E", "Inspection Target and AssetReference contracts"],
  ["F", "Measurement Engine subsystem"],
  ["G", "Immutable Evidence Framework"],
  ["H", "AI Vision interfaces reserved"],
  ["I", "Inspection Pack architecture"],
  ["J", "Predictive interfaces reserved"],
  ["K", "Event flow definition"],
  ["L", "Mobile certification placeholders"],
  ["M", "Vertical slice domain happy path"],
  ["N", "Schema migration present"],
  ["O", "UI and API surfaces"],
  ["P", "Architecture boundary tests"],
  ["Q", "Project Intelligence v1 regression"],
  ["R", "Secret exposure"],
  ["S", "Artifact identity and phase9C readiness"],
] as const;

export type Phase9bGateId = (typeof PHASE_9B_INSPECTION_VERTICAL_SLICE_GATES)[number][0];
