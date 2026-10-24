import {
  EU_C5_T3R_CROSS_GENERATION_RULE_MIXING,
  EU_C5_T3R_EXPLICIT_NATIONAL_PROFILE_CREATED,
  EU_C5_T3R_PROFILE_BINDING_COMPLETE,
  EU_C5_T3R_PROFILE_VERSION,
  EU_C5_T3R_REFERENCE_PROFILE_GENERATION,
  EU_C5_T3R_REFERENCE_PROFILE_ID,
  EU_C5_T3R_REFERENCE_PROFILE_IS_NATIONAL_ANNEX,
  EU_C5_T3R_SOURCE_CONFLICT_FAILS_CLOSED,
  EU_C5_T3R_TORSION_METHOD_COUNT,
  FALSE_NATIONAL_PROFILE_CLAIM,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_PROFILE_BINDING,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

const PROFILE_ID = EU_C5_T3R_REFERENCE_PROFILE_ID;
const GENERATION = EU_C5_T3R_REFERENCE_PROFILE_GENERATION;
const VERSION = EU_C5_T3R_PROFILE_VERSION;

export const EU_C5_T3R_PRIMARY_SOURCE_ID = "SCIA_EN1992_1_1_TRAINING_2011" as const;
export const EU_C5_T3R_CORROBORATING_SOURCE_IDS = ["JRC_WALRAVEN_2008_02_02", "FRILO_RC_SECTION_MANUAL"] as const;

type TorsionRule = {
  ruleId: string;
  ruleFamily: "TORSION";
  operations: readonly string[];
  inputParameterIds: readonly string[];
  output: string;
  units: string;
  applicability: string;
  exclusions: string;
  authorityClass: "VALIDATED_ENGINEERING_REFERENCE" | "ESTABLISHED_ENGINEERING_MECHANICS" | "SATISFIED_BY_EXISTING_RULE";
  sourceIds: readonly string[];
  classification: string;
};

type TorsionParameter = {
  parameterId: string;
  value: number | null;
  expression: string | null;
  units: string;
  authorityClass: TorsionRule["authorityClass"];
  sourceIds: readonly string[];
  applicability: string;
  dependencyIds: readonly string[];
  classification: string;
};

function rule(input: Omit<TorsionRule, "ruleFamily">): TorsionRule & { formulaFingerprint: string; validationState: "PENDING_HUMAN_ENGINEERING_REVIEW" } {
  return {
    ...input,
    ruleFamily: "TORSION",
    formulaFingerprint: formulaFingerprint({
      ruleId: input.ruleId,
      operations: input.operations,
      parameterIds: input.inputParameterIds,
    }),
    validationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
  };
}

export const EU_C5_T3R_TORSION_RULES = [
  rule({
    ruleId: "EU_C5_T3R_EFFECTIVE_WALL_THICKNESS",
    operations: ["divide"],
    inputParameterIds: ["A", "u", "actualWallThickness"],
    output: "tef = A/u; hollow sections also require tef <= actual wall thickness",
    units: "mm",
    applicability: "equivalent thin-walled closed section; A includes inner hollow areas; u is the outer circumference",
    exclusions: "no packed thickness factor; hollow thickness is a project input",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02", "FRILO_RC_SECTION_MANUAL"],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_ENCLOSED_AREA",
    operations: ["centreline_enclosure"],
    inputParameterIds: ["tef", "outerDimensions"],
    output: "Ak is the area enclosed by the wall centre-lines",
    units: "mm2",
    applicability: "rectangular equivalent tube uses the centre-line inset of tef/2",
    exclusions: "T, L, and I decomposition is outside the bounded profile",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02"],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C5_T3R_EFFECTIVE_PERIMETER",
    operations: ["centreline_perimeter"],
    inputParameterIds: ["Ak"],
    output: "uk is the perimeter of Ak",
    units: "mm",
    applicability: "same centre-line loop as Ak",
    exclusions: "not the outer circumference u",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C5_T3R_SHEAR_FLOW",
    operations: ["divide"],
    inputParameterIds: ["TEd", "Ak"],
    output: "tau * tef = TEd / (2 * Ak)",
    units: "N/mm",
    applicability: "closed shear flow in the equivalent tube",
    exclusions: "not a resistance",
    authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02"],
    classification: "ESTABLISHED_MECHANICS",
  }),
  rule({
    ruleId: "EU_C5_T3R_STRUT_ANGLE_DOMAIN",
    operations: ["bounds"],
    inputParameterIds: ["cotTheta"],
    output: "designer-selected cotTheta inside the recommended domain",
    units: "dimensionless",
    applicability: "same strut angle for shear and torsion; non-prestressed reference profile",
    exclusions: "no default angle; German-course domain is a different profile",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02"],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_STRENGTH_REDUCTION",
    operations: ["subtract", "multiply"],
    inputParameterIds: ["nuCoefficient", "fck", "nuFckDivisor"],
    output: "nu = nuCoefficient * (1 - fck / nuFckDivisor)",
    units: "dimensionless; fck MPa",
    applicability: "recommended cracked-shear reduction for the reference profile",
    exclusions: "the optional higher-strength alternative and the German 0.525 value are not selected",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_DESIGN_CONCRETE_STRENGTH",
    operations: ["reuse_c1"],
    inputParameterIds: ["fck", "alpha_cc", "gamma_c"],
    output: "fcd from EU_C1_CONCRETE_DESIGN_PROPERTIES",
    units: "MPa",
    applicability: "declared C1 NDP inputs; torsion does not pack alpha_cc or gamma_c",
    exclusions: "no parallel fcd identity",
    authorityClass: "SATISFIED_BY_EXISTING_RULE",
    sourceIds: ["EU_C1_CONCRETE_DESIGN_PROPERTIES"],
    classification: "SATISFIED_BY_EXISTING_RULE",
  }),
  rule({
    ruleId: "EU_C5_T3R_MAX_TORSION_RESISTANCE",
    operations: ["multiply", "sin", "cos"],
    inputParameterIds: ["nu", "alphaCw", "fcd", "Ak", "tef", "cotTheta"],
    output: "TRd,max = 2 * nu * alphaCw * fcd * Ak * tef * sin(theta) * cos(theta)",
    units: "N.mm when fcd is MPa and geometry is mm",
    applicability: "vertical compression strut in the equivalent wall; non-prestressed alphaCw",
    exclusions: "does not select theta; does not compute a runtime resistance in T3R",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "FRILO_RC_SECTION_MANUAL"],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_TRANSVERSE_REINFORCEMENT",
    operations: ["divide"],
    inputParameterIds: ["TEd", "Ak", "fywd", "cotTheta"],
    output: "Asw/s = TEd / (2 * Ak * fywd * cotTheta)",
    units: "mm2/mm",
    applicability: "vertical links; fywd reuses the C1 reinforcement design strength",
    exclusions: "does not choose a bar or a spacing",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "FRILO_RC_SECTION_MANUAL"],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_LONGITUDINAL_REINFORCEMENT",
    operations: ["multiply", "divide"],
    inputParameterIds: ["TEd", "cotTheta", "uk", "Ak", "fyd"],
    output: "sum(Asl) = TEd * cotTheta * uk / (2 * Ak * fyd)",
    units: "mm2",
    applicability: "additional longitudinal steel; fyd reuses EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
    exclusions: "does not place bars",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
  rule({
    ruleId: "EU_C5_T3R_VT_INTERACTION",
    operations: ["add", "divide"],
    inputParameterIds: ["TEd", "TRdMax", "VEd", "VRdMax"],
    output: "TEd/TRd,max + VEd/VRd,max <= 1",
    units: "dimensionless",
    applicability: "same strut angle; VEd = 0 is the zero-shear end of this expression",
    exclusions: "squared solid-section interaction is a different profile and is rejected",
    authorityClass: "VALIDATED_ENGINEERING_REFERENCE",
    sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID],
    classification: "REFERENCE_IMPLEMENTATION_READY",
  }),
] as const;

