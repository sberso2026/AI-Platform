import {
  emptyControlsSnapshot,
  type CommandCentreAvailability,
  type CommandCentreControlsLoad,
  type CommandCentreControlsPort,
  type CommandCentreScope,
  type PublishedControlsOutput,
} from "@rtb/project-intelligence";
import { createProjectControlsRepository } from "@rtb/project-controls";
import type { AuthContext } from "@/lib/kernel";

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

function toPublished(input: {
  assessmentId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  posture?: string;
  assessedAt?: string;
  publishedAt?: string;
  version?: number;
}): PublishedControlsOutput {
  return {
    ...input,
    storesCanonicalCopy: false,
  };
}

function latestPublished<T extends { status: string; publishedAt?: string; recordedAt: string }>(
  rows: T[],
): T | undefined {
  return [...rows]
    .filter((row) => row.status === "published")
    .sort(
      (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
    )[0];
}

async function readSection(
  load: () => Promise<PublishedControlsOutput | null>,
): Promise<{ output: PublishedControlsOutput | null; availability: CommandCentreAvailability }> {
  try {
    const output = await load();
    return { output, availability: output ? "ok" : "no_data" };
  } catch (error) {
    return { output: null, availability: classifyFailure(error) };
  }
}

export class HostedProjectControlsSource implements CommandCentreControlsPort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;

  constructor(private readonly ctx: AuthContext) {}

  async load(scope: CommandCentreScope): Promise<CommandCentreControlsLoad> {
    const repository = createProjectControlsRepository({
      adapter: "postgres",
      supabase: this.ctx.supabase,
      nodeEnv: "production",
    });

    const [schedule, cost, progress, change, forecast] = await Promise.all([
      readSection(async () => {
        const rows = await repository.listScheduleAssessments(scope.tenantId, scope.workspaceId, scope.projectId);
        const latest = latestPublished(rows);
        if (!latest) return null;
        return toPublished({
          assessmentId: latest.assessmentId,
          projectId: latest.projectId,
          published: latest.status === "published",
          abstained: latest.abstained,
          posture: latest.milestonePosture,
          assessedAt: latest.assessedAt,
          publishedAt: latest.publishedAt,
          version: latest.version,
        });
      }),
      readSection(async () => {
        const rows = await repository.listCostStates(scope.tenantId, scope.workspaceId, scope.projectId);
        const published = rows.filter((row) => row.status === "published");
        if (!published.length) return null;
        const rank: Record<string, number> = {
          over: 4,
          attention_required: 3,
          within_tolerance: 2,
          under: 1,
          unknown: 0,
        };
        const dominant = [...published].sort(
          (a, b) => (rank[b.costPosture] ?? 0) - (rank[a.costPosture] ?? 0),
        )[0];
        return toPublished({
          assessmentId: dominant.stateId,
          projectId: dominant.projectId,
          published: true,
          abstained: dominant.abstained,
          posture: dominant.costPosture,
          assessedAt: dominant.assessedAt,
          publishedAt: dominant.publishedAt,
          version: dominant.version,
        });
      }),
      readSection(async () => {
        const rows = await repository.listProgressAssessments(scope.tenantId, scope.workspaceId, scope.projectId);
        const latest = latestPublished(rows);
        if (!latest) return null;
        const posture = latest.band === "unavailable" ? "unavailable" : latest.trendDirection;
        return toPublished({
          assessmentId: latest.assessmentId,
          projectId: latest.projectId,
          published: true,
          abstained: latest.abstained,
          posture,
          assessedAt: latest.assessedAt,
          publishedAt: latest.publishedAt,
          version: latest.version,
        });
      }),
      readSection(async () => {
        const rows = await repository.listChangeStates(scope.tenantId, scope.workspaceId, scope.projectId);
        const published = rows.filter((row) => row.status === "published");
        if (!published.length) return null;
        const pending = published.find((row) => row.changeStatusContext === "pending");
        const chosen = pending ?? latestPublished(published);
        if (!chosen) return null;
        return toPublished({
          assessmentId: chosen.stateId,
          projectId: chosen.projectId,
          published: true,
          abstained: chosen.abstained,
          posture: chosen.changeStatusContext,
          assessedAt: chosen.assessedAt,
          publishedAt: chosen.publishedAt,
          version: chosen.version,
        });
      }),
      readSection(async () => {
        const rows = await repository.listForecastStates(scope.tenantId, scope.workspaceId, scope.projectId);
        const latest = latestPublished(rows);
        if (!latest) return null;
        return toPublished({
          assessmentId: latest.stateId,
          projectId: latest.projectId,
          published: true,
          abstained: latest.abstained,
          posture: latest.forecastPosture,
          assessedAt: latest.assessedAt,
          publishedAt: latest.publishedAt,
          version: latest.version,
        });
      }),
    ]);

    return {
      snapshot: {
        ...emptyControlsSnapshot(),
        schedule: schedule.output,
        cost: cost.output,
        progress: progress.output,
        change: change.output,
        forecast: forecast.output,
      },
      availability: {
        schedule: schedule.availability,
        cost: cost.availability,
        progress: progress.availability,
        change: change.availability,
        forecast: forecast.availability,
      },
    };
  }
}
