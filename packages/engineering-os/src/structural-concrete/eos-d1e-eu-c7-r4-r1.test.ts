import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";
import {
  EU_C7_R4_R1_CANDIDATE_METHODS,
  EU_C7_R4_R1_CURVATURE_METHOD_FEASIBILITY,
  EU_C7_R4_R1_DEFLECTION_PROFILE_CREATED,
  EU_C7_R4_R1_FINAL_DISPOSITION,
  EU_C7_R4_R1_NDP_PARAMETER_IDS,
  EU_C7_R4_R1_PHI_EQUALS_C6_PHIEF,
  EU_C7_R4_R1_R2_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA,
  EU_C7_R4_R1_READY_FOR_R2,
  EU_C7_R4_R1_RUNTIME_METHOD_COUNT,
  EU_C7_R4_R1_SELECTED_METHOD_FAMILY,
  EU_C7_R4_R1_SPAN_DEPTH_CONFLICT_STATE,
  resolveEuC7DeflectionProfile,
  resolveEuC7ReferenceProfile,
  selectEuC7DeflectionCoefficient,
  selectEuC7DeflectionMethod,
} from "./eu-c7";

const parent = {
  profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
  generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
};

describe("EOS-D1E-EU-C7-R4-R1 deflection recovery", () => {
  it("keeps deflection unbound after re-reading the workshop extract", () => {
    expect(EU_C7_R4_R1_SPAN_DEPTH_CONFLICT_STATE).toBe("STILL_BLOCKED");
    expect(EU_C7_R4_R1_CURVATURE_METHOD_FEASIBILITY).toBe("NOT_RECOVERED");
    expect(EU_C7_R4_R1_SELECTED_METHOD_FAMILY).toBe("NONE");
    expect(EU_C7_R4_R1_DEFLECTION_PROFILE_CREATED).toBe(false);
    expect(EU_C7_R4_R1_READY_FOR_R2).toBe(false);
    expect(EU_C7_R4_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C7_R4_R1_NDP_PARAMETER_IDS).toEqual([]);
    expect(EU_C7_R4_R1_PHI_EQUALS_C6_PHIEF).toBe(false);
    expect(EU_C7_R4_R1_R2_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA).toBe(false);
    expect(EU_C7_R4_R1_CANDIDATE_METHODS.every((method) => method.requiredParameterIds.length === 0)).toBe(true);
    expect(EU_C7_R4_R1_FINAL_DISPOSITION).toBe("BLOCKED_CURVATURE_INTERPOLATION_AUTHORITY");
  });

  it("fails closed for profile, generation, span-depth, and curvature requests", () => {
    expect(resolveEuC7DeflectionProfile({ ...parent, requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("BLOCKED_CURVATURE_INTERPOLATION_AUTHORITY");
    expect(resolveEuC7DeflectionProfile({ ...parent, requestedMethod: "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL" }).code)
      .toBe("SPAN_DEPTH_STILL_BLOCKED");
    expect(resolveEuC7DeflectionProfile({ ...parent, profileId: "OTHER", requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("PROFILE_MISMATCH");
    expect(resolveEuC7DeflectionProfile({ ...parent, generation: "EN1992-1-1-GEN2", requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("GENERATION_MISMATCH");
    expect(resolveEuC7ReferenceProfile({
      profileId: parent.profileId,
      generation: parent.generation,
      nationalAnnexClaim: false,
      geometry: "RECTANGULAR",
      prestressed: false,
      combinationCategory: "quasi_permanent",
      combinationLimitState: "SLS",
      sectionState: "CRACKED",
      strainCase: "BENDING",
      surface: "HIGH_BOND",
      duration: "LONG_TERM",
      k2Intermediate: null,
      coverMm: 30,
      phiMm: 20,
      widthMm: 300,
      hMm: 500,
      dMm: 450,
      xMm: 180,
      thicknessMm: null,
      AsMm2: 1600,
      fctEffMPa: 2.9,
      ecmMPa: 33000,
      esMPa: 200000,
      sigmaSMpa: 240,
      wMaxMm: 0.3,
      phi: null,
      epsilonCs: null,
      calculateCreep: false,
      calculateShrinkage: false,
      replaceC6Phi: false,
      sourceConflictUnresolved: false,
      stale: false,
      requestedMethod: "DEFLECTION",
    }).code).toBe("DEFLECTION_NOT_BOUND");
    expect(() => selectEuC7DeflectionMethod()).toThrow(/unresolved/);
    expect(() => selectEuC7DeflectionCoefficient()).toThrow(/must not be selected/);
  });

  it("does not embed slenderness coefficients in the recovery record", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c7/deflection-recovery.ts"), "utf8");
    expect(source).not.toMatch(/\b(11|1\.5|3\.2|310|1\.3|0\.4)\b/);
  });
});
