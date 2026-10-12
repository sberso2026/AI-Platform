import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";
import {
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8UnboundSubPack,
} from "./eu-c8";
import { EU_C8_R2_METHOD_ID, evaluateEuC8CoverAssembly } from "./eu-c8";
import {
  AI_AGGREGATE_SIZE_AUTHORITY,
  AI_BAR_DIAMETER_AUTHORITY,
  AI_SPACING_OVERRIDE_AUTHORITY,
  EU_C8_R3_ABSOLUTE_MINIMUM_CLEAR_SPACING_MM,
  EU_C8_R3_C7_CRACK_CONTROL_SPACING_EQUALS_C8_MIN_CLEAR_SPACING,
  EU_C8_R3_CLEAR_SPACING_MEASUREMENT,
  EU_C8_R3_FINAL_DISPOSITION,
  EU_C8_R3_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R3_FUTURE_CHECK_STATES,
  EU_C8_R3_MIN_CLEAR_SPACING_RULE_CHAIN_COMPLETE,
  EU_C8_R3_NDP_PARAMETER_IDS,
  EU_C8_R3_PARAMETERS,
  EU_C8_R3_READY_FOR_IMPLEMENTATION,
  EU_C8_R3_RECOMMENDED_COEFFICIENTS_APPLIED,
  EU_C8_R3_RUNTIME_METHOD_COUNT,
  EU_C8_R3_SMIN_FORMULA_FINGERPRINT,
  EU_C8_R3_SPACING_PROFILE_ID,
  EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX,
  EU_C8_R3_SPACING_PROFILE_VERSION,
  assertEuC8R3DoesNotImplementSpacingRuntime,
  resolveEuC8AbsoluteMinimumClearSpacing,
  resolveEuC8SpacingProfile,
  type EuC8SpacingProfileRequest,
} from "./eu-c8";
import { EU_C8_R1_REFERENCE_PROFILE_VERSION } from "./eu-c8";

function request(patch: Partial<EuC8SpacingProfileRequest> = {}): EuC8SpacingProfileRequest {
  return {
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    spacingProfileId: EU_C8_R3_SPACING_PROFILE_ID,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C8_R3_SPACING_PROFILE_VERSION,
    nominalBarDiameterMm: 16,
    comparedBarDiameterMm: 16,
    maximumAggregateSizeMm: 20,
    barDiameterCoefficient: 1,
    aggregateAllowanceMm: 5,
    ...patch,
  };
}

