import type { CanonicalDisciplineCode, DisciplineCapabilityKey, DisciplineCapabilityStatus } from "./catalog";
import { DISCIPLINE_CATALOG, DISCIPLINE_KEY_BY_CODE } from "./catalog";
import { applyEffectiveCapabilities, defaultSpaceGassToolView, deriveDisciplineReadiness } from "./readiness";
import type { DisciplineCapabilityRecord, DisciplineProfile, DisciplineStandardReference, DisciplineToolBinding } from "./types";

function cap(
  key: DisciplineCapabilityKey,
  declaredStatus: DisciplineCapabilityStatus,
  toolIndependent: boolean,
  preferredToolCode: string | null,
  notes: string,
): Omit<DisciplineCapabilityRecord, "effectiveStatus"> {
  return { key, declaredStatus, toolIndependent, preferredToolCode, notes };
}

const STRUCTURAL_STANDARDS: DisciplineStandardReference[] = [
  { standardCode: "AS 4100", edition: null, sourceReference: "Standards Australia (reference only)", applicability: "steel structures", status: "CONFIGURED", effectiveDate: null, knowledgeState: "CONFIGURED", engineState: "NOT_IMPLEMENTED", certificationState: "NOT_CERTIFIED" },
  { standardCode: "AS/NZS 1170", edition: null, sourceReference: "Standards Australia (reference only)", applicability: "actions / loads", status: "CONFIGURED", effectiveDate: null, knowledgeState: "CONFIGURED", engineState: "NOT_IMPLEMENTED", certificationState: "NOT_CERTIFIED" },
  { standardCode: "AS 3600", edition: null, sourceReference: "Standards Australia (reference only)", applicability: "concrete structures", status: "CONFIGURED", effectiveDate: null, knowledgeState: "CONFIGURED", engineState: "NOT_IMPLEMENTED", certificationState: "NOT_CERTIFIED" },
];

