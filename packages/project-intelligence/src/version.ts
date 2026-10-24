/**
 * Phase 8I — Single authoritative Project Intelligence V1.0 version declaration.
 * Consumed by module manifest, release artifact, About UI, health, telemetry, certification.
 */
export const PROJECT_INTELLIGENCE_PRODUCT_NAME = "Project Intelligence" as const;
export const PROJECT_INTELLIGENCE_VERSION = "1.0.0" as const;
export const PROJECT_INTELLIGENCE_RELEASE_TAG = "project-intelligence-v1.0.0" as const;

/** Required Platform / Engineering OS compatibility floor for PI V1.0. */
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

export type ProjectIntelligenceVersionDeclaration = {
  productName: typeof PROJECT_INTELLIGENCE_PRODUCT_NAME;
  moduleKey: "project_intelligence";
  version: typeof PROJECT_INTELLIGENCE_VERSION;
  releaseTag: typeof PROJECT_INTELLIGENCE_RELEASE_TAG;
  requiredPlatformPhase: typeof PROJECT_INTELLIGENCE_REQUIRED_PLATFORM_PHASE;
  requiredEngineeringOsPhase: typeof PROJECT_INTELLIGENCE_REQUIRED_ENGINEERING_OS_PHASE;
  featureIds: readonly ProjectIntelligenceV1FeatureId[];
  freeze: true;
};

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
  };
}

export function assertProjectIntelligenceVersionConsistency(input: {
  packageVersion: string;
  moduleVersion: string;
  featureVersions: readonly string[];
}): void {
  if (input.packageVersion !== PROJECT_INTELLIGENCE_VERSION) {
    throw new Error(
      `Package version ${input.packageVersion} must equal ${PROJECT_INTELLIGENCE_VERSION}`,
    );
  }
  if (input.moduleVersion !== PROJECT_INTELLIGENCE_VERSION) {
    throw new Error(
      `Module version ${input.moduleVersion} must equal ${PROJECT_INTELLIGENCE_VERSION}`,
    );
  }
  for (const v of input.featureVersions) {
    if (v !== PROJECT_INTELLIGENCE_VERSION) {
      throw new Error(`Feature version ${v} must equal ${PROJECT_INTELLIGENCE_VERSION}`);
    }
  }
}
