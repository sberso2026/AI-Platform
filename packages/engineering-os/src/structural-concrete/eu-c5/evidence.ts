import type { EuC5EvidenceRuleRecord, EuC5Readiness, EuC5RuleId } from "@rtb/types";
import {
  EU_C5_CLASSIFIED_OPTIONAL_RULE_IDS,
  EU_C5_IMPLEMENTATION_VERSION,
  EU_C5_PUNCHING_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_REQUIRED_RULE_IDS,
  EU_C5_TORSION_REQUIRED_RULE_IDS,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";
import { EU_C5_PUNCHING_OPERATIONS, EU_C5_SHEAR_OPERATIONS } from "./parameters";

const PROFILE = "FIRST_GENERATION claimed by sources; pack generation/edition UNKNOWN_PENDING_CONFIRMATION";

function record(
  ruleId: EuC5RuleId,
  family: EuC5EvidenceRuleRecord["family"],
  readiness: EuC5Readiness,
  fields: Omit<
    EuC5EvidenceRuleRecord,
    | "ruleId"
    | "family"
    | "readiness"
    | "claimedStandardGeneration"
    | "claimedEdition"
    | "packConstantValue"
    | "version"
    | "engineeringValidationState"
    | "conformanceState"
    | "formulaFingerprint"
  > & { operations: readonly string[] },
): EuC5EvidenceRuleRecord {
  const { operations, ...rest } = fields;
  return {
    ...rest,
    ruleId,
    family,
    readiness,
    claimedStandardGeneration: PROFILE,
    claimedEdition: "UNKNOWN_PENDING_CONFIRMATION",
    packConstantValue: null,
    formulaFingerprint: formulaFingerprint({ ruleId, operations, parameterIds: rest.parameterIds }),
    version: EU_C5_IMPLEMENTATION_VERSION,
    engineeringValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW",
    conformanceState: "INTENDED_PROFILE",
  };
}

const READY_SHEAR = record(
  "EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT",
  "SHEAR",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    parameterIds: ["CRd,c", "k", "rho_l", "fck", "bw", "d", "v_min_coefficient"],
    units: "resistance N; fck MPa; bw and d mm",
    applicability: "members without design shear reinforcement; zero axial; first-generation expression",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["SOFISTIK_DCE_EN7"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: EU_C5_SHEAR_OPERATIONS,
    provenance: "Walraven 2011 beam shear worked example corroborated by the SOFiSTiK EN 1992-1-1:2004 shear benchmark. CRd,c and the vmin coefficient stay declared inputs.",
  },
);

const GEOMETRY = record(
  "EU_C5_SHEAR_EFFECTIVE_GEOMETRY",
  "SHEAR",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    parameterIds: ["d", "bw", "Asl", "k_depth_numerator", "k_upper_bound", "rho_l_upper_bound"],
    units: "mm and mm2",
    applicability: "explicit effective depth, web width, and longitudinal tension area; k and rho_l derived only from those inputs",
    nationalAnnexDependency: false,
    ndpDependency: false,
    ndpClassification: "STANDARD_DEFINED",
    independentCorroboration: ["SOFISTIK_DCE_EN7"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["REQUIRE_EXPLICIT_D_BW_ASL", "DERIVE_K_AND_RHO_L"],
    provenance: "Effective depth and web width are calculation inputs. The size factor and longitudinal ratio use the corroborated definitions and are not inferred from a generic section.",
  },
);

const VMIN = record(
  "EU_C5_SHEAR_MINIMUM_RESISTANCE",
  "SHEAR",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "SOFISTIK_DCE_EN7",
    publisher: "SOFiSTiK AG",
    sourceType: "VALIDATED_ENGINEERING_SOFTWARE_BENCHMARK",
    parameterIds: ["v_min_coefficient", "k", "fck"],
    units: "stress MPa when fck is MPa",
    applicability: "recommended k^(3/2)*fck^(1/2) expression only; coefficient is a declared NDP",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["INFOGRAPH_EN1992_PUNCHING"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["STRESS_MIN_DECLARED_COEFFICIENT_TIMES_K_POW_3_2_TIMES_SQRT_FCK"],
    provenance: "SOFiSTiK and InfoGraph state the recommended minimum-stress expression. The coefficient is not packed. A different national expression is a separate blocked rule.",
  },
);

const CRDC = record(
  "EU_C5_SHEAR_DECLARED_CRDC",
  "SHEAR",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    parameterIds: ["CRd,c"],
    units: "dimensionless",
    applicability: "declared NDP; recommended 0.18/gamma_c is not a runtime default",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["SOFISTIK_DCE_EN7", "INFOGRAPH_EN1992_PUNCHING"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["REQUIRE_DECLARED_CRDC", "DO_NOT_PACK_RECOMMENDED_VALUE"],
    provenance: "Sources identify CRd,c as a country-specific recommended parameter. C5 requires the value and does not divide by gamma_c again.",
  },
);

const PUNCH_PERIMETER = record(
  "EU_C5_PUNCHING_CONTROL_PERIMETER",
  "PUNCHING",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    parameterIds: ["c1", "c2", "d", "punching_control_perimeter_offset_factor"],
    units: "mm",
    applicability: "interior rectangular loaded area; offset factor 2; no openings",
    nationalAnnexDependency: false,
    ndpDependency: false,
    ndpClassification: "STANDARD_DEFINED",
    independentCorroboration: ["TCC_LECTURE6_2017", "MARKOVA_PUNCHING_2019"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["U1_INTERIOR_RECTANGLE"],
    provenance: "Walraven places the basic control perimeter at 2.0d and gives the rectangular interior length. TCC and Markova corroborate the 2d offset. Edge and corner perimeters are not this rule.",
  },
);

const PUNCH_RESISTANCE = record(
  "EU_C5_PUNCHING_CONCRETE_RESISTANCE",
  "PUNCHING",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "JRC_WALRAVEN_2011",
    publisher: "European Commission Joint Research Centre",
    sourceType: "OFFICIAL_INSTITUTIONAL_WORKSHOP",
    parameterIds: ["CRd,c", "k", "rho_l", "fck", "beta", "punchingForce"],
    units: "stress MPa; punching force N",
    applicability: "interior concrete punching stress; rho_l is the geometric mean of orthogonal ratios; not beam shear",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["INFOGRAPH_EN1992_PUNCHING", "TCC_LECTURE6_2017", "MARKOVA_PUNCHING_2019"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: EU_C5_PUNCHING_OPERATIONS,
    provenance: "Punching uses the unitary concrete stress expression with its own perimeter, geometric-mean reinforcement ratio, and explicit punching force. Beam shear demand is not reused.",
  },
);

const PUNCH_CRDC = record(
  "EU_C5_PUNCHING_DECLARED_CRDC",
  "PUNCHING",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "INFOGRAPH_EN1992_PUNCHING",
    publisher: "InfoGraph",
    sourceType: "ENGINEERING_SOFTWARE_REFERENCE",
    parameterIds: ["CRd,c"],
    units: "dimensionless",
    applicability: "declared punching CRd,c; German u0/d modification is not applied",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["JRC_WALRAVEN_2011"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["REQUIRE_DECLARED_CRDC"],
    provenance: "InfoGraph separates the recommended CRd,c from national modifications. The recommended numerator is not packed.",
  },
);

const PUNCH_VMIN = record(
  "EU_C5_PUNCHING_DECLARED_VMIN",
  "PUNCHING",
  "IMPLEMENTATION_READY",
  {
    authorityType: "AUTHORITATIVE_STANDARD_DERIVED",
    source: "INFOGRAPH_EN1992_PUNCHING",
    publisher: "InfoGraph",
    sourceType: "ENGINEERING_SOFTWARE_REFERENCE",
    parameterIds: ["v_min_coefficient"],
    units: "dimensionless",
    applicability: "same recommended minimum-stress expression as shear; coefficient declared",
    nationalAnnexDependency: true,
    ndpDependency: true,
    ndpClassification: "NDP_DEPENDENT",
    independentCorroboration: ["SOFISTIK_DCE_EN7"],
    validationState: "NUMERICALLY_VALIDATED",
    implementable: true,
    operations: ["STRESS_MIN_DECLARED_COEFFICIENT_TIMES_K_POW_3_2_TIMES_SQRT_FCK"],
    provenance: "The recommended minimum expression is shared as a stress identity. It is not a reuse of the beam shear force equation.",
  },
);

function blocked(
  ruleId: EuC5RuleId,
  family: EuC5EvidenceRuleRecord["family"],
  readiness: EuC5Readiness,
  provenance: string,
  ndpClassification: EuC5EvidenceRuleRecord["ndpClassification"] = "UNRESOLVED",
): EuC5EvidenceRuleRecord {
  return record(ruleId, family, readiness, {
    authorityType: readiness === "SATISFIED_BY_EXISTING_RULE" ? "VALIDATED_ENGINEERING_REFERENCE" : "UNBOUND",
    source: "D1E architecture / excluded source",
    publisher: "RTB Engineering OS",
    sourceType: "REPOSITORY_ARCHITECTURE_OR_EXCLUDED_SOURCE",
    parameterIds: [],
    units: null,
    applicability: "outside the implemented C5 bounded methods",
    nationalAnnexDependency: "UNRESOLVED",
    ndpDependency: "UNRESOLVED",
    ndpClassification,
    independentCorroboration: ["packages/engineering-os/src/structural-demand"],
    validationState: "NOT_STARTED",
    implementable: false,
    operations: [readiness],
    provenance,
  });
}

export const EU_C5_EVIDENCE_RULE_RECORDS: readonly EuC5EvidenceRuleRecord[] = [
  READY_SHEAR,
  GEOMETRY,
  VMIN,
  CRDC,
  PUNCH_PERIMETER,
  PUNCH_RESISTANCE,
  PUNCH_CRDC,
  PUNCH_VMIN,
  blocked("EU_C5_TORSION_RESISTANCE", "TORSION", "BLOCKED_RULE_AUTHORITY", "No complete standalone torsion resistance is triangulated without an interaction equation or an ungoverned thin-wall resistance."),
  blocked("EU_C5_TORSION_DEMAND", "TORSION", "BLOCKED_RULE_AUTHORITY", "D1C torsion status is NOT_IMPLEMENTED. C5 does not create a torsion analysis engine."),
  blocked("EU_C5_SHEAR_RESISTANCE_WITH_TRANSVERSE_REINFORCEMENT", "SHEAR", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Strut-and-tie shear reinforcement is outside the bounded v1 method."),
  blocked("EU_C5_SHEAR_STRUT_OR_COMPRESSION_LIMIT", "SHEAR", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Web-crushing resistance is outside the without-reinforcement method."),
  blocked("EU_C5_SHEAR_AXIAL_DEPENDENCY", "SHEAR", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Bounded v1 is zero axial. A non-zero axial force fails closed. k1 is not packed."),
  blocked("EU_C1_PARTIAL_FACTOR_GAMMA_C", "SHEAR", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "CRd,c is the declared NDP. Gamma_c is not applied a second time."),
  blocked("EU_C1_CONCRETE_DESIGN_PROPERTIES", "SHEAR", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "The bounded expression uses fck, not fcd."),
  blocked("EU_C5_SHEAR_SECOND_GENERATION_MODEL", "SHEAR", "BLOCKED_PROFILE_IDENTITY", "Mancini bridge slides use a different size-factor length unit and coefficient and are not mixed into the first-generation method.", "UNRESOLVED"),
  blocked("EU_C5_VMIN_NATIONAL_EXPRESSION_ALTERNATIVE", "SHEAR", "BLOCKED_NDP", "A German-practice minimum expression with a different power of k is not selected and is not averaged with the recommended expression.", "NDP_DEPENDENT"),
  blocked("EU_C5_PUNCHING_REINFORCEMENT_CONTRIBUTION", "PUNCHING", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Punching reinforcement is outside the concrete-only interior method."),
  blocked("EU_C5_PUNCHING_MAXIMUM_RESISTANCE", "PUNCHING", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "The column-face maximum stress check is outside the basic-perimeter method."),
  blocked("EU_C5_PUNCHING_OPENING_EFFECTS", "PUNCHING", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Openings are out of the interior rectangular method."),
  blocked("EU_C5_PUNCHING_EDGE_CORNER", "PUNCHING", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Edge and corner perimeters are not the interior rectangle."),
  blocked("EU_C5_PUNCHING_ECCENTRICITY", "PUNCHING", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Beta is an explicit input. Moment-transfer beta is not calculated."),
  blocked("EU_C5_TORSION_THRESHOLD", "TORSION", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "No torsion threshold is implemented."),
  blocked("EU_C5_TORSION_REINFORCEMENT", "TORSION", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "Torsional reinforcement is not implemented."),
  blocked("EU_C5_TORSION_THIN_WALL_GEOMETRY", "TORSION", "BLOCKED_RULE_AUTHORITY", "Thin-wall geometry is not implemented because the torsion resistance dependency set is unresolved."),
  blocked("EU_C5_TORSION_SHEAR_INTERACTION", "TORSION", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "No V+T interaction is implemented."),
  blocked("EU_C5_TORSION_FLEXURE_INTERACTION", "TORSION", "NOT_REQUIRED_FOR_BOUNDED_SCOPE", "No M+T or N+M+V+T interaction is implemented."),
];

export function assertEuC5EvidenceLoaded(): void {
  const ids = EU_C5_EVIDENCE_RULE_RECORDS.map((row) => `${row.family}:${row.ruleId}`);
  if (new Set(ids).size !== ids.length) throw new Error("EU C5 evidence records must be unique per family and rule");
  const required = [
    ...EU_C5_SHEAR_REQUIRED_RULE_IDS.map((ruleId) => `SHEAR:${ruleId}`),
    ...EU_C5_PUNCHING_REQUIRED_RULE_IDS.map((ruleId) => `PUNCHING:${ruleId}`),
    ...EU_C5_TORSION_REQUIRED_RULE_IDS.map((ruleId) => `TORSION:${ruleId}`),
  ];
  for (const key of required) {
    if (!ids.includes(key)) throw new Error(`EU C5 missing required evidence record ${key}`);
  }
  for (const ruleId of EU_C5_CLASSIFIED_OPTIONAL_RULE_IDS) {
    if (!EU_C5_EVIDENCE_RULE_RECORDS.some((row) => row.ruleId === ruleId)) {
      throw new Error(`EU C5 missing optional classification ${ruleId}`);
    }
  }
  for (const row of EU_C5_EVIDENCE_RULE_RECORDS) {
    if (row.packConstantValue != null) throw new Error(`EU C5 pack constant on ${row.ruleId}`);
    if (!row.source || !row.publisher || !row.sourceType) throw new Error(`EU C5 ${row.ruleId} missing source identity`);
    if (row.readiness === "IMPLEMENTATION_READY" && !row.implementable) {
      throw new Error(`EU C5 ${row.ruleId} marked ready but not implementable`);
    }
    if (row.readiness !== "IMPLEMENTATION_READY" && row.implementable) {
      throw new Error(`EU C5 ${row.ruleId} must not be implementable while unresolved`);
    }
  }
}

export function assertEuC5NoGuessedValues(): void {
  for (const row of EU_C5_EVIDENCE_RULE_RECORDS) {
    if (row.packConstantValue != null) throw new Error(`EU C5 guessed pack constant on ${row.ruleId}`);
  }
}
