export const PHASE_9D_INSPECTION_ENGINEERING_DOMAIN_GATES = [
  ["A", "Repository identity"],
  ["B", "Project Intelligence v1 tag integrity"],
  ["C", "Phase 9C baseline identity"],
  ["D", "Engineering Domain SDK"],
  ["E", "Defect Framework"],
  ["F", "Recommendation Framework"],
  ["G", "Corrective Action Framework"],
  ["H", "Engineering Assessment"],
  ["I", "Verification Framework"],
  ["J", "Close-out lifecycle"],
  ["K", "Compliance Framework"],
  ["L", "KPI Framework"],
  ["M", "Risk typed adapter integration"],
  ["N", "No mobile / no AI Vision"],
  ["O", "Domain happy path + architecture tests"],
  ["P", "Browser certification"],
  ["Q", "Project Intelligence v1 regression"],
  ["R", "Secret exposure + prior foundation intact"],
  ["S", "Artifact identity and phase9E readiness"],
] as const;

export type Phase9dGateId = (typeof PHASE_9D_INSPECTION_ENGINEERING_DOMAIN_GATES)[number][0];
