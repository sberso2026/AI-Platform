/**
 * Phase 10B — hosted persistence for Asset Intelligence states (memory adapter).
 * Host may later wire Supabase; certification uses durable memory store.
 */

import { randomUUID } from "node:crypto";
import type {
  AssetConditionState,
  AssetCriticalityState,
  AssetIdentityReference,
} from "../architecture/identity-state";
import type { AssetHealthIndexState } from "./health-index";
import type { IntelligenceTimelineEntry } from "./timeline";
import type { AssetIntelligenceEvent } from "./events";

export type DurableAssetIntelligenceStore = {
  conditionStates: AssetConditionState[];
  healthIndexStates: AssetHealthIndexState[];
  criticalityStates: AssetCriticalityState[];
  timeline: IntelligenceTimelineEntry[];
  events: AssetIntelligenceEvent[];
  /** Cached identity refs resolved from Shared Domain — never authoritative register. */
  identityCache: AssetIdentityReference[];
};

export function createDurableAssetIntelligenceMemoryStore(): DurableAssetIntelligenceStore {
  return {
    conditionStates: [],
    healthIndexStates: [],
    criticalityStates: [],
    timeline: [],
    events: [],
    identityCache: [],
  };
}

export class AssetIntelligenceRepository {
  constructor(private readonly store: DurableAssetIntelligenceStore) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }

  saveCondition(state: AssetConditionState): AssetConditionState {
    this.store.conditionStates.push(state);
    return state;
  }

  saveHealthIndex(state: AssetHealthIndexState): AssetHealthIndexState {
    this.store.healthIndexStates.push(state);
    return state;
  }

  saveCriticality(state: AssetCriticalityState): AssetCriticalityState {
    this.store.criticalityStates.push(state);
    return state;
  }

  appendTimeline(entry: IntelligenceTimelineEntry): IntelligenceTimelineEntry {
    this.store.timeline.push(entry);
    return entry;
  }

  appendEvent(event: AssetIntelligenceEvent): AssetIntelligenceEvent {
    this.store.events.push(event);
    return event;
  }

  cacheIdentity(identity: AssetIdentityReference): void {
    const idx = this.store.identityCache.findIndex(
      (i) =>
        i.tenantId === identity.tenantId &&
        i.workspaceId === identity.workspaceId &&
        i.assetId === identity.assetId,
    );
    if (idx >= 0) this.store.identityCache[idx] = identity;
    else this.store.identityCache.push(identity);
  }

  latestCondition(assetId: string, asOf?: string): AssetConditionState | undefined {
    return latestAsOf(
      this.store.conditionStates.filter((s) => s.assetId === assetId),
      asOf,
    );
  }

  latestHealthIndex(assetId: string, asOf?: string): AssetHealthIndexState | undefined {
    return latestAsOf(
      this.store.healthIndexStates.filter((s) => s.assetId === assetId),
      asOf,
    );
  }

  latestCriticality(assetId: string, asOf?: string): AssetCriticalityState | undefined {
    return latestAsOf(
      this.store.criticalityStates.filter((s) => s.assetId === assetId),
      asOf,
    );
  }

  listTimeline(assetId: string, asOf?: string): IntelligenceTimelineEntry[] {
    return this.store.timeline
      .filter((e) => e.assetId === assetId)
      .filter((e) => !asOf || e.recordedAt <= asOf)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }

  getStore(): DurableAssetIntelligenceStore {
    return this.store;
  }
}

function latestAsOf<T extends { recordedAt: string }>(
  items: T[],
  asOf?: string,
): T | undefined {
  const filtered = items
    .filter((i) => !asOf || i.recordedAt <= asOf)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  return filtered[filtered.length - 1];
}