const DEFAULT_CAPS: Record<CanonicalDisciplineCode, Omit<DisciplineCapabilityRecord, "effectiveStatus">[]> = {
  STRUCTURAL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent context interpretation."),
    cap("DOCUMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent document review."),
    cap("REQUIREMENT_ANALYSIS", "AVAILABLE", true, null, "Tool-independent requirement analysis."),
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent interface analysis."),
    cap("ENGINEERING_REVIEW", "AVAILABLE", true, null, "Composes Engineering Review. Not a separate findings table."),
    cap("CALCULATION", "TOOL_DEPENDENT", false, "spacegass", "Deterministic calculation requires a certified tool."),
    cap("LINEAR_STRUCTURAL_ANALYSIS", "TOOL_DEPENDENT", false, "spacegass", "SPACE GASS trial discovered on the host; API/automation/expiry gates remain fail-closed. Not CERTIFIED."),
    cap("STRUCTURAL_DESIGN_CHECK", "NOT_CERTIFIED", false, null, "Design-code check is not certified."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "EOS-A6 uses the canonical Optimization Study. Discipline OPTIMIZATION remains NOT_CERTIFIED until a real certified solver run."),
  ],
  MECHANICAL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("EQUIPMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent equipment review."),
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("CALCULATION", "TOOL_DEPENDENT", false, null, "Requires a certified mechanical tool."),
    cap("FEA", "NOT_CERTIFIED", false, null, "Mechanical FEA is not certified."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  PROCESS: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("PROCESS_BASIS_REVIEW", "AVAILABLE", true, null, "Tool-independent process basis review."),
    cap("REQUIREMENT_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("PROCESS_SIMULATION", "TOOL_DEPENDENT", false, "hysys", "HYSYS is not installed. Not CERTIFIED."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  PIPING: [
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("PIPING_REVIEW", "AVAILABLE", true, null, "Tool-independent piping review."),
    cap("STRESS_ANALYSIS", "TOOL_DEPENDENT", false, "caesar-ii", "CAESAR II is not installed. Not CERTIFIED."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  ELECTRICAL: [
    cap("LOAD_REVIEW", "AVAILABLE", true, null, "Tool-independent."),
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("POWER_SYSTEM_ANALYSIS", "TOOL_DEPENDENT", false, "etap", "ETAP is not installed. Not CERTIFIED."),
    cap("PROTECTION_STUDY", "NOT_CERTIFIED", false, null, "Not certified."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  CIVIL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("DOCUMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent."),
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  GEOTECHNICAL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("DOCUMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent."),
    cap("FEA", "TOOL_DEPENDENT", false, "plaxis", "PLAXIS is not installed. Not CERTIFIED."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  INSTRUMENTATION_CONTROL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("INTERFACE_ANALYSIS", "AVAILABLE", true, null, "Tool-independent."),
    cap("ENGINEERING_REVIEW", "AVAILABLE", true, null, "Composes Engineering Review."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  MATERIALS: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("DOCUMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  SAFETY: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("ENGINEERING_REVIEW", "AVAILABLE", true, null, "Composes Engineering Review."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
  ENVIRONMENTAL: [
    cap("CONTEXT_INTERPRETATION", "AVAILABLE", true, null, "Tool-independent."),
    cap("DOCUMENT_REVIEW", "AVAILABLE", true, null, "Tool-independent."),
    cap("OPTIMIZATION", "NOT_CERTIFIED", false, null, "Not implemented."),
  ],
};

const DEFAULT_STANDARDS: Partial<Record<CanonicalDisciplineCode, DisciplineStandardReference[]>> = {
  STRUCTURAL: STRUCTURAL_STANDARDS,
  PIPING: [{ standardCode: "ASME B31.3", edition: null, sourceReference: "ASME (reference only)", applicability: "process piping", status: "CONFIGURED", effectiveDate: null }],
  ELECTRICAL: [{ standardCode: "AS/NZS 3000", edition: null, sourceReference: "Standards Australia (reference only)", applicability: "wiring rules", status: "CONFIGURED", effectiveDate: null }],
};

function defaultBindings(code: CanonicalDisciplineCode, tenantId: string): DisciplineToolBinding[] {
  if (code !== "STRUCTURAL") return [];
  return [
    {
      id: `catalog:${code}:LINEAR_STRUCTURAL_ANALYSIS:spacegass`,
      tenantId,
      workspaceId: null,
      disciplineCode: "STRUCTURAL",
      capabilityKey: "LINEAR_STRUCTURAL_ANALYSIS",
      externalToolProfileId: null,
      toolCode: "spacegass",
      certificationStatus: "NOT_CERTIFIED",
      priority: 1,
    },
  ];
}

export function buildDefaultDisciplineProfile(input: {
  tenantId: string;
  code: CanonicalDisciplineCode;
  now?: string;
}): DisciplineProfile {
  const entry = DISCIPLINE_CATALOG.find((row) => row.code === input.code)!;
  const now = input.now ?? new Date().toISOString();
  const tools = input.code === "STRUCTURAL" ? [defaultSpaceGassToolView()] : [];
  const capabilities = applyEffectiveCapabilities(DEFAULT_CAPS[input.code], tools);
  return {
    id: `catalog:${entry.disciplineKey}`,
    tenantId: input.tenantId,
    code: input.code,
    disciplineKey: DISCIPLINE_KEY_BY_CODE[input.code],
    name: entry.name,
    description: entry.description,
    enabled: true,
    status: "active",
    ownerId: null,
    capabilities,
    standards: DEFAULT_STANDARDS[input.code] ?? [],
    toolBindings: defaultBindings(input.code, input.tenantId),
    readiness: deriveDisciplineReadiness(capabilities),
    createdAt: now,
    updatedAt: now,
  };
}

export function buildDefaultDisciplineCatalog(tenantId: string): DisciplineProfile[] {
  return DISCIPLINE_CATALOG.map((row) => buildDefaultDisciplineProfile({ tenantId, code: row.code }));
}
