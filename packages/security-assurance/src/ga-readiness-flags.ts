/**
 * Phase 15H Security & Assurance V1 GA readiness flags.
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
  SecurityAssuranceFoundationReady,
} from "./foundation-flags";
import { IsolationAssuranceReady, AiTrustRuntimeImplemented } from "./isolation-flags";
import { AiDataSecurityReady } from "./ai-data-flags";
import { SecureComputeAssuranceReady } from "./secure-compute-flags";
import {
  ComplianceIntelligenceReady,
  automaticCertificationEnabled,
  automaticComplianceClaimEnabled,
} from "./compliance-intelligence-flags";
import {
  CustomerAssuranceImplemented,
  S07ExternalPenTestComplete,
  S08CustomerSsoProductionReady,
  automaticCustomerAssurancePublicationEnabled,
  automaticExternalDisclosureEnabled,
  duplicateAssuranceStackDetected,
} from "./customer-assurance-flags";
import { summarizeGaGaps } from "./domain/ga-readiness/gap-register";

export const SecurityAssuranceGaReadinessAssessmentComplete = true as const;
export const SecurityAssuranceV1CapabilityMatrixReady = true as const;
export const SecurityAssuranceV1GaGapRegisterReady = true as const;
export const SecurityAssuranceV1OperationsRunbookReady = true as const;
export const SecurityAssuranceV1CommercialPackagingDefined = true as const;
export const SecurityAssuranceV1ObservabilityDefined = true as const;
export const SecurityAssuranceV1UpgradePathAssessed = true as const;
export const SecurityAssuranceV1UiReadinessMarkerReady = true as const;

/** Contracts remain pre-1.0 until Phase 15I freeze (if authorized). */
export const SecurityAssurancePublicContractsFrozenAt1_0_0 = false as const;
/** Production GA certification is Phase 15I — not automatic from 15H. */
export const securityAssuranceV1GaCertified = false as const;

const _gapDecision = summarizeGaGaps();

if (_gapDecision.openBlockers !== 0 || _gapDecision.openRequiredBeforeGa !== 0) {
  throw new Error(
    "Phase 15H invariant broken: open BLOCKER or REQUIRED_BEFORE_GA gaps remain",
  );
}

/**
 * V1 subsystem GA readiness (distinct from Tier-1 enterprise production).
 * true only when open BLOCKER=0 and open REQUIRED_BEFORE_GA=0.
 */
export const securityAssuranceV1GaReady = true as const;

/** Unlock Phase 15I only when V1 GA readiness decision is true. */
export const phase15IReady = true as const;

export function getSecurityAssuranceGaReadinessDeclaration() {
  return {
    SecurityAssuranceFoundationReady,
    ComplianceIntelligenceReady,
    ComplianceIntelligenceImplemented,
    CustomerAssuranceImplemented,
    SecurityAssuranceGaReadinessAssessmentComplete,
    SecurityAssuranceV1CapabilityMatrixReady,
    SecurityAssuranceV1GaGapRegisterReady,
    SecurityAssuranceV1OperationsRunbookReady,
    SecurityAssuranceV1CommercialPackagingDefined,
    SecurityAssuranceV1ObservabilityDefined,
    SecurityAssuranceV1UpgradePathAssessed,
    SecurityAssuranceV1UiReadinessMarkerReady,
    SecurityAssurancePublicContractsFrozenAt1_0_0,
    securityAssuranceV1GaReady,
    securityAssuranceV1GaCertified,
    phase15IReady,
    openBlockers: _gapDecision.openBlockers,
    openRequiredBeforeGa: _gapDecision.openRequiredBeforeGa,
    unknownGapClassifications: _gapDecision.unknownClassifications,
    automaticCertificationEnabled,
    automaticComplianceClaimEnabled,
    automaticCustomerAssurancePublicationEnabled,
    automaticExternalDisclosureEnabled,
    automaticSecurityApprovalEnabled,
    automaticRemediationEnabled,
    CustomerTrustCenterImplemented,
    S07ExternalPenTestComplete,
    S08CustomerSsoProductionReady,
    SecurityIntelligenceImplemented,
    AiTrustRuntimeImplemented,
    IsolationAssuranceReady,
    AiDataSecurityReady,
    SecureComputeAssuranceReady,
    duplicatePolicyEngineDetected,
    duplicateIdentityProviderDetected,
    duplicateAuditSystemDetected,
    duplicateAiRuntimeDetected,
    duplicateToolFrameworkDetected,
    duplicateExecutionHostDetected,
    duplicateFileStoreDetected,
    duplicateEventBusDetected,
    duplicateWorkflowEngineDetected,
    duplicateKnowledgeGraphDetected,
    duplicateAssuranceStackDetected,
    EngineeringOSV1Intact,
    ProjectIntelligenceV1Intact,
    InspectionIntelligenceV1Intact,
    AssetIntelligenceV1Intact,
    ProjectControlsV1Intact,
    DigitalTwinV1Intact,
    EngineeringModelInteroperabilityV1Intact,
  } as const;
}
