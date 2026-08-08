import { describe, expect, it } from "vitest";
import {
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  PHASE_12G_CERTIFIED_COMMIT,
  PHASE_12G_VERSION,
  PHASE_12I_READY,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_ASSURANCE_DOMAIN_EVENTS,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SimulationMethodQualificationReady,
  SimulationQualificationEligibilityReady,
  TwinSimulationFrameworkReady,
  TwinSimulationPackageReady,
  assertExternalSolverAdaptersNotImplemented,
  assertOwnershipLock,
  assertSimulationContracts,
  assertSimulationForbiddenCapabilities,
  assertSimulationQualificationTerminologyLock,
  assessPackageCompleteness,
  assessSimulationQualificationEligibility,
  assessSimulationReproducibility,
  createCompatibilityMatrixEntry,
  createSimulationApplicationQualification,
  createSimulationExecutionQualification,
  createSimulationMethodQualification,
  createSimulationProviderQualification,
  createTwinSimulationDefinition,
  createTwinSimulationExecutionOrchestrator,
  createTwinSimulationExecutionRequest,
  createTwinSimulationInputSet,
  createTwinSimulationMethod,
  createTwinSimulationProvider,
  createTwinSimulationScenario,
  createTwinSimulatedState,
  createTwinSimulationPackage,
  hashSimulationPackageManifest,
  linkSimulatedStateToPackage,
  sealSimulationPackage,
  transitionApplicationQualificationStatus,
  transitionMethodQualificationStatus,
  transitionMethodStatus,
  transitionProviderQualificationStatus,
  transitionProviderStatus,
  verifyPackageIntegrity,
} from "../src/index";

