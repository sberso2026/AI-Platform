import type { EuC1aAuthorityMatrixRow, EuC1aEvidenceRecord, EuC1aResumeBlocker, EuC1aRuleReadiness } from "@rtb/types";
import {
  EU_C1A_IMPLEMENTABLE_C1_RULE_COUNT,
  EU_C1A_STANDARD_PROFILE_EXACTLY_RESOLVED,
  UNRESOLVED_EVIDENCE_CONFLICT_FAILS_CLOSED,
} from "@rtb/types";
import { EU_C1A_PLANNED_RULE_IDS } from "./inventory";

const UNBOUND_BASIS = "UNBOUND_PENDING_CONFIRMED_EN1992_EDITION" as const;
const READINESS: EuC1aRuleReadiness = "BLOCKED_STANDARD_PROFILE";

function evidence(
  plannedRuleId: string,
  category: string,
  parameterId: string | null,
  frameworkSlotNote: string,
  readiness: EuC1aRuleReadiness = READINESS,
): EuC1aEvidenceRecord {
  return {
    evidenceId: `EV-${plannedRuleId}${parameterId ? `-${parameterId}` : ""}`,
    plannedRuleId,
    parameterId,
    category,
    standardFamily: "EN 1992",
    standardGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
    standardPart: "EN_1992_1_1",
    amendmentApplicability: "UNKNOWN_PENDING_CONFIRMATION",
    corrigendumApplicability: "UNKNOWN_PENDING_CONFIRMATION",
    dependencyClass: "UNRESOLVED",
    frameworkSlotNote,
    authorityType: "UNBOUND_PENDING_HUMAN_CONFIRMATION",
    technicalBasisRef: UNBOUND_BASIS,
    parameterValue: null,
    units: null,
    applicabilityBounds: "UNBOUND_PENDING_CONFIRMED_PROFILE",
    humanConfirmationState: "REQUIRED",
    validationState: "EVIDENCE_UNBOUND",
    version: "c1a.0",
    provenance: "EOS-D1E-EU-C1A search of in-repo governed evidence; no edition-confirmed numerical value found",
    readiness,
    readyForImplementation: false,
  };
}

export const EU_C1A_RULE_EVIDENCE_RECORDS: readonly EuC1aEvidenceRecord[] = [
  evidence("EU_C1_CONCRETE_CHAR_PROPERTIES", "CONCRETE_CHARACTERISTIC_PROPERTIES", null, "EU material catalogue adapter ready and unpopulated"),
  evidence("EU_C1_CONCRETE_DESIGN_PROPERTIES", "CONCRETE_DESIGN_PROPERTIES", null, "materialDesignValues adapter slot unpopulated"),
  evidence("EU_C1_REINFORCEMENT_CHAR_PROPERTIES", "REINFORCEMENT_CHARACTERISTIC_PROPERTIES", null, "EU reinforcement catalogue adapter ready and unpopulated"),
  evidence("EU_C1_REINFORCEMENT_DESIGN_PROPERTIES", "REINFORCEMENT_DESIGN_PROPERTIES", null, "no governed reinforcement design-property derivation"),
  evidence("EU_C1_PARTIAL_FACTOR_GAMMA_C", "PARTIAL_FACTORS", "gamma_c", "EU-1 adapter slot gamma_c unpopulated; ndpCapable is framework-intended not edition-confirmed", "BLOCKED_HUMAN_CONFIRMATION"),
  evidence("EU_C1_PARTIAL_FACTOR_GAMMA_S", "PARTIAL_FACTORS", "gamma_s", "EU-1 adapter slot gamma_s unpopulated; ndpCapable is framework-intended not edition-confirmed", "BLOCKED_HUMAN_CONFIRMATION"),
  evidence("EU_C1_CONCRETE_COMPRESSION_RESPONSE", "CONCRETE_COMPRESSION_RESPONSE", null, "concreteCompressionResponse adapter slot unpopulated"),
  evidence("EU_C1_CONCRETE_TENSION_TREATMENT", "CONCRETE_COMPRESSION_RESPONSE", null, "tension treatment explicit-null; no governed strength-design tension model"),
  evidence("EU_C1_CONCRETE_STRAIN_LIMITS", "CONCRETE_STRAIN_LIMITS", "ecu", "framework slot id ecu is not a confirmed edition-specific strain-parameter set", "BLOCKED_HUMAN_CONFIRMATION"),
  evidence("EU_C1_REINFORCEMENT_RESPONSE", "REINFORCEMENT_RESPONSE", null, "reinforcementResponse adapter slot unpopulated"),
  evidence("EU_C1_REINFORCEMENT_STRAIN_STATES", "REINFORCEMENT_STRAIN_STATES", "esu", "framework slot esu unpopulated; edition-specific limit unidentified"),
  evidence("EU_C1_STRESS_BLOCK_OR_SECTION_MODEL", "STRESS_BLOCK_OR_SECTION_MODEL", "eta_lambda", "framework slots eta/lambda unpopulated; not confirmed applicable to every generation/material range", "BLOCKED_HUMAN_CONFIRMATION"),
];

