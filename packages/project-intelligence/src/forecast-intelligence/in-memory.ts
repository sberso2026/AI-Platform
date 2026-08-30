import type { CommandCentreAvailability } from "../command-centre/types";
import type { ForecastIntelligencePort } from "./ports";
import type {
  ForecastIntelligenceSourceSnapshot,
  ForecastSourceSlice,
  PublishedCurrentPostureRef,
  PublishedForecastEvidenceRef,
  PublishedForecastStateRef,
} from "./types";

export class InMemoryForecastIntelligencePort implements ForecastIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesForecast = false as const;
  readonly computesCompletionDate = false as const;
  readonly computesCostForecast = false as const;
  readonly computesMonteCarlo = false as const;

  constructor(
    private readonly snapshot: ForecastIntelligenceSourceSnapshot = {
      availability: "no_data",
      latest: null,
      history: [],
      evidence: [],
      currentStates: [],
    },
    private readonly fail?: "throw",
  ) {}

  async load(): Promise<ForecastIntelligenceSourceSnapshot> {
    if (this.fail === "throw") throw new Error("forecast_read_failed");
    return this.snapshot;
  }
}

export function publishedForecastState(
  overrides: Partial<PublishedForecastStateRef> & Pick<PublishedForecastStateRef, "stateId" | "projectId">,
): PublishedForecastStateRef {
  return {
    published: true,
    abstained: false,
    posture: "stable",
    version: 1,
    assessedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    recordedAt: "2026-08-01T00:00:00.000Z",
    dataSufficiency: "sufficient",
    confidenceClass: "medium",
    contributingContributors: [],
    limitations: ["advisory_forecast_intelligence_only"],
    completionDatePredicted: false,
    costForecastComputed: false,
    scenarioIdPublished: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedForecastEvidence(
  overrides: Partial<PublishedForecastEvidenceRef> &
    Pick<PublishedForecastEvidenceRef, "evidenceId" | "forecastStateId">,
): PublishedForecastEvidenceRef {
  return {
    kind: "composed_context_ref",
    sourceType: "project_context_composition",
    sourceKey: overrides.sourceKey ?? overrides.evidenceId,
    revoked: false,
    completionDateClaimed: false,
    costForecastClaimed: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedCurrentPosture(
  overrides: Partial<PublishedCurrentPostureRef> & Pick<PublishedCurrentPostureRef, "domain">,
): PublishedCurrentPostureRef {
  return {
    published: true,
    ...overrides,
  };
}

export function forecastSliceFrom(
  latest: PublishedForecastStateRef | null,
  extra?: {
    availability?: CommandCentreAvailability;
    history?: readonly PublishedForecastStateRef[];
    evidence?: readonly PublishedForecastEvidenceRef[];
    currentStates?: readonly PublishedCurrentPostureRef[];
  },
): ForecastSourceSlice {
  const history = extra?.history ?? (latest ? [latest] : []);
  return {
    availability: extra?.availability ?? (latest ? "ok" : "no_data"),
    latest,
    history,
    evidence: extra?.evidence ?? [],
    currentStates: extra?.currentStates ?? [],
  };
}