export const EU_C5_T3R_TORSION_PARAMETERS: readonly TorsionParameter[] = [
  { parameterId: "cotThetaMin", value: 1, expression: null, units: "dimensionless", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02"], applicability: "recommended lower bound on cotTheta", dependencyIds: [], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "cotThetaMax", value: 2.5, expression: null, units: "dimensionless", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, "JRC_WALRAVEN_2008_02_02"], applicability: "recommended upper bound on cotTheta", dependencyIds: [], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "cotTheta", value: null, expression: "DESIGNER_SELECTED_WITHIN_GOVERNED_BOUNDS", units: "dimensionless", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "no default", dependencyIds: ["cotThetaMin", "cotThetaMax"], classification: "DESIGNER_SELECTED_WITHIN_GOVERNED_BOUNDS" },
  { parameterId: "nuCoefficient", value: 0.6, expression: null, units: "dimensionless", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "recommended reduction expression", dependencyIds: [], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "nuFckDivisor", value: 250, expression: null, units: "MPa", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "fck is expressed in MPa", dependencyIds: [], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "alphaCw", value: 1, expression: null, units: "dimensionless", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "non-prestressed members only", dependencyIds: [], classification: "REFERENCE_PROFILE_PARAMETER" },
  { parameterId: "A", value: null, expression: "PROJECT_SECTION_AREA", units: "mm2", authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "outer area including inner hollow areas", dependencyIds: [], classification: "PROJECT_SPECIFIC" },
  { parameterId: "u", value: null, expression: "PROJECT_OUTER_PERIMETER", units: "mm", authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "outer circumference", dependencyIds: [], classification: "PROJECT_SPECIFIC" },
  { parameterId: "actualWallThickness", value: null, expression: "REQUIRED_FOR_HOLLOW", units: "mm", authorityClass: "ESTABLISHED_ENGINEERING_MECHANICS", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID], applicability: "hollow wall cap", dependencyIds: [], classification: "PROJECT_SPECIFIC" },
  { parameterId: "fck", value: null, expression: "MATERIAL_INPUT", units: "MPa", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: ["EU_C1_CONCRETE_DESIGN_PROPERTIES"], applicability: "C1 characteristic strength", dependencyIds: [], classification: "MATERIAL_SPECIFIC" },
  { parameterId: "alpha_cc", value: null, expression: "DECLARED_C1_NDP", units: "dimensionless", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: ["EU_C1_CONCRETE_DESIGN_PROPERTIES"], applicability: "not packed by torsion", dependencyIds: [], classification: "NDP_DEPENDENT" },
  { parameterId: "gamma_c", value: null, expression: "DECLARED_C1_NDP", units: "dimensionless", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: ["EU_C1_PARTIAL_FACTOR_GAMMA_C"], applicability: "not packed by torsion", dependencyIds: [], classification: "NDP_DEPENDENT" },
  { parameterId: "gamma_s", value: null, expression: "DECLARED_C1_NDP", units: "dimensionless", authorityClass: "SATISFIED_BY_EXISTING_RULE", sourceIds: ["EU_C1_REINFORCEMENT_DESIGN_PROPERTIES"], applicability: "not packed by torsion", dependencyIds: [], classification: "NDP_DEPENDENT" },
];

