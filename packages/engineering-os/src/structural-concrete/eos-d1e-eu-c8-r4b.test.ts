import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { formulaFingerprint } from "./eu-c1b/fingerprint";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import {
  EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  EU_C8_R4_ANCHORAGE_PROFILE_ID,
  EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  EU_C8_R4_FORMULA_FINGERPRINT,
  EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R4_PARAMETERS,
  EU_C8_R4_PARENT_PROFILE_ID,
  EU_C8_R4_REQUIRED_PARAMETER_IDS,
  EU_C8_R4B_ENGINEER_VALIDATED_METHOD_COUNT,
  EU_C8_R4B_IMPLEMENTED_METHOD_COUNT,
  EU_C8_R4B_NUMERICALLY_VALIDATED_METHOD_COUNT,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8BasicAnchorageDiameterDivisor,
} from "./eu-c8";
import {
  EU_C8_BASIC_ANCHORAGE_BOUNDED_CAPABILITY_COMPLETE,
  EU_C8_R4B_BASIC_EQUALS_DESIGN_ANCHORAGE,
  EU_C8_R4B_DESIGN_ANCHORAGE_IMPLEMENTED,
  EU_C8_R4B_DIAMETER_DIVISOR_HARDCODED_OUTSIDE_PROFILE,
  EU_C8_R4B_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD,
  EU_C8_R4B_INTERNAL_FBD_DERIVATION_IMPLEMENTED,
  EU_C8_R4B_METHOD_ID,
  EU_C8_R4B_ZERO_DESIGN_BOND_STRENGTH_ALLOWED,
  EU_C8_R4B_ZERO_DESIGN_STEEL_STRESS_ALLOWED,
  assertEuC8AnchorageOptimizerRejectsUndetermined,
  assertEuC8AnchorageParetoRejectsUndetermined,
  assertEuC8AnchorageResultCurrent,
  evaluateEuC8BasicRequiredAnchorage,
  recheckEuC8BasicRequiredAnchorage,
  type EuC8BasicAnchorageInput,
  type EuC8GovernedBondStrength,
  type EuC8GovernedStress,
} from "./eu-c8/anchorage-evaluate";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";

function toMm(value: number, unit: "mm" | "cm" | "m"): number {
  if (unit === "mm") return value;
  if (unit === "cm") return value * 10;
  return value * 1000;
}

function independentLength(diameterMm: number, stressMPa: number, bondMPa: number, divisor: number): number {
  return (diameterMm / divisor) * (stressMPa / bondMPa);
}

function stress(value: number | null, unit = "MPa", patch: Partial<EuC8GovernedStress> = {}): EuC8GovernedStress {
  return {
    value,
    unit,
    provenanceRef: "sigma-input",
    authority: "PROJECT_DESIGN_STRESS",
    applicability: "tension bar at the supplied section",
    validationState: "EXPLICIT_GOVERNED_INPUT",
    ...patch,
  };
}

function bond(value: number | null, unit = "MPa", patch: Partial<EuC8GovernedBondStrength> = {}): EuC8GovernedBondStrength {
  return {
    ...stress(value, unit),
    provenanceRef: "fbd-input",
    authority: "PROJECT_DESIGN_BOND_STRENGTH",
    applicability: "supplied design bond strength for this bar",
    profileApplicability: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    validationState: "EXPLICIT_GOVERNED_INPUT",
    ...patch,
  };
}

function request(patch: Partial<EuC8BasicAnchorageInput> = {}): EuC8BasicAnchorageInput {
  return {
    profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
    parentProfileId: EU_C8_R4_PARENT_PROFILE_ID,
    profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
    generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
    barId: "bar-1",
    forceState: "TENSION",
    barShape: "STRAIGHT",
    reinforcementType: "DEFORMED_BAR",
    nominalBarDiameter: { value: 16, unit: "mm" },
    designSteelStress: stress(400),
    designBondStrength: bond(2.5),
    ...patch,
  };
}

