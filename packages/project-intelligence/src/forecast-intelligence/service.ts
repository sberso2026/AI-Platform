import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { CommandCentreError, commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreAvailability } from "../command-centre/types";
import { buildForecastAttention } from "./attention";
import {
  classifyForecastHealth,
  classifyForecastReadiness,
  forecastEvidenceRefs,
  interpretForecastDataQuality,
  interpretForecastDomains,
  interpretForecastObservations,
  interpretForecastTrend,
  UNSUPPORTED_FORECAST_METRICS,
} from "./interpreter";
import { assertForecastIntelligenceOwnershipLocks, PI_AI_REQUIRED } from "./ownership";
import type { ForecastIntelligencePort } from "./ports";
import type { ForecastIntelligenceSourceSnapshot, ProjectForecastIntelligence } from "./types";

export type ComposeForecastIntelligenceInput = {
  projectId: string;
  context: AccessContext;
  generatedAt?: string;
};

function unavailableSnapshot(availability: CommandCentreAvailability): ForecastIntelligenceSourceSnapshot {
  return { availability, latest: null, history: [], evidence: [], currentStates: [] };
}

export function interpretForecastIntelligence(input: {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  snapshot: ForecastIntelligenceSourceSnapshot;
  generatedAt: string;
}): ProjectForecastIntelligence {
  const quality = interpretForecastDataQuality({ slice: input.snapshot, generatedAt: input.generatedAt });
  const readiness = classifyForecastReadiness({
    availability: input.snapshot.availability,
    latest: input.snapshot.latest,
    freshness: quality.freshness,
  });
  const health = classifyForecastHealth(input.snapshot.latest, input.snapshot.availability, readiness);
  const domains = interpretForecastDomains(input.snapshot.latest);
  const trend = interpretForecastTrend(input.snapshot.history);
  const attentionItems = buildForecastAttention({
    slice: input.snapshot,
    health,
    domains,
    trend,
    generatedAt: input.generatedAt,
  });

  return {
    projectId: input.projectId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    availability: input.snapshot.availability,
    readiness,
    publicationKind: input.snapshot.latest?.published ? "QUALITATIVE_PUBLISHED" : "NOT_PUBLISHED",
    health,
    domains,
    trend,
    attentionItems,
    observations: interpretForecastObservations({
      latest: input.snapshot.latest,
      currentStates: input.snapshot.currentStates,
    }),
    dataQuality: quality,
    evidenceReferences: forecastEvidenceRefs(input.snapshot.latest, input.snapshot.evidence),
    unsupported: UNSUPPORTED_FORECAST_METRICS,
    generatedAt: input.generatedAt,
    readOnly: true,
    persisted: false,
    aiRequired: PI_AI_REQUIRED,
    mutatesForecast: false,
  };
}

export class ProjectForecastIntelligenceService {
  constructor(private readonly source: ForecastIntelligencePort) {}

  async compose(input: ComposeForecastIntelligenceInput): Promise<ProjectForecastIntelligence> {
    assertForecastIntelligenceOwnershipLocks();
    requireProjectIntelligenceAccess(input.context);
    if (
      this.source.invokesControlsEngine ||
      this.source.computesForecast ||
      this.source.computesCompletionDate ||
      this.source.computesCostForecast ||
      this.source.computesMonteCarlo
    ) {
      throw new Error("Forecast Intelligence must not invoke a Project Controls forecast engine");
    }

    const tenantId = input.context.tenantId!;
    const workspaceId = input.context.workspaceId!;
    const generatedAt = input.generatedAt ?? new Date().toISOString();

    let snapshot: ForecastIntelligenceSourceSnapshot;
    try {
      snapshot = await this.source.load({ tenantId, workspaceId, projectId: input.projectId });
    } catch (error) {
      if (error instanceof CommandCentreError) throw error;
      snapshot = unavailableSnapshot("error");
    }

    if (snapshot.availability === "forbidden") {
      throw forecastForbidden(input.projectId, "forecast_forbidden");
    }

    return interpretForecastIntelligence({
      projectId: input.projectId,
      tenantId,
      workspaceId,
      snapshot,
      generatedAt,
    });
  }
}

export function forecastForbidden(projectId: string, reason: string): CommandCentreError {
  return commandCentreForbidden(projectId, reason);
}
