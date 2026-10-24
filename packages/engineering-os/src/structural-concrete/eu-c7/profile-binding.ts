import {
  C6_EXISTING_EXPLICIT_PHIEF_PATH_PRESERVED,
  C7_AUTOMATICALLY_REPLACES_EXISTING_C6_INPUT,
  EU_C7_GENERAL_NONLINEAR_FEA_IMPLEMENTED,
  EU_C7_R1_CRACK_SPACING_BAR_COEFFICIENT,
  EU_C7_R1_CRACK_SPACING_COVER_COEFFICIENT,
  EU_C7_R1_EFFECTIVE_HEIGHT_AXIS_DIVISOR,
  EU_C7_R1_EFFECTIVE_HEIGHT_COVER_FACTOR,
  EU_C7_R1_FALSE_NATIONAL_PROFILE_CLAIM,
  EU_C7_R1_K1_HIGH_BOND,
  EU_C7_R1_K1_PLAIN,
  EU_C7_R1_K2_BENDING,
  EU_C7_R1_K2_TENSION,
  EU_C7_R1_KT_LONG,
  EU_C7_R1_KT_SHORT,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R1_RUNTIME_METHOD_COUNT,
  EU_C7_R1_STRAIN_FLOOR_FACTOR,
  NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

export const EU_C7_R1_PRIMARY_SOURCE_ID = "JRC_WALRAVEN_EC2_ULS_SLS_WORKSHOP" as const;

const PROFILE_SOURCES = [EU_C7_R1_PRIMARY_SOURCE_ID] as const;

type C7Rule = {
  ruleId: string;
  ruleFamily: string;
  operations: readonly string[];
  inputParameterIds: readonly string[];
  output: string;
  units: string;
  applicability: string;
  exclusions: string;
  authorityClass: "VALIDATED_ENGINEERING_REFERENCE" | "ESTABLISHED_ENGINEERING_MECHANICS" | "SATISFIED_BY_EXISTING_RULE";
  sourceIds: readonly string[];
  classification: string;
  formulaFingerprint: string;
  validationState: "PENDING_HUMAN_ENGINEERING_REVIEW";
  profileId: typeof EU_C7_R1_REFERENCE_PROFILE_ID;
  generation: typeof EU_C7_R1_REFERENCE_PROFILE_GENERATION;
};

function rule(input: Omit<C7Rule, "formulaFingerprint" | "validationState" | "profileId" | "generation">): C7Rule {
  return {
    ...input,
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    validationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    formulaFingerprint: formulaFingerprint({
      ruleId: input.ruleId,
      operations: input.operations,
      parameterIds: input.inputParameterIds,
    }),
  };
}

export const EU_C7_R1_RULES = [
  rule({
    ruleId: "EU_C7_R1_SERVICE_COMBINATION",
    ruleFamily: "SERVICE_ACTION",
    operations: ["require_quasi_permanent_combination"],
    inputParameterIds: ["combinationCategory", "combinationLimitState"],
    output: "crack width uses an already combined quasi-permanent service action",
    units: "category",
    applicability: "ordinary reinforced concrete",
    exclusions: "ULS combinations are rejected; combination factors are not stored here",
    authorityClass: "SATISFIED_BY_EXISTING_RULE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "SATISFIED_BY_EXISTING_RULE",
  }),
  rule({
    ruleId: "EU_C7_R1_SECTION_CRACK_STATE",
    ruleFamily: "CRACKING",
    operations: ["compare_extreme_tension_with_explicit_fct"],
    inputParameterIds: ["sectionState", "fctEffMPa"],
    output: "UNCRACKED when the governed elastic extreme tension does not exceed explicit fct,eff; CRACKED otherwise",
    units: "state",
    applicability: "rectangular section, uniaxial",
    exclusions: "no interpolated transition inside the crack-width check",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C7_R1_EFFECTIVE_TENSION_HEIGHT",
    ruleFamily: "CRACKING",
    operations: ["min_of_governed_candidates"],
    inputParameterIds: ["hMm", "dMm", "xMm", "coverMm", "phiMm", "thicknessMm", "strainCase"],
    output: "bending: min(2.5*(h-d), (h-x)/3, h/2); pure tension: min(2.5*(c+phi/2), t/2)",
    units: "mm",
    applicability: "declared bending or pure tension",
    exclusions: "the two candidate sets are not mixed or averaged",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_EFFECTIVE_REINFORCEMENT_RATIO",
    ruleFamily: "CRACKING",
    operations: ["divide"],
    inputParameterIds: ["AsMm2", "AcEffMm2"],
    output: "rho_p,eff = As / Ac,eff for non-prestressed reinforcement",
    units: "1",
    applicability: "ordinary reinforced concrete",
    exclusions: "prestressing steel is outside this profile",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_MODULAR_RATIO",
    ruleFamily: "MATERIAL",
    operations: ["divide"],
    inputParameterIds: ["EsMPa", "EcmMPa"],
    output: "alpha_e = Es / Ecm from explicit moduli",
    units: "1",
    applicability: "service stress",
    exclusions: "no modulus synthesized from strength class",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C7_R1_MEAN_STRAIN_DIFFERENCE",
    ruleFamily: "CRACKING",
    operations: ["max_of_tension_stiffened_strain_and_floor"],
    inputParameterIds: ["sigmaSMpa", "kt", "fctEffMPa", "rhoPEff", "alphaE", "EsMPa", "strainFloorFactor"],
    output: "max((sigma_s - kt*(fct,eff/rho)*(1+alpha_e*rho))/Es, strainFloorFactor*sigma_s/Es)",
    units: "1",
    applicability: "cracked section, explicit steel stress",
    exclusions: "steel stress is not calculated in this profile",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_TENSION_STIFFENING",
    ruleFamily: "CRACKING",
    operations: ["select_kt_from_duration"],
    inputParameterIds: ["duration", "ktShort", "ktLong"],
    output: "kt is 0.6 for short-term loading and 0.4 for long-term loading",
    units: "1",
    applicability: "explicit duration class",
    exclusions: "no default duration",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_CRACK_SPACING",
    ruleFamily: "CRACKING",
    operations: ["cover_term_plus_bar_term"],
    inputParameterIds: ["coverMm", "k1", "k2", "phiMm", "rhoPEff", "coverCoefficient", "barCoefficient"],
    output: "sr,max = coverCoefficient*c + k1*k2*barCoefficient*phi/rho_p,eff",
    units: "mm",
    applicability: "high-bond or explicit plain bars; bending or pure tension",
    exclusions: "no second multiplier on the workshop coefficients",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_CRACK_WIDTH",
    ruleFamily: "CRACKING",
    operations: ["product"],
    inputParameterIds: ["srMaxMm", "meanStrainDifference"],
    output: "wk = sr,max * (epsilon_sm - epsilon_cm)",
    units: "mm",
    applicability: "cracked ordinary reinforced concrete",
    exclusions: "not a runtime evaluation in R1",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_CRACK_LIMIT",
    ruleFamily: "CRACKING",
    operations: ["require_explicit_limit"],
    inputParameterIds: ["wMaxMm"],
    output: "allowable crack width is an explicit governed limit",
    units: "mm",
    applicability: "project or governed exposure decision supplied by the caller",
    exclusions: "the exposure table is not applied automatically",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "PROJECT_SPECIFIC",
  }),
  rule({
    ruleId: "EU_C7_R1_EXPLICIT_CREEP",
    ruleFamily: "CREEP",
    operations: ["require_explicit_phi"],
    inputParameterIds: ["phi"],
    output: "creep coefficient is an explicit governed input",
    units: "1",
    applicability: "ordinary reinforced concrete",
    exclusions: "no humidity, age, or cement default and no Annex B evaluation",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_EXPLICIT_SHRINKAGE",
    ruleFamily: "SHRINKAGE",
    operations: ["require_explicit_shrinkage_strain"],
    inputParameterIds: ["epsilonCs"],
    output: "shrinkage strain is an explicit governed input",
    units: "1",
    applicability: "ordinary reinforced concrete",
    exclusions: "no drying or autogenous model",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C7_R1_C6_CREEP_INTERFACE",
    ruleFamily: "CREEP",
    operations: ["explicit_handoff_only"],
    inputParameterIds: ["phi"],
    output: "a future C7 result may be copied into C6 phiEf only by an explicit caller",
    units: "1",
    applicability: "existing nominal-curvature method",
    exclusions: "C7 does not replace a stored C6 input",
    authorityClass: "SATISFIED_BY_EXISTING_RULE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "SATISFIED_BY_EXISTING_RULE",
  }),
  rule({
    ruleId: "EU_C7_R1_DEFLECTION_SPAN_DEPTH",
    ruleFamily: "DEFLECTION",
    operations: ["reject_unresolved_expression"],
    inputParameterIds: [],
    output: "span-to-depth control is evidenced but its algebraic expression is not bound",
    units: "1",
    applicability: "not available",
    exclusions: "curvature interpolation was not recovered from the workshop extract",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "BLOCKED_SOURCE_CONFLICT",
  }),
  rule({
    ruleId: "EU_C7_R1_MINIMUM_CRACK_REINFORCEMENT",
    ruleFamily: "CRACK_CONTROL",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "minimum crack-control reinforcement is not bound",
    units: "mm2",
    applicability: "later subphase",
    exclusions: "no reinforcement design",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
  rule({
    ruleId: "EU_C7_R1_BAR_DIAMETER_LIMIT",
    ruleFamily: "CRACK_CONTROL",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "bar-diameter limit table is not bound",
    units: "mm",
    applicability: "later subphase",
    exclusions: "bridge-part tables are a different scope",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
  rule({
    ruleId: "EU_C7_R1_BAR_SPACING_LIMIT",
    ruleFamily: "CRACK_CONTROL",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "bar-spacing limit table is not bound",
    units: "mm",
    applicability: "later subphase",
    exclusions: "no automatic bar layout",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
  rule({
    ruleId: "EU_C7_R1_SERVICE_STRESS_LIMIT",
    ruleFamily: "SERVICE_STRESS",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "concrete and reinforcement service stress limits are not bound",
    units: "MPa",
    applicability: "later subphase",
    exclusions: "cracked-section steel stress remains an explicit crack-width input",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
  rule({
    ruleId: "EU_C7_R1_CALCULATED_CREEP",
    ruleFamily: "CREEP",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "age, humidity, and notional-size creep calculation is not bound",
    units: "1",
    applicability: "later long-term subphase",
    exclusions: "no Annex B coefficients",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
  rule({
    ruleId: "EU_C7_R1_CALCULATED_SHRINKAGE",
    ruleFamily: "SHRINKAGE",
    operations: ["not_bound"],
    inputParameterIds: [],
    output: "drying and autogenous shrinkage calculation is not bound",
    units: "1",
    applicability: "later long-term subphase",
    exclusions: "no humidity or cement default",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID],
    classification: "DEFERRED_TO_LATER_C7_SUBPHASE",
  }),
] as const;

export const EU_C7_R1_PARAMETERS = [
  { parameterId: "coverCoefficient", value: EU_C7_R1_CRACK_SPACING_COVER_COEFFICIENT, expression: "cover term in maximum crack spacing", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "barCoefficient", value: EU_C7_R1_CRACK_SPACING_BAR_COEFFICIENT, expression: "bar-diameter term in maximum crack spacing", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "k1HighBond", value: EU_C7_R1_K1_HIGH_BOND, expression: "bond factor for high-bond bars", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "k1Plain", value: EU_C7_R1_K1_PLAIN, expression: "bond factor for plain-surface bars", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "k2Bending", value: EU_C7_R1_K2_BENDING, expression: "strain-distribution factor for bending", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "k2Tension", value: EU_C7_R1_K2_TENSION, expression: "strain-distribution factor for pure tension", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "ktShort", value: EU_C7_R1_KT_SHORT, expression: "short-term tension-stiffening factor", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "ktLong", value: EU_C7_R1_KT_LONG, expression: "long-term tension-stiffening factor", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "strainFloorFactor", value: EU_C7_R1_STRAIN_FLOOR_FACTOR, expression: "lower bound factor on the mean strain difference", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "effectiveHeightCoverFactor", value: EU_C7_R1_EFFECTIVE_HEIGHT_COVER_FACTOR, expression: "multiplier on (h-d) or (c+phi/2)", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "effectiveHeightAxisDivisor", value: EU_C7_R1_EFFECTIVE_HEIGHT_AXIS_DIVISOR, expression: "divisor on (h-x)", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "wMaxMm", value: null, expression: "explicit allowable crack width", units: "mm", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
  { parameterId: "phi", value: null, expression: "explicit creep coefficient", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "TIME_SPECIFIC" },
  { parameterId: "epsilonCs", value: null, expression: "explicit shrinkage strain", units: "1", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "TIME_SPECIFIC" },
  { parameterId: "fctEffMPa", value: null, expression: "explicit effective tensile strength", units: "MPa", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "MATERIAL_SPECIFIC" },
  { parameterId: "EcmMPa", value: null, expression: "explicit concrete modulus from the existing material property", units: "MPa", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "MATERIAL_SPECIFIC" },
  { parameterId: "EsMPa", value: null, expression: "explicit reinforcement modulus from the existing material property", units: "MPa", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "MATERIAL_SPECIFIC" },
  { parameterId: "sigmaSMpa", value: null, expression: "explicit cracked-section reinforcement stress", units: "MPa", authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "DERIVED_FROM_GOVERNED_RULE" },
  { parameterId: "coverMm", value: null, expression: "explicit cover to the bar surface", units: "mm", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
  { parameterId: "phiMm", value: null, expression: "explicit bar diameter", units: "mm", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], classification: "PROJECT_SPECIFIC" },
] as const;

export const EU_C7_R1_SOURCE_CONFLICTS = [
  {
    conflictId: "CRACK_SPACING_COEFFICIENT_SYMBOLS",
    cause: "DIFFERENT_NOTATION",
    resolution: "WORKSHOP_COEFFICIENTS",
    detail: "The spacing expression is stated with 3.4 and 0.425. A worked figure uses the same numbers. They are not multiplied by a second pair of symbols.",
  },
  {
    conflictId: "CRACK_WIDTH_EXAMPLE_ARITHMETIC",
    cause: "DIFFERENT_NOTATION",
    resolution: "REJECTED",
    detail: "The extracted worked example does not repeat one spacing figure consistently. Example arithmetic is not a coefficient.",
  },
  {
    conflictId: "EFFECTIVE_TENSION_HEIGHT_SCOPE",
    cause: "DIFFERENT_SCOPE",
    resolution: "SELECT_BY_STRAIN_CASE",
    detail: "Bending uses min(2.5*(h-d), (h-x)/3, h/2). Pure tension uses min(2.5*(c+phi/2), t/2). The sets are not averaged.",
  },
  {
    conflictId: "SPAN_DEPTH_EXPRESSION",
    cause: "ACTUAL_UNRESOLVED_CONFLICT",
    resolution: "REJECTED",
    detail: "The workshop shows span-to-depth control, but the extracted algebra is not clean enough to bind. That method is excluded.",
  },
] as const;

export const EU_C7_R1_NDP_PARAMETER_IDS = [] as const;

export const EU_C7_R1_C6_CREEP_INTERFACE = {
  defined: true,
  existingC6PathPreserved: C6_EXISTING_EXPLICIT_PHIEF_PATH_PRESERVED,
  automaticReplacement: C7_AUTOMATICALLY_REPLACES_EXISTING_C6_INPUT,
  handoff: "caller may supply a C7 explicit phi as C6 phiEf; C6 does not read C7",
} as const;

export const EU_C7_R1_IMPLEMENTATION_SEQUENCE = [
  "EOS-D1E-EU-C7-R2-CRACKING",
  "EOS-D1E-EU-C7-R3-LONG-TERM",
  "EOS-D1E-EU-C7-R4-DEFLECTION",
  "EOS-D1E-EU-C7-R5",
] as const;

export const EU_C7_R1_CRACK_WIDTH_REQUIRED_RULE_IDS = [
  "EU_C7_R1_SERVICE_COMBINATION",
  "EU_C7_R1_SECTION_CRACK_STATE",
  "EU_C7_R1_EFFECTIVE_TENSION_HEIGHT",
  "EU_C7_R1_EFFECTIVE_REINFORCEMENT_RATIO",
  "EU_C7_R1_MODULAR_RATIO",
  "EU_C7_R1_TENSION_STIFFENING",
  "EU_C7_R1_MEAN_STRAIN_DIFFERENCE",
  "EU_C7_R1_CRACK_SPACING",
  "EU_C7_R1_CRACK_WIDTH",
  "EU_C7_R1_CRACK_LIMIT",
] as const;

export const EU_C7_R1_CRACK_WIDTH_REQUIRED_PARAMETER_IDS = [
  "coverCoefficient",
  "barCoefficient",
  "k1HighBond",
  "k1Plain",
  "k2Bending",
  "k2Tension",
  "ktShort",
  "ktLong",
  "strainFloorFactor",
  "effectiveHeightCoverFactor",
  "effectiveHeightAxisDivisor",
  "wMaxMm",
  "fctEffMPa",
  "EcmMPa",
  "EsMPa",
  "sigmaSMpa",
  "coverMm",
  "phiMm",
] as const;

export type EuC7ProfileResolutionInput = {
  requestedMethod: "CRACK_WIDTH" | "EXPLICIT_CREEP" | "EXPLICIT_SHRINKAGE" | "DEFLECTION";
  profileId: string;
  generation: string;
  nationalAnnexClaim: boolean;
  geometry: string;
  prestressed: boolean;
  combinationCategory: string | null;
  combinationLimitState: string | null;
  sectionState: "CRACKED" | "UNCRACKED" | null;
  strainCase: "BENDING" | "PURE_TENSION" | "INTERMEDIATE" | null;
  k2Intermediate: number | null;
  surface: "HIGH_BOND" | "PLAIN" | null;
  duration: "SHORT_TERM" | "LONG_TERM" | null;
  coverMm: number | null;
  phiMm: number | null;
  AsMm2: number | null;
  widthMm: number | null;
  hMm: number | null;
  dMm: number | null;
  xMm: number | null;
  thicknessMm: number | null;
  fctEffMPa: number | null;
  ecmMPa: number | null;
  esMPa: number | null;
  sigmaSMpa: number | null;
  wMaxMm: number | null;
  phi: number | null;
  epsilonCs: number | null;
  calculateCreep: boolean;
  calculateShrinkage: boolean;
  replaceC6Phi: boolean;
  sourceConflictUnresolved: boolean;
  stale: boolean;
};

function finitePositive(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value > 0;
}

export function resolveEuC7ReferenceProfile(input: EuC7ProfileResolutionInput): { accepted: boolean; code: string } {
  if (
    NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED
    || NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED
    || NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED
    || NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED
    || EU_C7_R1_RUNTIME_METHOD_COUNT !== 0
    || EU_C7_GENERAL_NONLINEAR_FEA_IMPLEMENTED
  ) {
    return { accepted: false, code: "RUNTIME_METHOD_FORBIDDEN_IN_R1" };
  }
  if (input.nationalAnnexClaim || EU_C7_R1_FALSE_NATIONAL_PROFILE_CLAIM) return { accepted: false, code: "FALSE_NATIONAL_PROFILE" };
  if (input.profileId !== EU_C7_R1_REFERENCE_PROFILE_ID) return { accepted: false, code: "PROFILE_MISMATCH" };
  if (input.generation !== EU_C7_R1_REFERENCE_PROFILE_GENERATION) return { accepted: false, code: "GENERATION_MISMATCH" };
  if (input.stale) return { accepted: false, code: "STALE_PROFILE" };
  if (input.sourceConflictUnresolved) return { accepted: false, code: "SOURCE_CONFLICT" };
  if (input.replaceC6Phi || !EU_C7_R1_C6_CREEP_INTERFACE.existingC6PathPreserved || EU_C7_R1_C6_CREEP_INTERFACE.automaticReplacement) {
    return { accepted: false, code: "C6_REPLACEMENT_FORBIDDEN" };
  }
  if (input.requestedMethod === "DEFLECTION") return { accepted: false, code: "DEFLECTION_NOT_BOUND" };
  if (input.requestedMethod === "EXPLICIT_CREEP") {
    if (input.calculateCreep) return { accepted: false, code: "CALCULATED_CREEP_NOT_BOUND" };
    if (input.phi === null || !Number.isFinite(input.phi) || input.phi < 0) return { accepted: false, code: "MISSING_CREEP" };
    return { accepted: true, code: "PROFILE_BOUND" };
  }
  if (input.requestedMethod === "EXPLICIT_SHRINKAGE") {
    if (input.calculateShrinkage) return { accepted: false, code: "CALCULATED_SHRINKAGE_NOT_BOUND" };
    if (input.epsilonCs === null || !Number.isFinite(input.epsilonCs)) return { accepted: false, code: "MISSING_SHRINKAGE" };
    return { accepted: true, code: "PROFILE_BOUND" };
  }
  if (input.geometry !== "RECTANGULAR") return { accepted: false, code: "UNSUPPORTED_GEOMETRY" };
  if (input.prestressed) return { accepted: false, code: "PRESTRESS_OUT_OF_SCOPE" };
  if (input.combinationCategory === null || input.combinationLimitState === null) return { accepted: false, code: "MISSING_SERVICE_COMBINATION" };
  if (input.combinationLimitState === "ULS" || input.combinationCategory === "uls") return { accepted: false, code: "ULS_COMBINATION_REJECTED" };
  if (input.combinationCategory !== "quasi_permanent") return { accepted: false, code: "UNSUPPORTED_COMBINATION" };
  if (input.sectionState === null) return { accepted: false, code: "MISSING_SECTION_STATE" };
  if (input.sectionState === "UNCRACKED") return { accepted: false, code: "UNCRACKED_NOT_APPLICABLE" };
  if (input.strainCase === null) return { accepted: false, code: "MISSING_STRAIN_CASE" };
  if (input.strainCase === "INTERMEDIATE") {
    const low = EU_C7_R1_K2_BENDING;
    const high = EU_C7_R1_K2_TENSION;
    if (input.k2Intermediate === null || !(input.k2Intermediate > low && input.k2Intermediate < high)) {
      return { accepted: false, code: "INTERMEDIATE_K2_MISSING" };
    }
  }
  if (input.surface === null) return { accepted: false, code: "MISSING_SURFACE_CLASS" };
  if (input.duration === null) return { accepted: false, code: "MISSING_DURATION" };
  if (!finitePositive(input.coverMm)) return { accepted: false, code: "MISSING_COVER" };
  if (!finitePositive(input.phiMm)) return { accepted: false, code: "MISSING_BAR_DIAMETER" };
  if (!finitePositive(input.AsMm2)) return { accepted: false, code: "MISSING_REINFORCEMENT" };
  if (!finitePositive(input.fctEffMPa)) return { accepted: false, code: "MISSING_TENSILE_STRENGTH" };
  if (!finitePositive(input.ecmMPa)) return { accepted: false, code: "MISSING_CONCRETE_MODULUS" };
  if (!finitePositive(input.esMPa)) return { accepted: false, code: "MISSING_REINFORCEMENT_MODULUS" };
  if (!finitePositive(input.sigmaSMpa)) return { accepted: false, code: "MISSING_STEEL_STRESS" };
  if (!finitePositive(input.wMaxMm)) return { accepted: false, code: "MISSING_CRACK_LIMIT" };
  if (input.strainCase === "BENDING") {
    if (!finitePositive(input.hMm) || !finitePositive(input.dMm) || !finitePositive(input.widthMm) || !finitePositive(input.xMm)) {
      return { accepted: false, code: "MISSING_SECTION" };
    }
    if (input.dMm! >= input.hMm! || input.xMm! >= input.hMm!) return { accepted: false, code: "INVALID_SECTION" };
  }
  if (input.strainCase === "PURE_TENSION" && !finitePositive(input.thicknessMm)) {
    return { accepted: false, code: "MISSING_SECTION" };
  }
  return { accepted: true, code: "PROFILE_BOUND" };
}

export function validateEuC7ProfilePack(): { status: "PASS"; ruleCount: number; parameterCount: number; unprovenanced: number } {
  const sourceCount = EU_C7_R1_PARAMETERS.reduce((count, parameter) => count + [...parameter.sourceIds].length, 0);
  const missingFingerprint = EU_C7_R1_RULES.filter((item) => !item.formulaFingerprint.startsWith("fp:")).length;
  const unprovenanced = sourceCount < EU_C7_R1_PARAMETERS.length ? EU_C7_R1_PARAMETERS.length - sourceCount : 0;
  const ready = EU_C7_R1_RULES.filter((item) => item.classification === "REFERENCE_IMPLEMENTATION_READY" || item.classification === "ESTABLISHED_MECHANICS" || item.classification === "SATISFIED_BY_EXISTING_RULE");
  if (unprovenanced !== 0 || missingFingerprint !== 0 || ready.length === 0) {
    throw new Error("C7 reference profile pack is incomplete");
  }
  const resolutions = EU_C7_R1_SOURCE_CONFLICTS.map((conflict) => String(conflict.resolution));
  if (resolutions.includes("AVERAGED")) throw new Error("C7 source conflicts must not be averaged");
  return { status: "PASS", ruleCount: EU_C7_R1_RULES.length, parameterCount: EU_C7_R1_PARAMETERS.length, unprovenanced };
}

export const EU_C7_R1_PROFILE_SOURCES = PROFILE_SOURCES;
