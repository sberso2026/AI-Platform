import type {
  ConcreteMaterial,
  ReinforcementMaterial,
  UsConcreteCalculationContext,
  UsConcreteFlexureContext,
  UsFlexureAxis,
} from "@rtb/types";
import {
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_FLEXURE_AXIAL_APPLICABILITY,
  US_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE,
} from "@rtb/types";
import { assertUsMaterialPropertySources } from "../us-standard/context";
import { requireConcreteMaterialProperties, requireReinforcementMaterialProperties } from "../materials";

export function assertUsFlexureMaterialGovernance(concrete: ConcreteMaterial, reinforcement: ReinforcementMaterial): void {
  assertUsMaterialPropertySources(concrete, reinforcement, "ACI 318");
  requireConcreteMaterialProperties(concrete, ["elasticModulus"]);
  requireReinforcementMaterialProperties(reinforcement, ["elasticModulus"]);
  if (!US_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE) {
    throw new Error("US flexure design and material standards must remain separate");
  }
}

export function assertPureUsFlexureApplicability(axialN: number): void {
  if (US_FLEXURE_AXIAL_APPLICABILITY !== "PURE_OR_NEAR_PURE_FLEXURE_ONLY") {
    throw new Error("US flexure axial applicability must remain explicit");
  }
  if (Math.abs(axialN) > 1e-6) {
    throw new Error("US concrete flexure fail closed: unsupported axial action");
  }
}

export function toUsFlexureContext(input: {
  memberRef: string;
  sectionRef: string;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  layoutId: string;
  axis: UsFlexureAxis;
  momentDemandRef: string;
  usContext: UsConcreteCalculationContext;
  provenance: UsConcreteFlexureContext["provenance"];
}): UsConcreteFlexureContext {
  return {
    memberRef: input.memberRef,
    sectionRef: input.sectionRef,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRefs: [input.reinforcement.materialRef],
    reinforcementLayoutRef: input.layoutId,
    bendingAxis: input.axis,
    momentDemandRef: input.momentDemandRef,
    aciFamily: "ACI 318",
    standardEdition: input.usContext.concreteStandardEdition,
    amendmentState: input.usContext.amendmentState,
    errataState: input.usContext.errataState,
    buildingCodeContextRef: input.usContext.buildingCodeAdoption?.adoptionId ?? null,
    localAmendmentRefs: input.usContext.localAmendmentSet.map((row) => row.amendmentId),
    directContractProfile: input.usContext.directContractProfile,
    materialResponseRuleRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    stressBlockRuleRef: null,
    strainRuleRefs: [],
    strengthReductionRuleRef: null,
    technicalBasisRefs: ["d1e1-uncracked-elastic-section-reference"],
    validationState: "FRAMEWORK_PLUS_COMMON_MECHANICS",
    conformanceState: US_CONCRETE_STANDARD_CONFORMANCE_STATE,
    provenance: input.provenance,
  };
}
