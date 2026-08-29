import type { CommandCentreAvailability } from "../command-centre/types";
import type { RiskChangeIntelligencePort } from "./ports";
import type {
  CanonicalRiskActionRef,
  CanonicalRiskRef,
  ChangeSourceSlice,
  PublishedChangeEvidenceRef,
  PublishedChangeStateRef,
  RiskChangeSourceSnapshot,
  RiskSourceSlice,
} from "./types";

export class InMemoryRiskChangeIntelligencePort implements RiskChangeIntelligencePort {
  readonly sourceDomain = "engineering_core_and_project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly storesRiskRegister = false as const;
  readonly mutatesRisk = false as const;
  readonly mutatesChange = false as const;
  readonly computesChangeImpact = false as const;
  readonly computesIndependentRiskScore = false as const;

  constructor(
    private readonly snapshot: RiskChangeSourceSnapshot = {
      risk: { availability: "no_data", bound: false, items: [], actions: [] },
      change: { availability: "no_data", latest: null, history: [], evidence: [] },
    },
    private readonly fail?: "throw",
  ) {}

  async load(): Promise<RiskChangeSourceSnapshot> {
    if (this.fail === "throw") throw new Error("risk_change_read_failed");
    return this.snapshot;
  }
}

export function canonicalRisk(
  overrides: Partial<CanonicalRiskRef> & Pick<CanonicalRiskRef, "id">,
): CanonicalRiskRef {
  return {
    status: "open",
    open: true,
    priority: "medium",
    score: 4,
    probability: 2,
    consequence: 2,
    matrixScale: "probability_1_5_consequence_1_5",
    updatedAt: "2026-08-20T00:00:00.000Z",
    createdAt: "2026-08-01T00:00:00.000Z",
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function canonicalRiskAction(
  overrides: Partial<CanonicalRiskActionRef> & Pick<CanonicalRiskActionRef, "id">,
): CanonicalRiskActionRef {
  return {
    open: true,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedChangeState(
  overrides: Partial<PublishedChangeStateRef> & Pick<PublishedChangeStateRef, "stateId" | "projectId">,
): PublishedChangeStateRef {
  return {
    published: true,
    abstained: false,
    statusContext: "approved_context",
    changeClass: "scope",
    impact: { schedule: "unknown", cost: "unknown" },
    assessedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    recordedAt: "2026-08-01T00:00:00.000Z",
    version: 1,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function publishedChangeEvidence(
  overrides: Partial<PublishedChangeEvidenceRef> &
    Pick<PublishedChangeEvidenceRef, "evidenceId" | "changeStateId">,
): PublishedChangeEvidenceRef {
  return {
    kind: "external_register_reference",
    sourceType: "project_intelligence",
    sourceRef: overrides.sourceRef ?? overrides.sourceKey ?? overrides.evidenceId,
    sourceKey: overrides.sourceKey ?? overrides.evidenceId,
    revoked: false,
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function riskSliceFrom(
  items: readonly CanonicalRiskRef[],
  extra?: {
    availability?: CommandCentreAvailability;
    bound?: boolean;
    actions?: readonly CanonicalRiskActionRef[];
    sourceTimestamp?: string;
  },
): RiskSourceSlice {
  const bound = extra?.bound ?? (extra?.availability === "no_data" ? false : true);
  return {
    availability: extra?.availability ?? (bound ? "ok" : "no_data"),
    bound,
    items,
    actions: extra?.actions ?? [],
    sourceTimestamp: extra?.sourceTimestamp ?? items[0]?.updatedAt,
  };
}

export function changeSliceFrom(
  latest: PublishedChangeStateRef | null,
  extra?: {
    availability?: CommandCentreAvailability;
    history?: readonly PublishedChangeStateRef[];
    evidence?: readonly PublishedChangeEvidenceRef[];
  },
): ChangeSourceSlice {
  return {
    availability: extra?.availability ?? (latest ? "ok" : "no_data"),
    latest,
    history: extra?.history ?? (latest ? [latest] : []),
    evidence: extra?.evidence ?? [],
  };
}

export function snapshotFromRiskChange(
  risk: RiskSourceSlice,
  change: ChangeSourceSlice,
): RiskChangeSourceSnapshot {
  return { risk, change };
}
