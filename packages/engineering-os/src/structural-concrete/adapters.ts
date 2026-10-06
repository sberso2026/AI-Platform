import type {
  ConcreteAdapterId,
  ConcreteCapacityEngineInput,
  ConcreteCapacityEngineOutput,
  StructuralStandardContext,
} from "@rtb/types";
import {
  AU_CONCRETE_STANDARD_EDITION,
  AU_ONLY_CONCRETE_CORE,
  CONCRETE_CODE_PROFILE_INFERRED_FROM_USER_LOCATION,
  CONCRETE_DESIGN_AVAILABLE,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_CONCRETE_STANDARD_EDITION,
  EU_ONLY_CONCRETE_CORE,
  PARALLEL_AU_CONCRETE_CORE_CREATED,
  PARALLEL_EU_CONCRETE_CORE_CREATED,
  PARALLEL_US_CONCRETE_CORE_CREATED,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
  US_CONCRETE_STANDARD_EDITION,
  US_ONLY_CONCRETE_CORE,
} from "@rtb/types";
import { assertGovernedStandardContext, nationalAnnexRequired } from "../structural-domain/binding";
import { requireConcreteMaterialProperties, requireReinforcementMaterialProperties } from "./materials";

const ADAPTER_SCOPES: Record<ConcreteAdapterId, { jurisdictions: string[]; standardPrefixes: string[]; editions: string[]; nationalAnnex: boolean }> = {
  AU_CONCRETE: { jurisdictions: ["australia"], standardPrefixes: ["AS 3600"], editions: [], nationalAnnex: false },
  EU_CONCRETE: { jurisdictions: ["eu-eea", "united-kingdom", "other"], standardPrefixes: ["EN 1992"], editions: [], nationalAnnex: true },
  US_CONCRETE: { jurisdictions: ["united-states", "other"], standardPrefixes: ["ACI 318"], editions: [], nationalAnnex: false },
};

export function selectConcreteAdapter(adapterId: ConcreteAdapterId, context: StructuralStandardContext): void {
  if (PARALLEL_AU_CONCRETE_CORE_CREATED || PARALLEL_EU_CONCRETE_CORE_CREATED || PARALLEL_US_CONCRETE_CORE_CREATED) {
    throw new Error("parallel jurisdiction concrete cores are forbidden");
  }
  if (AU_ONLY_CONCRETE_CORE || EU_ONLY_CONCRETE_CORE || US_ONLY_CONCRETE_CORE) {
    throw new Error("concrete core must remain global; jurisdiction logic belongs in adapters");
  }
  if (CONCRETE_CODE_PROFILE_INFERRED_FROM_USER_LOCATION) {
    throw new Error("concrete code profile must not be inferred from user location");
  }
  if (SILENT_CONCRETE_STANDARD_EDITION_INFERENCE) {
    throw new Error("concrete standard edition must not be inferred silently");
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX) throw new Error("default EU concrete National Annex is forbidden");
  if (CONCRETE_DESIGN_AVAILABLE) throw new Error("concrete design must not be product-available in D1E-0");
  assertGovernedStandardContext(context);
  const scope = ADAPTER_SCOPES[adapterId];
  if (!scope) throw new Error("concrete design fail closed: unsupported jurisdiction adapter");
  if (!scope.jurisdictions.includes(context.jurisdictionProfileRef)) {
    throw new Error("concrete design fail closed: unsupported jurisdiction");
  }
  if (!scope.standardPrefixes.some((prefix) => context.standardCode.startsWith(prefix))) {
    throw new Error("concrete design fail closed: unsupported standard for adapter");
  }
  if (!context.edition?.trim()) throw new Error("concrete design fail closed: missing standard context");
  if (scope.editions.length > 0 && !scope.editions.includes(context.edition)) {
    throw new Error("concrete design fail closed: unsupported edition");
  }
  if (scope.nationalAnnex && nationalAnnexRequired(context) && !context.nationalAnnexRef) {
    throw new Error("concrete design fail closed: invalid annex");
  }
}

export function evaluateConcreteCapacity(input: ConcreteCapacityEngineInput): ConcreteCapacityEngineOutput {
  selectConcreteAdapter(input.adapterId, input.standardContext);
  if (input.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (input.designContext.standardContextRef !== input.standardContext.contextId) {
    throw new Error("concrete design fail closed: standard context is ambiguous");
  }
  if (input.demand.memberId !== input.designContext.memberRef) {
    throw new Error("concrete design fail closed: demand member does not match design context");
  }
  if (input.designContext.designStandardRef === input.designContext.materialStandardRef) {
    throw new Error("concrete design standard must remain separate from material standard");
  }
  requireConcreteMaterialProperties(
    input.material,
    input.requiredProperties.filter((name) => name.startsWith("concrete.")).map((name) => name.slice("concrete.".length)),
  );
  requireReinforcementMaterialProperties(
    input.reinforcement,
    input.requiredProperties.filter((name) => name.startsWith("reinforcement.")).map((name) => name.slice("reinforcement.".length)),
  );
  if (input.covers.some((cover) => cover.nominalCoverMm == null && cover.modelledCoverMm == null) && input.limitState === "DURABILITY") {
    throw new Error("concrete design fail closed: missing cover where required");
  }
  return {
    adapterId: input.adapterId,
    maturity: "FRAMEWORK_ONLY",
    implemented: false,
    capacity: null,
    reason: `${input.adapterId} is FRAMEWORK_ONLY in D1E-0. No ${input.standardContext.standardCode} design equations are implemented.`,
  };
}

export const CONCRETE_ADAPTER_BOUNDARIES = {
  AU_CONCRETE: {
    ready: true,
    implemented: false,
    standards: ["AS 3600"],
    edition: AU_CONCRETE_STANDARD_EDITION,
    loadContext: ["AS/NZS 1170"],
  },
  EU_CONCRETE: {
    ready: true,
    implemented: false,
    standards: ["EN 1992"],
    edition: EU_CONCRETE_STANDARD_EDITION,
    loadContext: ["EN 1990", "EN 1991"],
    nationalAnnex: true,
    defaultNationalAnnex: false,
  },
  US_CONCRETE: {
    ready: true,
    implemented: false,
    standards: ["ACI 318"],
    edition: US_CONCRETE_STANDARD_EDITION,
    loadContext: ["ASCE 7"],
  },
} as const;
