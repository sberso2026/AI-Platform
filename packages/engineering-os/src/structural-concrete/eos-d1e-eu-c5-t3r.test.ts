import { describe, expect, it } from "vitest";
import {
  D1C_TORSIONAL_ACTION_ID,
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_T3R_FINAL_DISPOSITION,
  EU_C5_T3R_PROFILE_BINDING_COMPLETE,
  EU_C5_T3R_READY_FOR_T4,
  EU_C5_T3R_REFERENCE_PROFILE_ID,
  EU_C5_T3R_REFERENCE_PROFILE_IS_NATIONAL_ANNEX,
  EU_C5_T3R_TORSION_METHOD_COUNT,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION,
  LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_PROFILE_BINDING,
  NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED,
} from "@rtb/types";
import {
  EU_C5_T3R_TORSION_PARAMETERS,
  EU_C5_T3R_TORSION_RULES,
  resolveEuC5TorsionReferenceProfile,
  validateEuC5TorsionProfilePack,
} from "./eu-c5/profile-binding";

const request = {
  profileId: EU_C5_T3R_REFERENCE_PROFILE_ID,
  generation: "EN1992-1-1-FIRST_GENERATION" as const,
  profileVersion: "d1e-eu-c5-t3r.1" as const,
  cotTheta: 2,
  prestressed: false,
  interactionForm: "LINEAR_STRUT" as const,
  sectionKind: "RECTANGULAR_SOLID" as const,
};

describe("EOS-D1E-EU-C5-T3R torsion reference profile", () => {
  it("binds the recommended profile and does not compute resistance", () => {
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_IMPLEMENTATION).toBe(false);
    expect(LICENSED_STANDARD_DOCUMENT_REQUIRED_FOR_PROFILE_BINDING).toBe(false);
    expect(EU_C5_T3R_REFERENCE_PROFILE_IS_NATIONAL_ANNEX).toBe(false);
    expect(EU_C5_T3R_PROFILE_BINDING_COMPLETE).toBe(true);
    expect(EU_C5_T3R_READY_FOR_T4).toBe(true);
    expect(EU_C5_T3R_FINAL_DISPOSITION).toBe("PROFILE_BOUND_REFERENCE_IMPLEMENTATION_READY");
    expect(EU_C5_T3R_TORSION_METHOD_COUNT).toBe(0);
    expect(NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED).toBe(true);
    expect(D1C_TORSIONAL_ACTION_ID).toBe("MEMBER_TORSION");
    expect(validateEuC5TorsionProfilePack()).toBe("PASS");
    expect(EU_C5_T3R_TORSION_PARAMETERS.find((row) => row.parameterId === "cotTheta")?.value).toBeNull();
    expect(EU_C5_T3R_TORSION_RULES.every((row) => row.formulaFingerprint.startsWith("fp:"))).toBe(true);
    expect(resolveEuC5TorsionReferenceProfile(request).resistanceComputed).toBe(false);
    expect([...EU_C5_IMPLEMENTED_METHOD_IDS]).toContain(
      "EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT",
    );
    expect([...EU_C5_IMPLEMENTED_METHOD_IDS]).toContain(
      "EU_RC_PUNCHING_EN1992_INTERIOR_RECTANGULAR_CONCRETE",
    );
  });

  it("fails closed on annex mixing, angle domain, and the rejected interaction", () => {
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, profileId: "NA-DE" })).toThrow(/PROFILE_MISMATCH/);
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, generation: "EN1992-1-1-2023" })).toThrow(/GENERATION_MISMATCH/);
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, cotTheta: 0.58 })).toThrow(/INVALID_STRUT_ANGLE_DOMAIN/);
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, interactionForm: "SQUARED" })).toThrow(/SOURCE_CONFLICT/);
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, sectionKind: "HOLLOW" })).toThrow(/MISSING_PARAMETER/);
    expect(() => resolveEuC5TorsionReferenceProfile({ ...request, prestressed: true })).toThrow(/UNSUPPORTED_PRESTRESSED_ALPHA_CW/);
  });
});
