import { AUST300_EU_DEFAULT, AUST300_GLOBAL_DEFAULT, EU1_LOAD_COMBINATION_ENGINE_CREATED } from "@rtb/types";
import { LOAD_FACTOR_PACK_INTERFACES } from "../../structural-demand/combine";

export const EU_SECTION_CATALOG_ADAPTER = {
  ready: true,
  implemented: false,
  defaultCatalog: null,
  aust300Default: false,
  europeanCatalogBound: false,
} as const;

export const EU_MATERIAL_SOURCE_BOUNDARY = {
  en1993IsUniversalMaterialSource: false,
  allowedSources: ["MATERIAL_STANDARD", "PRODUCT_STANDARD", "SECTION_CATALOGUE", "PROJECT_SPECIFICATION"] as const,
  designValuesPopulated: false,
} as const;

export const EU_STANDARD_SOURCE_REFERENCES = [] as const;

export function assertAust300NotEuDefault(catalogSource: string | null | undefined): void {
  if (AUST300_EU_DEFAULT || AUST300_GLOBAL_DEFAULT) {
    throw new Error("AUST300 must not be the EU or global section default");
  }
  if (EU_SECTION_CATALOG_ADAPTER.defaultCatalog === "AUST300" || EU_SECTION_CATALOG_ADAPTER.aust300Default) {
    throw new Error("AUST300 must not be the EU section default");
  }
  if (catalogSource === "AUST300" && EU_SECTION_CATALOG_ADAPTER.defaultCatalog == null) {
    throw new Error("AUST300 is an AU catalog identity and is not an EU default");
  }
}

export function assertD1cDemandEngineReused(): void {
  if (EU1_LOAD_COMBINATION_ENGINE_CREATED) throw new Error("EU-1 must not create a parallel load-combination engine");
  if (LOAD_FACTOR_PACK_INTERFACES.EU.implemented) {
    throw new Error("EN 1990/EN 1991 combination factors are not implemented in EU-1");
  }
}
