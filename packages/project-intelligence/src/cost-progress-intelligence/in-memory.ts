import type { CommandCentreAvailability } from "../command-centre/types";
import type { CostProgressIntelligencePort } from "./ports";
import type {
  CostProgressSourceSnapshot,
  CostSourceSlice,
  ProgressSourceSlice,
  PublishedCostEvidenceRef,
  PublishedCostStateRef,
  PublishedProgressAssessmentRef,
  PublishedProgressEvidenceRef,
} from "./types";

export class InMemoryCostProgressIntelligencePort implements CostProgressIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesEarnedValue = false as const;
  readonly computesForecast = false as const;
  readonly computesPhysicalProgress = false as const;

  constructor(
    private readonly snapshot: CostProgressSourceSnapshot = {
      cost: { availability: "no_data", latest: null, history: [], evidence: [] },
      progress: { availability: "no_data", latest: null, history: [], evidence: [] },
    },
    private readonly fail?: "throw",
  ) {}

  async load(): Promise<CostProgressSourceSnapshot> {
    if (this.fail === "throw") throw new Error("cost_progress_read_failed");
    return this.snapshot;
  }
}

export function publishedCostState(
  overrides: Partial<PublishedCostStateRef> & Pick<PublishedCostStateRef, "stateId" | "projectId">,
): PublishedCostStateRef {
  return {
    published: true,
    abstained: false,
    posture: "within_tolerance",
    varianceAttribution: "explained_by_approved_change",
    currencyCode: "AUD",
    assessedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    recordedAt: "2026-08-01T00:00:00.000Z",
    version: 1,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedCostEvidence(
  overrides: Partial<PublishedCostEvidenceRef> & Pick<PublishedCostEvidenceRef, "evidenceId" | "costStateId">,
): PublishedCostEvidenceRef {
  return {
    kind: "actual_cost_reference",
    sourceType: "manual_engineering_assessment",
    sourceKey: overrides.sourceKey ?? overrides.evidenceId,
    currencyCode: "AUD",
    revoked: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedProgressAssessment(
  overrides: Partial<PublishedProgressAssessmentRef> &
    Pick<PublishedProgressAssessmentRef, "assessmentId" | "projectId">,
): PublishedProgressAssessmentRef {
  return {
    stateId: overrides.stateId ?? overrides.assessmentId,
    published: true,
    abstained: false,
    band: "in_progress",
    trendDirection: "stable",
    indicatedCompletion: 0.4,
    assessedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    recordedAt: "2026-08-01T00:00:00.000Z",
    version: 1,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedProgressEvidence(
  overrides: Partial<PublishedProgressEvidenceRef> &
    Pick<PublishedProgressEvidenceRef, "evidenceId" | "assessmentId">,
): PublishedProgressEvidenceRef {
  return {
    kind: "site_observation",
    sourceType: "manual_engineering_assessment",
    sourceKey: overrides.sourceKey ?? overrides.evidenceId,
    revoked: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function costSliceFrom(
  latest: PublishedCostStateRef | null,
  extra?: {
    availability?: CommandCentreAvailability;
    history?: readonly PublishedCostStateRef[];
    evidence?: readonly PublishedCostEvidenceRef[];
  },
): CostSourceSlice {
  return {
    availability: extra?.availability ?? (latest ? "ok" : "no_data"),
    latest,
    history: extra?.history ?? (latest ? [latest] : []),
    evidence: extra?.evidence ?? [],
  };
}

export function progressSliceFrom(
  latest: PublishedProgressAssessmentRef | null,
  extra?: {
    availability?: CommandCentreAvailability;
    history?: readonly PublishedProgressAssessmentRef[];
    evidence?: readonly PublishedProgressEvidenceRef[];
  },
): ProgressSourceSlice {
  return {
    availability: extra?.availability ?? (latest ? "ok" : "no_data"),
    latest,
    history: extra?.history ?? (latest ? [latest] : []),
    evidence: extra?.evidence ?? [],
  };
}

export function snapshotFromCostProgress(
  cost: CostSourceSlice,
  progress: ProgressSourceSlice,
): CostProgressSourceSnapshot {
  return { cost, progress };
}
