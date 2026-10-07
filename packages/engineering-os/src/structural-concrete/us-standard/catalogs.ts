import {
  DEFAULT_US_CONCRETE_CARBON_FACTOR,
  DEFAULT_US_CONCRETE_COST_RATE,
  DEFAULT_US_REINFORCEMENT_CARBON_FACTOR,
  DEFAULT_US_REINFORCEMENT_COST_RATE,
  US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
} from "@rtb/types";

export const US_CONCRETE_MATERIAL_CATALOG = {
  ready: true,
  populated: false,
  defaultNationalCatalog: null,
  entries: [] as const,
};

export const US_REINFORCEMENT_CATALOG = {
  ready: true,
  populated: false,
  defaultProductTable: null,
  entries: [] as const,
};

export const US_CONCRETE_MTO_BOUNDARY = {
  ready: true,
  defaultCostRate: DEFAULT_US_CONCRETE_COST_RATE,
  defaultReinforcementCostRate: DEFAULT_US_REINFORCEMENT_COST_RATE,
  defaultConcreteCarbonFactor: DEFAULT_US_CONCRETE_CARBON_FACTOR,
  defaultReinforcementCarbonFactor: DEFAULT_US_REINFORCEMENT_CARBON_FACTOR,
} as const;

export function resolveUsConcreteCatalogGrade(designation: string): never {
  if (US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES) {
    throw new Error("US concrete grade must not generate properties");
  }
  throw new Error(`US concrete standard context fail closed: missing material; catalog unpopulated for ${designation}`);
}

export function resolveUsReinforcementCatalog(designation: string): never {
  throw new Error(`US concrete standard context fail closed: missing reinforcement material; catalog unpopulated for ${designation}`);
}
