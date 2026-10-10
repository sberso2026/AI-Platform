import { describe, expect, it } from "vitest";
import {
  AI_EU_C5_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_C5_CHECK_OVERRIDE_AUTHORITY,
  AI_EU_C5_CONFORMANCE_AUTHORITY,
  AI_EU_C5_ENGINEERING_APPROVAL,
  AI_EU_C5_NDP_AUTHORITY,
  AI_EU_C5_RULE_PARAMETER_AUTHORITY,
  AI_EU_C5_SOURCE_CONFLICT_AUTHORITY,
  CONCRETE_PUNCHING_SHEAR_FRAMEWORK,
  CONCRETE_SHEAR_FRAMEWORK,
  CONCRETE_TORSION_FRAMEWORK,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  D1C_PUNCHING_ACTIONS_REUSED,
  D1C_SHEAR_DEMAND_REUSED,
  D1C_TORSION_DEMAND_REUSED,
  D1E_COMMON_PUNCHING_FRAMEWORK_AVAILABLE,
  D1E_COMMON_PUNCHING_FRAMEWORK_REUSED,
  D1E_COMMON_SHEAR_FRAMEWORK_AVAILABLE,
  D1E_COMMON_SHEAR_FRAMEWORK_REUSED,
  D1E_COMMON_TORSION_FRAMEWORK_AVAILABLE,
  D1E_COMMON_TORSION_FRAMEWORK_REUSED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EOS_D1E_EU_C5_CLOSED,
  EU_C2_METHOD_IDS,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C5_BENCHMARK_COVERAGE,
  EU_C5_BLOCKER,
  EU_C5_CANONICAL_NEXT_PHASE,
  EU_C5_CANONICAL_NEXT_PHASE_SCOPE,
  EU_C5_CHECKS_EQUAL_MEMBER_CONFORMANCE,
  EU_C5_CROSS_GENERATION_RULE_MIXING,
  EU_C5_D1E_FROZEN_ARCHITECTURE_PRESERVED,
  EU_C5_ENGINEER_VALIDATION_STATE,
  EU_C5_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT,
  EU_C5_IMPLEMENTED_PUNCHING_METHOD_IDS,
  EU_C5_IMPLEMENTED_RULE_IDS,
  EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT,
  EU_C5_IMPLEMENTED_SHEAR_METHOD_IDS,
  EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_PUNCHING_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_SHEAR_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_TORSION_METHOD_COUNT,
  EU_C5_PUNCHING_PUBLISHED_STRESS_TOLERANCE_MPA,
  EU_C5_PUNCHING_PERIMETER_TOLERANCE_MM,
  EU_C5_SHEAR_PUBLISHED_BENCHMARK_TOLERANCE_N,
  EU_C5_SHEAR_PUBLISHED_FORCE_TOLERANCE_N,
  EU_C5_VMIN_EXPRESSION_ID,
  EU_C5_INVERSE_DESIGN_RECHECK_READY,
  EU_C5_METHOD_REGISTRY_UPDATED,
  EU_C5_NDP_VALUE_GUESSED,
  EU_C5_NEXT_PHASE_TYPE,
  EU_C5_PUNCHING_BOUNDED_CAPABILITY_COMPLETE,
  EU_C5_PUNCHING_BLOCKED_RULE_IDS,
  EU_C5_PUNCHING_CONTROL_PERIMETER_GOVERNED,
  EU_C5_PUNCHING_GOLDEN_CASES,
  EU_C5_PUNCHING_IMPLEMENTATION_READY_RULE_IDS,
  EU_C5_PUNCHING_REQUIRED_RULE_IDS,
  EU_C5_PUNCHING_RULE_AUTHORITY_COMPLETE,
  EU_C5_READY_FOR_NEXT_PHASE,
  EU_C5_RULE_AUTHORITY_POLICY_REUSED,
  EU_C5_SELF_REFERENTIAL_BENCHMARKS,
  EU_C5_SHEAR_BOUNDED_CAPABILITY_COMPLETE,
  EU_C5_SHEAR_BLOCKED_RULE_IDS,
  EU_C5_SHEAR_GOLDEN_CASES,
  EU_C5_SHEAR_IMPLEMENTATION_READY_RULE_IDS,
  EU_C5_SHEAR_PUNCHING_TORSION_SEMANTICS_SEPARATE,
  EU_C5_SHEAR_REQUIRED_RULE_IDS,
  EU_C5_SHEAR_RULE_AUTHORITY_COMPLETE,
  EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_STATE,
  EU_C5_SHEAR_WITH_REINFORCEMENT_METHOD_STATE,
  EU_C5_TORSION_BOUNDED_CAPABILITY_COMPLETE,
  EU_C5_TORSION_BLOCKED_RULE_IDS,
  EU_C5_TORSION_GOLDEN_CASES,
  EU_C5_TORSION_IMPLEMENTATION_READY_RULE_IDS,
  EU_C5_TORSION_INTERACTION_RULE_STATE,
  EU_C5_TORSION_REQUIRED_RULE_IDS,
  EU_C5_TORSION_RULE_AUTHORITY_COMPLETE,
  EU_C5_UNGOVERNED_COMBINED_ACTION_INTERACTION,
  EU_C5_UNGOVERNED_TORSION_INTERACTION_USED,
  EU_C5_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  EU_C5_VALIDATION_DEBT_REDUCED_ITEMS,
  EU_C5_VERDICT,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  GENERATIVE_MODEL_CAN_BYPASS_EU_C5,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_EU_C5_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NUMERICAL_C5_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED,
  NUMERICAL_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_EU_C5_RULE_ENGINE_CREATED,
  PARALLEL_EU_C5_STANDARD_CONTEXT_CREATED,
  PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  RISKS_CLOSED_BY_EU_C5,
  RISKS_INTRODUCED_BY_EU_C5,
  RISKS_REDUCED_BY_EU_C5,
  RISKS_REMAINING_AFTER_EU_C5,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C5,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
} from "@rtb/types";
import {
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_EU_C5_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
} from "./capability";
import {
  EU_C5_EVIDENCE_RULE_RECORDS,
  assertEuC5AuthorityBoundary,
  assertEuC5FailClosed,
  assertEuC5OptimizerRejectsUndetermined,
  assertEuC5ParetoRejectsUndetermined,
  assertStaleEuC5NotReused,
  EU_C5_METHOD_REGISTRY,
  EU_C5_PARAMETER_PROVENANCE,
  evaluateEuC5Punching,
  evaluateEuC5Shear,
  evaluateEuC5Torsion,
  euC5InvalidationTags,
  type EuC5EvaluateInput,
} from ".";
import { EU_CONCRETE_BIAXIAL_METHODS } from "./eu-flexure";
import type { StructuralDemandResult } from "@rtb/types";

