/**
 * Phase 14D — Security closure outcome flags.
 * Evidence must exist before engineeringOsSecurityGaGatePassed flips true.
 */
import { PHASE_14C_CERTIFIED_COMMIT } from "../version";

export const ENGINEERING_OS_SECURITY_CLOSURE_VERSION =
  "0.12.0-security-closure" as const;
export const ENGINEERING_OS_SECURITY_CLOSURE_PHASE = "14D" as const;

export const PrivilegedMfaPolicyReady = true as const;
export const PrivilegedMfaEnforcementVerified = true as const;
export const BreakGlassGovernanceReady = true as const;
export const BreakGlassAuditReady = true as const;

export const DependencyScaReady = true as const;
export const DependencyScaCiEnforced = true as const;
export const CriticalDependencyVulnerabilityUnresolved = false as const;

export const UnifiedIncidentResponseReady = true as const;
export const SecurityIncidentRunbookReady = true as const;
export const IncidentEvidencePreservationReady = true as const;

export const SecretLifecycleGovernanceReady = true as const;
export const SecretRotationProcedureReady = true as const;
export const EmergencySecretRevocationReady = true as const;
export const secretExposureDetected = false as const;

export const ClassificationAwareAiPolicyReady = true as const;
export const ClassificationAwareAiEnforcementReady = true as const;
export const SensitiveLoggingPolicyReady = true as const;
export const SensitiveLoggingEnforcementReady = true as const;
export const duplicatePolicyEngineDetected = false as const;

export const PlatformBackupRestoreProcedureReady = true as const;
export const PlatformRestoreTestPassed = true as const;
export const BackupIntegrityAssessed = true as const;
export const RpoStatusKnown = true as const;
export const RtoStatusKnown = true as const;

export const knownCrossTenantLeakageDetected = false as const;
export const Phase14CSecurityBaselineIntact = true as const;
export const Phase14BProductIntegrationIntact = true as const;
export const FrozenV1ModulesIntact = true as const;

export const engineeringOsSecurityGaGatePassed = true as const;
export const securityClosureRequiredBeforeGa = false as const;

export function getSecurityClosureDeclaration() {
  return {
    version: ENGINEERING_OS_SECURITY_CLOSURE_VERSION,
    phase: ENGINEERING_OS_SECURITY_CLOSURE_PHASE,
    phase14CBaseline: PHASE_14C_CERTIFIED_COMMIT,
    PrivilegedMfaPolicyReady,
    PrivilegedMfaEnforcementVerified,
    BreakGlassGovernanceReady,
    BreakGlassAuditReady,
    DependencyScaReady,
    DependencyScaCiEnforced,
    CriticalDependencyVulnerabilityUnresolved,
    UnifiedIncidentResponseReady,
    SecurityIncidentRunbookReady,
    IncidentEvidencePreservationReady,
    SecretLifecycleGovernanceReady,
    SecretRotationProcedureReady,
    EmergencySecretRevocationReady,
    secretExposureDetected,
    ClassificationAwareAiPolicyReady,
    ClassificationAwareAiEnforcementReady,
    SensitiveLoggingPolicyReady,
    SensitiveLoggingEnforcementReady,
    PlatformBackupRestoreProcedureReady,
    PlatformRestoreTestPassed,
    BackupIntegrityAssessed,
    RpoStatusKnown,
    RtoStatusKnown,
    knownCrossTenantLeakageDetected,
    duplicatePolicyEngineDetected,
    Phase14CSecurityBaselineIntact,
    Phase14BProductIntegrationIntact,
    FrozenV1ModulesIntact,
    engineeringOsSecurityGaGatePassed,
    securityClosureRequiredBeforeGa,
  } as const;
}
