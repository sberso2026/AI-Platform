import type { EuC1aC2DependencyRow } from "@rtb/types";

export const EU_C1A_REQUIRED_RULE_CATEGORIES = [
  "CONCRETE_CHARACTERISTIC_PROPERTIES",
  "CONCRETE_DESIGN_PROPERTIES",
  "REINFORCEMENT_CHARACTERISTIC_PROPERTIES",
  "REINFORCEMENT_DESIGN_PROPERTIES",
  "PARTIAL_FACTORS",
  "CONCRETE_COMPRESSION_RESPONSE",
  "CONCRETE_STRAIN_LIMITS",
  "REINFORCEMENT_RESPONSE",
  "REINFORCEMENT_STRAIN_STATES",
  "STRESS_BLOCK_OR_SECTION_MODEL",
] as const;

export const EU_C1A_PLANNED_RULE_IDS = [
  "EU_C1_CONCRETE_CHAR_PROPERTIES",
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "EU_C1_REINFORCEMENT_CHAR_PROPERTIES",
  "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "EU_C1_PARTIAL_FACTOR_GAMMA_S",
  "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
  "EU_C1_CONCRETE_TENSION_TREATMENT",
  "EU_C1_CONCRETE_STRAIN_LIMITS",
  "EU_C1_REINFORCEMENT_RESPONSE",
  "EU_C1_REINFORCEMENT_STRAIN_STATES",
  "EU_C1_STRESS_BLOCK_OR_SECTION_MODEL",
] as const;

export const EU_C1A_EXISTING_GOVERNED_EVIDENCE = [
  "EN 1992 family bound by EOS-D1E-EU-1",
  "EN_1992_1_1 registered as initial general-design part",
  "generation/edition/amendment tokens UNKNOWN_PENDING_CONFIRMATION",
  "empty governed NDP catalog",
  "unpopulated EU adapter slots for gamma_c, gamma_s, ecu, esu, eta, lambda",
  "framework-intended ndpCapable flags without edition-confirmed NDP legal status",
  "authority policy forbidding LLM_MEMORY_ONLY and silent edition inference",
  "human confirmation type already required for issued Eurocode concrete context",
] as const;

export const EU_C1A_C2_DEPENDENCY_INVENTORY: readonly EuC1aC2DependencyRow[] = [
  { dependencyId: "D1E1_COMMON_RC_KERNEL", classification: "BOUND", note: "frozen D1E-1 kernel reused; not a code rule" },
  { dependencyId: "EU_STANDARD_BINDING", classification: "BOUND", note: "family/part architecture bound; edition unbound" },
  { dependencyId: "EU_FLEXURE_FRAMEWORK", classification: "BOUND", note: "EU-2 framework-only flexure pipeline exists" },
  { dependencyId: "CONCRETE_DESIGN_PROPERTIES", classification: "UNBOUND", note: "C1 numerical design-property rules not implementable until profile confirmed" },
  { dependencyId: "REINFORCEMENT_DESIGN_PROPERTIES", classification: "UNBOUND", note: "C1 numerical reinforcement design-property rules unbound" },
  { dependencyId: "PARTIAL_FACTORS", classification: "UNBOUND", note: "gamma_c/gamma_s values and NDP/base-standard class unresolved" },
  { dependencyId: "CONCRETE_COMPRESSION_RESPONSE", classification: "UNBOUND", note: "edition-sensitive constitutive/stress-block model unidentified" },
  { dependencyId: "CONCRETE_STRAIN_LIMITS", classification: "UNBOUND", note: "concrete strain parameter set not identified for a confirmed edition" },
  { dependencyId: "REINFORCEMENT_RESPONSE", classification: "UNBOUND", note: "reinforcement design-response unbound" },
  { dependencyId: "REINFORCEMENT_STRAIN_STATES", classification: "UNBOUND", note: "reinforcement strain/response limits unbound" },
  { dependencyId: "STRESS_BLOCK_OR_SECTION_MODEL", classification: "UNBOUND", note: "eta/lambda framework slots are not a confirmed generation-applicable model" },
  { dependencyId: "NATIONAL_ANNEX_NDP_CONTEXT", classification: "UNBOUND", note: "pilot annex UNBOUND; NDP catalog empty" },
];