function demand(): Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId" | "shear" | "torsion" | "combinationId"> {
  return {
    resultId: "d1c-c5-1",
    capacityPresent: false,
    memberId: "m-c5",
    combinationId: "uls-1",
    shear: { value: 120000, unit: "N", locationM: 0.25, signed: 120000 },
    torsion: { status: "NOT_IMPLEMENTED" },
  };
}

describe("EOS-D1E-EU-C5 shear / punching / torsion rule-authority audit", () => {
  it("reuses D1E frameworks and C1B policy without inventing numerical methods", () => {
    assertEuC5FailClosed();
    assertEuC5AuthorityBoundary();
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(EU_C5_D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_C5_RULE_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_EU_C5_STANDARD_CONTEXT_CREATED).toBe(false);
    expect(PARALLEL_EU_SHEAR_DEMAND_ENGINE_CREATED).toBe(false);
    expect(CONCRETE_SHEAR_FRAMEWORK).toBe(true);
    expect(CONCRETE_PUNCHING_SHEAR_FRAMEWORK).toBe(true);
    expect(CONCRETE_TORSION_FRAMEWORK).toBe(true);
    expect(D1E_COMMON_SHEAR_FRAMEWORK_AVAILABLE).toBe(true);
    expect(D1E_COMMON_SHEAR_FRAMEWORK_REUSED).toBe(true);
    expect(D1E_COMMON_PUNCHING_FRAMEWORK_AVAILABLE).toBe(true);
    expect(D1E_COMMON_PUNCHING_FRAMEWORK_REUSED).toBe(true);
    expect(D1E_COMMON_TORSION_FRAMEWORK_AVAILABLE).toBe(true);
    expect(D1E_COMMON_TORSION_FRAMEWORK_REUSED).toBe(true);
    expect(EU_C5_RULE_AUTHORITY_POLICY_REUSED).toBe(true);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(EU_C5_CROSS_GENERATION_RULE_MIXING).toBe(false);
    expect(EU_C5_SHEAR_PUNCHING_TORSION_SEMANTICS_SEPARATE).toBe(true);
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_REPRODUCED).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(EU_C5_NDP_VALUE_GUESSED).toBe(false);
  });

  it("classifies the bounded shear and punching rules as ready and leaves torsion blocked", () => {
    expect([...EU_C5_SHEAR_REQUIRED_RULE_IDS]).toEqual([
      "EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT",
      "EU_C5_SHEAR_EFFECTIVE_GEOMETRY",
      "EU_C5_SHEAR_MINIMUM_RESISTANCE",
      "EU_C5_SHEAR_DECLARED_CRDC",
    ]);
    expect([...EU_C5_PUNCHING_REQUIRED_RULE_IDS]).toEqual([
      "EU_C5_PUNCHING_CONTROL_PERIMETER",
      "EU_C5_PUNCHING_CONCRETE_RESISTANCE",
      "EU_C5_PUNCHING_DECLARED_CRDC",
      "EU_C5_PUNCHING_DECLARED_VMIN",
    ]);
    expect([...EU_C5_TORSION_REQUIRED_RULE_IDS]).toEqual(["EU_C5_TORSION_RESISTANCE", "EU_C5_TORSION_DEMAND"]);
    expect([...EU_C5_SHEAR_IMPLEMENTATION_READY_RULE_IDS]).toEqual([...EU_C5_SHEAR_REQUIRED_RULE_IDS]);
    expect([...EU_C5_PUNCHING_IMPLEMENTATION_READY_RULE_IDS]).toEqual([...EU_C5_PUNCHING_REQUIRED_RULE_IDS]);
    expect([...EU_C5_TORSION_IMPLEMENTATION_READY_RULE_IDS]).toEqual([]);
    expect([...EU_C5_SHEAR_BLOCKED_RULE_IDS]).toEqual([]);
    expect([...EU_C5_PUNCHING_BLOCKED_RULE_IDS]).toEqual([]);
    expect([...EU_C5_TORSION_BLOCKED_RULE_IDS]).toEqual(["EU_C5_TORSION_RESISTANCE", "EU_C5_TORSION_DEMAND"]);
    expect(EU_C5_SHEAR_RULE_AUTHORITY_COMPLETE).toBe(true);
    expect(EU_C5_PUNCHING_RULE_AUTHORITY_COMPLETE).toBe(true);
    expect(EU_C5_TORSION_RULE_AUTHORITY_COMPLETE).toBe(false);
    expect(EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_STATE).toBe("IMPLEMENTED");
    expect(EU_C5_SHEAR_WITH_REINFORCEMENT_METHOD_STATE).toBe("OUT_OF_SCOPE");
    expect(EU_C5_PUNCHING_CONTROL_PERIMETER_GOVERNED).toBe("YES");
    expect(EU_C5_TORSION_INTERACTION_RULE_STATE).toBe("OUT_OF_SCOPE");
    expect(EU_C5_UNGOVERNED_TORSION_INTERACTION_USED).toBe(false);
    expect(EU_C5_UNGOVERNED_COMBINED_ACTION_INTERACTION).toBe(false);
    expect(D1C_SHEAR_DEMAND_REUSED).toBe(true);
    expect(D1C_PUNCHING_ACTIONS_REUSED).toBe("NOT_APPLICABLE");
    expect(D1C_TORSION_DEMAND_REUSED).toBe("EXPLICIT_TRANSPORT_ONLY");
    const blocked = EU_C5_EVIDENCE_RULE_RECORDS.filter((row) => row.readiness === "BLOCKED_RULE_AUTHORITY");
    expect(blocked.every((row) => row.implementable === false && row.packConstantValue === null)).toBe(true);
    expect(EU_C5_PARAMETER_PROVENANCE.some((row) => row.value === 0.18 || row.value === 0.035 || row.value === 1.5)).toBe(false);
    expect(EU_C5_EVIDENCE_RULE_RECORDS.every((row) => row.formulaFingerprint?.startsWith("fp:"))).toBe(true);
  });

  it("fails closed on incomplete shear, punching, and torsion input without guessing formulas", () => {
    const shear = evaluateEuC5Shear({ demand: demand(), geometryFingerprint: "g1", reinforcementFingerprint: "r1" });
    expect(shear.ok).toBe(false);
    expect(shear.checkState).toBe("CHECK_UNDETERMINED");
    expect(shear.failReason).toBe("UNSUPPORTED_AXIAL_STATE");
    expect(shear.methodId).toBe(EU_C5_IMPLEMENTED_SHEAR_METHOD_IDS[0]);
    expect(shear.resistance).toBeNull();
    expect(shear.utilization).toBeNull();
    expect(shear.demand.source).toBe("D1C");
    expect(shear.demand.value).toBe(120000);
    expect(shear.demand.unit).toBe("N");
    expect(shear.conformanceState).toBe("INTENDED_PROFILE");
    expect(shear.fingerprint.length).toBeGreaterThan(20);

    const punching = evaluateEuC5Punching({ demand: demand() });
    expect(punching.failReason).toBe("D1C_PUNCHING_ACTION_NOT_AVAILABLE");
    expect(punching.demand.value).toBeNull();
    expect(punching.warnings.some((row) => /beam shear is not punching/i.test(row))).toBe(true);

    const torsion = evaluateEuC5Torsion({ demand: demand() });
    expect(torsion.failReason).toBe("D1C_TORSION_DEMAND_NOT_AVAILABLE");
    expect(torsion.warnings.some((row) => /shear demand is not a torsion/i.test(row))).toBe(true);

    const tags = euC5InvalidationTags(shear.fingerprint, `${shear.fingerprint}-stale`);
    expect(() => assertStaleEuC5NotReused(true, tags)).toThrow(/stale/i);
    expect(() => assertEuC5OptimizerRejectsUndetermined(true)).toThrow(/UNDETERMINED/i);
    expect(() => assertEuC5ParetoRejectsUndetermined(true)).toThrow(/UNDETERMINED/i);
    expect(EU_C5_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT).toBe(0);
    expect(EU_C5_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_C5_SHEAR_GOLDEN_CASES).toBe("PASS");
    expect(EU_C5_PUNCHING_GOLDEN_CASES).toBe("PASS");
    expect(EU_C5_TORSION_GOLDEN_CASES).toBe("NOT_IMPLEMENTED");
    expect(EU_C5_BENCHMARK_COVERAGE).toBe("PASS");
    expect(EU_C5_EXTERNAL_SOFTWARE_COMPARISON).toBe("NOT_AVAILABLE");
  });

  it("does not promote numerical C5 methods, C2/C3/C4, or conformance", () => {
    expect([...EU_C5_IMPLEMENTED_SHEAR_METHOD_IDS]).toEqual(["EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT"]);
    expect([...EU_C5_IMPLEMENTED_PUNCHING_METHOD_IDS]).toEqual(["EU_RC_PUNCHING_EN1992_INTERIOR_RECTANGULAR_CONCRETE"]);
    expect(EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT).toBe(EU_C5_NUMERICALLY_VALIDATED_SHEAR_METHOD_COUNT);
    expect(EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT).toBe(EU_C5_NUMERICALLY_VALIDATED_PUNCHING_METHOD_COUNT);
    expect(EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT).toBe(EU_C5_NUMERICALLY_VALIDATED_TORSION_METHOD_COUNT);
    expect(EU_C5_IMPLEMENTED_METHOD_IDS).toHaveLength(2);
    expect(EU_C5_IMPLEMENTED_RULE_IDS.length).toBeGreaterThan(0);
    expect(NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED).toBe(true);
    expect(NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED).toBe(true);
    expect(NUMERICAL_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect([...EU_C2_METHOD_IDS]).toEqual(["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR"]);
    expect([...EU_C3_METHOD_IDS]).toEqual([
      "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR",
    ]);
    expect([...EU_C4_METHOD_IDS]).toEqual(["EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR"]);
    expect(EU_CONCRETE_BIAXIAL_METHODS).toHaveLength(1);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(NUMERICAL_C5_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_C5_CHECKS_EQUAL_MEMBER_CONFORMANCE).toBe(false);
    expect(EU_C5_METHOD_REGISTRY_UPDATED).toBe("YES");
    expect(EU_C5_METHOD_REGISTRY.map((row) => row.methodId)).toEqual([...EU_C5_IMPLEMENTED_METHOD_IDS]);
    expect(EU_C5_INVERSE_DESIGN_RECHECK_READY).toBe("PARTIAL");
    expect(GENERATIVE_MODEL_CAN_BYPASS_EU_C5).toBe(false);
    expect(LLM_EU_C5_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C5_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_EU_C5_RULE_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_EU_C5_NDP_AUTHORITY).toBe(false);
    expect(AI_EU_C5_SOURCE_CONFLICT_AUTHORITY).toBe(false);
    expect(AI_EU_C5_CHECK_OVERRIDE_AUTHORITY).toBe(false);
    expect(AI_EU_C5_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_EU_C5_ENGINEERING_APPROVAL).toBe(false);
    expect(EU_C5_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C5).toBe(false);
  });

  it("closes C5 with limitations and keeps the next phase inside torsion evidence recovery", () => {
    expect(EU_C5_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(EOS_D1E_EU_C5_CLOSED).toBe(true);
    expect(EU_C5_READY_FOR_NEXT_PHASE).toBe(false);
    expect(EU_C5_BLOCKER).toMatch(/TORSION_BLOCKED_RULE_AUTHORITY/);
    expect(EU_C5_SHEAR_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
    expect(EU_C5_PUNCHING_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
    expect(EU_C5_TORSION_BOUNDED_CAPABILITY_COMPLETE).toBe(false);
    expect(EU_C5_NEXT_PHASE_TYPE).toBe("HUMAN_PROFILE_INPUT_REQUIRED");
    expect(EU_C5_CANONICAL_NEXT_PHASE).toBe("EOS-D1E-EU-C5-EVIDENCE");
    expect(EU_C5_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/torsion/i);
    expect(EU_C5_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/shear/i);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C5-EVIDENCE");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/shear|punching|torsion/i);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C5")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C5-EVIDENCE")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C5-T1")?.status).toBe("CLOSED");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C5.RULE_EVIDENCE")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C5.SHEAR")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C5.PUNCHING")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-SHEAR")?.blockingState).toBe("PARTIAL");
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-TORSION")?.blockingState).toBe("UNRESOLVED");
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-C5-VD-EVIDENCE")?.blockingState).toBe("PARTIAL");
    expect([...EU_C5_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual(["D1E-EU-VD-SHEAR", "D1E-EU-VD-PUNCHING", "D1E-EU-C5-VD-EVIDENCE"]);
    expect(RISKS_CLOSED_BY_EU_C5).toBe("NONE");
    expect(RISKS_REDUCED_BY_EU_C5).toBe("NONE");
    expect(RISKS_INTRODUCED_BY_EU_C5).toBe("NONE");
    expect([...D1E_EU_C5_D0_RISK_DISPOSITION.REMAINING]).toEqual([...RISKS_REMAINING_AFTER_EU_C5]);
    expect(D1E_EU_C5_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
  });
});

