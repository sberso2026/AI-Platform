import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";
import { EU_C7_BOUNDED_TRACK_COMPLETE } from "./eu-c7/closeout";
import {
  EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE,
  EU_C8_R1_BOND_CONDITION_DEFAULTED,
  EU_C8_R1_CMIN_ABSOLUTE_MM,
  EU_C8_R1_CMIN_B_DERIVED_FROM_DIAMETER,
  EU_C8_R1_COVER_DURABILITY_PROFILE_COMPLETE,
  EU_C8_R1_DEVIATION_ALLOWANCE_DEFAULTED,
  EU_C8_R1_DEVIATION_ALLOWANCE_MM,
  EU_C8_R1_LAP_PROFILE_COMPLETE,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_IS_NATIONAL_ANNEX,
  EU_C8_R1_RUNTIME_METHOD_COUNT,
  EU_C8_R1_SPACING_PROFILE_COMPLETE,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_COVER_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8CoverAssemblyProfile,
  resolveEuC8UnboundSubPack,
} from "./eu-c8";

describe("EOS-D1E-EU-C8-R1 cover assembly profile", () => {
  it("binds only the cover assembly and refuses missing components", () => {
    expect(EU_C8_R1_COVER_DURABILITY_PROFILE_COMPLETE).toBe(true);
    expect(EU_C8_R1_SPACING_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R1_LAP_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C8_COVER_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R1_REFERENCE_PROFILE_IS_NATIONAL_ANNEX).toBe(false);
    expect(EU_C8_R1_DEVIATION_ALLOWANCE_DEFAULTED).toBe(false);
    expect(EU_C8_R1_DEVIATION_ALLOWANCE_MM).toBeNull();
    expect(EU_C8_R1_CMIN_B_DERIVED_FROM_DIAMETER).toBe(false);
    expect(EU_C8_R1_BOND_CONDITION_DEFAULTED).toBe(false);
    expect(EU_C8_R1_CMIN_ABSOLUTE_MM).toBe(10);
    expect(EU_C7_BOUNDED_TRACK_COMPLETE).toBe(true);
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");

    const ready = resolveEuC8CoverAssemblyProfile({
      profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
      generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
      bondCoverComponentMm: 16,
      durabilityCoverComponentMm: 25,
      deviationAllowanceMm: 10,
    });
    expect(ready.ok).toBe(true);
    if (ready.ok) expect(ready.runtimeMethodImplemented).toBe(false);

    expect(resolveEuC8CoverAssemblyProfile({
      profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
      generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
      bondCoverComponentMm: 16,
      durabilityCoverComponentMm: 25,
      deviationAllowanceMm: null,
    }).ok).toBe(false);
    expect(resolveEuC8CoverAssemblyProfile({
      profileId: "OTHER",
      generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
      bondCoverComponentMm: 16,
      durabilityCoverComponentMm: 25,
      deviationAllowanceMm: 10,
    })).toEqual({ ok: false, reason: "PROFILE_MISMATCH" });
    expect(resolveEuC8UnboundSubPack("ANCHORAGE")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(resolveEuC8UnboundSubPack("LAP")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(resolveEuC8UnboundSubPack("SPACING")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
  });

  it("does not bind anchorage or lap coefficients", () => {
    const source = readFileSync(new URL("./eu-c8/profile.ts", import.meta.url), "utf8");
    expect(source).not.toContain("2.25");
    expect(source).not.toContain("0.7");
    expect(source).not.toContain("eta");
  });
});
