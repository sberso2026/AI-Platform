/**
 * Phase 10B / 10B.1 — Asset Intelligence Engine with hosted-ready persistence.
 */

import type { Provenance } from "../architecture/identity-state";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import { deriveAdvisoryHealthIndex, type AssetHealthIndexState } from "./health-index";
import {
  createInMemorySharedDomainIdentityPort,
  type SharedDomainAssetIdentityPort,
} from "./identity-port";
import {
  assertIiPublicContractConsumption,
  toConditionIngestFromPublicSummary,
  type IiConditionIngestInput,
} from "./ii-consumption";
import {
  createAssetIntelligenceEvent,
  type AssetIntelligenceEventPublishPort,
} from "./events";
import type {
  AssetIntelligenceRepositoryPort,
  PersistedConditionState,
} from "./persistence";
import { composeAssetSnapshot, type AssetSnapshot } from "./snapshot";
import { assertRegisteredActiveSource } from "./source-registry";
import { createTimelineEntry, type IntelligenceTimelineEntry } from "./timeline";

export type AssessConditionCommand = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey?: string;
  ii: IiConditionIngestInput;
  correlationId?: string;
  recordedAt?: string;
  idempotencyKey?: string;
  expectedVersion?: number;
  createdBy?: string;
  status?: PersistedConditionState["status"];
};

export type EngineAssessResult = {
  identityOwner: "engineering_os_shared_domain";
  condition: PersistedConditionState;
  healthIndex: AssetHealthIndexState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  snapshotId: string;
  outboxEventId: string;
  identityMutated: false;
  idempotentReplay?: boolean;
};

export type AssetIntelligenceEngineDeps = {
  identityPort: SharedDomainAssetIdentityPort;
  repository: AssetIntelligenceRepositoryPort;
  events: AssetIntelligenceEventPublishPort;
};

export class AssetIntelligenceEngine {
  constructor(private readonly deps: AssetIntelligenceEngineDeps) {
    assertOwnershipLock();
    assertIiPublicContractConsumption();
  }

