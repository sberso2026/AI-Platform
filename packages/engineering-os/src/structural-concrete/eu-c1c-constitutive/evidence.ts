import type { EuC1cConstitutiveParameterRecord, EuC1cConstitutiveTargetRuleId } from "@rtb/types";
import {
  CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING,
  CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION,
  EU_C1C_CONSTITUTIVE_MODEL_ID,
  EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
  EU_C1C_CONSTITUTIVE_REO_MODEL_ID,
  EU_C1C_CONSTITUTIVE_TARGET_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS,
  EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  LLM_CONSTITUTIVE_MEMORY_ONLY_RULE_ALLOWED,
  PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b";
import { assertEuC1cR1EvidenceLoaded } from "../eu-c1c-r1";

const COMPRESSION_OPS = [
  "MAP_D1E1_TENSION_POSITIVE_TO_EC2_COMPRESSION_POSITIVE",
  "PARABOLA_RECTANGLE_SECTION_ANALYSIS",
  "ZERO_CONCRETE_TENSION",
  "FAIL_CLOSED_OUTSIDE_EPS_CU2",
  "FAIL_CLOSED_FCK_GT_CONSTANT_STRAIN_LIMIT",
] as const;
const STRAIN_OPS = [
  "PARABOLA_RECTANGLE_STRAIN_STATES_EPS_C2_EPS_CU2",
  "CONSTANT_FOR_FCK_LE_LIMIT",
  "HIGH_STRENGTH_FORMULA_SOURCE_CONFLICT_FAILS_CLOSED",
] as const;
const REO_OPS = [
  "HOOKE_LAW_TO_FYD",
  "HORIZONTAL_TOP_BRANCH",
  "NO_SEPARATE_EPS_UD_FOR_HORIZONTAL_BRANCH",
] as const;

export const EU_C1C_CONSTITUTIVE_RULE_OPERATIONS = {
  EU_C1_CONCRETE_COMPRESSION_RESPONSE: COMPRESSION_OPS,
  EU_C1_CONCRETE_STRAIN_LIMITS: STRAIN_OPS,
  EU_C1_REINFORCEMENT_RESPONSE: REO_OPS,
} as const;

export const EU_C1C_CONSTITUTIVE_RULE_PARAMETER_IDS = {
  EU_C1_CONCRETE_COMPRESSION_RESPONSE: ["fcd", "eps_c2", "eps_cu2", "n_parabola", "fck_constant_strain_limit"],
  EU_C1_CONCRETE_STRAIN_LIMITS: ["eps_c2", "eps_cu2", "n_parabola", "fck_constant_strain_limit"],
  EU_C1_REINFORCEMENT_RESPONSE: ["Es", "fyd"],
} as const;

export const EU_C1C_CONSTITUTIVE_SOURCES = [
  {
    sourceId: "JRC_WALRAVEN_2008",
    publisher: "European Commission Joint Research Centre",
    independenceGroup: "JRC_EC",
    tier: "TIER_A",
    url: "https://eurocodes.jrc.ec.europa.eu/doc/WS2008/EN1992_1_Walraven.pdf",
    publicationIdentity: "Walraven EN1992_1 workshop 22 Feb 2008; parabola-rectangle section-analysis law and fck≤50 strain identities",
    generationClaimedBySource: "FIRST_GENERATION",
    numericalAuthorityAllowed: true,
    rulesSupported: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_CONCRETE_STRAIN_LIMITS"],
  },
  {
    sourceId: "TCC_LECTURE2_2016",
    publisher: "The Concrete Centre",
    independenceGroup: "TCC_UK",
    tier: "TIER_B",
    url: "https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Presentations/Lecture-2-Materials,-Cover-and-some-definitions-cg-28-Sep-2016.pdf",
    publicationIdentity: "TCC lecture 2 28 Sep 2016; parabola-rectangle εc2/εcu2/n identities for fck otherwise 2.0‰ / 3.5‰ / 2.0",
    generationClaimedBySource: "FIRST_GENERATION",
    numericalAuthorityAllowed: true,
    rulesSupported: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_CONCRETE_STRAIN_LIMITS"],
  },
  {
    sourceId: "OASYS_ADSEC_PARABOLA_RECTANGLE",
    publisher: "Oasys / Arup",
    independenceGroup: "OASYS_ARUP",
    tier: "CERTIFIED_EXTERNAL_TOOL_REFERENCE",
    url: "https://testdocs.oasys-software.com/structural/adsec/theory/parabola-rectangle-concrete/",
    publicationIdentity: "Oasys AdSec parabola-rectangle theory; Eurocode n=2 for fc≤50 MPa",
    generationClaimedBySource: "FIRST_GENERATION",
    numericalAuthorityAllowed: true,
    rulesSupported: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_CONCRETE_STRAIN_LIMITS"],
  },
  {
    sourceId: "PLEVRIS_EC2_ULS_SECTIONS",
    publisher: "Plevris / Papazafeiropoulos / Papadrakakis",
    independenceGroup: "PLEVRIS_NTUA",
    tier: "PEER_REVIEWED_OR_UNIVERSITY_STRUCTURAL",
    url: "https://vplevris.net/pdf_files/publications/C_25.pdf",
    publicationIdentity: "EC2 ULS section design paper; parabola-rectangle plus horizontal-top reinforcement branch without εud check",
    generationClaimedBySource: "FIRST_GENERATION",
    numericalAuthorityAllowed: true,
    rulesSupported: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_CONCRETE_STRAIN_LIMITS", "EU_C1_REINFORCEMENT_RESPONSE"],
  },
] as const;

const PROFILE =
  "EN 1992-1-1 first-generation section analysis claimed by source; pack generation/edition remain UNKNOWN_PENDING_CONFIRMATION";
const MATERIAL = "normal-weight concrete, static ULS, ambient temperature, fck at or below the constant-strain-parameter limit";

function parameter(
  parameterId: string,
  value: number,
  units: string,
  sourceReference: string,
  modelId: string,
  materialApplicability = MATERIAL,
): EuC1cConstitutiveParameterRecord {
  return {
    parameterId,
    value,
    units,
    sourceAuthority: "AUTHORITATIVE_STANDARD_DERIVED",
    sourceReference,
    profileApplicability: PROFILE,
    materialApplicability,
    version: EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
    validationState: "NUMERICALLY_VALIDATED",
    modelId,
  };
}

export const EU_C1C_CONSTITUTIVE_PARAMETERS = {
  eps_c2: parameter("eps_c2", 2.0, "‰", "JRC_WALRAVEN_2008+TCC_LECTURE2_2016", EU_C1C_CONSTITUTIVE_MODEL_ID),
  eps_cu2: parameter("eps_cu2", 3.5, "‰", "JRC_WALRAVEN_2008+TCC_LECTURE2_2016", EU_C1C_CONSTITUTIVE_MODEL_ID),
  n_parabola: parameter("n_parabola", 2.0, "dimensionless", "JRC_WALRAVEN_2008+OASYS_ADSEC_PARABOLA_RECTANGLE", EU_C1C_CONSTITUTIVE_MODEL_ID),
  fck_constant_strain_limit: parameter(
    "fck_constant_strain_limit",
    50,
    "MPa",
    "JRC_WALRAVEN_2008+TCC_LECTURE2_2016",
    EU_C1C_CONSTITUTIVE_MODEL_ID,
  ),
} as const;

export const EU_C1C_CONSTITUTIVE_HIGH_STRENGTH_CONFLICT =
  "GeoStru software help publishes a high-strength εcu2 formula that disagrees with JRC Walraven 2008 / TCC lecture 2; high-strength parameters are not packed and fck above the constant-strain limit fails closed" as const;

export function constitutiveFormulaFingerprint(ruleId: EuC1cConstitutiveTargetRuleId): string {
  return formulaFingerprint({
    ruleId,
    operations: EU_C1C_CONSTITUTIVE_RULE_OPERATIONS[ruleId],
    parameterIds: EU_C1C_CONSTITUTIVE_RULE_PARAMETER_IDS[ruleId],
  });
}

export const EU_C1C_CONSTITUTIVE_FORMULA_FINGERPRINTS = {
  EU_C1_CONCRETE_COMPRESSION_RESPONSE: constitutiveFormulaFingerprint("EU_C1_CONCRETE_COMPRESSION_RESPONSE"),
  EU_C1_CONCRETE_STRAIN_LIMITS: constitutiveFormulaFingerprint("EU_C1_CONCRETE_STRAIN_LIMITS"),
  EU_C1_REINFORCEMENT_RESPONSE: constitutiveFormulaFingerprint("EU_C1_REINFORCEMENT_RESPONSE"),
} as const;

export function assertEuC1cConstitutiveEvidenceLoaded(): void {
  assertEuC1cR1EvidenceLoaded();
  if (PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED) throw new Error("parallel constitutive architecture is forbidden");
  if (LLM_CONSTITUTIVE_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM memory-only constitutive rules are forbidden");
  if (CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING) throw new Error("cross-generation constitutive mixing is forbidden");
  if (EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS.length !== EU_C1C_CONSTITUTIVE_TARGET_RULE_COUNT) {
    throw new Error("constitutive target rule count drifted");
  }
  if (CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT !== EU_C1C_CONSTITUTIVE_TARGET_RULE_COUNT) {
    throw new Error("constitutive implemented count must match target count");
  }
  if (
    EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT !==
    EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT + CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT
  ) {
    throw new Error("constitutive cumulative count double-counted or drifted");
  }
  const groups = new Set(EU_C1C_CONSTITUTIVE_SOURCES.map((row) => row.independenceGroup));
  if (groups.size < 2) throw new Error("constitutive sources are not independent");
  if (EU_C1C_CONSTITUTIVE_EVIDENCE_VERSION !== EU_C1C_CONSTITUTIVE_PARAMETER_VERSION) {
    throw new Error("constitutive evidence/parameter versions must match for this pack");
  }
  void EU_C1C_CONSTITUTIVE_REO_MODEL_ID;
}

export function constitutiveEvidenceRefs(ruleId: EuC1cConstitutiveTargetRuleId): {
  sourceRefs: string[];
  independentRefs: string[];
} {
  const rows = EU_C1C_CONSTITUTIVE_SOURCES.filter((row) => (row.rulesSupported as readonly string[]).includes(ruleId));
  const sourceRefs = rows.filter((row) => row.independenceGroup === "JRC_EC" || row.independenceGroup === "TCC_UK").map((row) => row.sourceId);
  const independentRefs = rows.filter((row) => row.independenceGroup !== "JRC_EC").map((row) => row.sourceId);
  return { sourceRefs, independentRefs };
}
