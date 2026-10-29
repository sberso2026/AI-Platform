import type {
  ConcreteMaterial,
  EurocodeConcreteCalculationContext,
  EurocodeConcreteProjectContext,
  EuConcreteResolverInput,
  ReinforcementMaterial,
  StructuralStandardContext,
} from "@rtb/types";
import {
  EU_CONCRETE_STANDARD_AMENDMENT_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
  SILENT_EN1992_EDITION_INFERENCE,
} from "@rtb/types";
import { createConfiguredKnowledgeContext } from "../../structural-domain/binding";
import { selectConcreteAdapter } from "../adapters";
import { assertGradeDoesNotSynthesizeProperties, requireReinforcementMaterialProperties } from "../materials";

export function bindEuConcreteStandardFamily(context: StructuralStandardContext): void {
  if (SILENT_EN1992_EDITION_INFERENCE || SILENT_CONCRETE_STANDARD_EDITION_INFERENCE) {
    throw new Error("EN 1992 edition must not be inferred");
  }
  selectConcreteAdapter("EU_CONCRETE", context);
  if (!context.standardCode.startsWith("EN 1992")) {
    throw new Error("EU concrete standard context fail closed: missing standard family");
  }
  if (!context.edition?.trim()) {
    throw new Error("EU concrete standard context fail closed: missing required edition");
  }
}

export function euConcreteStandardIdentity(context: StructuralStandardContext): {
  family: "EN 1992";
  identifier: string;
  edition: typeof EU_CONCRETE_STANDARD_EDITION;
  amendment: typeof EU_CONCRETE_STANDARD_AMENDMENT_STATE;
} {
  return {
    family: "EN 1992",
    identifier: context.standardCode,
    edition: EU_CONCRETE_STANDARD_EDITION,
    amendment: EU_CONCRETE_STANDARD_AMENDMENT_STATE,
  };
}

export function assertEuMaterialPropertySources(
  concrete: ConcreteMaterial,
  reinforcement: ReinforcementMaterial,
  designStandardRef = "EN 1992",
): void {
  assertGradeDoesNotSynthesizeProperties(concrete);
  if (concrete.materialStandardRef && concrete.materialStandardRef === designStandardRef) {
    throw new Error("EU concrete design standard must remain separate from material standard");
  }
  if (reinforcement.productStandardRef && reinforcement.productStandardRef === designStandardRef) {
    throw new Error("EU concrete design standard must remain separate from reinforcement product standard");
  }
  requireReinforcementMaterialProperties(reinforcement, []);
}

export function toStructuralContextFromEuConcrete(
  context: EurocodeConcreteCalculationContext,
): StructuralStandardContext {
  const base = createConfiguredKnowledgeContext({
    contextId: context.contextId,
    jurisdictionProfileRef: context.jurisdictionProfileRef,
    standardFamily: "EN",
    standardCode: context.standardCode,
    edition: context.version.edition,
    amendment: context.version.amendment,
    materialScope: "concrete",
  });
  return {
    ...base,
    nationalAnnexRef: context.nationalAnnex
      ? {
        annexId: context.nationalAnnex.nationalAnnexId,
        country: context.nationalAnnex.countryCode,
        jurisdiction: context.jurisdictionProfileRef,
        standardCode: context.standardCode,
        edition: context.nationalAnnex.edition,
        annexEdition: context.nationalAnnex.edition,
        effectiveFrom: context.nationalAnnex.effectiveDate ?? context.version.effectiveDate ?? "1970-01-01",
        effectiveTo: null,
        parameterSetRef: context.nationalAnnex.nationalParameterSetRef,
        sourceReference: context.nationalAnnex.sourceAuthorityRef,
        validationState: context.nationalAnnex.validationState,
      }
      : null,
    calculationScope: context.validationState,
  };
}

export function projectDoesNotForceWorkspaceAnnex(project: EurocodeConcreteProjectContext): void {
  if (project.workspaceGlobalAnnexId !== null) {
    throw new Error("workspace must not be globally equal to one National Annex");
  }
}

export function emptyResolverInput(overrides: Partial<EuConcreteResolverInput> = {}): EuConcreteResolverInput {
  return {
    projectContext: null,
    explicitCalculationContext: null,
    issuedContext: null,
    requestedPartId: "EN_1992_1_1",
    requiredNdpIds: [],
    ruleRequiresNdp: false,
    source: "explicit",
    aiSelectedAnnex: false,
    aiSuppliedNdp: false,
    aiInferredEdition: false,
    aiClaimedConformance: false,
    humanConfirmed: false,
    ruleAuthorityType: "VALIDATED_ENGINEERING_REFERENCE",
    ...overrides,
  };
}
