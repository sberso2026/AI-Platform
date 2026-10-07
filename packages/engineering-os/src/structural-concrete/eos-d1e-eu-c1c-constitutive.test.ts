import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CONFORMANCE_AUTHORITY,
  AI_CONSTITUTIVE_ASSISTANCE_ADVISORY_ONLY,
  AI_CONSTITUTIVE_PARAMETER_AUTHORITY,
  AI_CONSTITUTIVE_PROFILE_AUTHORITY,
  AI_CONSTITUTIVE_SOURCE_CONFLICT_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_NDP_AUTHORITY,
  CONCRETE_COMPRESSION_RESPONSE_IMPLEMENTED,
  CONCRETE_COMPRESSION_RESPONSE_PARAMETER_GUESSED,
  CONCRETE_RESPONSE_STRAIN_MODEL_COMPATIBILITY,
  CONCRETE_STRAIN_LIMITS_IMPLEMENTED,
  CONCRETE_STRAIN_VALUE_GUESSED,
  CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING,
  CONSTITUTIVE_ENGINEER_VALIDATED_RULE_COUNT,
  CONSTITUTIVE_ENGINEER_VALIDATION_STATE,
  CONSTITUTIVE_FAIL_CLOSED_AUDIT,
  CONSTITUTIVE_FORMULA_FINGERPRINT_VALIDATION,
  CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  CONSTITUTIVE_NEW_RULE_GOLDEN_CASES,
  CONSTITUTIVE_SELF_REFERENTIAL_BENCHMARKS,
  CONSTITUTIVE_TARGET_RULE_COUNT,
  CONSTITUTIVE_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  D1E1_MATERIAL_RESPONSE_INTERFACE_REUSED,
  EOS_D1E_EU_C1C_CONSTITUTIVE_CLOSED,
  EU_C1C_CONSTITUTIVE_C2_NUMERICAL_RULE_PACK_COMPLETE,
  EU_C1C_CONSTITUTIVE_C2_READY_FOR_IMPLEMENTATION,
  EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_COUNT,
  EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_IDS,
  EU_C1C_CONSTITUTIVE_C2_RULE_AUTHORITY_COMPLETE,
  EU_C1C_CONSTITUTIVE_CANONICAL_NEXT_PHASE,
  EU_C1C_CONSTITUTIVE_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_CONSTITUTIVE_MODEL_ID,
  EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS,
  EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE,
  EU_C1C_CONSTITUTIVE_PARAMETER_VERSION,
  EU_C1C_CONSTITUTIVE_READY_FOR_NEXT_PHASE,
  EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
  EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1C_R1_PARAMETER_VERSION,
  EU_C2_PREINTEGRATION_SMOKE_TEST,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  LLM_CONSTITUTIVE_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  REINFORCEMENT_RESPONSE_IMPLEMENTED,
  REINFORCEMENT_RESPONSE_PARAMETER_GUESSED,
  REINFORCEMENT_RESPONSE_STRATEGY,
  REINFORCEMENT_STRAIN_STATES_C2_STATUS,
  REQUIRED_CONCRETE_STRAIN_STATE_IDS,
  R1_RELEASE_CLASSIFICATION_DISPOSITION,
  R1_RELEASE_CLASSIFIER_GAP,
  R1_RELEASE_SENSITIVE_FILES_ACTUALLY_CHANGED,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_CONSTITUTIVE,
  SEPARATE_EU_STRESS_BLOCK_REQUIRED_FOR_BOUNDED_C2,
  STALE_CONSTITUTIVE_RESULT_REUSE_ALLOWED,
  type ConcreteMaterial,
  type EuC1cR1DeclaredNdpValue,
  type ReinforcementLayout,
  type ReinforcementMaterial,
} from "@rtb/types";
import { governedProvenance } from "../structural-domain/catalog";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import { evaluateEuC1ConcreteCharProperties, evaluateEuC1ReinforcementCharProperties } from "./eu-c1";
import {
  assertEuC1cConstitutiveEvidenceLoaded,
  assertStaleEuC1cConstitutiveNotReused,
  assertTestOnlyNdpNeverDefault,
  constitutiveFormulaFingerprint,
  euC1cConstitutiveInvalidationTags,
  evaluateEuC1ConcreteCompressionResponse,
  evaluateEuC1ConcreteStrainLimits,
  evaluateEuC1ReinforcementResponse,
  EU_C1C_CONSTITUTIVE_FORMULA_FINGERPRINTS,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INITIAL,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INTERMEDIATE,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_PLATEAU,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_TRANSITION,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ULTIMATE,
  EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ZERO,
  EU_C1C_CONSTITUTIVE_GOLDEN_REO_COMPRESSION,
  EU_C1C_CONSTITUTIVE_GOLDEN_REO_ELASTIC,
  EU_C1C_CONSTITUTIVE_GOLDEN_REO_POST_YIELD,
  EU_C1C_CONSTITUTIVE_GOLDEN_REO_YIELD,
  EU_C1C_CONSTITUTIVE_GOLDEN_REO_ZERO,
  EU_C1C_CONSTITUTIVE_GOLDEN_STRAIN_STATES,
  EU_C1C_CONSTITUTIVE_PARAMETERS,
  EU_C1C_CONSTITUTIVE_SOURCES,
  runEuC2PreintegrationSmokeTest,
  type EuC1cConstitutiveContext,
} from "./eu-c1c-constitutive";
import { evaluateEuC1ConcreteDesignProperties, evaluateEuC1PartialFactorGammaC, evaluateEuC1PartialFactorGammaS, evaluateEuC1ReinforcementDesignProperties } from "./eu-c1c-r1";
import { linearElasticConcreteModel, linearElasticReinforcementModel } from "./section-mechanics";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-constitutive", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function ndp(value: number, identity: EuC1cR1DeclaredNdpValue["ndpIdentity"] = "DECLARED_NATIONAL_ANNEX"): EuC1cR1DeclaredNdpValue {
  return {
    value,
    unit: "dimensionless",
    sourceAuthority: "DECLARED_NDP_OR_PROJECT_OVERRIDE",
    provenanceRef: "declared-ndp-constitutive",
    ndpIdentity: identity,
    version: EU_C1C_R1_PARAMETER_VERSION,
  };
}

