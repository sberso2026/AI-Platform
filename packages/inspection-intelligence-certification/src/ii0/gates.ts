/**
 * II-0 next-gen certification identifiers.
 * Historical Phase 9A–9K evidence remains immutable and is not renamed.
 */
export const II_0_CERTIFICATION_PHASE = "II-0" as const;
export const II_0_BUILDS_ON_HISTORICAL_PHASES = "9A-9K" as const;
export const II_0_HISTORICAL_V1_TAG = "inspection-intelligence-v1.0.0" as const;
export const II_0_HISTORICAL_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const II_0_NEXT_GEN_RELEASE_STATUS = "unreleased" as const;

export const II_0_NEXT_GEN_FOUNDATION_GATES = [
  ["A", "Historical V1 identity preserved"],
  ["B", "Canonical ownership freeze"],
  ["C", "Architecture guardrails"],
  ["D", "Platform reuse lock"],
  ["E", "V1 engine preservation"],
  ["F", "Catalog/commerce reconciliation"],
  ["G", "No standalone II licensing"],
  ["H", "No Business OS entitlement"],
  ["I", "Next-gen surfaces defined not implemented"],
  ["J", "No schema change"],
  ["K", "Historical 9A-9K evidence retained"],
] as const;

export type Ii0GateId = (typeof II_0_NEXT_GEN_FOUNDATION_GATES)[number][0];
