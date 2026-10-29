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
    status: "future",
    description:
      "Simulation-ready context may be declared on TwinSimulationDefinition — representation must not auto-promote to L4 or claim physical truth",
  },
  {
    level: "L5",
    name: "Live-sync",
    status: "unavailable",
    description: "Full live-sync fidelity — not auto-promoted from representation mapping or simulation",
  },
] as const;

/**
 * Representation may declare L0–L3 fidelity only.
 * Simulation-ready context is declared on TwinSimulationDefinition separately —
 * do not force this assert to treat simulation fidelity as physical truth.
 */
export function assertRepresentationFidelityDeclared(level: FidelityLevel): void {
  if (level === "L4" || level === "L5") {
    throw new Error("representation_may_not_claim_simulation_or_live_sync_fidelity");
  }
}

/** Simulation definitions may declare simulation-ready context without representation L4 promotion. */
export function declareSimulationReadyContext(): {
  simulationReadyContextDeclared: true;
  representationAutoPromotedToL4: false;
  claimsPhysicalTruth: false;
} {
  return {
    simulationReadyContextDeclared: true,
    representationAutoPromotedToL4: false,
    claimsPhysicalTruth: false,
  };
}

export function getFidelityDescriptor(level: FidelityLevel): FidelityLevelDescriptor {
  const found = FIDELITY_MODEL.find((entry) => entry.level === level);
  if (!found) throw new Error(`unknown_fidelity_level:${level}`);
  return found;
}

export function assertFidelityNotImplemented(): { ok: true; maxAvailableLevel: "L0" } {
  return { ok: true, maxAvailableLevel: "L0" };
}
