import type { EngineeringAssuranceCondition } from "./types";

export function summarizeAssuranceConditions(conditions: EngineeringAssuranceCondition[]) {
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byDiscipline: Record<string, number> = {};
  const byMateriality: Record<string, number> = {};
  const byObjectType: Record<string, number> = {};
  const byRule: Record<string, number> = {};
  for (const row of conditions) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    byType[row.conditionType] = (byType[row.conditionType] ?? 0) + 1;
    byDiscipline[row.discipline ?? "unassigned"] = (byDiscipline[row.discipline ?? "unassigned"] ?? 0) + 1;
    byMateriality[row.materiality] = (byMateriality[row.materiality] ?? 0) + 1;
    byObjectType[row.rootObjectType] = (byObjectType[row.rootObjectType] ?? 0) + 1;
    byRule[row.ruleId] = (byRule[row.ruleId] ?? 0) + 1;
  }
  return {
    total: conditions.length,
    byStatus,
    byType,
    byDiscipline,
    byMateriality,
    byObjectType,
    byRule,
    universalAssuranceScore: false as const,
    engineeringQualityScore: false as const,
    digitalThreadHealthScore: false as const,
  };
}

export const FORBIDDEN_ASSURANCE_SCORE_NAMES = [
  "Engineering Assurance Score",
  "Engineering Quality Score",
  "Digital Thread Health Score",
  "Traceability Score",
  "Project Engineering Score",
] as const;