  /**
   * Transactional condition flow:
   * II input → validate → identity → idempotency → derive → persist condition →
   * snapshot → timeline → outbox → publish event → mark published
   */
  async assessConditionFromInspection(cmd: AssessConditionCommand): Promise<EngineAssessResult> {
    const sourceKey = cmd.sourceKey ?? "inspection_intelligence.public_contracts";
    assertRegisteredActiveSource(sourceKey, "condition");

    if (cmd.idempotencyKey) {
      const existing = await this.deps.repository.findIdempotency(
        cmd.tenantId,
        cmd.workspaceId,
        cmd.idempotencyKey,
      );
      if (existing?.responsePayload?.result) {
        return {
          ...(existing.responsePayload.result as EngineAssessResult),
          idempotentReplay: true,
        };
      }
    }

    const identity = await this.deps.identityPort.resolve({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
    });
    if (!identity) throw new Error("shared_domain_identity_not_found");
    if (identity.owner !== "engineering_os_shared_domain") {
      throw new Error("identity_owner_must_be_shared_domain");
    }
    if (identity.assetId !== cmd.assetId) throw new Error("identity_asset_id_mismatch");

    const ii = toConditionIngestFromPublicSummary(cmd.ii);
    if (ii.assetReference.identity.assetId !== cmd.assetId) {
      throw new Error("ii_asset_reference_mismatch");
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
    const version = await this.deps.repository.nextConditionVersion(
      cmd.tenantId,
      cmd.workspaceId,
      cmd.assetId,
      cmd.expectedVersion,
    );

    const provenance: Provenance = {
      sourceSystem: sourceKey,
      observedAt: ii.observedAt,
      method: ii.conditionMethod ?? "ii_public_condition_summary",
      confidence: ii.conditionConfidence,
      evidenceRefs: [
        ...(ii.evidenceRefs ?? []),
        ...(ii.conditionRatingId ? [`ii.conditionRating:${ii.conditionRatingId}`] : []),
        ...(ii.observationIds?.map((id) => `ii.observation:${id}`) ?? []),
        ...(ii.sessionId ? [`ii.session:${ii.sessionId}`] : []),
      ],
      reviewedBy: ii.reviewedBy,
      approvedAt: ii.approvedAt,
      policyId: "asset_intelligence.condition.ingest.v1",
    };

    const status = cmd.status ?? (ii.approvedAt ? "published" : "observed");
    const condition: PersistedConditionState = {
      kind: "condition",
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("cond"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      version,
      status,
      sourceType: "inspection",
      sourceReference: ii.conditionRatingId
        ? `ii.conditionRating:${ii.conditionRatingId}`
        : ii.sessionId
          ? `ii.session:${ii.sessionId}`
          : undefined,
      recordedAt,
      provenance,
      silentIdentityMutationForbidden: true,
      conditionRating: ii.conditionRating,
      conditionIndex: ii.conditionIndex,
      conditionConfidence: ii.conditionConfidence,
      conditionTrend: ii.conditionTrend,
      conditionSource: sourceKey,
      observedAt: ii.observedAt,
      calculatedAt: status === "calculated" || status === "reviewed" || status === "published" ? recordedAt : undefined,
      reviewedAt: status === "reviewed" || status === "published" ? ii.approvedAt ?? recordedAt : undefined,
      publishedAt: status === "published" ? recordedAt : undefined,
      createdBy: cmd.createdBy,
    };

    await this.deps.repository.saveCondition(condition);
    await this.deps.repository.cacheIdentity(identity);
    await this.deps.repository.registerSourceProvenance({
      id: this.deps.repository.newId("src"),
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      sourceKey,
      sourceType: "inspection",
      contractFamily: "ii.public_module_contracts",
      contractVersion: "1.0.0",
      ownership: "inspection_intelligence",
      createdAt: recordedAt,
      metadata: { evidenceRefs: provenance.evidenceRefs },
    });

    const healthIndex = deriveAdvisoryHealthIndex({
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("health"),
      recordedAt,
      provenance: { ...provenance, method: "compose_from_condition_v1" },
      conditionRating: condition.conditionRating,
      conditionIndex: condition.conditionIndex,
      conditionConfidence: condition.conditionConfidence,
      conditionTrend: condition.conditionTrend,
      conditionStateId: condition.stateId,
    });
    assertRegisteredActiveSource(sourceKey, "health_index");
    await this.deps.repository.saveHealthIndex(healthIndex);

    const timelineEntries: IntelligenceTimelineEntry[] = [];
    for (const [kind, stateId, eventType] of [
      ["condition", condition.stateId, `condition_${status}`],
      ["health_index", healthIndex.stateId, "snapshot_created"],
    ] as const) {
      const entry = createTimelineEntry({
        entryId: this.deps.repository.newId("tl"),
        assetId: cmd.assetId,
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        stateId,
        kind,
        recordedAt,
        sourceKey,
        provenance,
      });
      void eventType;
      await this.deps.repository.appendTimeline(entry);
      timelineEntries.push(entry);
      const tlEvent = createAssetIntelligenceEvent({
        type: "engineering.asset.intelligence_timeline.appended",
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        assetId: cmd.assetId,
        stateId,
        entryId: entry.entryId,
        occurredAt: recordedAt,
        correlationId: cmd.correlationId,
        payload: { sourceKey, kind },
      });
      await this.deps.events.publish(tlEvent);
      await this.deps.repository.appendEvent(tlEvent);
    }

    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
    });
    const snapshotId = this.deps.repository.newId("snap");
    await this.deps.repository.saveSnapshot({
      id: snapshotId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      schemaVersion: "asset_snapshot/1",
      capturedAt: recordedAt,
      conditionStateId: condition.stateId,
      healthIndex,
      identityReference: identity,
      sourceSet: [sourceKey],
      timelinePosition: timelineEntries[timelineEntries.length - 1]?.entryId,
      snapshot,
    });

    const outboxEventId = this.deps.repository.newId("outbox");
    const outboxPayload = {
      sourceKey,
      kind: "condition",
      status: condition.status,
      version: condition.version,
      silentIdentityMutationForbidden: true,
      rawEvidenceForbidden: true,
      secretsForbidden: true,
    };
    await this.deps.repository.appendOutbox({
      id: outboxEventId,
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      eventType: "engineering.asset.condition.updated",
      payload: outboxPayload,
      correlationId: cmd.correlationId,
      stateId: condition.stateId,
      published: false,
      createdAt: recordedAt,
    });

    const conditionEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.condition.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: condition.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "condition", status: condition.status },
    });
    await this.deps.events.publish(conditionEvent);
    await this.deps.repository.appendEvent(conditionEvent);
    await this.deps.repository.markOutboxPublished(outboxEventId, recordedAt);

    const healthEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.health_index.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: healthIndex.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "health_index", status: healthIndex.status },
    });
    await this.deps.events.publish(healthEvent);
    await this.deps.repository.appendEvent(healthEvent);

    const result: EngineAssessResult = {
      identityOwner: "engineering_os_shared_domain",
      condition,
      healthIndex,
      timelineEntries,
      snapshot,
      snapshotId,
      outboxEventId,
      identityMutated: false,
    };

    if (cmd.idempotencyKey) {
      await this.deps.repository.saveIdempotency({
        tenantId: cmd.tenantId,
        workspaceId: cmd.workspaceId,
        idempotencyKey: cmd.idempotencyKey,
        operation: "assess_condition_from_inspection",
        resourceId: condition.stateId,
        responsePayload: { result },
      });
    }

    return result;
  }

  async getSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    asOf?: string;
  }): Promise<AssetSnapshot | null> {
    const identity = await this.deps.identityPort.resolve(input);
    if (!identity) return null;
    const persisted = await this.deps.repository.latestSnapshot(
      input.tenantId,
      input.workspaceId,
      input.assetId,
    );
    if (persisted) return persisted.snapshot;
    return composeAssetSnapshot({
      identity,
      asOf: input.asOf ?? new Date().toISOString(),
      condition: await this.deps.repository.latestCondition(
        input.tenantId,
        input.workspaceId,
        input.assetId,
        input.asOf,
      ),
      healthIndex: await this.deps.repository.latestHealthIndex(input.assetId, input.asOf),
      criticality: await this.deps.repository.latestCriticality(input.assetId, input.asOf),
    });
  }

  async listTimeline(assetId: string, asOf?: string): Promise<IntelligenceTimelineEntry[]> {
    return this.deps.repository.listTimeline(assetId, asOf);
  }

  async getHealthIndex(
    assetId: string,
    asOf?: string,
  ): Promise<AssetHealthIndexState | undefined> {
    return this.deps.repository.latestHealthIndex(assetId, asOf);
  }

  async getCondition(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedConditionState | undefined> {
    return this.deps.repository.latestCondition(tenantId, workspaceId, assetId, asOf);
  }
}

export function createAssetIntelligenceEngine(
  deps: AssetIntelligenceEngineDeps,
): AssetIntelligenceEngine {
  return new AssetIntelligenceEngine(deps);
}

export { createInMemorySharedDomainIdentityPort };
