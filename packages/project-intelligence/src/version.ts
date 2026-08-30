/**
 * Project Intelligence release identity.
 *
 * Historical V1 certification contract (Phase 8I) is immutable.
 * Current application release follows ADR_APPLICATION_RELEASE_IDENTITY.
 */
export const PROJECT_INTELLIGENCE_PRODUCT_NAME = "Project Intelligence" as const;
export const PROJECT_INTELLIGENCE_PRODUCT_SLUG = "project-intelligence" as const;

/** Historical Phase 8I Product GA. Do not treat as current product identity. */
export const PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG = "project-intelligence-v1.0.0" as const;
export const PROJECT_INTELLIGENCE_V1_CERTIFIED_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;

/**
 * Current application release identity (MINOR vs V1: additive capabilities,
 * compatible public contracts, unchanged schema, same application key).
 * Declared tag is not created by identity-policy work; promotion is separate.
 */
export const PROJECT_INTELLIGENCE_VERSION = "1.1.0" as const;
export const PROJECT_INTELLIGENCE_RELEASE_TAG = "project-intelligence-v1.1.0" as const;
export const PROJECT_INTELLIGENCE_RELEASE_SEMVER_LEVEL = "minor" as const;

/** Required Platform / Engineering OS compatibility floor for PI V1 contracts. */
export const PROJECT_INTELLIGENCE_REQUIRED_PLATFORM_PHASE = "7B" as const;
export const PROJECT_INTELLIGENCE_REQUIRED_ENGINEERING_OS_PHASE = "8A" as const;

export const PROJECT_INTELLIGENCE_V1_FEATURE_IDS = [
  "document_intelligence",
  "meeting_intelligence",
  "findings_intelligence",
  "reporting_intelligence",
  "knowledge_intelligence",
  "engineering_reasoning_assistant",
] as const;

export type ProjectIntelligenceV1FeatureId = (typeof PROJECT_INTELLIGENCE_V1_FEATURE_IDS)[number];

export type ProjectIntelligenceHistoricalCertification = {
  version: typeof PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION;
  tag: typeof PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG;
  certifiedCommit: typeof PROJECT_INTELLIGENCE_V1_CERTIFIED_COMMIT;
};

export type ProjectIntelligenceVersionDeclaration = {
  productName: typeof PROJECT_INTELLIGENCE_PRODUCT_NAME;
  moduleKey: "project_intelligence";
  version: typeof PROJECT_INTELLIGENCE_VERSION;
  releaseTag: typeof PROJECT_INTELLIGENCE_RELEASE_TAG;
  requiredPlatformPhase: typeof PROJECT_INTELLIGENCE_REQUIRED_PLATFORM_PHASE;
  requiredEngineeringOsPhase: typeof PROJECT_INTELLIGENCE_REQUIRED_ENGINEERING_OS_PHASE;
  featureIds: readonly ProjectIntelligenceV1FeatureId[];
  /** V1 feature public contracts remain frozen at 1.0.0. */
  freeze: true;
  historicalCertification: ProjectIntelligenceHistoricalCertification;
};

export function getProjectIntelligenceHistoricalCertification(): ProjectIntelligenceHistoricalCertification {
  return {
    version: PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION,
    tag: PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG,
    certifiedCommit: PROJECT_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  };
}

export function getProjectIntelligenceVersionDeclaration(): ProjectIntelligenceVersionDeclaration {
  return {
    productName: PROJECT_INTELLIGENCE_PRODUCT_NAME,
    moduleKey: "project_intelligence",
    version: PROJECT_INTELLIGENCE_VERSION,
    releaseTag: PROJECT_INTELLIGENCE_RELEASE_TAG,
    requiredPlatformPhase: PROJECT_INTELLIGENCE_REQUIRED_PLATFORM_PHASE,
    requiredEngineeringOsPhase: PROJECT_INTELLIGENCE_REQUIRED_ENGINEERING_OS_PHASE,
    featureIds: PROJECT_INTELLIGENCE_V1_FEATURE_IDS,
    freeze: true,
    historicalCertification: getProjectIntelligenceHistoricalCertification(),
  };
}

export function assertProjectIntelligenceVersionConsistency(input: {
  packageVersion: string;
  moduleVersion: string;
  featureVersions: readonly string[];
}): void {
  if (input.packageVersion !== PROJECT_INTELLIGENCE_VERSION) {
    throw new Error(
      `Package version ${input.packageVersion} must equal current release ${PROJECT_INTELLIGENCE_VERSION}`,
    );
  }
  if (input.moduleVersion !== PROJECT_INTELLIGENCE_VERSION) {
    throw new Error(
      `Module version ${input.moduleVersion} must equal current release ${PROJECT_INTELLIGENCE_VERSION}`,
    );
  }
  for (const v of input.featureVersions) {
    if (v !== PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION) {
      throw new Error(
        `V1 feature contract version ${v} must equal ${PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION}`,
      );
    }
  }
}
