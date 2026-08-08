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
    description:
      "Anchors and bounding references via TwinSpatialReference — not full BIM/CAD; Phase 12F maps refs only",
  },
  {
    level: "L4",
    name: "Simulation-ready",
    status: "unavailable",
    description:
      "Scenario bindings — simulation execution forbidden; representation must not claim L4 fidelity",
  },
  {
    level: "L5",
    name: "Live-sync",
    status: "unavailable",
    description: "Full live-sync fidelity — not auto-promoted from representation mapping",
  },
] as const;

/** Representation may declare fidelity; must not auto-promote or claim simulation fidelity. */
export function assertRepresentationFidelityDeclared(level: FidelityLevel): void {
  if (level === "L4" || level === "L5") {
    throw new Error("representation_may_not_claim_simulation_or_live_sync_fidelity");
  }
}

export function getFidelityDescriptor(level: FidelityLevel): FidelityLevelDescriptor {
  const found = FIDELITY_MODEL.find((entry) => entry.level === level);
  if (!found) throw new Error(`unknown_fidelity_level:${level}`);
  return found;
}

export function assertFidelityNotImplemented(): { ok: true; maxAvailableLevel: "L0" } {
  return { ok: true, maxAvailableLevel: "L0" };
}