export const EU_C1A_RULE_AUTHORITY_MATRIX_ROWS: readonly EuC1aAuthorityMatrixRow[] = EU_C1A_PLANNED_RULE_IDS.map((ruleId) => {
  const row = EU_C1A_RULE_EVIDENCE_RECORDS.find((item) => item.plannedRuleId === ruleId);
  return {
    ruleId,
    authority: "UNBOUND_PENDING_HUMAN_CONFIRMATION",
    profile: "EN 1992 / EN_1992_1_1 / UNKNOWN_PENDING_CONFIRMATION",
    part: "EN_1992_1_1",
    annexNdpDependency: "UNRESOLVED",
    evidenceState: "UNBOUND",
    readyForImplementation: false,
    readiness: row?.readiness ?? READINESS,
  };
});

export const EU_C1A_PRESENT_BLOCKERS: readonly EuC1aResumeBlocker[] = [
  "MISSING_STANDARD_GENERATION",
  "MISSING_STANDARD_EDITION",
  "MISSING_AMENDMENT_STATE",
  "MISSING_RULE_AUTHORITY",
  "MISSING_PARTIAL_FACTOR_AUTHORITY",
  "MISSING_STRAIN_RULE_AUTHORITY",
  "MISSING_SECTION_MODEL_AUTHORITY",
  "HUMAN_CONFIRMATION_REQUIRED",
];

export function assertEuC1aEvidenceConflictsFailClosed(records: readonly EuC1aEvidenceRecord[] = EU_C1A_RULE_EVIDENCE_RECORDS): void {
  if (!UNRESOLVED_EVIDENCE_CONFLICT_FAILS_CLOSED) throw new Error("unresolved evidence conflicts must fail closed");
  const seen = new Set<string>();
  for (const row of records) {
    const key = `${row.plannedRuleId}:${row.parameterId ?? ""}:${row.standardGeneration}:${row.standardEdition}`;
    if (seen.has(key)) throw new Error(`EVIDENCE_CONFLICT: duplicate evidence ${key}`);
    seen.add(key);
    if (row.parameterValue != null) throw new Error("EVIDENCE_CONFLICT: C1A must not populate guessed parameter values");
    if (row.standardEdition !== "UNKNOWN_PENDING_CONFIRMATION") {
      throw new Error("EVIDENCE_CONFLICT: C1A must not silently bind an unconfirmed edition");
    }
  }
}

export function assertEuC1ResumeGate(): "FAIL" {
  assertEuC1aEvidenceConflictsFailClosed();
  if (EU_C1A_STANDARD_PROFILE_EXACTLY_RESOLVED) throw new Error("profile must not be marked resolved without human-confirmed edition evidence");
  if (EU_C1A_IMPLEMENTABLE_C1_RULE_COUNT !== 0) throw new Error("implementable C1 rule count must remain zero until profile evidence exists");
  if (EU_C1A_RULE_AUTHORITY_MATRIX_ROWS.some((row) => row.readyForImplementation)) {
    throw new Error("no C1A rule may be READY_FOR_IMPLEMENTATION without confirmed profile and authority");
  }
  return "FAIL";
}
