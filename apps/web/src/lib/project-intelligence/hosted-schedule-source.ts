import {
  type CommandCentreAvailability,
  type CommandCentreScope,
  type PublishedScheduleAssessmentRef,
  type PublishedScheduleEvidenceRef,
  type ScheduleIntelligencePort,
  type ScheduleIntelligenceSourceSnapshot,
  asPublishedPosture,
} from "@rtb/project-intelligence";
import { createProjectControlsRepository } from "@rtb/project-controls";
import type { AuthContext } from "@/lib/kernel";

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

function mapAssessment(row: {
  assessmentId: string;
  stateId: string;
  projectId: string;
  status: string;
  abstained: boolean;
  milestonePosture?: string;
  declaredBaselineDate?: string;
  declaredCurrentDate?: string;
  declaredDateDeltaDays?: number;
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
}): PublishedScheduleAssessmentRef {
  return {
    assessmentId: row.assessmentId,
    stateId: row.stateId,
    projectId: row.projectId,
    published: row.status === "published",
    abstained: row.abstained,
    posture: asPublishedPosture(row.milestonePosture),
    declaredBaselineDate: row.declaredBaselineDate,
    declaredCurrentDate: row.declaredCurrentDate,
    declaredDateDeltaDays: row.declaredDateDeltaDays,
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

function mapEvidence(row: {
  evidenceId: string;
  assessmentStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  sourceReference?: string;
  narrative?: string;
  declaredBaselineDate?: string;
  declaredCurrentDate?: string;
  declaredPosture?: string;
  scope: { kind: string; referenceId?: string };
  observedAt?: string;
  recordedAt: string;
  revoked?: boolean;
}): PublishedScheduleEvidenceRef {
  return {
    evidenceId: row.evidenceId,
    assessmentId: row.assessmentStateId,
    kind: row.kind,
    sourceType: row.sourceType,
    sourceKey: row.sourceKey,
    sourceReference: row.sourceReference,
    title: row.sourceReference || row.sourceKey || row.narrative || row.evidenceId,
    declaredBaselineDate: row.declaredBaselineDate,
    declaredCurrentDate: row.declaredCurrentDate,
    declaredPosture: asPublishedPosture(row.declaredPosture),
    scopeKind: row.scope.kind,
    scopeReferenceId: row.scope.referenceId,
    observedAt: row.observedAt,
    recordedAt: row.recordedAt,
    revoked: Boolean(row.revoked),
    storesCanonicalCopy: false,
  };
}

function emptySnapshot(availability: CommandCentreAvailability): ScheduleIntelligenceSourceSnapshot {
  return {
    availability,
    latest: null,
    history: [],
    evidence: [],
    priorEvidence: [],
  };
}

export class HostedScheduleIntelligenceSource implements ScheduleIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesCriticalPath = false as const;
  readonly computesFloat = false as const;

  constructor(private readonly ctx: AuthContext) {}

  async load(scope: CommandCentreScope): Promise<ScheduleIntelligenceSourceSnapshot> {
    const repository = createProjectControlsRepository({
      adapter: "postgres",
      supabase: this.ctx.supabase,
      nodeEnv: "production",
    });

    let published: ReturnType<typeof mapAssessment>[];
    try {
      const rows = await repository.listScheduleAssessments(scope.tenantId, scope.workspaceId, scope.projectId);
      published = rows
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )
        .map(mapAssessment);
    } catch (error) {
      return emptySnapshot(classifyFailure(error));
    }

    const latest = published[0] ?? null;
    if (!latest) return emptySnapshot("no_data");

    const prior = published[1];
    const [evidence, priorEvidence] = await Promise.all([
      this.readEvidence(repository, scope, latest.stateId),
      prior ? this.readEvidence(repository, scope, prior.stateId) : Promise.resolve([]),
    ]);

    return {
      availability: "ok",
      latest,
      history: published,
      evidence,
      priorEvidence,
    };
  }

  private async readEvidence(
    repository: ReturnType<typeof createProjectControlsRepository>,
    scope: CommandCentreScope,
    assessmentStateId: string,
  ): Promise<PublishedScheduleEvidenceRef[]> {
    try {
      const rows = await repository.listScheduleEvidence(scope.tenantId, scope.workspaceId, assessmentStateId);
      return rows.map(mapEvidence);
    } catch {
      return [];
    }
  }
}
