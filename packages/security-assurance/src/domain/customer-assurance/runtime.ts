import { createSecurityAssuranceFoundation } from "../foundation";
import { CustomerAssuranceEngine } from "./engine";

export function createCustomerAssuranceRuntime() {
  const foundation = createSecurityAssuranceFoundation();
  const engine = new CustomerAssuranceEngine(
    foundation.evidence,
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
      securityAssessmentEngine: true,
      securityFindingRegistry: true,
      securityExceptionRegistry: true,
      securityPostureCompositionEngine: true,
      frameworkMappingRegistry: true,
      complianceIntelligence: true,
      isolationAssurance: true,
      aiDataSecurityAssurance: true,
      secureComputeAssurance: true,
      platformIdentity: true,
      platformFiles: true,
      policyEngine: true,
      audit: true,
      workflowEngine: true,
      eventBus: true,
      duplicateControlRegistry: false,
      duplicateEvidenceRegistry: false,
      duplicatePolicyEngine: false,
      duplicateIdentityProvider: false,
      duplicateAuditSystem: false,
      duplicateWorkflowEngine: false,
      duplicateEventBus: false,
      duplicateFileStore: false,
      duplicateComplianceStack: false,
      duplicateAssuranceStack: false,
      customerAssuranceReviewAction: "security_assurance.customer_assurance_review",
      certificationAuthority: false,
      trustCenterProduct: false,
      automaticExternalDisclosure: false,
      automaticCustomerAssurancePublication: false,
      enforcementAuthority: false,
    },
  };
}

export type CustomerAssuranceRuntime = ReturnType<typeof createCustomerAssuranceRuntime>;
