import { describe, expect, it } from "vitest";
import {
  EU_C6_R1_REFERENCE_PROFILE_GENERATION,
  EU_C6_R1_REFERENCE_PROFILE_ID,
  EU_C6_R1_RUNTIME_METHOD_COUNT,
  NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED,
} from "@rtb/types";
import {
  EU_C6_R1_PARAMETERS,
  EU_C6_R1_RULES,
  resolveEuC6ReferenceProfile,
  validateEuC6ProfilePack,
  type EuC6ProfileResolutionInput,
} from "./eu-c6/profile-binding";

function boundInput(overrides: Partial<EuC6ProfileResolutionInput> = {}): EuC6ProfileResolutionInput {
  return {
    profileId: EU_C6_R1_REFERENCE_PROFILE_ID,
    generation: EU_C6_R1_REFERENCE_PROFILE_GENERATION,
    nationalAnnexClaim: false,
    geometry: "RECTANGULAR",
    bending: "UNIAXIAL",
    l0Mm: 4000,
    c: 10,
    phiEf: 1.2,
    M01Nmm: 10e6,
    M02Nmm: 20e6,
    NEdCompressionN: 1500e3,
    AcMm2: 300 * 400,
    IMm4: (300 * 400 ** 3) / 12,
    dMm: 360,
    AsMm2: 1600,
    fcdMPa: 16.7,
    fckMPa: 30,
    fydMPa: 435,
    EsMPa: 200000,
    sourceConflictUnresolved: false,
    stale: false,
    ...overrides,
  };
}

describe("EOS-D1E-EU-C6-R1 nominal curvature profile", () => {
  it("binds a complete input and keeps the runtime method absent", () => {
    expect(resolveEuC6ReferenceProfile(boundInput())).toEqual({ accepted: true, code: "PROFILE_BOUND" });
    expect(validateEuC6ProfilePack().status).toBe("PASS");
    expect(NEW_C6_SECOND_ORDER_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C6_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(EU_C6_R1_RULES.every((rule) => rule.formulaFingerprint.startsWith("fp:"))).toBe(true);
    expect(EU_C6_R1_PARAMETERS.find((parameter) => parameter.parameterId === "EsMPa")?.value).toBeNull();
    expect(EU_C6_R1_PARAMETERS.find((parameter) => parameter.parameterId === "phiEf")?.value).toBeNull();
    expect(EU_C6_R1_PARAMETERS.find((parameter) => parameter.parameterId === "c")?.value).toBeNull();
  });

  it.each([
    ["MISSING_EFFECTIVE_LENGTH", { l0Mm: null }],
    ["MISSING_CREEP", { phiEf: null }],
    ["MISSING_CURVATURE_FACTOR", { c: null }],
    ["INVALID_CURVATURE_FACTOR", { c: 7 }],
    ["MISSING_END_MOMENTS", { M02Nmm: 0 }],
    ["END_MOMENT_ORDER", { M01Nmm: 30e6, M02Nmm: 20e6 }],
    ["UNSUPPORTED_GEOMETRY", { geometry: "CIRCULAR" }],
    ["UNSUPPORTED_ACTION", { bending: "BIAXIAL" }],
    ["UNSUPPORTED_AXIAL", { NEdCompressionN: -1 }],
    ["MISSING_REINFORCEMENT_MODULUS", { EsMPa: null }],
    ["FALSE_NATIONAL_PROFILE", { nationalAnnexClaim: true }],
    ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
    ["PROFILE_MISMATCH", { profileId: "OTHER" }],
    ["SOURCE_CONFLICT", { sourceConflictUnresolved: true }],
    ["STALE_PROFILE", { stale: true }],
  ] as const)("rejects %s", (code, overrides) => {
    expect(resolveEuC6ReferenceProfile(boundInput(overrides)).code).toBe(code);
  });
});
