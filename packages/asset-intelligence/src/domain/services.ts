/**
 * Thin service facades over the Asset Intelligence Engine.
 */

import type {
  AssetIntelligenceEngine,
  AssessConditionCommand,
  AssessCriticalityCommand,
  ReviewCriticalityCommand,
} from "./engine";

export class AssetConditionService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assessFromInspection(cmd: AssessConditionCommand) {
    return this.engine.assessConditionFromInspection(cmd);
  }

  read(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCondition(tenantId, workspaceId, assetId, asOf);
  }
}

export class AssetCriticalityService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assess(cmd: AssessCriticalityCommand) {
    return this.engine.assessCriticality(cmd);
  }

  review(cmd: ReviewCriticalityCommand) {
    return this.engine.reviewCriticality(cmd);
  }

  read(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCriticality(tenantId, workspaceId, assetId, asOf);
  }
}

export class AssetHealthIndexService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  read(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getHealthIndex(tenantId, workspaceId, assetId, asOf);
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
  readonly criticality: AssetCriticalityService;
  readonly health: AssetHealthIndexService;
  readonly timeline: AssetTimelineService;

  constructor(private readonly engine: AssetIntelligenceEngine) {
    this.condition = new AssetConditionService(engine);
    this.criticality = new AssetCriticalityService(engine);
    this.health = new AssetHealthIndexService(engine);
    this.timeline = new AssetTimelineService(engine);
  }

  assessConditionFromInspection(cmd: AssessConditionCommand) {
    return this.engine.assessConditionFromInspection(cmd);
  }

  assessCriticality(cmd: AssessCriticalityCommand) {
    return this.engine.assessCriticality(cmd);
  }

  reviewCriticality(cmd: ReviewCriticalityCommand) {
    return this.engine.reviewCriticality(cmd);
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

  getHealthIndex(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getHealthIndex(tenantId, workspaceId, assetId, asOf);
  }

  getCondition(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCondition(tenantId, workspaceId, assetId, asOf);
  }

  getCriticality(tenantId: string, workspaceId: string, assetId: string, asOf?: string) {
    return this.engine.getCriticality(tenantId, workspaceId, assetId, asOf);
  }
}
