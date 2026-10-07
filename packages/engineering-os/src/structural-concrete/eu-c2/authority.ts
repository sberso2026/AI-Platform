import {
  AI_EU_C2_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C2_CONFORMANCE_AUTHORITY,
  AI_EU_C2_ENGINEERING_APPROVAL,
  AI_EU_C2_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C2_NDP_AUTHORITY,
  AI_SOLVER_OVERRIDE_AUTHORITY,
  LLM_EU_C2_NUMERICAL_AUTHORITY,
  PARALLEL_EU_C2_METHOD_REGISTRY_CREATED,
  PARALLEL_EU_EQUILIBRIUM_SOLVER_CREATED,
  PARALLEL_EU_FLEXURE_SOLVER_CREATED,
  PARALLEL_EU_STRAIN_KINEMATICS_CREATED,
} from "@rtb/types";
import { assertEuFlexureAiBoundary } from "../eu-flexure/authority";

export function assertEuC2AiBoundary(): void {
  assertEuFlexureAiBoundary();
  if (!AI_EU_C2_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI EU C2 assistance must remain advisory");
  if (LLM_EU_C2_NUMERICAL_AUTHORITY) throw new Error("LLM has no EU C2 numerical authority");
  if (AI_EU_C2_MATERIAL_PARAMETER_AUTHORITY) throw new Error("AI cannot alter EU C2 material parameters");
  if (AI_EU_C2_NDP_AUTHORITY) throw new Error("AI cannot select EU C2 NDP");
  if (AI_SOLVER_OVERRIDE_AUTHORITY) throw new Error("AI cannot override EU C2 solver results");
  if (AI_EU_C2_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim EU C2 conformance");
  if (AI_EU_C2_ENGINEERING_APPROVAL) throw new Error("AI cannot approve EU C2 design");
}

export function assertEuC2ArchitectureFreeze(): void {
  if (PARALLEL_EU_FLEXURE_SOLVER_CREATED || PARALLEL_EU_EQUILIBRIUM_SOLVER_CREATED || PARALLEL_EU_STRAIN_KINEMATICS_CREATED) {
    throw new Error("parallel EU C2 solver/kinematics is forbidden");
  }
  if (PARALLEL_EU_C2_METHOD_REGISTRY_CREATED) throw new Error("parallel EU C2 method registry is forbidden");
}
