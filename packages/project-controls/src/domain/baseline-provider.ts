/**
 * Phase 11D — reserved BaselineProvider.
 *
 * A baseline is the frozen reference a change is measured against. Measuring a
 * change against a baseline requires a cost engine, a schedule network, or both
 * — none of which exist. This is an interface shape only: every method throws
 * `not_implemented`.
 *
 * Change Intelligence deliberately does not consume a baseline. It reports what
 * evidence says about a change; it does not quantify a deviation from a frozen
 * plan.
 */

import type { ProjectScopeRef } from "./progress";

export const BASELINE_PROVIDER_KEY = "baseline" as const;
export const BASELINE_PROVIDER_IMPLEMENTED = false as const;

export type BaselineProviderQuery = {
  tenantId: string;
  workspaceId: string;
  scope: ProjectScopeRef;
  asOf?: string;
};

export class BaselineNotImplementedError extends Error {
  readonly code = "not_implemented" as const;
  readonly providerKey = BASELINE_PROVIDER_KEY;
  constructor(readonly capability: string) {
    super(`not_implemented:${BASELINE_PROVIDER_KEY}.${capability}`);
    this.name = "BaselineNotImplementedError";
  }
}

export type BaselineProvider = {
  readonly providerKey: "baseline";
  readonly implemented: false;
  getBaseline(query: BaselineProviderQuery): Promise<never>;
  getBaselineVersions(query: BaselineProviderQuery): Promise<never>;
  getBaselineVariance(query: BaselineProviderQuery): Promise<never>;
  rebaseline(query: BaselineProviderQuery): Promise<never>;
};

function reject(capability: string): never {
  throw new BaselineNotImplementedError(capability);
}

export function createReservedBaselineProvider(): BaselineProvider {
  return {
    providerKey: BASELINE_PROVIDER_KEY,
    implemented: false,
    getBaseline: async () => reject("getBaseline"),
    getBaselineVersions: async () => reject("getBaselineVersions"),
    getBaselineVariance: async () => reject("getBaselineVariance"),
    rebaseline: async () => reject("rebaseline"),
  };
}

export function assertBaselineProviderUnimplemented(): {
  ok: true;
  providerKey: "baseline";
  implemented: false;
} {
  const provider = createReservedBaselineProvider();
  if (provider.implemented !== false || BASELINE_PROVIDER_IMPLEMENTED !== false) {
    throw new Error("baseline_provider_must_stay_unimplemented");
  }
  return { ok: true, providerKey: BASELINE_PROVIDER_KEY, implemented: false };
}
