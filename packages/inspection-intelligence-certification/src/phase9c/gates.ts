export const PHASE_9C_INSPECTION_ENTERPRISE_GATES = [
  ["A", "Repository identity"],
  ["B", "Project Intelligence v1 tag integrity"],
  ["C", "Phase 9B baseline identity"],
  ["D", "Durable persistence migrations"],
  ["E", "Engineering Module SDK"],
  ["F", "Inspection Pack SDK"],
  ["G", "Immutable template versioning"],
  ["H", "Immutable evidence framework"],
  ["I", "State machine and authorization"],
  ["J", "Event contracts and pipeline"],
  ["K", "Measurement Engine expansion"],
  ["L", "Reserved condition/defect/recommendation/offline/AI Vision"],
  ["M", "Enterprise domain happy path"],
  ["N", "Architecture boundary tests"],
  ["O", "Browser certification"],
  ["P", "Project Intelligence v1 regression"],
  ["Q", "Secret exposure"],
  ["R", "Artifact identity"],
  ["S", "Enterprise foundation and phase9D readiness"],
] as const;

export type Phase9cGateId = (typeof PHASE_9C_INSPECTION_ENTERPRISE_GATES)[number][0];
