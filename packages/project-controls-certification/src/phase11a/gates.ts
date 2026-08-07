/**
 * Phase 11A certification gates A–AE (Project Controls Discovery).
 * 31 gates: A–Z (26) + AA–AE (5).
 *
 * Discovery scale: most gates are file/declaration gates. There is no hosted
 * database, no HTTP surface and no browser evidence, because Phase 11A ships
 * no Project Controls product.
 */
export const PHASE_11A_PROJECT_CONTROLS_DISCOVERY_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Asset Intelligence V1 tag intact"],
  ["C", "PI v1 integrity"],
  ["D", "II v1 integrity"],
  ["E", "Ownership lock documented"],
  ["F", "Existing footprint inventory complete"],
  ["G", "No Project Controls product engines or services"],
  ["H", "No Project Controls product SQL tables"],
  ["I", "No Project Controls product UI page"],
  ["J", "Domain model discovery document"],
  ["K", "Ownership matrix document"],
  ["L", "Boundary map document"],
  ["M", "productionProjectControlsReady is false"],
  ["N", "Version 0.1.0-discovery"],
  ["O", "Module registry still coming_soon"],
  ["P", "Commerce entitlements remain entitlement-only"],
  ["Q", "No earned value implementation"],
  ["R", "No CPM implementation"],
  ["S", "No cost engine implementation"],
  ["T", "No schedule execution implementation"],
  ["U", "Asset Intelligence V1 contracts unmodified"],
  ["V", "Secret exposure"],
  ["W", "Artifact identity"],
  ["X", "Discovery package exists"],
  ["Y", "Certification package exists"],
  ["Z", "No duplicate asset ownership introduced"],
  ["AA", "No canonical lifecycle mutation"],
  ["AB", "No Core Risk auto-mutation by Project Controls"],
  ["AC", "Phase 11B readiness"],
  ["AD", "Discovery release eligibility"],
  ["AE", "Asset Intelligence V1 tag not moved"],
] as const;

export type Phase11aGateId = (typeof PHASE_11A_PROJECT_CONTROLS_DISCOVERY_GATES)[number][0];

export const PHASE_11A_GATE_COUNT = PHASE_11A_PROJECT_CONTROLS_DISCOVERY_GATES.length;

export const PHASE_11A_PROJECT_CONTROLS_VERSION = "0.1.0-discovery" as const;
export const PHASE_11A_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
