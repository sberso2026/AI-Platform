import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_SIMULATION_APPROVAL_ENABLED,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  PHASE_12F_CERTIFIED_COMMIT,
  PHASE_12F_VERSION,
  PHASE_12H_READY,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_DOMAIN_EVENTS,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SIMULATION_OPTIMIZATION_IMPLEMENTED,
  TwinSimulatedStateReady,
  TwinSimulationFrameworkReady,
  assertComparisonNotOptimization,
  assertNoAutomaticSimulationApproval,
  assertObservedNotSimulated,
  assertOwnershipLock,
  assertSimulationContracts,
  assertSimulationForbiddenCapabilities,
  assertSimulationTerminologyLock,
  assertStateSemanticFirewall,
  createTwinSimulationDefinition,
  createTwinSimulationExecutionOrchestrator,
  createTwinSimulationExecutionRequest,
  createTwinSimulationInputSet,
  createTwinSimulationMethod,
  createTwinSimulationProvider,
  createTwinSimulationScenario,
  createTwinSimulationScenarioComparison,
  createTwinSimulatedState,
  decideSimulationReview,
  freezeInputSet,
  mutateInputSetParameters,
  publishTwinSimulatedState,
  runDeterministicFixtureProvider,
  transitionMethodStatus,
  transitionProviderStatus,
} from "../src/index";

