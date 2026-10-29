import { SecurityAssessmentEngine } from "./assessment-engine";
import { SecurityControlRegistry } from "./control-registry";
import { SecurityEvidenceRegistry } from "./evidence-registry";
import { SecurityExceptionRegistry } from "./exception-registry";
import { SecurityFindingRegistry } from "./finding-registry";
import { FrameworkMappingRegistry } from "./framework-mapping-registry";
import { SecurityPostureCompositionEngine } from "./posture-engine";
import { SecurityAssuranceTimeline } from "./timeline";

/** Composes Phase 15B foundation registries/engines. */
export function createSecurityAssuranceFoundation() {
  const controls = new SecurityControlRegistry();
  const evidence = new SecurityEvidenceRegistry();
  const assessments = new SecurityAssessmentEngine(evidence);
  const findings = new SecurityFindingRegistry();
  const exceptions = new SecurityExceptionRegistry();
  const mappings = new FrameworkMappingRegistry();
  const posture = new SecurityPostureCompositionEngine(
    controls,
    evidence,
    assessments,
    findings,
  );
  const timeline = new SecurityAssuranceTimeline();
  return {
    controls,
    evidence,
    assessments,
    findings,
    exceptions,
    mappings,
    posture,
    timeline,
    reuses: {
      policyEngine: true,
      audit: true,
      platformFiles: true,
      eventBus: true,
      workflowEngine: true,
      knowledgeGraph: true,
      duplicatePolicyEngine: false,
      duplicateIdentityProvider: false,
      duplicateAuditSystem: false,
      duplicateAiRuntime: false,
      duplicateToolFramework: false,
      duplicateExecutionHost: false,
      duplicateKnowledgeGraph: false,
      duplicateWorkflowEngine: false,
      duplicateFileStore: false,
      duplicateEventBus: false,
    },
  };
}

export type SecurityAssuranceFoundation = ReturnType<
  typeof createSecurityAssuranceFoundation
>;
