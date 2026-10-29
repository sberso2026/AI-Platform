import type {
  ConcreteMaterial,
  EuConcreteFlexureResult,
  EuConcreteResolverInput,
  EuC2MethodId,
  EuFlexureAxis,
  EuFlexureWarningCode,
  EurocodeConcreteCalculationContext,
  RcSectionGeometryInput,
  ReinforcementLayout,
  ReinforcementMaterial,
  StructuralDemandResult,
} from "@rtb/types";
import {
  DEFAULT_EU_CONCRETE_CARBON_FACTOR,
  DEFAULT_EU_CONCRETE_COST_RATE,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR,
  ELASTIC_RC_REFERENCE_EQUALS_EN1992_FLEXURAL_RESISTANCE,
  EU_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_FLEXURE_IMPLEMENTATION_VERSION,
  EU_FLEXURE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  EU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND,
  EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE,
  EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  EU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE,
  MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK,
  PARALLEL_EU_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_EU_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_EU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_EU_SECTION_INTEGRATOR_CREATED,
  PARALLEL_EU_STANDARD_CONTEXT_CREATED,
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
import { resolveEurocodeConcreteContext } from "../eu-standard/resolver";
import { EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY as PARTIAL_FACTOR_SLOT, EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY as STRAIN_SLOT, EU_CONCRETE_STRESS_BLOCK_DEPENDENCY as STRESS_SLOT } from "../eu-standard/profiles";
import type { EuC1cConstitutiveContext } from "../eu-c1c-constitutive";
import { evaluateEuC2UniaxialFlexureResistance, euC2MomentSignFromDemand } from "../eu-c2";
import { assertCodeParameterNotGuessed, assertEuFlexureAiBoundary, assertEuFlexureRuleAuthority, assertGenerativeCannotChangeStandardContext } from "./authority";
import { assertEuFlexureMaterialGovernance, assertPureEuFlexureApplicability, toEuFlexureContext } from "./context";
import { euFlexureFingerprint, sectionLayoutFingerprint } from "./invalidation";
import { EU_CONCRETE_FLEXURE_METHODS } from "./registry";

export type EuConcreteFlexureInput = {
  methodId: string;
  axis: EuFlexureAxis;
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  demand: StructuralDemandResult;
  resolverInput: EuConcreteResolverInput;
  constitutiveContext?: EuC1cConstitutiveContext;
  generativeAttemptedStandardContextChange?: boolean;
};

function c2ResultFields(partial: Partial<EuConcreteFlexureResult> = {}): Pick<
  EuConcreteFlexureResult,
  | "methodId"
  | "momentSign"
  | "resistanceMomentNm"
  | "resistanceMomentUnit"
  | "designRuleResistanceNm"
  | "designRuleUtilization"
  | "resistanceAuthorityLayer"
  | "equilibriumResidualN"
  | "geometryFingerprint"
  | "resultFingerprint"
  | "integrationConfiguration"
  | "solverConfiguration"
  | "constitutiveParameterVersion"
> {
  return {
    methodId: "",
    momentSign: null,
    resistanceMomentNm: null,
    resistanceMomentUnit: "N.m",
    designRuleResistanceNm: null,
    designRuleUtilization: null,
    resistanceAuthorityLayer: null,
    equilibriumResidualN: null,
    geometryFingerprint: null,
    resultFingerprint: null,
    integrationConfiguration: null,
    solverConfiguration: null,
    constitutiveParameterVersion: null,
    ...partial,
  };
}

function fail(message: string): never {
  throw new Error(`EU concrete flexure fail closed: ${message}`);
}

function warningsForCodeGap(extra: EuFlexureWarningCode[] = []): EuFlexureWarningCode[] {
  return [
    "MECHANICS_REFERENCE_ONLY",
    "EN1992_DESIGN_METHOD_UNAVAILABLE",
    "STANDARD_EDITION_UNCONFIRMED",
    "DESIGN_MODEL_AUTHORITY_MISSING",
    "PARTIAL_FACTOR_MISSING",
    "STRAIN_LIMIT_AUTHORITY_MISSING",
    "VALIDATION_REQUIRED",
    "HUMAN_ENGINEERING_REVIEW_REQUIRED",
    "NOT_APPROVED_FOR_CONSTRUCTION",
    ...extra,
  ];
}

function resolvedContext(input: EuConcreteFlexureInput): EurocodeConcreteCalculationContext | { undetermined: EuConcreteFlexureResult } {
  const resolved = resolveEurocodeConcreteContext(input.resolverInput);
  if (!resolved.ok) {
    const extra: EuFlexureWarningCode[] = [];
    if (resolved.failReason === "NATIONAL_ANNEX_REQUIRED") extra.push("NATIONAL_ANNEX_MISSING");
    if (resolved.failReason === "NDP_REQUIRED") extra.push("NDP_MISSING");
    return { undetermined: undetermined(input, "CODE_PROFILE_REFERENCE", resolved.failReason, extra, null) };
  }
  return resolved.context;
}

export function evaluateEuConcreteFlexure(input: EuConcreteFlexureInput): EuConcreteFlexureResult {
  assertEuFlexureAiBoundary();
  assertGenerativeCannotChangeStandardContext(input.generativeAttemptedStandardContextChange === true);
  if (PARALLEL_EU_RC_SECTION_SOLVER_CREATED || PARALLEL_EU_SECTION_INTEGRATOR_CREATED || PARALLEL_EU_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED || PARALLEL_EU_NEUTRAL_AXIS_SOLVER_CREATED) {
    fail("parallel EU section solver is forbidden");
  }
  if (PARALLEL_EU_STANDARD_CONTEXT_CREATED) fail("parallel EU standard context is forbidden");
  if (EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL) fail("Eurocode parameters must not leak into the common kernel");
  if (EU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND) fail("EU flexure must not recalculate structural demand");
  if (GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE) fail("geometric clearance is not EN 1992 cover compliance");
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX) fail("default EU National Annex is forbidden");
  if (EU_FLEXURE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION) fail("National Annex must not be inferred from user location");
  if (DEFAULT_EU_CONCRETE_COST_RATE || DEFAULT_EU_CONCRETE_CARBON_FACTOR || DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR) {
    fail("default EU cost/carbon factors are forbidden");
  }
  if (EU_CONCRETE_PACK_CERTIFIED) fail("EU concrete pack is not certified");
  assertEuFlexureMaterialGovernance(input.concrete, input.reinforcement);
  const method = EU_CONCRETE_FLEXURE_METHODS.find((row) => row.methodId === input.methodId);
  if (!method) fail("unvalidated method requested as validated");
  if (method.axis !== input.axis) fail("method axis mismatch");
  if (!method.part) fail("missing standard part");
  assertEuFlexureRuleAuthority(method.authorityType);
  assertCodeParameterNotGuessed(STRESS_SLOT.parameters.eta.value, "stress-block eta");
  assertCodeParameterNotGuessed(STRESS_SLOT.parameters.lambda.value, "stress-block lambda");
  assertCodeParameterNotGuessed(PARTIAL_FACTOR_SLOT.concreteMaterial.value, "gamma_c");
  assertCodeParameterNotGuessed(PARTIAL_FACTOR_SLOT.reinforcementMaterial.value, "gamma_s");
  assertCodeParameterNotGuessed(STRAIN_SLOT.ultimateConcreteStrain.value, "ultimate concrete strain");
  assertCodeParameterNotGuessed(STRAIN_SLOT.reinforcementStrainLimit.value, "reinforcement strain limit");

  computeGrossSectionProperties(input.geometry);
  evaluateBarGeometry(input.layout, input.geometry);
  geometricClearances(input.layout, input.geometry);

  const resolverForMethod: EuConcreteResolverInput = {
    ...input.resolverInput,
    requestedPartId: method.part,
    ruleRequiresNdp: method.nationalAnnexDependency,
    requiredNdpIds: [],
  };
  const ctxOrFail = resolvedContext({ ...input, resolverInput: resolverForMethod });
  if ("undetermined" in ctxOrFail) return ctxOrFail.undetermined;
  const euContext = ctxOrFail;
  if (euContext.standardPart !== method.part) fail("method cannot silently use another standard part");

  const actions = consumeD1cSectionActions(input.demand);
  try {
    assertPureEuFlexureApplicability(actions.N_N);
  } catch {
    return undetermined(input, method.outputSemantics === "CODE_DESIGN_RESISTANCE" ? "CODE_PROFILE_REFERENCE" : "MECHANICS_REFERENCE", "UNSUPPORTED_SCOPE", ["UNSUPPORTED_AXIAL_ACTION"], euContext);
  }

  const demandNm = actions.Mx_Nm;
  if (!Number.isFinite(demandNm)) fail("missing demand");

  toEuFlexureContext({
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    layoutId: input.layout.layoutId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    euContext,
    provenance: input.demand.provenanceRef,
  });
  void sectionLayoutFingerprint(input.geometry, input.layout, input.concrete.materialRef, input.reinforcement.materialRef);
  void euFlexureFingerprint({
    memberRef: input.demand.memberId,
    sectionGeometryVersion: input.geometry.geometryVersion,
    reinforcementFingerprint: input.layout.layoutId,
    concreteMaterialRef: input.concrete.materialRef,
    reinforcementMaterialRef: input.reinforcement.materialRef,
    momentDemandRef: actions.demandResultId,
    combinationId: input.demand.combinationId,
    d1cRevision: input.demand.toolVersion,
    standardFamily: "EN 1992",
    generation: euContext.version.generationFamily,
    edition: euContext.version.edition,
    part: euContext.standardPart,
    nationalAnnexRef: euContext.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euContext.nationalAnnex?.nationalParameterSetRef ?? null,
    materialModelRef: "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    stressBlockOrDesignModelRef: null,
    strainLimitRuleRef: null,
    partialFactorRef: null,
    methodVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
  });

  if (method.methodType === "EN1992_UNIAXIAL_FLEXURE") {
    if (!input.constitutiveContext) {
      const extra: EuFlexureWarningCode[] = [];
      if (!euContext.nationalAnnex) extra.push("NATIONAL_ANNEX_MISSING");
      extra.push("NDP_MISSING");
      return undetermined(input, "CODE_PROFILE_REFERENCE", "STANDARD_CONTEXT_INCOMPLETE", extra, euContext);
    }
    const momentSign = euC2MomentSignFromDemand(demandNm);
    const solved = evaluateEuC2UniaxialFlexureResistance({
      methodId: method.methodId as EuC2MethodId,
      axis: input.axis,
      momentSign,
      geometry: input.geometry,
      layout: input.layout,
      concrete: input.concrete,
      reinforcement: input.reinforcement,
      context: input.constitutiveContext,
      provenanceRef: input.geometry.provenanceRef,
    });
    if (!solved.ok) {
      const extra: EuFlexureWarningCode[] = solved.failReason.includes("converge") ? ["EQUILIBRIUM_NOT_CONVERGED"] : [];
      return undetermined(
        input,
        "CODE_PROFILE_REFERENCE",
        solved.checkState === "UNSUPPORTED_SCOPE" ? "UNSUPPORTED_SCOPE" : "CHECK_UNDETERMINED",
        extra,
        euContext,
      );
    }
    const absDemand = Math.abs(demandNm);
    const absResistance = Math.abs(solved.resistanceMomentNm);
    const utilization = absResistance > 0 ? absDemand / absResistance : null;
    const checkState =
      utilization == null ? "CHECK_UNDETERMINED" : absDemand <= absResistance ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED";
    const na = neutralAxisFromStrainState(solved.strain);
    if (EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE || na.labelledCodeCapacity) fail("neutral axis is not a code resistance state");
    if (MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK) fail("mechanics ratio must not be labelled EN 1992 utilization");
    return {
      memberRef: input.demand.memberId,
      sectionRef: input.geometry.sectionId,
      axis: input.axis,
      momentDemandRef: actions.demandResultId,
      momentDemandNm: demandNm,
      mechanicsState: "EQUILIBRATED",
      codeDesignState: "CHECK_UNDETERMINED",
      checkState,
      resultAuthority: "CODE_PROFILE_REFERENCE",
      neutralAxis: { exists: na.exists, labelledCodeResistance: false },
      strainStateRefs: [method.technicalBasisRef],
      materialResponseRefs: [...method.requiredMaterialModels],
      ...c2ResultFields({
        methodId: method.methodId,
        momentSign,
        resistanceMomentNm: solved.resistanceMomentNm,
        designRuleResistanceNm: solved.resistanceMomentNm,
        designRuleUtilization: utilization,
        resistanceAuthorityLayer: solved.resistanceAuthorityLayer,
        equilibriumResidualN: solved.equilibriumResidualN,
        geometryFingerprint: solved.geometryFingerprint,
        resultFingerprint: solved.resultFingerprint,
        integrationConfiguration: solved.integrationConfiguration,
        solverConfiguration: solved.solverConfiguration,
        constitutiveParameterVersion: solved.materialRuleVersions[0] ?? null,
      }),
      referenceMomentNm: solved.resistanceMomentNm,
      nominalDesignResistanceNm: null,
      designResistanceNm: null,
      en1992Utilization: null,
      mechanicsDemandRatio: utilization,
      standardFamily: "EN 1992",
      generation: euContext.version.generationFamily,
      edition: euContext.version.edition,
      part: euContext.standardPart,
      nationalAnnexRef: euContext.nationalAnnex?.nationalAnnexId ?? null,
      ndpSetRef: euContext.nationalAnnex?.nationalParameterSetRef ?? null,
      stressBlockOrDesignModelRef: "MATERIAL_INTEGRATION",
      partialFactorRefs: method.partialFactorDependencies,
      methodVersion: method.implementationVersion,
      validationState: "NUMERICALLY_VALIDATED",
      conformanceState: "INTENDED_PROFILE",
      benchmarkState: "INDEPENDENT_NUMERICAL_REFERENCE",
      provenance: input.demand.provenanceRef,
      humanReviewState: "required",
      approvalState: "not_approved",
      warnings: [
        "STANDARD_EDITION_UNCONFIRMED",
        "VALIDATION_REQUIRED",
        "HUMAN_ENGINEERING_REVIEW_REQUIRED",
        "NOT_APPROVED_FOR_CONSTRUCTION",
      ],
      completeness: "VALIDATION_REQUIRED",
      labelledEn1992Resistance: false,
      detailingComplianceImplied: false,
      statutoryEuComplianceClaimed: euContext.statutoryEuComplianceClaimed,
    };
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
    return undetermined(input, "MECHANICS_REFERENCE", "CHECK_UNDETERMINED", ["EQUILIBRIUM_NOT_CONVERGED"], euContext);
  }
  const na = neutralAxisFromStrainState(solved.strain);
  if (EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE || na.labelledCodeCapacity) fail("neutral axis is not a code resistance state");
  if (ELASTIC_RC_REFERENCE_EQUALS_EN1992_FLEXURAL_RESISTANCE) fail("elastic RC reference is not EN 1992 flexural resistance");
  const mechanicsMoment = input.axis === "MINOR_AXIS" ? solved.resultants.My_Nm : solved.resultants.Mx_Nm;
  const mechanicsRatio = mechanicsMoment === 0 ? null : Math.abs(demandNm / mechanicsMoment);
  if (MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK) fail("mechanics ratio must not be labelled EN 1992 utilization");
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
    neutralAxis: { exists: na.exists, labelledCodeResistance: false },
    strainStateRefs: [method.technicalBasisRef],
    materialResponseRefs: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
    ...c2ResultFields({ methodId: method.methodId, momentSign: demandNm < 0 ? "NEGATIVE" : "POSITIVE" }),
    referenceMomentNm: mechanicsMoment,
    nominalDesignResistanceNm: null,
    designResistanceNm: null,
    en1992Utilization: null,
    mechanicsDemandRatio: mechanicsRatio,
    standardFamily: "EN 1992",
    generation: euContext.version.generationFamily,
    edition: euContext.version.edition,
    part: euContext.standardPart,
    nationalAnnexRef: euContext.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euContext.nationalAnnex?.nationalParameterSetRef ?? null,
    stressBlockOrDesignModelRef: null,
    partialFactorRefs: [],
    methodVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "MECHANICS_REFERENCE",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "INDEPENDENT_MECHANICS_REFERENCE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(),
    completeness: "STANDARD_CONTEXT_INCOMPLETE",
    labelledEn1992Resistance: false,
    detailingComplianceImplied: false,
    statutoryEuComplianceClaimed: euContext.statutoryEuComplianceClaimed,
  };
}

