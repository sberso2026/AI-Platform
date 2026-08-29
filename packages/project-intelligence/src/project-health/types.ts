/**
 * PI-0 Project Health types. Distinct from operational app health in
 * `src/health/health-checks.ts`.
 */

export const PROJECT_HEALTH_DIMENSIONS = [
  "schedule",
  "cost",
  "progress",
  "risk",
  "quality",
  "change",
  "decisions_actions",
] as const;

export type ProjectHealthDimension = (typeof PROJECT_HEALTH_DIMENSIONS)[number];

export const PROJECT_HEALTH_STATES = ["green", "amber", "red", "unknown"] as const;
export type ProjectHealthState = (typeof PROJECT_HEALTH_STATES)[number];

export const PROJECT_HEALTH_OVERALL_CLASSIFICATIONS = ["GREEN", "AMBER", "RED", "UNKNOWN"] as const;
export type ProjectHealthOverallClassification =
  (typeof PROJECT_HEALTH_OVERALL_CLASSIFICATIONS)[number];

export const PROJECT_HEALTH_SOURCE_DOMAINS = [
  "engineering_core",
  "project_controls",
  "project_intelligence",
  "inspection_intelligence",
] as const;

export type ProjectHealthSourceDomain = (typeof PROJECT_HEALTH_SOURCE_DOMAINS)[number];

/** Reference-only pointer. Never a copied canonical record. */
export type ProjectHealthEvidenceReference = {
  sourceDomain: ProjectHealthSourceDomain;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
  sourceVersion?: string;
  storesCanonicalCopy: false;
};

export type ProjectHealthDimensionResult = {
  dimension: ProjectHealthDimension;
  state: ProjectHealthState;
  reasonCodes: readonly string[];
  evidenceReferences: readonly ProjectHealthEvidenceReference[];
  source: ProjectHealthSourceDomain | "none";
  evaluatedAt: string;
  dataFreshness?: string;
  limitations: readonly string[];
};

export type ProjectHealthOverallResult = {
  classification: ProjectHealthOverallClassification;
  contributingDimensions: readonly ProjectHealthDimensionResult[];
  unknownDimensions: readonly ProjectHealthDimension[];
  knownRedDimensions: readonly ProjectHealthDimension[];
  knownAmberDimensions: readonly ProjectHealthDimension[];
  knownGreenDimensions: readonly ProjectHealthDimension[];
  policyId: "project_health_overall_v1";
  numericalScoreImplemented: false;
};

export type ProjectHealthAssessment = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  evaluatedAt: string;
  dimensions: readonly ProjectHealthDimensionResult[];
  overall: ProjectHealthOverallResult;
  limitations: readonly string[];
  readOnly: true;
  persisted: false;
};
