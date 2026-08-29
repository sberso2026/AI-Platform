import { PROJECT_HEALTH_DIMENSIONS, type ProjectHealthDimension, type ProjectHealthDimensionResult, type ProjectHealthOverallResult } from "./types";

/**
 * Overall classification policy `project_health_overall_v1`:
 * 1. RED if any dimension is red. Unknown dimensions stay listed as unknown.
 * 2. Else AMBER if any dimension is amber.
 * 3. Else GREEN only if every dimension is green.
 * 4. Else UNKNOWN. Missing dimensions are never treated as green.
 * Numerical 0–100 scores are forbidden.
 */
export const PROJECT_HEALTH_OVERALL_POLICY_ID = "project_health_overall_v1" as const;

export function classifyOverallProjectHealth(
  dimensions: readonly ProjectHealthDimensionResult[],
): ProjectHealthOverallResult {
  const byId = new Map(dimensions.map((row) => [row.dimension, row]));
  const ordered = PROJECT_HEALTH_DIMENSIONS.map((id) => byId.get(id)).filter(
    (row): row is ProjectHealthDimensionResult => Boolean(row),
  );

  const unknownDimensions: ProjectHealthDimension[] = [];
  const knownRedDimensions: ProjectHealthDimension[] = [];
  const knownAmberDimensions: ProjectHealthDimension[] = [];
  const knownGreenDimensions: ProjectHealthDimension[] = [];

  for (const row of ordered) {
    if (row.state === "red") knownRedDimensions.push(row.dimension);
    else if (row.state === "amber") knownAmberDimensions.push(row.dimension);
    else if (row.state === "green") knownGreenDimensions.push(row.dimension);
    else unknownDimensions.push(row.dimension);
  }

  for (const id of PROJECT_HEALTH_DIMENSIONS) {
    if (!byId.has(id) && !unknownDimensions.includes(id)) {
      unknownDimensions.push(id);
    }
  }

  let classification: ProjectHealthOverallResult["classification"] = "UNKNOWN";
  if (knownRedDimensions.length > 0) classification = "RED";
  else if (knownAmberDimensions.length > 0) classification = "AMBER";
  else if (unknownDimensions.length === 0 && knownGreenDimensions.length === PROJECT_HEALTH_DIMENSIONS.length) {
    classification = "GREEN";
  }

  return {
    classification,
    contributingDimensions: ordered,
    unknownDimensions,
    knownRedDimensions,
    knownAmberDimensions,
    knownGreenDimensions,
    policyId: PROJECT_HEALTH_OVERALL_POLICY_ID,
    numericalScoreImplemented: false,
  };
}
