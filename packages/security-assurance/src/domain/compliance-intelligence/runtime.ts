import { createSecurityAssuranceFoundation } from "../foundation";
import { ComplianceIntelligenceEngine } from "./engine";

export function createComplianceIntelligenceRuntime() {
  const foundation = createSecurityAssuranceFoundation();
  const engine = new ComplianceIntelligenceEngine(
    foundation.controls,
    foundation.evidence,
    foundation.mappings,
    foundation.findings,
    foundation.posture,
    foundation.timeline,
  );
  return {
    foundation,
    engine,
    reuses: {
      ...foundation.reuses,
      securityControlRegistry: true,
      securityEvidenceRegistry: true,
      frameworkMappingRegistry: true,
      isolationAssurance: true,
      aiDataSecurityAssurance: true,
      secureComputeAssurance: true,
      policyEngine: true,
      audit: true,
      workflowEngine: true,
      eventBus: true,
      knowledgeGraph: true,
      duplicateSecurityControlRegistry: false,
      duplicateSecurityEvidenceRegistry: false,
      duplicatePolicyEngine: false,
      duplicateAuditSystem: false,
      duplicateWorkflowEngine: false,
      duplicateEventBus: false,
      duplicateSecurityAssuranceStack: false,
      complianceReviewAction: "security_assurance.compliance_review",
      enforcementAuthority: false,
      certificationAuthority: false,
      automaticCertification: false,
      automaticComplianceClaim: false,
    },
  };
}

export type ComplianceIntelligenceRuntime = ReturnType<
  typeof createComplianceIntelligenceRuntime
>;
