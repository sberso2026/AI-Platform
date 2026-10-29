import {
  AI_EU_C3_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C3_CONFORMANCE_AUTHORITY,
  AI_EU_C3_ENGINEERING_APPROVAL,
  AI_EU_C3_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C3_NDP_AUTHORITY,
  AI_EU_C3_SOLVER_OVERRIDE_AUTHORITY,
  AI_INTERACTION_CURVE_OVERRIDE_AUTHORITY,
  LLM_EU_C3_NUMERICAL_AUTHORITY,
  PARALLEL_EU_C3_METHOD_REGISTRY_CREATED,
  PARALLEL_EU_MATERIAL_ENGINE_CREATED,
  PARALLEL_EU_PM_EQUILIBRIUM_SOLVER_CREATED,
  PARALLEL_EU_PM_INTEGRATOR_CREATED,
  PARALLEL_EU_PM_KINEMATICS_CREATED,
  PARALLEL_EU_PM_SOLVER_CREATED,
} from "@rtb/types";
import { assertEuC2AiBoundary, assertEuC2ArchitectureFreeze } from "../eu-c2";

export function assertEuC3AiBoundary(): void {
  assertEuC2AiBoundary();
  if (!AI_EU_C3_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI EU C3 assistance must remain advisory");
  if (LLM_EU_C3_NUMERICAL_AUTHORITY) throw new Error("LLM has no EU C3 numerical authority");
  if (AI_EU_C3_MATERIAL_PARAMETER_AUTHORITY) throw new Error("AI cannot alter EU C3 material parameters");
  if (AI_EU_C3_NDP_AUTHORITY) throw new Error("AI cannot select EU C3 NDP");
  if (AI_EU_C3_SOLVER_OVERRIDE_AUTHORITY) throw new Error("AI cannot override EU C3 solver results");
  if (AI_INTERACTION_CURVE_OVERRIDE_AUTHORITY) throw new Error("AI cannot override EU C3 interaction curves");
  if (AI_EU_C3_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim EU C3 conformance");
  if (AI_EU_C3_ENGINEERING_APPROVAL) throw new Error("AI cannot approve EU C3 design");
}

export function assertEuC3ArchitectureFreeze(): void {
  assertEuC2ArchitectureFreeze();
  if (
    PARALLEL_EU_PM_SOLVER_CREATED ||
    PARALLEL_EU_PM_KINEMATICS_CREATED ||
    PARALLEL_EU_PM_INTEGRATOR_CREATED ||
    PARALLEL_EU_PM_EQUILIBRIUM_SOLVER_CREATED ||
    PARALLEL_EU_MATERIAL_ENGINE_CREATED
  ) {
    throw new Error("parallel EU C3 P-M solver/engine is forbidden");
  }
  if (PARALLEL_EU_C3_METHOD_REGISTRY_CREATED) throw new Error("parallel EU C3 method registry is forbidden");
}
