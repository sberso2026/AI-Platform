/**
 * Phase 12A — locked Digital Twin terminology.
 * See `docs/architecture/DIGITAL_TWIN_TERMINOLOGY.md`.
 */

export const LOCKED_TERMS = {
  DigitalTwin: "A module-owned representation bound to exactly one canonical entity reference",
  TwinTargetReference:
    "Stable pointer to canonical asset, project, location, or system identity — not owned by Twin",
  TwinRepresentationReference:
    "Module-owned config for geometry, fidelity level, and scenario binding for one Twin",
  TwinState: "Derived snapshot of twin-relevant attributes — not canonical register state",
  DigitalThread:
    "Provenance chain linking evidence, models, simulations, and observations to a Twin",
  FidelityLevel: "L0–L5 classification of representation richness — reserved in 12A",
  SensorStreamReference: "SHM-owned live stream pointer consumed by Twin — not duplicated",
  TelemetryEventReference:
    "Kernel telemetry plane event pointer — Twin must not create a second ingestion plane",
} as const;

export type LockedTermKey = keyof typeof LOCKED_TERMS;

export const TWIN_STATE_CATEGORIES = [
  "observed",
  "derived",
  "simulated",
  "declared",
  "unavailable",
] as const;

export type TwinStateCategory = (typeof TWIN_STATE_CATEGORIES)[number];

export const TEMPORAL_MODEL = {
  validTime: "When the real-world state was true",
  transactionTime: "When the platform recorded the state",
  asOfQuery: "Point-in-time read against twin state history — not implemented in 12A",
} as const;
