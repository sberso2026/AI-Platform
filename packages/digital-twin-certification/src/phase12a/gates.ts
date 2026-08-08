/**
 * Phase 12A certification gates A–AM (Digital Twin Discovery).
 * 39 gates: A–Z (26) + AA–AM (13).
 *
 * Discovery scale: file/declaration gates only. No hosted database, no HTTP
 * surface, and no browser evidence — Phase 12A ships no Digital Twin product.
 */
export const PHASE_12A_DIGITAL_TWIN_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "PI v1 integrity"],
  ["E", "II v1 integrity"],
  ["F", "Ownership lock documented"],
  ["G", "Existing footprint inventory complete"],
  ["H", "No Digital Twin runtime services"],
  ["I", "No Digital Twin product SQL migrations"],
  ["J", "No Digital Twin product UI enabled"],
  ["K", "Terminology document"],
  ["L", "Ownership matrix document"],
  ["M", "Fidelity model document"],
  ["N", "Digital thread model document"],
  ["O", "Spatial boundary document"],
  ["P", "productionDigitalTwinReady is false"],
  ["Q", "Version 0.1.0-discovery"],
  ["R", "Module registry still coming_soon"],
  ["S", "No live telemetry implementation"],
  ["T", "No simulation execution"],
  ["U", "No 3D viewer"],
  ["V", "Actuation and automatic control disabled"],
  ["W", "Public contracts draft only"],
  ["X", "SHM boundary documented"],
  ["Y", "Asset Intelligence boundary documented"],
  ["Z", "II PI PC boundaries documented"],
  ["AA", "No duplicate asset ownership"],
  ["AB", "No duplicate project ownership"],
  ["AC", "Twin identity model documented"],
  ["AD", "Telemetry ADR no duplicate time-series"],
  ["AE", "Capability matrix document"],
  ["AF", "Discovery overview document"],
  ["AG", "Secret exposure"],
  ["AH", "Artifact identity"],
  ["AI", "Discovery package exists"],
  ["AJ", "Certification package exists"],
  ["AK", "Phase 12B readiness"],
  ["AL", "Discovery release eligibility"],
  ["AM", "Project Controls V1 tag not moved"],
] as const;

export type Phase12aGateId = (typeof PHASE_12A_DIGITAL_TWIN_DISCOVERY_GATES)[number][0];

export const PHASE_12A_GATE_COUNT = PHASE_12A_DIGITAL_TWIN_DISCOVERY_GATES.length;

export const PHASE_12A_DIGITAL_TWIN_VERSION = "0.1.0-discovery" as const;
export const PHASE_12A_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12A_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12A_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12A_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