describe("Phase 12G Digital Twin simulation", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";
  const twinId = "twin-1";

  it("declares simulation version and pinned 12F baseline", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.8.0-simulation-assurance");
    expect(DIGITAL_TWIN_STATUS).toBe("simulation_assurance");
    expect(DIGITAL_TWIN_PHASE).toBe("12H");
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.8.0-simulation-assurance-draft");
    expect(PHASE_12F_VERSION).toBe("0.6.0-representation");
    expect(PHASE_12F_CERTIFIED_COMMIT).toBe("2846421e7905a69c789a882a86da4071272278e3");
    expect(PHASE_12H_READY).toBe(true);
    expect(TwinSimulationFrameworkReady).toBe(true);
    expect(TwinSimulatedStateReady).toBe(true);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(true);
    expect(NATIVE_ENGINEERING_SOLVER_IMPLEMENTED).toBe(false);
  });

  it("locks forbidden capabilities", () => {
    expect(SIMULATION_OPTIMIZATION_IMPLEMENTED).toBe(false);
    expect(AUTOMATIC_SIMULATION_APPROVAL_ENABLED).toBe(false);
    assertSimulationForbiddenCapabilities();
    assertSimulationContracts();
    assertSimulationTerminologyLock();
  });

  it("declares simulation events in catalog", () => {
    for (const evt of SIMULATION_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("asserts ownership lock with simulation flags", () => {
    const lock = assertOwnershipLock();
    expect(lock.simulationExecutionImplemented).toBe(true);
    expect(lock.nativeEngineeringSolverImplemented).toBe(false);
    expect(lock.twinSimulationFrameworkReady).toBe(true);
    expect(lock.duplicateEngineeringToolFrameworkDetected).toBe(false);
    expect(lock.spatialOwnershipFullyResolved).toBe(false);
  });

  it("registers method/provider and freezes input set", () => {
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
    method = transitionMethodStatus(method, "certified");

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
    let inputSet = createTwinSimulationInputSet({
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
    inputSet = freezeInputSet(inputSet);
    expect(inputSet.immutable).toBe(true);
    expect(() => mutateInputSetParameters(inputSet, { load: 20 })).toThrow(
      /input_set_immutable_after_run_starts/,
    );
  });

  it("orchestrates fixture success without publishing observed state", () => {
    let method = createTwinSimulationMethod({
      methodId: "m2",
      tenantId,
      workspaceId,
      methodKey: "fixture-2",
      displayName: "Fixture 2",
      simulationClass: "thermal",
    });
    method = transitionMethodStatus(method, "registered");
    let provider = createTwinSimulationProvider({
      providerId: "p2",
      tenantId,
      workspaceId,
      providerKey: "fixture-2",
      displayName: "Fixture 2",
      providerType: "deterministic_fixture",
    });
    provider = transitionProviderStatus(provider, "registered");
    const definition = createTwinSimulationDefinition({
      definitionId: "d2",
      tenantId,
      workspaceId,
      twinId,
      definitionKey: "def-2",
      displayName: "Def 2",
      simulationClass: "thermal",
      methodId: method.methodId,
      providerId: provider.providerId,
    });
    const scenario = createTwinSimulationScenario({
      scenarioId: "s2",
      tenantId,
      workspaceId,
      twinId,
      definitionId: definition.definitionId,
      scenarioKey: "sc-2",
      displayName: "Scenario 2",
    });
    const inputSet = createTwinSimulationInputSet({
      inputSetId: "i2",
      tenantId,
      workspaceId,
      twinId,
      scenarioId: scenario.scenarioId,
      definitionId: definition.definitionId,
      representationVersionPins: ["rep-v2"],
      publishedStateVersionPins: ["state-v2"],
    });
    const request = createTwinSimulationExecutionRequest({
      tenantId,
      workspaceId,
      twinId,
      definitionId: definition.definitionId,
      scenarioId: scenario.scenarioId,
      inputSetId: inputSet.inputSetId,
      methodId: method.methodId,
      providerId: provider.providerId,
      authorizedBy: "user-1",
    });
    const result = createTwinSimulationExecutionOrchestrator().execute(request, {
      definition,
      scenario,
      inputSet,
      method,
      provider,
    });
    expect(result.run.status).toBe("succeeded");
    expect(result.publishedObservedState).toBe(false);
    expect(result.result?.claimsNativeSolver).toBe(false);
    expect(result.validation?.status).toBe("not_validated");
    expect(result.review?.lifecycle).toBe("pending_review");
    assertNoAutomaticSimulationApproval(result.review!);
  });

  it("fail-closes on timeout and forbids auto-approve", () => {
    const fixture = runDeterministicFixtureProvider({
      contentHash: "abc",
      timeoutMs: 1000,
      forceTimeout: true,
    });
    expect(fixture.ok).toBe(false);
    if (!fixture.ok) expect(fixture.errorCode).toBe("provider_timeout");
  });

  it("enforces firewall and no observed overwrite", () => {
    const simulated = createTwinSimulatedState({
      simulatedStateId: "sim-1",
      tenantId,
      workspaceId,
      twinId,
      simulationResultRef: "res-1",
      methodId: "m1",
      providerId: "p1",
      scenarioId: "s1",
      inputSetId: "i1",
      externalRef: "sim://1",
    });
    const published = publishTwinSimulatedState(simulated);
    expect(published.lifecycle).toBe("published");
    expect(published.replacesObservedState).toBe(false);
    assertObservedNotSimulated(
      { category: "observed", externalRef: "obs://1" },
      { category: "simulated", externalRef: "sim://1" },
    );
    assertStateSemanticFirewall({
      observed: {
        stateRefId: "o1",
        twinId,
        tenantId,
        workspaceId,
        category: "observed",
        version: 1,
        provenance: { sourceModule: "test", sourceRef: "s", capturedAt: new Date().toISOString() },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        externalRef: "obs://1",
        observedAt: new Date().toISOString(),
        liveIngestionEnabled: false,
      },
      simulated: published,
    });
    expect(() =>
      assertObservedNotSimulated(
        { category: "observed", externalRef: "same" },
        { category: "simulated", externalRef: "same" },
      ),
    ).toThrow(/observed_must_not_equal_simulated/);
  });

  it("scenario comparison is not optimization", () => {
    const comparison = createTwinSimulationScenarioComparison({
      comparisonId: "c1",
      tenantId,
      workspaceId,
      twinId,
      baselineScenarioId: "s1",
      candidateScenarioId: "s2",
      baselineSummary: { stress: 1 },
      candidateSummary: { stress: 2 },
    });
    expect(comparison.differences.length).toBe(1);
    assertComparisonNotOptimization(comparison);
    expect(SIMULATION_OPTIMIZATION_IMPLEMENTED).toBe(false);
  });

  it("rejects AI self-approval on review decide path", () => {
    expect(() =>
      decideSimulationReview(
        {
          reviewId: "r1",
          tenantId,
          workspaceId,
          twinId,
          resultId: "res",
          validationId: "val",
          lifecycle: "pending_review",
          autoApproved: true,
          aiSelfApproved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        "approved",
      ),
    ).toThrow(/automatic_or_ai_self_approval_forbidden/);
  });
});
