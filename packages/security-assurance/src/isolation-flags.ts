/**
 * Phase 15C Isolation Assurance readiness flags.
 */

import {
  AssetIntelligenceV1Intact,
  ComplianceIntelligenceImplemented,
  CustomerTrustCenterImplemented,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSV1Intact,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  SecurityIntelligenceImplemented,
  duplicateAiRuntimeDetected,
  duplicateAuditSystemDetected,
  duplicateEventBusDetected,
  duplicateExecutionHostDetected,
  duplicateFileStoreDetected,
  duplicateIdentityProviderDetected,
  duplicateKnowledgeGraphDetected,
  duplicatePolicyEngineDetected,
  duplicateToolFrameworkDetected,
  duplicateWorkflowEngineDetected,
} from "./discovery-flags";
import {
  automaticRemediationEnabled,
  implementsOwnAiStack,
  SecurityAssuranceFoundationReady,
} from "./foundation-flags";

export const IsolationAssuranceRuntimeImplemented = true as const;
export const IsolationAssuranceReady = true as const;
export const IsolationProbeRegistryReady = true as const;
export const IsolationEvidenceReady = true as const;
export const IsolationAssessmentReady = true as const;
export const IsolationPostureIntegrationReady = true as const;

export const DatabaseIsolationAssessed = true as const;
export const ApiIsolationAssessed = true as const;
export const FileIsolationAssessed = true as const;
export const SearchIsolationAssessed = true as const;
export const KnowledgeGraphIsolationAssessed = true as const;
export const AiContextIsolationAssessed = true as const;
export const BackgroundJobIsolationAssessed = true as const;
export const EventIsolationAssessed = true as const;
export const ExecutionHostIsolationAssessed = true as const;
export const SolverWorkspaceIsolationAssessed = true as const;

export const knownCrossTenantLeakageDetected = false as const;
export const knownCrossWorkspaceLeakageDetected = false as const;

export const automaticAuthorizationMutationEnabled = false as const;
export const automaticRlsMutationEnabled = false as const;

export const AiTrustRuntimeImplemented = false as const;
export const ThreatIntelligenceRuntimeImplemented = false as const;

/** Set true only after Phase 15C certification PASS. */
export const phase15DReady = true as const;

export function getSecurityAssuranceIsolationDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    IsolationAssuranceRuntimeImplemented,
    IsolationAssuranceReady,
    IsolationProbeRegistryReady,
    IsolationEvidenceReady,
    IsolationAssessmentReady,
    IsolationPostureIntegrationReady,
    DatabaseIsolationAssessed,
    ApiIsolationAssessed,
    FileIsolationAssessed,
    SearchIsolationAssessed,
    KnowledgeGraphIsolationAssessed,
    AiContextIsolationAssessed,
    BackgroundJobIsolationAssessed,
    EventIsolationAssessed,
    ExecutionHostIsolationAssessed,
    SolverWorkspaceIsolationAssessed,
    knownCrossTenantLeakageDetected,
    knownCrossWorkspaceLeakageDetected,
    automaticRemediationEnabled,
    automaticAuthorizationMutationEnabled,
    automaticRlsMutationEnabled,
    SecurityIntelligenceImplemented,
    ComplianceIntelligenceImplemented,
    AiTrustRuntimeImplemented,
    ThreatIntelligenceRuntimeImplemented,
    CustomerTrustCenterImplemented,
    implementsOwnAiStack,
    duplicateIdentityProviderDetected,
    duplicatePolicyEngineDetected,
    duplicateAuditSystemDetected,
    duplicateAiRuntimeDetected,
    duplicateToolFrameworkDetected,
    duplicateExecutionHostDetected,
    duplicateKnowledgeGraphDetected,
    duplicateWorkflowEngineDetected,
    duplicateFileStoreDetected,
    duplicateEventBusDetected,
    EngineeringOSV1Intact,
    ProjectIntelligenceV1Intact,
    InspectionIntelligenceV1Intact,
    AssetIntelligenceV1Intact,
    ProjectControlsV1Intact,
    DigitalTwinV1Intact,
    EngineeringModelInteroperabilityV1Intact,
    phase15DReady,
  } as const;
}
