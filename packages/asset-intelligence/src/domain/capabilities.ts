/**
 * Phase 10B — capability and service wiring (minimum).
 */

export const PHASE_10B_CAPABILITIES = [
  "asset.condition.read",
  "asset.condition.assess",
  "asset.intelligence.read",
  "asset.health.read",
] as const;

export const PHASE_10B_SERVICES = [
  "AssetIntelligenceService",
  "AssetConditionService",
  "AssetHealthIndexService",
  "AssetTimelineService",
] as const;

export type AssetConditionService = {
  assessFromInspection: (...args: unknown[]) => Promise<unknown>;
  read: (...args: unknown[]) => unknown;
};

export type AssetIntelligenceServiceFacade = {
  assessConditionFromInspection: (...args: unknown[]) => Promise<unknown>;
  getSnapshot: (...args: unknown[]) => Promise<unknown>;
  listTimeline: (...args: unknown[]) => unknown;
  getHealthIndex: (...args: unknown[]) => unknown;
  getCondition: (...args: unknown[]) => unknown;
};
