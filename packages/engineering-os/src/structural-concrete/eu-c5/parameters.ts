import { EU_C5_PARAMETER_VERSION, EU_C5_VMIN_EXPRESSION_ID } from "@rtb/types";

export const EU_C5_SOURCES = [
  {
    sourceId: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    author: "Joost Walraven",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    tier: "TIER_A",
    independenceGroup: "JRC_EC",
    url: "https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/04_EC2WS_Walraven_ULSSLS.pdf",
    identity: "JRC Eurocode 2 workshop, Limit state design and verification, 25 October 2011",
    generationClaimedBySource: "FIRST_GENERATION",
    edition: "EN 1992-1-1 workshop worked example; pack edition remains UNKNOWN_PENDING_CONFIRMATION",
  },
  {
    sourceId: "SOFISTIK_DCE_EN7",
    publisher: "SOFiSTiK AG",
    author: "SOFiSTiK verification manual",
    sourceType: "VALIDATED_ENGINEERING_SOFTWARE_BENCHMARK",
    tier: "TIER_C",
    independenceGroup: "SOFISTIK",
    url: "https://docs.sofistik.com/2027/en/verification/_static/verification/pdf/dce-en7.pdf",
    identity: "Benchmark Example No. 7, T-section shear, citing EN 1992-1-1:2004",
    generationClaimedBySource: "FIRST_GENERATION",
    edition: "EN 1992-1-1:2004 cited by the benchmark; pack edition remains UNKNOWN_PENDING_CONFIRMATION",
  },
  {
    sourceId: "INFOGRAPH_EN1992_PUNCHING",
    publisher: "InfoGraph",
    author: "InfoCAD EN 1992-1-1 punching help",
    sourceType: "ENGINEERING_SOFTWARE_REFERENCE",
    tier: "TIER_C",
    independenceGroup: "INFOGRAPH",
    url: "https://webhelp.infograph.de/infocadenu/hid_en1992_punch.html",
    identity: "EN 1992-1-1 punching shear help; recommended CRd,c and vmin separated from national modifications",
    generationClaimedBySource: "FIRST_GENERATION",
    edition: "EN 1992-1-1 help; national modifications are not packed",
  },
  {
    sourceId: "TCC_LECTURE6_2017",
    publisher: "The Concrete Centre",
    author: "Concrete Centre lecture 6",
    sourceType: "INSTITUTIONAL_DESIGN_LECTURE",
    tier: "TIER_B",
    independenceGroup: "TCC_UK",
    url: "https://www.concretecentre.com/TCC/media/TCCMediaLibrary/PDF%20attachments/Lecture-6-Deflection-and-Crack-Control-cg-26-Oct-17.pdf",
    identity: "TCC lecture 26 Oct 2017 punching control-perimeter and vRd,c numerical example",
    generationClaimedBySource: "FIRST_GENERATION",
    edition: "UK-oriented lecture; UK National Annex limits are not packed",
  },
  {
    sourceId: "MARKOVA_PUNCHING_2019",
    publisher: "Acta Polytechnica CTU Proceedings",
    author: "Markova, Holicky, Jung, Sykora",
    sourceType: "PEER_REVIEWED",
    tier: "TIER_B",
    independenceGroup: "CTU_PRAGUE",
    url: "https://pdfs.semanticscholar.org/6b94/76a5d215bfd7963d32371017a06bb0e064ea.pdf",
    identity: "Punching verification procedures; unitary resistance and control section at 2d",
    generationClaimedBySource: "FIRST_GENERATION",
    edition: "EN 1992-1-1 cited as 2006; pack edition remains UNKNOWN_PENDING_CONFIRMATION",
  },
] as const;

export type EuC5ParameterRecord = {
  parameterId: string;
  value: number | null;
  valueMode: "STANDARD_DEFINED" | "DECLARED_NDP_INPUT" | "ESTABLISHED_MATH_CONSTANT";
  units: string;
  authority: "AUTHORITATIVE_STANDARD_DERIVED" | "ESTABLISHED_ENGINEERING_MECHANICS";
  source: string;
  applicability: string;
  profileGeneration: "FIRST_GENERATION_CLAIMED_BY_SOURCES";
  ndpStatus: "STANDARD_DEFINED" | "NDP_DEPENDENT" | "NOT_AN_NDP";
  version: typeof EU_C5_PARAMETER_VERSION;
  validationState: "NUMERICALLY_VALIDATED";
};

const APPLICABILITY =
  "first-generation EN 1992-1-1 shear/punching expressions claimed by the cited sources; normal-weight concrete; ambient static ULS; no default National Annex";

function defined(
  parameterId: string,
  value: number,
  units: string,
  source: string,
  ndpStatus: EuC5ParameterRecord["ndpStatus"] = "STANDARD_DEFINED",
): EuC5ParameterRecord {
  return {
    parameterId,
    value,
    valueMode: ndpStatus === "NOT_AN_NDP" ? "ESTABLISHED_MATH_CONSTANT" : "STANDARD_DEFINED",
    units,
    authority: ndpStatus === "NOT_AN_NDP" ? "ESTABLISHED_ENGINEERING_MECHANICS" : "AUTHORITATIVE_STANDARD_DERIVED",
    source,
    applicability: APPLICABILITY,
    profileGeneration: "FIRST_GENERATION_CLAIMED_BY_SOURCES",
    ndpStatus,
    version: EU_C5_PARAMETER_VERSION,
    validationState: "NUMERICALLY_VALIDATED",
  };
}

