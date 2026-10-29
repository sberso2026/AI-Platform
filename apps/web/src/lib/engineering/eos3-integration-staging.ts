/**
 * EOS 3.6 staging — synthetic connector + solver framework scenarios.
 */

import { createHash } from "node:crypto";
import { runEos3StagingCanonicalWorkflow } from "./eos3-staging-workflow";
import {
  authorizeConnectorAccess,
  createConnector,
  enableConnector,
  readConnectorSecret,
  redactForLog,
  setConnectorHealth,
  storeConnectorSecret,
  Eos3IntegrationStore,
  EOS3_DMS_BOUNDARY_PRESERVED,
  AI_CONNECTOR_CREDENTIAL_AUTHORITY,
} from "./eos3-integration-connectors";
import {
  authorizeWorkflowAccess,
  createWorkItem,
} from "./eos3-workflow-engine";
import { Eos3GovernedEventBus } from "./eos3-governed-events";
import {
  buildSafeSolverArgv,
  checkUnitCompatibility,
  classifyOptimizationSource,
  createInputManifest,
  createSolver,
  inheritD1QualificationToExternalSolver,
  runSyntheticSolver,
  setSolverQualification,
  validateSolverFilePath,
  Eos3SolverRuntime,
  EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
  SPACE_GASS_CONNECTOR_STATUS,
  SPACE_GASS_GLOBAL_QUALIFICATION,
  AI_SOLVER_QUALIFICATION_AUTHORITY,
} from "./eos3-solver-framework";
import {
  createDecisionCase,
  addOption,
  setWeightScheme,
  generateRecommendation,
} from "./eos3-decision-intelligence";

