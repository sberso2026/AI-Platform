/**
 * Phase 15B foundation readiness flags.
 * Shared anti-duplication / V1 intact flags remain in discovery-flags.ts.
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

export const SecurityAssuranceFoundationReady = true as const;
export const SecurityControlRegistryReady = true as const;
export const SecurityEvidenceRegistryReady = true as const;
export const SecurityAssessmentEngineReady = true as const;
export const SecurityFindingRegistryReady = true as const;
export const SecurityExceptionRegistryReady = true as const;
export const SecurityPostureCompositionReady = true as const;
export const FrameworkMappingRegistryReady = true as const;

export const SecurityEvidenceProvenanceEnforced = true as const;
export const SecurityEvidenceFreshnessEnforced = true as const;

export const automaticSecurityApprovalEnabled = false as const;
export const automaticExceptionApprovalEnabled = false as const;
export const automaticRemediationEnabled = false as const;

/** IsolationAssuranceRuntimeImplemented lives in isolation-flags.ts (Phase 15C). */
/** SecureComputeAssuranceRuntimeImplemented lives in secure-compute-flags.ts (Phase 15E). */
export const AiTrustRuntimeImplemented = false as const;
export const ThreatIntelligenceRuntimeImplemented = false as const;

export const implementsOwnAiStack = false as const;

/** Set true only after Phase 15B certification PASS. */
export const phase15CReady = true as const;

export function getSecurityAssuranceFoundationDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    SecurityControlRegistryReady,
    SecurityEvidenceRegistryReady,
    SecurityAssessmentEngineReady,
    SecurityFindingRegistryReady,
    SecurityExceptionRegistryReady,
    SecurityPostureCompositionReady,
    FrameworkMappingRegistryReady,
    SecurityEvidenceProvenanceEnforced,
    SecurityEvidenceFreshnessEnforced,
    automaticSecurityApprovalEnabled,
    automaticExceptionApprovalEnabled,
    automaticRemediationEnabled,
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
    phase15CReady,
  } as const;
}
