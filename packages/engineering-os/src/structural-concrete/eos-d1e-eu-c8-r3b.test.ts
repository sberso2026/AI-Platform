import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST } from "./capability";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";
import {
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8AbsoluteMinimumClearSpacing,
} from "./eu-c8";
import {
  EU_C8_R2_METHOD_ID,
  EU_C8_R2_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  EU_C8_R3_SPACING_PROFILE_ID,
  EU_C8_R3_SPACING_PROFILE_VERSION,
  EU_C8_R3B_ENGINEER_VALIDATED_METHOD_COUNT,
  EU_C8_R3B_IMPLEMENTED_METHOD_COUNT,
  EU_C8_R3B_NUMERICALLY_VALIDATED_METHOD_COUNT,
  evaluateEuC8CoverAssembly,
} from "./eu-c8";
import {
  EU_C8_R3B_ACTUAL_BAR_DIAMETER_SUBSTITUTED,
  EU_C8_R3B_BAR_DIAMETER_SCOPE,
  EU_C8_R3B_DUPLICATE_CLEARANCE_FORMULA_CREATED,
  EU_C8_R3B_MEASURED_CLEAR_SPACING_ROUTE,
  EU_C8_R3B_METHOD_ID,
  EU_C8_R3B_OVERLAPPING_BAR_SEMANTICS,
  EU_C8_R3B_TOUCHING_BAR_SEMANTICS,
  EU_C8_R3B_UNLIKE_DIAMETER_BARS_SUPPORTED,
  EU_C8_SPACING_BOUNDED_CAPABILITY_COMPLETE,
  assertEuC8SpacingOptimizerRejectsUndetermined,
  assertEuC8SpacingParetoRejectsUndetermined,
  assertEuC8SpacingResultCurrent,
  evaluateEuC8MinClearSpacing,
  type EuC8MinClearSpacingInput,
} from "./eu-c8/spacing-evaluate";
import { barPairClearSpacingMm } from "./section-mechanics/bars";

function toMm(value: number, unit: "mm" | "cm" | "m"): number {
  if (unit === "mm") return value;
  if (unit === "cm") return value * 10;
  return value * 1000;
}

function independentClear(ax: number, ay: number, bx: number, by: number, diameter: number): number {
  return Math.hypot(ax - bx, ay - by) - diameter / 2 - diameter / 2;
}

function independentRequired(coefficient: number, diameter: number, aggregate: number, allowance: number, absolute: number) {
  const bar = coefficient * diameter;
  const aggregateTerm = aggregate + allowance;
  const required = Math.max(bar, aggregateTerm, absolute);
  const components = [
    bar === required ? "BAR_DIAMETER" : null,
    aggregateTerm === required ? "AGGREGATE" : null,
    absolute === required ? "ABSOLUTE_MINIMUM" : null,
  ].filter((item) => item != null);
  return {
    bar,
    aggregateTerm,
    required,
    component: components.length === 1 ? components[0] : "MULTIPLE",
    components,
  };
}

function qty(value: number | null, unit: "mm" | "cm" | "m" | "inch" = "mm") {
  return { value, unit };
}

function request(patch: Partial<EuC8MinClearSpacingInput> = {}): EuC8MinClearSpacingInput {
  return {
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    profileVersion: EU_C8_R3_SPACING_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    barIdA: "bar-a",
    barIdB: "bar-b",
    spacingContext: "HORIZONTAL_ADJACENT",
    reinforcementType: "INDIVIDUAL_DEFORMED_BAR",
    nominalBarDiameter: qty(16),
    barA: { x: qty(0), y: qty(0), diameter: qty(16) },
    barB: { x: qty(100), y: qty(0), diameter: qty(16) },
    maximumAggregateSize: qty(20),
    barDiameterCoefficient: 1,
    aggregateAllowance: qty(5),
    barProvenanceRef: "bar-input",
    aggregateProvenanceRef: "aggregate-input",
    barDiameterCoefficientProvenanceRef: "k-input",
    aggregateAllowanceProvenanceRef: "allowance-input",
    ...patch,
  };
}

