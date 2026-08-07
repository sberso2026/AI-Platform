/**
 * Phase 10K — frozen Asset Intelligence V1.0 public event contract families.
 *
 * Families are the public surface. Individual event names inside a family are
 * enumerated in domain/events.ts; the family + version pair is what external
 * consumers may depend on. No V1.0 event carries a predicted value.
 */

import { ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION } from "../version";
import { ASSET_INTELLIGENCE_EVENTS } from "./events";

export type AssetEventFamilyId =
  | "engineering.asset.condition"
  | "engineering.asset.criticality"
  | "engineering.asset.reliability"
  | "engineering.asset.failure"
  | "engineering.asset.time_series"
  | "engineering.asset.trend"
  | "engineering.asset.degradation"
  | "engineering.asset.health"
  | "engineering.asset.lifecycle"
  | "engineering.asset.decision_context"
  | "engineering.asset.risk_signal"
  | "engineering.asset.maintenance_recommendation"
  | "engineering.asset.priority"
  | "engineering.asset.fusion"
  | "engineering.asset.predictive_readiness"
  | "engineering.asset.predictive_governance"
  | "engineering.asset.intelligence_timeline";

export type AssetEventContract = {
  familyId: AssetEventFamilyId;
  contractVersion: typeof ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION;
  namePrefixes: readonly string[];
  tenantIsolated: true;
  workspaceIsolated: true;
  /** No V1.0 event payload contains a predicted value. */
  containsPredictionOutput: false;
  /** No V1.0 event mutates canonical Engineering OS state on consumption. */
  mutatesCanonicalStateOnConsume: false;
  advisoryOnly: boolean;
};

const BASE = {
  contractVersion: ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
  tenantIsolated: true,
  workspaceIsolated: true,
  containsPredictionOutput: false,
  mutatesCanonicalStateOnConsume: false,
} as const;

export const ASSET_INTELLIGENCE_EVENT_CONTRACTS: readonly AssetEventContract[] = [
  { ...BASE, familyId: "engineering.asset.condition", namePrefixes: ["engineering.asset.condition."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.criticality", namePrefixes: ["engineering.asset.criticality."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.reliability", namePrefixes: ["engineering.asset.reliability."], advisoryOnly: true },
  {
    ...BASE,
    familyId: "engineering.asset.failure",
    namePrefixes: [
      "engineering.asset.failure.",
      "engineering.asset.failure_mode.",
      "engineering.asset.failure_mechanism.",
      "engineering.asset.failure_cause.",
    ],
    advisoryOnly: false,
  },
  { ...BASE, familyId: "engineering.asset.time_series", namePrefixes: ["engineering.asset.time_series.", "engineering.asset.change."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.trend", namePrefixes: ["engineering.asset.trend."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.degradation", namePrefixes: ["engineering.asset.degradation."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.health", namePrefixes: ["engineering.asset.health.", "engineering.asset.health_index.", "engineering.asset.evidence_confidence."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.lifecycle", namePrefixes: ["engineering.asset.lifecycle."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.decision_context", namePrefixes: ["engineering.asset.decision_context."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.risk_signal", namePrefixes: ["engineering.asset.risk_signal.", "engineering.asset.risk_candidate."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.maintenance_recommendation", namePrefixes: ["engineering.asset.maintenance_recommendation."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.priority", namePrefixes: ["engineering.asset.priority."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.asset.fusion", namePrefixes: ["engineering.asset.fusion.", "engineering.asset.reconciliation."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.asset.predictive_readiness", namePrefixes: ["engineering.asset.predictive_readiness."], advisoryOnly: true },
  {
    ...BASE,
    familyId: "engineering.asset.predictive_governance",
    namePrefixes: [
      "engineering.asset.predictive_objective_readiness.",
      "engineering.asset.predictive_method_candidate.",
      "engineering.asset.predictive_method_qualification.",
    ],
    advisoryOnly: true,
  },
  { ...BASE, familyId: "engineering.asset.intelligence_timeline", namePrefixes: ["engineering.asset.intelligence_timeline."], advisoryOnly: false },
] as const;

export function getAssetEventContract(
  familyId: AssetEventFamilyId,
): AssetEventContract | undefined {
  return ASSET_INTELLIGENCE_EVENT_CONTRACTS.find((c) => c.familyId === familyId);
}

export function resolveEventFamily(eventName: string): AssetEventFamilyId | undefined {
  return ASSET_INTELLIGENCE_EVENT_CONTRACTS.find((c) =>
    c.namePrefixes.some((prefix) => eventName.startsWith(prefix)),
  )?.familyId;
}

/**
 * Every emitted event must belong to exactly one frozen family, and no family
 * may claim a prediction payload.
 */
export function assertEventContractsFrozen(): {
  ok: true;
  familyCount: number;
  eventCount: number;
  contractVersion: string;
} {
  for (const contract of ASSET_INTELLIGENCE_EVENT_CONTRACTS) {
    if (contract.contractVersion !== ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION) {
      throw new Error(`event_contract_version_drift:${contract.familyId}`);
    }
    if (contract.containsPredictionOutput !== false) {
      throw new Error(`event_contract_prediction_output:${contract.familyId}`);
    }
    if (contract.mutatesCanonicalStateOnConsume !== false) {
      throw new Error(`event_contract_mutates_canonical:${contract.familyId}`);
    }
  }

  const unmapped = ASSET_INTELLIGENCE_EVENTS.filter((name) => !resolveEventFamily(name));
  if (unmapped.length > 0) {
    throw new Error(`event_without_contract_family:${unmapped[0]}`);
  }

  return {
    ok: true,
    familyCount: ASSET_INTELLIGENCE_EVENT_CONTRACTS.length,
    eventCount: ASSET_INTELLIGENCE_EVENTS.length,
    contractVersion: ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
  };
}