describe("Phase 12H Digital Twin simulation assurance", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";
  const twinId = "twin-1";

  it("declares assurance version and pinned 12G baseline", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.9.0-external-solver");
    expect(DIGITAL_TWIN_STATUS).toBe("external_solver");
    expect(DIGITAL_TWIN_PHASE).toBe("12I");
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.9.0-external-solver-draft");
    expect(PHASE_12G_VERSION).toBe("0.7.0-simulation");
    expect(PHASE_12G_CERTIFIED_COMMIT).toBe(
      "a3832076425b276f089e38f1c9aa76559014454c",
    );
    expect(PHASE_12I_READY).toBe(true);
    expect(TwinSimulationFrameworkReady).toBe(true);
    expect(SimulationMethodQualificationReady).toBe(true);
    expect(SimulationQualificationEligibilityReady).toBe(true);
    expect(TwinSimulationPackageReady).toBe(true);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(true);
    expect(NATIVE_ENGINEERING_SOLVER_IMPLEMENTED).toBe(false);
    expect(EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED).toBe(true);
  });

  it("locks forbidden capabilities and terminology", () => {
    assertSimulationForbiddenCapabilities();
    assertSimulationContracts();
    assertSimulationQualificationTerminologyLock();
    assertExternalSolverAdaptersNotImplemented();
  });

  it("declares assurance events in catalog", () => {
    for (const evt of SIMULATION_ASSURANCE_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("asserts ownership lock with assurance flags", () => {
    const lock = assertOwnershipLock();
    expect(lock.simulationMethodQualificationReady).toBe(true);
    expect(lock.twinSimulationPackageReady).toBe(true);
    expect(lock.externalEngineeringSolverAdaptersImplemented).toBe(true);
    expect(lock.spatialOwnershipFullyResolved).toBe(false);
  });

  it("builds fixture-scoped qualifications and eligibility", () => {
    let methodQ = createSimulationMethodQualification({
      methodQualificationId: "mq1",
      tenantId,
      workspaceId,
      methodId: "m1",
    });
    methodQ = transitionMethodQualificationStatus(methodQ, "active");

    let providerQ = createSimulationProviderQualification({
      providerQualificationId: "pq1",
      tenantId,
      workspaceId,
      providerId: "p1",
      methodId: "m1",
    });
    providerQ = transitionProviderQualificationStatus(providerQ, "active");

    let appQ = createSimulationApplicationQualification({
      applicationQualificationId: "aq1",
      tenantId,
      workspaceId,
      methodId: "m1",
      providerId: "p1",
      context: { applicationKey: "fixture_assurance" },
    });
    appQ = transitionApplicationQualificationStatus(appQ, "active");

    const matrix = [
      createCompatibilityMatrixEntry({
        entryId: "c1",
        methodId: "m1",
        providerId: "p1",
        applicationKey: "fixture_assurance",
        compatible: true,
      }),
    ];

    const assessment = assessSimulationQualificationEligibility({
      methodId: "m1",
      providerId: "p1",
      applicationKey: "fixture_assurance",
      methodQualifications: [methodQ],
      providerQualifications: [providerQ],
      applicationQualifications: [appQ],
      compatibilityEntries: matrix,
      assuranceRequired: true,
    });
    expect(assessment.outcome).toBe("eligible");
    expect(assessment.failClosed).toBe(true);
    expect(assessment.autoInherited).toBe(false);
  });

  it("fail-closes when provider qualification is for another method", () => {
    let methodQ = createSimulationMethodQualification({
      methodQualificationId: "mq1",
      tenantId,
      workspaceId,
      methodId: "m1",
    });
    methodQ = transitionMethodQualificationStatus(methodQ, "active");
    let providerQ = createSimulationProviderQualification({
      providerQualificationId: "pq1",
      tenantId,
      workspaceId,
      providerId: "p1",
      methodId: "m-other",
    });
    providerQ = transitionProviderQualificationStatus(providerQ, "active");
    let appQ = createSimulationApplicationQualification({
      applicationQualificationId: "aq1",
      tenantId,
      workspaceId,
      methodId: "m1",
      providerId: "p1",
      context: { applicationKey: "fixture_assurance" },
    });
    appQ = transitionApplicationQualificationStatus(appQ, "active");

    const assessment = assessSimulationQualificationEligibility({
      methodId: "m1",
      providerId: "p1",
      applicationKey: "fixture_assurance",
      methodQualifications: [methodQ],
      providerQualifications: [providerQ],
      applicationQualifications: [appQ],
      compatibilityEntries: [
        createCompatibilityMatrixEntry({
          entryId: "c1",
          methodId: "m1",
          providerId: "p1",
          applicationKey: "fixture_assurance",
          compatible: true,
        }),
      ],
    });
    expect(assessment.outcome).toBe("not_eligible");
  });

  it("orchestrates fixture under assurance mode with qualifications", () => {
    let method = createTwinSimulationMethod({
      methodId: "m1",
      tenantId,
      workspaceId,
      methodKey: "fixture-structural",
      displayName: "Fixture Structural",
      simulationClass: "structural",
    });
    method = transitionMethodStatus(method, "registered");
    method = transitionMethodStatus(method, "qualified");

    let provider = createTwinSimulationProvider({
      providerId: "p1",
      tenantId,
      workspaceId,
      providerKey: "det-fixture",
      displayName: "Deterministic Fixture",
      providerType: "deterministic_fixture",
    });
    provider = transitionProviderStatus(provider, "registered");
    provider = transitionProviderStatus(provider, "certified");

    const definition = createTwinSimulationDefinition({
      definitionId: "d1",
      tenantId,
      workspaceId,
      twinId,
      definitionKey: "def-1",
      displayName: "Def 1",
      simulationClass: "structural",
      methodId: method.methodId,
      providerId: provider.providerId,
      simulationReadyContextDeclared: true,
    });
    const scenario = createTwinSimulationScenario({
      scenarioId: "s1",
      tenantId,
      workspaceId,
      twinId,
      definitionId: definition.definitionId,
      scenarioKey: "sc-1",
      displayName: "Scenario 1",
    });
    const inputSet = createTwinSimulationInputSet({
      inputSetId: "i1",
      tenantId,
      workspaceId,
      twinId,
      scenarioId: scenario.scenarioId,
      definitionId: definition.definitionId,
      representationVersionPins: ["rep-v1"],
      publishedStateVersionPins: ["state-v1"],
      parameters: { load: 10 },
    });

    let methodQ = createSimulationMethodQualification({
      methodQualificationId: "mq1",
      tenantId,
      workspaceId,
      methodId: method.methodId,
    });
    methodQ = transitionMethodQualificationStatus(methodQ, "active");
    let providerQ = createSimulationProviderQualification({
      providerQualificationId: "pq1",
      tenantId,
      workspaceId,
      providerId: provider.providerId,
      methodId: method.methodId,
    });
    providerQ = transitionProviderQualificationStatus(providerQ, "active");
    let appQ = createSimulationApplicationQualification({
      applicationQualificationId: "aq1",
      tenantId,
      workspaceId,
      methodId: method.methodId,
      providerId: provider.providerId,
      context: { applicationKey: "fixture_assurance" },
    });
    appQ = transitionApplicationQualificationStatus(appQ, "active");

    const request = createTwinSimulationExecutionRequest({
      tenantId,
      workspaceId,
      twinId,
      definitionId: definition.definitionId,
      scenarioId: scenario.scenarioId,
      inputSetId: inputSet.inputSetId,
      methodId: method.methodId,
      providerId: provider.providerId,
      authorizedBy: "engineer-1",
    });

    const orch = createTwinSimulationExecutionOrchestrator();
    const result = orch.execute(request, {
      definition,
      scenario,
      inputSet,
      method,
      provider,
      assuranceRequired: true,
      applicationKey: "fixture_assurance",
      eligibility: {
        methodId: method.methodId,
        providerId: provider.providerId,
        applicationKey: "fixture_assurance",
        methodQualifications: [methodQ],
        providerQualifications: [providerQ],
        applicationQualifications: [appQ],
        compatibilityEntries: [
          createCompatibilityMatrixEntry({
            entryId: "c1",
            methodId: method.methodId,
            providerId: provider.providerId,
            applicationKey: "fixture_assurance",
            compatible: true,
          }),
        ],
      },
    });

    expect(result.run.status).toBe("succeeded");
    expect(result.publishedObservedState).toBe(false);
    expect(result.eligibility?.outcome).toBe("eligible");
    expect(result.run.nativeSolverInvoked).toBe(false);
  });

  it("packages, integrity, reproducibility, and simulated-state link", () => {
    const required = [
      "input_manifest",
      "result_summary",
      "validation_record",
      "review_record",
      "environment_metadata",
    ] as const;
    let pkg = createTwinSimulationPackage({
      packageId: "pkg1",
      packageVersionId: "pv1",
      tenantId,
      workspaceId,
      twinId,
      packageKey: "pkg-1",
      methodId: "m1",
      providerId: "p1",
      requiredArtifactClasses: [...required],
      artifactRefs: required.map((artifactClass, i) => ({
        artifactId: `a${i}`,
        artifactClass,
        fileId: `platform-files:art-${i}`,
        contentHash: `hash-${i}`,
      })),
    });
    expect(assessPackageCompleteness(pkg).complete).toBe(true);
    pkg = sealSimulationPackage(pkg);
    expect(pkg.status).toBe("sealed");

    const expected = hashSimulationPackageManifest(pkg.manifest);
    const integrity = verifyPackageIntegrity({
      integrityId: "int1",
      packageId: pkg.packageId,
      packageVersionId: "pv1",
      expectedManifestHash: expected,
      manifest: pkg.manifest,
    });
    expect(integrity.hashMismatch).toBe(false);

    const repro = assessSimulationReproducibility({
      reproducibilityId: "r1",
      packageId: pkg.packageId,
      packageVersionId: "pv1",
      packageSealed: true,
      integrityHashMatch: true,
      environmentRecorded: true,
      environmentId: "env1",
      manifestHash: expected,
    });
    expect(repro.outcome).toBe("reproducible_within_bounds");
    expect(repro.claimsBitExactUniversal).toBe(false);

    let state = createTwinSimulatedState({
      simulatedStateId: "ss1",
      tenantId,
      workspaceId,
      twinId,
      simulationResultRef: "res1",
      methodId: "m1",
      providerId: "p1",
      scenarioId: "s1",
      inputSetId: "i1",
      externalRef: "ext-ss1",
    });
    state = linkSimulatedStateToPackage(state, pkg.packageId);
    expect(state.simulationPackageId).toBe(pkg.packageId);

    const execQ = createSimulationExecutionQualification({
      executionQualificationId: "eq1",
      tenantId,
      workspaceId,
      twinId,
      runId: "run1",
      resultId: "res1",
      methodQualificationId: "mq1",
      providerQualificationId: "pq1",
      applicationQualificationId: "aq1",
      validationId: "v1",
      reviewId: "rev1",
      packageId: pkg.packageId,
      evidence: {
        pinsPresent: true,
        unitsGoverned: true,
        inputImmutable: true,
        runSucceeded: true,
        validationRecorded: true,
        humanReviewRecorded: true,
        allLayersActive: true,
      },
    });
    expect(execQ.status).toBe("qualified");
    expect(execQ.engineeringApproved).toBe(false);
  });
});
