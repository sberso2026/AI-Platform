/**
 * Phase 10K — frozen Asset Intelligence V1.0 capability registry.
 *
 * Maturity is part of the contract, not marketing copy:
 *   ga          — production capability, deterministic/governed output
 *   ga_advisory — production capability whose output is advisory input to a
 *                 human decision; it never mutates canonical Engineering state
 *   reserved    — modelled but deliberately not implemented in V1.0
 *   unavailable — explicitly not a production function of V1.0
 */

import {
  ASSET_INTELLIGENCE_MODULE_KEY,
  ASSET_INTELLIGENCE_VERSION,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  PREDICTIVE_ML_ENABLED,
  RUL_CLAIMS_CERTIFIED,
} from "../version";

export type AssetCapabilityMaturity = "ga" | "ga_advisory" | "reserved" | "unavailable";

export type AssetCapabilityEntry = {
  id: string;
  surface: string;
  maturity: AssetCapabilityMaturity;
  entitlement: string;
  /** V1.0 capabilities never contribute to the Asset Health Index. */
  healthContribution: false;
  /** V1.0 never mutates canonical Engineering OS state from intelligence output. */
  mutatesCanonicalState: false;
  implementationRef: string | null;
  note: string;
};

export const ASSET_INTELLIGENCE_CAPABILITY_CATALOG: readonly AssetCapabilityEntry[] = [
  {
    id: "asset_intelligence.condition",
    surface: "condition",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/engine#assessConditionFromInspection",
    note: "Condition state derived from Inspection Intelligence v1.0.0 public contracts.",
  },
  {
    id: "asset_intelligence.criticality",
    surface: "criticality",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/criticality",
    note: "Criticality is a consequence dimension, never a health factor.",
  },
  {
    id: "asset_intelligence.reliability",
    surface: "reliability",
    maturity: "ga_advisory",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/reliability",
    note: "Qualitative reliability intelligence. No quantitative reliability claim.",
  },
  {
    id: "asset_intelligence.failure",
    surface: "failure",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/failure-engine",
    note: "Failure mode/mechanism/cause intelligence over a governed taxonomy.",
  },
  {
    id: "asset_intelligence.time_series",
    surface: "time_series",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/time-series",
    note: "Engineering time series ingestion and change detection.",
  },
  {
    id: "asset_intelligence.trend_degradation",
    surface: "trend_degradation",
    maturity: "ga_advisory",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/degradation-engine",
    note: "Observed trend and governed degradation analysis. Not a forecast.",
  },
  {
    id: "asset_intelligence.lifecycle",
    surface: "lifecycle",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/lifecycle-engine",
    note: "Lifecycle intelligence only; canonical lifecycle stays in Shared Domain.",
  },
  {
    id: "asset_intelligence.decision_context",
    surface: "decision_context",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/decision-context-engine",
    note: "Non-autonomous composition of intelligence for a human decision.",
  },
  {
    id: "asset_intelligence.risk_signal",
    surface: "risk_signal",
    maturity: "ga_advisory",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/risk-engine",
    note: "Advisory risk signals. Canonical Engineering Risk is never auto-mutated.",
  },
  {
    id: "asset_intelligence.maintenance_recommendation",
    surface: "maintenance_recommendation",
    maturity: "ga_advisory",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/maintenance-recommendation",
    note: "Recommendation only. Asset Intelligence owns no CMMS work order.",
  },
  {
    id: "asset_intelligence.priority",
    surface: "priority",
    maturity: "ga_advisory",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/priority",
    note: "Priority context. No numeric priority score is required or implied.",
  },
  {
    id: "asset_intelligence.fusion",
    surface: "fusion",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/fusion-engine",
    note: "Multi-source fusion and reconciliation with full provenance.",
  },
  {
    id: "asset_intelligence.predictive_governance",
    surface: "predictive_governance",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/predictive-governance",
    note: "Governance of predictive objectives/methods only. Executes nothing.",
  },
  {
    id: "asset_intelligence.health_composition",
    surface: "health",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/health-composer",
    note: "Versioned health composition from condition evidence only.",
  },
  {
    id: "asset_intelligence.evidence_confidence",
    surface: "evidence_confidence",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/evidence-confidence",
    note: "Evidence sufficiency and confidence for every published state.",
  },
  {
    id: "asset_intelligence.timeline",
    surface: "timeline",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/timeline",
    note: "Append-only historical intelligence timeline.",
  },
  {
    id: "asset_intelligence.snapshot",
    surface: "snapshot",
    maturity: "ga",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: "domain/snapshot",
    note: "Composed read view across all GA surfaces.",
  },
  {
    id: "asset_intelligence.source_trust_model",
    surface: "fusion",
    maturity: "reserved",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "Reserved. SOURCE_TRUST_MODEL_READY is false in V1.0.",
  },
  {
    id: "asset_intelligence.quantitative_reliability",
    surface: "reliability",
    maturity: "reserved",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "Reserved. QUANTITATIVE_RELIABILITY_CERTIFIED is false in V1.0.",
  },
  {
    id: "asset_intelligence.predictive_execution",
    surface: "predictive",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. No predictive method executes in V1.0.",
  },
  {
    id: "asset_intelligence.probability_of_failure",
    surface: "predictive",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. PoF is not a production function of V1.0.",
  },
  {
    id: "asset_intelligence.remaining_useful_life",
    surface: "predictive",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. RUL is not a production function of V1.0.",
  },
  {
    id: "asset_intelligence.predictive_ml",
    surface: "predictive",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. Machine-learning predictive methods are suspended.",
  },
  {
    id: "asset_intelligence.cmms_work_order",
    surface: "maintenance_recommendation",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. Work order execution is owned outside Asset Intelligence.",
  },
  {
    id: "asset_intelligence.digital_twin",
    surface: "digital_twin",
    maturity: "unavailable",
    entitlement: "asset_intelligence.read",
    healthContribution: false,
    mutatesCanonicalState: false,
    implementationRef: null,
    note: "UNAVAILABLE. Asset Intelligence claims no Digital Twin ownership.",
  },
] as const;

