import {
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_C1C_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_RULE_PARAMETER_AUTHORITY,
  AI_SOURCE_CONFLICT_AUTHORITY,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_C1C_CONCRETE_COMPRESSION_PARAMETER_GUESSED,
  EU_C1C_CONCRETE_DESIGN_PROPERTIES_GUESSED,
  EU_C1C_CONCRETE_STRAIN_LIMIT_GUESSED,
  EU_C1C_GAMMA_C_GUESSED,
  EU_C1C_GAMMA_S_GUESSED,
  EU_C1C_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE,
  EU_C1C_NDP_VALUE_GUESSED,
  EU_C1C_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_C1C_REINFORCEMENT_DESIGN_PROPERTIES_GUESSED,
  EU_C1C_REINFORCEMENT_RESPONSE_PARAMETER_GUESSED,
  EU_C1C_REINFORCEMENT_STRAIN_STATE_GUESSED,
  EU_C1C_SECTION_MODEL_PARAMETER_GUESSED,
  EU_C1C_SOURCE_CONFLICT_FAILS_CLOSED,
  EU_C1C_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION,
  GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1C_RULE,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_EU_C1C_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
} from "@rtb/types";
import { assertEuC1cEvidenceLoaded } from "./inventory";

export function assertEuC1cNoGuessedParameters(): void {
  if (EU_C1C_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE) {
    throw new Error("C1C must not implement a rule without governed evidence");
  }
  if (EU_C1C_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT !== 0) {
    throw new Error("C1C must not introduce unprovenanced engineering constants");
  }
  if (
    EU_C1C_CONCRETE_DESIGN_PROPERTIES_GUESSED ||
    EU_C1C_REINFORCEMENT_DESIGN_PROPERTIES_GUESSED ||
    EU_C1C_GAMMA_C_GUESSED ||
    EU_C1C_GAMMA_S_GUESSED ||
    EU_C1C_CONCRETE_COMPRESSION_PARAMETER_GUESSED ||
    EU_C1C_CONCRETE_STRAIN_LIMIT_GUESSED ||
    EU_C1C_REINFORCEMENT_RESPONSE_PARAMETER_GUESSED ||
    EU_C1C_REINFORCEMENT_STRAIN_STATE_GUESSED ||
    EU_C1C_SECTION_MODEL_PARAMETER_GUESSED ||
    EU_C1C_NDP_VALUE_GUESSED
  ) {
    throw new Error("C1C must not guess design, factor, constitutive, strain, section-model, or NDP values");
  }
  if (LLM_MEMORY_ONLY_RULE_ALLOWED || LLM_EU_C1C_NUMERICAL_AUTHORITY) {
    throw new Error("LLM must not originate C1C numerical rules");
  }
}

export function assertEuC1cCopyrightAndAnnexBoundary(): void {
  if (LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION) {
    throw new Error("licensed standard document must not be an implementation gate");
  }
  if (STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME || STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY) {
    throw new Error("standard document must not be required at runtime or in-repository");
  }
  if (FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION || COPYRIGHTED_STANDARD_TEXT_REPRODUCED) {
    throw new Error("copyrighted standard text must not be required or reproduced");
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX || NATIONAL_ANNEX_INFERRED_FROM_LOCATION) {
    throw new Error("National Annex must not be defaulted or inferred from location");
  }
}

export function assertEuC1cAiBoundary(): void {
  if (!AI_EU_C1C_ASSISTANCE_ADVISORY_ONLY) throw new Error("C1C AI assistance must remain advisory");
  if (AI_RULE_PARAMETER_AUTHORITY || AI_SOURCE_CONFLICT_AUTHORITY || AI_NDP_AUTHORITY || AI_CONFORMANCE_AUTHORITY || AI_ENGINEERING_APPROVAL) {
    throw new Error("AI must not hold C1C parameter, conflict, NDP, conformance, or approval authority");
  }
  if (GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1C_RULE || EU_C1C_OPTIMIZATION_ACCEPTS_UNDETERMINED) {
    throw new Error("generative override and undetermined optimization are forbidden");
  }
  if (!EU_C1C_SOURCE_CONFLICT_FAILS_CLOSED) throw new Error("C1C source conflicts must fail closed");
}

export function assertEuC1cFailClosed(): void {
  assertEuC1cEvidenceLoaded();
  assertEuC1cNoGuessedParameters();
  assertEuC1cCopyrightAndAnnexBoundary();
  assertEuC1cAiBoundary();
}
