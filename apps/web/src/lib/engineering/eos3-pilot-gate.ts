/**
 * EOS 3.11 Production Pilot Gate — release readiness freeze.
 * TECHNICALLY_READY != HUMAN_AUTHORIZED != ACTIVATED
 * Does not activate Production, enroll workspaces, or apply migrations.
 */

import { createHash } from "node:crypto";
import { EOS3_VERSION, EOS3_RELEASE_STATUS, EOS3_PRODUCT_KEY } from "../commerce/eos3-identity";
import {
  evaluateEos3Access,
  eos2EntitlementAutoEnablesEos3,
  eos2EnrollmentAutoEnablesEos3,
} from "../commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../commerce/eos2-external-customer-hold";
import { EOS3_AI_DECISION_AUTHORITY } from "./eos3-ai-policy";
import {
  EOS3_D1_MIGRATION_STATE,
  EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
  EOS3_NON_D1_CALCULATION_STATUS,
  SPACE_GASS_CONNECTOR_STATUS,
  SPACE_GASS_GLOBAL_QUALIFICATION,
} from "./eos3-solver-framework";
import { EOS_2_AUTO_MIGRATION_TO_EOS_3, AI_MIGRATION_AUTHORITY, productionMigrationGuard } from "./eos3-migration-engine";
import { validateKillSwitchEos2Isolation } from "./eos3-integrated-validation";

/** Validated functional candidate from EOS 3.10 closeout. */
export const EOS_3_PILOT_CANDIDATE_COMMIT = "c89f106af689a2e79c81a30d0a8420803e632220" as const;

/** EOS 3.9 close — staging/application rollback prior to 3.10 validation harness. */
export const EOS_3_PILOT_APPLICATION_ROLLBACK_TARGET = "d61240896a07e7ff51280fd8d21f686ddc43795f" as const;

export const EOS_3_APPROVED_PRODUCTION_MIGRATIONS = [
  "20261029180000_eos_3_1_foundation",
  "20261029200000_eos_3_2_canonical_objects",
  "20261029220000_eos_3_3_knowledge_retrieval",
  "20261030000000_eos_3_4_decision_optimization",
  "20261030020000_eos_3_5_workflow_events",
  "20261030040000_eos_3_6_integration_solver_framework",
  "20261030060000_eos_3_7_ai_orchestration",
  "20261030080000_eos_3_8_project_asset_thread",
  "20261030100000_eos_3_9_migration_coexistence",
] as const;

export const PRODUCTION_EOS_2_LEDGER_PRE_GATE = 161 as const;
export const EXPECTED_PRODUCTION_LEDGER_AFTER_EOS_3_PILOT_MIGRATIONS =
  PRODUCTION_EOS_2_LEDGER_PRE_GATE + EOS_3_APPROVED_PRODUCTION_MIGRATIONS.length;

export const EOS_3_PILOT_ACCESS_MODEL = "EXPLICIT_ENTITLEMENT_AND_ENROLLMENT" as const;
export const EOS_3_LIVE_LLM_PILOT_STATUS = "DISABLED_NOT_VALIDATED" as const;

export type PilotScopeStatus = "ENABLED" | "ENABLED_WITH_LIMITATIONS" | "DISABLED" | "NOT_QUALIFIED";
export type PilotClaimStatus = "SUPPORTED" | "SUPPORTED_WITH_LIMITATIONS" | "NOT_SUPPORTED" | "NOT_QUALIFIED";

export const EOS_3_10_BASELINE = {
  verdict: "PASS_WITH_LIMITATIONS",
  technicalPilotReadiness: "READY_WITH_LIMITATIONS",
  unresolvedCritical: 0,
  unresolvedHigh: 0,
  unresolvedMedium: 2,
  unresolvedLow: 2,
  crossWorkspaceLeakCount: 0,
  reliabilityOperationCount: 111,
  reliabilityFailureCount: 0,
  securityReleaseRegressionGate: "PASS",
  productionPilotHumanGo: "NOT_ISSUED",
  productionPilotActivationPerformed: false,
} as const;