function ndp(value: number, unit: string): EuC5EvaluateInput["cRdC"] {
  return { value, unit, sourceRef: "declared-test-ndp" };
}

function shearInput(patch: Partial<EuC5EvaluateInput> = {}): EuC5EvaluateInput {
  return {
    demand: demand(),
    generation: "FIRST_GENERATION",
    axialForceN: 0,
    designShearReinforcement: "NONE",
    effectiveDepth: ndp(372, "mm"),
    webWidth: ndp(250, "mm"),
    longitudinalTensionArea: ndp(0.0061 * 250 * 372, "mm2"),
    fck: ndp(25, "MPa"),
    cRdC: ndp(0.12, "dimensionless"),
    vMinCoefficient: ndp(0.035, "dimensionless"),
    vMinExpressionId: EU_C5_VMIN_EXPRESSION_ID,
    ...patch,
  };
}

function independentShearN(d: number, bw: number, asl: number, fck: number, cRdC: number, vMin: number): number {
  const k = Math.min(2, 1 + Math.sqrt(200 / d));
  const rho = Math.min(0.02, asl / (bw * d));
  const vMain = cRdC * k * Math.cbrt(100 * rho * fck);
  const vFloor = vMin * k ** 1.5 * Math.sqrt(fck);
  return Math.max(vMain, vFloor) * bw * d;
}

