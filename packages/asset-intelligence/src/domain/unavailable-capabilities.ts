/**
 * Phase 10K — machine-readable matrix of what Asset Intelligence V1.0 does NOT do.
 *
 * This exists so the answer to "does it predict?" is a data structure rather
 * than a sales conversation. Every entry is backed by a false flag in version.ts.
 */

import {
  ASSET_INTELLIGENCE_VERSION,
  ACCURACY_CLAIMS_CERTIFIED,
  CMMS_WORK_ORDER_OWNERSHIP,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
  PREDICTIVE_METHODS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  QUANTITATIVE_RELIABILITY_CERTIFIED,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  RUL_CLAIMS_CERTIFIED,
  SOURCE_TRUST_MODEL_READY,
} from "../version";

export type UnavailabilityKind = "unavailable" | "reserved";

export type UnavailableCapabilityEntry = {
  capabilityId: string;
  label: string;
  kind: UnavailabilityKind;
  /** The version.ts flag that keeps this closed. */
  governingFlag: string;
  flagValue: boolean | string;
  userFacingLabel: string;
  reason: string;
  owner: string | null;
};

export const ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES: readonly UnavailableCapabilityEntry[] = [
  {
    capabilityId: "asset_intelligence.predictive_execution",
    label: "Predictive execution",
    kind: "unavailable",
    governingFlag: "PRODUCTION_PREDICTIVE_EXECUTION_ENABLED",
    flagValue: PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason:
      "V1.0 governs predictive objectives and methods but never executes one; no predicted value is produced, stored or emitted.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.probability_of_failure",
    label: "Probability of Failure (PoF)",
    kind: "unavailable",
    governingFlag: "PROBABILITY_OF_FAILURE_CERTIFIED",
    flagValue: PROBABILITY_OF_FAILURE_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason:
      "PoF is a registered predictive objective that is permanently not-ready in V1.0. No PoF number is computed or displayed.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.remaining_useful_life",
    label: "Remaining Useful Life (RUL)",
    kind: "unavailable",
    governingFlag: "RUL_CLAIMS_CERTIFIED",
    flagValue: RUL_CLAIMS_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason:
      "RUL is a registered predictive objective that is permanently not-ready in V1.0. No RUL estimate is computed or displayed.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.predictive_ml",
    label: "Machine-learning predictive methods",
    kind: "unavailable",
    governingFlag: "PREDICTIVE_ML_ENABLED",
    flagValue: PREDICTIVE_ML_ENABLED,
    userFacingLabel: "UNAVAILABLE — suspended from execution in V1.0",
    reason:
      "ML methods are registered and suspended. ML is not privileged over physics or statistical methods.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.certified_predictive_methods",
    label: "Certified predictive methods",
    kind: "unavailable",
    governingFlag: "PREDICTIVE_METHODS_CERTIFIED",
    flagValue: PREDICTIVE_METHODS_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — no method is certified in V1.0",
    reason:
      "Qualification against fixtures is not certification. No method carries a certified accuracy claim.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.accuracy_claims",
    label: "Accuracy claims",
    kind: "unavailable",
    governingFlag: "ACCURACY_CLAIMS_CERTIFIED",
    flagValue: ACCURACY_CLAIMS_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — no accuracy claim is certified in V1.0",
    reason: "V1.0 publishes evidence, confidence and provenance, never an accuracy guarantee.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.quantitative_reliability",
    label: "Quantitative reliability (MTBF/failure rate)",
    kind: "reserved",
    governingFlag: "QUANTITATIVE_RELIABILITY_CERTIFIED",
    flagValue: QUANTITATIVE_RELIABILITY_CERTIFIED,
    userFacingLabel: "RESERVED — qualitative reliability only in V1.0",
    reason: "Reliability intelligence in V1.0 is qualitative and evidence-bounded.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.source_trust_model",
    label: "Source trust model",
    kind: "reserved",
    governingFlag: "SOURCE_TRUST_MODEL_READY",
    flagValue: SOURCE_TRUST_MODEL_READY,
    userFacingLabel: "RESERVED — modelled but not implemented in V1.0",
    reason: "Fusion uses explicit reconciliation rules, not a learned trust weighting.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.predictive_health_contribution",
    label: "Predictive contribution to Asset Health",
    kind: "unavailable",
    governingFlag: "PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED",
    flagValue: PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
    userFacingLabel: "UNAVAILABLE — health is composed from condition evidence only",
    reason:
      "Criticality, failure, degradation, lifecycle, risk, priority, fusion and predictive governance are all excluded from the health index.",
    owner: null,
  },
  {
    capabilityId: "asset_intelligence.core_risk_mutation",
    label: "Automatic canonical Risk mutation",
    kind: "unavailable",
    governingFlag: "RISK_CORE_AUTO_MUTATION_ALLOWED",
    flagValue: RISK_CORE_AUTO_MUTATION_ALLOWED,
    userFacingLabel: "UNAVAILABLE — risk signals are advisory",
    reason: "Canonical Engineering Risk is owned by Engineering Core and never auto-mutated.",
    owner: "engineering_core",
  },
  {
    capabilityId: "asset_intelligence.cmms_work_order",
    label: "CMMS work order execution",
    kind: "unavailable",
    governingFlag: "CMMS_WORK_ORDER_OWNERSHIP",
    flagValue: CMMS_WORK_ORDER_OWNERSHIP,
    userFacingLabel: "UNAVAILABLE — recommendations only, no work orders",
    reason: "Asset Intelligence recommends maintenance; it does not create or dispatch work.",
    owner: "none_in_asset_intelligence",
  },
  {
    capabilityId: "asset_intelligence.digital_twin",
    label: "Digital Twin",
    kind: "unavailable",
    governingFlag: "ASSET_INTELLIGENCE_OWNERSHIP",
    flagValue: "asset_intelligence",
    userFacingLabel: "UNAVAILABLE — no Digital Twin ownership in V1.0",
    reason: "Digital Twin is out of scope for Asset Intelligence V1.0.",
    owner: null,
  },
] as const;

export function listUnavailableCapabilities(
  kind?: UnavailabilityKind,
): readonly UnavailableCapabilityEntry[] {
  return kind
    ? ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.filter((e) => e.kind === kind)
    : ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES;
}

export function isCapabilityUnavailable(capabilityId: string): boolean {
  return ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.some(
    (e) => e.capabilityId === capabilityId && e.kind === "unavailable",
  );
}

/** Every boolean-governed entry must still be closed. */
export function assertUnavailableCapabilitiesClosed(): {
  ok: true;
  version: string;
  unavailableCount: number;
  reservedCount: number;
} {
  for (const entry of ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES) {
    if (typeof entry.flagValue === "boolean" && entry.flagValue !== false) {
      throw new Error(`unavailable_capability_opened:${entry.capabilityId}`);
    }
    if (!entry.userFacingLabel.startsWith("UNAVAILABLE") && entry.kind === "unavailable") {
      throw new Error(`unavailable_capability_mislabelled:${entry.capabilityId}`);
    }
  }
  return {
    ok: true,
    version: ASSET_INTELLIGENCE_VERSION,
    unavailableCount: listUnavailableCapabilities("unavailable").length,
    reservedCount: listUnavailableCapabilities("reserved").length,
  };
}
