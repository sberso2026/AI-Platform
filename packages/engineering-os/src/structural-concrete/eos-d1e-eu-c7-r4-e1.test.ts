import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED,
} from "@rtb/types";
import { D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import {
  DEFLECTION_RUNTIME_CAPABILITY,
  EU_C7_R4_E1_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA,
  EU_C7_R4_E1_CURVATURE_RULE_CHAIN_COMPLETE,
  EU_C7_R4_E1_DEFLECTION_PROFILE_CREATED,
  EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION,
  EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION_EXPLICIT,
  EU_C7_R4_E1_FINAL_DISPOSITION,
  EU_C7_R4_E1_NDP_PARAMETER_IDS,
  EU_C7_R4_E1_NDP_VALUE_GUESSED,
  EU_C7_R4_E1_NEXT_PHASE,
  EU_C7_R4_E1_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY,
  EU_C7_R4_E1_READY_FOR_R2,
  EU_C7_R4_E1_RUNTIME_METHOD_COUNT,
  EU_C7_R4_E1_SELECTED_METHOD_FAMILY,
  EU_C7_R4_E1_SOURCE_CONFLICT_RECORDS,
  EU_C7_R4_E1_SPAN_DEPTH_METHOD_IMPLEMENTATION_AUTHORIZED,
  EU_C7_R4_E1_TARGET_METHODS,
  resolveEuC7DeflectionAuthority,
} from "./eu-c7";

const parent = {
  profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
  generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
};

describe("EOS-D1E-EU-C7-R4-E1 deflection authority", () => {
  it("defers deflection after the targeted recovery", () => {
    expect(EU_C7_R4_E1_TARGET_METHODS).toEqual([
      "CRACKED_UNCRACKED_CURVATURE_INTERPOLATION",
      "SIMPLIFIED_SPAN_EFFECTIVE_DEPTH_CONTROL",
    ]);
    expect(EU_C7_R4_E1_CURVATURE_RULE_CHAIN_COMPLETE).toBe(false);
    expect(EU_C7_R4_E1_SPAN_DEPTH_METHOD_IMPLEMENTATION_AUTHORIZED).toBe(false);
    expect(EU_C7_R4_E1_SELECTED_METHOD_FAMILY).toBe("NONE");
    expect(EU_C7_R4_E1_DEFLECTION_PROFILE_CREATED).toBe(false);
    expect(EU_C7_R4_E1_READY_FOR_R2).toBe(false);
    expect(EU_C7_R4_E1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_C7_R4_E1_FINAL_DISPOSITION).toBe("DEFLECTION_DEFERRED_AFTER_TARGETED_RECOVERY");
    expect(EU_C7_R4_E1_NEXT_PHASE).toBe("EOS-D1E-EU-C7-R5-CLOSEOUT");
    expect(EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION).toBe("NOT_BOUND_NO_METHOD_SELECTED");
    expect(EU_C7_R4_E1_DEFLECTION_SIGN_CONVENTION_EXPLICIT).toBe(false);
    expect(EU_C7_R4_E1_NDP_PARAMETER_IDS).toEqual([]);
    expect(EU_C7_R4_E1_NDP_VALUE_GUESSED).toBe(false);
    expect(EU_C7_R4_E1_PHI_EQUALS_C6_PHIEF_AUTOMATICALLY).toBe(false);
    expect(EU_C7_R4_E1_CRACK_WIDTH_USED_AS_DEFLECTION_FORMULA).toBe(false);
    expect(EU_C7_R4_E1_SOURCE_CONFLICT_RECORDS.every((row) => row.resolution === "STILL_UNRESOLVED")).toBe(true);
    const debt = D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-DEFLECTION");
    expect(debt?.blockingState).toBe("DEFERRED_RULE_AUTHORITY");
  });

  it("fails closed for every deflection request", () => {
    expect(resolveEuC7DeflectionAuthority({ ...parent, requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("DEFLECTION_DEFERRED_AFTER_TARGETED_RECOVERY");
    expect(resolveEuC7DeflectionAuthority({ ...parent, requestedMethod: "SPAN_EFFECTIVE_DEPTH" }).code)
      .toBe("DEFLECTION_DEFERRED_AFTER_TARGETED_RECOVERY");
    expect(resolveEuC7DeflectionAuthority({ ...parent, profileId: "OTHER", requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("PROFILE_MISMATCH");
    expect(resolveEuC7DeflectionAuthority({ ...parent, generation: "EN1992-1-1-GEN2", requestedMethod: "CURVATURE_INTERPOLATION" }).code)
      .toBe("GENERATION_MISMATCH");
    expect(resolveEuC7DeflectionAuthority({ ...parent, requestedMethod: "" }).accepted).toBe(false);
  });

  it("does not bind deflection coefficients", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "eu-c7", "deflection-authority.ts"), "utf8");
    expect(source).not.toMatch(/\b0\.5\b|\b1\.0\b|Ec,eff|sigmaSr|Mcr/);
  });
});
