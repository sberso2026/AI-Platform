/**
 * Phase 11B — reserved Project Controls provider interfaces.
 *
 * These are *shapes only*. They exist so that later phases have a stable seam
 * to implement against, and so that the certification can prove nothing behind
 * the seam is wired up. Every factory returns an implementation whose every
 * method throws `not_implemented`.
 *
 * If a future phase implements one of these, it must flip the corresponding
 * `*_IMPLEMENTED` flag in `version.ts` and add its own certification gates.
 */

import {
  BUDGET_LEDGER_IMPLEMENTED,
  CHANGE_CONTROL_IMPLEMENTED,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";
import type { ProjectScopeRef } from "./progress";

export const RESERVED_PROVIDER_KEYS = [
  "schedule",
  "cost",
  "earned_value",
  "forecast",
  "change",
  "productivity",
] as const;

export type ReservedProviderKey = (typeof RESERVED_PROVIDER_KEYS)[number];

export type ReservedProviderQuery = {
  tenantId: string;
  workspaceId: string;
  scope: ProjectScopeRef;
  asOf?: string;
};

/** Thrown by every reserved provider method. */
export class ProjectControlsNotImplementedError extends Error {
  readonly code = "not_implemented" as const;
  constructor(
    readonly providerKey: ReservedProviderKey,
    readonly capability: string,
  ) {
    super(`not_implemented:${providerKey}.${capability}`);
    this.name = "ProjectControlsNotImplementedError";
  }
}

function reject(providerKey: ReservedProviderKey, capability: string): never {
  throw new ProjectControlsNotImplementedError(providerKey, capability);
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type ScheduleProvider = {
  readonly providerKey: "schedule";
  readonly implemented: false;
  getBaseline(query: ReservedProviderQuery): Promise<never>;
  getActivityNetwork(query: ReservedProviderQuery): Promise<never>;
  /** Critical path is reserved. 11B never computes float or a longest path. */
  getCriticalPath(query: ReservedProviderQuery): Promise<never>;
};

export type CostProvider = {
  readonly providerKey: "cost";
  readonly implemented: false;
  getBudget(query: ReservedProviderQuery): Promise<never>;
  getCommitments(query: ReservedProviderQuery): Promise<never>;
  getActualCost(query: ReservedProviderQuery): Promise<never>;
};

export type EarnedValueProvider = {
  readonly providerKey: "earned_value";
  readonly implemented: false;
  getPlannedValue(query: ReservedProviderQuery): Promise<never>;
  getEarnedValue(query: ReservedProviderQuery): Promise<never>;
  getPerformanceIndices(query: ReservedProviderQuery): Promise<never>;
};

export type ForecastProvider = {
  readonly providerKey: "forecast";
  readonly implemented: false;
  getCompletionForecast(query: ReservedProviderQuery): Promise<never>;
  getCostForecast(query: ReservedProviderQuery): Promise<never>;
};

export type ChangeProvider = {
  readonly providerKey: "change";
  readonly implemented: false;
  listChangeEvents(query: ReservedProviderQuery): Promise<never>;
  getChangeImpact(query: ReservedProviderQuery): Promise<never>;
};

export type ProductivityProvider = {
  readonly providerKey: "productivity";
  readonly implemented: false;
  getUnitRates(query: ReservedProviderQuery): Promise<never>;
  getProductivityFactor(query: ReservedProviderQuery): Promise<never>;
};

export type ReservedProviderSet = {
  schedule: ScheduleProvider;
  cost: CostProvider;
  earnedValue: EarnedValueProvider;
  forecast: ForecastProvider;
  change: ChangeProvider;
  productivity: ProductivityProvider;
};

// ---------------------------------------------------------------------------
// Not-implemented factories
// ---------------------------------------------------------------------------

export function createReservedScheduleProvider(): ScheduleProvider {
  return {
    providerKey: "schedule",
    implemented: false,
    getBaseline: async () => reject("schedule", "getBaseline"),
    getActivityNetwork: async () => reject("schedule", "getActivityNetwork"),
    getCriticalPath: async () => reject("schedule", "getCriticalPath"),
  };
}

export function createReservedCostProvider(): CostProvider {
  return {
    providerKey: "cost",
    implemented: false,
    getBudget: async () => reject("cost", "getBudget"),
    getCommitments: async () => reject("cost", "getCommitments"),
    getActualCost: async () => reject("cost", "getActualCost"),
  };
}

export function createReservedEarnedValueProvider(): EarnedValueProvider {
  return {
    providerKey: "earned_value",
    implemented: false,
    getPlannedValue: async () => reject("earned_value", "getPlannedValue"),
    getEarnedValue: async () => reject("earned_value", "getEarnedValue"),
    getPerformanceIndices: async () => reject("earned_value", "getPerformanceIndices"),
  };
}

export function createReservedForecastProvider(): ForecastProvider {
  return {
    providerKey: "forecast",
    implemented: false,
    getCompletionForecast: async () => reject("forecast", "getCompletionForecast"),
    getCostForecast: async () => reject("forecast", "getCostForecast"),
  };
}

export function createReservedChangeProvider(): ChangeProvider {
  return {
    providerKey: "change",
    implemented: false,
    listChangeEvents: async () => reject("change", "listChangeEvents"),
    getChangeImpact: async () => reject("change", "getChangeImpact"),
  };
}

export function createReservedProductivityProvider(): ProductivityProvider {
  return {
    providerKey: "productivity",
    implemented: false,
    getUnitRates: async () => reject("productivity", "getUnitRates"),
    getProductivityFactor: async () => reject("productivity", "getProductivityFactor"),
  };
}

export function createReservedProviderSet(): ReservedProviderSet {
  return {
    schedule: createReservedScheduleProvider(),
    cost: createReservedCostProvider(),
    earnedValue: createReservedEarnedValueProvider(),
    forecast: createReservedForecastProvider(),
    change: createReservedChangeProvider(),
    productivity: createReservedProductivityProvider(),
  };
}

/** Every reserved provider must stay unimplemented for Phase 11B to certify. */
export function assertReservedProvidersUnimplemented(): {
  ok: true;
  reservedProviderKeys: typeof RESERVED_PROVIDER_KEYS;
} {
  const set = createReservedProviderSet();
  for (const provider of Object.values(set)) {
    if (provider.implemented !== false) {
      throw new Error(`reserved_provider_must_be_unimplemented:${provider.providerKey}`);
    }
  }
  if (
    EARNED_VALUE_IMPLEMENTED ||
    CPM_SCHEDULING_IMPLEMENTED ||
    COST_ENGINE_IMPLEMENTED ||
    BUDGET_LEDGER_IMPLEMENTED ||
    SCHEDULE_EXECUTION_IMPLEMENTED ||
    FORECASTING_IMPLEMENTED ||
    CHANGE_CONTROL_IMPLEMENTED ||
    PRODUCTIVITY_ANALYSIS_IMPLEMENTED
  ) {
    throw new Error("reserved_capability_flag_flipped_without_certification");
  }
  return { ok: true, reservedProviderKeys: RESERVED_PROVIDER_KEYS };
}
