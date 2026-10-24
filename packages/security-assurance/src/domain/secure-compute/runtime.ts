import { createSecurityAssuranceFoundation } from "../foundation";
import { SecureComputeAssuranceEngine } from "./engine";
import { assertSecureComputeHarnessCoverage } from "./seed-probes";

export function createSecureComputeAssuranceRuntime() {
  assertSecureComputeHarnessCoverage();
  const foundation = createSecurityAssuranceFoundation();
  const engine = new SecureComputeAssuranceEngine(
    foundation.evidence,
    foundation.findings,
    foundation.posture,
    foundation.timeline,
  );
  return {
    foundation,
    engine,
    reuses: {
      ...foundation.reuses,
      authRls: true,
      policyEngine: true,
      securityEvidenceRegistry: true,
      isolationAssurance: true,
      aiDataSecurityAssurance: true,
      executionHost: true,
      backgroundJobs: true,
      workflowEngine: true,
      eventBus: true,
      secretManager: true,
      toolRegistry: true,
      modelRegistry: true,
      audit: true,
      telemetry: true,
      existingSandboxRuntime: true,
      duplicateExecutionHost: false,
      duplicateSandbox: false,
      duplicateSecretManager: false,
      duplicatePolicyEngine: false,
      duplicateAuthSystem: false,
      duplicateWorkflowEngine: false,
      duplicateEventBus: false,
      duplicateAiStack: false,
      secureComputeReviewAction: "security_assurance.secure_compute_review",
      enforcementAuthority: false,
      confidentialComputingPlatform: false,
      teeImplementation: false,
    },
  };
}

export type SecureComputeAssuranceRuntime = ReturnType<
  typeof createSecureComputeAssuranceRuntime
>;
