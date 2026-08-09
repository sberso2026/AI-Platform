/**
 * Phase 15F Compliance Intelligence readiness flags.
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
  FrameworkMappingRegistryReady,
  implementsOwnAiStack,
  SecurityAssuranceFoundationReady,
  SecurityControlRegistryReady,
  SecurityEvidenceRegistryReady,
} from "./foundation-flags";
import {
  automaticAuthorizationMutationEnabled,
  automaticRlsMutationEnabled,
  IsolationAssuranceReady,
  AiTrustRuntimeImplemented,
  ThreatIntelligenceRuntimeImplemented,
} from "./isolation-flags";
import {
  AiDataSecurityReady,
  duplicateAiStackDetected,
  duplicateSecretManagerDetected,
} from "./ai-data-flags";
import {
  SecureComputeAssuranceReady,
  SecureComputeAssuranceRuntimeImplemented,
} from "./secure-compute-flags";

export const ComplianceIntelligenceReady = true as const;
export const ComplianceFrameworkRegistryImplemented = true as const;
export const ComplianceControlMappingImplemented = true as const;
export const ComplianceEvidenceMappingImplemented = true as const;
export const ComplianceAssessmentImplemented = true as const;
export const ComplianceGapAssessmentImplemented = true as const;
export const ExternalAssuranceRequirementImplemented = true as const;

export const automaticControlCreationEnabled = false as const;
export const automaticCertificationEnabled = false as const;
export const automaticComplianceClaimEnabled = false as const;

export const duplicateSecurityControlRegistryDetected = false as const;
export const duplicateSecurityEvidenceRegistryDetected = false as const;
export const duplicateSecurityAssuranceStackDetected = false as const;

/** Set true only after Phase 15F certification PASS. */
export const phase15GReady = true as const;

export function getSecurityAssuranceComplianceIntelligenceDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    FrameworkMappingRegistryReady,
    SecurityControlRegistryReady,
    SecurityEvidenceRegistryReady,
    IsolationAssuranceReady,
    AiDataSecurityReady,
    SecureComputeAssuranceReady,
    SecureComputeAssuranceRuntimeImplemented,
    ComplianceIntelligenceReady,
    ComplianceIntelligenceImplemented,
    ComplianceFrameworkRegistryImplemented,
    ComplianceControlMappingImplemented,
    ComplianceEvidenceMappingImplemented,
    ComplianceAssessmentImplemented,
    ComplianceGapAssessmentImplemented,
    ExternalAssuranceRequirementImplemented,
    automaticRemediationEnabled,
    automaticControlCreationEnabled,
    automaticCertificationEnabled,
    automaticComplianceClaimEnabled,
    automaticAuthorizationMutationEnabled,
    automaticRlsMutationEnabled,
    SecurityIntelligenceImplemented,
    AiTrustRuntimeImplemented,
    ThreatIntelligenceRuntimeImplemented,
    CustomerTrustCenterImplemented,
    implementsOwnAiStack,
    duplicateSecurityControlRegistryDetected,
    duplicateSecurityEvidenceRegistryDetected,
    duplicatePolicyEngineDetected,
    duplicateAuditSystemDetected,
    duplicateWorkflowEngineDetected,
    duplicateEventBusDetected,
    duplicateSecurityAssuranceStackDetected,
    duplicateAiStackDetected,
    duplicateSecretManagerDetected,
    duplicateIdentityProviderDetected,
    duplicateAiRuntimeDetected,
    duplicateToolFrameworkDetected,
    duplicateExecutionHostDetected,
    duplicateKnowledgeGraphDetected,
    duplicateFileStoreDetected,
    EngineeringOSV1Intact,
    ProjectIntelligenceV1Intact,
    InspectionIntelligenceV1Intact,
    AssetIntelligenceV1Intact,
    ProjectControlsV1Intact,
    DigitalTwinV1Intact,
    EngineeringModelInteroperabilityV1Intact,
    phase15GReady,
  } as const;
}