export const EU_C5_K_DEPTH_NUMERATOR_MM = defined(
  "k_depth_numerator",
  200,
  "mm",
  "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7",
);
export const EU_C5_K_UPPER_BOUND = defined("k_upper_bound", 2, "dimensionless", "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7");
export const EU_C5_RHO_UPPER_BOUND = defined("rho_l_upper_bound", 0.02, "dimensionless", "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7");
export const EU_C5_RHO_STRESS_SCALE = defined(
  "rho_stress_scale",
  100,
  "dimensionless",
  "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7+INFOGRAPH_EN1992_PUNCHING",
);
export const EU_C5_PERIMETER_OFFSET_FACTOR = defined(
  "punching_control_perimeter_offset_factor",
  2,
  "dimensionless",
  "JRC_WALRAVEN_2011+TCC_LECTURE6_2017+MARKOVA_PUNCHING_2019",
);
export const EU_C5_CIRCULAR_ARC_CONSTANT = defined("pi", Math.PI, "dimensionless", "established circle constant", "NOT_AN_NDP");

export const EU_C5_DECLARED_NDP_PARAMETERS = [
  {
    parameterId: "CRd,c",
    value: null,
    valueMode: "DECLARED_NDP_INPUT" as const,
    units: "dimensionless",
    authority: "AUTHORITATIVE_STANDARD_DERIVED" as const,
    source: "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7+INFOGRAPH_EN1992_PUNCHING",
    applicability: "required declared input; recommended 0.18/gamma_c is not packed",
    profileGeneration: "FIRST_GENERATION_CLAIMED_BY_SOURCES" as const,
    ndpStatus: "NDP_DEPENDENT" as const,
    version: EU_C5_PARAMETER_VERSION,
    validationState: "NUMERICALLY_VALIDATED" as const,
  },
  {
    parameterId: "v_min_coefficient",
    value: null,
    valueMode: "DECLARED_NDP_INPUT" as const,
    units: "dimensionless",
    authority: "AUTHORITATIVE_STANDARD_DERIVED" as const,
    source: "SOFISTIK_DCE_EN7+INFOGRAPH_EN1992_PUNCHING",
    applicability: `required declared coefficient for expression ${EU_C5_VMIN_EXPRESSION_ID}; national alternative expressions are not selected`,
    profileGeneration: "FIRST_GENERATION_CLAIMED_BY_SOURCES" as const,
    ndpStatus: "NDP_DEPENDENT" as const,
    version: EU_C5_PARAMETER_VERSION,
    validationState: "NUMERICALLY_VALIDATED" as const,
  },
] as const;

export const EU_C5_PARAMETER_PROVENANCE = [
  EU_C5_K_DEPTH_NUMERATOR_MM,
  EU_C5_K_UPPER_BOUND,
  EU_C5_RHO_UPPER_BOUND,
  EU_C5_RHO_STRESS_SCALE,
  EU_C5_PERIMETER_OFFSET_FACTOR,
  EU_C5_CIRCULAR_ARC_CONSTANT,
  ...EU_C5_DECLARED_NDP_PARAMETERS,
] as const;

export const EU_C5_SHEAR_OPERATIONS = [
  "K_MIN_OF_UPPER_BOUND_AND_ONE_PLUS_SQRT_DEPTH_NUMERATOR_OVER_D_MM",
  "RHO_L_MIN_OF_UPPER_BOUND_AND_ASL_OVER_BW_D",
  "STRESS_MAIN_CRDC_TIMES_K_TIMES_CBRT_SCALE_RHO_FCK",
  "STRESS_MIN_DECLARED_COEFFICIENT_TIMES_K_POW_3_2_TIMES_SQRT_FCK",
  "FORCE_N_EQUALS_MAX_STRESS_TIMES_BW_MM_TIMES_D_MM",
  "FAIL_CLOSED_MISSING_DECLARED_NDP",
  "FAIL_CLOSED_NONZERO_OR_MISSING_AXIAL",
  "FAIL_CLOSED_DESIGN_SHEAR_REINFORCEMENT_PRESENT",
] as const;

export const EU_C5_PUNCHING_OPERATIONS = [
  "U1_MM_EQUALS_TWO_TIMES_C1_PLUS_C2_PLUS_TWO_PI_OFFSET_FACTOR_D",
  "RHO_L_MIN_OF_UPPER_BOUND_AND_SQRT_RHOX_RHOY",
  "STRESS_MAIN_CRDC_TIMES_K_TIMES_CBRT_SCALE_RHO_FCK",
  "STRESS_MIN_DECLARED_COEFFICIENT_TIMES_K_POW_3_2_TIMES_SQRT_FCK",
  "V_ED_MPA_EQUALS_BETA_TIMES_PUNCHING_FORCE_N_OVER_U1_D",
  "DO_NOT_CONSUME_BEAM_SHEAR_DEMAND_AS_PUNCHING",
] as const;
