import { NextResponse } from "next/server";
import {
  PROJECT_CONTROLS_READINESS_MARKER,
  PROJECT_CONTROLS_RELEASE_TAG,
  PROJECT_CONTROLS_STATUS,
  PROJECT_CONTROLS_V1_GA_CERTIFIED,
  PROJECT_CONTROLS_V1_FROZEN,
  PROJECT_CONTROLS_VERSION,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
  PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  AUTOMATIC_LEARNING_APPROVAL_ENABLED,
  AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  PHASE_11N_COMPLETE,
  detectModuleRegistryDrift,
} from "@rtb/project-controls";

export async function GET() {
  const drift = detectModuleRegistryDrift();
  return NextResponse.json({
    module: "project_controls",
    version: PROJECT_CONTROLS_VERSION,
    status: PROJECT_CONTROLS_STATUS,
    releaseTag: PROJECT_CONTROLS_RELEASE_TAG,
    readinessMarker: PROJECT_CONTROLS_READINESS_MARKER,
    productionProjectControlsReady: PRODUCTION_PROJECT_CONTROLS_READY,
    projectControlsV1GaCertified: PROJECT_CONTROLS_V1_GA_CERTIFIED,
    projectControlsV1Frozen: PROJECT_CONTROLS_V1_FROZEN,
    projectControlsBackupRestoreCertified: PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
    phase11nComplete: PHASE_11N_COMPLETE,
    moduleRegistryDriftDetected: PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
    registryDriftCheck: drift.ok ? "ok" : drift.error,
    automaticDecisionExecutionEnabled: AUTOMATIC_DECISION_EXECUTION_ENABLED,
    automaticLearningApprovalEnabled: AUTOMATIC_LEARNING_APPROVAL_ENABLED,
    automaticKnowledgeMutationEnabled: AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED,
    cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
    earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
    financialPostingImplemented: FINANCIAL_POSTING_IMPLEMENTED,
    activeContributorCount: 12,
    advisoryOnly: true,
  });
}
