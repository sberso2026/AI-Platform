import type {
  AuConcreteFlexureResult,
  AuFlexureAxis,
  AuFlexureWarningCode,
  ConcreteMaterial,
  RcSectionGeometryInput,
  ReinforcementLayout,
  ReinforcementMaterial,
  StructuralDemandResult,
  StructuralStandardContext,
} from "@rtb/types";
import {
  AS3600_STRESS_BLOCK_IN_COMMON_KERNEL,
  AU_CONCRETE_PACK_CERTIFIED,
  AU_FLEXURE_IMPLEMENTATION_VERSION,
  AU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND,
  AU_NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE,
  AU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  DEFAULT_AU_CONCRETE_CARBON_FACTOR,
  DEFAULT_AU_CONCRETE_COST_RATE,
  DEFAULT_AU_REINFORCEMENT_CARBON_FACTOR,
  ELASTIC_RC_REFERENCE_EQUALS_AS3600_FLEXURAL_CAPACITY,
  GEOMETRIC_CLEARANCE_EQUALS_AS3600_COVER_COMPLIANCE,
  MECHANICS_RATIO_LABELLED_AS_AS3600_CHECK,
  PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_AU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_AU_SECTION_INTEGRATOR_CREATED,
} from "@rtb/types";
import { consumeD1cSectionActions } from "../section-mechanics/handoff";
import {
  computeGrossSectionProperties,
  createStrainState,
  evaluateBarGeometry,
  geometricClearances,
  integrateElasticSection,
  neutralAxisFromStrainState,
  solveElasticEquilibrium,
} from "../section-mechanics";
import { assertAuFlexureAiBoundary, assertAuFlexureRuleAuthority, assertCodeParameterNotGuessed } from "./authority";
import { assertAuMaterialGovernance, assertPureFlexureApplicability, bindAuConcreteStandardFamily, toAuFlexureContext } from "./context";
import { auFlexureFingerprint, sectionLayoutFingerprint } from "./invalidation";
import {
  AU_CONCRETE_FLEXURE_METHODS,
  AU_RC_FLEXURE_ELASTIC_MAJOR,
  AU_STRAIN_LIMIT_RULE,
  AU_STRENGTH_FACTOR_RULE,
  AU_STRESS_BLOCK_RULE,
} from "./registry";

export type AuConcreteFlexureInput = {
  methodId: string;
  axis: AuFlexureAxis;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  demand: StructuralDemandResult;
  standardContext: StructuralStandardContext;
};

function fail(message: string): never {
  throw new Error(`AU concrete flexure fail closed: ${message}`);
}

function warningsForCodeGap(extra: AuFlexureWarningCode[] = []): AuFlexureWarningCode[] {
  return [
    "MECHANICS_REFERENCE_ONLY",
    "AS3600_DESIGN_METHOD_UNAVAILABLE",
    "STANDARD_EDITION_UNCONFIRMED",
    "STRESS_BLOCK_AUTHORITY_MISSING",
    "DESIGN_FACTOR_MISSING",
    "STRAIN_LIMIT_AUTHORITY_MISSING",
    "VALIDATION_REQUIRED",
    "HUMAN_ENGINEERING_REVIEW_REQUIRED",
    "NOT_APPROVED_FOR_CONSTRUCTION",
    ...extra,
  ];
}

