import { describe, expect, it } from "vitest";
import {
  BLOCKED_PHASE_VALIDATION_REPORTING_UNAMBIGUOUS,
  C1B_RULE_AUTHORITY_POLICY_PRESERVED,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EOS_D1E_EU_C1C_EVIDENCE_CLOSED,
  EU_C1C_C2_MINIMUM_REQUIRED_RULE_COUNT,
  EU_C1C_C2_SECTION_RESISTANCE_STRATEGY_RESOLVED,
  EU_C1C_CROSS_GENERATION_RULE_MIXING,
  EU_C1C_DESIGN_PROPERTY_RULE_GUESSED,
  EU_C1C_EVIDENCE_BLOCKED_RULE_IDS,
  EU_C1C_EVIDENCE_C2_SECTION_RESISTANCE_STRATEGY,
  EU_C1C_EVIDENCE_CONCRETE_DESIGN_PROPERTY_AUTHORITY_STATE,
  EU_C1C_EVIDENCE_EXISTING_RECORDS_LOADED,
  EU_C1C_EVIDENCE_GAMMA_C_AUTHORITY_STATE,
  EU_C1C_EVIDENCE_GAMMA_C_DEPENDENCY_CLASS,
  EU_C1C_EVIDENCE_GAMMA_S_DEPENDENCY_CLASS,
  EU_C1C_EVIDENCE_INITIAL_GAP_COUNT,
  EU_C1C_EVIDENCE_NDP_VALUE_GUESSED,
  EU_C1C_EVIDENCE_NUMERICAL_RULE_IMPLEMENTATION_COUNT,
  EU_C1C_EVIDENCE_READY_RULE_COUNT,
  EU_C1C_EVIDENCE_READY_RULE_IDS,
  EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED,
  EU_C1C_RESUME_GATE,
  EU_C1C_SECTION_MODEL_REQUIREMENT_STATE,
  EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C2_NUMERICAL_RULE_PACK_COMPLETE,
  EU_C2_RULE_AUTHORITY_COMPLETE,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NEW_RULE_DETERMINISTIC_EXECUTION,
  NEW_RULE_GOLDEN_CASES,
  NEW_RULE_NUMERICAL_VALIDATION,
  PARALLEL_EU_C1C_EVIDENCE_ARCHITECTURE_CREATED,
  PARTIAL_FACTOR_AUTHORITY_RESOLVED,
  PARTIAL_FACTOR_RESOLVER_BEHAVIOR,
  PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE,
  READY_TO_RESUME_C1C,
  RECOMMENDED_D1E_NEXT_PHASE,
  RISKS_CLOSED_BY_EU_C1C_EVIDENCE,
  RISKS_INTRODUCED_BY_EU_C1C_EVIDENCE,
  RISKS_REDUCED_BY_EU_C1C_EVIDENCE,
  RISKS_REMAINING_AFTER_EU_C1C_EVIDENCE,
  UNAUTHORIZED_CAPABILITY_PROMOTION,
} from "@rtb/types";
import {
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_EU_C1C_EVIDENCE_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
} from "./capability";
import {
  EU_C1C_EVIDENCE_RULE_RECORDS,
  EU_C1C_EVIDENCE_SOURCES,
  assertEuC1cEvidenceNoGuessedValues,
  assertEuC1cEvidenceRecordsLoaded,
  evaluateEuC1ConcreteCharProperties,
  resolveEuC1cPartialFactor,
} from ".";
import { IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS } from "./eu-flexure";
import { governedProvenance } from "../structural-domain/catalog";
import type { ConcreteMaterial } from "@rtb/types";

