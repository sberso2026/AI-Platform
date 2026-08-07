/**
 * Phase 10A — multi-hierarchy relationship model (architecture lock).
 */

export type HierarchyViewKind =
  | "physical"
  | "functional"
  | "system"
  | "equipment"
  | "component"
  | "location"
  | "process"
  | "maintenance"
  | "inspection"
  | "digital_twin_reference";

export type AssetHierarchyEdge = {
  edgeId: string;
  view: HierarchyViewKind;
  parentAssetId: string;
  childAssetId: string;
  relationshipType: string;
  version: string;
  validFrom: string;
  validTo?: string;
};

/**
 * One canonical asset may participate in many hierarchy views.
 * Do not duplicate the asset row per hierarchy.
 */
export const MULTI_HIERARCHY_RULES = {
  singleCanonicalAssetIdentity: true,
  multipleTypedVersionableViews: true,
  duplicateAssetPerHierarchyForbidden: true,
  examples: [
    "Plant → Area → System → Equipment → Component",
    "Building → Level → Zone → Asset",
    "Bridge → Span → Girder → Connection",
    "Pipeline → System → Segment → Component",
  ],
} as const;
