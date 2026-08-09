/**
 * Phase 12N — frozen Digital Twin V1.0 capability registry.
 *
 * Maturity is part of the contract, not marketing copy:
 *   ga          — production capability
 *   ga_advisory — production capability whose output is advisory / governed
 *   unavailable — explicitly not a production function of V1.0
 */

import {
  AUTOMATIC_CONTROL_IMPLEMENTED,
  GIS_RUNTIME_IMPLEMENTED,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  OPTIMIZATION_IMPLEMENTED,
  PHYSICAL_ACTUATION_IMPLEMENTED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_MODULE_KEY,
  DIGITAL_TWIN_VERSION,
  SHM_IMPLEMENTED,
} from "../version";

export type DigitalTwinCapabilityMaturity = "ga" | "ga_advisory" | "unavailable";

export type DigitalTwinCapabilityEntry = {
  id: string;
  surface: string;
  maturity: DigitalTwinCapabilityMaturity;
  entitlement: string;
  mutatesCanonicalState: false;
  executesInstruction: false;
  implementationRef: string | null;
  note: string;
};

export const DIGITAL_TWIN_CAPABILITY_CATALOG: readonly DigitalTwinCapabilityEntry[] = [
  {
    id: "digital_twin.core",
    surface: "identity",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/twin-engine",
    note: "Twin identity and lookup. Never owns canonical asset/project identity.",
  },
  {
    id: "digital_twin.state",
    surface: "state",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/state-engine",
    note: "Governed twin state with provenance.",
  },
  {
    id: "digital_twin.state_history",
    surface: "snapshot",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/snapshot",
    note: "Snapshots and timeline history.",
  },
  {
    id: "digital_twin.state_ingestion",
    surface: "ingestion",
    maturity: "ga",
    entitlement: "digital_twin.submit",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/state-ingestion-engine",
    note: "Bounded governed ingestion — candidates require review before publish.",
  },
  {
    id: "digital_twin.telemetry_binding",
    surface: "telemetry",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/telemetry-projection-engine",
    note: "Telemetry binding/projection — reuses asset_intelligence time series.",
  },
  {
    id: "digital_twin.representation",
    surface: "representation",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/representation-navigation",
    note: "Representation mapping and navigation. No BIM/CAD authoring.",
  },
  {
    id: "digital_twin.digital_thread",
    surface: "digital_thread",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/digital-thread-intelligence-engine",
    note: "Cross-domain traceability composition — REFERENCES only.",
  },
  {
    id: "digital_twin.simulation_governance",
    surface: "simulation",
    maturity: "ga_advisory",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/simulation-orchestrator",
    note: "Governed simulation framework. Simulated ≠ observed.",
  },
  {
    id: "digital_twin.simulation_assurance",
    surface: "assurance",
    maturity: "ga_advisory",
    entitlement: "digital_twin.review",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/simulation-qualification-eligibility",
    note: "Four-layer qualification. Success ≠ validation ≠ approval.",
  },
  {
    id: "digital_twin.engineering_simulation_integration",
    surface: "solver",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/solvers/calculix-adapter",
    note: "External CalculiX linear static only — fail-closed.",
  },
  {
    id: "digital_twin.solver_capability_registry",
    surface: "capabilities",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/solvers/engineering-solver-capability-registry",
    note: "Query-only multi-provider capability catalog.",
  },
  {
    id: "digital_twin.spatial_binding",
    surface: "spatial",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/spatial-reference",
    note: "Consumes Shared Spatial Domain SpatialReference.id only.",
  },
  {
    id: "digital_twin.review_workflow",
    surface: "workflow",
    maturity: "ga",
    entitlement: "digital_twin.review",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/review-workflow",
    note: "Governed human review with segregation of duties.",
  },
  {
    id: "digital_twin.rls",
    surface: "rls",
    maturity: "ga",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/postgres-repository",
    note: "Tenant and workspace isolation on every persistence table.",
  },
  {
    id: "digital_twin.physical_actuation",
    surface: "actuation",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. physicalActuationImplemented=false.",
  },
  {
    id: "digital_twin.automatic_control",
    surface: "control",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. automaticControlImplemented=false.",
  },
  {
    id: "digital_twin.predictive_twin",
    surface: "prediction",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. predictiveTwinImplemented=false.",
  },
  {
    id: "digital_twin.native_engineering_solver",
    surface: "solver",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. nativeEngineeringSolverImplemented=false.",
  },
  {
    id: "digital_twin.optimization",
    surface: "optimization",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. optimizationImplemented=false.",
  },
  {
    id: "digital_twin.shm",
    surface: "shm",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. shmImplemented=false.",
  },
  {
    id: "digital_twin.gis_runtime",
    surface: "spatial",
    maturity: "unavailable",
    entitlement: "digital_twin.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. gisRuntimeImplemented=false.",
  },
] as const;

export const REQUIRED_GA_CAPABILITY_IDS: readonly string[] = [
  "digital_twin.core",
  "digital_twin.state",
  "digital_twin.state_history",
  "digital_twin.state_ingestion",
  "digital_twin.telemetry_binding",
  "digital_twin.representation",
  "digital_twin.digital_thread",
  "digital_twin.simulation_governance",
  "digital_twin.simulation_assurance",
  "digital_twin.engineering_simulation_integration",
  "digital_twin.solver_capability_registry",
  "digital_twin.spatial_binding",
];

export function listCapabilitiesByMaturity(
  maturity: DigitalTwinCapabilityMaturity,
): readonly DigitalTwinCapabilityEntry[] {
  return DIGITAL_TWIN_CAPABILITY_CATALOG.filter((c) => c.maturity === maturity);
}

export function assertCapabilityCatalogComplete(): {
  ok: true;
  version: string;
  moduleKey: typeof DIGITAL_TWIN_MODULE_KEY;
  count: number;
} {
  const ids = DIGITAL_TWIN_CAPABILITY_CATALOG.map((c) => c.id);
  if (new Set(ids).size !== ids.length) throw new Error("capability_duplicate_id");
  for (const required of REQUIRED_GA_CAPABILITY_IDS) {
    if (!ids.includes(required)) throw new Error(`missing_capability:${required}`);
  }
  for (const entry of DIGITAL_TWIN_CAPABILITY_CATALOG) {
    if (entry.mutatesCanonicalState !== false) {
      throw new Error(`capability_mutates_canonical:${entry.id}`);
    }
    if (entry.executesInstruction !== false) {
      throw new Error(`capability_executes_instruction:${entry.id}`);
    }
  }
  if (PHYSICAL_ACTUATION_IMPLEMENTED || AUTOMATIC_CONTROL_IMPLEMENTED) {
    throw new Error("actuation_or_control_opened");
  }
  if (
    PREDICTIVE_TWIN_IMPLEMENTED ||
    NATIVE_ENGINEERING_SOLVER_IMPLEMENTED ||
    OPTIMIZATION_IMPLEMENTED ||
    SHM_IMPLEMENTED ||
    GIS_RUNTIME_IMPLEMENTED
  ) {
    throw new Error("forbidden_capability_opened");
  }
  return {
    ok: true,
    version: DIGITAL_TWIN_VERSION,
    moduleKey: DIGITAL_TWIN_MODULE_KEY,
    count: DIGITAL_TWIN_CAPABILITY_CATALOG.length,
  };
}
