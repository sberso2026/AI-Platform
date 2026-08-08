/**
 * Phase 12B — Typed twin relationships.
 *
 * Persisted in module tables; also documented for KG reuse via has_digital_twin
 * and typed edges through Platform KG — no new graph engine.
 */

export const TWIN_RELATIONSHIP_TYPES = [
  "represents",
  "contains",
  "connected_to",
  "monitored_by",
  "references",
  "derived_from",
] as const;

export type TwinRelationshipType = (typeof TWIN_RELATIONSHIP_TYPES)[number];

export const KG_EDGE_REUSE = {
  hasDigitalTwin: "has_digital_twin",
  representsEntity: "represents_entity",
  containsComponent: "contains_component",
  connectedTo: "connected_to",
  monitoredBy: "monitored_by",
  derivedFrom: "derived_from",
  hasRepresentationSource: "has_representation_source",
  mapsToRepresentationElement: "maps_to_representation_element",
  spatiallyAnchoredAt: "spatially_anchored_at",
  hasSimulationDefinition: "has_simulation_definition",
  hasSimulationScenario: "has_simulation_scenario",
  producedSimulationResult: "produced_simulation_result",
  hasSimulatedState: "has_simulated_state",
} as const;

export type TwinRelationship = {
  relationshipId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  relationshipType: TwinRelationshipType;
  /** Target entity or twin reference */
  targetRef: string;
  targetKind: "twin" | "canonical_entity" | "external_ref";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  /** KG reuse documented — relationships also surface via Platform KG edges */
  knowledgeGraphReuse: true;
  newGraphEngineIntroduced: false;
};