describe("EOS-D1E-EU-C8-R3 spacing authority", () => {
  it("binds the clear-spacing maximum without calculating it", () => {
    expect(EU_C8_R3_MIN_CLEAR_SPACING_RULE_CHAIN_COMPLETE).toBe(true);
    expect(EU_C8_R3_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
    expect(EU_C8_R3_SMIN_FORMULA_FINGERPRINT).toMatch(/^fp:[0-9a-f]{8}$/);
    expect(EU_C8_R3_READY_FOR_IMPLEMENTATION).toBe(true);
    expect(EU_C8_R3_FINAL_DISPOSITION).toBe("PROFILE_BOUND_SPACING_REFERENCE_READY");
    expect(EU_C8_R3_CLEAR_SPACING_MEASUREMENT).toBe("SURFACE_TO_SURFACE");
    expect(EU_C8_R3_SPACING_PROFILE_IS_NATIONAL_ANNEX).toBe(false);
    expect(EU_C8_R3_RECOMMENDED_COEFFICIENTS_APPLIED).toBe(false);
    expect(EU_C8_R3_NDP_PARAMETER_IDS).toEqual(["barDiameterCoefficient", "aggregateAllowanceMm"]);
    expect(EU_C8_R3_PARAMETERS.find((row) => row.parameterId === "barDiameterCoefficient")?.value).toBeNull();
    expect(EU_C8_R3_PARAMETERS.find((row) => row.parameterId === "aggregateAllowanceMm")?.value).toBeNull();
    const absolute = resolveEuC8AbsoluteMinimumClearSpacing();
    expect(absolute).toEqual({ ok: true, value: EU_C8_R3_ABSOLUTE_MINIMUM_CLEAR_SPACING_MM, units: "mm" });
    expect(resolveEuC8AbsoluteMinimumClearSpacing([])).toEqual({ ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM_SPACING" });

    const bound = resolveEuC8SpacingProfile(request());
    expect(bound.ok).toBe(true);
    if (bound.ok) {
      expect(bound.runtimeMethodImplemented).toBe(false);
      expect(bound.calculatedSpacingMm).toBeNull();
      expect(bound.absoluteMinimumClearSpacingMm).toBe(absolute.ok ? absolute.value : null);
      expect(bound.profileId).toBe(EU_C8_R1_REFERENCE_PROFILE_ID);
    }
    expect(EU_C8_R3_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(() => assertEuC8R3DoesNotImplementSpacingRuntime()).not.toThrow();
    const source = readFileSync(new URL("./eu-c8/spacing-profile.ts", import.meta.url), "utf8");
    expect(source).not.toContain("Math.max");
    const bars = readFileSync(new URL("./section-mechanics/bars.ts", import.meta.url), "utf8");
    expect(bars).toContain("Math.hypot");
    expect(bars).toContain("minBarClearSpacingMm");
  });

  it("fails closed and does not insert recommended coefficients", () => {
    const failures: Array<[string, Partial<EuC8SpacingProfileRequest>]> = [
      ["MISSING_PROFILE", { profileId: null }],
      ["PROFILE_MISMATCH", { profileId: "OTHER" }],
      ["SPACING_PROFILE_MISMATCH", { spacingProfileId: EU_C8_R1_REFERENCE_PROFILE_ID }],
      ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
      ["STALE_PROFILE", { stale: true }],
      ["MISSING_BAR_DIAMETER", { nominalBarDiameterMm: null }],
      ["INVALID_BAR_DIAMETER", { nominalBarDiameterMm: Number.NaN }],
      ["UNEQUAL_BAR_DIAMETERS", { comparedBarDiameterMm: 20 }],
      ["MISSING_AGGREGATE_SIZE", { maximumAggregateSizeMm: null }],
      ["INVALID_AGGREGATE_SIZE", { maximumAggregateSizeMm: -1 }],
      ["MISSING_NDP_BAR_DIAMETER_COEFFICIENT", { barDiameterCoefficient: null }],
      ["MISSING_NDP_AGGREGATE_ALLOWANCE", { aggregateAllowanceMm: null }],
      ["INVALID_AGGREGATE_ALLOWANCE", { aggregateAllowanceMm: Number.POSITIVE_INFINITY }],
      ["UNSUPPORTED_BUNDLE", { bundleRequested: true }],
      ["UNSUPPORTED_SCOPE", { prestressRequested: true }],
      ["UNSUPPORTED_DISTINCT_LAYER_RULE", { distinctLayerRuleRequested: true }],
      ["PROJECT_SPACING_OVERRIDE_NOT_BOUND", { projectSpacingOverrideRequested: true }],
      ["SOURCE_CONFLICT", { sourceConflictUnresolved: true }],
      ["NATIONAL_ANNEX_NOT_REFERENCE_PROFILE", { nationalAnnexClaim: true }],
    ];
    for (const [reason, patch] of failures) {
      const result = resolveEuC8SpacingProfile(request(patch));
      expect(result.ok, reason).toBe(false);
      if (!result.ok) expect(result.reason, reason).toBe(reason);
      expect(result.calculatedSpacingMm, reason).toBeNull();
      expect(result.runtimeMethodImplemented, reason).toBe(false);
    }
  });

  it("preserves cover assembly, C7 crack spacing, and the deferred detailing runtime", () => {
    expect(EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE).toBe(false);
    expect(resolveEuC8UnboundSubPack("SPACING")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(resolveEuC8UnboundSubPack("ANCHORAGE")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(resolveEuC8UnboundSubPack("LAP")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R3_C7_CRACK_CONTROL_SPACING_EQUALS_C8_MIN_CLEAR_SPACING).toBe(false);
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY")?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(EU_C8_R2_METHOD_ID).toBe("EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE");
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
    expect(cover.nominalCoverMm).toBe(50);
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(AI_AGGREGATE_SIZE_AUTHORITY).toBe(false);
    expect(AI_BAR_DIAMETER_AUTHORITY).toBe(false);
    expect(AI_SPACING_OVERRIDE_AUTHORITY).toBe(false);
    expect(EU_C8_R3_FUTURE_CHECK_STATES).toEqual(["SATISFIED", "NOT_SATISFIED", "UNDETERMINED"]);
    const manifest = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.SPACING_PROFILE");
    expect(manifest?.validationState).toBe("NOT_VALIDATED");
    expect(manifest?.implementationState).toBe("PROFILE_BOUND_REFERENCE");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8")?.status).toBe("NOT_STARTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R3-SPACING-AUTHORITY")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R3B-SPACING-IMPLEMENTATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R4-ANCHORAGE-AUTHORITY")?.status).toBe("NOT_STARTED");
  });
});