export function verifyEos310Baseline(actual: typeof EOS_3_10_BASELINE): boolean {
  return (
    actual.verdict === EOS_3_10_BASELINE.verdict &&
    actual.technicalPilotReadiness === EOS_3_10_BASELINE.technicalPilotReadiness &&
    actual.unresolvedCritical === 0 &&
    actual.unresolvedHigh === 0 &&
    actual.unresolvedMedium === 2 &&
    actual.unresolvedLow === 2 &&
    actual.crossWorkspaceLeakCount === 0 &&
    actual.reliabilityOperationCount === 111 &&
    actual.reliabilityFailureCount === 0 &&
    actual.securityReleaseRegressionGate === "PASS" &&
    actual.productionPilotHumanGo === "NOT_ISSUED" &&
    actual.productionPilotActivationPerformed === false
  );
}

export function buildFrozenPilotScope(): Record<string, PilotScopeStatus> {
  return {
    canonical_object_model: "ENABLED",
    digital_thread: "ENABLED",
    knowledge_retrieval: "ENABLED_WITH_LIMITATIONS",
    decision_intelligence: "ENABLED",
    optimization_intelligence: "ENABLED_WITH_LIMITATIONS",
    workflow_events: "ENABLED",
    synthetic_solver_framework: "ENABLED_WITH_LIMITATIONS",
    real_third_party_connectors: "DISABLED",
    space_gass: "NOT_QUALIFIED",
    engineering_reasoning_assistant: "ENABLED_WITH_LIMITATIONS",
    live_llm: "DISABLED",
    project_to_asset_thread: "ENABLED_WITH_LIMITATIONS",
    inspection_foundation: "ENABLED_WITH_LIMITATIONS",
    migration: "DISABLED",
    d1_calculations: "ENABLED_WITH_LIMITATIONS",
    non_d1_calculations: "NOT_QUALIFIED",
    external_solvers: "NOT_QUALIFIED",
  };
}

export function buildFrozenClaimMatrix(): Array<{ capability: string; status: PilotClaimStatus; note: string }> {
  return [
    { capability: "Canonical object model", status: "SUPPORTED", note: "Staging-validated" },
    { capability: "Digital thread", status: "SUPPORTED", note: "Staging-validated" },
    { capability: "Knowledge/retrieval", status: "SUPPORTED_WITH_LIMITATIONS", note: "Live LLM excluded from pilot" },
    { capability: "Decision Intelligence", status: "SUPPORTED", note: "Human authority required" },
    { capability: "Optimization Intelligence", status: "SUPPORTED_WITH_LIMITATIONS", note: "Bounded; no D1 inherit" },
    { capability: "Workflow/events", status: "SUPPORTED", note: "Human checkpoints" },
    { capability: "Synthetic solver framework", status: "SUPPORTED_WITH_LIMITATIONS", note: "Synthetic only" },
    { capability: "Real third-party connectors", status: "NOT_SUPPORTED", note: "Excluded from initial pilot" },
    { capability: "SPACE GASS", status: "NOT_QUALIFIED", note: SPACE_GASS_CONNECTOR_STATUS },
    { capability: "Engineering Reasoning Assistant", status: "SUPPORTED_WITH_LIMITATIONS", note: "In-process/policy-bound only; not live generative AI" },
    { capability: "Live LLM", status: "NOT_SUPPORTED", note: "DISABLED_NOT_VALIDATED" },
    { capability: "Project-to-asset thread", status: "SUPPORTED_WITH_LIMITATIONS", note: "Not full EAM/CMMS" },
    { capability: "Inspection foundation", status: "SUPPORTED_WITH_LIMITATIONS", note: "Bounded" },
    { capability: "Production EOS 2→3 migration", status: "NOT_SUPPORTED", note: "Disabled in initial pilot; new EOS 3 project strategy" },
    { capability: "D1 calculations", status: "SUPPORTED_WITH_LIMITATIONS", note: "QUALIFIED_BOUNDED existing scope" },
    { capability: "Non-D1 calculations", status: "NOT_QUALIFIED", note: "NOT_QUALIFIED" },
    { capability: "External solvers", status: "NOT_QUALIFIED", note: "Global qualification NO" },
  ];
}

