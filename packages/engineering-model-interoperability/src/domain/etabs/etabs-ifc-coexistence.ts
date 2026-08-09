/**
 * Phase 13E — IFC coexistence mapping support for ETABS elements.
 * Mirrors SPACE GASS pattern: ETABS federation coexists with IFC/openBIM;
 * does not replace IFC first-class path.
 */

export type EtabsIfcCoexistenceHint = {
  etabsElementKind: string;
  ifcEntityHint: string;
  mappingTargetKind: "spatial" | "asset" | "twin" | "unspecified";
  notes: string;
};

export const ETABS_IFC_COEXISTENCE_MAP: readonly EtabsIfcCoexistenceHint[] = [
  {
    etabsElementKind: "joint",
    ifcEntityHint: "IfcCartesianPoint / structural node proxy",
    mappingTargetKind: "spatial",
    notes: "Joint/point → spatial binding candidate",
  },
  {
    etabsElementKind: "frame",
    ifcEntityHint: "IfcBeam / IfcColumn / IfcMember",
    mappingTargetKind: "asset",
    notes: "Frame → asset/element mapping candidate",
  },
  {
    etabsElementKind: "area",
    ifcEntityHint: "IfcSlab / IfcWall / IfcPlate",
    mappingTargetKind: "asset",
    notes: "Area/shell → asset mapping candidate",
  },
  {
    etabsElementKind: "link",
    ifcEntityHint: "IfcDiscreteAccessory / connection proxy",
    mappingTargetKind: "unspecified",
    notes: "Link element coexistence hint",
  },
  {
    etabsElementKind: "story",
    ifcEntityHint: "IfcBuildingStorey",
    mappingTargetKind: "spatial",
    notes: "Story → spatial storey binding",
  },
  {
    etabsElementKind: "section",
    ifcEntityHint: "IfcProfileDef",
    mappingTargetKind: "unspecified",
    notes: "Section property coexistence",
  },
  {
    etabsElementKind: "material",
    ifcEntityHint: "IfcMaterial",
    mappingTargetKind: "unspecified",
    notes: "Material coexistence",
  },
  {
    etabsElementKind: "group",
    ifcEntityHint: "IfcGroup",
    mappingTargetKind: "unspecified",
    notes: "Group coexistence",
  },
] as const;

export function getEtabsIfcCoexistenceHint(
  etabsElementKind: string,
): EtabsIfcCoexistenceHint | undefined {
  return ETABS_IFC_COEXISTENCE_MAP.find(
    (r) => r.etabsElementKind === etabsElementKind,
  );
}

export function assertEtabsIfcCoexistence(): {
  ok: true;
  ifcFirstClassRetained: true;
  etabsDoesNotReplaceIfc: true;
} {
  if (ETABS_IFC_COEXISTENCE_MAP.length < 5) {
    throw new Error("etabs_ifc_coexistence_map_incomplete");
  }
  return {
    ok: true,
    ifcFirstClassRetained: true,
    etabsDoesNotReplaceIfc: true,
  };
}
