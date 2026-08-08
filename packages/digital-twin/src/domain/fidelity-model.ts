/**
 * Phase 12A — fidelity model L0–L5 (reserved / future / unavailable).
 * See `docs/architecture/DIGITAL_TWIN_FIDELITY_MODEL.md`.
 */

export const FIDELITY_LEVELS = ["L0", "L1", "L2", "L3", "L4", "L5"] as const;
export type FidelityLevel = (typeof FIDELITY_LEVELS)[number];

export type FidelityLevelDescriptor = {
  level: FidelityLevel;
  name: string;
  status: "reserved" | "future" | "unavailable";
  description: string;
};

export const FIDELITY_MODEL: readonly FidelityLevelDescriptor[] = [
  {
    level: "L0",
    name: "Reference",
    status: "reserved",
    description: "Identifier-only twin binding to canonical entity — closest to kernel registry",
  },
  {
    level: "L1",
    name: "Tabular",
    status: "future",
    description: "Attribute snapshots and status history without geometry",
  },
  {
    level: "L2",
    name: "Graph-linked",
    status: "future",
    description: "KG-linked relationships and typed edges — consumes existing KG",
  },
  {
    level: "L3",
    name: "Spatial-lite",
    status: "future",
    description: "Anchors and bounding references — not full BIM/CAD",
  },
  {
    level: "L4",
    name: "Simulation-ready",
    status: "unavailable",
    description: "Scenario bindings — simulation execution forbidden in Phase 12A",
  },
  {
    level: "L5",
    name: "Live-sync",
    status: "unavailable",
    description: "Telemetry-bound state — live ingestion forbidden in Phase 12A",
  },
] as const;

export function getFidelityDescriptor(level: FidelityLevel): FidelityLevelDescriptor {
  const found = FIDELITY_MODEL.find((entry) => entry.level === level);
  if (!found) throw new Error(`unknown_fidelity_level:${level}`);
  return found;
}

export function assertFidelityNotImplemented(): { ok: true; maxAvailableLevel: "L0" } {
  return { ok: true, maxAvailableLevel: "L0" };
}
