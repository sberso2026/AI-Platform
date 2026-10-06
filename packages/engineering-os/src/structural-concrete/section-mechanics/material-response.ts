import type {
  ConcreteMaterial,
  RcConcreteTensionTreatment,
  RcMaterialResponse,
  RcMaterialResponseState,
  ReinforcementMaterial,
} from "@rtb/types";
import {
  CODE_STRESS_BLOCK_IN_COMMON_KERNEL,
  CONCRETE_E_DERIVED_FROM_UNGOVERNED_GRADE,
  DEFAULT_CONCRETE_CRACKING_MODEL,
  DEFAULT_CONCRETE_ULTIMATE_STRAIN,
  DEFAULT_REINFORCEMENT_STRAIN_LIMIT,
  GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED,
  LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  RC_COMMON_MECHANICS_AUTHORITY_TYPE,
  RC_SECTION_MECHANICS_METHOD_VERSION,
} from "@rtb/types";
import { assertGovernedConcreteProperty, assertGradeDoesNotSynthesizeProperties } from "../materials";
import { assertFiniteNumber, failClosed, governedModulusMPa } from "./units";

export function linearElasticConcreteModel(material: ConcreteMaterial, tensionTreatment: RcConcreteTensionTreatment): RcMaterialResponseState {
  if (CODE_STRESS_BLOCK_IN_COMMON_KERNEL || GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED) {
    failClosed("code stress block must not enter the common kernel");
  }
  if (DEFAULT_CONCRETE_CRACKING_MODEL) failClosed("default concrete cracking model is forbidden");
  if (DEFAULT_CONCRETE_ULTIMATE_STRAIN) failClosed("default concrete ultimate strain is forbidden");
  if (CONCRETE_E_DERIVED_FROM_UNGOVERNED_GRADE) failClosed("E must not be derived from ungoverned grade");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) failClosed("LLM memory-only material law is forbidden");
  assertGradeDoesNotSynthesizeProperties(material);
  assertGovernedConcreteProperty(material.elasticModulus, "concrete.elasticModulus");
  if (!tensionTreatment) failClosed("concrete tension response must be explicit");
  return {
    modelId: "RC_LINEAR_ELASTIC_CONCRETE_REFERENCE",
    authorityType: RC_COMMON_MECHANICS_AUTHORITY_TYPE,
    technicalBasis: "Hooke's law with explicitly governed E; uncracked reference only",
    applicability: "bounded linear-elastic concrete reference; not code capacity",
    requiredProperties: ["elasticModulus"],
    implementationVersion: RC_SECTION_MECHANICS_METHOD_VERSION,
    validationState: "MECHANICS_REFERENCE",
    labelledCodeCapacity: false,
  };
}

export function linearElasticReinforcementModel(material: ReinforcementMaterial): RcMaterialResponseState {
  if (DEFAULT_REINFORCEMENT_STRAIN_LIMIT) failClosed("default reinforcement strain limit is forbidden");
  assertGovernedConcreteProperty(material.elasticModulus, "reinforcement.elasticModulus");
  return {
    modelId: "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE",
    authorityType: RC_COMMON_MECHANICS_AUTHORITY_TYPE,
    technicalBasis: "Hooke's law with explicitly governed Es; elastic reference, no yield implication",
    applicability: "bounded linear-elastic reinforcement reference; not code capacity",
    requiredProperties: ["elasticModulus"],
    implementationVersion: RC_SECTION_MECHANICS_METHOD_VERSION,
    validationState: "MECHANICS_REFERENCE",
    labelledCodeCapacity: false,
  };
}

export function evaluateLinearElasticConcrete(
  material: ConcreteMaterial,
  strain: number,
  tensionTreatment: RcConcreteTensionTreatment,
  provenanceRef: string,
): RcMaterialResponse {
  const model = linearElasticConcreteModel(material, tensionTreatment);
  const e = material.elasticModulus;
  if (!e || typeof e.value !== "number") failClosed("governed concrete E missing");
  const E = governedModulusMPa(e.value, e.unit ?? "", "concrete.E");
  const eps = assertFiniteNumber(strain, "concrete strain");
  let stress = E * eps;
  if (tensionTreatment === "NO_TENSION" && stress > 0) stress = 0;
  if (LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY) failClosed("elastic reference is not code capacity");
  return {
    stressMPa: stress,
    tangentMPa: tensionTreatment === "NO_TENSION" && stress === 0 && eps > 0 ? 0 : E,
    responseState: model.modelId,
    provenanceRef,
  };
}

export function evaluateLinearElasticReinforcement(material: ReinforcementMaterial, strain: number, provenanceRef: string): RcMaterialResponse {
  const model = linearElasticReinforcementModel(material);
  const e = material.elasticModulus;
  if (!e || typeof e.value !== "number") failClosed("governed reinforcement E missing");
  const Es = governedModulusMPa(e.value, e.unit ?? "", "reinforcement.E");
  return {
    stressMPa: Es * assertFiniteNumber(strain, "reinforcement strain"),
    tangentMPa: Es,
    responseState: model.modelId,
    provenanceRef,
  };
}

export function modularRatio(concrete: ConcreteMaterial, reinforcement: ReinforcementMaterial): number {
  const ec = concrete.elasticModulus;
  const es = reinforcement.elasticModulus;
  if (!ec || typeof ec.value !== "number") failClosed("governed concrete E missing for modular ratio");
  if (!es || typeof es.value !== "number") failClosed("governed reinforcement E missing for modular ratio");
  const Ec = governedModulusMPa(ec.value, ec.unit ?? "", "concrete.E");
  const Es = governedModulusMPa(es.value, es.unit ?? "", "reinforcement.E");
  if (!(Ec > 0)) failClosed("modular ratio cannot be guessed");
  return Es / Ec;
}
