/**
 * Phase 11D — reserved Project Controls provider interfaces.
 *
 * These are *shapes only*. Schedule Intelligence (11C) is advisory evidence
 * assessment — it is NOT the ScheduleProvider below. ScheduleProvider covers
 * CPM primitives (baseline, activity network, critical path) and every factory
 * returns an implementation whose every method throws `not_implemented`.
 *
 * Likewise, Change Intelligence (11D) is NOT the ChangeProvider below.
 * `ChangeIntelligenceEngine` produces advisory assessments; `ChangeProvider`
 * models the contractual/product change-control surface (raise, price, approve,
 * execute a change) and stays unimplemented.
 *
 * If a future phase implements one of these, it must flip the corresponding
 * `*_IMPLEMENTED` flag in `version.ts` and add its own certification gates.
 */

import {
  BUDGET_LEDGER_IMPLEMENTED,
  CHANGE_CONTROL_IMPLEMENTED,
  CHANGE_EXECUTION_IMPLEMENTED,
  CONTINGENCY_MANAGEMENT_IMPLEMENTED,
  COST_ENGINE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  DECISIONING_IMPLEMENTED,
  DECISION_ENGINE_IMPLEMENTED,
  DECISION_EXECUTION_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  PRODUCTIVITY_ANALYSIS_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";
import {
  BASELINE_PROVIDER_IMPLEMENTED,
  createReservedBaselineProvider,
  type BaselineProvider,
} from "./baseline-provider";
import type { ProjectScopeRef } from "./progress";

export const RESERVED_PROVIDER_KEYS = [
  "schedule",
  "cost",
  "earned_value",
  "forecast",
  "decision",
  "change",
  "productivity",
  "contingency",
  "baseline",
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
  /** Critical path is reserved. 11C Schedule Intelligence never computes float or a longest path. */
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

/**
 * Autonomous decision execution engine. Distinct from Decision Support Intelligence:
 * these methods produce binding completion/cost decisions, none of which Project
 * Controls may do autonomously.
 */
export type DecisionProvider = {
  readonly providerKey: "decision";
  readonly implemented: false;
  getCompletionDecision(query: ReservedProviderQuery): Promise<never>;
  getCostDecision(query: ReservedProviderQuery): Promise<never>;
};

/**
 * Contractual / product change control. Distinct from Change Intelligence:
 * these methods raise, price, approve and execute a change instrument, none of
 * which Project Controls may do.
 */
export type ChangeProvider = {
  readonly providerKey: "change";
  readonly implemented: false;
  listChangeEvents(query: ReservedProviderQuery): Promise<never>;
  getChangeImpact(query: ReservedProviderQuery): Promise<never>;
  approveContractualChange(query: ReservedProviderQuery): Promise<never>;
  executeChange(query: ReservedProviderQuery): Promise<never>;
  priceChange(query: ReservedProviderQuery): Promise<never>;
};

export type ContingencyProvider = {
  readonly providerKey: "contingency";
  readonly implemented: false;
  getContingencyBalance(query: ReservedProviderQuery): Promise<never>;
  drawContingency(query: ReservedProviderQuery): Promise<never>;
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
  decision: DecisionProvider;
  change: ChangeProvider;
  productivity: ProductivityProvider;
  contingency: ContingencyProvider;
  baseline: BaselineProvider;
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

export function createReservedDecisionProvider(): DecisionProvider {
  return {
    providerKey: "decision",
    implemented: false,
    getCompletionDecision: async () => reject("decision", "getCompletionDecision"),
    getCostDecision: async () => reject("decision", "getCostDecision"),
  };
}

export function createReservedChangeProvider(): ChangeProvider {
  return {
    providerKey: "change",
    implemented: false,
    listChangeEvents: async () => reject("change", "listChangeEvents"),
    getChangeImpact: async () => reject("change", "getChangeImpact"),
    approveContractualChange: async () => reject("change", "approveContractualChange"),
    executeChange: async () => reject("change", "executeChange"),
    priceChange: async () => reject("change", "priceChange"),
  };
}

export function createReservedContingencyProvider(): ContingencyProvider {
  return {
    providerKey: "contingency",
    implemented: false,
    getContingencyBalance: async () => reject("contingency", "getContingencyBalance"),
    drawContingency: async () => reject("contingency", "drawContingency"),
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
    decision: createReservedDecisionProvider(),
    change: createReservedChangeProvider(),
    productivity: createReservedProductivityProvider(),
    contingency: createReservedContingencyProvider(),
    baseline: createReservedBaselineProvider(),
  };
}

/** Every reserved provider must stay unimplemented for Phase 11D to certify. CPM stays false. */
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
    DECISIONING_IMPLEMENTED ||
    DECISION_ENGINE_IMPLEMENTED ||
    DECISION_EXECUTION_IMPLEMENTED ||
    CHANGE_CONTROL_IMPLEMENTED ||
    CHANGE_EXECUTION_IMPLEMENTED ||
    CONTINGENCY_MANAGEMENT_IMPLEMENTED ||
    FINANCIAL_POSTING_IMPLEMENTED ||
    BASELINE_PROVIDER_IMPLEMENTED ||
    PRODUCTIVITY_ANALYSIS_IMPLEMENTED
  ) {
    throw new Error("reserved_capability_flag_flipped_without_certification");
  }
  return { ok: true, reservedProviderKeys: RESERVED_PROVIDER_KEYS };
}