describe("EOS-D1E-EU-C8-R4B basic required anchorage", () => {
  const divisor = resolveEuC8BasicAnchorageDiameterDivisor();

  it("resolves the profile divisor and reuses the bound rule", () => {
    expect(divisor.ok).toBe(true);
    if (!divisor.ok) return;
    expect(divisor.parameterId).toBe("EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR");
    expect(divisor.value).toBe(EU_C8_R4_PARAMETERS[0]?.value);
    expect(divisor.units).toBe("1");
    expect(divisor.authority).toBe("VALIDATED_ENGINEERING_REFERENCE");
    expect(divisor.sources.length).toBeGreaterThan(0);
    expect(EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
    expect(EU_C8_R4_FORMULA_FINGERPRINT).toBe(formulaFingerprint({
      ruleId: "EU_C8_R4_LB_RQD_BASIC",
      operations: ["divide", "multiply"],
      parameterIds: [...EU_C8_R4_REQUIRED_PARAMETER_IDS],
    }));
    expect(EU_C8_R4B_METHOD_ID).toBe("EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE");
    expect(EU_C8_R4B_DIAMETER_DIVISOR_HARDCODED_OUTSIDE_PROFILE).toBe(false);
    expect(EU_C8_R4B_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD).toBe(false);
    expect(EU_C8_R4B_INTERNAL_FBD_DERIVATION_IMPLEMENTED).toBe(false);
    expect(EU_C8_R4B_DESIGN_ANCHORAGE_IMPLEMENTED).toBe(false);
    expect(EU_C8_R4B_BASIC_EQUALS_DESIGN_ANCHORAGE).toBe(false);
    expect(EU_C8_R4B_ZERO_DESIGN_STEEL_STRESS_ALLOWED).toBe(true);
    expect(EU_C8_R4B_ZERO_DESIGN_BOND_STRENGTH_ALLOWED).toBe(false);
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R4B_IMPLEMENTED_METHOD_COUNT).toBe(1);
    expect(EU_C8_R4B_NUMERICALLY_VALIDATED_METHOD_COUNT).toBe(1);
    expect(EU_C8_R4B_ENGINEER_VALIDATED_METHOD_COUNT).toBe(0);
    expect(EU_C8_BASIC_ANCHORAGE_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
    const source = readFileSync(new URL("./eu-c8/anchorage-evaluate.ts", import.meta.url), "utf8");
    expect(source).not.toContain("/ 4");
    expect(source).not.toContain("2.25");
    expect(source).not.toContain("0.7");
    expect(source).not.toContain("fyd");
    const manifest = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE");
    expect(manifest?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY")?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.MIN_CLEAR_SPACING")?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.BASIC_ANCHORAGE_PROFILE")?.validationState).toBe("NOT_VALIDATED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8")?.status).toBe("NOT_STARTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R5-LAPS-AUTHORITY")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R6-CLOSEOUT")?.status).toBe("NOT_STARTED");
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });

  it("matches an independent reconstruction of the basic length", () => {
    if (!divisor.ok) throw new Error("divisor unresolved");
    const cases = [
      { diameter: 16, unit: "mm" as const, stressValue: 400, bondValue: 2.5 },
      { diameter: 20, unit: "mm" as const, stressValue: 435, bondValue: 3 },
      { diameter: 8, unit: "mm" as const, stressValue: 400, bondValue: 2.5 },
      { diameter: 32, unit: "mm" as const, stressValue: 400, bondValue: 2.5 },
      { diameter: 16, unit: "mm" as const, stressValue: 200, bondValue: 2.5 },
      { diameter: 16, unit: "mm" as const, stressValue: 500, bondValue: 2.5 },
      { diameter: 16, unit: "mm" as const, stressValue: 400, bondValue: 2 },
      { diameter: 16, unit: "mm" as const, stressValue: 400, bondValue: 4 },
      { diameter: 2, unit: "cm" as const, stressValue: 400, bondValue: 2.5 },
      { diameter: 0.016, unit: "m" as const, stressValue: 400, stressUnit: "N/mm2", bondValue: 2.5 },
    ];
    for (const item of cases) {
      const diameterMm = toMm(item.diameter, item.unit);
      const expected = independentLength(diameterMm, item.stressValue, item.bondValue, divisor.value);
      const result = evaluateEuC8BasicRequiredAnchorage(request({
        nominalBarDiameter: { value: item.diameter, unit: item.unit },
        designSteelStress: stress(item.stressValue, item.stressUnit ?? "MPa"),
        designBondStrength: bond(item.bondValue),
      }));
      expect(result.ok).toBe(true);
      expect(result.basicRequiredAnchorageLengthMm).toBe(expected);
      expect(result.basicAnchorageDiameterDivisor).toBe(divisor.value);
      expect(result.fullDesignAnchorageImplemented).toBe(false);
      expect(result.warnings).toContain("BASIC_REQUIRED_LENGTH_ONLY");
      expect(result.checkState).toBeNull();
    }
    const base = evaluateEuC8BasicRequiredAnchorage(request());
    const doubledDiameter = evaluateEuC8BasicRequiredAnchorage(request({ nominalBarDiameter: { value: 32, unit: "mm" } }));
    const doubledStress = evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(800) }));
    expect(doubledDiameter.basicRequiredAnchorageLengthMm).toBe((base.basicRequiredAnchorageLengthMm ?? 0) * 2);
    expect(doubledStress.basicRequiredAnchorageLengthMm).toBe((base.basicRequiredAnchorageLengthMm ?? 0) * 2);
    const again = evaluateEuC8BasicRequiredAnchorage(request());
    expect(again).toEqual(base);
    expect(again.resultFingerprint).toBe(base.resultFingerprint);
  });

  it("checks supplied available length without treating the result as design anchorage", () => {
    if (!divisor.ok) throw new Error("divisor unresolved");
    const required = independentLength(16, 400, 2.5, divisor.value);
    const above = evaluateEuC8BasicRequiredAnchorage(request({
      checkRequested: true,
      availableAnchorageLength: { value: required + 10, unit: "mm" },
      criticalSectionRef: "FACE_A",
    }));
    const equal = evaluateEuC8BasicRequiredAnchorage(request({
      checkRequested: true,
      availableAnchorageLength: { value: required, unit: "mm" },
      criticalSectionRef: "FACE_A",
    }));
    const below = evaluateEuC8BasicRequiredAnchorage(request({
      checkRequested: true,
      availableAnchorageLength: { value: required - 10, unit: "mm" },
      criticalSectionRef: "FACE_A",
    }));
    expect(above.checkState).toBe("SATISFIED");
    expect(above.anchorageUtilization).toBe(required / (required + 10));
    expect(equal.checkState).toBe("SATISFIED");
    expect(equal.anchorageUtilization).toBe(1);
    expect(below.checkState).toBe("NOT_SATISFIED");
    expect(above.warnings).toContain("BASIC_REQUIRED_LENGTH_ONLY");
    const zeroStress = evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(0) }));
    expect(zeroStress.ok).toBe(true);
    expect(zeroStress.basicRequiredAnchorageLengthMm).toBe(0);
    const zeroAvailable = evaluateEuC8BasicRequiredAnchorage(request({
      checkRequested: true,
      designSteelStress: stress(0),
      availableAnchorageLength: { value: 0, unit: "mm" },
      criticalSectionRef: "FACE_A",
    }));
    expect(zeroAvailable.checkState).toBe("SATISFIED");
    expect(zeroAvailable.anchorageUtilization).toBeNull();
    assertEuC8AnchorageResultCurrent(above, request({
      checkRequested: true,
      availableAnchorageLength: { value: required + 10, unit: "mm" },
      criticalSectionRef: "FACE_A",
    }));
    expect(recheckEuC8BasicRequiredAnchorage(request()).basicRequiredAnchorageLengthMm).toBe(required);
    expect(() => assertEuC8AnchorageOptimizerRejectsUndetermined("UNDETERMINED")).toThrow(/undetermined/);
    expect(() => assertEuC8AnchorageParetoRejectsUndetermined("UNDETERMINED")).toThrow(/undetermined/);
    assertEuC8AnchorageOptimizerRejectsUndetermined("NOT_SATISFIED");
  });

  it("fails closed on missing, invalid, and out-of-scope inputs", () => {
    expect(evaluateEuC8BasicRequiredAnchorage(request({ divisorParameterRows: [] })).failReason).toBe("MISSING_PROFILE_DIAMETER_DIVISOR");
    expect(evaluateEuC8BasicRequiredAnchorage(request({
      divisorParameterRows: [{ parameterId: "EU_C8_R4_BASIC_ANCHORAGE_DIAMETER_DIVISOR", value: 0, units: "1" }],
    })).failReason).toBe("INVALID_PROFILE_DIAMETER_DIVISOR");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: null })).failReason).toBe("MISSING_DESIGN_STEEL_STRESS");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: null })).failReason).toBe("MISSING_DESIGN_BOND_STRENGTH");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(400, "MPa", { provenanceRef: "" }) })).failReason).toBe("MISSING_DESIGN_STEEL_STRESS_PROVENANCE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: bond(2.5, "MPa", { provenanceRef: " " }) })).failReason).toBe("MISSING_DESIGN_BOND_STRENGTH_PROVENANCE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: bond(0) })).failReason).toBe("ZERO_DESIGN_BOND_STRENGTH");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: bond(-1) })).failReason).toBe("NEGATIVE_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(-5) })).failReason).toBe("NEGATIVE_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(Number.NaN) })).failReason).toBe("NAN_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designSteelStress: stress(Number.POSITIVE_INFINITY) })).failReason).toBe("INFINITY_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: bond(Number.NaN) })).failReason).toBe("NAN_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ designBondStrength: bond(Number.POSITIVE_INFINITY) })).failReason).toBe("INFINITY_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ nominalBarDiameter: null })).failReason).toBe("MISSING_BAR_DIAMETER");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ nominalBarDiameter: { value: 0, unit: "mm" } })).failReason).toBe("INVALID_BAR_DIAMETER");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ nominalBarDiameter: { value: -8, unit: "mm" } })).failReason).toBe("NEGATIVE_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ barId: "" })).failReason).toBe("MISSING_BAR_ID");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ reinforcementType: "PRESTRESSING_TENDON" })).failReason).toBe("UNSUPPORTED_REINFORCEMENT_TYPE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ barShape: "HOOK" })).failReason).toBe("UNSUPPORTED_BAR_SHAPE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ forceState: "COMPRESSION" })).failReason).toBe("UNSUPPORTED_FORCE_STATE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ deriveBondStrengthRequested: true })).failReason).toBe("BOND_STRENGTH_DERIVATION_NOT_BOUND");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ bondConditionDefaultRequested: true })).failReason).toBe("BOND_CONDITION_NOT_DEFAULTED");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ levelBModifierRequested: true })).failReason).toBe("DESIGN_ANCHORAGE_MODIFIERS_NOT_BOUND");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ substituteFydRequested: true })).failReason).toBe("FYD_NOT_SUBSTITUTED_FOR_SIGMA_SD");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ hookOrBendRequested: true })).failReason).toBe("UNSUPPORTED_BAR_SHAPE");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ bundleRequested: true })).failReason).toBe("BUNDLES_NOT_BOUND");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ prestressRequested: true })).failReason).toBe("PRESTRESS_NOT_BOUND");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ checkRequested: true })).failReason).toBe("MISSING_AVAILABLE_ANCHORAGE_LENGTH");
    expect(evaluateEuC8BasicRequiredAnchorage(request({
      checkRequested: true,
      availableAnchorageLength: { value: 500, unit: "mm" },
    })).failReason).toBe("MISSING_CRITICAL_SECTION");
    expect(evaluateEuC8BasicRequiredAnchorage(request({
      availableAnchorageLength: { value: -1, unit: "mm" },
    })).failReason).toBe("NEGATIVE_INPUT");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ profileId: "OTHER" })).failReason).toBe("PROFILE_MISMATCH");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ generation: "OTHER" })).failReason).toBe("GENERATION_MISMATCH");
    expect(evaluateEuC8BasicRequiredAnchorage(request({ staleProfile: true })).failReason).toBe("STALE_PROFILE");
    expect(evaluateEuC8BasicRequiredAnchorage(request()).checkState).toBeNull();
  });
});
