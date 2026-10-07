import type {
  EuC1cEvidenceGapRuleId,
  EuC1cEvidenceRuleRecord,
  EuC1cEvidenceSourceRecord,
} from "@rtb/types";
import {
  EU_C1C_C2_MINIMUM_REQUIRED_RULE_COUNT,
  EU_C1C_C2_MINIMUM_REQUIRED_RULE_IDS,
  EU_C1C_EVIDENCE_BLOCKED_RULE_IDS,
  EU_C1C_EVIDENCE_INITIAL_GAP_COUNT,
  EU_C1C_EVIDENCE_INITIAL_GAP_RULE_IDS,
  EU_C1C_EVIDENCE_NUMERICAL_RULE_IMPLEMENTATION_COUNT,
  EU_C1C_EVIDENCE_READY_RULE_COUNT,
  EU_C1C_EVIDENCE_READY_RULE_IDS,
  EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED,
  EU_C1C_RESUME_GATE,
  EU_C1_IMPLEMENTED_RULE_IDS,
  PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE,
} from "@rtb/types";
import { EU_C1B_RULE_EVIDENCE_RECORDS } from "../eu-c1b";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

const PROFILE_FIRST_GEN =
  "EN 1992 / EN_1992_1_1 / first-generation clause identity recorded by source; pack generation remains UNKNOWN_PENDING_CONFIRMATION";