function undetermined(
  input: EuConcreteFlexureInput,
  authority: EuConcreteFlexureResult["resultAuthority"],
  completeness: string,
  extra: EuFlexureWarningCode[],
  euContext: EurocodeConcreteCalculationContext | null,
): EuConcreteFlexureResult {
  const actions = consumeD1cSectionActions(input.demand);
  const demandNm = actions.Mx_Nm;
  return {
    memberRef: input.demand.memberId,
    sectionRef: input.geometry.sectionId,
    axis: input.axis,
    momentDemandRef: actions.demandResultId,
    momentDemandNm: demandNm,
    mechanicsState: extra.includes("EQUILIBRIUM_NOT_CONVERGED") ? "NOT_CONVERGED" : "NOT_EVALUATED",
    codeDesignState: "CHECK_UNDETERMINED",
    checkState: "CHECK_UNDETERMINED",
    resultAuthority: authority,
    neutralAxis: { exists: false, labelledCodeResistance: false },
    strainStateRefs: [],
    materialResponseRefs: [],
    ...c2ResultFields({ methodId: input.methodId }),
    referenceMomentNm: null,
    nominalDesignResistanceNm: null,
    designResistanceNm: null,
    en1992Utilization: null,
    mechanicsDemandRatio: null,
    standardFamily: "EN 1992",
    generation: euContext?.version.generationFamily ?? "UNKNOWN_PENDING_CONFIRMATION",
    edition: euContext?.version.edition ?? "UNKNOWN_PENDING_CONFIRMATION",
    part: euContext?.standardPart ?? "",
    nationalAnnexRef: euContext?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euContext?.nationalAnnex?.nationalParameterSetRef ?? null,
    stressBlockOrDesignModelRef: null,
    partialFactorRefs: [],
    methodVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
    benchmarkState: "NOT_APPLICABLE",
    provenance: input.demand.provenanceRef,
    humanReviewState: "required",
    approvalState: "not_approved",
    warnings: warningsForCodeGap(extra),
    completeness,
    labelledEn1992Resistance: false,
    detailingComplianceImplied: false,
    statutoryEuComplianceClaimed: euContext?.statutoryEuComplianceClaimed ?? false,
  };
}

export function assertEuFlexureOptimizerRejectsUndetermined(checkState: EuConcreteFlexureResult["checkState"]): void {
  if (EU_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED || EU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined");
  if (checkState === "CHECK_UNDETERMINED") throw new Error("EU concrete optimizer cannot accept CHECK_UNDETERMINED as design-valid");
}

export function assertEuParetoRejectsUndetermined(checkState: EuConcreteFlexureResult["checkState"]): void {
  if (checkState === "CHECK_UNDETERMINED") throw new Error("Pareto cannot rank CHECK_UNDETERMINED as design-feasible");
}
