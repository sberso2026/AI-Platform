import {
  AI_ACI_CONFORMANCE_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_STRAIN_THRESHOLD_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AI_STRESS_BLOCK_AUTHORITY,
  AU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  AUTOMATIC_US_CONCRETE_APPROVAL,
  COMMON_RC_SECTION_KERNEL_REUSED,
  EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_US_CONCRETE_NUMERICAL_AUTHORITY,
  PARALLEL_AU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_EU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_US_RC_SECTION_SOLVER_CREATED,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE,
  THREE_JURISDICTION_RC_KERNEL_REUSE_AUDIT,
  US_CONCRETE_COMPRESSION_PARAMETER_GUESSED,
  US_CONCRETE_ULTIMATE_STRAIN_GUESSED,
  US_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL,
  US_FLEXURE_STRAIN_THRESHOLD_GUESSED,
  US_FLEXURE_STRENGTH_REDUCTION_FACTOR_GUESSED,
  US_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  US_REINFORCEMENT_STRAIN_LIMIT_GUESSED,
  US_STRESS_BLOCK_PARAMETER_GUESSED,
  type EngineeringRuleAuthorityType,
} from "@rtb/types";
import { assertConcreteEngineeringRuleAuthority } from "../authority";
import { assertEuConcreteReusesD1e1Kernel } from "../eu-standard/kernel";
import { assertAiUsConcreteAssistanceAdvisoryOnly } from "../us-standard/authority";
import { assertUsConcreteReusesD1e1Kernel } from "../us-standard/kernel";

export function assertUsFlexureRuleAuthority(authorityType: EngineeringRuleAuthorityType): void {
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory-only rules are forbidden");
  assertConcreteEngineeringRuleAuthority(authorityType);
}

export function assertUsFlexureAiBoundary(): void {
  assertAiUsConcreteAssistanceAdvisoryOnly();
  if (LLM_US_CONCRETE_NUMERICAL_AUTHORITY) throw new Error("LLM has no US concrete numerical authority");
  if (AI_STRESS_BLOCK_AUTHORITY || US_STRESS_BLOCK_PARAMETER_GUESSED || US_CONCRETE_COMPRESSION_PARAMETER_GUESSED) {
    throw new Error("AI cannot invent stress-block parameters");
  }
  if (AI_STRENGTH_FACTOR_AUTHORITY || US_FLEXURE_STRENGTH_REDUCTION_FACTOR_GUESSED) {
    throw new Error("AI cannot invent strength-reduction factor");
  }
  if (AI_STRAIN_THRESHOLD_AUTHORITY || US_CONCRETE_ULTIMATE_STRAIN_GUESSED || US_REINFORCEMENT_STRAIN_LIMIT_GUESSED || US_FLEXURE_STRAIN_THRESHOLD_GUESSED) {
    throw new Error("AI cannot invent strain limits or thresholds");
  }
  if (AI_ACI_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim ACI conformance");
  if (AI_BUILDING_CODE_COMPLIANCE_AUTHORITY) throw new Error("AI cannot claim building-code compliance");
  if (AI_ENGINEERING_APPROVAL || AUTOMATIC_US_CONCRETE_APPROVAL || US_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("AI cannot approve US concrete design");
  }
  if (STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE) {
    throw new Error("steel LRFD/ASD semantics must not be reused for US RC flexure");
  }
}

export function assertCodeParameterNotGuessed(value: number | null | undefined, label: string): void {
  if (value != null) throw new Error(`US concrete flexure fail closed: ${label} must not be guessed`);
}

export function assertUsGenerativeCannotChangeStandardContext(attempted: boolean): void {
  if (GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT || attempted) {
    throw new Error("generative optimizer cannot alter US standard context");
  }
}

export function assertThreeJurisdictionRcKernelReuse(): void {
  if (THREE_JURISDICTION_RC_KERNEL_REUSE_AUDIT !== "PASS") {
    throw new Error("three-jurisdiction RC kernel reuse audit must pass");
  }
  if (!COMMON_RC_SECTION_KERNEL_REUSED) throw new Error("common RC section kernel must be reused");
  if (PARALLEL_AU_RC_SECTION_SOLVER_CREATED || PARALLEL_EU_RC_SECTION_SOLVER_CREATED || PARALLEL_US_RC_SECTION_SOLVER_CREATED) {
    throw new Error("parallel jurisdiction RC section solvers are forbidden");
  }
  if (AU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL || EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL || US_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL) {
    throw new Error("jurisdiction concrete parameters must not leak into the common kernel");
  }
  assertUsConcreteReusesD1e1Kernel();
  assertEuConcreteReusesD1e1Kernel();
}
