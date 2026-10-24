import {
  AUST300_GLOBAL_DEFAULT,
  AUST300_US_DEFAULT,
  EU_SECTION_CATALOG_US_DEFAULT,
  US1_LOAD_COMBINATION_ENGINE_CREATED,
  US_SECTION_PROPERTIES_FROM_UNGOVERNED_DESIGNATION,
} from "@rtb/types";
import { LOAD_FACTOR_PACK_INTERFACES } from "../../structural-demand/combine";

export const US_SECTION_CATALOG_ADAPTER = {
  ready: true,
  implemented: false,
  defaultCatalog: null,
  aust300Default: false,
  euCatalogDefault: false,
} as const;

export const US_MATERIAL_SOURCE_BOUNDARY_RECORD = {
  aiscIsUniversalMaterialSource: false,
  allowedSources: ["ASTM", "MANUFACTURER_CATALOG", "PROJECT_SPECIFICATION", "ENGINEERING_DATABASE"] as const,
  designValuesPopulated: false,
} as const;

export const US_STANDARD_SOURCE_REFERENCES = [] as const;

export const US_CONNECTION_STANDARD_DEPENDENCY = {
  modeled: true,
  implemented: false,
  standardRefs: ["RCSC", "AISC 358"] as const,
} as const;

export function assertAust300NotUsDefault(catalogSource: string | null | undefined): void {
  if (AUST300_US_DEFAULT || AUST300_GLOBAL_DEFAULT) {
    throw new Error("AUST300 must not be the US or global section default");
  }
  if (US_SECTION_CATALOG_ADAPTER.defaultCatalog === "AUST300" || US_SECTION_CATALOG_ADAPTER.aust300Default) {
    throw new Error("AUST300 must not be the US section default");
  }
  if (catalogSource === "AUST300") {
    throw new Error("AUST300 is an AU catalog identity and is not a US default");
  }
}

export function assertEuCatalogNotUsDefault(catalogSource: string | null | undefined): void {
  if (EU_SECTION_CATALOG_US_DEFAULT || US_SECTION_CATALOG_ADAPTER.euCatalogDefault) {
    throw new Error("EU section catalogue must not be the US default");
  }
  if (catalogSource === "EU_SECTION_CATALOG") {
    throw new Error("EU section catalogue is not a US default");
  }
}

export function assertUsSectionPropertiesNotFromUngovernedDesignation(
  designation: string | null | undefined,
  catalogRef: string | null | undefined,
): void {
  if (US_SECTION_PROPERTIES_FROM_UNGOVERNED_DESIGNATION) {
    throw new Error("section properties must not be generated from an ungoverned designation");
  }
  if (designation?.trim() && !catalogRef?.trim()) {
    throw new Error("section designation is not a substitute for governed section properties");
  }
}

export function assertUsD1cDemandEngineReused(): void {
  if (US1_LOAD_COMBINATION_ENGINE_CREATED) throw new Error("US-1 must not create a parallel load-combination engine");
  if (LOAD_FACTOR_PACK_INTERFACES.US.implemented) {
    throw new Error("ASCE 7 combination factors are not implemented in US-1");
  }
}
