import {
  DEFAULT_EU_CONCRETE_CARBON_FACTOR,
  DEFAULT_EU_CONCRETE_COST_RATE,
  DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR,
  EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
} from "@rtb/types";

export const EU_CONCRETE_MATERIAL_CATALOG = {
  ready: true,
  populated: false,
  defaultNationalCatalog: null,
  entries: [] as const,
};

export const EU_REINFORCEMENT_CATALOG = {
  ready: true,
  populated: false,
  defaultNationalCatalog: null,
  entries: [] as const,
};

export const EU_CONCRETE_MTO_BOUNDARY = {
  ready: true,
  defaultCostRate: DEFAULT_EU_CONCRETE_COST_RATE,
  defaultConcreteCarbonFactor: DEFAULT_EU_CONCRETE_CARBON_FACTOR,
  defaultReinforcementCarbonFactor: DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR,
} as const;

export function resolveEuConcreteCatalogGrade(designation: string): never {
  if (EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES) {
    throw new Error("EU concrete grade must not generate properties");
  }
  throw new Error(`EU concrete standard context fail closed: missing material; catalog unpopulated for ${designation}`);
}

export function resolveEuReinforcementCatalog(designation: string): never {
  throw new Error(`EU concrete standard context fail closed: missing reinforcement material; catalog unpopulated for ${designation}`);
}
