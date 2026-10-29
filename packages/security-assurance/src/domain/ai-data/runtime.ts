import { createSecurityAssuranceFoundation } from "../foundation";
import { AiDataSecurityEngine } from "./engine";
import { assertHarnessCoverage } from "./seed-probes";

export function createAiDataSecurityRuntime() {
  assertHarnessCoverage();
  const foundation = createSecurityAssuranceFoundation();
  const engine = new AiDataSecurityEngine(
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
      audit: true,
      securityEvidenceRegistry: true,
      isolationAssurance: true,
      aiToolRegistry: true,
      modelRegistry: true,
      promptRegistry: true,
      secretManager: true,
      knowledgeGraph: true,
      files: true,
      search: true,
      eventBus: true,
      workflowEngine: true,
      executionHost: true,
      aiRuntime: true,
      duplicateAiStack: false,
      duplicateSecretManager: false,
      duplicatePolicyEngine: false,
      duplicateKnowledgeGraph: false,
      duplicateEventBus: false,
      duplicateWorkflowEngine: false,
      duplicateExecutionHost: false,
      aiDataReviewAction: "security_assurance.ai_data_review",
      enforcementAuthority: false,
    },
  };
}

export type AiDataSecurityRuntime = ReturnType<typeof createAiDataSecurityRuntime>;