export function evaluateAuConcreteFlexure(input: AuConcreteFlexureInput): AuConcreteFlexureResult {
  assertAuFlexureAiBoundary();
  if (PARALLEL_AU_RC_SECTION_SOLVER_CREATED || PARALLEL_AU_SECTION_INTEGRATOR_CREATED || PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED) {
    fail("parallel AU section solver is forbidden");
  }
  if (AS3600_STRESS_BLOCK_IN_COMMON_KERNEL) fail("AS 3600 stress block must not enter the common kernel");
  if (AU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND) fail("AU flexure must not recalculate structural demand");
  if (GEOMETRIC_CLEARANCE_EQUALS_AS3600_COVER_COMPLIANCE) fail("geometric clearance is not AS 3600 cover compliance");
  if (DEFAULT_AU_CONCRETE_COST_RATE || DEFAULT_AU_CONCRETE_CARBON_FACTOR || DEFAULT_AU_REINFORCEMENT_CARBON_FACTOR) {
    fail("default AU cost/carbon factors are forbidden");
  }
  if (AU_CONCRETE_PACK_CERTIFIED) fail("AU concrete pack is not certified");
  bindAuConcreteStandardFamily(input.standardContext);
  assertAuMaterialGovernance(input.concrete, input.reinforcement);
  const method = AU_CONCRETE_FLEXURE_METHODS.find((row) => row.methodId === input.methodId);
  if (!method) fail("unvalidated method requested as validated");
  if (method.axis !== input.axis) fail("method axis mismatch");
  assertAuFlexureRuleAuthority(method.authorityType);
  assertCodeParameterNotGuessed(AU_STRESS_BLOCK_RULE.parameters, "stress-block parameters");
  assertCodeParameterNotGuessed(AU_STRENGTH_FACTOR_RULE.value, "strength factor");
  assertCodeParameterNotGuessed(AU_STRAIN_LIMIT_RULE.ultimateConcreteStrain, "ultimate concrete strain");
  assertCodeParameterNotGuessed(AU_STRAIN_LIMIT_RULE.reinforcementStrainLimit, "reinforcement strain limit");

  computeGrossSectionProperties(input.geometry);
  evaluateBarGeometry(input.layout, input.geometry);
  geometricClearances(input.layout, input.geometry);

  const actions = consumeD1cSectionActions(input.demand);
  try {
    assertPureFlexureApplicability(actions.N_N);
  } catch {
    return undetermined(input, method.outputSemantics === "CODE_DESIGN_CAPACITY" ? "CODE_PROFILE_REFERENCE" : "MECHANICS_REFERENCE", "UNSUPPORTED_SCOPE", ["UNSUPPORTED_AXIAL_ACTION"]);
  }

  const demandNm = input.axis === "MINOR_AXIS" ? actions.My_Nm : actions.Mx_Nm;
  if (!Number.isFinite(demandNm)) fail("missing demand");

  const context = toAuFlexureContext({
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    layoutId: input.layout.layoutId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    standardContext: input.standardContext,
    provenance: input.demand.provenanceRef,
  });
  void context;
  void sectionLayoutFingerprint(input.geometry, input.layout, input.concrete.materialRef, input.reinforcement.materialRef);
  void auFlexureFingerprint({
    memberRef: input.demand.memberId,
    sectionGeometryVersion: input.geometry.geometryVersion,
    reinforcementFingerprint: input.layout.layoutId,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRef: input.reinforcement.materialRef,
    momentDemandRef: actions.demandResultId,
    combinationId: input.demand.combinationId,
    d1cRevision: input.demand.toolVersion,
    standardEdition: input.standardContext.edition,
    materialModelRef: "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    stressBlockRuleRef: null,
    strainLimitRuleRef: null,
    strengthFactorRef: null,
    methodVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
  });

  if (method.methodType === "AS3600_UNIAXIAL_FLEXURE" || method.methodScope === "FRAMEWORK_ONLY") {
    return undetermined(input, "CODE_PROFILE_REFERENCE", "METHOD_NOT_IMPLEMENTED", []);
  }

  const props = computeGrossSectionProperties(input.geometry);
  const origin = { xMm: props.centroidXMm, yMm: props.centroidYMm };
  const target = input.axis === "MINOR_AXIS"
    ? { N_N: 0, Mx_Nm: 0, My_Nm: demandNm }
    : { N_N: 0, Mx_Nm: demandNm, My_Nm: 0 };
  if (PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED) fail("parallel AU neutral-axis solver is forbidden");
  const solved = solveElasticEquilibrium({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    target,
    originMm: origin,
    displacementTreatment: "CONCRETE_GROSS_SEPARATE",
    crackState: "UNCRACKED_REFERENCE",
    provenanceRef: input.geometry.provenanceRef,
  });
  if (solved.state !== "CONVERGED" || !solved.resultants || !solved.strain) {
    return undetermined(input, "MECHANICS_REFERENCE", "CHECK_UNDETERMINED", ["EQUILIBRIUM_NOT_CONVERGED"]);
  }
  const na = neutralAxisFromStrainState(solved.strain);
  if (AU_NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE || na.labelledCodeCapacity) fail("neutral axis is not a code capacity state");
  if (ELASTIC_RC_REFERENCE_EQUALS_AS3600_FLEXURAL_CAPACITY) fail("elastic RC reference is not AS 3600 flexural capacity");
  const mechanicsMoment = input.axis === "MINOR_AXIS" ? solved.resultants.My_Nm : solved.resultants.Mx_Nm;
  const mechanicsRatio = mechanicsMoment === 0 ? null : Math.abs(demandNm / mechanicsMoment);
  if (MECHANICS_RATIO_LABELLED_AS_AS3600_CHECK) fail("mechanics ratio must not be labelled AS 3600 utilization");
  integrateElasticSection({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    strain: solved.strain ?? createStrainState(0, 0, 0, origin),
    displacementTreatment: "CONCRETE_GROSS_SEPARATE",
    crackState: "UNCRACKED_REFERENCE",
    provenanceRef: input.geometry.provenanceRef,
  });
  return {
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    momentDemandNm: demandNm,
    mechanicsState: "EQUILIBRATED",
    codeDesignState: "CHECK_UNDETERMINED",
    checkState: "CHECK_UNDETERMINED",
    resultAuthority: "MECHANICS_REFERENCE",
    neutralAxis: { exists: na.exists, labelledCodeCapacity: false },
    strainStateRefs: [AU_RC_FLEXURE_ELASTIC_MAJOR.technicalBasisRef],
    materialResponseRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    mechanicsReferenceMomentNm: mechanicsMoment,
    nominalReferenceMomentNm: null,
    designMomentCapacityNm: null,
    as3600Utilization: null,
    mechanicsDemandRatio: mechanicsRatio,
    stressBlockRuleRef: null,
    strengthFactorRef: null,
    standardContextRef: input.standardContext.contextId,
    methodVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "MECHANICS_REFERENCE",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "INDEPENDENT_MECHANICS_REFERENCE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(),
    completeness: "STANDARD_CONTEXT_INCOMPLETE",
    labelledAs3600Capacity: false,
    detailingComplianceImplied: false,
  };
}

