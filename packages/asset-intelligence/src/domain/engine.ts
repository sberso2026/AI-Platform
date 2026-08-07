/**
 * Phase 10B — Asset Intelligence Engine (thin orchestration layer).
 * Not a workflow engine, AI runtime, KG, twin, or CMMS.
 */

import type { AssetConditionState, Provenance } from "../architecture/identity-state";
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
import { AssetIntelligenceRepository } from "./persistence";
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
};

export type EngineAssessResult = {
  identityOwner: "engineering_os_shared_domain";
  condition: AssetConditionState;
  healthIndex: AssetHealthIndexState;
  timelineEntries: IntelligenceTimelineEntry[];
  snapshot: AssetSnapshot;
  identityMutated: false;
};

export type AssetIntelligenceEngineDeps = {
  identityPort: SharedDomainAssetIdentityPort;
  repository: AssetIntelligenceRepository;
  events: AssetIntelligenceEventPublishPort;
};

export class AssetIntelligenceEngine {
  constructor(private readonly deps: AssetIntelligenceEngineDeps) {
    assertOwnershipLock();
    assertIiPublicContractConsumption();
  }

  /**
   * Orchestration:
   * identity resolve → source lookup → contract-governed ingestion →
   * state persistence → health update/abstain → timeline → snapshot → events
   */
  async assessConditionFromInspection(cmd: AssessConditionCommand): Promise<EngineAssessResult> {
    const sourceKey = cmd.sourceKey ?? "inspection_intelligence.public_contracts";
    assertRegisteredActiveSource(sourceKey, "condition");

    const identity = await this.deps.identityPort.resolve({
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
    });
    if (!identity) {
      throw new Error("shared_domain_identity_not_found");
    }
    if (identity.owner !== "engineering_os_shared_domain") {
      throw new Error("identity_owner_must_be_shared_domain");
    }
    if (identity.assetId !== cmd.assetId) {
      throw new Error("identity_asset_id_mismatch");
    }

    const ii = toConditionIngestFromPublicSummary(cmd.ii);
    if (ii.assetReference.identity.assetId !== cmd.assetId) {
      throw new Error("ii_asset_reference_mismatch");
    }

    const recordedAt = cmd.recordedAt ?? new Date().toISOString();
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

    const condition: AssetConditionState = {
      kind: "condition",
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("cond"),
      recordedAt,
      provenance,
      silentIdentityMutationForbidden: true,
      conditionRating: ii.conditionRating,
      conditionIndex: ii.conditionIndex,
      conditionConfidence: ii.conditionConfidence,
      conditionTrend: ii.conditionTrend,
      conditionSource: sourceKey,
    };
    this.deps.repository.saveCondition(condition);
    this.deps.repository.cacheIdentity(identity);

    const healthIndex = deriveAdvisoryHealthIndex({
      assetId: cmd.assetId,
      stateId: this.deps.repository.newId("health"),
      recordedAt,
      provenance: {
        ...provenance,
        method: "compose_from_condition_v1",
      },
      conditionRating: condition.conditionRating,
      conditionIndex: condition.conditionIndex,
      conditionConfidence: condition.conditionConfidence,
      conditionTrend: condition.conditionTrend,
      conditionStateId: condition.stateId,
    });
    assertRegisteredActiveSource(sourceKey, "health_index");
    this.deps.repository.saveHealthIndex(healthIndex);

    const timelineEntries: IntelligenceTimelineEntry[] = [];
    for (const [kind, stateId] of [
      ["condition", condition.stateId],
      ["health_index", healthIndex.stateId],
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
      this.deps.repository.appendTimeline(entry);
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
      this.deps.repository.appendEvent(tlEvent);
    }

    const conditionEvent = createAssetIntelligenceEvent({
      type: "engineering.asset.condition.updated",
      tenantId: cmd.tenantId,
      workspaceId: cmd.workspaceId,
      assetId: cmd.assetId,
      stateId: condition.stateId,
      occurredAt: recordedAt,
      correlationId: cmd.correlationId,
      payload: { sourceKey, kind: "condition", status: "recorded" },
    });
    await this.deps.events.publish(conditionEvent);
    this.deps.repository.appendEvent(conditionEvent);

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
    this.deps.repository.appendEvent(healthEvent);

    const snapshot = composeAssetSnapshot({
      identity,
      asOf: recordedAt,
      condition,
      healthIndex,
    });

    return {
      identityOwner: "engineering_os_shared_domain",
      condition,
      healthIndex,
      timelineEntries,
      snapshot,
      identityMutated: false,
    };
  }

  async getSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    asOf?: string;
  }): Promise<AssetSnapshot | null> {
    const identity = await this.deps.identityPort.resolve(input);
    if (!identity) return null;
    return composeAssetSnapshot({
      identity,
      asOf: input.asOf ?? new Date().toISOString(),
      condition: this.deps.repository.latestCondition(input.assetId, input.asOf),
      healthIndex: this.deps.repository.latestHealthIndex(input.assetId, input.asOf),
      criticality: this.deps.repository.latestCriticality(input.assetId, input.asOf),
    });
  }

  listTimeline(assetId: string, asOf?: string): IntelligenceTimelineEntry[] {
    return this.deps.repository.listTimeline(assetId, asOf);
  }

  getHealthIndex(assetId: string, asOf?: string): AssetHealthIndexState | undefined {
    return this.deps.repository.latestHealthIndex(assetId, asOf);
  }

  getCondition(assetId: string, asOf?: string): AssetConditionState | undefined {
    return this.deps.repository.latestCondition(assetId, asOf);
  }
}

export function createAssetIntelligenceEngine(
  deps: AssetIntelligenceEngineDeps,
): AssetIntelligenceEngine {
  return new AssetIntelligenceEngine(deps);
}

export { createInMemorySharedDomainIdentityPort };
