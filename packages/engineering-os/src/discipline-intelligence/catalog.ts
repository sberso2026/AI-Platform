/**
 * EOS-A7A Discipline Intelligence catalog.
 * Reuses Engineering Core `engineering_disciplines.discipline_key`.
 * Canonical codes are uppercase; keys remain the existing Core slugs.
 */

export const CANONICAL_DISCIPLINE_CODES = [
  "STRUCTURAL",
  "MECHANICAL",
  "PROCESS",
  "PIPING",
  "ELECTRICAL",
  "CIVIL",
  "GEOTECHNICAL",
  "INSTRUMENTATION_CONTROL",
  "MATERIALS",
  "SAFETY",
  "ENVIRONMENTAL",
] as const;

export type CanonicalDisciplineCode = (typeof CANONICAL_DISCIPLINE_CODES)[number];

/** Existing Core extras that remain in the registry without becoming mini-OS silos. */
export const EXTRA_DISCIPLINE_KEYS = ["marine", "construction", "project_controls", "quality", "hse"] as const;

export const DISCIPLINE_KEY_BY_CODE: Record<CanonicalDisciplineCode, string> = {
  STRUCTURAL: "structural",
  MECHANICAL: "mechanical",
  PROCESS: "process",
  PIPING: "piping",
  ELECTRICAL: "electrical",
  CIVIL: "civil",
  GEOTECHNICAL: "geotechnical",
  INSTRUMENTATION_CONTROL: "instrumentation",
  MATERIALS: "materials",
  SAFETY: "safety",
  ENVIRONMENTAL: "environmental",
};

export const DISCIPLINE_CODE_BY_KEY: Record<string, CanonicalDisciplineCode> = Object.fromEntries(
  (Object.entries(DISCIPLINE_KEY_BY_CODE) as [CanonicalDisciplineCode, string][]).map(([code, key]) => [key, code]),
) as Record<string, CanonicalDisciplineCode>;

export type DisciplineCatalogEntry = {
  code: CanonicalDisciplineCode;
  disciplineKey: string;
  name: string;
  description: string;
  existingCoreRow: boolean;
};

export const DISCIPLINE_CATALOG: readonly DisciplineCatalogEntry[] = [
  { code: "STRUCTURAL", disciplineKey: "structural", name: "Structural", description: "Structural engineering", existingCoreRow: true },
  { code: "MECHANICAL", disciplineKey: "mechanical", name: "Mechanical", description: "Mechanical engineering", existingCoreRow: true },
  { code: "PROCESS", disciplineKey: "process", name: "Process", description: "Process engineering", existingCoreRow: true },
  { code: "PIPING", disciplineKey: "piping", name: "Piping", description: "Piping engineering", existingCoreRow: true },
  { code: "ELECTRICAL", disciplineKey: "electrical", name: "Electrical", description: "Electrical engineering", existingCoreRow: true },
  { code: "CIVIL", disciplineKey: "civil", name: "Civil", description: "Civil engineering", existingCoreRow: true },
  { code: "GEOTECHNICAL", disciplineKey: "geotechnical", name: "Geotechnical", description: "Geotechnical engineering", existingCoreRow: true },
  {
    code: "INSTRUMENTATION_CONTROL",
    disciplineKey: "instrumentation",
    name: "Instrumentation & Control",
    description: "Instrumentation and control engineering (existing Core key: instrumentation)",
    existingCoreRow: true,
  },
  { code: "MATERIALS", disciplineKey: "materials", name: "Materials", description: "Materials engineering", existingCoreRow: false },
  { code: "SAFETY", disciplineKey: "safety", name: "Safety", description: "Safety engineering. Distinct from existing HSE catalogue extra.", existingCoreRow: false },
  { code: "ENVIRONMENTAL", disciplineKey: "environmental", name: "Environmental", description: "Environmental engineering", existingCoreRow: false },
];

