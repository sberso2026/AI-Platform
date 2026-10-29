import type { AuConcreteFlexureContext, AuFlexureAxis, ConcreteMaterial, ReinforcementMaterial, StructuralStandardContext } from "@rtb/types";
import {
  AU_CONCRETE_STANDARD_AMENDMENT_STATE,
  AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  AU_CONCRETE_STANDARD_EDITION,
  AU_FLEXURE_AXIAL_APPLICABILITY,
  SILENT_AS3600_EDITION_INFERENCE,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
} from "@rtb/types";
import { selectConcreteAdapter } from "../adapters";
import { assertGradeDoesNotSynthesizeProperties, requireConcreteMaterialProperties, requireReinforcementMaterialProperties } from "../materials";

export function bindAuConcreteStandardFamily(context: StructuralStandardContext): void {
  if (SILENT_AS3600_EDITION_INFERENCE || SILENT_CONCRETE_STANDARD_EDITION_INFERENCE) {
    throw new Error("AS 3600 edition must not be inferred");
  }
  selectConcreteAdapter("AU_CONCRETE", context);
  if (!context.standardCode.startsWith("AS 3600")) {
    throw new Error("AU concrete flexure fail closed: missing standard context");
  }
  if (!context.edition?.trim()) {
    throw new Error("AU concrete flexure fail closed: missing required edition");
  }
}

export function assertAuMaterialGovernance(concrete: ConcreteMaterial, reinforcement: ReinforcementMaterial): void {
  assertGradeDoesNotSynthesizeProperties(concrete);
  requireConcreteMaterialProperties(concrete, ["elasticModulus"]);
  requireReinforcementMaterialProperties(reinforcement, ["elasticModulus"]);
}

export function toAuFlexureContext(input: {
  memberRef: string;
  sectionRef: string;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  layoutId: string;
  axis: AuFlexureAxis;
  momentDemandRef: string;
  standardContext: StructuralStandardContext;
  provenance: AuConcreteFlexureContext["provenance"];
}): AuConcreteFlexureContext {
  return {
    memberRef: input.memberRef,
    sectionRef: input.sectionRef,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRefs: [input.reinforcement.materialRef],
    reinforcementLayoutRef: input.layoutId,
    axis: input.axis,
    momentDemandRef: input.momentDemandRef,
    standardContextRef: input.standardContext.contextId,
    calculationContextRef: `${input.memberRef}:au-flexure`,
    materialResponseRuleRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    stressBlockRuleRef: null,
    strainLimitRuleRefs: [],
    strengthFactorRef: null,
    classificationDuctilityRefs: [],
    technicalBasisRefs: ["d1e1-uncracked-elastic-section-reference"],
    validationState: "FRAMEWORK_PLUS_COMMON_MECHANICS",
    conformanceState: AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    provenance: input.provenance,
  };
}

export function auStandardIdentity(context: StructuralStandardContext): {
  family: "AS 3600";
  identifier: string;
  edition: typeof AU_CONCRETE_STANDARD_EDITION;
  amendment: typeof AU_CONCRETE_STANDARD_AMENDMENT_STATE;
  effectiveDate: string | null;
  methodVersion: string;
} {
  return {
    family: "AS 3600",
    identifier: context.standardCode,
    edition: AU_CONCRETE_STANDARD_EDITION,
    amendment: AU_CONCRETE_STANDARD_AMENDMENT_STATE,
    effectiveDate: null,
    methodVersion: context.edition,
  };
}

export function assertPureFlexureApplicability(axialN: number): void {
  if (AU_FLEXURE_AXIAL_APPLICABILITY !== "PURE_OR_NEAR_PURE_FLEXURE_ONLY") {
    throw new Error("AU flexure axial applicability must remain explicit");
  }
  if (Math.abs(axialN) > 1e-6) {
    throw new Error("AU concrete flexure fail closed: unsupported axial action");
  }
}
