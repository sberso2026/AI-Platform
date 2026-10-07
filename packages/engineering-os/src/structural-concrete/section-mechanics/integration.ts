import type {
  ConcreteMaterial,
  RcConcreteTensionTreatment,
  RcCrackState,
  RcGeneralizedStrainState,
  RcMaterialResponse,
  RcReinforcementDisplacementTreatment,
  RcSectionGeometryInput,
  RcSectionResultants,
  ReinforcementLayout,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  DEFAULT_CONCRETE_CRACKING_MODEL,
  LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY,
  RC_NUMERICAL_TOLERANCE,
  RC_SECTION_SIGN_CONVENTIONS,
} from "@rtb/types";
import { evaluateBarGeometry } from "./bars";
import { discretizeSection } from "./discretization";
import { strainAtPoint } from "./kinematics";
import { evaluateLinearElasticConcrete, evaluateLinearElasticReinforcement } from "./material-response";
import { failClosed, nMmToNm } from "./units";

export type RcConcreteFiberResponse = (
  material: ConcreteMaterial,
  strain: number,
  tensionTreatment: RcConcreteTensionTreatment,
  provenanceRef: string,
) => RcMaterialResponse;

export type RcReinforcementPointResponse = (
  material: ReinforcementMaterial,
  strain: number,
  provenanceRef: string,
) => RcMaterialResponse;

export type RcSectionIntegrationInput = {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  strain: RcGeneralizedStrainState;
  displacementTreatment: RcReinforcementDisplacementTreatment;
  crackState: RcCrackState;
  resolutionX?: number;
  resolutionY?: number;
  provenanceRef: string;
  tensionTreatment?: RcConcreteTensionTreatment;
  concreteResponse?: RcConcreteFiberResponse;
  reinforcementResponse?: RcReinforcementPointResponse;
  concreteModelId?: string;
  reinforcementModelId?: string;
  resultAuthority?: RcSectionResultants["resultAuthority"];
};

export function integrateSectionWithMaterialResponse(input: RcSectionIntegrationInput): RcSectionResultants {
  if (DEFAULT_CONCRETE_CRACKING_MODEL) failClosed("default cracking model is forbidden");
  if (input.crackState !== "UNCRACKED_REFERENCE" && input.crackState !== "CRACK_STATE_NOT_EVALUATED") {
    failClosed("unsupported crack state");
  }
  if (LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY) failClosed("elastic reference is not code capacity");
  const mesh = discretizeSection(input.geometry, input.resolutionX ?? 40, input.resolutionY ?? 40);
  const bars = evaluateBarGeometry(input.layout, input.geometry);
  const tensionTreatment = input.tensionTreatment ?? "ELASTIC_TENSION";
  const concreteResponse = input.concreteResponse ?? evaluateLinearElasticConcrete;
  const reinforcementResponse = input.reinforcementResponse ?? evaluateLinearElasticReinforcement;
  let N = 0;
  let MxNmm = 0;
  let MyNmm = 0;
  const y0 = input.strain.originMm.yMm;
  const x0 = input.strain.originMm.xMm;
  const occupied = new Set<number>();
  if (input.displacementTreatment === "SUBTRACT_REINFORCEMENT_AREA") {
    for (const bar of bars.bars) occupied.add(bar.xMm * 1e9 + bar.yMm);
  } else if (input.displacementTreatment !== "CONCRETE_GROSS_SEPARATE" && input.displacementTreatment !== "OTHER_GOVERNED_TREATMENT") {
    failClosed("reinforcement displacement treatment must be explicit");
  }
  for (const fiber of mesh.fibers) {
    if (input.displacementTreatment === "SUBTRACT_REINFORCEMENT_AREA") {
      const hit = bars.bars.some((bar) => Math.hypot(bar.xMm - fiber.centroidMm.xMm, bar.yMm - fiber.centroidMm.yMm) <= (bar.diameterMm ?? 0) / 2);
      if (hit) continue;
    }
    const eps = strainAtPoint(input.strain, fiber.centroidMm);
    const response = concreteResponse(input.concrete, eps, tensionTreatment, input.provenanceRef);
    const forceN = response.stressMPa * fiber.areaMm2;
    const IownX = (fiber.widthMm * fiber.heightMm ** 3) / 12;
    const IownY = (fiber.heightMm * fiber.widthMm ** 3) / 12;
    const tangent = response.tangentMPa ?? 0;
    N += forceN;
    MxNmm += -forceN * (fiber.centroidMm.yMm - y0) + tangent * input.strain.curvatureXPerMm * IownX;
    MyNmm += -forceN * (fiber.centroidMm.xMm - x0) + tangent * input.strain.curvatureYPerMm * IownY;
  }
  for (const bar of bars.bars) {
    const eps = strainAtPoint(input.strain, { xMm: bar.xMm, yMm: bar.yMm });
    const response = reinforcementResponse(input.reinforcement, eps, input.provenanceRef);
    const forceN = response.stressMPa * bar.areaMm2;
    N += forceN;
    MxNmm += -forceN * (bar.yMm - y0);
    MyNmm += -forceN * (bar.xMm - x0);
  }
  void occupied;
  const usingDefaultElastic = !input.concreteResponse && !input.reinforcementResponse;
  return {
    resultAuthority: input.resultAuthority ?? (usingDefaultElastic ? "ELASTIC_REFERENCE" : "MECHANICS_REFERENCE"),
    N_N: N,
    Mx_Nm: nMmToNm(MxNmm),
    My_Nm: nMmToNm(MyNmm),
    unitForce: "N",
    unitMoment: "N.m",
    signConvention: RC_SECTION_SIGN_CONVENTIONS,
    geometryVersion: input.geometry.geometryVersion,
    reinforcementLayoutVersion: input.layout.layoutId,
    generalizedStrainState: input.strain,
    concreteModelId: input.concreteModelId ?? "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    reinforcementModelId: input.reinforcementModelId ?? "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE",
    integrationAlgorithm: "CARTESIAN_CELL_PLUS_BAR_POINTS",
    tolerances: RC_NUMERICAL_TOLERANCE,
    displacementTreatment: input.displacementTreatment,
    crackState: input.crackState,
    labelledCodeCapacity: false,
    provenanceRef: input.provenanceRef,
  };
}

export function integrateElasticSection(input: RcSectionIntegrationInput): RcSectionResultants {
  return integrateSectionWithMaterialResponse({
    ...input,
    concreteResponse: evaluateLinearElasticConcrete,
    reinforcementResponse: evaluateLinearElasticReinforcement,
    concreteModelId: "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    reinforcementModelId: "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE",
    resultAuthority: "ELASTIC_REFERENCE",
  });
}

export const RC_ELASTIC_REFERENCE_EXCLUSIONS = [
  "cracking",
  "tension stiffening",
  "creep",
  "shrinkage",
  "nonlinear concrete",
  "reinforcement yield",
  "code stress blocks",
  "ultimate strength",
] as const;

export function uncrackedElasticSectionReference(input: Parameters<typeof integrateElasticSection>[0]): RcSectionResultants {
  if (input.crackState !== "UNCRACKED_REFERENCE") failClosed("uncracked elastic reference requires UNCRACKED_REFERENCE crack state");
  return integrateElasticSection(input);
}
