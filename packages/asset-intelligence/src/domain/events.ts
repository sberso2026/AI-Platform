/**
 * Phase 10B — Asset Intelligence governed events.
 */

export type AssetIntelligenceEventType =
  | "engineering.asset.condition.updated"
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