export const EU_C1C_EVIDENCE_SOURCES: readonly EuC1cEvidenceSourceRecord[] = [
  {
    sourceId: "JRC113687",
    publisher: "European Commission Joint Research Centre",
    author: "JRC Safety and Security of Buildings / Eurocodes reliability study",
    sourceType: "OFFICIAL_EU_JRC_SCIENTIFIC_REPORT",
    tier: "TIER_A",
    publicationIdentity: "JRC113687 reliability report; Table 8 EN 1992-1-1 2.4.2.4(1)",
    url: "https://eurocodes.jrc.ec.europa.eu/sites/default/files/2021-12/JRC113687_jrc_new_reliability_reportprint-f_1.pdf",
    profileClaimedBySource: "EN 1992-1-1 first generation, clause 2.4.2.4(1)",
    generationClaimedBySource: "FIRST_GENERATION",
    editionClaimedBySource: "EN_1992_1_1_CLAUSE_2_4_2_4_1",
    rulesSupported: ["EU_C1_PARTIAL_FACTOR_GAMMA_C", "EU_C1_PARTIAL_FACTOR_GAMMA_S"],
    parametersSupported: ["gamma_c", "gamma_s"],
    units: "dimensionless",
    applicability: "ULS material partial factors treated as NDPs; CEN recommended row vs national selections including DNK divergence",
    independenceGroup: "JRC_EC",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
  {
    sourceId: "JRC_EUROCODES_HARMONISATION",
    publisher: "European Commission Joint Research Centre / DG GROW Eurocodes",
    author: "Commission/JRC Eurocodes implementation pages",
    sourceType: "OFFICIAL_EU_GOVERNMENT_IMPLEMENTATION_METADATA",
    tier: "TIER_A",
    publicationIdentity: "Further harmonisation of the EN Eurocodes; material partial factors cited as NDPs",
    url: "https://eurocodes.jrc.ec.europa.eu/en-eurocodes/further-harmonisation-en-eurocodes",
    profileClaimedBySource: "EN Eurocodes including EN 1992 material partial factors",
    generationClaimedBySource: "FIRST_GENERATION_NDP_FRAMEWORK",
    editionClaimedBySource: "UNSTATED_PART_LEVEL",
    rulesSupported: ["EU_C1_PARTIAL_FACTOR_GAMMA_C", "EU_C1_PARTIAL_FACTOR_GAMMA_S"],
    parametersSupported: ["gamma_c", "gamma_s"],
    units: "dimensionless",
    applicability: "Member States should use recommended values except where justified; not a default National Annex",
    independenceGroup: "JRC_EC",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
  {
    sourceId: "JRC71599",
    publisher: "European Commission Joint Research Centre",
    author: "SAFECAST design guidelines (JRC repository)",
    sourceType: "OFFICIAL_EU_JRC_DESIGN_GUIDELINE",
    tier: "TIER_A",
    publicationIdentity: "JRC71599 binder1.pdf; EC2-recommended γC/γS and fcd=fck/γC, fyd=fyk/γS",
    url: "https://publications.jrc.ec.europa.eu/repository/bitstream/JRC71599/binder1.pdf",
    profileClaimedBySource: "EN 1992-1-1:2004 cited as EC2",
    generationClaimedBySource: "FIRST_GENERATION",
    editionClaimedBySource: "EN_1992_1_1_2004",
    rulesSupported: [
      "EU_C1_PARTIAL_FACTOR_GAMMA_C",
      "EU_C1_PARTIAL_FACTOR_GAMMA_S",
      "EU_C1_CONCRETE_DESIGN_PROPERTIES",
      "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
    ],
    parametersSupported: ["gamma_c", "gamma_s", "fcd", "fyd"],
    units: "stress as source; factors dimensionless",
    applicability: "first-generation EC2 recommended factors; design-strength identities without packing αcc",
    independenceGroup: "JRC_EC",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
  {
    sourceId: "JRC_ARRIETA_EC2_WORKSHOP_2011",
    publisher: "European Commission Joint Research Centre",
    author: "Arrieta; Eurocode 2 Background and Applications workshop, Brussels 20-21 Oct 2011",
    sourceType: "OFFICIAL_EU_JRC_WORKSHOP_MATERIAL",
    tier: "TIER_A",
    publicationIdentity: "05_EC2WS_Arrieta_Detailing.pdf; column B-2 materials γc=1,50 γs=1,15",
    url: "https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/05_EC2WS_Arrieta_Detailing.pdf",
    profileClaimedBySource: "EN 1992 first-generation workshop (EUR 26566 series)",
    generationClaimedBySource: "FIRST_GENERATION",
    editionClaimedBySource: "WORKSHOP_2011_EN1992",
    rulesSupported: ["EU_C1_PARTIAL_FACTOR_GAMMA_C", "EU_C1_PARTIAL_FACTOR_GAMMA_S"],
    parametersSupported: ["gamma_c", "gamma_s"],
    units: "dimensionless; fck/fyk N/mm2 as example inputs",
    applicability: "worked-example persistent ULS factors; not a National Annex default",
    independenceGroup: "JRC_EC",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
  {
    sourceId: "JRC_WALRAVEN_ULS_2011",
    publisher: "European Commission Joint Research Centre",
    author: "Walraven; Eurocode 2 Background and Applications ULS/SLS workshop",
    sourceType: "OFFICIAL_EU_JRC_WORKSHOP_MATERIAL",
    tier: "TIER_A",
    publicationIdentity: "04_EC2WS_Walraven_ULSSLS.pdf; simplified stress-block method 3.1.7; fcd=25/1,5",
    url: "https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/04_EC2WS_Walraven_ULSSLS.pdf",
    profileClaimedBySource: "EN 1992-1-1 first generation, clause 3.1.7 example path",
    generationClaimedBySource: "FIRST_GENERATION",
    editionClaimedBySource: "WORKSHOP_2011_EN1992",
    rulesSupported: ["EU_C1_STRESS_BLOCK_OR_SECTION_MODEL", "EU_C1_CONCRETE_DESIGN_PROPERTIES", "EU_C1_PARTIAL_FACTOR_GAMMA_C"],
    parametersSupported: ["gamma_c"],
    units: "MPa for fcd example",
    applicability: "shows stress-block as an example method, not the only C2 method; does not bind η/λ/εcu pack constants",
    independenceGroup: "JRC_EC",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
  {
    sourceId: "TCC_LECTURE2_2016",
    publisher: "The Concrete Centre",
    author: "TCC Eurocode webinar course, lecture 2, 28 Sep 2016",
    sourceType: "RECOGNIZED_INSTITUTIONAL_DESIGN_GUIDE",
    tier: "TIER_B",
    publicationIdentity: "Lecture-2-Materials,-Cover-and-some-definitions-cg-28-Sep-2016.pdf; Table 2.1N and NA; eqn 3.1.6",
    url: "https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Presentations/Lecture-2-Materials,-Cover-and-some-definitions-cg-28-Sep-2016.pdf",
    profileClaimedBySource: "EN 1992-1-1 with UK National Annex practice noted separately",
    generationClaimedBySource: "FIRST_GENERATION",
    editionClaimedBySource: "EN_1992_1_1_WITH_UK_NA_COMMENTARY",
    rulesSupported: [
      "EU_C1_PARTIAL_FACTOR_GAMMA_C",
      "EU_C1_PARTIAL_FACTOR_GAMMA_S",
      "EU_C1_CONCRETE_DESIGN_PROPERTIES",
    ],
    parametersSupported: ["gamma_c", "gamma_s", "alpha_cc", "fcd"],
    units: "dimensionless factors; fcd MPa in poll example",
    applicability: "independent UK institutional corroboration of CEN recommended γC/γS; UK αcc=0.85 flexure is NA-specific and is not packed",
    independenceGroup: "TCC_UK",
    numericalAuthorityAllowed: true,
    evidenceStatus: "BOUND",
  },
];

const INTENDED = {
  intendedProfile: PROFILE_FIRST_GEN,
  packConstantValue: null,
  engineeringValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
  conformanceState: "INTENDED_PROFILE" as const,
  version: "c1c-evidence.0" as const,
};

function gammaRecord(ruleId: "EU_C1_PARTIAL_FACTOR_GAMMA_C" | "EU_C1_PARTIAL_FACTOR_GAMMA_S", parameterId: "gamma_c" | "gamma_s"): EuC1cEvidenceRuleRecord {
  const cenRv = parameterId === "gamma_c" ? "1.5" : "1.15";
  return {
    ...INTENDED,
    ruleId,
    c2Role: "REQUIRED_FOR_BOUNDED_C2",
    readiness: "IMPLEMENTATION_READY",
    authorityType: "VALIDATED_ENGINEERING_REFERENCE",
    sourceRefs: ["JRC113687", "JRC_EUROCODES_HARMONISATION", "JRC71599", "JRC_ARRIETA_EC2_WORKSHOP_2011"],
    independentEvidenceRefs: ["TCC_LECTURE2_2016"],
    dependencyClass: "NDP_DEPENDENT",
    formulaFingerprintCandidate: formulaFingerprint({
      ruleId,
      operations: ["REQUIRE_DECLARED_NDP_OR_PROJECT_OVERRIDE", "FORBID_SILENT_CEN_RV_DEFAULT", "FORBID_LOCATION_INFERRED_ANNEX"],
      parameterIds: [parameterId],
    }),
    parameterIds: [parameterId],
    units: "dimensionless",
    applicability: "first-generation EN 1992-1-1 2.4.2.4(1) persistent/transient ULS; accidental situation not bound; fire design excluded",
    nationalAnnexDependency: true,
    ndpDependency: true,
    recommendedValueEvidence: `CEN recommended ${parameterId}=${cenRv} recorded as evidence only; JRC113687 Table 8 DNK diverges; not a pack constant`,
    validationPlan: "C1C implementation: fail closed if declared NA/project override missing; golden cases must not call production; do not default 1.5/1.15",
    provenance: "TIER_A JRC NDP classification plus independent TCC corroboration of recommended values; no default European annex",
  };
}

const CONCRETE_DESIGN: EuC1cEvidenceRuleRecord = {
  ...INTENDED,
  ruleId: "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  c2Role: "DERIVED_FROM_OTHER_GOVERNED_RULE",
  readiness: "IMPLEMENTATION_READY",
  authorityType: "VALIDATED_ENGINEERING_REFERENCE",
  sourceRefs: ["TCC_LECTURE2_2016", "JRC71599"],
  independentEvidenceRefs: ["JRC_WALRAVEN_ULS_2011"],
  dependencyClass: "NDP_DEPENDENT",
  formulaFingerprintCandidate: formulaFingerprint({
    ruleId: "EU_C1_CONCRETE_DESIGN_PROPERTIES",
    operations: ["MULTIPLY_ALPHA_CC_BY_FCK", "DIVIDE_BY_DECLARED_GAMMA_C", "REQUIRE_DECLARED_ALPHA_CC", "FORBID_DEFAULT_ALPHA_CC"],
    parameterIds: ["fck", "alpha_cc", "gamma_c", "fcd"],
  }),
  parameterIds: ["fck", "alpha_cc", "gamma_c", "fcd"],
  units: "fck/fcd explicit stress units; alpha_cc and gamma_c dimensionless",
  applicability: "first-generation EN 1992-1-1 3.1.6 design compressive strength identity; αcc is NDP and must be declared; UK 0.85 flexure is not defaulted; JRC examples that omit αcc are not used to pack 1.0",
  nationalAnnexDependency: true,
  ndpDependency: true,
  recommendedValueEvidence: null,
  validationPlan: "C1C implementation reuses C1 fck input; require declared αcc and γc; fail closed if either missing; do not invent 0.85 or 1.0",
  provenance: "TCC states fcd=αcc fck/γc; JRC71599/Walraven use fck/γc in examples. Conflict on packed αcc is classified as NDP, not averaged",
};

const REO_DESIGN: EuC1cEvidenceRuleRecord = {
  ...INTENDED,
  ruleId: "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
  c2Role: "DERIVED_FROM_OTHER_GOVERNED_RULE",
  readiness: "IMPLEMENTATION_READY",
  authorityType: "VALIDATED_ENGINEERING_REFERENCE",
  sourceRefs: ["JRC71599"],
  independentEvidenceRefs: ["TCC_LECTURE2_2016"],
  dependencyClass: "NDP_DEPENDENT",
  formulaFingerprintCandidate: formulaFingerprint({
    ruleId: "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
    operations: ["DIVIDE_FYK_BY_DECLARED_GAMMA_S"],
    parameterIds: ["fyk", "gamma_s", "fyd"],
  }),
  parameterIds: ["fyk", "gamma_s", "fyd"],
  units: "fyk/fyd explicit stress units; gamma_s dimensionless",
  applicability: "first-generation EC2 design yield from characteristic yield and declared γs; no extra conversion coefficient is packed",
  nationalAnnexDependency: true,
  ndpDependency: true,
  recommendedValueEvidence: null,
  validationPlan: "C1C implementation reuses C1 fyk input and declared γs; fail closed if γs missing",
  provenance: "JRC71599 writes fyd=fyk/γS; γs remains NDP-declared",
};

function blockedResponse(
  ruleId: EuC1cEvidenceGapRuleId,
  c2Role: EuC1cEvidenceRuleRecord["c2Role"],
  blockedNote: string,
): EuC1cEvidenceRuleRecord {
  return {
    ...INTENDED,
    ruleId,
    c2Role,
    readiness: "BLOCKED_RULE_AUTHORITY",
    authorityType: "UNBOUND",
    sourceRefs: [],
    independentEvidenceRefs: [],
    dependencyClass: "UNRESOLVED",
    formulaFingerprintCandidate: null,
    parameterIds: [],
    units: null,
    applicability: "UNBOUND_PENDING_GOVERNED_CONSTITUTIVE_REFERENCE",
    nationalAnnexDependency: "UNRESOLVED",
    ndpDependency: "UNRESOLVED",
    recommendedValueEvidence: null,
    validationPlan: "Bind a first-generation constitutive/strain source that is not a copyrighted standard reproduction and does not mix second-generation FprEN parameters",
    provenance: blockedNote,
  };
}

const STRESS_BLOCK: EuC1cEvidenceRuleRecord = {
  ...INTENDED,
  ruleId: "EU_C1_STRESS_BLOCK_OR_SECTION_MODEL",
  c2Role: "ALTERNATIVE_GOVERNED_METHOD_AVAILABLE",
  readiness: "SATISFIED_BY_MATERIAL_INTEGRATION",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  sourceRefs: ["JRC_WALRAVEN_ULS_2011"],
  independentEvidenceRefs: ["D1E-1 section-mechanics fiber integration contract"],
  dependencyClass: "OTHER_GOVERNED_DEPENDENCY",
  formulaFingerprintCandidate: null,
  parameterIds: [],
  units: null,
  applicability: "bounded C2 uniaxial flexure may use D1E-1 deterministic material integration; Walraven 3.1.7 stress-block path is alternative, not mandatory; η/λ remain unbound",
  nationalAnnexDependency: "UNRESOLVED",
  ndpDependency: "UNRESOLVED",
  recommendedValueEvidence: null,
  validationPlan: "Do not implement an EN 1992 stress block in the common kernel; C2 consumes D1E-1 integration once constitutive laws are bound",
  provenance: "D1E-1 already integrates fiber stresses; simplified stress block is not required for bounded C2",
};

export const EU_C1C_EVIDENCE_RULE_RECORDS: readonly EuC1cEvidenceRuleRecord[] = [
  CONCRETE_DESIGN,
  REO_DESIGN,
  gammaRecord("EU_C1_PARTIAL_FACTOR_GAMMA_C", "gamma_c"),
  gammaRecord("EU_C1_PARTIAL_FACTOR_GAMMA_S", "gamma_s"),
  blockedResponse(
    "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
    "REQUIRED_FOR_BOUNDED_C2",
    "no independently governed first-generation σ-ε law bound without reproducing EN 1992 Table 3.1/3.1.5; second-generation Ganz FprEN 2023 not mixed",
  ),
  blockedResponse(
    "EU_C1_CONCRETE_STRAIN_LIMITS",
    "REQUIRED_FOR_BOUNDED_C2",
    "strain-state identities for material integration remain unbound; generic ecu is not assumed; no pack constant",
  ),
  blockedResponse(
    "EU_C1_REINFORCEMENT_RESPONSE",
    "REQUIRED_FOR_BOUNDED_C2",
    "no independently governed design-level reinforcement σ-ε law bound; D1E-1 elastic reference is not ULS design response",
  ),
  {
    ...blockedResponse(
      "EU_C1_REINFORCEMENT_STRAIN_STATES",
      "UNRESOLVED",
      "separate εud/εuk identities not shown to be required or satisfied for bounded C2 material integration",
    ),
    readiness: "BLOCKED_OTHER",
  },
  STRESS_BLOCK,
];

export function assertEuC1cEvidenceRecordsLoaded(): void {
  if (EU_C1C_EVIDENCE_INITIAL_GAP_RULE_IDS.length !== EU_C1C_EVIDENCE_INITIAL_GAP_COUNT) {
    throw new Error("C1C evidence initial gap count drifted");
  }
  if (EU_C1C_C2_MINIMUM_REQUIRED_RULE_IDS.length !== EU_C1C_C2_MINIMUM_REQUIRED_RULE_COUNT) {
    throw new Error("C1C evidence minimum C2 count drifted");
  }
  const c1bIds = EU_C1B_RULE_EVIDENCE_RECORDS.map((row) => row.ruleId);
  for (const id of EU_C1C_EVIDENCE_INITIAL_GAP_RULE_IDS) {
    if (!c1bIds.includes(id)) throw new Error(`C1C evidence gap ${id} missing from C1B records`);
  }
  if (![...EU_C1_IMPLEMENTED_RULE_IDS].includes("EU_C1_CONCRETE_CHAR_PROPERTIES")) {
    throw new Error("C1 characteristic rules must remain loaded");
  }
  if (EU_C1C_EVIDENCE_SOURCES.some((src) => src.tier === "TIER_D" && src.numericalAuthorityAllowed)) {
    throw new Error("TIER_D sources must not be numerical authority");
  }
  if (PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE) throw new Error("public sources are not automatically authoritative");
  if (EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED) throw new Error("partial-factor values must not be guessed");
  for (const row of EU_C1C_EVIDENCE_RULE_RECORDS) {
    if (row.packConstantValue != null) throw new Error(`C1C evidence must not pack ${row.ruleId}`);
    if (row.sourceRefs.includes("EN1992_PDF")) throw new Error("copyrighted standard PDF must not be an evidence source");
  }
  const ready = EU_C1C_EVIDENCE_RULE_RECORDS.filter((row) => row.readiness === "IMPLEMENTATION_READY").map((row) => row.ruleId);
  if (ready.length !== EU_C1C_EVIDENCE_READY_RULE_COUNT) throw new Error("ready-rule count drifted");
  for (const id of EU_C1C_EVIDENCE_READY_RULE_IDS) {
    if (!ready.includes(id)) throw new Error(`ready rule ${id} missing from records`);
  }
  for (const id of EU_C1C_EVIDENCE_BLOCKED_RULE_IDS) {
    const row = EU_C1C_EVIDENCE_RULE_RECORDS.find((item) => item.ruleId === id);
    if (!row || row.readiness === "IMPLEMENTATION_READY" || row.readiness === "SATISFIED_BY_MATERIAL_INTEGRATION") {
      throw new Error(`blocked rule ${id} misclassified`);
    }
  }
  if (EU_C1C_EVIDENCE_NUMERICAL_RULE_IMPLEMENTATION_COUNT !== 0) {
    throw new Error("C1C evidence must not implement numerical rules");
  }
  const minimumReadyOrSatisfied = EU_C1C_C2_MINIMUM_REQUIRED_RULE_IDS.every((id) => {
    const row = EU_C1C_EVIDENCE_RULE_RECORDS.find((item) => item.ruleId === id);
    return (
      row?.readiness === "IMPLEMENTATION_READY" ||
      row?.readiness === "SATISFIED_BY_EXISTING_RULE" ||
      row?.readiness === "SATISFIED_BY_MATERIAL_INTEGRATION" ||
      row?.readiness === "NOT_REQUIRED_FOR_BOUNDED_C2"
    );
  });
  if (minimumReadyOrSatisfied) {
    throw new Error("C1C evidence resume gate must stay FAIL while constitutive minimum dependencies remain blocked");
  }
  if (EU_C1C_RESUME_GATE !== "FAIL") throw new Error("resume gate must FAIL while constitutive rules remain blocked");
}

export function assertEuC1cEvidenceNoGuessedValues(): void {
  for (const row of EU_C1C_EVIDENCE_RULE_RECORDS) {
    if (row.packConstantValue != null) throw new Error("no packed engineering constants in evidence phase");
  }
  if (EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED) throw new Error("partial-factor values must not be guessed");
}
