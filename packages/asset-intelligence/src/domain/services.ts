/**
 * Thin service facades over the Asset Intelligence Engine.
 */

import type { AssetIntelligenceEngine, AssessConditionCommand } from "./engine";

export class AssetConditionService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assessFromInspection(cmd: AssessConditionCommand) {
    return this.engine.assessConditionFromInspection(cmd);
  }

  read(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCondition(tenantId, workspaceId, assetId, asOf);
  }
}

export class AssetHealthIndexService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  read(assetId: string, asOf?: string) {
    return this.engine.getHealthIndex(assetId, asOf);
  }
}

export class AssetTimelineService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  list(assetId: string, asOf?: string) {
    return this.engine.listTimeline(assetId, asOf);
  }
}

export class AssetIntelligenceService {
  readonly condition: AssetConditionService;
  readonly health: AssetHealthIndexService;
  readonly timeline: AssetTimelineService;

  constructor(private readonly engine: AssetIntelligenceEngine) {
    this.condition = new AssetConditionService(engine);
    this.health = new AssetHealthIndexService(engine);
    this.timeline = new AssetTimelineService(engine);
  }

  assessConditionFromInspection(cmd: AssessConditionCommand) {
    return this.engine.assessConditionFromInspection(cmd);
  }

  getSnapshot(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
    asOf?: string;
  }) {
    return this.engine.getSnapshot(input);
  }

  listTimeline(assetId: string, asOf?: string) {
    return this.engine.listTimeline(assetId, asOf);
  }

  getHealthIndex(assetId: string, asOf?: string) {
    return this.engine.getHealthIndex(assetId, asOf);
  }

  getCondition(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCondition(tenantId, workspaceId, assetId, asOf);
  }
}
