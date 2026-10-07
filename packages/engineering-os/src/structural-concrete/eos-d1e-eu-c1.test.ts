import { describe, expect, it } from "vitest";
import {
  AI_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_C1_ASSISTANCE_ADVISORY_ONLY,
  AI_NDP_AUTHORITY,
  AI_RULE_PARAMETER_AUTHORITY,
  AI_SOURCE_CONFLICT_AUTHORITY,
  C1B_RULE_EVIDENCE_LOADED,
  COMMON_RC_KERNEL_CONTAINS_EN1992_PARAMETERS,
  COPYRIGHTED_STANDARD_TEXT_REPRODUCED,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  D1E1_MATERIAL_RESPONSE_INTERFACE_REUSED,
  D1E_FROZEN_ARCHITECTURE_PRESERVED,
  ENGINEERING_REFERENCE_IMPLEMENTATION_EQUALS_STANDARD_CONFORMANCE,
  EOS_D1E_EU_C1_CLOSED,
  EU_C1_ACTUAL_NUMERICAL_RULE_IMPLEMENTATION,
  EU_C1_CAPABILITY_MANIFEST_IMPLEMENTED_RULE_COUNT,
  EU_C1_ENGINEER_VALIDATED_RULE_COUNT,
  EU_C1_ENGINEER_VALIDATION_STATE,
  EU_C1_FORMULA_FINGERPRINT_VALIDATION,
  EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT,
  EU_C1_IMPLEMENTED_RULE_IDS,
  EU_C1_IMPLEMENTED_RULE_NOT_PRESENT_IN_C1B_EVIDENCE,
  EU_C1_IMPLEMENTATION_READY_RULE_COUNT,
  EU_C1_IMPLEMENTATION_READY_RULE_IDS,
  EU_C1_INDEPENDENT_GOLDEN_CASES,
  EU_C1_NUMERICALLY_VALIDATED_RULE_COUNT,
  EU_C1_NUMERICAL_TOLERANCE,
  EU_C1_PARAMETER_PROVENANCE_COMPLETE,
  EU_C1_RULE_PACK_READY_FOR_FLEXURE,
  EU_C1_SELF_REFERENTIAL_BENCHMARKS,
  EU_C1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT,
  EU_C2_MISSING_RULE_DEPENDENCIES,
  EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE,
  EU_CONCRETE_IMPLEMENTATION_MATURITY,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION,
  GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1_RULE,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LLM_EU_C1_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  NEXT_PHASE_TYPE,
  NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED,
  PARALLEL_EU_RULE_ENGINE_CREATED,
  READY_FOR_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1,
  STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME,
  STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY,
  STALE_EU_C1_RESULT_REUSE_ALLOWED,
  type ConcreteMaterial,
  type ReinforcementMaterial,
} from "@rtb/types";
import { governedProvenance } from "../structural-domain/catalog";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import {
  assertC1bEvidenceLoaded,
  assertEuC2DependencyAudit,
  assertStaleEuC1NotReused,
  consumeEuC1RulePack,
  euC1InvalidationTags,
  evaluateEuC1ConcreteCharProperties,
  evaluateEuC1ConcreteTensionTreatment,
  evaluateEuC1ReinforcementCharProperties,
  EU_C1_GOLDEN_CONCRETE_CHAR_BOUNDARY,
  EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL,
  EU_C1_GOLDEN_CONCRETE_CHAR_SECOND,
  EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED,
  EU_C1_GOLDEN_REO_CHAR_NORMAL,
  EU_C1_GOLDEN_REO_CHAR_SECOND,
  EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED,
  EU_C1_GOLDEN_TENSION_NORMAL,
  EU_C1_READY_EVIDENCE,
} from "./eu-c1";
import { IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS } from "./eu-flexure";
import { linearElasticConcreteModel } from "./section-mechanics";