function undetermined(
  input: AuConcreteFlexureInput,
  authority: AuConcreteFlexureResult["resultAuthority"],
  completeness: string,
  extra: AuFlexureWarningCode[],
): AuConcreteFlexureResult {
  const actions = consumeD1cSectionActions(input.demand);
  const demandNm = input.axis === "MINOR_AXIS" ? actions.My_Nm : actions.Mx_Nm;
  return {
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    momentDemandNm: demandNm,
    mechanicsState: extra.includes("EQUILIBRIUM_NOT_CONVERGED") ? "NOT_CONVERGED" : extra.includes("UNSUPPORTED_AXIAL_ACTION") ? "NOT_EVALUATED" : "NOT_EVALUATED",
    codeDesignState: "CHECK_UNDETERMINED",
    checkState: "CHECK_UNDETERMINED",
    resultAuthority: authority,
    neutralAxis: { exists: false, labelledCodeCapacity: false },
    strainStateRefs: [],
    materialResponseRefs: [],
    mechanicsReferenceMomentNm: null,
    nominalReferenceMomentNm: null,
    designMomentCapacityNm: null,
    as3600Utilization: null,
    mechanicsDemandRatio: null,
    stressBlockRuleRef: null,
    strengthFactorRef: null,
    standardContextRef: input.standardContext.contextId,
    methodVersion: AU_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "NOT_APPLICABLE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(extra),
    completeness,
    labelledAs3600Capacity: false,
    detailingComplianceImplied: false,
  };
}

export function assertAuOptimizerRejectsUndetermined(checkState: AuConcreteFlexureResult["checkState"]): void {
  if (AU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("optimizer cannot accept undetermined as pass");
}
