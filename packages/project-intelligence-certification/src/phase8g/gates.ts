export const PHASE_8G_KNOWLEDGE_INTELLIGENCE_GATES = [
  ["A", "Repository and build identity"],
  ["B", "Phase 7B through 8E / Executive regression"],
  ["C", "Hosted schema and migration identity"],
  ["D", "Real-JWT RLS"],
  ["E", "Feature registration"],
  ["F", "Shared Engineering Services"],
  ["G", "Graph integrity and ownership"],
  ["H", "Hybrid search relevance"],
  ["I", "Citation and drill-down"],
  ["J", "Graph traversal and impact"],
  ["K", "Platform AI Runtime only"],
  ["L", "Entitlement and isolation"],
  ["M", "HTTP contracts"],
  ["N", "Browser E2E"],
  ["O", "Accessibility"],
  ["P", "Responsive layouts"],
  ["Q", "Performance baseline"],
  ["R", "Secret exposure"],
  ["S", "Artifact identity and release eligibility"],
] as const;

export type Phase8gGateId = (typeof PHASE_8G_KNOWLEDGE_INTELLIGENCE_GATES)[number][0];