export function runEos3StagingIntegrationSolverScenario() {
  const t0 = performance.now();
  const workflow = runEos3StagingCanonicalWorkflow();
  const sample = [...workflow.store.objects.values()][0]!;
  const tenantId = sample.tenantId;
  const workspaceId = sample.workspaceId;
  const projectId = sample.projectId;
  const calculation = [...workflow.store.objects.values()].find((o) => o.objectType === "Calculation")
    ?? [...workflow.store.objects.values()].find((o) => o.objectType === "DisciplineObject")!;

  const store = new Eos3IntegrationStore();
  const runtime = new Eos3SolverRuntime();
  const bus = new Eos3GovernedEventBus();
  const ctx = { tenantId, workspaceId, projectId };

  // 1-2: configure synthetic solver connector + capability
  let connector = createConnector({
    category: "deterministic_solver",
    provider: "eos3-synthetic-solver",
    vendor: "RTB",
    version: "1.0.0-synthetic",
    ...ctx,
    projectIds: [projectId],
    capabilities: ["SUBMIT_ANALYSIS", "POLL_ANALYSIS", "FETCH_RESULTS"],
    authMethod: "none_synthetic",
    executionMode: "EOS_HOSTED",
    ownerId: "integration-admin-1",
    systemOfRecord: "EOS_AUTHORITATIVE",
  });
  const secret = storeConnectorSecret(store.vault, connector.connectorId, "synthetic-not-a-real-secret");
  connector = { ...connector, secretRef: secret.cipherRef };
  connector = enableConnector(connector, { actorId: "integration-admin-1", role: "integration_admin" });
  connector = setConnectorHealth(connector, "AVAILABLE", "system");
  store.register(connector);

  // Health AVAILABLE must not promote qualification
  const connectorSolverQualSeparation =
    connector.health === "AVAILABLE" && connector.qualificationState === "INTEGRATED_NOT_VALIDATED";

  let solver = createSolver({
    provider: "eos3-synthetic",
    product: "SyntheticStatic",
    version: "1.0.0",
    executionMode: "EOS_HOSTED",
    supportedAnalysisTypes: ["static_utilisation"],
    connector,
    qualificationState: "INTEGRATED_NOT_VALIDATED",
  });
  runtime.register(solver);

  // AI cannot enable / qualify
  let aiEnableDenied = false;
  try {
    enableConnector(connector, { actorId: "ai", role: "ai", isAi: true });
  } catch {
    aiEnableDenied = true;
  }
  let aiQualDenied = false;
  try {
    setSolverQualification(solver, "QUALIFIED", { actorId: "ai", role: "ai", isAi: true });
  } catch {
    aiQualDenied = true;
  }

  // Enterprise document connector contract (generic)
  let docConnector = createConnector({
    category: "document_repository",
    provider: "generic-dms",
    vendor: "Generic",
    version: "1.0.0",
    ...ctx,
    projectIds: [projectId],
    capabilities: ["READ_DOCUMENT", "WRITE_DOCUMENT"],
    authMethod: "oauth",
    executionMode: "REMOTE_API",
    ownerId: "integration-admin-1",
    systemOfRecord: "EXTERNAL_AUTHORITATIVE",
  });
  docConnector = enableConnector(docConnector, { actorId: "integration-admin-1", role: "integration_admin" });
  store.register(docConnector);

  // Import scenario
  const import1 = store.importArtifact({
    connector: docConnector,
    sourceSystem: "generic-dms",
    sourceIdentifier: "DOC-EXT-1",
    sourceRevision: "R1",
    actorId: "engineer-1",
    projectId,
    content: "controlled drawing revision R1",
    classification: "DOCUMENT",
    authorizedForIndex: true,
  });
  const importDup = store.importArtifact({
    connector: docConnector,
    sourceSystem: "generic-dms",
    sourceIdentifier: "DOC-EXT-1",
    sourceRevision: "R1",
    actorId: "engineer-1",
    projectId,
    content: "controlled drawing revision R1",
    classification: "DOCUMENT",
    authorizedForIndex: true,
  });
  const importIdempotent =
    "importId" in import1 &&
    "importId" in importDup &&
    import1.importId === importDup.importId &&
    import1.eosOwnsSource === false;

  const unauthorizedImport = store.importArtifact({
    connector: docConnector,
    sourceSystem: "generic-dms",
    sourceIdentifier: "DOC-EXT-2",
    sourceRevision: "R1",
    actorId: "engineer-1",
    projectId,
    content: "unclassified dump",
    classification: "DOCUMENT",
    authorizedForIndex: false,
  });
  const unauthorizedNotIndexed =
    "importId" in unauthorizedImport && unauthorizedImport.indexedForRetrieval === false;

  // Conflict scenario
  const conflictResult = store.importArtifact({
    connector: docConnector,
    sourceSystem: "generic-dms",
    sourceIdentifier: "DOC-EXT-1",
    sourceRevision: "R2",
    actorId: "engineer-1",
    projectId,
    content: "external R2",
    classification: "DOCUMENT",
    existingEosRevision: "eos-canonical-R1",
  });
  const conflictVisible = "conflict" in conflictResult && conflictResult.conflict.visible && !conflictResult.conflict.silentOverwrite;

  const exportEnv = store.exportArtifact({
    connector: docConnector,
    objectId: calculation.id,
    revisionId: null,
    actorId: "engineer-1",
    format: "json",
    authorizationRole: "engineer",
  });

  // Events + work items for external revision
  const revEvent = bus.publish({
    eventType: "EXTERNAL_REVISION_DETECTED",
    category: "REVISION_CHANGE",
    ...ctx,
    objectId: "DOC-EXT-1",
    actorId: "system",
    source: "eos3.integration.connector",
    idempotencyKey: "ext-rev:DOC-EXT-1:R2",
    sequenceHint: 1,
  });
  bus.markProcessed(revEvent.eventId);
  const reviewItem = createWorkItem({
    ...ctx,
    objectId: "DOC-EXT-1",
    type: "review_required",
    assignedTo: { kind: "role", value: "reviewer" },
  });

  // 3-7: Calculation + input manifest + submit + run synthetic
  const manifest = createInputManifest({
    ...ctx,
    analysisType: "static_utilisation",
    governingObjectRevisions: [{ objectId: calculation.id, revisionId: "rev-A" }],
    engineeringBasisRef: "EB-STAGING-1",
    assumptions: ["gravity 9.81"],
    parameters: { massKg: 850 },
    units: { force: "kN", length: "m", mass: "kg" },
    axisConvention: "right_handed_xyz",
    solver,
    actorId: "engineer-1",
    inputFiles: ["sandbox/input/model.json"],
  });

  let job = runtime.submitJob({
    solver,
    connector,
    manifest,
    actorId: "engineer-1",
    idempotencyKey: `job:${manifest.manifestId}:v1`,
  });
  const dupSubmit = runtime.submitJob({
    solver,
    connector,
    manifest,
    actorId: "engineer-1",
    idempotencyKey: `job:${manifest.manifestId}:v1`,
  });
  const submissionIdempotent = dupSubmit.jobId === job.jobId;

  job = runtime.transitionJob(job, "VALIDATING");
  job = runtime.transitionJob(job, "READY");
  job = runtime.transitionJob(job, "SUBMITTED");
  const submittedEvent = bus.publish({
    eventType: "SOLVER_SUBMITTED",
    category: "OPTIMIZATION_RESULT",
    ...ctx,
    objectId: job.jobId,
    source: "eos3.solver.runtime",
    causationId: revEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `solver-sub:${job.jobId}`,
    sequenceHint: 2,
  });
  bus.markProcessed(submittedEvent.eventId);
  job = runtime.transitionJob(job, "RUNNING");

  const synth = runSyntheticSolver(manifest, "success");
  if (!synth.ok) throw new Error("synthetic_unexpected_failure");
  const synth2 = runSyntheticSolver(manifest, "success");
  const syntheticReproducible =
    synth.ok && synth2.ok && JSON.stringify(synth.payload) === JSON.stringify(synth2.payload);

  const result = runtime.ingestResult({
    job,
    solver,
    manifest,
    payload: synth.payload,
    units: synth.units,
    axisConvention: synth.axisConvention,
    expectedSolverVersion: "1.0.0",
    calculationObjectId: calculation.id,
  });

  const completedEvent = bus.publish({
    eventType: "SOLVER_COMPLETED",
    category: "OPTIMIZATION_RESULT",
    ...ctx,
    objectId: job.jobId,
    source: "eos3.solver.runtime",
    causationId: submittedEvent.eventId,
    correlationId: revEvent.correlationId,
    idempotencyKey: `solver-done:${job.jobId}:${result.outputHash}`,
    sequenceHint: 3,
  });
  bus.markProcessed(completedEvent.eventId);

  // Duplicate completion protection
  const dupProtect = runtime.protectDuplicateResult(job.jobId, result.outputHash);
  const replayDup = bus.publish({
    eventType: "SOLVER_COMPLETED",
    category: "OPTIMIZATION_RESULT",
    ...ctx,
    objectId: job.jobId,
    source: "eos3.solver.runtime",
    idempotencyKey: `solver-done:${job.jobId}:${result.outputHash}`,
    sequenceHint: 3,
  });

  // Failure scenario
  const failManifest = createInputManifest({
    ...ctx,
    analysisType: "static_utilisation",
    governingObjectRevisions: [{ objectId: calculation.id, revisionId: "rev-A" }],
    parameters: { massKg: 1 },
    units: { force: "kN", length: "m", mass: "kg" },
    axisConvention: "right_handed_xyz",
    solver,
    actorId: "engineer-1",
  });
  let failJob = runtime.submitJob({
    solver,
    connector,
    manifest: failManifest,
    actorId: "engineer-1",
    idempotencyKey: "fail-job-1",
  });
  failJob = runtime.transitionJob(failJob, "VALIDATING");
  failJob = runtime.transitionJob(failJob, "READY");
  failJob = runtime.transitionJob(failJob, "SUBMITTED");
  failJob = runtime.transitionJob(failJob, "RUNNING");
  const failSynth = runSyntheticSolver(failManifest, "failure");
  failJob = runtime.markFailed(failJob, failSynth.ok ? "unexpected" : failSynth.reason);
  let failIngestDenied = false;
  try {
    runtime.ingestResult({
      job: failJob,
      solver,
      manifest: failManifest,
      payload: { analysisType: "static_utilisation", x: 1 },
      units: failManifest.units,
      axisConvention: failManifest.axisConvention,
    });
  } catch {
    failIngestDenied = true;
  }

  // Timeout scenario
  let toJob = runtime.submitJob({
    solver,
    connector,
    manifest: createInputManifest({
      ...ctx,
      analysisType: "static_utilisation",
      governingObjectRevisions: [{ objectId: calculation.id, revisionId: "rev-A" }],
      parameters: { massKg: 2 },
      units: failManifest.units,
      axisConvention: failManifest.axisConvention,
      solver,
      actorId: "engineer-1",
    }),
    actorId: "engineer-1",
    idempotencyKey: "timeout-job-1",
  });
  toJob = runtime.transitionJob(toJob, "VALIDATING");
  toJob = runtime.transitionJob(toJob, "READY");
  toJob = runtime.transitionJob(toJob, "SUBMITTED");
  toJob = runtime.transitionJob(toJob, "RUNNING");
  toJob = runtime.markTimedOut(toJob);

  // Retry scenario — same idempotency for original; retry increments without new uncontrolled external job key
  failJob = runtime.retryJob(failJob);
  const retryOk = failJob.state === "CREATED" && failJob.retryCount === 1 && failJob.resultId === null;
  failJob = runtime.transitionJob(failJob, "VALIDATING");
  failJob = runtime.transitionJob(failJob, "READY");
  failJob = runtime.transitionJob(failJob, "SUBMITTED");
  failJob = runtime.transitionJob(failJob, "RUNNING");
  const retrySynth = runSyntheticSolver(failManifest, "success");
  if (!retrySynth.ok) throw new Error("retry_synth_failed");
  const retryResult = runtime.ingestResult({
    job: failJob,
    solver,
    manifest: failManifest,
    payload: retrySynth.payload,
    units: retrySynth.units,
    axisConvention: retrySynth.axisConvention,
    calculationObjectId: calculation.id,
  });
  const retryNoDupAuthoritative = retryResult.resultId !== result.resultId;

  // Unqualified result
  const unqualifiedResult = result.qualificationState === "INTEGRATED_NOT_VALIDATED";

  // D1 inheritance blocked
  const noD1Inherit = inheritD1QualificationToExternalSolver() === false;

  // Version mismatch
  let versionMismatchRejected = false;
  const vmManifest = createInputManifest({
    ...ctx,
    analysisType: "static_utilisation",
    governingObjectRevisions: [{ objectId: calculation.id, revisionId: "rev-A" }],
    parameters: { massKg: 3 },
    units: failManifest.units,
    axisConvention: failManifest.axisConvention,
    solver,
    actorId: "engineer-1",
  });
  let vmJob = runtime.submitJob({
    solver,
    connector,
    manifest: vmManifest,
    actorId: "engineer-1",
    idempotencyKey: "ver-mismatch-1",
  });
  vmJob = runtime.transitionJob(vmJob, "VALIDATING");
  vmJob = runtime.transitionJob(vmJob, "READY");
  vmJob = runtime.transitionJob(vmJob, "SUBMITTED");
  vmJob = runtime.transitionJob(vmJob, "RUNNING");
  try {
    runtime.ingestResult({
      job: vmJob,
      solver,
      manifest: vmManifest,
      payload: { analysisType: "static_utilisation", x: 1 },
      units: vmManifest.units,
      axisConvention: vmManifest.axisConvention,
      expectedSolverVersion: "9.9.9",
    });
  } catch {
    versionMismatchRejected = true;
  }

  // Unit mismatch
  let unitMismatchRejected = false;
  try {
    const bad = checkUnitCompatibility({ force: "kN" }, { force: "N" });
    if (!bad.ok) unitMismatchRejected = true;
    runtime.ingestResult({
      job: vmJob,
      solver,
      manifest: vmManifest,
      payload: { analysisType: "static_utilisation", x: 1 },
      units: { force: "N", length: "m", mass: "kg" },
      axisConvention: vmManifest.axisConvention,
      expectedSolverVersion: "1.0.0",
    });
  } catch {
    unitMismatchRejected = true;
  }

  // Tamper: wrong manifest
  let tamperRejected = false;
  try {
    runtime.ingestResult({
      job,
      solver,
      manifest: failManifest,
      payload: { analysisType: "static_utilisation", x: 1 },
      units: failManifest.units,
      axisConvention: failManifest.axisConvention,
    });
  } catch {
    tamperRejected = true;
  }

  // Path traversal / command injection
  const pathTrav = validateSolverFilePath("../etc/passwd");
  const absPath = validateSolverFilePath("C:\\Windows\\system32\\cmd.exe");
  const cmdInj = buildSafeSolverArgv("solver.exe", ["--in", "a; rm -rf /"]);
  const pathTraversalTest = !pathTrav.ok && !absPath.ok;
  const commandInjectionTest = !cmdInj.ok;

  // Cross-workspace object id / credential / API bypass
  const foreignConn = authorizeConnectorAccess(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
    },
    connector,
    "SUBMIT_ANALYSIS",
  );
  const foreignJob = runtime.authorizeSubmission(
    {
      authenticated: true,
      tenantId,
      workspaceId: "00000000-0000-4000-8000-ffffffffffff",
      eos3Entitled: true,
      eos3Enrolled: true,
      role: "engineer",
    },
    { tenantId, workspaceId },
  );
  const credDenied = readConnectorSecret(store.vault, connector.connectorId, {
    role: "viewer",
    authorizedSecretAccess: false,
  });
  const aiCred = AI_CONNECTOR_CREDENTIAL_AUTHORITY === false;
  const apiBypass = runtime.authorizeSubmission(
    {
      authenticated: true,
      tenantId,
      workspaceId,
      eos3Entitled: true,
      eos3Enrolled: true,
      role: "ai",
    },
    { tenantId, workspaceId },
  );
  const logSafe = redactForLog({ token: "super-secret", nested: { api_key: "x" }, ok: true });

  // Decision evidence linkage — no auto finalize
  let decision = createDecisionCase({
    ...ctx,
    subject: "Accept synthetic utilisation",
    decisionQuestion: "Use solver RESULT as evidence?",
    decisionOwnerId: "decision-owner-1",
    decisionAuthorityRole: "responsible_engineer",
  });
  decision = addOption(decision, {
    label: "Accept",
    description: "Use result",
    origin: "human",
    assumptionIds: [],
    constraintKeys: [],
    objectiveScores: { safety: 1 },
    evidenceIds: [result.resultId],
    risks: [],
    estimatedConsequences: [],
    calculationIds: [calculation.id],
    optimizationCandidateIds: [],
    evidenceClass: "FACT",
  });
  decision = setWeightScheme(decision, {
    version: "v1",
    source: "human",
    actorId: "decision-owner-1",
    rationale: "equal",
    weights: { safety: 1 },
    authority: "human",
    acceptedByHuman: true,
  });
  decision.objectives = [
    {
      objectiveId: "o1",
      key: "safety",
      direction: "maximize",
      unit: null,
      target: null,
      weight: 1,
      source: "human",
      authority: "human",
      acceptedByHuman: true,
      version: "v1",
      rationale: "x",
    },
  ];
  decision = generateRecommendation(decision);
  const decisionNotAutoFinalized = decision.lifecycle !== "DECIDED" && result.classification === "RESULT";

  const optSource = classifyOptimizationSource("external_solver");

  const performanceMs = performance.now() - t0;

  return {
    connectorSolverQualSeparation,
    importIdempotent,
    unauthorizedNotIndexed,
    conflictVisible,
    exportExternalAcceptanceImplied: exportEnv.externalAcceptanceImplied === false,
    submissionIdempotent,
    syntheticReproducible,
    result,
    jobState: job.state,
    calculationLinked: result.calculationObjectId === calculation.id,
    failIngestDenied,
    timeoutState: toJob.state,
    retryOk,
    retryNoDupAuthoritative,
    unqualifiedResult,
    noD1Inherit,
    versionMismatchRejected,
    unitMismatchRejected,
    tamperRejected,
    pathTraversalTest,
    commandInjectionTest,
    foreignConnDenied: !foreignConn.allowed,
    foreignJobDenied: !foreignJob.allowed,
    credAccessDenied: !credDenied.allowed,
    aiCredBoundary: aiCred,
    apiBypassDenied: !apiBypass.allowed,
    aiEnableDenied,
    aiQualDenied,
    aiSolverQualAuthority: AI_SOLVER_QUALIFICATION_AUTHORITY,
    logSafe,
    decisionNotAutoFinalized,
    optSource,
    dmsBoundary: EOS3_DMS_BOUNDARY_PRESERVED,
    externalSolverGlobalQual: EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
    spaceGassStatus: SPACE_GASS_CONNECTOR_STATUS,
    spaceGassGlobalQual: SPACE_GASS_GLOBAL_QUALIFICATION,
    reviewItem,
    dupProtect,
    replayDupStatus: replayDup.status,
    store,
    runtime,
    bus,
    observability: { integration: store.observability, solver: runtime.observability },
    performanceMs,
    recoverability: {
      jobs: runtime.jobs.length,
      results: runtime.results.length,
      imports: store.imports.length,
      mappings: store.mappings.length,
      auditPresent: connector.audit.length > 0,
    },
    workflowAuthForeign: !authorizeWorkflowAccess(
      {
        authenticated: true,
        tenantId,
        workspaceId: "00000000-0000-4000-8000-ffffffffffff",
        eos3Entitled: true,
        eos3Enrolled: true,
      },
      {
        instanceId: "x",
        tenantId,
        workspaceId,
        projectId,
        objectId: "o",
        objectType: "Deliverable",
        revisionId: null,
        workflowId: "w",
        workflowVersion: "1",
        currentState: "DRAFT",
        pendingActions: [],
        requiredEvidence: [],
        transitionHistory: [],
        provenance: {},
        audit: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ).allowed,
  };
}

export function hashContent(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
