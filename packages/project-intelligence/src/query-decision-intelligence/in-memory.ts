import type { CommandCentreAvailability } from "../command-centre/types";
import type { QueryDecisionIntelligencePort } from "./ports";
import type {
  ActionSourceSlice,
  CanonicalActionRef,
  CanonicalDecisionRef,
  CanonicalQueryRef,
  DecisionSourceSlice,
  QueryDecisionSourceSnapshot,
  QuerySourceSlice,
} from "./types";

export class InMemoryQueryDecisionIntelligencePort implements QueryDecisionIntelligencePort {
  readonly sourceDomain = "engineering_core" as const;
  readonly mutatesCanonicalState = false as const;
  readonly storesQueryRegister = false as const;
  readonly storesDecisionRegister = false as const;
  readonly storesActionRegister = false as const;
  readonly mutatesQuery = false as const;
  readonly mutatesDecision = false as const;
  readonly mutatesAction = false as const;

  constructor(
    private readonly snapshot: QueryDecisionSourceSnapshot = {
      query: { availability: "no_data", bound: false, items: [] },
      decision: { availability: "no_data", bound: false, items: [] },
      action: { availability: "no_data", bound: false, items: [] },
    },
    private readonly fail?: "throw",
  ) {}

  async load(): Promise<QueryDecisionSourceSnapshot> {
    if (this.fail === "throw") throw new Error("query_decision_read_failed");
    return this.snapshot;
  }
}

export function canonicalQuery(
  overrides: Partial<CanonicalQueryRef> & Pick<CanonicalQueryRef, "id">,
): CanonicalQueryRef {
  return {
    status: "open",
    open: true,
    priority: "medium",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-20T00:00:00.000Z",
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function canonicalDecision(
  overrides: Partial<CanonicalDecisionRef> & Pick<CanonicalDecisionRef, "id">,
): CanonicalDecisionRef {
  return {
    status: "draft",
    open: true,
    priority: "medium",
    approvalStatus: "pending",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-20T00:00:00.000Z",
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function canonicalActionItem(
  overrides: Partial<CanonicalActionRef> & Pick<CanonicalActionRef, "id">,
): CanonicalActionRef {
  return {
    status: "open",
    open: true,
    priority: "medium",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-20T00:00:00.000Z",
    storesCanonicalCopy: false,
    ...overrides,
  };
}

export function querySliceFrom(
  items: readonly CanonicalQueryRef[],
  extra?: {
    availability?: CommandCentreAvailability;
    bound?: boolean;
    completeness?: "complete" | "unknown";
    sourceTimestamp?: string;
  },
): QuerySourceSlice {
  const bound = extra?.bound ?? (extra?.availability === "no_data" ? false : true);
  return {
    availability: extra?.availability ?? (bound ? "ok" : "no_data"),
    bound,
    completeness: extra?.completeness ?? (bound ? "complete" : undefined),
    items,
    sourceTimestamp: extra?.sourceTimestamp ?? items[0]?.updatedAt,
  };
}

export function decisionSliceFrom(
  items: readonly CanonicalDecisionRef[],
  extra?: {
    availability?: CommandCentreAvailability;
    bound?: boolean;
    completeness?: "complete" | "unknown";
    sourceTimestamp?: string;
  },
): DecisionSourceSlice {
  const bound = extra?.bound ?? (extra?.availability === "no_data" ? false : true);
  return {
    availability: extra?.availability ?? (bound ? "ok" : "no_data"),
    bound,
    completeness: extra?.completeness ?? (bound ? "complete" : undefined),
    items,
    sourceTimestamp: extra?.sourceTimestamp ?? items[0]?.updatedAt,
  };
}

export function actionSliceFrom(
  items: readonly CanonicalActionRef[],
  extra?: {
    availability?: CommandCentreAvailability;
    bound?: boolean;
    completeness?: "complete" | "unknown";
    sourceTimestamp?: string;
  },
): ActionSourceSlice {
  const bound = extra?.bound ?? (extra?.availability === "no_data" ? false : true);
  return {
    availability: extra?.availability ?? (bound ? "ok" : "no_data"),
    bound,
    completeness: extra?.completeness ?? (bound ? "complete" : undefined),
    items,
    sourceTimestamp: extra?.sourceTimestamp ?? items[0]?.updatedAt,
  };
}

export function snapshotFromQueryDecision(
  query: QuerySourceSlice,
  decision: DecisionSourceSlice,
  action: ActionSourceSlice,
): QueryDecisionSourceSnapshot {
  return { query, decision, action };
}
