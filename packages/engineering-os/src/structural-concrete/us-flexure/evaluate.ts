import type {
  ConcreteMaterial,
  RcSectionGeometryInput,
  ReinforcementLayout,
  ReinforcementMaterial,
  StructuralDemandResult,
  UsConcreteCalculationContext,
  UsConcreteFlexureResult,
  UsConcreteResolverInput,
  UsFlexureAxis,
  UsFlexureWarningCode,
} from "@rtb/types";
import {
  ACI_FLEXURE_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE,
  DEFAULT_US_CONCRETE_CARBON_FACTOR,
  DEFAULT_US_CONCRETE_COST_RATE,
  DEFAULT_US_REINFORCEMENT_CARBON_FACTOR,
  DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_RC_REFERENCE_EQUALS_ACI_FLEXURAL_STRENGTH,
  GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE,
  MECHANICS_RATIO_LABELLED_AS_ACI_CHECK,
  PARALLEL_US_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_US_RC_SECTION_SOLVER_CREATED,
  PARALLEL_US_SECTION_INTEGRATOR_CREATED,
  PARALLEL_US_STANDARD_CONTEXT_CREATED,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE,
  US_CONCRETE_PACK_CERTIFIED,
  US_FLEXURE_IMPLEMENTATION_VERSION,
  US_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND,
  US_NEUTRAL_AXIS_EQUALS_ACI_CODE_STRENGTH_STATE,
  US_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  US_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED,
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
import { resolveUsConcreteContext } from "../us-standard/resolver";
import {
  US_CONCRETE_STRAIN_LIMIT_DEPENDENCY as STRAIN_SLOT,
  US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY as PHI_SLOT,
  US_CONCRETE_STRESS_BLOCK_DEPENDENCY as STRESS_SLOT,
} from "../us-standard/profiles";
import { assertCodeParameterNotGuessed, assertUsFlexureAiBoundary, assertUsFlexureRuleAuthority, assertUsGenerativeCannotChangeStandardContext } from "./authority";
import { assertPureUsFlexureApplicability, assertUsFlexureMaterialGovernance, toUsFlexureContext } from "./context";
import { sectionLayoutFingerprint, usFlexureFingerprint } from "./invalidation";
import { US_CONCRETE_FLEXURE_METHODS } from "./registry";

export type UsConcreteFlexureInput = {
  methodId: string;
  axis: UsFlexureAxis;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  demand: StructuralDemandResult;
  resolverInput: UsConcreteResolverInput;
  generativeAttemptedStandardContextChange?: boolean;
};

function fail(message: string): never {
  throw new Error(`US concrete flexure fail closed: ${message}`);
}

function warningsForCodeGap(extra: UsFlexureWarningCode[] = []): UsFlexureWarningCode[] {
  return [
    "MECHANICS_REFERENCE_ONLY",
    "ACI_DESIGN_METHOD_UNAVAILABLE",
    "STANDARD_EDITION_UNCONFIRMED",
    "STRESS_BLOCK_AUTHORITY_MISSING",
    "STRENGTH_REDUCTION_FACTOR_MISSING",
    "STRAIN_LIMIT_AUTHORITY_MISSING",
    "VALIDATION_REQUIRED",
    "HUMAN_ENGINEERING_REVIEW_REQUIRED",
    "NOT_APPROVED_FOR_CONSTRUCTION",
    ...extra,
  ];
}

function resolvedContext(input: UsConcreteFlexureInput): UsConcreteCalculationContext | { undetermined: UsConcreteFlexureResult } {
  const resolved = resolveUsConcreteContext(input.resolverInput);
  if (!resolved.ok) {
    const extra: UsFlexureWarningCode[] = [];
    if (resolved.failReason === "BUILDING_CODE_CONTEXT_REQUIRED") extra.push("BUILDING_CODE_CONTEXT_MISSING");
    if (resolved.failReason === "LOCAL_AMENDMENT_REQUIRED") extra.push("LOCAL_AMENDMENT_MISSING");
    return { undetermined: undetermined(input, "CODE_PROFILE_REFERENCE", resolved.failReason, extra, null) };
  }
  return resolved.context;
}

export function evaluateUsConcreteFlexure(input: UsConcreteFlexureInput): UsConcreteFlexureResult {
  assertUsFlexureAiBoundary();
  assertUsGenerativeCannotChangeStandardContext(input.generativeAttemptedStandardContextChange === true);
  if (PARALLEL_US_RC_SECTION_SOLVER_CREATED || PARALLEL_US_SECTION_INTEGRATOR_CREATED || PARALLEL_US_NEUTRAL_AXIS_SOLVER_CREATED) {
    fail("parallel US section solver is forbidden");
  }
  if (PARALLEL_US_STANDARD_CONTEXT_CREATED) fail("parallel US standard context is forbidden");
  if (US_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL) fail("ACI parameters must not leak into the common kernel");
  if (US_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND) fail("US flexure must not recalculate structural demand");
  if (GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE) fail("geometric clearance is not ACI cover compliance");
  if (STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE) fail("steel LRFD/ASD semantics must not be reused for US RC flexure");
  if (DEFAULT_US_CONCRETE_COST_RATE || DEFAULT_US_CONCRETE_CARBON_FACTOR || DEFAULT_US_REINFORCEMENT_CARBON_FACTOR) {
    fail("default US cost/carbon factors are forbidden");
  }
  if (US_CONCRETE_PACK_CERTIFIED) fail("US concrete pack is not certified");
  if (ACI_FLEXURE_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE) fail("ACI flexure check is not building-code compliance");
  if (DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE) fail("direct-contract ACI flexure is not building-code compliance");
  assertUsFlexureMaterialGovernance(input.concrete, input.reinforcement);
  const method = US_CONCRETE_FLEXURE_METHODS.find((row) => row.methodId === input.methodId);
  if (!method) fail("unvalidated method requested as validated");
  if (method.axis !== input.axis) fail("method axis mismatch");
  assertUsFlexureRuleAuthority(method.authorityType);
  assertCodeParameterNotGuessed(STRESS_SLOT.parameters.beta1.value, "stress-block beta1");
  assertCodeParameterNotGuessed(PHI_SLOT.value.value, "strength-reduction factor");
  assertCodeParameterNotGuessed(STRAIN_SLOT.ultimateConcreteStrain.value, "ultimate concrete strain");
  assertCodeParameterNotGuessed(STRAIN_SLOT.reinforcementStrainLimit.value, "reinforcement strain limit");

  computeGrossSectionProperties(input.geometry);
  evaluateBarGeometry(input.layout, input.geometry);
  geometricClearances(input.layout, input.geometry);

  const resolverForMethod: UsConcreteResolverInput = {
    ...input.resolverInput,
    adoptionRequired: method.buildingCodeDependency ? input.resolverInput.adoptionRequired : false,
    localAmendmentRequired: method.localAmendmentDependency ? input.resolverInput.localAmendmentRequired : false,
  };
  const ctxOrFail = resolvedContext({ ...input, resolverInput: resolverForMethod });
  if ("undetermined" in ctxOrFail) return ctxOrFail.undetermined;
  const usContext = ctxOrFail;
  if (usContext.concreteStandardFamily !== method.aciFamily) fail("method cannot silently use another ACI family");

  const actions = consumeD1cSectionActions(input.demand);
  try {
    assertPureUsFlexureApplicability(actions.N_N);
  } catch {
    return undetermined(input, method.outputSemantics === "CODE_DESIGN_STRENGTH" ? "CODE_PROFILE_REFERENCE" : "MECHANICS_REFERENCE", "UNSUPPORTED_SCOPE", ["UNSUPPORTED_AXIAL_ACTION"], usContext);
  }

  const demandNm = input.axis === "MINOR_AXIS" ? actions.My_Nm : actions.Mx_Nm;
  if (!Number.isFinite(demandNm)) fail("missing demand");

  toUsFlexureContext({
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    layoutId: input.layout.layoutId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    usContext,
    provenance: input.demand.provenanceRef,
  });
  const geometryFingerprint = sectionLayoutFingerprint(input.geometry, input.layout, input.concrete.materialRef, input.reinforcement.materialRef);
  void usFlexureFingerprint({
    memberRef: input.demand.memberId,
    sectionGeometryVersion: input.geometry.geometryVersion,
    reinforcementFingerprint: input.layout.layoutId,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRef: input.reinforcement.materialRef,
    momentDemandRef: actions.demandResultId,
    combinationId: input.demand.combinationId,
    d1cRevision: input.demand.toolVersion,
    aciFamily: "ACI 318",
    edition: usContext.concreteStandardEdition,
    amendmentState: usContext.amendmentState,
    errataState: usContext.errataState,
    buildingCodeContextRef: usContext.buildingCodeAdoption?.adoptionId ?? null,
    localAmendmentRef: usContext.localAmendmentSet[0]?.amendmentId ?? null,
    materialModelRef: "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    stressBlockRuleRef: null,
    strainRuleRef: null,
    strengthFactorRef: null,
    methodVersion: US_FLEXURE_IMPLEMENTATION_VERSION,
  });

  if (method.methodType === "ACI_UNIAXIAL_FLEXURE" || method.methodScope === "FRAMEWORK_ONLY") {
    const extra: UsFlexureWarningCode[] = [];
    if (method.buildingCodeDependency && !usContext.buildingCodeAdoption) extra.push("BUILDING_CODE_CONTEXT_MISSING");
    if (method.localAmendmentDependency && usContext.localAmendmentSet.length === 0) extra.push("LOCAL_AMENDMENT_MISSING");
    if (usContext.directContractProfile) extra.push("DIRECT_CONTRACT_NOT_BUILDING_CODE_COMPLIANCE");
    return undetermined(input, "CODE_PROFILE_REFERENCE", "METHOD_NOT_IMPLEMENTED", extra, usContext);
  }

  const props = computeGrossSectionProperties(input.geometry);
  const origin = { xMm: props.centroidXMm, yMm: props.centroidYMm };
  const target = input.axis === "MINOR_AXIS"
    ? { N_N: 0, Mx_Nm: 0, My_Nm: demandNm }
    : { N_N: 0, Mx_Nm: demandNm, My_Nm: 0 };
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
    return undetermined(input, "MECHANICS_REFERENCE", "CHECK_UNDETERMINED", ["EQUILIBRIUM_NOT_CONVERGED"], usContext);
  }
  const na = neutralAxisFromStrainState(solved.strain);
  if (US_NEUTRAL_AXIS_EQUALS_ACI_CODE_STRENGTH_STATE || na.labelledCodeCapacity) fail("neutral axis is not an ACI code strength state");
  if (ELASTIC_RC_REFERENCE_EQUALS_ACI_FLEXURAL_STRENGTH) fail("elastic RC reference is not ACI flexural strength");
  const mechanicsMoment = input.axis === "MINOR_AXIS" ? solved.resultants.My_Nm : solved.resultants.Mx_Nm;
  const mechanicsRatio = mechanicsMoment === 0 ? null : Math.abs(demandNm / mechanicsMoment);
  if (MECHANICS_RATIO_LABELLED_AS_ACI_CHECK) fail("mechanics ratio must not be labelled ACI utilization");
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
    geometryFingerprint,
    reinforcementFingerprint: input.layout.layoutId,
    materialRefs: [input.concrete.materialRef, input.reinforcement.materialRef],
    mechanicsState: "EQUILIBRATED",
    codeDesignState: "CHECK_UNDETERMINED",
    buildingCodeComplianceState: "CHECK_UNDETERMINED",
    checkState: "CHECK_UNDETERMINED",
    resultAuthority: "MECHANICS_REFERENCE",
    neutralAxis: { exists: na.exists, labelledAciCodeStrength: false },
    strainStateRefs: [method.technicalBasisRef],
    materialResponseRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    referenceMomentNm: mechanicsMoment,
    nominalStrengthNm: null,
    designStrengthNm: null,
    aciUtilization: null,
    mechanicsDemandRatio: mechanicsRatio,
    aciFamily: "ACI 318",
    edition: usContext.concreteStandardEdition,
    amendmentState: usContext.amendmentState,
    errataState: usContext.errataState,
    buildingCodeContextRef: usContext.buildingCodeAdoption?.adoptionId ?? null,
    localAmendmentRefs: usContext.localAmendmentSet.map((row) => row.amendmentId),
    directContractProfile: usContext.directContractProfile,
    stressBlockRuleRef: null,
    strainRuleRef: null,
    strengthReductionRuleRef: null,
    methodVersion: US_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "MECHANICS_REFERENCE",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "INDEPENDENT_MECHANICS_REFERENCE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(usContext.directContractProfile ? ["DIRECT_CONTRACT_NOT_BUILDING_CODE_COMPLIANCE"] : []),
    completeness: "STANDARD_CONTEXT_INCOMPLETE",
    labelledAciStrength: false,
    detailingComplianceImplied: false,
    statutoryUsComplianceClaimed: usContext.statutoryUsComplianceClaimed,
  };
}

