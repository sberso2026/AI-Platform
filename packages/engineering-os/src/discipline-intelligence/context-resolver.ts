import type { CanonicalDisciplineCode, DisciplineObjectKind } from "./catalog";
import { DISCIPLINE_CODE_BY_KEY, resolveDisciplineCode } from "./catalog";
import type { DisciplineParticipation } from "./types";

export type DisciplineContextInput = {
  objectKind: DisciplineObjectKind;
  explicitDisciplineKeys?: string[];
  explicitDisciplineCodes?: string[];
  documentDisciplineKey?: string | null;
  assetTypeKey?: string | null;
  interfaceParticipants?: DisciplineParticipation[];
  systemParticipants?: DisciplineParticipation[];
  requirementAllocations?: string[];
  projectDisciplines?: CanonicalDisciplineCode[];
  reviewParticipants?: DisciplineParticipation[];
  optimizationParticipants?: DisciplineParticipation[];
};

const ASSET_TYPE_DISCIPLINES: Record<string, CanonicalDisciplineCode[]> = {
  structure: ["STRUCTURAL"],
  equipment: ["MECHANICAL"],
  piping_system: ["PIPING"],
  electrical_system: ["ELECTRICAL"],
  instrument: ["INSTRUMENTATION_CONTROL"],
  building: ["STRUCTURAL", "CIVIL"],
};

function add(set: Set<CanonicalDisciplineCode>, code: CanonicalDisciplineCode | null | undefined): void {
  if (code) set.add(code);
}

function fromKey(key: string | null | undefined): CanonicalDisciplineCode | null {
  if (!key) return null;
  return DISCIPLINE_CODE_BY_KEY[key] ?? resolveDisciplineCode({ disciplineKey: key, code: key });
}

/**
 * Deterministic discipline context. Explicit metadata wins.
 * LLM classification is never canonical ownership.
 */
export function resolveDisciplineContext(input: DisciplineContextInput): CanonicalDisciplineCode[] {
  const found = new Set<CanonicalDisciplineCode>();
  for (const key of input.explicitDisciplineKeys ?? []) add(found, fromKey(key));
  for (const code of input.explicitDisciplineCodes ?? []) add(found, resolveDisciplineCode({ code }));
  add(found, fromKey(input.documentDisciplineKey ?? null));
  for (const code of ASSET_TYPE_DISCIPLINES[input.assetTypeKey ?? ""] ?? []) add(found, code);
  for (const row of input.interfaceParticipants ?? []) add(found, row.disciplineCode);
  for (const row of input.systemParticipants ?? []) add(found, row.disciplineCode);
  for (const key of input.requirementAllocations ?? []) add(found, fromKey(key));
  for (const code of input.projectDisciplines ?? []) add(found, code);
  for (const row of input.reviewParticipants ?? []) add(found, row.disciplineCode);
  for (const row of input.optimizationParticipants ?? []) add(found, row.disciplineCode);

  const order: CanonicalDisciplineCode[] = [
    "PROCESS",
    "MECHANICAL",
    "STRUCTURAL",
    "PIPING",
    "ELECTRICAL",
    "INSTRUMENTATION_CONTROL",
    "CIVIL",
    "GEOTECHNICAL",
    "MATERIALS",
    "SAFETY",
    "ENVIRONMENTAL",
  ];
  return order.filter((code) => found.has(code));
}

export function crusherSystemFixtureContext(): DisciplineContextInput {
  const codes: CanonicalDisciplineCode[] = [
    "PROCESS",
    "MECHANICAL",
    "STRUCTURAL",
    "PIPING",
    "ELECTRICAL",
    "INSTRUMENTATION_CONTROL",
    "CIVIL",
  ];
  return {
    objectKind: "SYSTEM",
    explicitDisciplineCodes: codes,
    systemParticipants: codes.map((disciplineCode) => ({
      objectKind: "SYSTEM",
      objectId: "sys-crusher-primary",
      disciplineCode,
      role: disciplineCode === "PROCESS" ? "LEAD" : "CONTRIBUTING",
    })),
    assetTypeKey: "equipment",
  };
}
