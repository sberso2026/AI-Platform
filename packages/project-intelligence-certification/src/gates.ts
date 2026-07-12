export const PROJECT_INTELLIGENCE_CERTIFICATION_GATES = [
  ["A", "tests, typecheck, production build"],
  ["B", "hosted mapping schema verification"],
  ["C", "real-JWT RLS for mapping records"],
  ["D", "application installation and entitlement"],
  ["E", "shared shell and access states"],
  ["F", "Engineering Core read adapters"],
  ["G", "legacy migration-source adapter"],
  ["H", "mapping review API and UI"],
  ["I", "AI Director proof with evidence"],
  ["J", "workspace and role boundaries"],
  ["K", "accessibility and responsive behavior"],
  ["L", "nested error contract and correlation IDs"],
  ["M", "reproducible build identity"],
  ["N", "GitHub hosted certification run verification"],
] as const;

export type CertificationGateId = (typeof PROJECT_INTELLIGENCE_CERTIFICATION_GATES)[number][0];