describe("EOS-D1E-EU-C5 independent numerical benchmarks", () => {
  it("matches the Walraven and SOFiSTiK shear anchors without calling production for the expected value", () => {
    const walraven = evaluateEuC5Shear(shearInput());
    const walravenHand = independentShearN(372, 250, 0.0061 * 250 * 372, 25, 0.12, 0.035);
    expect(walraven.ok).toBe(true);
    expect(walraven.resistance?.unit).toBe("N");
    expect(walraven.resistance?.value).toBeCloseTo(walravenHand, 6);
    expect(Math.abs((walraven.resistance?.value ?? 0) - 47800)).toBeLessThan(EU_C5_SHEAR_PUBLISHED_FORCE_TOLERANCE_N);
    expect(walraven.checkState).toBe("CHECK_NOT_SATISFIED");
    expect(walraven.utilization).toBeGreaterThan(1);
    expect(walraven.checksEqualMemberConformance).toBe(false);

    const minimum = evaluateEuC5Shear(shearInput({
      demand: { ...demand(), shear: { value: 60000, unit: "N", locationM: 0, signed: 60000 } },
      effectiveDepth: ndp(530, "mm"),
      webWidth: ndp(300, "mm"),
      longitudinalTensionArea: ndp(0, "mm2"),
      fck: ndp(30, "MPa"),
    }));
    const sofistikHand = independentShearN(530, 300, 0, 30, 0.12, 0.035);
    expect(minimum.resistance?.value).toBeCloseTo(sofistikHand, 6);
    expect(Math.abs((minimum.resistance?.value ?? 0) - 62517)).toBeLessThan(EU_C5_SHEAR_PUBLISHED_BENCHMARK_TOLERANCE_N);
    expect(minimum.checkState).toBe("CHECK_SATISFIED");
    expect(evaluateEuC5Shear(shearInput()).fingerprint).toBe(walraven.fingerprint);
  });

  it("rejects invalid shear input and does not treat a shear check as member conformance", () => {
    expect(evaluateEuC5Shear(shearInput({ effectiveDepth: null })).failReason).toBe("MISSING_GEOMETRY");
    expect(evaluateEuC5Shear(shearInput({ effectiveDepth: ndp(372, "m") })).failReason).toBe("MISSING_GEOMETRY");
    expect(evaluateEuC5Shear(shearInput({ longitudinalTensionArea: null })).failReason).toBe("MISSING_LONGITUDINAL_REINFORCEMENT");
    expect(evaluateEuC5Shear(shearInput({ fck: null })).failReason).toBe("MISSING_MATERIAL_PARAMETER");
    expect(evaluateEuC5Shear(shearInput({ cRdC: null })).failReason).toBe("MISSING_NDP");
    expect(evaluateEuC5Shear(shearInput({ designShearReinforcement: "PRESENT" })).failReason).toBe("UNSUPPORTED_RULE_APPLICABILITY");
    expect(evaluateEuC5Shear(shearInput({ axialForceN: 1000 })).failReason).toBe("UNSUPPORTED_AXIAL_STATE");
    expect(evaluateEuC5Shear(shearInput({ generation: "SECOND_GENERATION" })).failReason).toBe("UNSUPPORTED_RULE_APPLICABILITY");
    expect(evaluateEuC5Shear(shearInput({ effectiveDepth: ndp(Number.NaN, "mm") })).failReason).toBe("MISSING_GEOMETRY");
    expect(evaluateEuC5Shear(shearInput({
      demand: { ...demand(), shear: { value: Number.POSITIVE_INFINITY, unit: "N", locationM: 0, signed: Number.POSITIVE_INFINITY } },
    })).failReason).toBe("INVALID_INPUT");
    const rhoCap = evaluateEuC5Shear(shearInput({ longitudinalTensionArea: ndp(0.05 * 250 * 372, "mm2") }));
    const rhoCapHand = independentShearN(372, 250, 0.05 * 250 * 372, 25, 0.12, 0.035);
    expect(rhoCap.resistance?.value).toBeCloseTo(rhoCapHand, 6);
    expect(rhoCapHand).toBeCloseTo(independentShearN(372, 250, 0.02 * 250 * 372, 25, 0.12, 0.035), 6);
  });

  it("matches the Walraven interior punching anchor and keeps beam shear out of punching", () => {
    const rho = Math.sqrt(0.0086 * 0.0087);
    const k = Math.min(2, 1 + Math.sqrt(200 / 164));
    const vHand = Math.max(0.12 * k * Math.cbrt(100 * rho * 25), 0.035 * k ** 1.5 * Math.sqrt(25));
    const uHand = 2 * (500 + 500) + 2 * Math.PI * 2 * 164;
    const punching = evaluateEuC5Punching(shearInput({
      punchingForce: ndp(705000, "N"),
      beta: ndp(1.15, "dimensionless"),
      effectiveDepth: ndp(164, "mm"),
      loadedWidth: ndp(500, "mm"),
      loadedDepth: ndp(500, "mm"),
      rhoX: ndp(0.0086, "dimensionless"),
      rhoY: ndp(0.0087, "dimensionless"),
      supportPosition: "INTERIOR",
      openingPresent: false,
      eccentricityMode: "EXPLICIT_BETA_ONLY",
    }));
    expect(punching.ok).toBe(true);
    expect(punching.resistance?.unit).toBe("MPa");
    expect(punching.resistance?.value).toBeCloseTo(vHand, 8);
    expect(Math.abs((punching.resistance?.value ?? 0) - 0.67)).toBeLessThan(EU_C5_PUNCHING_PUBLISHED_STRESS_TOLERANCE_MPA);
    expect(Math.abs(uHand - 4060)).toBeLessThan(EU_C5_PUNCHING_PERIMETER_TOLERANCE_MM);
    expect(punching.demand.unit).toBe("MPa");
    expect(punching.demand.source).toBe("EXPLICIT_PUNCHING_FORCE");
    expect(punching.checkState).toBe("CHECK_NOT_SATISFIED");

    const blocked = evaluateEuC5Punching(shearInput());
    expect(blocked.failReason).toBe("D1C_PUNCHING_ACTION_NOT_AVAILABLE");
    expect(evaluateEuC5Punching(shearInput({
      punchingForce: ndp(705000, "N"),
      supportPosition: "EDGE",
      openingPresent: false,
      eccentricityMode: "EXPLICIT_BETA_ONLY",
      beta: ndp(1.4, "dimensionless"),
    })).failReason).toBe("UNSUPPORTED_GEOMETRY");
    expect(evaluateEuC5Punching(shearInput({
      punchingForce: ndp(705000, "N"),
      supportPosition: "INTERIOR",
      openingPresent: true,
      eccentricityMode: "EXPLICIT_BETA_ONLY",
      beta: ndp(1.15, "dimensionless"),
      effectiveDepth: ndp(164, "mm"),
      loadedWidth: ndp(500, "mm"),
      loadedDepth: ndp(500, "mm"),
      rhoX: ndp(0.0086, "dimensionless"),
      rhoY: ndp(0.0087, "dimensionless"),
    })).failReason).toBe("UNSUPPORTED_GEOMETRY");
    expect(evaluateEuC5Punching(shearInput({
      punchingForce: ndp(1000, "kN"),
      supportPosition: "INTERIOR",
      openingPresent: false,
      eccentricityMode: "EXPLICIT_BETA_ONLY",
    })).failReason).toBe("INVALID_INPUT");
  });
});
