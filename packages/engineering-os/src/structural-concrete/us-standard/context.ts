import type {
  ConcreteMaterial,
  ReinforcementMaterial,
  StructuralStandardContext,
  UsConcreteCalculationContext,
  UsConcreteProjectStandardContext,
  UsConcreteResolverInput,
} from "@rtb/types";
import {
  SILENT_ACI318_EDITION_INFERENCE,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
  US_CONCRETE_STANDARD_AMENDMENT_STATE,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STANDARD_ERRATA_STATE,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { selectConcreteAdapter } from "../adapters";
import { assertGradeDoesNotSynthesizeProperties, requireReinforcementMaterialProperties } from "../materials";

export function bindUsConcreteStandardFamily(context: StructuralStandardContext): void {
  if (SILENT_ACI318_EDITION_INFERENCE || SILENT_CONCRETE_STANDARD_EDITION_INFERENCE) {
    throw new Error("ACI 318 edition must not be inferred");
  }
  selectConcreteAdapter("US_CONCRETE", context);
  if (!context.standardCode.startsWith("ACI 318")) {
    throw new Error("US concrete standard context fail closed: missing standard family");
  }
  if (!context.edition?.trim()) {
    throw new Error("US concrete standard context fail closed: missing required edition");
  }
}

export function usConcreteStandardIdentity(context: StructuralStandardContext): {
  family: "ACI 318";
  identifier: string;
  edition: typeof US_CONCRETE_STANDARD_EDITION;
  amendment: typeof US_CONCRETE_STANDARD_AMENDMENT_STATE;
  errata: typeof US_CONCRETE_STANDARD_ERRATA_STATE;
} {
  return {
    family: "ACI 318",
    identifier: context.standardCode,
    edition: US_CONCRETE_STANDARD_EDITION,
    amendment: US_CONCRETE_STANDARD_AMENDMENT_STATE,
    errata: US_CONCRETE_STANDARD_ERRATA_STATE,
  };
}

export function assertUsMaterialPropertySources(
  concrete: ConcreteMaterial,
  reinforcement: ReinforcementMaterial,
  designStandardRef = "ACI 318",
): void {
  assertGradeDoesNotSynthesizeProperties(concrete);
  if (concrete.materialStandardRef && concrete.materialStandardRef === designStandardRef) {
    throw new Error("US concrete design standard must remain separate from material standard");
  }
  if (reinforcement.productStandardRef && reinforcement.productStandardRef === designStandardRef) {
    throw new Error("US concrete design standard must remain separate from reinforcement product standard");
  }
  requireReinforcementMaterialProperties(reinforcement, []);
}

export function toStructuralContextFromUsConcrete(context: UsConcreteCalculationContext): StructuralStandardContext {
  const base = createConfiguredKnowledgeContext({
    contextId: context.contextId,
    jurisdictionProfileRef: context.jurisdictionProfileRef,
    standardFamily: "ACI",
    standardCode: context.concreteStandardCode,
    edition: context.concreteStandardEdition,
    amendment: context.amendmentState,
    materialScope: "concrete",
  });
  return { ...base, nationalAnnexRef: null, calculationScope: context.validationState };
}

export function projectDoesNotForceWorkspaceUsCode(project: UsConcreteProjectStandardContext): void {
  if (project.workspaceGlobalCodeProfileId !== null) {
    throw new Error("workspace must not be globally equal to one US concrete code profile");
  }
}

export function emptyUsConcreteResolverInput(overrides: Partial<UsConcreteResolverInput> = {}): UsConcreteResolverInput {
  return {
    projectContext: null,
    explicitCalculationContext: null,
    issuedContext: null,
    adoptionRequired: true,
    localAmendmentRequired: false,
    loadStandardRequired: false,
    source: "explicit",
    aiSelectedAciEdition: false,
    aiSelectedBuildingCode: false,
    aiInventedAmendment: false,
    aiSelectedLoadStandardEdition: false,
    aiClaimedConformance: false,
    aiClaimedBuildingCodeCompliance: false,
    humanConfirmed: false,
    ruleAuthorityType: "VALIDATED_ENGINEERING_REFERENCE",
    unresolvedSourceConflict: false,
    ...overrides,
  };
}