function property(name: string, value: number | null, unit: string | null) {
  return { name, value, unit, provenanceRef: "cert-c1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(patch: Partial<ConcreteMaterial> = {}, fc = property("fc", 30, "MPa"), e = property("Ec", 30000, "MPa")): ConcreteMaterial {
  return {
    materialRef: "eu-c1-conc",
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
    testCertificateRef: "tc-1",
    environmentalMetadata: null,
    version: "c1",
    provenance: governedProvenance({ jurisdiction: "eu", standard: "EN 1992", version: "c1.0" }),
    ...patch,
  };
}

function reo(patch: Partial<ReinforcementMaterial> = {}): ReinforcementMaterial {
  return {
    materialRef: "eu-c1-reo",
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

describe("EOS-D1E-EU-C1 governed Eurocode concrete material rule pack", () => {
  it("loads C1B evidence and implements exactly the three ready rules", () => {
    expect(C1B_RULE_EVIDENCE_LOADED).toBe(true);
    assertC1bEvidenceLoaded();
    expect([...EU_C1_IMPLEMENTATION_READY_RULE_IDS]).toEqual([...EU_C1_IMPLEMENTED_RULE_IDS]);
    expect(EU_C1_IMPLEMENTATION_READY_RULE_COUNT).toBe(3);
    expect(EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT).toBe(3);
    expect(EU_C1_NUMERICALLY_VALIDATED_RULE_COUNT).toBe(EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT);
    expect(EU_C1_CAPABILITY_MANIFEST_IMPLEMENTED_RULE_COUNT).toBe(EU_C1_IMPLEMENTED_NUMERICAL_RULE_COUNT);
    expect(EU_C1_IMPLEMENTED_RULE_NOT_PRESENT_IN_C1B_EVIDENCE).toBe(false);
    expect(EU_C1_READY_EVIDENCE.map((row) => row.ruleId).sort()).toEqual([...EU_C1_IMPLEMENTATION_READY_RULE_IDS].sort());
    expect(EU_C1_ACTUAL_NUMERICAL_RULE_IMPLEMENTATION).toBe(true);
    expect(EU_C1_UNPROVENANCED_NUMERICAL_CONSTANT_COUNT).toBe(0);
    expect(EU_C1_PARAMETER_PROVENANCE_COMPLETE).toBe(true);
    expect(EU_C1_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
  });

  it("preserves frozen architecture, copyright boundary, and unclaimed conformance", () => {
    expect(D1E_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(PARALLEL_EU_RULE_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_EU_MATERIAL_RESPONSE_ENGINE_CREATED).toBe(false);
    expect(COMMON_RC_KERNEL_CONTAINS_EN1992_PARAMETERS).toBe(false);
    expect(D1E1_MATERIAL_RESPONSE_INTERFACE_REUSED).toBe(true);
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_AT_RUNTIME).toBe(false);
    expect(STANDARD_DOCUMENT_REQUIRED_IN_REPOSITORY).toBe(false);
    expect(FULL_STANDARD_TEXT_REQUIRED_FOR_RULE_IMPLEMENTATION).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_REPRODUCED).toBe(false);
    expect(ENGINEERING_REFERENCE_IMPLEMENTATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(NATIONAL_ANNEX_INFERRED_FROM_LOCATION).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(LLM_EU_C1_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_C1_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AI_RULE_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_SOURCE_CONFLICT_AUTHORITY).toBe(false);
    expect(AI_NDP_AUTHORITY).toBe(false);
    expect(AI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(GENERATIVE_MODEL_CAN_OVERRIDE_EU_C1_RULE).toBe(false);
  });

  it("validates concrete characteristic properties against independent golden cases", () => {
    expect(EU_C1_INDEPENDENT_GOLDEN_CASES).toBe(true);
    expect(EU_C1_SELF_REFERENTIAL_BENCHMARKS).toBe(false);
    const normal = evaluateEuC1ConcreteCharProperties({
      concrete: concrete({}, property("fc", EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.input.compressiveStrength.value, EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.input.compressiveStrength.unit), property("Ec", EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.input.elasticModulus.value, EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.input.elasticModulus.unit)),
    });
    expect(normal.ok).toBe(true);
    if (normal.ok) {
      expect(normal.outputs.compressiveStrengthMPa).toBe(EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.expected.compressiveStrengthMPa);
      expect(normal.outputs.elasticModulusMPa).toBe(EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL.expected.elasticModulusMPa);
      expect(normal.provenance.formulaFingerprint).toMatch(/^fp:[0-9a-f]{8}$/);
      expect(normal.provenance.maturity).toBe("NUMERICALLY_VALIDATED");
    }
    const second = evaluateEuC1ConcreteCharProperties({
      concrete: concrete({}, property("fc", EU_C1_GOLDEN_CONCRETE_CHAR_SECOND.input.compressiveStrength.value, "MPa"), property("Ec", EU_C1_GOLDEN_CONCRETE_CHAR_SECOND.input.elasticModulus.value, "MPa")),
    });
    expect(second.ok && second.outputs).toEqual(EU_C1_GOLDEN_CONCRETE_CHAR_SECOND.expected);
    const boundary = evaluateEuC1ConcreteCharProperties({
      concrete: concrete({}, property("fc", EU_C1_GOLDEN_CONCRETE_CHAR_BOUNDARY.input.compressiveStrength.value, "MPa"), property("Ec", EU_C1_GOLDEN_CONCRETE_CHAR_BOUNDARY.input.elasticModulus.value, "MPa")),
    });
    expect(boundary.ok && boundary.outputs).toEqual(EU_C1_GOLDEN_CONCRETE_CHAR_BOUNDARY.expected);
    const converted = evaluateEuC1ConcreteCharProperties({
      concrete: concrete(
        {},
        property("fc", EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.input.compressiveStrength.value, EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.input.compressiveStrength.unit),
        property("Ec", EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.input.elasticModulus.value, EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.input.elasticModulus.unit),
      ),
    });
    expect(converted.ok).toBe(true);
    if (converted.ok) {
      expect(Math.abs(converted.outputs.compressiveStrengthMPa - EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.expected.compressiveStrengthMPa)).toBeLessThanOrEqual(EU_C1_NUMERICAL_TOLERANCE.convertedAbs);
      expect(Math.abs(converted.outputs.elasticModulusMPa - EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED.expected.elasticModulusMPa)).toBeLessThanOrEqual(EU_C1_NUMERICAL_TOLERANCE.convertedAbs);
    }
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete({}, property("fc", Number.NaN, "MPa"), property("Ec", 30000, "MPa")) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete({}, property("fc", 30, null), property("Ec", 30000, "MPa")) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete({}, property("fc", -30, "MPa"), property("Ec", 30000, "MPa")) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete({}, property("fc", 30, "ksi"), property("Ec", 30000, "MPa")) }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete({ compressiveStrength: null }) }).ok).toBe(false);
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete(), profile: { standardFamily: "ACI 318" } }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1ConcreteCharProperties({ concrete: concrete(), profile: { generation: "FIRST_GENERATION" } }).checkState).toBe("STANDARD_CONTEXT_INCOMPLETE");
  });

  it("validates reinforcement characteristic properties against independent golden cases", () => {
    const area = property("As", EU_C1_GOLDEN_REO_CHAR_NORMAL.input.area.value, EU_C1_GOLDEN_REO_CHAR_NORMAL.input.area.unit);
    const normal = evaluateEuC1ReinforcementCharProperties({
      reinforcement: reo({
        yieldStrength: property("fy", EU_C1_GOLDEN_REO_CHAR_NORMAL.input.yieldStrength.value, "MPa"),
        elasticModulus: property("Es", EU_C1_GOLDEN_REO_CHAR_NORMAL.input.elasticModulus.value, "MPa"),
      }),
      area,
    });
    expect(normal.ok && normal.outputs).toEqual(EU_C1_GOLDEN_REO_CHAR_NORMAL.expected);
    const second = evaluateEuC1ReinforcementCharProperties({
      reinforcement: reo({
        yieldStrength: property("fy", EU_C1_GOLDEN_REO_CHAR_SECOND.input.yieldStrength.value, "MPa"),
        elasticModulus: property("Es", EU_C1_GOLDEN_REO_CHAR_SECOND.input.elasticModulus.value, "MPa"),
      }),
      area: property("As", EU_C1_GOLDEN_REO_CHAR_SECOND.input.area.value, "mm2"),
    });
    expect(second.ok && second.outputs).toEqual(EU_C1_GOLDEN_REO_CHAR_SECOND.expected);
    const converted = evaluateEuC1ReinforcementCharProperties({
      reinforcement: reo({
        yieldStrength: property("fy", EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.yieldStrength.value, EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.yieldStrength.unit),
        elasticModulus: property("Es", EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.elasticModulus.value, EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.elasticModulus.unit),
      }),
      area: property("As", EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.area.value, EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.input.area.unit),
    });
    expect(converted.ok).toBe(true);
    if (converted.ok) {
      expect(converted.outputs.yieldStrengthMPa).toBeCloseTo(EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.expected.yieldStrengthMPa, 9);
      expect(converted.outputs.areaMm2).toBeCloseTo(EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED.expected.areaMm2, 9);
    }
    expect(evaluateEuC1ReinforcementCharProperties({ reinforcement: reo(), area: null }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ReinforcementCharProperties({ reinforcement: reo({ yieldStrength: null }), area }).checkState).toBe("CHECK_UNDETERMINED");
    expect(evaluateEuC1ReinforcementCharProperties({ reinforcement: reo(), area: property("As", Number.POSITIVE_INFINITY, "mm2") }).checkState).toBe("CHECK_UNDETERMINED");
  });

  it("omits ULS concrete tension, reuses D1E-1 NO_TENSION, and fails closed on invented tension", () => {
    const result = evaluateEuC1ConcreteTensionTreatment();
    expect(result.ok && result.outputs).toEqual(EU_C1_GOLDEN_TENSION_NORMAL.expected);
    if (result.ok) {
      expect(linearElasticConcreteModel(concrete(), result.outputs.kernelTensionTreatment).requiredProperties).toContain("elasticModulus");
    }
    expect(evaluateEuC1ConcreteTensionTreatment({ concreteTensionIncludedInUlsFlexure: true }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1ConcreteTensionTreatment({ requestedTreatment: "ELASTIC_TENSION" }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(evaluateEuC1ConcreteTensionTreatment({ limitState: "SLS" }).checkState).toBe("UNSUPPORTED_SCOPE");
    expect(consumeEuC1RulePack("EU_C1_CONCRETE_TENSION_TREATMENT", {}).ok).toBe(true);
  });

  it("invalidates dependents, records pending engineer validation, and keeps C2 blocked on exact missing rules", () => {
    const a = evaluateEuC1ConcreteCharProperties({ concrete: concrete() });
    const b = evaluateEuC1ConcreteCharProperties({ concrete: concrete({}, property("fc", 40, "MPa"), property("Ec", 35000, "MPa")) });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      const tags = euC1InvalidationTags(a.resultFingerprint, b.resultFingerprint);
      expect(tags.length).toBeGreaterThan(0);
      expect(STALE_EU_C1_RESULT_REUSE_ALLOWED).toBe(false);
      expect(() => assertStaleEuC1NotReused(tags, true)).toThrow(/stale/i);
      const again = evaluateEuC1ConcreteCharProperties({ concrete: concrete() });
      expect(again.ok && again.resultFingerprint).toBe(a.resultFingerprint);
    }
    expect(EU_C1_ENGINEER_VALIDATED_RULE_COUNT).toBe(0);
    expect(EU_C1_ENGINEER_VALIDATION_STATE).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    assertEuC2DependencyAudit();
    expect(EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE).toBe(false);
    expect(EU_C1_RULE_PACK_READY_FOR_FLEXURE).toBe(false);
    expect([...EU_C2_MISSING_RULE_DEPENDENCIES]).toEqual([
      "EU_C1_CONCRETE_DESIGN_PROPERTIES",
      "EU_C1_REINFORCEMENT_DESIGN_PROPERTIES",
      "EU_C1_PARTIAL_FACTOR_GAMMA_C",
      "EU_C1_PARTIAL_FACTOR_GAMMA_S",
      "EU_C1_CONCRETE_COMPRESSION_RESPONSE",
      "EU_C1_CONCRETE_STRAIN_LIMITS",
      "EU_C1_REINFORCEMENT_RESPONSE",
      "EU_C1_REINFORCEMENT_STRAIN_STATES",
      "EU_C1_STRESS_BLOCK_OR_SECTION_MODEL",
    ]);
    expect(NEXT_PHASE_TYPE).toBe("BOUNDED_RULE_GAP_IMPLEMENTATION");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C1C");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C")?.status).toBe("THIS_PHASE");
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.C1.MATERIAL_RULES")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C1.MATERIAL_RULES")?.implementationState).toBe("NUMERICALLY_VALIDATED_MATERIAL_RULE_PACK");
    expect(D1E_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(expect.arrayContaining([
      "D1E-EU-C1-VD-C2-GAPS",
      "D1E-EU-C1-VD-ENGINEER",
    ]));
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU_C1).toBe(false);
    expect(EOS_D1E_EU_C1_CLOSED).toBe(true);
    expect(READY_FOR_NEXT_PHASE).toBe(true);
  });
});
