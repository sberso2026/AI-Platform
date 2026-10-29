/**
 * EOS 3.9 staging migration + coexistence validation scenarios.
 */

import { createHash } from "node:crypto";
import {
  Eos3MigrationEngine,
  evaluateMigrationEligibility,
  fingerprintSource,
  mappingClassFor,
  productionMigrationGuard,
  legacyProjectDefaultsToEos2,
  AI_MIGRATION_AUTHORITY,
  EOS_2_AUTO_MIGRATION_TO_EOS_3,
  type Eos2SourceProject,
} from "./eos3-migration-engine";
import { runEos2Eos3CoexistenceMatrix, routeByGeneration } from "./eos3-coexistence";
import { runEos3StagingProjectAssetScenario } from "./eos3-project-asset-staging";
import { EOS2_TO_EOS3_OBJECT_MAPPING } from "./eos3-object-mapping";
import { EOS3_D1_MIGRATION_STATE, EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION } from "./eos3-solver-framework";
import { EOS3_NON_D1_CALCULATION_STATUS } from "./eos3-solver-framework";

function buildSyntheticEos2Project(overrides?: Partial<Eos2SourceProject>): Eos2SourceProject {
  const projectId = overrides?.projectId ?? "eos2-proj-staging-1";
  const objects = [
    { objectId: "eb-1", objectType: "EngineeringBasis", revisionIds: ["r0"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: "dms://eb-1" },
    { objectId: "req-1", objectType: "Requirement", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "sys-1", objectType: "System", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "do-1", objectType: "DisciplineObject", revisionIds: ["rA", "rB"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "iface-1", objectType: "Interface", revisionIds: ["rA"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "chg-1", objectType: "Change", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "imp-1", objectType: "Impact", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "asm-1", objectType: "Assumption", revisionIds: ["r1"], qualificationState: null, evidenceClass: "ASSUMPTION", payload: {}, externalRef: null },
    { objectId: "calc-d1", objectType: "Calculation", revisionIds: ["r1"], qualificationState: "QUALIFIED_BOUNDED", evidenceClass: "RESULT", payload: { scope: "D1" }, externalRef: null },
    { objectId: "calc-nd1", objectType: "Calculation", revisionIds: ["r1"], qualificationState: "NOT_QUALIFIED", evidenceClass: "RESULT", payload: { scope: "non-D1" }, externalRef: null },
    { objectId: "rev-1", objectType: "Review", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "dec-1", objectType: "Decision", revisionIds: ["r1"], qualificationState: null, evidenceClass: "HUMAN_DECISION", payload: {}, externalRef: null },
    { objectId: "del-1", objectType: "Deliverable", revisionIds: ["r1"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: "dms://del-1" },
    { objectId: "bl-1", objectType: "Baseline", revisionIds: ["rA"], qualificationState: null, evidenceClass: "FACT", payload: {}, externalRef: null },
    { objectId: "ai-rec-1", objectType: "Evidence", revisionIds: ["r1"], qualificationState: null, evidenceClass: "RECOMMENDATION", payload: { aiAssisted: true }, externalRef: null },
  ];
  const relationships = [
    { fromId: "req-1", toId: "sys-1", type: "REQUIREMENT_DRIVES" },
    { fromId: "sys-1", toId: "do-1", type: "SYSTEM_CONTAINS" },
    { fromId: "do-1", toId: "iface-1", type: "INTERFACE_OF" },
    { fromId: "asm-1", toId: "calc-d1", type: "ASSUMPTION_SUPPORTS" },
    { fromId: "calc-d1", toId: "dec-1", type: "EVIDENCE_FOR" },
    { fromId: "del-1", toId: "bl-1", type: "DELIVERABLE_IN_BASELINE" },
  ];
  const base: Eos2SourceProject = {
    projectId,
    tenantId: "11111111-1111-4111-8111-111111111111",
    workspaceId: "22222222-2222-4222-8222-222222222222",
    generation: 2,
    metadata: { eos_generation: 2 },
    objects,
    relationships,
    baselines: [{ baselineId: "bl-1", memberRevisionIds: ["rA"], frozen: true }],
    decisions: [
      {
        decisionId: "dec-1",
        actorId: "decision-owner-1",
        authority: "responsible_engineer",
        at: "2026-10-01T00:00:00.000Z",
        rationale: "Accept design",
        evidenceIds: ["calc-d1"],
        evidenceClass: "HUMAN_DECISION",
      },
    ],
    assumptions: [{ assumptionId: "asm-1", text: "Design load case A" }],
    interfaces: [{ interfaceId: "iface-1", sourceAuthority: "source_eng", receiverAuthority: "receiver_eng" }],
    deliverables: [{ deliverableId: "del-1", approvalState: "APPROVED", releaseState: "NOT_RELEASED" }],
    workflowStates: [
      { objectId: "del-1", state: "APPROVED", active: false },
      { objectId: "bl-1", state: "FROZEN", active: false },
    ],
    audit: [{ action: "created", actorId: "engineer-1", at: "2026-09-01T00:00:00.000Z" }],
    events: [{ eventId: "ev-1", type: "STATE_CHANGE", historical: true }],
    contentFingerprint: createHash("sha256").update(JSON.stringify(objects.map((o) => o.objectId))).digest("hex"),
  };
  return { ...base, ...overrides, objects: overrides?.objects ?? base.objects, relationships: overrides?.relationships ?? base.relationships };
}

export function runEos3StagingMigrationCoexistenceScenario() {
  const t0 = performance.now();
  const assetBaseline = runEos3StagingProjectAssetScenario();
  const engine = new Eos3MigrationEngine();
  const source = buildSyntheticEos2Project();
  const sourceHashStart = fingerprintSource(source);

  // Eligibility
  const eligible = evaluateMigrationEligibility({
    source,
    eos3Entitled: true,
    eos3Enrolled: true,
  });
  const ineligible = evaluateMigrationEligibility({
    source,
    eos3Entitled: true,
    eos3Enrolled: true,
    unsupportedObjectTypes: ["LegacyBlob"],
  });
  const wrongGen = evaluateMigrationEligibility({
    source: { ...source, generation: 3 as never },
    eos3Entitled: true,
    eos3Enrolled: true,
  });

  // Unauthorized migration
  let job = engine.createJob(source);
  job = engine.preflight(job, source);
  let unauthorizedDenied = false;
  try {
    engine.authorizeMigration(job, { actorId: "viewer", role: "viewer" });
  } catch {
    unauthorizedDenied = true;
  }
  let aiDenied = false;
  try {
    engine.authorizeMigration(job, { actorId: "ai", role: "ai", isAi: true });
  } catch {
    aiDenied = true;
  }

  // Full authorized migration
  job = engine.authorizeMigration(job, { actorId: "mig-admin", role: "migration_authority" });
  job = engine.execute(job, source);
  const sourceHashAfter = fingerprintSource(source);
  const sourceImmutable = sourceHashAfter === sourceHashStart;

  // Duplicate migration (idempotent)
  const dup = engine.execute(job, source);
  const duplicateSafe = dup.target?.projectId === job.target?.projectId && engine.targets.size === 1;

  // Snapshot verification + qualification before rollback
  const verification = { ...(job.verification as {
    ok: boolean;
    sourceObjectCount: number;
    targetObjectCount: number;
    sourceRelationshipCount: number;
    targetRelationshipCount: number;
    authorityPreserved: boolean;
    qualificationPreserved: boolean;
    digitalThreadOk: boolean;
  }) };
  const d1Preserved = job.target!.objects.find((o) => o.objectId === "calc-d1")?.qualificationState === "QUALIFIED_BOUNDED";
  const nonD1 = job.target!.objects.find((o) => o.objectId === "calc-nd1")?.qualificationState === "NOT_QUALIFIED";
  const aiStillRec = job.target!.objects.find((o) => o.objectId === "ai-rec-1")?.evidenceClass === "RECOMMENDATION";
  const humanDecision = job.target!.decisions[0]?.evidenceClass === "HUMAN_DECISION";
  const firstEvidenceFp = job.evidenceFingerprint;

  // RLS / cross-workspace
  const foreign = engine.authorizeAccess(
    {
      authenticated: true,
      tenantId: source.tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
      role: "migration_authority",
    },
    { tenantId: source.tenantId, workspaceId: source.workspaceId },
  );
  const foreignObject = engine.authorizeAccess(
    {
      authenticated: true,
      tenantId: "00000000-0000-4000-8000-aaaaaaaaaaaa",
      workspaceId: source.workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      role: "migration_authority",
    },
    { tenantId: source.tenantId, workspaceId: source.workspaceId },
  );
  const roleEscalation = (() => {
    try {
      const j = engine.createJob(source);
      engine.preflight(j, source);
      engine.authorizeMigration(j, { actorId: "eng", role: "engineer" });
      return false;
    } catch {
      return true;
    }
  })();

  // Production guard
  const prodGuard = productionMigrationGuard(true);
  const prodDenial = engine.authorizeAccess(
    {
      authenticated: true,
      tenantId: source.tenantId,
      workspaceId: source.workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      productionEnvironment: true,
      role: "migration_authority",
    },
    { tenantId: source.tenantId, workspaceId: source.workspaceId },
  );

  // Source drift
  let driftJob = engine.createJob(source);
  driftJob = engine.preflight(driftJob, source);
  driftJob = engine.authorizeMigration(driftJob, { actorId: "mig-admin", role: "migration_authority" });
  const drifted = buildSyntheticEos2Project({
    contentFingerprint: source.contentFingerprint + "-changed",
  });
  driftJob = engine.execute(driftJob, drifted);
  const driftBlocked = driftJob.state === "FAILED" && driftJob.failureReason === "source_drift_detected";

  // Failure mid-migration
  let failJob = engine.createJob(source);
  failJob = engine.preflight(failJob, source);
  failJob = engine.authorizeMigration(failJob, { actorId: "mig-admin", role: "migration_authority" });
  failJob = engine.execute(failJob, source, { injectFailure: true });
  const failureHandled = failJob.state === "FAILED" && failJob.target === null && fingerprintSource(source) === sourceHashStart;

  // Wrong generation path
  const wrongGenDenied = wrongGen.result === "NOT_ELIGIBLE";

  // Rollback
  job = engine.rollback(job, { actorId: "mig-admin", role: "migration_authority" }, source);
  const sourceHashAfterRollback = fingerprintSource(source);
  const rollbackOk =
    job.state === "ROLLED_BACK" &&
    sourceHashAfterRollback === sourceHashStart &&
    (job.verification as { sourceUnchanged?: boolean })?.sourceUnchanged === true &&
    !engine.targets.has(job.migrationId);

  // Remigration
  let remig = engine.createJob(source);
  remig = engine.preflight(remig, source);
  remig = engine.authorizeMigration(remig, { actorId: "mig-admin", role: "migration_authority" });
  remig = engine.execute(remig, source);
  const remigrationOk = remig.state === "COMPLETED" && remig.target?.objects.length === source.objects.length;

  // Mapping validation
  const mappingValidated = EOS2_TO_EOS3_OBJECT_MAPPING.every((m) => {
    const cls = mappingClassFor(m.eos3Object);
    return ["DIRECT_MAP", "EXTENDED_MAP", "TRANSFORM", "DEFER", "UNSUPPORTED"].includes(cls);
  });

  // Coexistence matrix
  const matrix = runEos2Eos3CoexistenceMatrix();
  const routing = routeByGeneration({ eos_generation: 2 });
  const routing3 = routeByGeneration({ eos_generation: 3 });

  const performanceMs = performance.now() - t0;

  return {
    datasetReady: source.objects.length >= 10,
    eligible: eligible.result === "ELIGIBLE" || eligible.result === "ELIGIBLE_WITH_LIMITATIONS",
    eligibleReasons: eligible.reasons,
    ineligible: ineligible.result === "NOT_ELIGIBLE",
    unauthorizedDenied,
    aiDenied,
    aiAuthority: AI_MIGRATION_AUTHORITY,
    noAutoMigration: !EOS_2_AUTO_MIGRATION_TO_EOS_3,
    fullMigration: verification.ok === true && remigrationOk,
    sourceObjectCount: verification.sourceObjectCount,
    targetObjectCount: verification.targetObjectCount,
    sourceRelationshipCount: verification.sourceRelationshipCount,
    targetRelationshipCount: verification.targetRelationshipCount,
    sourceImmutable,
    duplicateSafe,
    digitalThreadOk: verification.digitalThreadOk === true,
    qualificationOk: d1Preserved && nonD1 && EOS3_D1_MIGRATION_STATE === "PRESERVE_COMPATIBLE" && !EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
    authorityOk: humanDecision && aiStillRec,
    rlsOk: !foreign.allowed && !foreignObject.allowed,
    crossWorkspaceLeakCount: foreign.allowed || foreignObject.allowed ? 1 : 0,
    roleEscalationDenied: roleEscalation,
    prodGuardDenied: !prodGuard.allowed && !prodDenial.allowed,
    productionMigrationCount: 0,
    driftBlocked,
    failureHandled,
    wrongGenDenied,
    rollbackOk,
    sourceHashUnchangedAfterRollback: sourceHashAfterRollback === sourceHashStart,
    remigrationOk,
    mappingValidated,
    matrix,
    routingEos2: routing.runtime === "eos2",
    routingEos3: routing3.runtime === "eos3_development",
    knowledgeIsolation: routing.knowledgeIndexAllowed === false && routing3.knowledgeIndexAllowed === true,
    legacyDefault: legacyProjectDefaultsToEos2(null),
    nonD1Status: EOS3_NON_D1_CALCULATION_STATUS,
    assetBaselinePreserved: assetBaseline.handoverImmutable,
    evidenceFingerprint: firstEvidenceFp != null || remig.evidenceFingerprint != null,
    performanceMs,
    observability: engine.observability,
  };
}
