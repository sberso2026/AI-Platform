import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  DUPLICATE_TIME_SERIES_PLANE_DETECTED,
  ENGINEERING_TIME_SERIES_OWNERSHIP,
  HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHASE_12D_CERTIFIED_COMMIT,
  PHASE_12D_VERSION,
  PHASE_12F_READY,
  PUBLIC_CONTRACT_VERSION,
  SENSOR_REGISTRY_IMPLEMENTED,
  SHM_SIGNAL_PROCESSING_IMPLEMENTED,
  TELEMETRY_HISTORIAN_IMPLEMENTED,
  TELEMETRY_DOMAIN_EVENTS,
  TWIN_TELEMETRY_BINDING_READY,
  TWIN_TELEMETRY_PROJECTION_READY,
  TwinTelemetryBindingReady,
  assertOwnershipLock,
  assertTelemetryContracts,
  assertTelemetryForbiddenCapabilities,
  assertTelemetryProjectionBounded,
  createDigitalTwinEngine,
  createDigitalTwinRepository,
  createDurableDigitalTwinMemoryStore,
  createMemoryEngineeringTimeSeriesReadPort,
  createTelemetryChannelReference,
  createTelemetrySourceReference,
  createTwinTelemetryAggregationPolicy,
  createTwinTelemetryBinding,
  evaluateSourceHealth,
  classifyObservationQuality,
} from "../src/index";

describe("Phase 12E Digital Twin telemetry binding", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";

  it("declares telemetry binding version and pinned 12D baseline", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.10.0-solver-capabilities");
    expect(DIGITAL_TWIN_STATUS).toBe("solver_capabilities");
    expect(DIGITAL_TWIN_PHASE).toBe("12J");
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.10.0-solver-capabilities-draft");
    expect(PHASE_12D_VERSION).toBe("0.4.0-ingestion");
    expect(PHASE_12D_CERTIFIED_COMMIT).toBe("3e387f4b76cbd9c80b274585c7b78821482f496d");
    expect(PHASE_12F_READY).toBe(true);
    expect(TWIN_TELEMETRY_BINDING_READY).toBe(true);
    expect(TwinTelemetryBindingReady).toBe(true);
    expect(TWIN_TELEMETRY_PROJECTION_READY).toBe(true);
    expect(ENGINEERING_TIME_SERIES_OWNERSHIP).toBe("asset_intelligence");
  });

  it("enables bounded live telemetry without historian/duplicate plane", () => {
    expect(LIVE_TELEMETRY_IMPLEMENTED).toBe(true);
    expect(HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED).toBe(false);
    expect(TELEMETRY_HISTORIAN_IMPLEMENTED).toBe(false);
    expect(SENSOR_REGISTRY_IMPLEMENTED).toBe(false);
    expect(SHM_SIGNAL_PROCESSING_IMPLEMENTED).toBe(false);
    expect(DUPLICATE_TIME_SERIES_PLANE_DETECTED).toBe(false);
    expect(AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED).toBe(false);
    assertTelemetryProjectionBounded();
    assertTelemetryForbiddenCapabilities();
  });

  it("declares telemetry events in catalog", () => {
    expect(assertTelemetryContracts().contractVersion).toBe("0.10.0-solver-capabilities-draft");
    for (const evt of TELEMETRY_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("asserts ownership lock with AI time series reuse", () => {
    const lock = assertOwnershipLock();
    expect(lock.engineeringTimeSeriesOwnership).toBe("asset_intelligence");
    expect(lock.liveTelemetryImplemented).toBe(true);
    expect(lock.duplicateTimeSeriesPlaneDetected).toBe(false);
    expect(lock.twinTelemetryBindingReady).toBe(true);
    expect(lock.automaticTelemetryStatePublicationEnabled).toBe(false);
  });

  it("classifies observation quality and source health", () => {
    expect(classifyObservationQuality({})).toBe("missing");
    expect(classifyObservationQuality({ value: 42, observedAt: new Date().toISOString() })).toBe("good");
    expect(evaluateSourceHealth({ consecutiveFailures: 3 })).toBe("unavailable");
  });

  it("projects binding via ingestion path without raw telemetry storage", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const seriesId = "series-1";
    const readPort = createMemoryEngineeringTimeSeriesReadPort([
      {
        seriesId,
        assetId: "asset-1",
        attributeKey: "temperature",
        unit: "degC",
        observedAt: new Date().toISOString(),
        value: 25.5,
        quality: "good",
      },
    ]);
    const engine = createDigitalTwinEngine({ repository, timeSeriesReadPort: readPort });

    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-tel-1",
    });
    const resolvedTwinId = identity.twinId;

    const source = createTelemetrySourceReference({
      sourceId: "src-1",
      tenantId,
      workspaceId,
      twinId: resolvedTwinId,
      sourceKind: "asset_intelligence_time_series",
      externalRef: `ai://time-series/${seriesId}`,
      engineeringSeriesId: seriesId,
      attributeKey: "temperature",
      displayName: "Temperature",
      ownerModule: "asset_intelligence",
    });
    await repository.saveTelemetrySource(source);

    const channel = createTelemetryChannelReference({
      channelId: "ch-1",
      tenantId,
      workspaceId,
      twinId: resolvedTwinId,
      sourceId: source.sourceId,
      channelKey: "temperature",
      displayName: "Temperature",
      unit: "degC",
      twinAttributeKey: "observed.temperature",
      engineeringSeriesRef: seriesId,
      sourceRef: {
        sourceKind: source.sourceKind,
        externalRef: source.externalRef,
        ownerModule: source.ownerModule,
      },
    });
    await repository.saveTelemetryChannel(channel);

    const binding = createTwinTelemetryBinding({
      bindingId: "bind-1",
      tenantId,
      workspaceId,
      twinId: resolvedTwinId,
      sourceId: source.sourceId,
      channelId: channel.channelId,
      bindingKey: "temp-binding",
      displayName: "Temperature binding",
      engineeringSeriesId: seriesId,
      sourceRef: channel.sourceRef,
      channelRef: {
        channelKey: channel.channelKey,
        twinAttributeKey: channel.twinAttributeKey,
        unit: channel.unit,
      },
    });
    binding.lifecycle = "published";
    await repository.saveTelemetryBinding(binding);

    const policy = createTwinTelemetryAggregationPolicy({
      policyId: "pol-1",
      tenantId,
      workspaceId,
      bindingId: binding.bindingId,
      method: "latest_valid_observation",
    });
    await repository.saveTelemetryAggregationPolicy(policy);

    const projection = await engine.projectTelemetryBinding({ binding, policy });
    expect(projection.storesRawTelemetry).toBe(false);
    expect(projection.projectedState.projectedValue).toBe(25.5);
    expect(projection.projectedState.quality).toBe("good");
    expect(projection.projectedState.storesRawTelemetry).toBe(false);
  });
});