describe("EOS-D1E-EU-C8-R3B minimum clear spacing", () => {
  const absolute = resolveEuC8AbsoluteMinimumClearSpacing();

  it("reuses the spacing profile and D1E pair clearance", () => {
    expect(absolute.ok).toBe(true);
    expect(EU_C8_R3B_METHOD_ID).toBe("EU_RC_MIN_CLEAR_SPACING_EN1992_REFERENCE");
    expect(EU_C8_R3_SPACING_PROFILE_ID).toBe("EU-EN1992-1-1-GEN1-C8-SPACING-REFERENCE");
    expect(EU_C8_R3_SPACING_PROFILE_VERSION).toBe("c8-r3-spacing-1");
    expect(EU_C8_R3B_BAR_DIAMETER_SCOPE).toBe("EQUAL_DIAMETER_ADJACENT_BARS_ONLY");
    expect(EU_C8_R3B_UNLIKE_DIAMETER_BARS_SUPPORTED).toBe(false);
    expect(EU_C8_R3B_ACTUAL_BAR_DIAMETER_SUBSTITUTED).toBe(false);
    expect(EU_C8_R3B_DUPLICATE_CLEARANCE_FORMULA_CREATED).toBe(false);
    expect(EU_C8_R3B_MEASURED_CLEAR_SPACING_ROUTE).toBe("barPairClearSpacingMm");
    const source = readFileSync(new URL("./eu-c8/spacing-evaluate.ts", import.meta.url), "utf8");
    expect(source).toContain("barPairClearSpacingMm");
    expect(source).not.toContain("Math.hypot");
    if (absolute.ok) expect(source).not.toContain(String(absolute.value));
    const bars = readFileSync(new URL("./section-mechanics/bars.ts", import.meta.url), "utf8");
    expect(bars).toContain("barPairClearSpacingMm");
    expect(EU_C8_R3B_IMPLEMENTED_METHOD_COUNT).toBe(EU_C8_R3B_NUMERICALLY_VALIDATED_METHOD_COUNT);
    expect(EU_C8_R3B_ENGINEER_VALIDATED_METHOD_COUNT).toBe(0);
    expect(EU_C8_SPACING_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
  });

  it("matches independent component algebra", () => {
    if (!absolute.ok) throw new Error("absolute minimum missing");
    const floor = absolute.value;
    const cases = [
      { name: "bar diameter governs", coefficient: 1, diameter: 32, aggregate: 10, allowance: 5, ax: 0, bx: 200 },
      { name: "aggregate term governs", coefficient: 1, diameter: 16, aggregate: 40, allowance: 5, ax: 0, bx: 200 },
      { name: "absolute minimum governs", coefficient: 1, diameter: 12, aggregate: 8, allowance: 5, ax: 0, bx: 200 },
      { name: "two-component tie", coefficient: 1, diameter: 25, aggregate: 20, allowance: 5, ax: 0, bx: 200 },
      { name: "three-component tie", coefficient: 1, diameter: floor, aggregate: floor, allowance: 0, ax: 0, bx: 200 },
      { name: "measured above minimum", coefficient: 1, diameter: 16, aggregate: 10, allowance: 0, ax: 0, bx: 100 },
      { name: "measured exactly minimum", coefficient: 1, diameter: 16, aggregate: 0, allowance: 0, ax: 0, bx: floor + 16 },
      { name: "measured below minimum", coefficient: 1, diameter: 16, aggregate: 0, allowance: 0, ax: 0, bx: 16 + floor / 2 },
      { name: "large aggregate", coefficient: 1, diameter: 12, aggregate: 50, allowance: 10, ax: 0, bx: 200 },
      { name: "small aggregate", coefficient: 1, diameter: 12, aggregate: 0, allowance: 0, ax: 0, bx: 200 },
      { name: "explicit zero coefficient", coefficient: 0, diameter: 16, aggregate: 0, allowance: 0, ax: 0, bx: 200 },
    ];
    for (const item of cases) {
      const expected = independentRequired(item.coefficient, item.diameter, item.aggregate, item.allowance, floor);
      const measured = independentClear(item.ax, 0, item.bx, 0, item.diameter);
      const result = evaluateEuC8MinClearSpacing(request({
        nominalBarDiameter: qty(item.diameter),
        barA: { x: qty(item.ax), y: qty(0), diameter: qty(item.diameter) },
        barB: { x: qty(item.bx), y: qty(0), diameter: qty(item.diameter) },
        maximumAggregateSize: qty(item.aggregate),
        aggregateAllowance: qty(item.allowance),
        barDiameterCoefficient: item.coefficient,
      }));
      expect(result.ok, item.name).toBe(true);
      expect(result.barDiameterRequirementMm, item.name).toBe(expected.bar);
      expect(result.aggregateRequirementMm, item.name).toBe(expected.aggregateTerm);
      expect(result.absoluteMinimumClearSpacingMm, item.name).toBe(floor);
      expect(result.requiredClearSpacingMm, item.name).toBe(expected.required);
      expect(result.governingRequirementComponent, item.name).toBe(expected.component);
      expect(result.governingRequirementComponents, item.name).toEqual(expected.components);
      expect(result.measuredClearSpacingMm, item.name).toBe(measured);
      expect(result.measuredClearSpacingMm, item.name).toBe(barPairClearSpacingMm(
        { xMm: item.ax, yMm: 0, diameterMm: item.diameter },
        { xMm: item.bx, yMm: 0, diameterMm: item.diameter },
      ));
      expect(result.checkState, item.name).toBe(measured >= expected.required ? "SATISFIED" : "NOT_SATISFIED");
      if (measured > 0) expect(result.spacingUtilization, item.name).toBe(expected.required / measured);
    }

    const horizontal = evaluateEuC8MinClearSpacing(request({ spacingContext: "HORIZONTAL_ADJACENT", barB: { x: qty(0), y: qty(80), diameter: qty(16) } }));
    const vertical = evaluateEuC8MinClearSpacing(request({ spacingContext: "VERTICAL_LAYER_ADJACENT", barB: { x: qty(0), y: qty(80), diameter: qty(16) } }));
    expect(horizontal.ok && vertical.ok).toBe(true);
    expect(horizontal.measuredClearSpacingMm).toBe(vertical.measuredClearSpacingMm);
    expect(horizontal.spacingContext).toBe("HORIZONTAL_ADJACENT");
    expect(vertical.spacingContext).toBe("VERTICAL_LAYER_ADJACENT");
    expect(evaluateEuC8MinClearSpacing(request({ spacingContext: "DIAGONAL" })).failReason).toBe("UNSUPPORTED_SPACING_CONTEXT");

    const converted = evaluateEuC8MinClearSpacing(request({
      nominalBarDiameter: qty(1.6, "cm"),
      barA: { x: qty(0, "m"), y: qty(0, "mm"), diameter: qty(1.6, "cm") },
      barB: { x: qty(0.1, "m"), y: qty(0, "mm"), diameter: qty(16, "mm") },
      maximumAggregateSize: qty(2, "cm"),
      aggregateAllowance: qty(0.5, "cm"),
    }));
    const diameter = toMm(1.6, "cm");
    const centre = toMm(0.1, "m");
    const expected = independentRequired(1, diameter, toMm(2, "cm"), toMm(0.5, "cm"), floor);
    expect(converted.ok).toBe(true);
    expect(converted.nominalBarDiameterMm).toBe(diameter);
    expect(converted.requiredClearSpacingMm).toBe(expected.required);
    expect(converted.measuredClearSpacingMm).toBe(independentClear(0, 0, centre, 0, diameter));
  });

  it("fails closed and keeps touching distinct from overlap", () => {
    if (!absolute.ok) throw new Error("absolute minimum missing");
    const touching = evaluateEuC8MinClearSpacing(request({
      barB: { x: qty(16), y: qty(0), diameter: qty(16) },
      maximumAggregateSize: qty(0),
      aggregateAllowance: qty(0),
    }));
    expect(touching.ok).toBe(true);
    expect(touching.measuredClearSpacingMm).toBe(0);
    expect(touching.checkState).toBe("NOT_SATISFIED");
    expect(touching.spacingUtilization).toBeNull();
    expect(EU_C8_R3B_TOUCHING_BAR_SEMANTICS).toBe("MEASURED_ZERO_IS_VALID_GEOMETRY_AND_NOT_SATISFIED");

    const overlap = evaluateEuC8MinClearSpacing(request({ barB: { x: qty(8), y: qty(0), diameter: qty(16) } }));
    expect(overlap.ok).toBe(false);
    expect(overlap.failReason).toBe("INVALID_OVERLAPPING_BARS");
    expect(overlap.checkState).toBe("UNDETERMINED");
    expect(EU_C8_R3B_OVERLAPPING_BAR_SEMANTICS).toBe("INVALID_INTERSECTING_GEOMETRY_FAIL_CLOSED");

    const failures: Array<[string, Partial<EuC8MinClearSpacingInput>]> = [
      ["MISSING_PROFILE", { profileId: null }],
      ["PROFILE_MISMATCH", { profileId: "OTHER" }],
      ["SPACING_PROFILE_MISMATCH", { spacingProfileId: EU_C8_R1_REFERENCE_PROFILE_ID }],
      ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
      ["STALE_PROFILE", { stale: true }],
      ["STALE_PROFILE", { profileVersion: "c8-r3-spacing-0" }],
      ["MISSING_BAR_A", { barIdA: " " }],
      ["MISSING_BAR_B", { barIdB: null }],
      ["SAME_BAR_IDENTITY", { barIdB: "bar-a" }],
      ["UNSUPPORTED_REINFORCEMENT_TYPE", { reinforcementType: "MESH" }],
      ["UNEQUAL_BAR_DIAMETERS", { barB: { x: qty(100), y: qty(0), diameter: qty(20) } }],
      ["MISSING_BAR_DIAMETER", { nominalBarDiameter: null }],
      ["INVALID_BAR_DIAMETER", { nominalBarDiameter: qty(0), barA: { x: qty(0), y: qty(0), diameter: qty(0) }, barB: { x: qty(100), y: qty(0), diameter: qty(0) } }],
      ["NEGATIVE_INPUT", { nominalBarDiameter: qty(-1) }],
      ["MISSING_AGGREGATE_SIZE", { maximumAggregateSize: null }],
      ["NEGATIVE_INPUT", { maximumAggregateSize: qty(-1) }],
      ["MISSING_NDP_BAR_DIAMETER_COEFFICIENT", { barDiameterCoefficient: null }],
      ["MISSING_NDP_AGGREGATE_ALLOWANCE", { aggregateAllowance: null }],
      ["NAN_INPUT", { barDiameterCoefficient: Number.NaN }],
      ["INFINITY_INPUT", { barDiameterCoefficient: Number.POSITIVE_INFINITY }],
      ["INVALID_UNITS", { nominalBarDiameter: qty(16, "inch") }],
      ["INVALID_GEOMETRY", { barA: null }],
      ["STALE_GEOMETRY", { staleGeometry: true }],
      ["UNSUPPORTED_BUNDLE", { bundleRequested: true }],
      ["UNSUPPORTED_MESH", { meshRequested: true }],
      ["UNSUPPORTED_PRESTRESS", { prestressRequested: true }],
      ["UNSUPPORTED_SPACING_CONTEXT", { spacingContext: null }],
      ["PROJECT_SPACING_OVERLAY_NOT_BOUND", { projectSpacingOverlayRequested: true }],
      ["C7_CRACK_CONTROL_SPACING_NOT_C8", { crackControlSpacingRequested: true }],
      ["C7_BAR_DIAMETER_LIMIT_NOT_C8", { barDiameterLimitRequested: true }],
      ["AUTOMATIC_BAR_REPOSITIONING_NOT_IMPLEMENTED", { repositionBars: true }],
      ["MISSING_PROFILE_ABSOLUTE_MINIMUM_SPACING", { absoluteParameterRows: [] }],
    ];
    for (const [reason, patch] of failures) {
      const result = evaluateEuC8MinClearSpacing(request(patch));
      expect(result.ok, reason).toBe(false);
      expect(result.failReason, reason).toBe(reason);
      expect(result.checkState, reason).toBe("UNDETERMINED");
      expect(result.requiredClearSpacingMm, reason).toBeNull();
    }
    expect(evaluateEuC8MinClearSpacing(request({
      barDiameterCoefficient: 0,
      maximumAggregateSize: qty(0),
      aggregateAllowance: qty(0),
    })).ok).toBe(true);
  });

  it("repeats, invalidates, and preserves cover", () => {
    const first = evaluateEuC8MinClearSpacing(request());
    const again = evaluateEuC8MinClearSpacing(request());
    expect(first.resultFingerprint).toBe(again.resultFingerprint);
    expect(first.geometryFingerprint).toBeTruthy();
    expect(first.materialFingerprint).toBeTruthy();
    expect(first.profileFingerprint?.startsWith("fp:")).toBe(true);
    expect(first.provenance.sourceIds).toEqual(["JRC_ARRIETA_BRUSSELS_2011_DETAILING"]);
    expect(() => assertEuC8SpacingResultCurrent(first, request())).not.toThrow();
    expect(() => assertEuC8SpacingResultCurrent(first, request({ barDiameterCoefficient: 1.2 }))).toThrow(/stale/);
    expect(() => assertEuC8SpacingOptimizerRejectsUndetermined("UNDETERMINED")).toThrow(/rejected/);
    expect(() => assertEuC8SpacingOptimizerRejectsUndetermined("SATISFIED")).not.toThrow();
    expect(() => assertEuC8SpacingParetoRejectsUndetermined("UNDETERMINED")).toThrow(/rejected/);
    expect(() => assertEuC8SpacingParetoRejectsUndetermined("NOT_SATISFIED")).not.toThrow();
    expect(NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    const cover = evaluateEuC8CoverAssembly({
      profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
      profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
      generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
      bondCover: { value: 40, unit: "mm" },
      durabilityCover: { value: 25, unit: "mm" },
      deviationAllowance: { value: 10, unit: "mm" },
      bondProvenanceRef: "bond-input",
      durabilityProvenanceRef: "durability-input",
      deviationProvenanceRef: "deviation-input",
    });
    expect(cover.ok).toBe(true);
    expect(cover.minimumCoverMm).toBe(40);
    expect(EU_C8_R2_METHOD_ID).toBe("EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    const manifest = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.MIN_CLEAR_SPACING");
    expect(manifest?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(manifest?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(manifest?.conformanceState).toBe("INTENDED_PROFILE");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY")?.validationState).toBe("NUMERICALLY_VALIDATED");
  });
});