export const REQUIRED_GA_CAPABILITY_IDS: readonly string[] = [
  "asset_intelligence.condition",
  "asset_intelligence.criticality",
  "asset_intelligence.reliability",
  "asset_intelligence.failure",
  "asset_intelligence.time_series",
  "asset_intelligence.trend_degradation",
  "asset_intelligence.lifecycle",
  "asset_intelligence.decision_context",
  "asset_intelligence.risk_signal",
  "asset_intelligence.maintenance_recommendation",
  "asset_intelligence.priority",
  "asset_intelligence.fusion",
  "asset_intelligence.predictive_governance",
  "asset_intelligence.health_composition",
];

export function listCapabilitiesByMaturity(
  maturity: AssetCapabilityMaturity,
): readonly AssetCapabilityEntry[] {
  return ASSET_INTELLIGENCE_CAPABILITY_CATALOG.filter((c) => c.maturity === maturity);
}

export function getAssetCapability(id: string): AssetCapabilityEntry | undefined {
  return ASSET_INTELLIGENCE_CAPABILITY_CATALOG.find((c) => c.id === id);
}

/**
 * Fails closed if a GA surface disappeared, if anything claims a health
 * contribution, or if an unavailable capability was quietly promoted.
 */
export function assertCapabilityCatalogComplete(): {
  ok: true;
  version: string;
  gaCount: number;
  unavailableCount: number;
} {
  const ids = ASSET_INTELLIGENCE_CAPABILITY_CATALOG.map((c) => c.id);
  if (new Set(ids).size !== ids.length) throw new Error("capability_duplicate_id");

  for (const required of REQUIRED_GA_CAPABILITY_IDS) {
    const entry = getAssetCapability(required);
    if (!entry) throw new Error(`missing_capability:${required}`);
    if (entry.maturity !== "ga" && entry.maturity !== "ga_advisory") {
      throw new Error(`capability_not_ga:${required}`);
    }
  }

  for (const entry of ASSET_INTELLIGENCE_CAPABILITY_CATALOG) {
    if (entry.healthContribution !== false) {
      throw new Error(`capability_health_contribution:${entry.id}`);
    }
    if (entry.mutatesCanonicalState !== false) {
      throw new Error(`capability_mutates_canonical_state:${entry.id}`);
    }
    if (entry.maturity === "unavailable" && entry.implementationRef !== null) {
      throw new Error(`unavailable_capability_has_implementation:${entry.id}`);
    }
  }

  if (PRODUCTION_PREDICTIVE_EXECUTION_ENABLED !== false) {
    throw new Error("capability_predictive_execution_enabled");
  }
  if (PREDICTIVE_ML_ENABLED !== false) throw new Error("capability_predictive_ml_enabled");
  if (PROBABILITY_OF_FAILURE_CERTIFIED !== false) throw new Error("capability_pof_certified");
  if (RUL_CLAIMS_CERTIFIED !== false) throw new Error("capability_rul_certified");

  return {
    ok: true,
    version: ASSET_INTELLIGENCE_VERSION,
    gaCount: ASSET_INTELLIGENCE_CAPABILITY_CATALOG.filter(
      (c) => c.maturity === "ga" || c.maturity === "ga_advisory",
    ).length,
    unavailableCount: listCapabilitiesByMaturity("unavailable").length,
  };
}

export function toCapabilityRegistryRegistrationPayload(
  entry: AssetCapabilityEntry,
  tenantId: string,
) {
  return {
    tenantId,
    moduleKey: ASSET_INTELLIGENCE_MODULE_KEY,
    capabilityId: entry.id,
    version: ASSET_INTELLIGENCE_VERSION,
    maturity: entry.maturity,
    entitlement: entry.entitlement,
    available: entry.maturity === "ga" || entry.maturity === "ga_advisory",
  };
}
