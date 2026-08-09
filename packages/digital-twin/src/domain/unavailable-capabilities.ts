/**
 * Phase 12N — machine-readable matrix of what Digital Twin V1.0 does NOT do.
 */

import {
  AUTOMATIC_CONTROL_IMPLEMENTED,
  AUTOMATIC_MAPPING_APPROVAL_ENABLED,
  COORDINATE_TRANSFORMATION_IMPLEMENTED,
  DIGITAL_TWIN_VERSION,
  GEOMETRY_REPOSITORY_IMPLEMENTED,
  GIS_RUNTIME_IMPLEMENTED,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  OPTIMIZATION_IMPLEMENTED,
  PHYSICAL_ACTUATION_IMPLEMENTED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
  SHM_IMPLEMENTED,
  SILENT_FIXTURE_FALLBACK_ENABLED,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SPATIAL_ANALYTICS_IMPLEMENTED,
} from "../version";

export type UnavailabilityKind = "unavailable";

export type UnavailableCapabilityEntry = {
  capabilityId: string;
  label: string;
  kind: UnavailabilityKind;
  governingFlag: string;
  flagValue: boolean;
  userFacingLabel: string;
  reason: string;
  owner: string | null;
};

export const DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES: readonly UnavailableCapabilityEntry[] = [
  {
    capabilityId: "digital_twin.physical_actuation",
    label: "Physical actuation",
    kind: "unavailable",
    governingFlag: "PHYSICAL_ACTUATION_IMPLEMENTED",
    flagValue: PHYSICAL_ACTUATION_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Digital Twin never actuates physical equipment.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.automatic_control",
    label: "Automatic control",
    kind: "unavailable",
    governingFlag: "AUTOMATIC_CONTROL_IMPLEMENTED",
    flagValue: AUTOMATIC_CONTROL_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "No closed-loop automatic control in V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.predictive_twin",
    label: "Predictive twin / PoF / RUL",
    kind: "unavailable",
    governingFlag: "PREDICTIVE_TWIN_IMPLEMENTED",
    flagValue: PREDICTIVE_TWIN_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "No predictive twin, PoF, or RUL claims in V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.probability_of_failure",
    label: "Probability of failure claims",
    kind: "unavailable",
    governingFlag: "PROBABILITY_OF_FAILURE_CERTIFIED",
    flagValue: PROBABILITY_OF_FAILURE_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "PoF claims are not certified in Digital Twin V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.rul_claims",
    label: "RUL claims",
    kind: "unavailable",
    governingFlag: "RUL_CLAIMS_CERTIFIED",
    flagValue: RUL_CLAIMS_CERTIFIED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "RUL claims are not certified in Digital Twin V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.native_engineering_solver",
    label: "Native engineering solver",
    kind: "unavailable",
    governingFlag: "NATIVE_ENGINEERING_SOLVER_IMPLEMENTED",
    flagValue: NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Only external CalculiX linear static adapter is certified.",
    owner: "external_engineering_tool",
  },
  {
    capabilityId: "digital_twin.optimization",
    label: "Simulation optimization",
    kind: "unavailable",
    governingFlag: "OPTIMIZATION_IMPLEMENTED",
    flagValue: OPTIMIZATION_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "No optimization engine in V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.shm",
    label: "Structural health monitoring runtime",
    kind: "unavailable",
    governingFlag: "SHM_IMPLEMENTED",
    flagValue: SHM_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "SHM remains outside Digital Twin V1.0.",
    owner: "shm",
  },
  {
    capabilityId: "digital_twin.gis_runtime",
    label: "GIS runtime",
    kind: "unavailable",
    governingFlag: "GIS_RUNTIME_IMPLEMENTED",
    flagValue: GIS_RUNTIME_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "GIS, CRS transforms, and spatial analytics stay outside DT V1.0.",
    owner: "engineering_os_shared_spatial_domain",
  },
  {
    capabilityId: "digital_twin.coordinate_transformation",
    label: "Coordinate transformation",
    kind: "unavailable",
    governingFlag: "COORDINATE_TRANSFORMATION_IMPLEMENTED",
    flagValue: COORDINATE_TRANSFORMATION_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Coordinate transforms are not owned by Digital Twin.",
    owner: "engineering_os_shared_spatial_domain",
  },
  {
    capabilityId: "digital_twin.spatial_analytics",
    label: "Spatial analytics",
    kind: "unavailable",
    governingFlag: "SPATIAL_ANALYTICS_IMPLEMENTED",
    flagValue: SPATIAL_ANALYTICS_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Spatial analytics are outside the V1.0 surface.",
    owner: "engineering_os_shared_spatial_domain",
  },
  {
    capabilityId: "digital_twin.geometry_repository",
    label: "Geometry repository",
    kind: "unavailable",
    governingFlag: "GEOMETRY_REPOSITORY_IMPLEMENTED",
    flagValue: GEOMETRY_REPOSITORY_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "No geometry repository in Digital Twin V1.0.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.automatic_mapping_approval",
    label: "Automatic mapping approval",
    kind: "unavailable",
    governingFlag: "AUTOMATIC_MAPPING_APPROVAL_ENABLED",
    flagValue: AUTOMATIC_MAPPING_APPROVAL_ENABLED,
    userFacingLabel: "UNAVAILABLE — human review required",
    reason: "Representation mapping approval stays human-governed.",
    owner: "human_only",
  },
  {
    capabilityId: "digital_twin.silent_fixture_fallback",
    label: "Silent fixture fallback",
    kind: "unavailable",
    governingFlag: "SILENT_FIXTURE_FALLBACK_ENABLED",
    flagValue: SILENT_FIXTURE_FALLBACK_ENABLED,
    userFacingLabel: "UNAVAILABLE — fail-closed",
    reason: "Real solver requests never silently fall back to fixture.",
    owner: null,
  },
  {
    capabilityId: "digital_twin.silent_solver_fallback",
    label: "Silent solver fallback",
    kind: "unavailable",
    governingFlag: "SILENT_SOLVER_FALLBACK_ALLOWED",
    flagValue: SILENT_SOLVER_FALLBACK_ALLOWED,
    userFacingLabel: "UNAVAILABLE — fail-closed",
    reason: "External solver failures fail closed.",
    owner: null,
  },
] as const;

export function listUnavailableCapabilities(): readonly UnavailableCapabilityEntry[] {
  return DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES;
}

export function isCapabilityUnavailable(capabilityId: string): boolean {
  return DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.some((e) => e.capabilityId === capabilityId);
}

export function assertUnavailableCapabilitiesClosed(): {
  ok: true;
  version: string;
  unavailableCount: number;
} {
  for (const entry of DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES) {
    if (entry.flagValue !== false) {
      throw new Error(`unavailable_capability_opened:${entry.capabilityId}`);
    }
    if (!entry.userFacingLabel.startsWith("UNAVAILABLE")) {
      throw new Error(`unavailable_capability_mislabelled:${entry.capabilityId}`);
    }
  }
  return {
    ok: true,
    version: DIGITAL_TWIN_VERSION,
    unavailableCount: DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.length,
  };
}
