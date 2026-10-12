import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import {
  EU_C8_BASIC_ANCHORAGE_BOUNDED_CAPABILITY_COMPLETE,
  EU_C8_R1_LAP_PROFILE_COMPLETE,
  EU_C8_SPACING_BOUNDED_CAPABILITY_COMPLETE,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8UnboundSubPack,
} from "./eu-c8";
import {
  EU_C8_R5_BASIC_ANCHORAGE_AUTOMATICALLY_USED_AS_DESIGN_ANCHORAGE,
  EU_C8_R5_DESIGN_ANCHORAGE_IMPLEMENTED,
  EU_C8_R5_FINAL_DISPOSITION,
  EU_C8_R5_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R5_FULL_DESIGN_ANCHORAGE_PREREQUISITE,
  EU_C8_R5_LAP_PERCENTAGE_DEFAULTED,
  EU_C8_R5_LAP_PROFILE_CREATED,
  EU_C8_R5_LAP_RULE_CHAIN_COMPLETE,
  EU_C8_R5_READY_FOR_IMPLEMENTATION,
  EU_C8_R5_RUNTIME_METHOD_COUNT,
  EU_C8_R5_SELECTED_CAPABILITY_LEVEL,
  resolveEuC8LapAuthority,
} from "./eu-c8/lap-authority";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";

describe("EOS-D1E-EU-C8-R5 lap authority", () => {
  it("defers laps without a runtime or a bound profile", () => {
    expect(EU_C8_R5_SELECTED_CAPABILITY_LEVEL).toBe("NONE");
    expect(EU_C8_R5_LAP_RULE_CHAIN_COMPLETE).toBe(false);
    expect(EU_C8_R5_FULL_DESIGN_ANCHORAGE_PREREQUISITE).toBe(false);
    expect(EU_C8_R5_BASIC_ANCHORAGE_AUTOMATICALLY_USED_AS_DESIGN_ANCHORAGE).toBe(false);
    expect(EU_C8_R5_LAP_PERCENTAGE_DEFAULTED).toBe(false);
    expect(EU_C8_R5_LAP_PROFILE_CREATED).toBe(false);
    expect(EU_C8_R5_READY_FOR_IMPLEMENTATION).toBe(false);
    expect(EU_C8_R5_FINAL_DISPOSITION).toBe("LAPS_DEFERRED_AFTER_TARGETED_RECOVERY");
    expect(EU_C8_R5_FORMULA_FINGERPRINT_VALIDATION).toBe("NOT_BOUND");
    expect(EU_C8_R5_RUNTIME_METHOD_COUNT).toBe(0);
    expect(EU_C8_R5_DESIGN_ANCHORAGE_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R1_LAP_PROFILE_COMPLETE).toBe(false);
    expect(resolveEuC8LapAuthority()).toEqual({
      ok: false,
      reason: "LAP_AUTHORITY_DEFERRED",
      calculatedLapLengthMm: null,
      runtimeMethodImplemented: false,
    });
    expect(resolveEuC8UnboundSubPack("LAP")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    const source = readFileSync(new URL("./eu-c8/lap-authority.ts", import.meta.url), "utf8");
    expect(source).not.toContain("0.30");
    expect(source).not.toContain("0.3");
    expect(source).not.toContain("sqrt");
    expect(source).not.toMatch(/\b15\b/);
    expect(source).not.toMatch(/\b25\b/);
    expect(source).not.toMatch(/\b200\b/);
    expect(EU_C8_BASIC_ANCHORAGE_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
    expect(EU_C8_SPACING_BOUNDED_CAPABILITY_COMPLETE).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY")?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.LAPS")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8")?.status).toBe("NOT_STARTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R5-LAPS-AUTHORITY")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R6-CLOSEOUT")?.status).toBe("NOT_STARTED");
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });
});
