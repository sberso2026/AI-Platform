export const PHASE_9E_INSPECTION_OPERATIONAL_WORKFLOW_GATES = [
  ["A", "Repository identity"],
  ["B", "Project Intelligence v1 tag integrity"],
  ["C", "Phase 9D baseline identity"],
  ["D", "Engineering Workflow SDK"],
  ["E", "Inspection operational workflows"],
  ["F", "Reporting preparation"],
  ["G", "Workflow typed event emission"],
  ["H", "No mobile / offline / AI Vision"],
  ["I", "Operational happy path + architecture tests"],
  ["J", "Browser certification"],
  ["K", "Project Intelligence v1 regression"],
  ["L", "Secret exposure + prior domain intact"],
  ["M", "Artifact identity and phase9F readiness"],
] as const;

export type Phase9eGateId = (typeof PHASE_9E_INSPECTION_OPERATIONAL_WORKFLOW_GATES)[number][0];
