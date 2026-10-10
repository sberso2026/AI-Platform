import { describe, expect, it } from "vitest";
import {
  D1C_TORSIONAL_ACTION_ID,
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_T3_EXTERNAL_PROFILE_INPUT_PRESENT,
  EU_C5_T3_NEXT_ACTION,
  EU_C5_T3_PROFILE_TORSION_BINDING_COMPLETE,
  EU_C5_T3_TORSION_METHOD_COUNT,
  NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED,
} from "@rtb/types";
import { resolveEuC5TorsionNationalProfile } from "./eu-c5/profile-binding";

describe("EOS-D1E-EU-C5-T3 human profile binding", () => {
  it("fails closed when no human national-annex input is present", () => {
    expect(EU_C5_T3_EXTERNAL_PROFILE_INPUT_PRESENT).toBe(false);
    expect(EU_C5_T3_PROFILE_TORSION_BINDING_COMPLETE).toBe(false);
    expect(EU_C5_T3_TORSION_METHOD_COUNT).toBe(0);
    expect(EU_C5_T3_NEXT_ACTION).toBe("HUMAN_PROFILE_INPUT_REQUIRED");
    expect(NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(D1C_TORSIONAL_ACTION_ID).toBe("MEMBER_TORSION");
    expect([...EU_C5_IMPLEMENTED_METHOD_IDS]).toEqual([
      "EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT",
      "EU_RC_PUNCHING_EN1992_INTERIOR_RECTANGULAR_CONCRETE",
    ]);
    expect(() => resolveEuC5TorsionNationalProfile()).toThrow(/HUMAN_PROFILE_INPUT_REQUIRED/);
  });
});
