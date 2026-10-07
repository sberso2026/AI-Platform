import {
  AI_EU_C4_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C4_CONFORMANCE_AUTHORITY,
  AI_EU_C4_ENGINEERING_APPROVAL,
  AI_EU_C4_MATERIAL_PARAMETER_AUTHORITY,
  AI_EU_C4_NDP_AUTHORITY,
  AI_EU_C4_SOLVER_OVERRIDE_AUTHORITY,
  AI_SURFACE_OVERRIDE_AUTHORITY,
  LLM_EU_C4_NUMERICAL_AUTHORITY,
  PARALLEL_EU_BIAXIAL_EQUILIBRIUM_SOLVER_CREATED,
  PARALLEL_EU_BIAXIAL_INTEGRATOR_CREATED,
  PARALLEL_EU_BIAXIAL_KINEMATICS_CREATED,
  PARALLEL_EU_BIAXIAL_MATERIAL_ENGINE_CREATED,
  PARALLEL_EU_BIAXIAL_SECTION_KERNEL_CREATED,
  PARALLEL_EU_BIAXIAL_SECTION_INTEGRATOR_CREATED,
  PARALLEL_EU_C4_METHOD_REGISTRY_CREATED,
} from "@rtb/types";
import { assertEuC3AiBoundary, assertEuC3ArchitectureFreeze } from "../eu-c3";

export function assertEuC4AiBoundary(): void {
  assertEuC3AiBoundary();
  if (!AI_EU_C4_ASSISTANCE_ADVISORY_ONLY) throw new Error("AI EU C4 assistance must remain advisory");
  if (LLM_EU_C4_NUMERICAL_AUTHORITY) throw new Error("LLM has no EU C4 numerical authority");
  if (AI_EU_C4_MATERIAL_PARAMETER_AUTHORITY) throw new Error("AI cannot alter EU C4 material parameters");
  if (AI_EU_C4_NDP_AUTHORITY) throw new Error("AI cannot select EU C4 NDP");
  if (AI_EU_C4_SOLVER_OVERRIDE_AUTHORITY) throw new Error("AI cannot override EU C4 solver results");
  if (AI_SURFACE_OVERRIDE_AUTHORITY) throw new Error("AI cannot override EU C4 interaction surfaces");
  if (AI_EU_C4_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim EU C4 conformance");
  if (AI_EU_C4_ENGINEERING_APPROVAL) throw new Error("AI cannot approve EU C4 design");
}

export function assertEuC4ArchitectureFreeze(): void {
  assertEuC3ArchitectureFreeze();
  if (
    PARALLEL_EU_BIAXIAL_SECTION_KERNEL_CREATED ||
    PARALLEL_EU_BIAXIAL_MATERIAL_ENGINE_CREATED ||
    PARALLEL_EU_BIAXIAL_SECTION_INTEGRATOR_CREATED ||
    PARALLEL_EU_BIAXIAL_KINEMATICS_CREATED ||
    PARALLEL_EU_BIAXIAL_EQUILIBRIUM_SOLVER_CREATED ||
    PARALLEL_EU_BIAXIAL_INTEGRATOR_CREATED
  ) {
    throw new Error("parallel EU C4 biaxial kernel/solver is forbidden");
  }
  if (PARALLEL_EU_C4_METHOD_REGISTRY_CREATED) throw new Error("parallel EU C4 method registry is forbidden");
}
