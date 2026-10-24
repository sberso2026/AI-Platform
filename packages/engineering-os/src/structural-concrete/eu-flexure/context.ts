import type {
  ConcreteMaterial,
  EuConcreteFlexureContext,
  EuFlexureAxis,
  EurocodeConcreteCalculationContext,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_FLEXURE_AXIAL_APPLICABILITY,
  EU_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE,
} from "@rtb/types";
import { assertEuMaterialPropertySources } from "../eu-standard/context";
import { requireConcreteMaterialProperties, requireReinforcementMaterialProperties } from "../materials";

export function assertEuFlexureMaterialGovernance(concrete: ConcreteMaterial, reinforcement: ReinforcementMaterial): void {
  assertEuMaterialPropertySources(concrete, reinforcement, "EN 1992");
  requireConcreteMaterialProperties(concrete, ["elasticModulus"]);
  requireReinforcementMaterialProperties(reinforcement, ["elasticModulus"]);
  if (!EU_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE) {
    throw new Error("EU flexure design and material standards must remain separate");
  }
}

export function assertPureEuFlexureApplicability(axialN: number): void {
  if (EU_FLEXURE_AXIAL_APPLICABILITY !== "PURE_OR_NEAR_PURE_FLEXURE_ONLY") {
    throw new Error("EU flexure axial applicability must remain explicit");
  }
  if (Math.abs(axialN) > 1e-6) {
    throw new Error("EU concrete flexure fail closed: unsupported axial action");
  }
}

export function toEuFlexureContext(input: {
  memberRef: string;
  sectionRef: string;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  layoutId: string;
  axis: EuFlexureAxis;
  momentDemandRef: string;
  euContext: EurocodeConcreteCalculationContext;
  provenance: EuConcreteFlexureContext["provenance"];
}): EuConcreteFlexureContext {
  return {
    memberRef: input.memberRef,
    sectionRef: input.sectionRef,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRefs: [input.reinforcement.materialRef],
    reinforcementLayoutRef: input.layoutId,
    bendingAxis: input.axis,
    momentDemandRef: input.momentDemandRef,
    standardFamily: "EN 1992",
    standardGeneration: input.euContext.version.generationFamily,
    standardEdition: input.euContext.version.edition,
    standardPartRefs: [input.euContext.standardPart],
    nationalAnnexRef: input.euContext.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: input.euContext.nationalAnnex?.nationalParameterSetRef ?? null,
    materialResponseRuleRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    stressBlockOrDesignModelRef: null,
    strainLimitRuleRefs: [],
    partialFactorRefs: [],
    ductilityClassificationRefs: [],
    technicalBasisRefs: ["d1e1-uncracked-elastic-section-reference"],
    validationState: "FRAMEWORK_PLUS_COMMON_MECHANICS",
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    provenance: input.provenance,
  };
}
