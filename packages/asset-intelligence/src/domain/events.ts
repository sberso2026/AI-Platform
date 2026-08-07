/**
 * Phase 10B — Asset Intelligence governed events.
 */

export type AssetIntelligenceEventType =
  | "engineering.asset.condition.updated"
  | "engineering.asset.criticality.updated"
  | "engineering.asset.criticality.reviewed"
  | "engineering.asset.reliability.assessed"
  | "engineering.asset.reliability.reviewed"
  | "engineering.asset.reliability.published"
  | "engineering.asset.failure_mode.assessed"
  | "engineering.asset.failure_mechanism.assessed"
  | "engineering.asset.failure_cause.proposed"
  | "engineering.asset.failure.reviewed"
  | "engineering.asset.failure.published"
  | "engineering.asset.failure.superseded"
  | "engineering.asset.time_series.ingested"
  | "engineering.asset.change.detected"
  | "engineering.asset.trend.assessed"
  | "engineering.asset.degradation.assessed"
  | "engineering.asset.degradation.reviewed"
  | "engineering.asset.degradation.published"
  | "engineering.asset.degradation.superseded"
  | "engineering.asset.evidence_confidence.assessed"
  | "engineering.asset.health.composed"
  | "engineering.asset.health.published"
  | "engineering.asset.health_index.updated"
  | "engineering.asset.intelligence_timeline.appended";

export type AssetIntelligenceEvent = {
  type: AssetIntelligenceEventType;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  stateId?: string;
  entryId?: string;
  occurredAt: string;
  correlationId?: string;
  /** Identifiers + governance only — no raw evidence or secrets. */
  payload: {
    sourceKey?: string;
    kind?: string;
    status?: string;
    silentIdentityMutationForbidden: true;
    rawEvidenceForbidden: true;
    secretsForbidden: true;
  };
};

export function createAssetIntelligenceEvent(
  partial: Omit<AssetIntelligenceEvent, "payload"> & {
    payload?: Partial<AssetIntelligenceEvent["payload"]>;
  },
): AssetIntelligenceEvent {
  return {
    type: partial.type,
    tenantId: partial.tenantId,
    workspaceId: partial.workspaceId,
    assetId: partial.assetId,
    stateId: partial.stateId,
    entryId: partial.entryId,
    occurredAt: partial.occurredAt,
    correlationId: partial.correlationId,
    payload: {
      sourceKey: partial.payload?.sourceKey,
      kind: partial.payload?.kind,
      status: partial.payload?.status,
      silentIdentityMutationForbidden: true,
      rawEvidenceForbidden: true,
      secretsForbidden: true,
    },
  };
}

export type AssetIntelligenceEventPublishPort = {
  publish(event: AssetIntelligenceEvent): Promise<void>;
};

export function createInProcessAssetIntelligenceEventPipeline(
  sink: AssetIntelligenceEvent[] = [],
): AssetIntelligenceEventPublishPort & { events: AssetIntelligenceEvent[] } {
  return {
    events: sink,
    async publish(event) {
      sink.push(event);
    },
  };
}
