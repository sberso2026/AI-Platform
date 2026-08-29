import type { CommandCentreAvailability } from "../command-centre/types";
import type { ScheduleIntelligencePort } from "./ports";
import type {
  PublishedScheduleAssessmentRef,
  PublishedScheduleEvidenceRef,
  ScheduleIntelligenceSourceSnapshot,
} from "./types";

export class InMemoryScheduleIntelligencePort implements ScheduleIntelligencePort {
  readonly sourceDomain = "project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly computesCriticalPath = false as const;
  readonly computesFloat = false as const;

  constructor(
    private readonly snapshot: ScheduleIntelligenceSourceSnapshot = {
      availability: "no_data",
      latest: null,
      history: [],
      evidence: [],
      priorEvidence: [],
    },
    private readonly fail?: "throw",
  ) {}

  async load(): Promise<ScheduleIntelligenceSourceSnapshot> {
    if (this.fail === "throw") throw new Error("schedule_read_failed");
    return this.snapshot;
  }
}

export function publishedScheduleAssessment(
  overrides: Partial<PublishedScheduleAssessmentRef> & Pick<PublishedScheduleAssessmentRef, "assessmentId" | "projectId">,
): PublishedScheduleAssessmentRef {
  return {
    stateId: overrides.stateId ?? overrides.assessmentId,
    published: true,
    abstained: false,
    posture: "on_track",
    assessedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    recordedAt: "2026-08-01T00:00:00.000Z",
    version: 1,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedMilestoneEvidence(
  overrides: Partial<PublishedScheduleEvidenceRef> & Pick<PublishedScheduleEvidenceRef, "evidenceId" | "assessmentId">,
): PublishedScheduleEvidenceRef {
  return {
    kind: "milestone_declaration",
    sourceType: "manual_engineering_assessment",
    sourceKey: overrides.sourceKey ?? overrides.evidenceId,
    revoked: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function snapshotFrom(
  latest: PublishedScheduleAssessmentRef | null,
  extra?: {
    availability?: CommandCentreAvailability;
    history?: readonly PublishedScheduleAssessmentRef[];
    evidence?: readonly PublishedScheduleEvidenceRef[];
    priorEvidence?: readonly PublishedScheduleEvidenceRef[];
  },
): ScheduleIntelligenceSourceSnapshot {
  return {
    availability: extra?.availability ?? (latest ? "ok" : "no_data"),
    latest,
    history: extra?.history ?? (latest ? [latest] : []),
    evidence: extra?.evidence ?? [],
    priorEvidence: extra?.priorEvidence ?? [],
  };
}
