import {
  type CommandCentreAvailability,
  type CommandCentreScope,
  type CostProgressIntelligencePort,
  type CostProgressSourceSnapshot,
  type CostSourceSlice,
  type ProgressSourceSlice,
  type PublishedCostEvidenceRef,
  type PublishedCostStateRef,
  type PublishedProgressAssessmentRef,
  type PublishedProgressEvidenceRef,
  asCostPosture,
  asProgressBand,
  asProgressTrend,
} from "@rtb/project-intelligence";
import { createProjectControlsRepository } from "@rtb/project-controls";
import type { AuthContext } from "@/lib/kernel";

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

const COST_RANK: Record<string, number> = {
  over: 4,
  attention_required: 3,
  within_tolerance: 2,
  under: 1,
  unknown: 0,
};

function emptyCost(availability: CommandCentreAvailability): CostSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

function emptyProgress(availability: CommandCentreAvailability): ProgressSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

function mapCostState(row: {
  stateId: string;
  projectId: string;
  status: string;
  abstained: boolean;
  costPosture?: string;
  varianceAttribution?: string;
  controlContext?: { currencyCode?: string };
  costBasisRef?: { kind?: string; currencyCode?: string; conversionRef?: string };
  confidence?: {
    dataSufficiency?: string;
    confidenceClass?: string;
    evidenceCount?: number;
    usableEvidenceCount?: number;
  };
  assessedAt: string;
  publishedAt?: string;
  recordedAt: string;
  version: number;
}): PublishedCostStateRef {
  return {
    stateId: row.stateId,
    projectId: row.projectId,
    published: row.status === "published",
    abstained: row.abstained,
    posture: asCostPosture(row.costPosture),
    varianceAttribution: row.varianceAttribution,
    currencyCode: row.controlContext?.currencyCode,
    basisKind: row.costBasisRef?.kind,
    basisCurrencyCode: row.costBasisRef?.currencyCode,
    conversionRef: row.costBasisRef?.conversionRef,
    dataSufficiency: row.confidence?.dataSufficiency,
    confidenceClass: row.confidence?.confidenceClass,
    evidenceCount: row.confidence?.evidenceCount,
    usableEvidenceCount: row.confidence?.usableEvidenceCount,
    assessedAt: row.assessedAt,
    publishedAt: row.publishedAt,
    recordedAt: row.recordedAt,
    version: row.version,
    storesCanonicalCopy: false,
  };
}

function mapCostEvidence(row: {
  evidenceId: string;
  costStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  currencyCode?: string;
  declaredDirection?: string;
  observedAt?: string;
  recordedAt: string;
  revoked?: boolean;
}): PublishedCostEvidenceRef {
  return {
    evidenceId: row.evidenceId,
    costStateId: row.costStateId,
    kind: row.kind,
    sourceType: row.sourceType,
    sourceKey: row.sourceKey,
    currencyCode: row.currencyCode,
    declaredDirection: row.declaredDirection,
    observedAt: row.observedAt,
    recordedAt: row.recordedAt,
    revoked: Boolean(row.revoked),
    storesCanonicalCopy: false,
  };
}

function mapProgress(row: {
  assessmentId: string;
  stateId: string;
  projectId: string;
  status: string;
  abstained: boolean;
  band?: string;
  trendDirection?: string;
  indicatedCompletion?: number;
  confidence?: {
    dataSufficiency?: string;
    confidenceClass?: string;
    evidenceCount?: number;
    usableEvidenceCount?: number;
  };
  assessedAt: string;
  publishedAt?: string;
  recordedAt: string;
  version: number;
}): PublishedProgressAssessmentRef {
  return {
    assessmentId: row.assessmentId,
    stateId: row.stateId,
    projectId: row.projectId,
    published: row.status === "published",
    abstained: row.abstained,
    band: asProgressBand(row.band),
    trendDirection: asProgressTrend(row.trendDirection),
    indicatedCompletion: row.indicatedCompletion,
    dataSufficiency: row.confidence?.dataSufficiency,
    confidenceClass: row.confidence?.confidenceClass,
    evidenceCount: row.confidence?.evidenceCount,
    usableEvidenceCount: row.confidence?.usableEvidenceCount,
    assessedAt: row.assessedAt,
    publishedAt: row.publishedAt,
    recordedAt: row.recordedAt,
    version: row.version,
    storesCanonicalCopy: false,
  };
}

