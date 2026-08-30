import {
  type CommandCentreAvailability,
  type CommandCentreScope,
  type ForecastIntelligencePort,
  type ForecastIntelligenceSourceSnapshot,
  type PublishedCurrentPostureRef,
  type PublishedForecastEvidenceRef,
  type PublishedForecastStateRef,
  asForecastPosture,
} from "@rtb/project-intelligence";
import { createProjectControlsRepository } from "@rtb/project-controls";
import type { AuthContext } from "@/lib/kernel";

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

function mapForecastState(row: {
  stateId: string;
  projectId: string;
  status: string;
  abstained: boolean;
  forecastPosture?: string;
  version: number;
  assessedAt: string;
  publishedAt?: string;
  recordedAt: string;
  abstentionReason?: string;
  limitations?: string[];
  contributingContributors?: Array<{
    contributorKey: string;
    stateId: string;
    status: string;
    abstained: boolean;
    postureOrIndication?: string;
    assessedAt?: string;
  }>;
  confidence?: {
    dataSufficiency?: string;
    confidenceClass?: string;
    score?: number;
    evidenceCount?: number;
    usableEvidenceCount?: number;
  };
}): PublishedForecastStateRef {
  return {
    stateId: row.stateId,
    projectId: row.projectId,
    published: row.status === "published",
    abstained: row.abstained,
    posture: asForecastPosture(row.forecastPosture),
    version: row.version,
    assessedAt: row.assessedAt,
    publishedAt: row.publishedAt,
    recordedAt: row.recordedAt,
    dataSufficiency: row.confidence?.dataSufficiency,
    confidenceClass: row.confidence?.confidenceClass,
    confidenceScore: row.confidence?.score,
    evidenceCount: row.confidence?.evidenceCount,
    usableEvidenceCount: row.confidence?.usableEvidenceCount,
    abstentionReason: row.abstentionReason,
    contributingContributors: (row.contributingContributors ?? []).map((contributor) => ({
      contributorKey: contributor.contributorKey,
      stateId: contributor.stateId,
      status: contributor.status,
      abstained: contributor.abstained,
      postureOrIndication: contributor.postureOrIndication,
      assessedAt: contributor.assessedAt,
    })),
    limitations: row.limitations ?? [],
    completionDatePredicted: false,
    costForecastComputed: false,
    scenarioIdPublished: false,
    storesCanonicalCopy: false,
  };
}

function mapForecastEvidence(row: {
  evidenceId: string;
  forecastStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  declaredSignal?: string;
  contributorKey?: string;
  observedAt?: string;
  recordedAt: string;
  revoked?: boolean;
}): PublishedForecastEvidenceRef {
  return {
    evidenceId: row.evidenceId,
    forecastStateId: row.forecastStateId,
    kind: row.kind,
    sourceType: row.sourceType,
    sourceKey: row.sourceKey,
    declaredSignal: row.declaredSignal,
    contributorKey: row.contributorKey,
    observedAt: row.observedAt,
    recordedAt: row.recordedAt,
    revoked: Boolean(row.revoked),
    completionDateClaimed: false,
    costForecastClaimed: false,
    storesCanonicalCopy: false,
  };
}

export class HostedForecastIntelligenceSource implements ForecastIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesForecast = false as const;
  readonly computesCompletionDate = false as const;
  readonly computesCostForecast = false as const;
  readonly computesMonteCarlo = false as const;

  constructor(private readonly ctx: AuthContext) {}

  async load(scope: CommandCentreScope): Promise<ForecastIntelligenceSourceSnapshot> {
    const repository = createProjectControlsRepository({
      adapter: "postgres",
      supabase: this.ctx.supabase,
      nodeEnv: "production",
    });

    let published: PublishedForecastStateRef[];
    try {
      // Canonical listForecastStates is exhaustive (no .limit(50)). Register
      // page-limit completeness rules do not apply to forecasting.
      const rows = await repository.listForecastStates(scope.tenantId, scope.workspaceId, scope.projectId);
      published = rows
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )
        .map(mapForecastState);
    } catch (error) {
      return {
        availability: classifyFailure(error),
        latest: null,
        history: [],
        evidence: [],
        currentStates: [],
      };
    }

    const latest = published[0] ?? null;
    let evidence: PublishedForecastEvidenceRef[] = [];
    if (latest) {
      try {
        const rows = await repository.listForecastEvidence(scope.tenantId, scope.workspaceId, latest.stateId);
        evidence = rows.map(mapForecastEvidence);
      } catch {
        evidence = [];
      }
    }

    const currentStates = await this.loadCurrentStates(repository, scope);

    return {
      availability: latest ? "ok" : "no_data",
      latest,
      history: published,
      evidence,
      currentStates,
    };
  }

  private async loadCurrentStates(
    repository: ReturnType<typeof createProjectControlsRepository>,
    scope: CommandCentreScope,
  ): Promise<PublishedCurrentPostureRef[]> {
    const states: PublishedCurrentPostureRef[] = [];
    const latestOf = <T extends { status: string; publishedAt?: string; recordedAt: string }>(rows: T[]) =>
      [...rows]
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )[0];

    try {
      const latest = latestOf(
        await repository.listScheduleAssessments(scope.tenantId, scope.workspaceId, scope.projectId),
      );
      if (latest) {
        states.push({
          domain: "schedule",
          posture: latest.milestonePosture,
          published: true,
          assessmentId: latest.assessmentId,
          publishedAt: latest.publishedAt,
        });
      }
    } catch {
      /* isolate */
    }
    try {
      const latest = latestOf(await repository.listCostStates(scope.tenantId, scope.workspaceId, scope.projectId));
      if (latest) {
        states.push({
          domain: "cost",
          posture: latest.costPosture,
          published: true,
          assessmentId: latest.stateId,
          publishedAt: latest.publishedAt,
        });
      }
    } catch {
      /* isolate */
    }
    try {
      const latest = latestOf(
        await repository.listProgressAssessments(scope.tenantId, scope.workspaceId, scope.projectId),
      );
      if (latest) {
        states.push({
          domain: "progress",
          posture: latest.trendDirection,
          published: true,
          assessmentId: latest.assessmentId,
          publishedAt: latest.publishedAt,
        });
      }
    } catch {
      /* isolate */
    }
    try {
      const latest = latestOf(await repository.listChangeStates(scope.tenantId, scope.workspaceId, scope.projectId));
      if (latest) {
        states.push({
          domain: "change",
          posture: latest.changeStatusContext,
          published: true,
          assessmentId: latest.stateId,
          publishedAt: latest.publishedAt,
        });
      }
    } catch {
      /* isolate */
    }
    return states;
  }
}