function undetermined(
  input: UsConcreteFlexureInput,
  authority: UsConcreteFlexureResult["resultAuthority"],
  completeness: string,
  extra: UsFlexureWarningCode[],
  usContext: UsConcreteCalculationContext | null,
): UsConcreteFlexureResult {
  const actions = consumeD1cSectionActions(input.demand);
  const demandNm = input.axis === "MINOR_AXIS" ? actions.My_Nm : actions.Mx_Nm;
  return {
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    momentDemandNm: demandNm,
    geometryFingerprint: input.geometry.geometryVersion,
    reinforcementFingerprint: input.layout.layoutId,
    materialRefs: [input.concrete.materialRef, input.reinforcement.materialRef],
    mechanicsState: extra.includes("EQUILIBRIUM_NOT_CONVERGED") ? "NOT_CONVERGED" : "NOT_EVALUATED",
    codeDesignState: "CHECK_UNDETERMINED",
    buildingCodeComplianceState: "CHECK_UNDETERMINED",
    checkState: "CHECK_UNDETERMINED",
    resultAuthority: authority,
    neutralAxis: { exists: false, labelledAciCodeStrength: false },
    strainStateRefs: [],
    materialResponseRefs: [],
    referenceMomentNm: null,
    nominalStrengthNm: null,
    designStrengthNm: null,
    aciUtilization: null,
    mechanicsDemandRatio: null,
    aciFamily: "ACI 318",
    edition: usContext?.concreteStandardEdition ?? "UNKNOWN_PENDING_CONFIRMATION",
    amendmentState: usContext?.amendmentState ?? "UNKNOWN_PENDING_CONFIRMATION",
    errataState: usContext?.errataState ?? "UNKNOWN_PENDING_CONFIRMATION",
    buildingCodeContextRef: usContext?.buildingCodeAdoption?.adoptionId ?? null,
    localAmendmentRefs: usContext?.localAmendmentSet.map((row) => row.amendmentId) ?? [],
    directContractProfile: usContext?.directContractProfile ?? false,
    stressBlockRuleRef: null,
    strainRuleRef: null,
    strengthReductionRuleRef: null,
    methodVersion: US_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "NOT_APPLICABLE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(extra),
    completeness,
    labelledAciStrength: false,
    detailingComplianceImplied: false,
    statutoryUsComplianceClaimed: usContext?.statutoryUsComplianceClaimed ?? false,
  };
}

export function assertUsFlexureOptimizerRejectsUndetermined(checkState: UsConcreteFlexureResult["checkState"]): void {
  if (US_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("US concrete optimizer cannot accept CHECK_UNDETERMINED as design-valid");
}

export function assertUsParetoRejectsUndetermined(checkState: UsConcreteFlexureResult["checkState"]): void {
  if (checkState === "CHECK_UNDETERMINED") throw new Error("Pareto cannot rank CHECK_UNDETERMINED as design-feasible");
}
