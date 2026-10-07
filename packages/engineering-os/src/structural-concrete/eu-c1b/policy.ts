import {
  AUTHORITATIVE_STANDARD_DERIVED_REQUIRED_FOR_INITIAL_IMPLEMENTATION,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  EU_C1B_ALLOWED_AUTHORITY_TYPES,
  EU_C1B_FORBIDDEN_AUTHORITY_TYPES,
  EU_C1B_IMPLEMENTABLE_NUMERICAL_RULE_COUNT,
  EU_C1B_PARTIAL_FACTOR_GUESSED,
  EU_C1B_SECTION_MODEL_PARAMETER_GUESSED,
  EU_C1B_SOURCE_CONFLICT_FAILS_CLOSED,
  EU_C1B_STRAIN_PARAMETER_GUESSED,
  EU_C1_ACCEPTANCE_POLICY_CORRECTED,
  EU_C1A_STANDARD_FAMILY_CONFIRMED,
  EU_C1A_STANDARD_PART_CONFIRMED,
  EU_C1_RESUME_GATE,
  FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
} from "@rtb/types";
import { EU_C1B_PARAMETER_PROVENANCE, EU_C1B_RULE_EVIDENCE_RECORDS, assertEuC1bInventoryComplete } from "./inventory";

export function assertEuC1bCopyrightBoundary(): void {
  if (LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION) {
    throw new Error("licensed standard document must not be an implementation gate");
  }
  if (STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME || STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY) {
    throw new Error("standard document must not be required at runtime or in-repository");
  }
  if (FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION || COPYRIGHTED_STANDARD_TEXT_REPRODUCED) {
    throw new Error("copyrighted standard text must not be required or reproduced");
  }
}

export function assertEuC1bNoGuessedParameters(): void {
  if (EU_C1B_PARTIAL_FACTOR_GUESSED || EU_C1B_STRAIN_PARAMETER_GUESSED || EU_C1B_SECTION_MODEL_PARAMETER_GUESSED) {
    throw new Error("C1B must not guess partial-factor, strain, or section-model parameters");
  }
  for (const row of EU_C1B_PARAMETER_PROVENANCE) {
    if (row.valueMode === "UNBOUND_PENDING_GOVERNED_SOURCE" && row.value != null) {
      throw new Error(`C1B guessed unbound parameter ${row.parameterId}`);
    }
    if (row.parameterId === "gamma_c" || row.parameterId === "gamma_s") {
      if (row.value != null) throw new Error("partial factors must remain unbound until a governed source exists");
    }
  }
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
}

export function assertEuC1bSourceConflictsFailClosed(): void {
  if (!EU_C1B_SOURCE_CONFLICT_FAILS_CLOSED) throw new Error("source conflicts must fail closed");
  const seen = new Set<string>();
  for (const row of EU_C1B_RULE_EVIDENCE_RECORDS) {
    if (seen.has(row.ruleId)) throw new Error(`RULE_EVIDENCE_CONFLICT: duplicate ${row.ruleId}`);
    seen.add(row.ruleId);
    if (row.implementable && EU_C1B_FORBIDDEN_AUTHORITY_TYPES.includes(row.authorityType as never)) {
      throw new Error(`RULE_EVIDENCE_CONFLICT: forbidden authority on ${row.ruleId}`);
    }
  }
}

export function assertEuC1ResumeGate(): "PASS" {
  assertEuC1bCopyrightBoundary();
  assertEuC1bNoGuessedParameters();
  assertEuC1bSourceConflictsFailClosed();
  assertEuC1bInventoryComplete();
  if (!EU_C1_ACCEPTANCE_POLICY_CORRECTED) throw new Error("C1 acceptance policy must be corrected");
  if (!EU_C1A_STANDARD_FAMILY_CONFIRMED || !EU_C1A_STANDARD_PART_CONFIRMED) {
    throw new Error("C1 resume requires intended family/part identification");
  }
  if (EU_C1B_IMPLEMENTABLE_NUMERICAL_RULE_COUNT <= 0) {
    throw new Error("C1 resume requires a non-zero implementable numerical rule subset");
  }
  if (AUTHORITATIVE_STANDARD_DERIVED_REQUIRED_FOR_INITIAL_IMPLEMENTATION) {
    throw new Error("initial implementation must not require AUTHORITATIVE_STANDARD_DERIVED");
  }
  const ready = EU_C1B_RULE_EVIDENCE_RECORDS.filter((row) => row.implementable);
  for (const row of ready) {
    if (!row.sourceReference || !row.provenance || !row.units || !row.applicability || !row.independentValidationPlan) {
      throw new Error(`implementation-ready rule ${row.ruleId} missing source/provenance/units/applicability/validation plan`);
    }
    if (!row.formulaFingerprint) throw new Error(`implementation-ready rule ${row.ruleId} missing formula fingerprint`);
    if (row.corroboratingEvidenceRefs.length < 1) throw new Error(`implementation-ready rule ${row.ruleId} missing corroboration`);
    if (row.authorityType === "UNBOUND") throw new Error(`implementation-ready rule ${row.ruleId} has unbound authority`);
    if (!(EU_C1B_ALLOWED_AUTHORITY_TYPES as readonly string[]).includes(row.authorityType)) {
      throw new Error(`implementation-ready rule ${row.ruleId} has disallowed authority`);
    }
  }
  if (EU_C1_RESUME_GATE !== "PASS") throw new Error("live C1 resume gate must be PASS after C1B policy correction");
  return "PASS";
}
