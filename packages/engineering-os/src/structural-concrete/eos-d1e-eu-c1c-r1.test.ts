import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_C1C_R1_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_RULE_PARAMETER_AUTHORITY,
  AI_SOURCE_CONFLICT_AUTHORITY,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  EOS_D1E_EU_C1C_R1_CLOSED,
  EU_C1C_EVIDENCE_C2_SECTION_RESISTANCE_STRATEGY,
  EU_C1C_PARTIAL_IMPLEMENTATION_RESUME_GATE,
  EU_C1C_R1_CAPABILITY_MANIFEST_NEW_RULE_COUNT,
  EU_C1C_R1_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT,
  EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_R1_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT,
  EU_C1C_R1_DEFAULT_NDP_VALUE,
  EU_C1C_R1_ENGINEER_VALIDATED_RULE_COUNT,
  EU_C1C_R1_ENGINEER_VALIDATION_STATE,
  EU_C1C_R1_FAIL_CLOSED_AUDIT,
  EU_C1C_R1_FORMULA_FINGERPRINT_VALIDATION,
  EU_C1C_R1_GAMMA_C_DEPENDENCY_CLASS,
  EU_C1C_R1_GAMMA_C_IMPLEMENTED,
  EU_C1C_R1_GAMMA_C_VALUE_GUESSED,
  EU_C1C_R1_GOVERNED_EVIDENCE_LOADED,
  EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_R1_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE,
  EU_C1C_R1_MISSING_NDP_FAILS_CLOSED,
  EU_C1C_R1_NEW_RULE_GOLDEN_CASES,
  EU_C1C_R1_NEXT_PHASE_TYPE,
  EU_C1C_R1_NUMERICALLY_VALIDATED_RULE_COUNT,
  EU_C1C_R1_NUMERICAL_TOLERANCE,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C1C_R1_READY_FOR_NEXT_PHASE,
  EU_C1C_R1_REINFORCEMENT_STRAIN_STATES_CURRENT_C2_STATUS,
  EU_C1C_R1_SELF_REFERENTIAL_BENCHMARKS,
  EU_C1C_R1_TARGET_RULE_COUNT,
  EU_C1C_R1_TARGET_RULE_IDS,
  EU_C1C_R1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  EU_C1C_R1_VALIDATION_DEBT_REDUCED_ITEMS,
  EU_C1C_RESUME_GATE,
  EU_C2_NUMERICAL_RULE_PACK_COMPLETE,
  EU_C2_READY_FOR_IMPLEMENTATION,
  EU_C2_REMAINING_MINIMUM_RULE_GAP_COUNT,
  EU_C2_REMAINING_MINIMUM_RULE_GAP_IDS,
  EU_C2_RULE_AUTHORITY_COMPLETE,
  EU_CONCRETE_IMPLEMENTATION_MATURITY,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION,
  IMPLEMENTED_RULE_EQUALS_ALWAYS_EXECUTABLE,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_EU_C1C_R1_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  PARALLEL_EU_RULE_ENGINE_CREATED,
  PARALLEL_EU_STANDARD_FRAMEWORK_CREATED,
  PARALLEL_EU_VALIDATION_FRAMEWORK_CREATED,
  PARALLEL_PARTIAL_FACTOR_RESOLVER_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_R1,
  SEPARATE_EU_STRESS_BLOCK_REQUIRED_FOR_BOUNDED_C2,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
  STALE_EU_C1C_R1_RESULT_REUSE_ALLOWED,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementMaterial,
} from "@rtb/types";
import { governedProvenance } from "../structural-domain/catalog";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import { evaluateEuC1ConcreteCharProperties } from "./eu-c1";
import { resolveEuC1cPartialFactor } from "./eu-c1c";
import {
  assertEuC1cR1EvidenceLoaded,
  assertStaleEuC1cR1NotReused,
  consumeEuC1cR1RulePack,
  euC1cR1InvalidationTags,
  evaluateEuC1ConcreteDesignProperties,
  evaluateEuC1PartialFactorGammaC,
  evaluateEuC1PartialFactorGammaS,
  evaluateEuC1ReinforcementDesignProperties,
  EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_BOUNDARY,
  EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL,
  EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND,
  EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_UNIT_CONVERTED,
  EU_C1C_R1_GOLDEN_GAMMA_C_NORMAL,
  EU_C1C_R1_GOLDEN_GAMMA_C_SECOND,
  EU_C1C_R1_GOLDEN_GAMMA_S_NORMAL,
  EU_C1C_R1_GOLDEN_GAMMA_S_SECOND,
  EU_C1C_R1_GOLDEN_REO_DESIGN_NORMAL,
  EU_C1C_R1_GOLDEN_REO_DESIGN_SECOND,
  EU_C1C_R1_GOLDEN_REO_DESIGN_UNIT_CONVERTED,
  type EuC1cR1StandardContext,
} from "./eu-c1c-r1";
import { IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS } from "./eu-flexure";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-r1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function ndp(value: number, identity: EuC1cR1DeclaredNdpValue["ndpIdentity"] = "DECLARED_NATIONAL_ANNEX"): EuC1cR1DeclaredNdpValue {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE",
    provenanceRef: "declared-ndp-r1",
    ndpIdentity: identity,
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function context(patch: Partial<EuC1cR1StandardContext> = {}): EuC1cR1StandardContext {
  return {
    nationalAnnexRef: "DECLARED_TEST_NA",
    gamma_c: ndp(EU_C1C_R1_GOLDEN_GAMMA_C_NORMAL.input.value),
    gamma_s: ndp(EU_C1C_R1_GOLDEN_GAMMA_S_NORMAL.input.value),
    alpha_cc: ndp(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.input.alphaCc),
    ...patch,
  };
}

function concrete(patch: Partial<ConcreteMaterial> = {}, fc = property("fc", 30, "MPa"), e = property("Ec", 30000, "MPa")): ConcreteMaterial {
  return {
    materialRef: "eu-c1c-r1-conc",
    designation: "C30",
    compressiveStrength: fc,
    tensileStrength: null,
    elasticModulus: e,
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-r1",
    environmentalMetadata: null,
    version: "c1",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c1.0" }),
    ...patch,
  };
}

function reo(patch: Partial<ReinforcementMaterial> = {}): ReinforcementMaterial {
  return {
    materialRef: "eu-c1c-r1-reo",
    designation: "B500B",
    yieldStrength: property("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: property("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "c1",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c1.0" }),
    ...patch,
  };
}

function close(actual: number, expected: number): void {
  const abs = Math.abs(actual - expected);
  expect(abs).toBeLessThanOrEqual(Math.max(EU_C1C_R1_NUMERICAL_TOLERANCE.convertedAbs, EU_C1C_R1_NUMERICAL_TOLERANCE.convertedRel * Math.abs(expected)));
}

describe("EOS-D1E-EU-C1C-RESUME-1 authority-ready C2 subset", () => {
  it("loads governed evidence and implements exactly the four ready rules", () => {
    expect(EU_C1C_R1_GOVERNED_EVIDENCE_LOADED).toBe(true);
    assertEuC1cR1EvidenceLoaded();
    expect(EU_C1C_R1_TARGET_RULE_COUNT).toBe(4);
    expect([...EU_C1C_R1_TARGET_RULE_IDS]).toEqual([
      "EU_C1_PARTIAL_FACTOR_GAMMA_C",
      "EU_C1_PARTIAL_FACTOR_GAMMA_S",
      "EU_C1_CONCRETE_DESIGN_PROPERTIES",
      "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
    ]);
    expect(EU_C1C_PARTIAL_IMPLEMENTATION_RESUME_GATE).toBe("PASS");
    expect(EU_C1C_RESUME_GATE).toBe("FAIL");
    expect(EU_C2_RULE_AUTHORITY_COMPLETE).toBe(false);
    expect(EU_C1C_R1_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(4);
    expect(EU_C1C_R1_NUMERICALLY_VALIDATED_RULE_COUNT).toBe(4);
    expect(EU_C1C_R1_ENGINEER_VALIDATED_RULE_COUNT).toBe(0);
    expect(EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(7);
    expect(EU_C1C_R1_CUMULATIVE_NUMERICALLY_VALIDATED_RULE_COUNT).toBe(7);
    expect(EU_C1C_R1_IMPLEMENTED_RULE_WITHOUT_GOVERNED_EVIDENCE).toBe(false);
    expect(EU_C1C_R1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT).toBe(0);
    expect(EU_C1C_R1_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
    expect(EU_C1C_R1_GAMMA_C_IMPLEMENTED).toBe(true);
    expect(EU_C1C_R1_GAMMA_C_DEPENDENCY_CLASS).toBe("NDP_DEPENDENT");
    expect(EU_C1C_R1_GAMMA_C_VALUE_GUESSED).toBe(false);
    expect(EU_C1C_R1_DEFAULT_NDP_VALUE).toBe(false);
    expect(IMPLEMENTED_RULE_EQUALS_ALWAYS_EXECUTABLE).toBe(false);
    expect(EU_C1C_R1_MISSING_NDP_FAILS_CLOSED).toBe(true);
  });

  it("preserves frozen architecture, C1C historical resolver, and unclaimed conformance", () => {
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_RULE_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_EU_STANDARD_FRAMEWORK_CREATED).toBe(false);
    expect(PARALLEL_EU_VALIDATION_FRAMEWORK_CREATED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(PARALLEL_PARTIAL_FACTOR_RESOLVER_CREATED).toBe(false);
    expect(resolveEuC1cPartialFactor("gamma_c").ok).toBe(false);
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY).toBe(false);
    expect(FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_REPRODUCED).toBe(false);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(EU_C1C_EVIDENCE_C2_SECTION_RESISTANCE_STRATEGY).toBe("MATERIAL_INTEGRATION");
    expect(SEPARATE_EU_STRESS_BLOCK_REQUIRED_FOR_BOUNDED_C2).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(LLM_EU_C1C_R1_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C1C_R1_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_RULE_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_SOURCE_CONFLICT_AUTHORITY).toBe(false);
    expect(AI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    const runtime = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c1c-r1", "evaluate.ts"), "utf8");
    expect(runtime).not.toMatch(/\b1\.5\b/);
    expect(runtime).not.toMatch(/\b1\.15\b/);
    expect(runtime).not.toMatch(/\b0\.85\b/);
  });

  it("validates declared NDP partial factors against independent golden cases and fails closed without NDP", () => {
    expect(EU_C1C_R1_NEW_RULE_GOLDEN_CASES).toBe("PASS");
    expect(EU_C1C_R1_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_C1C_R1_FAIL_CLOSED_AUDIT).toBe("PASS");
    const gammaC = evaluateEuC1PartialFactorGammaC({ context: context() });
    expect(gammaC.ok && gammaC.outputs).toEqual(EU_C1C_R1_GOLDEN_GAMMA_C_NORMAL.expected);
    const second = evaluateEuC1PartialFactorGammaC({
      context: context({ gamma_c: ndp(EU_C1C_R1_GOLDEN_GAMMA_C_SECOND.input.value) }),
    });
    expect(second.ok && second.outputs).toEqual(EU_C1C_R1_GOLDEN_GAMMA_C_SECOND.expected);
    const gammaS = evaluateEuC1PartialFactorGammaS({ context: context() });
    expect(gammaS.ok && gammaS.outputs).toEqual(EU_C1C_R1_GOLDEN_GAMMA_S_NORMAL.expected);
    const gammaS2 = evaluateEuC1PartialFactorGammaS({
      context: context({ gamma_s: ndp(EU_C1C_R1_GOLDEN_GAMMA_S_SECOND.input.value) }),
    });
    expect(gammaS2.ok && gammaS2.outputs).toEqual(EU_C1C_R1_GOLDEN_GAMMA_S_SECOND.expected);
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ gamma_c: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaS({ context: context({ gamma_s: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ nationalAnnexRef: null, projectOverrideRef: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ inferredFromLocation: true }) }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ defaultNdpApplied: true }) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ gamma_c: ndp(Number.NaN) }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ gamma_c: ndp(Number.POSITIVE_INFINITY) }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ gamma_c: { ...ndp(1.5), unit: "ksi" } }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ gamma_c: { ...ndp(1.5), version: "stale" } }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1PartialFactorGammaC({ context: context({ profile: { standardFamily: "ACI 318" } }) }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(consumeEuC1cR1RulePack("EU_C1_PARTIAL_FACTOR_GAMMA_C", { context: context() }).ok).toBe(true);
  });

  it("validates design-property identities against independent golden cases", () => {
    const normal = evaluateEuC1ConcreteDesignProperties({
      concrete: concrete({}, property("fc", EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.input.fck.value, "MPa")),
      context: context(),
    });
    expect(normal.ok).toBe(true);
    if (normal.ok) {
      expect(normal.outputs.fckMPa).toBe(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.expected.fckMPa);
      expect(normal.outputs.alphaCc).toBe(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.expected.alphaCc);
      expect(normal.outputs.gammaC).toBe(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.expected.gammaC);
      expect(normal.outputs.fcdMPa).toBe(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL.expected.fcdMPa);
      expect(normal.provenance.formulaFingerprint).toMatch(/^fp:[0-9a-f]{8}$/);
      expect(normal.provenance.ndpDependency).toBe(true);
    }
    const second = evaluateEuC1ConcreteDesignProperties({
      concrete: concrete({}, property("fc", EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND.input.fck.value, "MPa")),
      context: context({ alpha_cc: ndp(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND.input.alphaCc) }),
    });
    expect(second.ok).toBe(true);
    if (second.ok) close(second.outputs.fcdMPa, EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND.expected.fcdMPa);
    const boundary = evaluateEuC1ConcreteDesignProperties({
      concrete: concrete({}, property("fc", EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_BOUNDARY.input.fck.value, "MPa")),
      context: context({ alpha_cc: ndp(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_BOUNDARY.input.alphaCc) }),
    });
    expect(boundary.ok).toBe(true);
    if (boundary.ok) close(boundary.outputs.fcdMPa, EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_BOUNDARY.expected.fcdMPa);
    const converted = evaluateEuC1ConcreteDesignProperties({
      concrete: concrete({}, property("fc", EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_UNIT_CONVERTED.input.fck.value, EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_UNIT_CONVERTED.input.fck.unit)),
      context: context(),
    });
    expect(converted.ok).toBe(true);
    if (converted.ok) close(converted.outputs.fcdMPa, EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_UNIT_CONVERTED.expected.fcdMPa);
    const reoNormal = evaluateEuC1ReinforcementDesignProperties({
      reinforcement: reo(),
      area: property("As", 314, "mm2"),
      context: context(),
    });
    expect(reoNormal.ok).toBe(true);
    if (reoNormal.ok) close(reoNormal.outputs.fydMPa, EU_C1C_R1_GOLDEN_REO_DESIGN_NORMAL.expected.fydMPa);
    const reoSecond = evaluateEuC1ReinforcementDesignProperties({
      reinforcement: reo({ yieldStrength: property("fy", EU_C1C_R1_GOLDEN_REO_DESIGN_SECOND.input.fyk.value, "MPa") }),
      area: property("As", 491, "mm2"),
      context: context({ gamma_s: ndp(EU_C1C_R1_GOLDEN_REO_DESIGN_SECOND.input.gammaS) }),
    });
    expect(reoSecond.ok).toBe(true);
    if (reoSecond.ok) close(reoSecond.outputs.fydMPa, EU_C1C_R1_GOLDEN_REO_DESIGN_SECOND.expected.fydMPa);
    const reoConverted = evaluateEuC1ReinforcementDesignProperties({
      reinforcement: reo({ yieldStrength: property("fy", EU_C1C_R1_GOLDEN_REO_DESIGN_UNIT_CONVERTED.input.fyk.value, EU_C1C_R1_GOLDEN_REO_DESIGN_UNIT_CONVERTED.input.fyk.unit) }),
      area: property("As", 314, "mm2"),
      context: context(),
    });
    expect(reoConverted.ok).toBe(true);
    if (reoConverted.ok) close(reoConverted.outputs.fydMPa, EU_C1C_R1_GOLDEN_REO_DESIGN_UNIT_CONVERTED.expected.fydMPa);
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete() }).ok).toBe(true);
  });

  it("fails closed on missing dependencies, invalid inputs, and stale versions, and invalidates dependents", () => {
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context({ gamma_c: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context({ alpha_cc: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ReinforcementDesignProperties({ reinforcement: reo(), area: property("As", 314, "mm2"), context: context({ gamma_s: null }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete({}, property("fc", Number.NaN, "MPa")), context: context() }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete({}, property("fc", 30, null)), context: context() }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete({ compressiveStrength: null }), context: context() }).ok).toBe(false);
    expect(evaluateEuC1ReinforcementDesignProperties({ reinforcement: reo(), area: null, context: context() }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context({ evidenceVersion: "stale" }) }).checkState).toBe("CHECK_UNDETERMINED");
    const a = evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context() });
    const b = evaluateEuC1ConcreteDesignProperties({
      concrete: concrete({}, property("fc", 40, "MPa")),
      context: context({ alpha_cc: ndp(EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND.input.alphaCc) }),
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      const tags = euC1cR1InvalidationTags(a.resultFingerprint, b.resultFingerprint);
      expect(tags.length).toBeGreaterThan(0);
      expect(STALE_EU_C1C_R1_RESULT_REUSE_ALLOWED).toBe(false);
      expect(() => assertStaleEuC1cR1NotReused(tags, true)).toThrow(/stale/i);
      const again = evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context() });
      expect(again.ok && again.resultFingerprint).toBe(a.resultFingerprint);
    }
  });

  it("keeps remaining constitutive C2 gaps and points to targeted evidence recovery", () => {
    expect(EU_C1C_R1_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect([...EU_C2_REMAINING_MINIMUM_RULE_GAP_IDS]).toEqual([
      "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
      "EU_C1_CONCRETE_STRAIN_LIMITS",
      "EU_C1_REINFORCEMENT_RESPONSE",
    ]);
    expect(EU_C2_REMAINING_MINIMUM_RULE_GAP_COUNT).toBe(3);
    expect(EU_C1C_R1_REINFORCEMENT_STRAIN_STATES_CURRENT_C2_STATUS).toBe("NOT_CURRENT_MINIMUM_DEPENDENCY");
    expect(EU_C2_NUMERICAL_RULE_PACK_COMPLETE).toBe(false);
    expect(EU_C2_READY_FOR_IMPLEMENTATION).toBe(false);
    expect(EU_C1C_R1_NEXT_PHASE_TYPE).toBe("TARGETED_CONSTITUTIVE_EVIDENCE_RECOVERY");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C1C-CONSTITUTIVE");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C-CONSTITUTIVE")?.status).toBe("THIS_PHASE");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C1C.R1.DESIGN_PROPERTIES")).toBe(true);
    expect(EU_C1C_R1_CAPABILITY_MANIFEST_NEW_RULE_COUNT).toBe(4);
    expect(EU_C1C_R1_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT).toBe(7);
    expect([...EU_C1C_R1_VALIDATION_DEBT_REDUCED_ITEMS]).toEqual(["D1E-EU-VD-PARTIAL-FACTOR", "D1E-EU-VD-DESIGN-STRENGTH"]);
    expect(D1E_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(expect.arrayContaining(["D1E-EU-C1C-R1-VD-ENGINEER", "D1E-EU-C1C-EVIDENCE-VD-CONSTITUTIVE"]));
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_R1).toBe(false);
    expect(EOS_D1E_EU_C1C_R1_CLOSED).toBe(true);
    expect(EU_C1C_R1_READY_FOR_NEXT_PHASE).toBe(true);
  });
});
