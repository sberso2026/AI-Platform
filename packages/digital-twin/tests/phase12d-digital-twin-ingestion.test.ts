import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED,
  CERTIFIED_SOURCE_ADAPTERS,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_RUNTIME_IMPLEMENTED,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED,
  INGESTION_DOMAIN_EVENTS,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHASE_12C_CERTIFIED_COMMIT,
  PHASE_12C_VERSION,
  PHASE_12D_CERTIFIED_COMMIT,
  PHASE_12D_VERSION,
  PHASE_12E_READY,
  PUBLIC_CONTRACT_VERSION,
  SHM_RUNTIME_IMPLEMENTED,
  SIMULATION_EXECUTION_IMPLEMENTED,
  TWIN_SOURCE_ADAPTER_READY,
  TWIN_STATE_INGESTION_READY,
  TWIN_STATE_RECONCILIATION_READY,
  TwinStateIngestionReady,
  assertIngestionContracts,
  assertIngestionForbiddenCapabilities,
  assertIngestionRuntimeBounded,
  assertOwnershipLock,
  assertStateForbiddenCapabilities,
  createDigitalTwinEngine,
  createDigitalTwinRepository,
  createDurableDigitalTwinMemoryStore,
  createTwinStateReconciliationEngine,
  createTwinStateSchemaRegistry,
  evaluateSourceFreshness,
  getSourceAdapter,
  listSourceAdapters,
} from "../src/index";

