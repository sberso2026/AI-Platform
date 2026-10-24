/**
 * Phase 14C certification gates A–BL — Enterprise Security Readiness.
 * 64 gates. Assessment PASS ≠ security gaps closed.
 */
export const PHASE_14C_ENTERPRISE_SECURITY_READINESS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 14B baseline intact"],
  ["C", "Frozen V1 tags intact"],
  ["D", "14B product integration flags intact"],
  ["E", "Assessment version 0.11.0-security-readiness"],
  ["F", "Security inventory document"],
  ["G", "Ownership matrix document"],
  ["H", "Security & Assurance boundary document"],
  ["I", "Policy enforcement model"],
  ["J", "Privileged access baseline"],
  ["K", "Tenant isolation assurance model"],
  ["L", "Data classification model"],
  ["M", "AI security trust baseline"],
  ["N", "Secure SDLC baseline"],
  ["O", "Vulnerability management baseline"],
  ["P", "Incident response baseline"],
  ["Q", "Control matrix"],
  ["R", "Security gap register"],
  ["S", "Security readiness matrix"],
  ["T", "Customer assurance readiness"],
  ["U", "Essential Eight applicability"],
  ["V", "Phase 14C overview"],
  ["W", "EnterpriseSecurityAssessmentComplete"],
  ["X", "SecurityOwnershipModelLocked"],
  ["Y", "SecurityAndAssuranceBoundaryLocked"],
  ["Z", "SecurityControlMatrixReady"],
  ["AA", "SecurityGapRegisterReady"],
  ["AB", "EnterpriseSecurityReadinessMatrixReady"],
  ["AC", "TenantIsolationSecurityAssessed"],
  ["AD", "AiSecurityTrustAssessed"],
  ["AE", "SecureExecutionHostAssessed"],
  ["AF", "SecureSdlcAssessed"],
  ["AG", "IncidentResponseAssessed"],
  ["AH", "BackupRecoveryAssessed"],
  ["AI", "EssentialEightApplicabilityAssessed"],
  ["AJ", "CustomerAssuranceReadinessAssessed"],
  ["AK", "ExternalCertificationBoundaryLocked"],
  ["AL", "knownCrossTenantLeakageDetected false"],
  ["AM", "secretExposureDetected false"],
  ["AN", "existingPolicyEngineReused true"],
  ["AO", "engineeringOsSecurityGaGatePassed false"],
  ["AP", "securityClosureRequiredBeforeGa true"],
  ["AQ", "iso/soc/e8 claims false"],
  ["AR", "externalPenetrationTestDocumented false"],
  ["AS", "Gap register has REQUIRED_BEFORE_GA items"],
  ["AT", "No UNKNOWN ownership"],
  ["AU", "productionEngineeringOSReady false"],
  ["AV", "engineeringOSV1GaCertified false"],
  ["AW", "implementsOwnAiStack false"],
  ["AX", "No Security Intelligence package"],
  ["AY", "No Trust Center implementation"],
  ["AZ", "Unit tests"],
  ["BA", "Secret scan"],
  ["BB", "Workflow exists"],
  ["BC", "Platform architecture test"],
  ["BD", "Penetration test status documented"],
  ["BE", "Encryption classified provider-managed"],
  ["BF", "Execution host assessed"],
  ["BG", "Threat intel boundary not a database"],
  ["BH", "phase14DReady"],
  ["BI", "Artifact identity"],
  ["BJ", "No ISO certification claim in docs"],
  ["BK", "GA decision evidence-backed"],
  ["BL", "releaseEligible"],
] as const;

export type Phase14cGateId =
  (typeof PHASE_14C_ENTERPRISE_SECURITY_READINESS_GATES)[number][0];

export const PHASE_14C_GATE_COUNT =
  PHASE_14C_ENTERPRISE_SECURITY_READINESS_GATES.length;

export const PHASE_14C_ASSESSMENT_VERSION = "0.11.0-security-readiness" as const;
export const PHASE_14B_COMMIT =
  "70ae39837ac9e2cd3039b344ca083004884238c6" as const;

export const PHASE_14C_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_14C_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_14C_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_14C_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_14C_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_14C_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
