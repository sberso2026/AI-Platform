/**
 * Phase 15G Customer Assurance readiness flags.
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
  automaticSecurityApprovalEnabled,
  FrameworkMappingRegistryReady,
  SecurityAssuranceFoundationReady,
  SecurityControlRegistryReady,
  SecurityEvidenceRegistryReady,
} from "./foundation-flags";
import {
  automaticAuthorizationMutationEnabled,
  automaticRlsMutationEnabled,
  IsolationAssuranceReady,
  AiTrustRuntimeImplemented,
} from "./isolation-flags";
import { AiDataSecurityReady } from "./ai-data-flags";
import { SecureComputeAssuranceReady } from "./secure-compute-flags";
import {
  ComplianceIntelligenceReady,
  automaticCertificationEnabled,
  automaticComplianceClaimEnabled,
  duplicateSecurityControlRegistryDetected,
  duplicateSecurityEvidenceRegistryDetected,
} from "./compliance-intelligence-flags";

export const CustomerAssuranceImplemented = true as const;
export const CustomerAssuranceProfileReady = true as const;
export const AssuranceDisclosurePolicyReady = true as const;
export const AssuranceClaimRegistryReady = true as const;
export const AssuranceDocumentRegistryReady = true as const;
export const CustomerAssurancePackageReady = true as const;
export const SecurityQuestionnaireMappingReady = true as const;
export const CustomerAssuranceUiReady = true as const;
export const CustomerAssuranceDisclosureAuditReady = true as const;

export const automaticCustomerAssurancePublicationEnabled = false as const;
export const automaticExternalDisclosureEnabled = false as const;

export const S07ExternalPenTestComplete = false as const;
/** Closed by Phase 16B Platform Identity enterprise SSO. */
export const S08CustomerSsoProductionReady = true as const;

export const duplicateControlRegistryDetected = false as const;
export const duplicateEvidenceRegistryDetected = false as const;
export const duplicateComplianceStackDetected = false as const;
export const duplicateAssuranceStackDetected = false as const;

/** Set true only after Phase 15G certification PASS. */
export const phase15HReady = true as const;

export function getSecurityAssuranceCustomerAssuranceDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    FrameworkMappingRegistryReady,
    SecurityControlRegistryReady,
    SecurityEvidenceRegistryReady,
    IsolationAssuranceReady,
    AiDataSecurityReady,
    SecureComputeAssuranceReady,
    ComplianceIntelligenceReady,
    ComplianceIntelligenceImplemented,
    CustomerAssuranceImplemented,
    CustomerAssuranceProfileReady,
    AssuranceDisclosurePolicyReady,
    AssuranceClaimRegistryReady,
    AssuranceDocumentRegistryReady,
    CustomerAssurancePackageReady,
    SecurityQuestionnaireMappingReady,
    CustomerAssuranceUiReady,
    CustomerAssuranceDisclosureAuditReady,
    automaticCertificationEnabled,
    automaticComplianceClaimEnabled,
    automaticCustomerAssurancePublicationEnabled,
    automaticExternalDisclosureEnabled,
    automaticSecurityApprovalEnabled,
    automaticRemediationEnabled,
    automaticAuthorizationMutationEnabled,
    automaticRlsMutationEnabled,
    CustomerTrustCenterImplemented,
    S07ExternalPenTestComplete,
    S08CustomerSsoProductionReady,
    SecurityIntelligenceImplemented,
    AiTrustRuntimeImplemented,
    duplicateControlRegistryDetected,
    duplicateEvidenceRegistryDetected,
    duplicateSecurityControlRegistryDetected,
    duplicateSecurityEvidenceRegistryDetected,
    duplicatePolicyEngineDetected,
    duplicateIdentityProviderDetected,
    duplicateAuditSystemDetected,
    duplicateWorkflowEngineDetected,
    duplicateEventBusDetected,
    duplicateFileStoreDetected,
    duplicateComplianceStackDetected,
    duplicateAssuranceStackDetected,
    duplicateAiRuntimeDetected,
    duplicateToolFrameworkDetected,
    duplicateExecutionHostDetected,
    duplicateKnowledgeGraphDetected,
    EngineeringOSV1Intact,
    ProjectIntelligenceV1Intact,
    InspectionIntelligenceV1Intact,
    AssetIntelligenceV1Intact,
    ProjectControlsV1Intact,
    DigitalTwinV1Intact,
    EngineeringModelInteroperabilityV1Intact,
    phase15HReady,
  } as const;
}