function testOnlyNdp(value: number): EuC1cR1DeclaredNdpValue {
  return {
    ...ndp(value, "DECLARED_PROJECT_OVERRIDE"),
    sourceAuthority: EU_C1C_CONSTITUTIVE_TEST_ONLY_NON_CONFORMANCE,
    provenanceRef: "test-only-non-conformance",
  };
}

function context(patch: Partial<EuC1cConstitutiveContext> = {}): EuC1cConstitutiveContext {
  return {
    nationalAnnexRef: "DECLARED_TEST_NA",
    gamma_c: ndp(1.5),
    gamma_s: ndp(1.15),
    alpha_cc: ndp(1),
    ...patch,
  };
}

function concrete(patch: Partial<ConcreteMaterial> = {}, fc = property("fc", 30, "MPa")): ConcreteMaterial {
  return {
    materialRef: "eu-c1c-constitutive-conc",
    designation: "C30",
    compressiveStrength: fc,
    tensileStrength: null,
    elasticModulus: property("Ec", 30000, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "project-certificate",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "tc-constitutive",
    environmentalMetadata: null,
    version: "c1",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c1.0" }),
    ...patch,
  };
}

function reo(patch: Partial<ReinforcementMaterial> = {}): ReinforcementMaterial {
  return {
    materialRef: "eu-c1c-constitutive-reo",
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

function layout(): ReinforcementLayout {
  return {
    layoutId: "lay-constitutive",
    bars: [
      {
        barId: "b1",
        designation: "H16",
        diameterMm: property("d", 16, "mm"),
        areaMm2: property("As", 201, "mm2"),
        count: 1,
        xMm: 50,
        yMm: 50,
        layerId: "layer-1",
        face: "bottom",
        direction: "longitudinal",
        spacingMm: 150,
        groupId: "group-1",
        materialRef: "eu-c1c-constitutive-reo",
        anchorageMetadata: null,
        lapMetadata: null,
        provenanceRef: "layout-constitutive",
      },
    ],
    groups: [],
    layers: [],
    transverse: [],
    provenanceRef: "layout-constitutive",
  };
}

function close(actual: number, expected: number, abs: number = EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.stressAbsMPa, rel: number = EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.stressRel): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.max(abs, rel * Math.abs(expected)));
}

describe("EOS-D1E-EU-C1C-CONSTITUTIVE", () => {
  it("recovers authority and implements exactly the three constitutive target rules", () => {
    assertEuC1cConstitutiveEvidenceLoaded();
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_CONSTITUTIVE_ARCHITECTURE_CREATED).toBe(false);
    expect(PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED).toBe(false);
    expect(D1E1_MATERIAL_RESPONSE_INTERFACE_REUSED).toBe(true);
    expect(CONSTITUTIVE_TARGET_RULE_COUNT).toBe(3);
    expect([...EU_C1C_CONSTITUTIVE_TARGET_RULE_IDS]).toEqual([
      "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
      "EU_C1_CONCRETE_STRAIN_LIMITS",
      "EU_C1_REINFORCEMENT_RESPONSE",
    ]);
    expect(CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(3);
    expect(EU_C1C_CONSTITUTIVE_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(
      EU_C1C_R1_CUMULATIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT + CONSTITUTIVE_IMPLEMENTED_NUMERICAL_RULE_COUNT,
    );
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete() }).ok).toBe(true);
    expect(evaluateEuC1PartialFactorGammaC({ context: context() }).ok).toBe(true);
    expect(evaluateEuC1PartialFactorGammaS({ context: context() }).ok).toBe(true);
    expect(evaluateEuC1ConcreteDesignProperties({ concrete: concrete(), context: context() }).ok).toBe(true);
    expect(
      evaluateEuC1ReinforcementDesignProperties({
        reinforcement: reo(),
        area: property("As", 201, "mm2"),
        context: context(),
      }).ok,
    ).toBe(true);
    expect(linearElasticConcreteModel(concrete(), "NO_TENSION").modelId).toBe("RC_LINEAR_ELASTIC_CONCRETE_REFERENCE");
    expect(linearElasticReinforcementModel(reo()).modelId).toBe("RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE");
    expect(REINFORCEMENT_RESPONSE_STRATEGY).toBe("NEW_EU_RULE_USING_EXISTING_INTERFACE");
    expect([...REQUIRED_CONCRETE_STRAIN_STATE_IDS]).toEqual(["eps_c2", "eps_cu2"]);
    expect(CONCRETE_RESPONSE_STRAIN_MODEL_COMPATIBILITY).toBe("PASS");
    expect(REINFORCEMENT_STRAIN_STATES_C2_STATUS).toBe("NOT_REQUIRED_FOR_BOUNDED_C2");
    expect(new Set(EU_C1C_CONSTITUTIVE_SOURCES.map((row) => row.independenceGroup)).size).toBeGreaterThanOrEqual(3);
    expect(CONSTITUTIVE_CROSS_GENERATION_RULE_MIXING).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_REPRODUCED).toBe(false);
    expect(R1_RELEASE_SENSITIVE_FILES_ACTUALLY_CHANGED).toBe(true);
    expect(R1_RELEASE_CLASSIFIER_GAP).toBe(true);
    expect(R1_RELEASE_CLASSIFICATION_DISPOSITION).toBe("RESOLVED");
  });

  it("validates independent golden cases for parabola-rectangle and horizontal bilinear response", () => {
    const strain = evaluateEuC1ConcreteStrainLimits({ concrete: concrete(), context: context() });
    expect(strain.ok).toBe(true);
    if (strain.ok) {
      close(strain.outputs.epsC2, EU_C1C_CONSTITUTIVE_GOLDEN_STRAIN_STATES.expected.epsC2, EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.strainAbs, EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.strainRel);
      close(strain.outputs.epsCu2, EU_C1C_CONSTITUTIVE_GOLDEN_STRAIN_STATES.expected.epsCu2, EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.strainAbs, EU_C1C_CONSTITUTIVE_NUMERICAL_TOLERANCE.strainRel);
      expect(strain.outputs.n).toBe(EU_C1C_CONSTITUTIVE_GOLDEN_STRAIN_STATES.expected.n);
      expect(strain.outputs.modelId).toBe(EU_C1C_CONSTITUTIVE_MODEL_ID);
    }
    const cases = [
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ZERO,
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INITIAL,
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INTERMEDIATE,
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_TRANSITION,
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_PLATEAU,
      EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ULTIMATE,
    ];
    for (const row of cases) {
      const result = evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: row.input.kernelStrain, context: context() });
      expect(result.ok).toBe(true);
      if (result.ok) close(result.outputs.kernelStressMPa, row.expected.kernelStressMPa);
    }
    const tension = evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: 0.001, context: context() });
    expect(tension.ok && tension.outputs.kernelStressMPa).toBe(0);
    const reoCases = [
      EU_C1C_CONSTITUTIVE_GOLDEN_REO_ZERO,
      EU_C1C_CONSTITUTIVE_GOLDEN_REO_ELASTIC,
      EU_C1C_CONSTITUTIVE_GOLDEN_REO_YIELD,
      EU_C1C_CONSTITUTIVE_GOLDEN_REO_POST_YIELD,
      EU_C1C_CONSTITUTIVE_GOLDEN_REO_COMPRESSION,
    ];
    for (const row of reoCases) {
      const result = evaluateEuC1ReinforcementResponse({ reinforcement: reo(), kernelStrain: row.input.kernelStrain, context: context() });
      expect(result.ok).toBe(true);
      if (result.ok) close(result.outputs.kernelStressMPa, row.expected.kernelStressMPa);
    }
    expect(CONSTITUTIVE_NEW_RULE_GOLDEN_CASES).toBe("PASS");
    expect(CONSTITUTIVE_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    expect(EU_C1C_CONSTITUTIVE_FORMULA_FINGERPRINTS.EU_C1_CONCRETE_COMPRESSION_RESPONSE).toBe(
      constitutiveFormulaFingerprint("EU_C1_CONCRETE_COMPRESSION_RESPONSE"),
    );
    expect(CONSTITUTIVE_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
  });

  it("fails closed for invalid inputs, high-strength source conflict, and stale reuse", () => {
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: Number.NaN, context: context() }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: Number.POSITIVE_INFINITY, context: context() }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete({}, property("fc", 55, "MPa")), kernelStrain: -0.001, context: context() }).checkState).toBe("RULE_EVIDENCE_CONFLICT");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: -0.005, context: context() }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1ReinforcementResponse({ reinforcement: reo({ elasticModulus: null }), kernelStrain: 0.001, context: context() }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ReinforcementResponse({ reinforcement: reo({ yieldStrength: property("fy", -1, "MPa") }), kernelStrain: 0.001, context: context() }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ConcreteStrainLimits({ concrete: concrete(), context: context({ nationalAnnexRef: "", projectOverrideRef: "" }) }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: 0, context: context({ limitState: "SLS" }) }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: 0, context: context({ evidenceVersion: "stale" }) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: 0, context: context({ profile: { standardFamily: "AS 3600", standardPart: "EN_1992_1_1", generation: "UNKNOWN_PENDING_CONFIRMATION", edition: "UNKNOWN_PENDING_CONFIRMATION" } }) }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(CONSTITUTIVE_FAIL_CLOSED_AUDIT).toBe("PASS");
    const a = evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: -0.001, context: context() });
    const b = evaluateEuC1ConcreteCompressionResponse({ concrete: concrete(), kernelStrain: -0.002, context: context() });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      const tags = euC1cConstitutiveInvalidationTags(a.resultFingerprint, b.resultFingerprint);
      expect(tags.length).toBeGreaterThan(0);
      expect(() => assertStaleEuC1cConstitutiveNotReused(tags, true)).toThrow(/stale/i);
      expect(STALE_CONSTITUTIVE_RESULT_REUSE_ALLOWED).toBe(false);
    }
  });

  it("runs the bounded C2 pre-integration smoke test without claiming member resistance", () => {
    const smokeContext = context({
      testOnlyNonConformance: true,
      projectOverrideRef: "TEST_ONLY_NON_CONFORMANCE",
      gamma_c: testOnlyNdp(1.5),
      gamma_s: testOnlyNdp(1.15),
      alpha_cc: testOnlyNdp(1),
    });
    assertTestOnlyNdpNeverDefault(smokeContext);
    expect(() => assertTestOnlyNdpNeverDefault({ ...smokeContext, defaultNdpApplied: true })).toThrow(/never become a default/i);
    const smoke = runEuC2PreintegrationSmokeTest({
      concrete: concrete(),
      reinforcement: reo(),
      layout: layout(),
      context: smokeContext,
    });
    expect(smoke.ok).toBe(true);
    expect(smoke.labelledCodeCapacity).toBe(false);
    expect(smoke.memberResistanceClaimed).toBe(false);
    expect(Number.isFinite(smoke.N_N)).toBe(true);
    expect(Number.isFinite(smoke.Mx_Nm)).toBe(true);
    expect(EU_C2_PREINTEGRATION_SMOKE_TEST).toBe("PASS");
    expect(EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_IDS).toBe("NONE");
    expect(EU_C1C_CONSTITUTIVE_C2_REMAINING_RULE_GAP_COUNT).toBe(0);
    expect(EU_C1C_CONSTITUTIVE_C2_RULE_AUTHORITY_COMPLETE).toBe(true);
    expect(EU_C1C_CONSTITUTIVE_C2_NUMERICAL_RULE_PACK_COMPLETE).toBe(true);
    expect(EU_C1C_CONSTITUTIVE_C2_READY_FOR_IMPLEMENTATION).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C5");
    expect(EU_C1C_CONSTITUTIVE_CANONICAL_NEXT_PHASE).toBe("EOS-D1E-EU-C2");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(CONSTITUTIVE_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(CONSTITUTIVE_ENGINEER_VALIDATED_RULE_COUNT).toBe(0);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C1C.CONSTITUTIVE.MATERIAL_RESPONSE")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(EU_C1C_CONSTITUTIVE_CUMULATIVE_CAPABILITY_MANIFEST_RULE_COUNT).toBe(10);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C-CONSTITUTIVE")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C2")?.status).toBe("CLOSED");
    expect(D1E_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(expect.arrayContaining(["D1E-EU-C1C-CONSTITUTIVE-VD-ENGINEER"]));
    expect(EOS_D1E_EU_C1C_CONSTITUTIVE_CLOSED).toBe(true);
    expect(EU_C1C_CONSTITUTIVE_READY_FOR_NEXT_PHASE).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1C_CONSTITUTIVE).toBe(false);
    expect(SEPARATE_EU_STRESS_BLOCK_REQUIRED_FOR_BOUNDED_C2).toBe(false);
    expect(AI_CONSTITUTIVE_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_CONSTITUTIVE_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_CONSTITUTIVE_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_CONSTITUTIVE_SOURCE_CONFLICT_AUTHORITY).toBe(false);
    expect(AI_CONSTITUTIVE_PROFILE_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(CONCRETE_COMPRESSION_RESPONSE_IMPLEMENTED).toBe(true);
    expect(CONCRETE_STRAIN_LIMITS_IMPLEMENTED).toBe(true);
    expect(REINFORCEMENT_RESPONSE_IMPLEMENTED).toBe(true);
    expect(CONCRETE_COMPRESSION_RESPONSE_PARAMETER_GUESSED).toBe(false);
    expect(CONCRETE_STRAIN_VALUE_GUESSED).toBe(false);
    expect(REINFORCEMENT_RESPONSE_PARAMETER_GUESSED).toBe(false);
  });

  it("keeps constitutive runtime free of unprovenanced numerical constants", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c1c-constitutive/evaluate.ts"), "utf8");
    expect(src).not.toMatch(/\b0\.002\b/);
    expect(src).not.toMatch(/\b0\.0035\b/);
    expect(src).not.toMatch(/\b1\.15\b/);
    expect(src).not.toMatch(/\b200000\b/);
    expect(EU_C1C_CONSTITUTIVE_PARAMETERS.eps_c2.version).toBe(EU_C1C_CONSTITUTIVE_PARAMETER_VERSION);
    expect(CONSTITUTIVE_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT).toBe(0);
    expect(evaluateEuC1ReinforcementCharProperties({ reinforcement: reo(), area: property("As", 201, "mm2") }).ok).toBe(true);
  });
});