export const EU_C5_T3R_SOURCE_CONFLICT_RECORDS = [
  { id: "COT_DOMAIN_WALRAVEN_VS_KIT", cause: "DIFFERENT_PROFILE", selected: "RECOMMENDED_COT_1_TO_2_5", rejected: "KIT_GERMAN_COURSE_DOMAIN" },
  { id: "STRENGTH_REDUCTION_ONLY_IN_KIT", cause: "DIFFERENT_PROFILE", selected: "RECOMMENDED_NU_EXPRESSION", rejected: "KIT_NUMERIC_0_525" },
  { id: "VT_INTERACTION_ONLY_IN_KIT", cause: "DIFFERENT_PROFILE", selected: "LINEAR_STRUT_SUM", rejected: "KIT_SQUARED_SOLID_INTERACTION" },
  { id: "REINFORCEMENT_ANGLE_PLACEMENT", cause: "DIFFERENT_PROFILE", selected: "COT_IN_TRANSVERSE_DENOMINATOR", rejected: "KIT_TAN_DENOMINATOR" },
] as const;

/** Bound closed-shear-flow denominator shared by geometry, resistance, and reinforcement. */
export const EU_C5_T3R_CLOSED_SHEAR_FLOW_FACTOR = 2 as const;
export const EU_C5_T3R_CRACKING_THRESHOLD_STATE = "NOT_REQUIRED_FOR_SELECTED_BOUNDED_METHOD" as const;

export function euC5TorsionProfileNumber(parameterId: string): number {
  const row = EU_C5_T3R_TORSION_PARAMETERS.find((item) => item.parameterId === parameterId);
  if (row?.value == null) throw new Error(`torsion profile parameter ${parameterId} is not a bound number`);
  return row.value;
}
export const EU_C5_T3R_VT_INTERACTION_STATE = "MANDATORY_AND_IMPLEMENTATION_READY" as const;

