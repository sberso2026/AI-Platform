/**
 * Phase 15D AI & Data Security Assurance readiness flags.
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
  SecureComputeAssuranceRuntimeImplemented,
} from "./foundation-flags";
import {
  automaticAuthorizationMutationEnabled,
  automaticRlsMutationEnabled,
  IsolationAssuranceReady,
  IsolationAssuranceRuntimeImplemented,
  AiTrustRuntimeImplemented,
  ThreatIntelligenceRuntimeImplemented,
} from "./isolation-flags";

export const AiDataSecurityReady = true as const;
export const AiDataSecurityRuntimeImplemented = true as const;
export const AiDataSecurityAssessmentImplemented = true as const;
export const AiDataFlowEvidenceImplemented = true as const;
export const ProviderDataHandlingAssuranceImplemented = true as const;
export const SensitiveDataExposureAssessmentImplemented = true as const;

export const duplicateAiStackDetected = false as const;
export const duplicateSecretManagerDetected = false as const;

export { SecureComputeAssuranceRuntimeImplemented };

/** Set true only after Phase 15D certification PASS. */
export const phase15EReady = true as const;

export function getSecurityAssuranceAiDataDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    IsolationAssuranceReady,
    IsolationAssuranceRuntimeImplemented,
    AiDataSecurityReady,
    AiDataSecurityRuntimeImplemented,
    AiDataSecurityAssessmentImplemented,
    AiDataFlowEvidenceImplemented,
    ProviderDataHandlingAssuranceImplemented,
    SensitiveDataExposureAssessmentImplemented,
    automaticRemediationEnabled,
    automaticAuthorizationMutationEnabled,
    automaticRlsMutationEnabled,
    SecurityIntelligenceImplemented,
    ComplianceIntelligenceImplemented,
    AiTrustRuntimeImplemented,
    ThreatIntelligenceRuntimeImplemented,
    SecureComputeAssuranceRuntimeImplemented,
    CustomerTrustCenterImplemented,
    implementsOwnAiStack,
    duplicateAiStackDetected,
    duplicateSecretManagerDetected,
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
    phase15EReady,
  } as const;
}
