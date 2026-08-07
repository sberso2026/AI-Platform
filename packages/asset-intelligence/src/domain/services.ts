/**
 * Thin service facades over the Asset Intelligence Engine.
 */

import type {
  AssetIntelligenceEngine,
  AssessConditionCommand,
  AssessCriticalityCommand,
  AssessDegradationCommand,
  AssessFailureCommand,
  AssessLifecycleCommand,
  AssessReliabilityCommand,
  ReviewCriticalityCommand,
  ReviewDegradationCommand,
  ReviewFailureCommand,
  ReviewLifecycleCommand,
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

export class AssetReliabilityService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assess(cmd: AssessReliabilityCommand) {
    return this.engine.assessReliability(cmd);
  }
}

export class AssetFailureService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assess(cmd: AssessFailureCommand) {
    return this.engine.assessFailure(cmd);
  }

  review(cmd: ReviewFailureCommand) {
    return this.engine.reviewFailure(cmd);
  }
}

export class AssetDegradationService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assess(cmd: AssessDegradationCommand) {
    return this.engine.assessDegradation(cmd);
  }

  review(cmd: ReviewDegradationCommand) {
    return this.engine.reviewDegradation(cmd);
  }
}

export class AssetLifecycleService {
  constructor(private readonly engine: AssetIntelligenceEngine) {}

  assess(cmd: AssessLifecycleCommand) {
    return this.engine.assessLifecycle(cmd);
  }

  review(cmd: ReviewLifecycleCommand) {
    return this.engine.reviewLifecycle(cmd);
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
  readonly reliability: AssetReliabilityService;
  readonly failure: AssetFailureService;
  readonly degradation: AssetDegradationService;
  readonly lifecycle: AssetLifecycleService;
  readonly health: AssetHealthIndexService;
  readonly timeline: AssetTimelineService;

  constructor(private readonly engine: AssetIntelligenceEngine) {
    this.condition = new AssetConditionService(engine);
    this.criticality = new AssetCriticalityService(engine);
    this.reliability = new AssetReliabilityService(engine);
    this.failure = new AssetFailureService(engine);
    this.degradation = new AssetDegradationService(engine);
    this.lifecycle = new AssetLifecycleService(engine);
    this.health = new AssetHealthIndexService(engine);
    this.timeline = new AssetTimelineService(engine);
  }

  assessConditionFromInspection(cmd: AssessConditionCommand) {
    return this.engine.assessConditionFromInspection(cmd);
  }

  assessCriticality(cmd: AssessCriticalityCommand) {
    return this.engine.assessCriticality(cmd);
  }

  assessReliability(cmd: AssessReliabilityCommand) {
    return this.engine.assessReliability(cmd);
  }

  assessFailure(cmd: AssessFailureCommand) {
    return this.engine.assessFailure(cmd);
  }

  assessDegradation(cmd: AssessDegradationCommand) {
    return this.engine.assessDegradation(cmd);
  }

  reviewDegradation(cmd: ReviewDegradationCommand) {
    return this.engine.reviewDegradation(cmd);
  }

  assessLifecycle(cmd: AssessLifecycleCommand) {
    return this.engine.assessLifecycle(cmd);
  }

  reviewLifecycle(cmd: ReviewLifecycleCommand) {
    return this.engine.reviewLifecycle(cmd);
  }

  reviewFailure(cmd: ReviewFailureCommand) {
    return this.engine.reviewFailure(cmd);
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
