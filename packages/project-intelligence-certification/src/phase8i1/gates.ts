export const PHASE_8I1_REPOSITORY_BOUNDARY_GATES = [
  ["A", "Repository identity"],
  ["B", "Release tag integrity"],
  ["C", "Certified commit identity"],
  ["D", "Post-PASS workflow fix classification"],
  ["E", "Package inventory"],
  ["F", "Dependency direction"],
  ["G", "Circular dependency detection"],
  ["H", "Application host boundary"],
  ["I", "Engineering OS ownership"],
  ["J", "Project Intelligence boundary"],
  ["K", "Future Inspection Intelligence boundary"],
  ["L", "Generated directory safety"],
  ["M", "OneDrive policy"],
  ["N", "Deployment exclusions"],
  ["O", "Marker compatibility"],
  ["P", "Project Intelligence v1 regression"],
  ["Q", "Secret exposure"],
  ["R", "Artifact identity"],
  ["S", "Phase 9A readiness"],
] as const;

export type Phase8i1GateId = (typeof PHASE_8I1_REPOSITORY_BOUNDARY_GATES)[number][0];