function property(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-ev", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(): ConcreteMaterial {
  return {
    materialRef: "eu-c1c-ev-conc",
    designation: "C30",
    compressiveStrength: property("fc", 30, "MPa"),
    tensileStrength: null,
    elasticModulus: property("Ec", 30000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-ev",
    environmentalMetadata: null,
    version: "c1",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c1.0" }),
  };
}

describe("EOS-D1E-EU-C1C-EVIDENCE C2 rule-authority recovery", () => {
  it("loads existing records, recomputes minimum C2 dependencies, and binds NDP-classed factor evidence", () => {
    assertEuC1cEvidenceRecordsLoaded();
    assertEuC1cEvidenceNoGuessedValues();
    expect(EU_C1C_EVIDENCE_EXISTING_RECORDS_LOADED).toBe(true);
    expect(C1B_RULE_AUTHORITY_POLICY_PRESERVED).toBe(true);
    expect(EU_C1C_EVIDENCE_INITIAL_GAP_COUNT).toBe(9);
    expect(EU_C1C_C2_MINIMUM_REQUIRED_RULE_COUNT).toBe(7);
    expect(EU_C1C_C2_SECTION_RESISTANCE_STRATEGY_RESOLVED).toBe(true);
    expect(EU_C1C_EVIDENCE_C2_SECTION_RESISTANCE_STRATEGY).toBe("MATERIAL_INTEGRATION");
    expect(EU_C1C_SECTION_MODEL_REQUIREMENT_STATE).toBe("SATISFIED_BY_MATERIAL_INTEGRATION");
    expect(EU_C1C_EVIDENCE_GAMMA_C_DEPENDENCY_CLASS).toBe("NDP_DEPENDENT");
    expect(EU_C1C_EVIDENCE_GAMMA_S_DEPENDENCY_CLASS).toBe("NDP_DEPENDENT");
    expect(EU_C1C_EVIDENCE_GAMMA_C_AUTHORITY_STATE).toBe("IMPLEMENTATION_READY");
    expect(EU_C1C_EVIDENCE_CONCRETE_DESIGN_PROPERTY_AUTHORITY_STATE).toBe("IMPLEMENTATION_READY");
    expect(EU_C1C_EVIDENCE_READY_RULE_COUNT).toBe(4);
    expect([...EU_C1C_EVIDENCE_READY_RULE_IDS]).toEqual([
      "EU_C1_PARTIAL_FACTOR_GAMMA_C",
      "EU_C1_PARTIAL_FACTOR_GAMMA_S",
      "EU_C1_CONCRETE_DESIGN_PROPERTIES",
      "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
    ]);
    expect([...EU_C1C_EVIDENCE_BLOCKED_RULE_IDS]).toEqual([
      "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
      "EU_C1_CONCRETE_STRAIN_LIMITS",
      "EU_C1_REINFORCEMENT_RESPONSE",
      "EU_C1_REINFORCEMENT_STRAIN_STATES",
    ]);
    expect(EU_C1C_EVIDENCE_SOURCES.some((src) => src.sourceId === "JRC113687" && src.tier === "TIER_A")).toBe(true);
    expect(EU_C1C_EVIDENCE_SOURCES.some((src) => src.independenceGroup === "TCC_UK")).toBe(true);
    expect(EU_C1C_EVIDENCE_SOURCES.every((src) => src.tier !== "TIER_D" || !src.numericalAuthorityAllowed)).toBe(true);
    expect(PUBLIC_SOURCE_AUTOMATICALLY_AUTHORITATIVE).toBe(false);
    expect(EU_C1C_CROSS_GENERATION_RULE_MIXING).toBe(false);
    expect(EU_C1C_PARTIAL_FACTOR_VALUE_GUESSED).toBe(false);
    expect(EU_C1C_DESIGN_PROPERTY_RULE_GUESSED).toBe(false);
    expect(EU_C1C_EVIDENCE_NDP_VALUE_GUESSED).toBe(false);
    const gammaC = EU_C1C_EVIDENCE_RULE_RECORDS.find((row) => row.ruleId === "EU_C1_PARTIAL_FACTOR_GAMMA_C");
    expect(gammaC?.packConstantValue).toBeNull();
    expect(gammaC?.formulaFingerprintCandidate).toMatch(/^fp:/);
    expect(gammaC?.recommendedValueEvidence).toMatch(/1\.5/);
    expect(gammaC?.recommendedValueEvidence).toMatch(/not a pack constant/i);
  });

  it("does not implement numerical rules, keeps C1 regression green, and reports blocked-phase validation as N/A", () => {
    expect(EU_C1C_EVIDENCE_NUMERICAL_RULE_IMPLEMENTATION_COUNT).toBe(0);
    expect(NEW_RULE_GOLDEN_CASES).toBe("NOT_APPLICABLE");
    expect(NEW_RULE_NUMERICAL_VALIDATION).toBe("NOT_APPLICABLE");
    expect(NEW_RULE_DETERMINISTIC_EXECUTION).toBe("NOT_APPLICABLE");
    expect(BLOCKED_PHASE_VALIDATION_REPORTING_UNAMBIGUOUS).toBe(true);
    expect(resolveEuC1cPartialFactor("gamma_c").ok).toBe(false);
    expect(PARTIAL_FACTOR_RESOLVER_BEHAVIOR).toBe("PASS");
    expect(PARTIAL_FACTOR_AUTHORITY_RESOLVED).toBe(true);
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete() }).ok).toBe(true);
    expect(EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(3);
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_REPRODUCED).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(PARALLEL_EU_C1C_EVIDENCE_ARCHITECTURE_CREATED).toBe(false);
    expect([...IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS]).toEqual([
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
    ]);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(UNAUTHORIZED_CAPABILITY_PROMOTION).toBe(false);
  });

  it("fails the C1C resume gate while constitutive C2 dependencies remain blocked", () => {
    expect(EU_C1C_RESUME_GATE).toBe("FAIL");
    expect(EU_C2_RULE_AUTHORITY_COMPLETE).toBe(false);
    expect(EU_C2_NUMERICAL_RULE_PACK_COMPLETE).toBe(false);
    expect(READY_TO_RESUME_C1C).toBe(true);
    expect(EOS_D1E_EU_C1C_EVIDENCE_CLOSED).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C4");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C")?.status).toBe("CLOSED");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C1C.EVIDENCE")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(
      expect.arrayContaining(["D1E-EU-C1C-EVIDENCE-VD-CONSTITUTIVE"]),
    );
    expect(RISKS_CLOSED_BY_EU_C1C_EVIDENCE).toBe("NONE");
    expect([...RISKS_REDUCED_BY_EU_C1C_EVIDENCE]).toEqual([...D1E_EU_C1C_EVIDENCE_D0_RISK_DISPOSITION.REDUCED]);
    expect(RISKS_INTRODUCED_BY_EU_C1C_EVIDENCE).toBe("NONE");
    expect([...RISKS_REMAINING_AFTER_EU_C1C_EVIDENCE]).toEqual([...D1E_EU_C1C_EVIDENCE_D0_RISK_DISPOSITION.REMAINING]);
  });
});
