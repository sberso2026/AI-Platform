/**
 * Phase 14C — Enterprise Security Readiness assessment flags.
 * Assessment complete ≠ Engineering OS V1 GA ≠ ISO/SOC2 certification.
 */
import {
  engineeringOSV1GaCertified,
  implementsOwnAiStack,
  productionEngineeringOSReady,
} from "./version";

export const ENGINEERING_OS_SECURITY_ASSESSMENT_VERSION =
  "0.11.0-security-readiness" as const;
export const ENGINEERING_OS_SECURITY_ASSESSMENT_PHASE = "14C" as const;

export const PHASE_14B_CERTIFIED_COMMIT =
  "70ae39837ac9e2cd3039b344ca083004884238c6" as const;
export const PHASE_14B_HOSTED_RUN = "31295818157" as const;

export const EnterpriseSecurityAssessmentComplete = true as const;
export const SecurityOwnershipModelLocked = true as const;
export const SecurityAndAssuranceBoundaryLocked = true as const;
export const SecurityControlMatrixReady = true as const;
export const SecurityGapRegisterReady = true as const;
export const EnterpriseSecurityReadinessMatrixReady = true as const;
export const TenantIsolationSecurityAssessed = true as const;
export const AiSecurityTrustAssessed = true as const;
export const SecureExecutionHostAssessed = true as const;
export const SecureSdlcAssessed = true as const;
export const IncidentResponseAssessed = true as const;
export const BackupRecoveryAssessed = true as const;
export const EssentialEightApplicabilityAssessed = true as const;
export const CustomerAssuranceReadinessAssessed = true as const;
export const ExternalCertificationBoundaryLocked = true as const;

export const knownCrossTenantLeakageDetected = false as const;
export const secretExposureDetected = false as const;

/**
 * Evidence-backed GA security gate (Phase 14C).
 * false: REQUIRED_BEFORE_GA security gaps remain (see Security Gap Register).
 */
export const engineeringOsSecurityGaGatePassed = false as const;
export const securityClosureRequiredBeforeGa = true as const;

export const existingPolicyEngineReused = true as const;

export const iso27001Certified = false as const;
export const soc2Assured = false as const;
export const essentialEightMaturityClaimed = false as const;
export const externalPenetrationTestDocumented = false as const;

export function getEnterpriseSecurityReadinessDeclaration() {
  return {
    assessmentVersion: ENGINEERING_OS_SECURITY_ASSESSMENT_VERSION,
    phase: ENGINEERING_OS_SECURITY_ASSESSMENT_PHASE,
    EnterpriseSecurityAssessmentComplete,
    SecurityOwnershipModelLocked,
    SecurityAndAssuranceBoundaryLocked,
    SecurityControlMatrixReady,
    SecurityGapRegisterReady,
    EnterpriseSecurityReadinessMatrixReady,
    TenantIsolationSecurityAssessed,
    AiSecurityTrustAssessed,
    SecureExecutionHostAssessed,
    SecureSdlcAssessed,
    IncidentResponseAssessed,
    BackupRecoveryAssessed,
    EssentialEightApplicabilityAssessed,
    CustomerAssuranceReadinessAssessed,
    ExternalCertificationBoundaryLocked,
    knownCrossTenantLeakageDetected,
    secretExposureDetected,
    engineeringOsSecurityGaGatePassed,
    securityClosureRequiredBeforeGa,
    existingPolicyEngineReused,
    implementsOwnAiStack,
    productionEngineeringOSReady,
    engineeringOSV1GaCertified,
    iso27001Certified,
    soc2Assured,
    essentialEightMaturityClaimed,
    externalPenetrationTestDocumented,
  } as const;
}
