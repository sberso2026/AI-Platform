/**
 * Phase 12E — TwinTelemetryProjectionEngine.
 *
 * Creates ObservedTwinStateCandidate via existing 12D ingestion path — no direct publish.
 * Bounded binding/projection ONLY.
 */

import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED,
  ENGINEERING_TIME_SERIES_OWNERSHIP,
  HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED,
  TELEMETRY_HISTORIAN_IMPLEMENTED,
} from "../version";
import type { TwinTelemetryAggregationPolicy } from "./aggregation-policy";
import type { TwinTelemetryBinding } from "./telemetry-binding";
import { assertBindingNotRawTelemetry } from "./telemetry-binding";
import type { CurrentProjectedState } from "./live-state-semantics";
import { classifyObservationQuality, isProjectionQualityAcceptable } from "./observation-quality";
import { resolveGapHandling } from "./gap-handling";
import { evaluateSourceHealth } from "./source-health";
import { applyProjectionMethod, assertProjectionMethodBounded } from "./projection-methods";
import type { EngineeringTimeSeriesReadPort } from "./time-series-read-port";
import {
  telemetryProjectionCreatedPayload,
  telemetryQualityRejectedPayload,
  telemetrySourceUnavailablePayload,
  telemetryStaleDetectedPayload,
} from "./telemetry-events";
import type { DigitalTwinStateIngestionEngine } from "./state-ingestion-engine";
import type { DigitalTwinRepositoryPort } from "./persistence";

export type TelemetryProjectionRecord = {
  projectionId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  bindingId: string;
  projectedState: CurrentProjectedState;
  candidateId?: string;
  qualityRejected: boolean;
  staleDetected: boolean;
  sourceUnavailable: boolean;
  createdAt: string;
  storesRawTelemetry: false;
};

export type TwinTelemetryProjectionEngineDeps = {
  repository: DigitalTwinRepositoryPort;
  timeSeriesReadPort: EngineeringTimeSeriesReadPort;
  ingestionEngine: DigitalTwinStateIngestionEngine;
  newId?: (prefix: string) => string;
};

export class TwinTelemetryProjectionEngine {
  readonly kind = "twin_telemetry_projection_engine" as const;