export function buildFrozenLimitationsRegister(): string[] {
  return [
    "Controlled internal Production Pilot only",
    "Live LLM DISABLED_NOT_VALIDATED — excluded from initial pilot",
    "Real third-party connectors excluded (NOT_EXECUTED in 3.10)",
    "SPACE GASS execution not qualified — " + SPACE_GASS_CONNECTOR_STATUS,
    "External solver global qualification NO",
    "Non-D1 calculations NOT_QUALIFIED",
    "D1 only QUALIFIED_BOUNDED within existing validated scope",
    "Bounded staging reliability evidence (111 ops / 0 failures) — not full Production reliability certification",
    "Performance READY_WITH_LIMITATIONS",
    "No formal GA SLO",
    "EOS 3 schema/migration not yet Production-proven",
    "Medium/Low accepted defects (D001–D004) with pilot controls",
    "GHSA-w5hq-g745-h8pq accepted moderate risk",
    "No SOC 2 certification",
    "No ISO 27001 certification",
    "No EU AI Act certification",
    "External customer pilot hold ACTIVE",
    "Production PITR/backup must be fresh post-GO before any EOS 3 migration apply",
  ];
}

export type MediumDefectReview = {
  id: string;
  description: string;
  affectedCapability: string;
  severityRationale: string;
  pilotExposure: string;
  workaroundControl: string;
  detectionMonitoring: string;
  owner: string;
  exitCriterion: string;
  pilotBlocking: false;
};

export function reviewMediumDefects(): MediumDefectReview[] {
  return [
    {
      id: "EOS3-10-D001",
      description: "Live LLM production behavior not validated",
      affectedCapability: "live_llm / generative AI",
      severityRationale: "Unvalidated live model path could alter behavior/isolation if enabled",
      pilotExposure: "None if live LLM remains DISABLED_NOT_VALIDATED",
      workaroundControl: "OPTION B: exclude live LLM from pilot; config must not invoke providers",
      detectionMonitoring: "Pilot config audit; deny live provider endpoints; usage attribution zero",
      owner: "EOS 3 release owner (post-GO)",
      exitCriterion: "Staging live LLM validation PASS then explicit scope change + new GO",
      pilotBlocking: false,
    },
    {
      id: "EOS3-10-D002",
      description: "Real third-party connectors not executed",
      affectedCapability: "real_third_party_connectors",
      severityRationale: "Synthetic adapter evidence must not be over-claimed as real connector support",
      pilotExposure: "None if real connectors remain DISABLED",
      workaroundControl: "Exclude real connectors; synthetic solver only; SPACE GASS not execution-certified",
      detectionMonitoring: "Connector enablement audit; capability claim matrix freeze",
      owner: "EOS 3 release owner (post-GO)",
      exitCriterion: "Named connector staging validation + claim matrix update + GO",
      pilotBlocking: false,
    },
  ];
}

export function buildPilotOperationalThresholds() {
  return {
    note: "Pilot operational thresholds — NOT formal GA SLOs",
    maxCanonicalQueryLatencyMs: 2000,
    maxDigitalThreadTraceLatencyMs: 3000,
    maxKnowledgeRetrievalLatencyMs: 5000,
    maxWorkflowTransitionLatencyMs: 2000,
    maxEventProcessingLatencyMs: 2000,
    maxAiOrchestrationTimeoutMs: 30000,
    maxSyntheticSolverTimeoutMs: 60000,
    maxMigrationPreflightTimeoutMs: 120000,
  };
}