describe("Phase 12D Digital Twin governed state ingestion", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";

  it("retains ingestion capabilities with pinned 12C/12D baselines", () => {
    expect(PHASE_12C_VERSION).toBe("0.3.0-state");
    expect(PHASE_12C_CERTIFIED_COMMIT).toBe("07b5ccc843395bd02633163dc654668da9f17658");
    expect(PHASE_12D_VERSION).toBe("0.4.0-ingestion");
    expect(PHASE_12D_CERTIFIED_COMMIT).toBe("3e387f4b76cbd9c80b274585c7b78821482f496d");
    expect(PHASE_12E_READY).toBe(true);
    expect(TWIN_STATE_INGESTION_READY).toBe(true);
    expect(TwinStateIngestionReady).toBe(true);
    expect(TWIN_SOURCE_ADAPTER_READY).toBe(true);
    expect(TWIN_STATE_RECONCILIATION_READY).toBe(true);
    expect(DIGITAL_TWIN_RUNTIME_IMPLEMENTED).toBe(true);
    expect(AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED).toBe(false);
  });

  it("certifies minimal source adapters without private coupling", () => {
    const adapters = listSourceAdapters();
    expect(adapters.some((a) => a.adapterId === "manual_governed")).toBe(true);
    expect(adapters.some((a) => a.adapterId === "asset_intelligence_public_contract")).toBe(true);
    expect(adapters.some((a) => a.adapterId === "project_controls_public_contract")).toBe(true);
    const iiStub = getSourceAdapter("inspection_intelligence_readiness_stub");
    expect(iiStub?.status).toBe("readiness_stub");
    expect(CERTIFIED_SOURCE_ADAPTERS.every((a) => a.autoPublishEnabled === false)).toBe(true);
  });

  it("evaluates freshness policy states", () => {
    const now = new Date().toISOString();
    expect(evaluateSourceFreshness({ observedAt: now, now })).toBe("fresh");
    const stale = new Date(Date.now() - 121 * 60_000).toISOString();
    expect(evaluateSourceFreshness({ observedAt: stale, now })).toBe("aging");
  });

  it("declares ingestion events in catalog", () => {
    expect(assertIngestionContracts().contractVersion).toBe("1.0.0");
    for (const evt of INGESTION_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("forbids high-frequency telemetry, SHM, sim, and auto-publish", () => {
    expect(LIVE_TELEMETRY_IMPLEMENTED).toBe(true);
    expect(HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED).toBe(false);
    expect(SHM_RUNTIME_IMPLEMENTED).toBe(false);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(true);
    assertIngestionForbiddenCapabilities();
    assertIngestionRuntimeBounded();
    assertStateForbiddenCapabilities();
    const lock = assertOwnershipLock();
    expect(lock.digitalTwinRuntimeImplemented).toBe(true);
    expect(lock.automaticObservedStatePublicationEnabled).toBe(false);
  });

  it("reconciles candidates with class-based outcomes", () => {
    const engine = createTwinStateReconciliationEngine();
    const result = engine.reconcile(
      {
        candidate: {
          candidateId: "c1",
          tenantId,
          workspaceId,
          twinId: "t1",
          adapterId: "manual_governed",
          schemaId: "twin.observed.manual.v1",
          schemaVersion: "1.0.0",
          category: "observed",
          lifecycle: "validated",
          externalRef: "ref://1",
          idempotencyKey: "idem-1",
          observedAt: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          freshness: "fresh",
          payload: { observationRef: "doc://1" },
          provenance: {
            sourceModule: "manual",
            sourceRef: "entry-1",
            capturedAt: new Date().toISOString(),
          },
          evidenceRefs: [],
          updatedAt: new Date().toISOString(),
          storesTelemetryPayload: false,
          autoPublishAttempted: false,
          simulationExecuted: false,
          liveIngestionEnabled: false,
        },
        publishedStates: [],
        authorityAllowsAutoAccept: false,
      },
      () => "recon-1",
    );
    expect(result.outcome).toBe("accepted");
    expect(result.autoPublishBlocked).toBe(true);
    expect(result.requiresReview).toBe(true);
  });

  it("ingests observed state without auto-publish", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });

    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-ingest-1",
    });

    const result = await engine.ingestObservedState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      adapterId: "manual_governed",
      schemaId: "twin.observed.manual.v1",
      externalRef: "ref://manual/001",
      idempotencyKey: "idem-manual-001",
      observedAt: new Date().toISOString(),
      payload: { observationLabel: "Field reading", observationRef: "doc://evidence/1" },
      provenance: {
        sourceModule: "manual",
        sourceRef: "entry-001",
        capturedAt: new Date().toISOString(),
      },
    });

    expect(result.replayDetected).toBeFalsy();
    expect(result.candidate.lifecycle).toBe("pending_review");
    expect(result.candidate.autoPublishAttempted).toBe(false);
    expect(result.reconciliation.autoPublishBlocked).toBe(true);
    expect(result.review).toBeDefined();

    const states = await repository.listStates(tenantId, workspaceId, identity.twinId);
    expect(states.filter((s) => s.lifecycle === "published")).toHaveLength(0);
  });

  it("detects idempotent replay", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });
    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-idem-1",
    });

    const input = {
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      adapterId: "manual_governed",
      schemaId: "twin.observed.manual.v1",
      externalRef: "ref://manual/002",
      idempotencyKey: "idem-replay-001",
      observedAt: new Date().toISOString(),
      payload: { observationLabel: "Repeat", observationRef: "doc://evidence/2" },
      provenance: {
        sourceModule: "manual",
        sourceRef: "entry-002",
        capturedAt: new Date().toISOString(),
      },
    };

    const first = await engine.ingestObservedState(input);
    const second = await engine.ingestObservedState(input);
    expect(second.replayDetected).toBe(true);
    expect(second.candidate.candidateId).toBe(first.candidate.candidateId);
  });

  it("rejects telemetry payloads in schema registry", () => {
    const registry = createTwinStateSchemaRegistry();
    expect(() =>
      registry.validatePayload("twin.observed.manual.v1", {
        observationRef: "doc://1",
        telemetryPayload: { sensor: 1 },
      }),
    ).toThrow(/telemetry/i);
  });

  it("publishes only via governed review workflow", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });
    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-publish-1",
    });

    const ingested = await engine.ingestObservedState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      adapterId: "manual_governed",
      schemaId: "twin.observed.manual.v1",
      externalRef: "ref://manual/003",
      idempotencyKey: "idem-publish-001",
      observedAt: new Date().toISOString(),
      payload: { observationLabel: "Publish me", observationRef: "doc://evidence/3" },
      provenance: {
        sourceModule: "manual",
        sourceRef: "entry-003",
        capturedAt: new Date().toISOString(),
      },
      createdBy: "operator-1",
    });

    const approved = await engine.transitionCandidateReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      candidateId: ingested.candidate.candidateId,
      instance: ingested.review!.instance,
      action: "approve",
      to: "approved",
    });

    const published = await engine.publishCandidateViaReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      candidateId: ingested.candidate.candidateId,
      instance: approved.instance,
      action: "publish",
      to: "published",
      reviewerId: "reviewer-2",
    });

    expect(published.candidate.lifecycle).toBe("published");
    expect(published.stateId).toBeDefined();
    const states = await repository.listStates(tenantId, workspaceId, identity.twinId);
    expect(states.some((s) => s.lifecycle === "published")).toBe(true);
  });
});
