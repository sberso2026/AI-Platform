import { AU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES } from "@rtb/types";

export const AU_CONCRETE_MATERIAL_CATALOG = {
  ready: true,
  populated: false,
  entries: [] as const,
};

export const AU_REINFORCEMENT_CATALOG = {
  ready: true,
  populated: false,
  entries: [] as const,
};

export function resolveAuConcreteCatalogGrade(designation: string): never {
  if (AU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES) {
    throw new Error("AU concrete grade must not generate properties");
  }
  throw new Error(`AU concrete flexure fail closed: missing material; catalog unpopulated for ${designation}`);
}

export function resolveAuReinforcementCatalog(designation: string): never {
  throw new Error(`AU concrete flexure fail closed: missing reinforcement material; catalog unpopulated for ${designation}`);
}