function mapProgressEvidence(row: {
  evidenceId: string;
  assessmentStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  indicatedCompletion?: number;
  observedAt?: string;
  recordedAt: string;
  revoked?: boolean;
}): PublishedProgressEvidenceRef {
  return {
    evidenceId: row.evidenceId,
    assessmentId: row.assessmentStateId,
    kind: row.kind,
    sourceType: row.sourceType,
    sourceKey: row.sourceKey,
    indicatedCompletion: row.indicatedCompletion,
    observedAt: row.observedAt,
    recordedAt: row.recordedAt,
    revoked: Boolean(row.revoked),
    storesCanonicalCopy: false,
  };
}

export class HostedCostProgressIntelligenceSource implements CostProgressIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesEarnedValue = false as const;
  readonly computesForecast = false as const;
  readonly computesPhysicalProgress = false as const;

  constructor(private readonly ctx: AuthContext) {}

  async load(scope: CommandCentreScope): Promise<CostProgressSourceSnapshot> {
    const repository = createProjectControlsRepository({
      adapter: "postgres",
      supabase: this.ctx.supabase,
      nodeEnv: "production",
    });

    const [cost, progress] = await Promise.all([
      this.loadCost(repository, scope),
      this.loadProgress(repository, scope),
    ]);

    return { cost, progress };
  }

  private async loadCost(
    repository: ReturnType<typeof createProjectControlsRepository>,
    scope: CommandCentreScope,
  ): Promise<CostSourceSlice> {
    let published: PublishedCostStateRef[];
    try {
      const rows = await repository.listCostStates(scope.tenantId, scope.workspaceId, scope.projectId);
      published = rows
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )
        .map(mapCostState);
    } catch (error) {
      return emptyCost(classifyFailure(error));
    }

    if (!published.length) return emptyCost("no_data");
    const latest = [...published].sort(
      (a, b) =>
        (COST_RANK[b.posture ?? "unknown"] ?? 0) - (COST_RANK[a.posture ?? "unknown"] ?? 0),
    )[0];
    let evidence: PublishedCostEvidenceRef[] = [];
    try {
      const rows = await repository.listCostEvidence(scope.tenantId, scope.workspaceId, latest.stateId);
      evidence = rows.map(mapCostEvidence);
    } catch {
      evidence = [];
    }
    return { availability: "ok", latest, history: published, evidence };
  }

  private async loadProgress(
    repository: ReturnType<typeof createProjectControlsRepository>,
    scope: CommandCentreScope,
  ): Promise<ProgressSourceSlice> {
    let published: PublishedProgressAssessmentRef[];
    try {
      const rows = await repository.listProgressAssessments(
        scope.tenantId,
        scope.workspaceId,
        scope.projectId,
      );
      published = rows
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )
        .map((row) =>
          mapProgress({
            ...row,
            band: row.band,
            trendDirection: row.trendDirection,
          }),
        );
    } catch (error) {
      return emptyProgress(classifyFailure(error));
    }

    const latest = published[0] ?? null;
    if (!latest) return emptyProgress("no_data");
    let evidence: PublishedProgressEvidenceRef[] = [];
    try {
      const rows = await repository.listProgressEvidence(
        scope.tenantId,
        scope.workspaceId,
        latest.stateId,
      );
      evidence = rows.map(mapProgressEvidence);
    } catch {
      evidence = [];
    }
    return { availability: "ok", latest, history: published, evidence };
  }
}