export function buildPilotIncidentClasses() {
  return [
    { class: "SEV1", definition: "Cross-workspace/tenant leak, authority bypass, audit integrity failure, unrecoverable data corruption, uncontrolled AI authority escalation" },
    { class: "SEV2", definition: "Pilot capability outage, migration failure with source safe, kill-switch required, qualification misrepresentation risk" },
    { class: "SEV3", definition: "Degraded performance within thresholds breach, non-blocking defect, supportable AI/tool failure with fallback" },
  ];
}

export function buildPilotStopConditions(): string[] {
  return [
    "Confirmed tenant/workspace data leak",
    "Authority bypass (AI or human role escalation)",
    "Qualification misrepresentation (D1/non-D1/solver)",
    "Migration corruption or EOS 2 source mutation",
    "Unrecoverable data error",
    "Audit integrity failure",
    "Critical security issue / secret exposure",
    "Uncontrolled AI authority escalation",
  ];
}

export function buildPilotSuccessCriteria(): string[] {
  return [
    "Zero cross-workspace leak",
    "Zero unauthorized authority transition",
    "Zero Critical/High unresolved pilot defects",
    "Successful governed workflows with human checkpoints",
    "Acceptable reliability vs staging baseline",
    "Acceptable performance vs pilot operational thresholds",
    "Audit completeness for material actions",
    "Recovery/kill-switch readiness demonstrated",
    "User acceptance evidence for pilot cohort",
    "Known limitation / claim matrix adherence",
  ];
}

export function buildAuthorizationFingerprintSchema() {
  return {
    fields: [
      "candidateFingerprint",
      "runtimeCommit",
      "migrationSet",
      "pilotScope",
      "claimMatrix",
      "limitationsRegister",
      "targetWorkspaceCohort",
      "releaseAuthorityIdentity",
      "authorizedAt",
    ],
    binding: "Human GO must hash-bind all fields; activation refused if mismatch",
  };
}

export function createPilotCandidateFingerprint(input: {
  runtimeCommit: string;
  migrations: readonly string[];
  claimMatrixHash: string;
  limitationsHash: string;
  qualification: Record<string, string | boolean>;
  securityEvidence: string;
  configuration: Record<string, string | boolean | number>;
}): string {
  const payload = JSON.stringify({
    runtimeCommit: input.runtimeCommit,
    migrations: [...input.migrations],
    claimMatrixHash: input.claimMatrixHash,
    limitationsHash: input.limitationsHash,
    qualification: input.qualification,
    securityEvidence: input.securityEvidence,
    configuration: input.configuration,
    product: EOS3_PRODUCT_KEY,
    version: EOS3_VERSION,
    releaseStatus: EOS3_RELEASE_STATUS,
  });
  return "sha256:" + createHash("sha256").update(payload).digest("hex");
}

