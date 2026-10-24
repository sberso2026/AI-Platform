export const PHASE_9A_INSPECTION_DISCOVERY_GATES = [
  ["A", "Repository identity"],
  ["B", "Project Intelligence v1 tag integrity"],
  ["C", "Phase 8I.1 baseline identity"],
  ["D", "Discovery documentation complete"],
  ["E", "Generic inspection framework lock"],
  ["F", "Taxonomy and lifecycle lock"],
  ["G", "Measurement framework"],
  ["H", "Evidence framework"],
  ["I", "Spatial and time models"],
  ["J", "Extension points reserved"],
  ["K", "Data ownership and Engineering Core"],
  ["L", "Platform integration forbids private stacks"],
  ["M", "Module contract and package placement"],
  ["N", "Dependency and boundary architecture tests"],
  ["O", "UI discovery skeleton marker"],
  ["P", "Project Intelligence v1 regression"],
  ["Q", "Secret exposure"],
  ["R", "Artifact identity"],
  ["S", "Phase 9B readiness"],
] as const;

export type Phase9aGateId = (typeof PHASE_9A_INSPECTION_DISCOVERY_GATES)[number][0];