  private readonly repository: DigitalTwinRepositoryPort;
  private readonly timeSeriesReadPort: EngineeringTimeSeriesReadPort;
  private readonly ingestionEngine: DigitalTwinStateIngestionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: TwinTelemetryProjectionEngineDeps) {
    assertOwnershipLock();
    assertTelemetryProjectionBounded();
    if (ENGINEERING_TIME_SERIES_OWNERSHIP !== "asset_intelligence") {
      throw new Error("engineering_time_series_owner_must_be_asset_intelligence");
    }
    if (deps.timeSeriesReadPort.ownerModule !== "asset_intelligence" || !deps.timeSeriesReadPort.readOnly) {
      throw new Error("time_series_read_port_must_be_read_only_asset_intelligence");
    }
    this.repository = deps.repository;
    this.timeSeriesReadPort = deps.timeSeriesReadPort;
    this.ingestionEngine = deps.ingestionEngine;
    this.newId = deps.newId ?? deps.repository.newId.bind(deps.repository);
  }

  async projectBinding(input: {
    binding: TwinTelemetryBinding;
    policy: TwinTelemetryAggregationPolicy;
    adapterId?: string;
    schemaId?: string;
  }): Promise<TelemetryProjectionRecord> {
    assertBindingNotRawTelemetry(input.binding);
    assertProjectionMethodBounded(input.policy.method);

    const { tenantId, workspaceId, twinId, bindingId } = input.binding;
    const seriesId = input.binding.engineeringSeriesId;
    const now = new Date().toISOString();
    const windowEnd = now;
    const windowStart = new Date(
      Date.parse(windowEnd) - input.policy.windowSeconds * 1000,
    ).toISOString();

    let projectedValue: number | null = null;
    let observedAt: string | undefined;
    let quality = classifyObservationQuality({});
    let sourceHealth = evaluateSourceHealth({});
    let gapHandling = resolveGapHandling({ sampleCount: 0, sourceAvailable: false });

    if (!seriesId) {
      sourceHealth = "unavailable";
      gapHandling = "source_offline";
    } else {
      const freshness = await this.timeSeriesReadPort.freshness(tenantId, workspaceId, seriesId);
      sourceHealth = evaluateSourceHealth({
        lastSuccessfulReadAt: freshness.lastObservationAt,
        consecutiveFailures: freshness.sourceAvailable ? 0 : 3,
        staleAfterMs: input.policy.staleAfterSeconds * 1000,
      });

      if (sourceHealth === "unavailable") {
        await this.repository.enqueueOutbox({
          outboxId: this.newId("dtout"),
          tenantId,
          workspaceId,
          twinId,
          eventType: "engineering.digital_twin.telemetry.source_unavailable",
          payload: telemetrySourceUnavailablePayload({
            bindingId,
            sourceId: input.binding.sourceId,
            health: sourceHealth,
          }),
          published: false,
          createdAt: now,
        });
      }

      const win = await this.timeSeriesReadPort.window(
        tenantId,
        workspaceId,
        seriesId,
        windowStart,
        windowEnd,
      );
      const values = win.observations.map((o) => o.value);
      gapHandling = resolveGapHandling({
        sampleCount: values.length,
        sourceAvailable: freshness.sourceAvailable,
        lastObservationAt: freshness.lastObservationAt,
        staleAfterMs: input.policy.staleAfterSeconds * 1000,
      });
      projectedValue = applyProjectionMethod(input.policy.method, values);
      const latest = win.observations[win.observations.length - 1];
      observedAt = latest?.observedAt;
      quality = classifyObservationQuality({
        value: projectedValue,
        observedAt,
        staleAfterMs: input.policy.staleAfterSeconds * 1000,
      });

      if (quality === "stale") {
        await this.repository.enqueueOutbox({
          outboxId: this.newId("dtout"),
          tenantId,
          workspaceId,
          twinId,
          eventType: "engineering.digital_twin.telemetry.stale_detected",
          payload: telemetryStaleDetectedPayload({
            bindingId,
            lastObservationAt: observedAt,
            freshnessMs: freshness.freshnessMs,
          }),
          published: false,
          createdAt: now,
        });
      }
    }

    const projectedState: CurrentProjectedState = {
      twinId,
      bindingId,
      channelKey: input.binding.channelRef.channelKey,
      twinAttributeKey: input.binding.channelRef.twinAttributeKey,
      projectedValue,
      unit: input.binding.channelRef.unit,
      quality,
      gapHandling,
      sourceHealth,
      projectionMethod: input.policy.method,
      observedAt,
      projectedAt: now,
      freshnessMs: observedAt ? Date.parse(now) - Date.parse(observedAt) : undefined,
      engineeringSeriesId: seriesId,
      sourceRef: input.binding.sourceRef.externalRef,
      storesRawTelemetry: false,
      autoPublishEnabled: false,
      interpolation: "not_implemented",
    };

    let candidateId: string | undefined;
    const qualityRejected = !isProjectionQualityAcceptable(quality);

    if (qualityRejected) {
      await this.repository.enqueueOutbox({
        outboxId: this.newId("dtout"),
        tenantId,
        workspaceId,
        twinId,
        eventType: "engineering.digital_twin.telemetry.quality_rejected",
        payload: telemetryQualityRejectedPayload({
          bindingId,
          quality,
          reason: "projection_quality_not_acceptable",
        }),
        published: false,
        createdAt: now,
      });
    } else if (!AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED && input.binding.lifecycle === "published") {
      const ingestion = await this.ingestionEngine.ingestObservedState({
        tenantId,
        workspaceId,
        twinId,
        adapterId: input.adapterId ?? "asset_intelligence_public_contract",
        schemaId: input.schemaId ?? "twin.observed.telemetry_projection.v1",
        externalRef: `telemetry://binding/${bindingId}/${now}`,
        idempotencyKey: `telemetry-projection:${bindingId}:${now}`,
        observedAt: observedAt ?? now,
        payload: {
          bindingId,
          twinAttributeKey: input.binding.channelRef.twinAttributeKey,
          projectedValue,
          unit: input.binding.channelRef.unit,
          quality,
          projectionMethod: input.policy.method,
          engineeringSeriesRef: seriesId,
          storesTelemetryPayload: false,
        },
        unitSystem: "SI",
        unitCode: input.binding.channelRef.unit,
        provenance: {
          sourceModule: "asset_intelligence",
          sourceRef: seriesId ?? input.binding.sourceRef.externalRef,
          capturedAt: now,
        },
        evidenceRefs: seriesId ? [`ai://time-series/${seriesId}`] : [],
      });
      candidateId = ingestion.candidate.candidateId;
    }

    const record: TelemetryProjectionRecord = {
      projectionId: this.newId("dtproj"),
      tenantId,
      workspaceId,
      twinId,
      bindingId,
      projectedState,
      candidateId,
      qualityRejected,
      staleDetected: quality === "stale",
      sourceUnavailable: sourceHealth === "unavailable",
      createdAt: now,
      storesRawTelemetry: false,
    };

    await this.repository.saveTelemetryProjectionRecord(record);
    await this.repository.enqueueOutbox({
      outboxId: this.newId("dtout"),
      tenantId,
      workspaceId,
      twinId,
      eventType: "engineering.digital_twin.telemetry.projection_created",
      payload: telemetryProjectionCreatedPayload({
        bindingId,
        twinId,
        candidateId,
        projectedValue,
        quality,
      }),
      published: false,
      createdAt: now,
    });

    return record;
  }
}

export function createTwinTelemetryProjectionEngine(
  deps: TwinTelemetryProjectionEngineDeps,
): TwinTelemetryProjectionEngine {
  return new TwinTelemetryProjectionEngine(deps);
}

export function assertTelemetryProjectionBounded(): {
  ok: true;
  liveTelemetryImplemented: true;
  highFrequencyTelemetryImplemented: false;
  telemetryHistorianImplemented: false;
  automaticTelemetryStatePublicationEnabled: false;
} {
  if (HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED || TELEMETRY_HISTORIAN_IMPLEMENTED) {
    throw new Error("historian_and_high_frequency_forbidden_in_phase_12e");
  }
  if (AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED) {
    throw new Error("automatic_telemetry_state_publication_forbidden");
  }
  return {
    ok: true,
    liveTelemetryImplemented: true,
    highFrequencyTelemetryImplemented: false,
    telemetryHistorianImplemented: false,
    automaticTelemetryStatePublicationEnabled: false,
  };
}