export const DISCIPLINE_CAPABILITY_KEYS = [
  "CONTEXT_INTERPRETATION",
  "DOCUMENT_REVIEW",
  "MODEL_REVIEW",
  "REQUIREMENT_ANALYSIS",
  "ASSUMPTION_ANALYSIS",
  "INTERFACE_ANALYSIS",
  "CHANGE_IMPACT_ANALYSIS",
  "CALCULATION",
  "SIMULATION",
  "LINEAR_STRUCTURAL_ANALYSIS",
  "STRUCTURAL_DESIGN_CHECK",
  "EQUIPMENT_REVIEW",
  "PROCESS_BASIS_REVIEW",
  "PROCESS_SIMULATION",
  "PIPING_REVIEW",
  "STRESS_ANALYSIS",
  "LOAD_REVIEW",
  "POWER_SYSTEM_ANALYSIS",
  "PROTECTION_STUDY",
  "DESIGN_CHECK",
  "OPTIMIZATION",
  "FAILURE_ANALYSIS",
  "ASSET_ASSESSMENT",
  "CONSTRUCTABILITY_REVIEW",
  "TECHNICAL_QUERY_SUPPORT",
  "ENGINEERING_REVIEW",
  "EVIDENCE_GENERATION",
  "FEA",
] as const;

export type DisciplineCapabilityKey = (typeof DISCIPLINE_CAPABILITY_KEYS)[number];

export const DISCIPLINE_CAPABILITY_STATUSES = [
  "NOT_AVAILABLE",
  "AVAILABLE",
  "TOOL_DEPENDENT",
  "NOT_CERTIFIED",
  "CERTIFIED",
  "BLOCKED",
  "DEGRADED",
] as const;

export type DisciplineCapabilityStatus = (typeof DISCIPLINE_CAPABILITY_STATUSES)[number];

export const DISCIPLINE_READINESS_STATES = [
  "NOT_CONFIGURED",
  "CONFIGURED",
  "PARTIALLY_AVAILABLE",
  "READY_FOR_REVIEW",
  "READY_FOR_ANALYSIS",
  "DEGRADED",
  "BLOCKED",
] as const;

export type DisciplineReadiness = (typeof DISCIPLINE_READINESS_STATES)[number];

export const DISCIPLINE_PARTICIPATION_ROLES = [
  "LEAD",
  "CONTRIBUTING",
  "REVIEWING",
  "CONSULTED",
  "INFORMED",
  "SOURCE",
  "RECEIVING",
] as const;

export type DisciplineParticipationRole = (typeof DISCIPLINE_PARTICIPATION_ROLES)[number];

export const INTERFACE_INFORMATION_STATUSES = [
  "REQUIRED",
  "REQUESTED",
  "PROVIDED",
  "ACCEPTED",
  "REJECTED",
  "SUPERSEDED",
  "INCOMPLETE",
] as const;

export type InterfaceInformationStatus = (typeof INTERFACE_INFORMATION_STATUSES)[number];

export const DISCIPLINE_OBJECT_KINDS = [
  "PROJECT",
  "SYSTEM",
  "ASSET",
  "INTERFACE",
  "REQUIREMENT",
  "ASSUMPTION",
  "DECISION",
  "CHANGE",
  "IMPACT",
  "REVIEW_PACKAGE",
  "OPTIMIZATION_STUDY",
  "DOCUMENT",
] as const;

export type DisciplineObjectKind = (typeof DISCIPLINE_OBJECT_KINDS)[number];

export function isCanonicalDisciplineCode(value: string): value is CanonicalDisciplineCode {
  return (CANONICAL_DISCIPLINE_CODES as readonly string[]).includes(value);
}

export function isDisciplineCapabilityKey(value: string): value is DisciplineCapabilityKey {
  return (DISCIPLINE_CAPABILITY_KEYS as readonly string[]).includes(value);
}

export function resolveDisciplineCode(input: { code?: string | null; disciplineKey?: string | null }): CanonicalDisciplineCode | null {
  if (input.code && isCanonicalDisciplineCode(input.code)) return input.code;
  if (input.disciplineKey && DISCIPLINE_CODE_BY_KEY[input.disciplineKey]) return DISCIPLINE_CODE_BY_KEY[input.disciplineKey];
  return null;
}