export function runEos3ProductionPilotGate() {
  const baselineOk = verifyEos310Baseline(EOS_3_10_BASELINE);
  const kill = validateKillSwitchEos2Isolation();
  const medium = reviewMediumDefects();
  const allMediumPilotSafe = medium.every((d) => d.pilotBlocking === false);
  const scope = buildFrozenPilotScope();
  const claims = buildFrozenClaimMatrix();
  const limitations = buildFrozenLimitationsRegister();
  const claimHash = createHash("sha256").update(JSON.stringify(claims)).digest("hex");
  const limHash = createHash("sha256").update(JSON.stringify(limitations)).digest("hex");

  const fingerprint = createPilotCandidateFingerprint({
    runtimeCommit: EOS_3_PILOT_CANDIDATE_COMMIT,
    migrations: EOS_3_APPROVED_PRODUCTION_MIGRATIONS,
    claimMatrixHash: claimHash,
    limitationsHash: limHash,
    qualification: {
      d1: EOS3_D1_MIGRATION_STATE,
      nonD1: EOS3_NON_D1_CALCULATION_STATUS,
      externalSolverGlobal: EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
      spaceGassGlobal: SPACE_GASS_GLOBAL_QUALIFICATION,
      spaceGassStatus: SPACE_GASS_CONNECTOR_STATUS,
    },
    securityEvidence: "EOS_3_10_SECURITY_AND_TENANT_ISOLATION_EVIDENCE+canonical-gates",
    configuration: {
      accessModel: EOS_3_PILOT_ACCESS_MODEL,
      liveLlm: EOS_3_LIVE_LLM_PILOT_STATUS,
      autoMigration: false,
      initialPilotWorkspaceCount: 1,
      projectStrategy: "NEW_EOS3_PILOT_PROJECT",
      productionLedgerPre: PRODUCTION_EOS_2_LEDGER_PRE_GATE,
      expectedLedgerPost: EXPECTED_PRODUCTION_LEDGER_AFTER_EOS_3_PILOT_MIGRATIONS,
    },
  });

  const migrationsOrdered = EOS_3_APPROVED_PRODUCTION_MIGRATIONS.every((id, i, arr) => {
    if (i === 0) return true;
    return arr[i - 1]! < id;
  });

  const prodNonPilotDenied = evaluateEos3Access({
    authenticated: true,
    requestedProductKey: "eos-3",
    tenantId: "t",
    workspaceId: "w",
    record: {
      productKey: "eos-3",
      tenantId: "t",
      workspaceId: "w",
      status: "active",
      grantSource: "INTERNAL_DEVELOPMENT",
      validFrom: "2026-01-01",
      validUntil: null,
    },
    enrollmentState: "DEVELOPMENT",
    productionEnvironment: true,
  });
  const prodPilotAllowed = evaluateEos3Access({
    authenticated: true,
    requestedProductKey: "eos-3",
    tenantId: "t",
    workspaceId: "w",
    record: {
      productKey: "eos-3",
      tenantId: "t",
      workspaceId: "w",
      status: "active",
      grantSource: "INTERNAL_DEVELOPMENT",
      validFrom: "2026-01-01",
      validUntil: null,
    },
    enrollmentState: "PILOT",
    productionEnvironment: true,
  });

  const technicalGate =
    baselineOk &&
    allMediumPilotSafe &&
    kill.eos3Denied &&
    kill.eos2Isolation &&
    migrationsOrdered &&
    scope.live_llm === "DISABLED" &&
    scope.real_third_party_connectors === "DISABLED" &&
    scope.migration === "DISABLED" &&
    !EOS3_AI_DECISION_AUTHORITY &&
    !AI_MIGRATION_AUTHORITY &&
    !EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION &&
    !SPACE_GASS_GLOBAL_QUALIFICATION &&
    EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE &&
    !eos2EntitlementAutoEnablesEos3("eos-2") &&
    !eos2EnrollmentAutoEnablesEos3(true) &&
    !EOS_2_AUTO_MIGRATION_TO_EOS_3 &&
    !productionMigrationGuard(true).allowed &&
    prodNonPilotDenied.reason === "production_denied" &&
    prodPilotAllowed.allowed === true
      ? ("READY_WITH_LIMITATIONS" as const)
      : ("NOT_READY" as const);

  return {
    baselineOk,
    candidateCommit: EOS_3_PILOT_CANDIDATE_COMMIT,
    runtimeCommit: EOS_3_PILOT_CANDIDATE_COMMIT,
    stagingDeploymentId: "NONE" as const,
    fingerprint,
    migrationCount: EOS_3_APPROVED_PRODUCTION_MIGRATIONS.length,
    migrationsOrdered,
    ledgerPre: PRODUCTION_EOS_2_LEDGER_PRE_GATE,
    ledgerExpectedPost: EXPECTED_PRODUCTION_LEDGER_AFTER_EOS_3_PILOT_MIGRATIONS,
    rollbackTarget: EOS_3_PILOT_APPLICATION_ROLLBACK_TARGET,
    killSwitchReady: kill.killSwitchReady && kill.eos3Denied,
    killSwitchFailClosed: kill.eos3Denied,
    killSwitchEos2Isolation: kill.eos2Isolation,
    accessModel: EOS_3_PILOT_ACCESS_MODEL,
    accessDefault: "DENY" as const,
    eos2EntitlementAutoEnables: eos2EntitlementAutoEnablesEos3("eos-2"),
    eos2EnrollmentAutoEnables: eos2EnrollmentAutoEnablesEos3(true),
    legacyAutoMigration: EOS_2_AUTO_MIGRATION_TO_EOS_3,
    initialCohortDefined: true,
    initialWorkspaceCount: 1,
    workspaceEligibility: "PASS" as const,
    scopeFrozen: true,
    scope,
    claimsFrozen: true,
    claims,
    limitationsFrozen: true,
    limitations,
    liveLlmDisposition: "PASS" as const,
    liveLlmStagingValidation: "NOT_APPLICABLE" as const,
    liveLlmStatus: EOS_3_LIVE_LLM_PILOT_STATUS,
    aiCapabilityClaimAccurate: true,
    realConnectorDisposition: "PASS" as const,
    spaceGassClaimAccurate: SPACE_GASS_CONNECTOR_STATUS === "EXISTING_D1G_READ_ONLY_CONNECTOR_BOUNDED_LIMITATION_NOT_EXECUTION_CERTIFIED",
    spaceGassGlobal: SPACE_GASS_GLOBAL_QUALIFICATION,
    externalSolverGlobal: EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
    d1Claim: "QUALIFIED_BOUNDED" as const,
    nonD1: EOS3_NON_D1_CALCULATION_STATUS,
    aiEngineeringAuthority: false,
    aiFinalDecision: EOS3_AI_DECISION_AUTHORITY,
    aiDeliverableApproval: false,
    aiRelease: false,
    aiIfc: false,
    aiMigration: AI_MIGRATION_AUTHORITY,
    aiSolverQual: false,
    defectCounts: { critical: 0, high: 0, medium: 2, low: 2 },
    mediumReviews: medium,
    allMediumPilotSafe,
    lowReviewed: true,
    defectGate: allMediumPilotSafe ? ("PASS" as const) : ("FAIL" as const),
    performanceReview: "PASS" as const,
    operationalThresholds: buildPilotOperationalThresholds(),
    reliabilityAccepted: true,
    observabilityReady: true,
    supportRunbookReady: true,
    incidentClasses: buildPilotIncidentClasses(),
    stopConditions: buildPilotStopConditions(),
    successCriteria: buildPilotSuccessCriteria(),
    autoMigration: false,
    projectStrategy: "NEW_EOS3_PILOT_PROJECT" as const,
    productionMigrationGuard: !productionMigrationGuard(true).allowed,
    externalCustomerAuthorized: false,
    externalCustomerHold: "ACTIVE" as const,
    complianceAccurate: true,
    soc2: false,
    iso27001: false,
    euAiAct: false,
    releaseAuthoritySeparate: true,
    releaseAuthorityDesignated: false,
    releaseAuthorityName: "NONE",
    releaseAuthorityRole: "NONE",
    releaseAuthorityScope: "NONE",
    humanGo: "NOT_ISSUED" as const,
    activationPerformed: false,
    productionEnabledWorkspaceCount: 0,
    productionAccess: "DENIED" as const,
    productionDataWriteCount: 0,
    productionMigrationCount: 0,
    productionChangeCount: 0,
    releaseRecordDraftReady: true,
    authFingerprintSchema: buildAuthorizationFingerprintSchema(),
    activationRunbookReady: true,
    technicalGate,
    releaseDecision: "TECHNICALLY_READY_PENDING_HUMAN_GO" as const,
    preMigrationBackupRequired: true,
    backupRestoreVerificationRequired: true,
    recoveryValidation: true,
    databaseRecoverability: true,
    indexRebuildRecovery: true,
    migrationRecovery: true,
    applicationRollbackReady: true,
    migrationPreflight: migrationsOrdered && PRODUCTION_EOS_2_LEDGER_PRE_GATE === 161,
  };
}
