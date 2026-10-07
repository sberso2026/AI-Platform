import type { EuC5EvidenceRuleRecord, EuC5Readiness, EuC5RuleId } from "@rtb/types";
import {
  EU_C5_CLASSIFIED_OPTIONAL_RULE_IDS,
  EU_C5_IMPLEMENTATION_VERSION,
  EU_C5_PUNCHING_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_REQUIRED_RULE_IDS,
  EU_C5_TORSION_REQUIRED_RULE_IDS,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

const INTENDED = {
  claimedStandardGeneration: "UNKNOWN_PENDING_CONFIRMATION",
  claimedEdition: "UNKNOWN_PENDING_CONFIRMATION",
  packConstantValue: null,
  version: EU_C5_IMPLEMENTATION_VERSION,
  engineeringValidationState: "PENDING_HUMAN_ENGINEERING_REVIEW" as const,
  conformanceState: "INTENDED_PROFILE" as const,
};

function architectureBlocked(
  ruleId: EuC5RuleId,
  family: EuC5EvidenceRuleRecord["family"],
  readiness: EuC5Readiness,
  architectureIdentity: string,
  provenance: string,
  extra?: Partial<Pick<EuC5EvidenceRuleRecord, "parameterIds" | "units" | "nationalAnnexDependency" | "ndpDependency" | "independentCorroboration">>,
): EuC5EvidenceRuleRecord {
  return {
    ...INTENDED,
    ruleId,
    family,
    readiness,
    authorityType: readiness === "SATISFIED_BY_EXISTING_RULE" ? "VALIDATED_ENGINEERING_REFERENCE" : "UNBOUND",
    source: architectureIdentity,
    publisher: "RTB Engineering OS D1E architecture",
    sourceType: readiness === "SATISFIED_BY_EXISTING_RULE" ? "EXISTING_GOVERNED_EU_RULE_PACK" : "REPOSITORY_ARCHITECTURE_GAP",
    parameterIds: extra?.parameterIds ?? [],
    units: extra?.units ?? null,
    applicability: "EN 1992 / EN_1992_1_1 intended profile; C5 bounded v1; generation/edition unconfirmed; no default National Annex",
    nationalAnnexDependency: extra?.nationalAnnexDependency ?? "UNRESOLVED",
    ndpDependency: extra?.ndpDependency ?? "UNRESOLVED",
    independentCorroboration: extra?.independentCorroboration ?? [
      "packages/types/src/structural-concrete.ts D1E-0 shear/punching/torsion frameworks",
      "packages/engineering-os/src/structural-concrete/eu-c1b/inventory.ts NO_GOVERNED_COEFFICIENT_SOURCE_IN_REPOSITORY",
    ],
    validationState: "NOT_STARTED",
    formulaFingerprint:
      readiness === "BLOCKED_RULE_AUTHORITY"
        ? formulaFingerprint({
            ruleId,
            operations: ["FAIL_CLOSED_BLOCKED_RULE_AUTHORITY", "FORBID_LLM_MEMORY_COEFFICIENT"],
            parameterIds: extra?.parameterIds ?? [],
          })
        : readiness === "SATISFIED_BY_EXISTING_RULE"
          ? formulaFingerprint({
              ruleId,
              operations: ["REUSE_EXISTING_GOVERNED_RULE", "NO_C5_REIMPLEMENTATION"],
              parameterIds: extra?.parameterIds ?? [],
            })
          : formulaFingerprint({
              ruleId,
              operations: ["NOT_REQUIRED_FOR_BOUNDED_C5_SCOPE"],
              parameterIds: [],
            }),
    implementable: false,
    provenance,
  };
}

const SHEAR_WITHOUT = architectureBlocked(
  "EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT",
  "SHEAR",
  "BLOCKED_RULE_AUTHORITY",
  "EU_CONCRETE_SHEAR_PROFILE methodId EU_RC_SHEAR_EN1992; NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED=false; D1E-0 no code shear equations",
  "D1E-0 and EU shear profile record a framework only. No independently governed shear-resistance coefficient or formula is bound in-repository. C1B inventory sourceReference remains NO_GOVERNED_COEFFICIENT_SOURCE_IN_REPOSITORY for code coefficients.",
);

const SHEAR_GEOMETRY = architectureBlocked(
  "EU_C5_SHEAR_EFFECTIVE_GEOMETRY",
  "SHEAR",
  "BLOCKED_RULE_AUTHORITY",
  "D1E-0 shear/punching geometry: no assumed effective depth from generic RC section; D1E-1 section geometry is not a shear-rule derivation",
  "Governed shear rules must define how effective depth/width are obtained. Generic D1E-1 section dimensions are not silently promoted to shear geometry.",
  { parameterIds: ["effectiveDepth", "effectiveWidth"], units: "mm when later bound; currently unbound", nationalAnnexDependency: "UNRESOLVED", ndpDependency: "UNRESOLVED" },
);

const GAMMA_C = architectureBlocked(
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "SHEAR",
  "SATISFIED_BY_EXISTING_RULE",
  "EOS-D1E-EU-C1C-RESUME-1 declared-NDP gamma_c resolver; EU_CONCRETE_SHEAR_PROFILE.ndpDependencies includes gamma_c",
  "C5 reuses the existing governed gamma_c identity. No C5 reimplementation. Not a shear-resistance equation.",
  {
    parameterIds: ["gamma_c"],
    units: "dimensionless",
    nationalAnnexDependency: true,
    ndpDependency: true,
    independentCorroboration: [
      "packages/engineering-os/src/structural-concrete/eu-c1c-r1",
      "packages/engineering-os/src/structural-concrete/eu-standard/profiles.ts EU_CONCRETE_SHEAR_PROFILE",
    ],
  },
);

const CONCRETE_DESIGN = architectureBlocked(
  "EU_C1_CONCRETE_DESIGN_PROPERTIES",
  "SHEAR",
  "SATISFIED_BY_EXISTING_RULE",
  "EOS-D1E-EU-C1C-RESUME-1 fcd identity from declared NDP plus C1 characteristic properties",
  "C5 reuses existing concrete design-property identity as a material input dependency. Not a shear-resistance equation.",
  {
    parameterIds: ["fck", "alpha_cc", "gamma_c", "fcd"],
    units: "stress units explicit at existing rule; not packed here",
    nationalAnnexDependency: true,
    ndpDependency: true,
    independentCorroboration: ["packages/engineering-os/src/structural-concrete/eu-c1c-r1"],
  },
);

const PUNCHING_PERIMETER = architectureBlocked(
  "EU_C5_PUNCHING_CONTROL_PERIMETER",
  "PUNCHING",
  "BLOCKED_RULE_AUTHORITY",
  "D1E-0: punching does not assume critical perimeter, effective depth, column-face definition, or shear-stress rule; EU_CONCRETE_PUNCHING_PROFILE methodId EU_RC_PUNCHING_EN1992 numericalImplemented=false",
  "Punching control perimeters are code-rule geometry. C5 does not invent perimeter offsets from generic slab geometry.",
  { parameterIds: ["controlPerimeter"], units: "mm when later bound; currently unbound" },
);

const PUNCHING_RESISTANCE = architectureBlocked(
  "EU_C5_PUNCHING_CONCRETE_RESISTANCE",
  "PUNCHING",
  "BLOCKED_RULE_AUTHORITY",
  "EU_CONCRETE_PUNCHING_PROFILE NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED=false; D1E-EU-VD-PUNCHING UNRESOLVED",
  "No independently governed punching-resistance equation is bound. Beam-shear rules are not reused as punching.",
);

const PUNCHING_GAMMA_C = architectureBlocked(
  "EU_C1_PARTIAL_FACTOR_GAMMA_C",
  "PUNCHING",
  "SATISFIED_BY_EXISTING_RULE",
  "EU_CONCRETE_PUNCHING_PROFILE.ndpDependencies includes gamma_c; R1 declared-NDP resolver",
  "Punching reuses existing gamma_c identity. Not a punching-resistance equation.",
  {
    parameterIds: ["gamma_c"],
    units: "dimensionless",
    nationalAnnexDependency: true,
    ndpDependency: true,
    independentCorroboration: [
      "packages/engineering-os/src/structural-concrete/eu-c1c-r1",
      "packages/engineering-os/src/structural-concrete/eu-standard/profiles.ts EU_CONCRETE_PUNCHING_PROFILE",
    ],
  },
);

const TORSION_RESISTANCE = architectureBlocked(
  "EU_C5_TORSION_RESISTANCE",
  "TORSION",
  "BLOCKED_RULE_AUTHORITY",
  "CONCRETE_TORSION_FRAMEWORK=true; NUMERICAL_CONCRETE_TORSION_IMPLEMENTED=false; NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED=false; closeout EU torsion cell none",
  "Global torsion framework exists without an EU numerical method. Shear formulas are not reused as torsion.",
);

const TORSION_DEMAND = architectureBlocked(
  "EU_C5_TORSION_DEMAND",
  "TORSION",
  "BLOCKED_RULE_AUTHORITY",
  "packages/engineering-os/src/structural-demand/engine.ts torsion status NOT_IMPLEMENTED; TORSION_DEMAND_SCOPE NOT_IMPLEMENTED",
  "D1C does not produce a torsional action. C5 does not create a parallel structural-analysis engine.",
  {
    parameterIds: ["torsionDemand"],
    units: "N.m when later bound; currently unavailable",
    independentCorroboration: [
      "packages/types/src/structural-demand.ts StructuralDemandResult.torsion",
      "packages/engineering-os/src/structural-demand/eos-d1c.test.ts",
    ],
  },
);

const OPTIONAL: readonly EuC5EvidenceRuleRecord[] = [
  architectureBlocked(
    "EU_C5_SHEAR_RESISTANCE_WITH_TRANSVERSE_REINFORCEMENT",
    "SHEAR",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "CONCRETE_TRANSVERSE_REINFORCEMENT_MODEL=true; no code shear-reinforcement equation",
    "Bounded C5 v1 is members without design shear reinforcement. Transverse-reinforcement contribution remains classified and unbound.",
  ),
  architectureBlocked(
    "EU_C5_SHEAR_STRUT_OR_COMPRESSION_LIMIT",
    "SHEAR",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-0 no code shear equations; no in-repo strut-limit identity",
    "Do not assume a compression-strut limit is universal across EN 1992 generations. Out of bounded v1 until a governed resistance rule exists.",
  ),
  architectureBlocked(
    "EU_C5_SHEAR_AXIAL_DEPENDENCY",
    "SHEAR",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "EU_CONCRETE_SHEAR_PROFILE does not bind an axial-force shear modifier",
    "Axial-force dependency is not fabricated. Out of bounded v1.",
  ),
  architectureBlocked(
    "EU_C5_PUNCHING_REINFORCEMENT_CONTRIBUTION",
    "PUNCHING",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-0 punching framework without reinforcement punching equation",
    "Bounded v1 is concrete-only interior punching if a perimeter rule is later bound.",
  ),
  architectureBlocked(
    "EU_C5_PUNCHING_MAXIMUM_RESISTANCE",
    "PUNCHING",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "No governed maximum punching-resistance identity in-repository",
    "Out of bounded v1. Not guessed from beam-shear compression limits.",
  ),
  architectureBlocked(
    "EU_C5_PUNCHING_OPENING_EFFECTS",
    "PUNCHING",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-0 does not define opening corrections",
    "Opening effects remain out of bounded v1 pending governed authority.",
  ),
  architectureBlocked(
    "EU_C5_PUNCHING_EDGE_CORNER",
    "PUNCHING",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-0 does not define edge/corner punching geometry",
    "Edge and corner support remain out of bounded v1.",
  ),
  architectureBlocked(
    "EU_C5_PUNCHING_ECCENTRICITY",
    "PUNCHING",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-0 does not define moment-transfer/eccentricity punching corrections",
    "Eccentricity/moment transfer remain out of bounded v1.",
  ),
  architectureBlocked(
    "EU_C5_TORSION_THRESHOLD",
    "TORSION",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "No governed torsion ignore/threshold identity in-repository",
    "Do not assume a torsion-may-be-ignored criterion without authority.",
  ),
  architectureBlocked(
    "EU_C5_TORSION_REINFORCEMENT",
    "TORSION",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "CONCRETE_TRANSVERSE_REINFORCEMENT_MODEL is not a torsion-reinforcement equation",
    "Torsional reinforcement remains out of bounded v1.",
  ),
  architectureBlocked(
    "EU_C5_TORSION_THIN_WALL_GEOMETRY",
    "TORSION",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "D1E-1 section geometry is not an equivalent thin-wall torsion model",
    "Do not invent teff/Ak or any equivalent thin-wall construction without a governed model.",
  ),
  architectureBlocked(
    "EU_C5_TORSION_SHEAR_INTERACTION",
    "TORSION",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "No governed V+T interaction identity in-repository",
    "Ungoverned combined shear-torsion interaction is forbidden.",
  ),
  architectureBlocked(
    "EU_C5_TORSION_FLEXURE_INTERACTION",
    "TORSION",
    "NOT_REQUIRED_FOR_BOUNDED_SCOPE",
    "C2/C3/C4 resistance methods are not torsion interaction equations",
    "Ungoverned M+T or N+M+V+T interaction is forbidden. C2/C3/C4 results are not mutated.",
  ),
];

export const EU_C5_EVIDENCE_RULE_RECORDS: readonly EuC5EvidenceRuleRecord[] = [
  SHEAR_WITHOUT,
  SHEAR_GEOMETRY,
  GAMMA_C,
  CONCRETE_DESIGN,
  PUNCHING_PERIMETER,
  PUNCHING_RESISTANCE,
  PUNCHING_GAMMA_C,
  TORSION_RESISTANCE,
  TORSION_DEMAND,
  ...OPTIONAL,
];

export function assertEuC5EvidenceLoaded(): void {
  const ids = EU_C5_EVIDENCE_RULE_RECORDS.map((row) => `${row.family}:${row.ruleId}`);
  if (new Set(ids).size !== ids.length) {
    throw new Error("EU C5 evidence records must be unique per family and rule");
  }
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
    if (row.implementable) throw new Error(`EU C5 must not mark ${row.ruleId} implementable without governed formula source`);
    if (!row.source || !row.publisher || !row.sourceType) throw new Error(`EU C5 ${row.ruleId} missing source identity`);
    if (row.readiness === "IMPLEMENTATION_READY") {
      throw new Error(`EU C5 ${row.ruleId} must not be IMPLEMENTATION_READY without a governed coefficient source`);
    }
  }
}

export function assertEuC5NoGuessedValues(): void {
  for (const row of EU_C5_EVIDENCE_RULE_RECORDS) {
    if (row.packConstantValue != null) throw new Error(`EU C5 guessed pack constant on ${row.ruleId}`);
  }
}
