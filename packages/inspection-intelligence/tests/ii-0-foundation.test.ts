import { describe, expect, it } from "vitest";
import { INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY } from "../src/next-gen/commerce-boundary";
import {
  INSPECTION_COUPLING_BOUNDARY,
  INSPECTION_INTELLIGENCE_MUST_NOT_OWN,
  SCHEMA_CHANGED,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  II_HOSTED_PERSISTENCE_WIRED,
  II_1_READY,
  assertInspectionIntelligenceOwnershipLocks,
  autonomousConditionRatingCertificationEnabled,
  autonomousInspectionApprovalEnabled,
  autonomousRemediationApprovalEnabled,
  directProviderAccessFromInspectionIntelligence,
  duplicateAgentRuntimeDetected,
  duplicateCommerceStackDetected,
  duplicateEngineeringTruthModelDetected,
  duplicateIdentityStackDetected,
  duplicateIntegrationStackDetected,
  duplicateKnowledgeGraphDetected,
  duplicateWorkflowEngineDetected,
  externalWritesEnabled,
  implementsOwnAiStack,
} from "../src/next-gen/ownership";
import { INSPECTION_INTELLIGENCE_PLATFORM_REUSE } from "../src/next-gen/platform-reuse";
import {
  INSPECTION_FINDINGS_ARE_NOT_PI_FINDINGS,
  INSPECTION_INTELLIGENCE_NEXT_GEN_SURFACES,
  INSPECTION_REMEDIATION_LINKS_CORE_ACTIONS_WHEN_REQUIRED,
} from "../src/next-gen/product-surface";
import { INSPECTION_INTELLIGENCE_PI_PATTERN_REUSE } from "../src/next-gen/pi-pattern-reuse";
import {
  INSPECTION_V1_CANONICAL_TABLES,
  INSPECTION_V1_ENGINE_PRIMITIVES,
  INSPECTION_V1_REPLACEMENT_MODELS_CREATED,
} from "../src/next-gen/v1-engine";
import {
  INSPECTION_INTELLIGENCE_II_0_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_1_READY,
  INSPECTION_INTELLIGENCE_NEXT_GA_VERSION,
  INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS,
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG,
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION,
  INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  INSPECTION_INTELLIGENCE_VERSION,
  getInspectionIntelligenceDomainDeclaration,
  getInspectionIntelligenceHistoricalCertification,
} from "../src/version";

describe("II-0 Inspection Intelligence next-gen foundation", () => {
  it("preserves historical V1 identity without assigning a next GA version", () => {
    const historical = getInspectionIntelligenceHistoricalCertification();
    expect(historical.version).toBe("1.0.0");
    expect(historical.tag).toBe("inspection-intelligence-v1.0.0");
    expect(historical.certifiedCommit).toBe(
      "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09",
    );
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION).toBe("1.0.0");
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG).toBe(
      "inspection-intelligence-v1.0.0",
    );
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("1.0.0");
    expect(INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS).toBe("unreleased");
    expect(INSPECTION_INTELLIGENCE_NEXT_GA_VERSION).toBeNull();
    expect(INSPECTION_INTELLIGENCE_II_0_IMPLEMENTED).toBe(true);
    expect(INSPECTION_INTELLIGENCE_II_1_READY).toBe(true);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.historicalCertification.tag).toBe("inspection-intelligence-v1.0.0");
    expect(decl.currentRelease.status).toBe("unreleased");
    expect(decl.currentRelease.ii0Implemented).toBe(true);
    expect(decl.currentRelease.ii1Ready).toBe(true);
  });

  it("freezes canonical ownership and architecture guardrails", () => {
    expect(() => assertInspectionIntelligenceOwnershipLocks()).not.toThrow();
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateAgentRuntimeDetected).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(duplicateIntegrationStackDetected).toBe(false);
    expect(duplicateWorkflowEngineDetected).toBe(false);
    expect(duplicateIdentityStackDetected).toBe(false);
    expect(duplicateCommerceStackDetected).toBe(false);
    expect(duplicateEngineeringTruthModelDetected).toBe(false);
    expect(directProviderAccessFromInspectionIntelligence).toBe(false);
    expect(autonomousInspectionApprovalEnabled).toBe(false);
    expect(autonomousConditionRatingCertificationEnabled).toBe(false);
    expect(autonomousRemediationApprovalEnabled).toBe(false);
    expect(externalWritesEnabled).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(INSPECTION_COUPLING_BOUNDARY).toBe("inspection_target");
    expect(INSPECTION_INTELLIGENCE_MUST_NOT_OWN).toContain("project_intelligence_findings");
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(false);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(false);
    expect(II_HOSTED_PERSISTENCE_WIRED).toBe(false);
    expect(II_1_READY).toBe(true);
  });

  it("locks platform reuse and PI pattern reuse without PI project truth", () => {
    expect(INSPECTION_INTELLIGENCE_PLATFORM_REUSE.platformCommerce).toBe(true);
    expect(INSPECTION_INTELLIGENCE_PLATFORM_REUSE.secondInfrastructureStackForbidden).toBe(true);
    expect(INSPECTION_INTELLIGENCE_PI_PATTERN_REUSE.importProjectIntelligenceProjectTruth).toBe(
      false,
    );
    expect(INSPECTION_INTELLIGENCE_PI_PATTERN_REUSE.importProjectIntelligenceFindings).toBe(false);
    expect(INSPECTION_INTELLIGENCE_PI_PATTERN_REUSE.commandCentreComposition).toBe(true);
  });

  it("defines next-gen surfaces without implementing them and without replacing V1 models", () => {
    expect(INSPECTION_INTELLIGENCE_NEXT_GEN_SURFACES.every((s) => s.implementedInIi0 === false)).toBe(
      true,
    );
    expect(INSPECTION_FINDINGS_ARE_NOT_PI_FINDINGS).toBe(true);
    expect(INSPECTION_REMEDIATION_LINKS_CORE_ACTIONS_WHEN_REQUIRED).toBe(true);
    expect(INSPECTION_V1_REPLACEMENT_MODELS_CREATED).toBe(false);
    expect(INSPECTION_V1_ENGINE_PRIMITIVES).toContain("sessions");
    expect(INSPECTION_V1_CANONICAL_TABLES).toContain("inspection_plans");
  });

  it("reconciles commerce as an Engineering OS application", () => {
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.parentProduct).toBe("engineering-os");
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.entitlementModel).toBe(
      "application_access_on_engineering_os_plans",
    );
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneLicensingCreated).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.businessOsEntitlementRequired).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.createStandalonePlansInIi0).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.catalogCommerceReconciled).toBe(true);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.planMismatchResolved).toBe(true);
  });
});