export function resolveEuC5TorsionNationalProfile(): never {
  throw new Error("NATIONAL_ANNEX_NOT_BOUND");
}

export function validateEuC5TorsionProfilePack(): "PASS" {
  if (
    LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION
    || LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_PROFILE_BINDING
    || EU_C5_T3R_REFERENCE_PROFILE_IS_NATIONAL_ANNEX
    || FALSE_NATIONAL_PROFILE_CLAIM
    || EU_C5_T3R_EXPLICIT_NATIONAL_PROFILE_CREATED
    || EU_C5_T3R_CROSS_GENERATION_RULE_MIXING
    || !EU_C5_T3R_SOURCE_CONFLICT_FAILS_CLOSED
    || !EU_C5_T3R_PROFILE_BINDING_COMPLETE
    || EU_C5_T3R_TORSION_METHOD_COUNT !== 0
  ) {
    throw new Error("T3R profile policy drifted");
  }
  const ruleIds = new Set<string>();
  for (const row of EU_C5_T3R_TORSION_RULES) {
    if (ruleIds.has(row.ruleId)) throw new Error(`duplicate rule ${row.ruleId}`);
    ruleIds.add(row.ruleId);
    if (!row.formulaFingerprint.startsWith("fp:") || row.sourceIds.length === 0 || !row.units || !row.applicability) {
      throw new Error(`incomplete rule ${row.ruleId}`);
    }
    if (row.authorityClass === "VALIDATED_ENGINEERING_REFERENCE" && !row.sourceIds.includes(EU_C5_T3R_PRIMARY_SOURCE_ID) && row.ruleId !== "EU_C5_T3R_DESIGN_CONCRETE_STRENGTH") {
      throw new Error(`missing primary source ${row.ruleId}`);
    }
  }
  const parameterIds = new Set<string>();
  for (const row of EU_C5_T3R_TORSION_PARAMETERS) {
    if (parameterIds.has(row.parameterId)) throw new Error(`duplicate parameter ${row.parameterId}`);
    parameterIds.add(row.parameterId);
    if (row.value == null && row.expression == null) throw new Error(`unprovenanced parameter ${row.parameterId}`);
    if (row.sourceIds.length === 0 || !row.units) throw new Error(`incomplete parameter ${row.parameterId}`);
  }
  if (EU_C5_T3R_TORSION_PARAMETERS.find((row) => row.parameterId === "cotTheta")?.value != null) {
    throw new Error("strut angle must not have a default");
  }
  return "PASS";
}

export type EuC5TorsionReferenceRequest = {
  profileId: string;
  generation: string;
  profileVersion: string;
  cotTheta: number;
  prestressed: boolean;
  interactionForm: "LINEAR_STRUT" | "SQUARED" | "OTHER";
  sectionKind: "RECTANGULAR_SOLID" | "HOLLOW" | "OTHER";
  actualWallThicknessMm?: number;
};

export function resolveEuC5TorsionReferenceProfile(input: EuC5TorsionReferenceRequest): {
  profileId: typeof PROFILE_ID;
  generation: typeof GENERATION;
  resistanceComputed: false;
} {
  validateEuC5TorsionProfilePack();
  if (input.profileId !== PROFILE_ID) throw new Error("PROFILE_MISMATCH");
  if (input.generation !== GENERATION) throw new Error("GENERATION_MISMATCH");
  if (input.profileVersion !== VERSION) throw new Error("STALE_PROFILE_VERSION");
  if (input.prestressed) throw new Error("UNSUPPORTED_PRESTRESSED_ALPHA_CW");
  if (input.interactionForm !== "LINEAR_STRUT") throw new Error("SOURCE_CONFLICT");
  if (input.sectionKind === "OTHER") throw new Error("UNSUPPORTED_GEOMETRY");
  if (input.sectionKind === "HOLLOW" && !(input.actualWallThicknessMm != null && input.actualWallThicknessMm > 0)) {
    throw new Error("MISSING_PARAMETER");
  }
  const cotMin = euC5TorsionProfileNumber("cotThetaMin");
  const cotMax = euC5TorsionProfileNumber("cotThetaMax");
  if (!Number.isFinite(input.cotTheta) || input.cotTheta < cotMin || input.cotTheta > cotMax) {
    throw new Error("INVALID_STRUT_ANGLE_DOMAIN");
  }
  return { profileId: PROFILE_ID, generation: GENERATION, resistanceComputed: false };
}
