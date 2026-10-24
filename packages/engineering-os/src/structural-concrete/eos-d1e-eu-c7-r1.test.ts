import { describe, expect, it } from "vitest";
import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R1_RUNTIME_METHOD_COUNT,
  NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";
import {
  EU_C7_R1_NDP_PARAMETER_IDS,
  EU_C7_R1_PARAMETERS,
  EU_C7_R1_RULES,
  EU_C7_R1_SOURCE_CONFLICTS,
  resolveEuC7ReferenceProfile,
  validateEuC7ProfilePack,
  type EuC7ProfileResolutionInput,
} from "./eu-c7/profile-binding";

function boundInput(overrides: Partial<EuC7ProfileResolutionInput> = {}): EuC7ProfileResolutionInput {
  return {
    requestedMethod: "CRACK_WIDTH",
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    nationalAnnexClaim: false,
    geometry: "RECTANGULAR",
    prestressed: false,
    combinationCategory: "quasi_permanent",
    combinationLimitState: "SLS",
    sectionState: "CRACKED",
    strainCase: "BENDING",
    k2Intermediate: null,
    surface: "HIGH_BOND",
    duration: "LONG_TERM",
    coverMm: 30,
    phiMm: 16,
    AsMm2: 1200,
    widthMm: 300,
    hMm: 500,
    dMm: 450,
    xMm: 180,
    thicknessMm: null,
    fctEffMPa: 2.9,
    ecmMPa: 33000,
    esMPa: 200000,
    sigmaSMpa: 220,
    wMaxMm: 0.3,
    phi: null,
    epsilonCs: null,
    calculateCreep: false,
    calculateShrinkage: false,
    replaceC6Phi: false,
    sourceConflictUnresolved: false,
    stale: false,
    ...overrides,
  };
}

describe("EOS-D1E-EU-C7-R1 serviceability profile", () => {
  it("binds crack width inputs and keeps runtime methods absent", () => {
    expect(resolveEuC7ReferenceProfile(boundInput())).toEqual({ accepted: true, code: "PROFILE_BOUND" });
    expect(validateEuC7ProfilePack().status).toBe("PASS");
    expect(validateEuC7ProfilePack().unprovenanced).toBe(0);
    expect(NEW_C7_CRACK_WIDTH_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C7_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(EU_C7_R1_NDP_PARAMETER_IDS).toEqual([]);
    expect(EU_C7_R1_RULES.every((item) => item.formulaFingerprint.startsWith("fp:"))).toBe(true);
    expect(EU_C7_R1_PARAMETERS.find((item) => item.parameterId === "wMaxMm")?.value).toBeNull();
    expect(EU_C7_R1_PARAMETERS.find((item) => item.parameterId === "phi")?.value).toBeNull();
    expect(EU_C7_R1_PARAMETERS.find((item) => item.parameterId === "fctEffMPa")?.value).toBeNull();
    expect(EU_C7_R1_SOURCE_CONFLICTS.map((item) => item.resolution)).not.toContain("AVERAGED");
  });

  it("accepts explicit creep and shrinkage without calculating them", () => {
    expect(resolveEuC7ReferenceProfile(boundInput({ requestedMethod: "EXPLICIT_CREEP", phi: 1.8 })).code).toBe("PROFILE_BOUND");
    expect(resolveEuC7ReferenceProfile(boundInput({ requestedMethod: "EXPLICIT_SHRINKAGE", epsilonCs: -0.0003 })).code).toBe("PROFILE_BOUND");
  });

  it.each([
    ["ULS_COMBINATION_REJECTED", { combinationCategory: "uls", combinationLimitState: "ULS" }],
    ["UNSUPPORTED_COMBINATION", { combinationCategory: "frequent" }],
    ["MISSING_SERVICE_COMBINATION", { combinationCategory: null }],
    ["UNCRACKED_NOT_APPLICABLE", { sectionState: "UNCRACKED" as const }],
    ["MISSING_TENSILE_STRENGTH", { fctEffMPa: null }],
    ["MISSING_CONCRETE_MODULUS", { ecmMPa: null }],
    ["MISSING_REINFORCEMENT_MODULUS", { esMPa: null }],
    ["MISSING_COVER", { coverMm: null }],
    ["MISSING_DURATION", { duration: null }],
    ["MISSING_STEEL_STRESS", { sigmaSMpa: null }],
    ["MISSING_CRACK_LIMIT", { wMaxMm: null }],
    ["MISSING_SECTION", { xMm: null }],
    ["INTERMEDIATE_K2_MISSING", { strainCase: "INTERMEDIATE" as const, k2Intermediate: null }],
    ["UNSUPPORTED_GEOMETRY", { geometry: "CIRCULAR" }],
    ["PRESTRESS_OUT_OF_SCOPE", { prestressed: true }],
    ["FALSE_NATIONAL_PROFILE", { nationalAnnexClaim: true }],
    ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
    ["PROFILE_MISMATCH", { profileId: "OTHER" }],
    ["SOURCE_CONFLICT", { sourceConflictUnresolved: true }],
    ["STALE_PROFILE", { stale: true }],
    ["DEFLECTION_NOT_BOUND", { requestedMethod: "DEFLECTION" as const }],
    ["CALCULATED_CREEP_NOT_BOUND", { requestedMethod: "EXPLICIT_CREEP" as const, calculateCreep: true, phi: 1 }],
    ["MISSING_CREEP", { requestedMethod: "EXPLICIT_CREEP" as const, phi: null }],
    ["CALCULATED_SHRINKAGE_NOT_BOUND", { requestedMethod: "EXPLICIT_SHRINKAGE" as const, calculateShrinkage: true, epsilonCs: 0 }],
    ["MISSING_SHRINKAGE", { requestedMethod: "EXPLICIT_SHRINKAGE" as const, epsilonCs: null }],
    ["C6_REPLACEMENT_FORBIDDEN", { replaceC6Phi: true }],
    ["MISSING_STEEL_STRESS", { sigmaSMpa: Number.NaN }],
  ] as const)("rejects %s", (code, overrides) => {
    expect(resolveEuC7ReferenceProfile(boundInput(overrides)).code).toBe(code);
  });
});
