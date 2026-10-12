import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { formulaFingerprint } from "./eu-c1b/fingerprint";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import {
  EU_C8_R4_ANCHORAGE_PROFILE_CREATED,
  EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  EU_C8_R4_ANCHORAGE_PROFILE_ID,
  EU_C8_R4_ANCHORAGE_PROFILE_IS_NATIONAL_ANNEX,
  EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  EU_C8_R4_BAR_DIAMETER_CONTRACT,
  EU_C8_R4_BAR_DIAMETER_GUESSED,
  EU_C8_R4_BASIC_ANCHORAGE_RULE_CHAIN_COMPLETE,
  EU_C8_R4_BASIC_EQUALS_DESIGN_ANCHORAGE_AUTOMATICALLY,
  EU_C8_R4_BOND_CONDITION_DEFAULTED,
  EU_C8_R4_DESIGN_BOND_STRENGTH_RULE_CHAIN_COMPLETE,
  EU_C8_R4_DESIGN_MODIFIERS_APPLIED,
  EU_C8_R4_DESIGN_STEEL_STRESS_ROUTE,
  EU_C8_R4_EXPLICIT_FBD_FALLBACK_FEASIBLE,
  EU_C8_R4_FBD_DERIVATION_APPLIED,
  EU_C8_R4_FINAL_DISPOSITION,
  EU_C8_R4_FORCE_STATE_SCOPE,
  EU_C8_R4_FORMULA_FINGERPRINT,
  EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R4_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD,
  EU_C8_R4_LEVEL_A_FEASIBILITY,
  EU_C8_R4_LEVEL_B_FEASIBILITY,
  EU_C8_R4_MINIMUM_ANCHORAGE_APPLIED,
  EU_C8_R4_NDP_PARAMETER_IDS,
  EU_C8_R4_NDP_VALUE_GUESSED,
  EU_C8_R4_PARAMETERS,
  EU_C8_R4_PROFILE_BINDING_FAIL_CLOSED,
  EU_C8_R4_PROFILE_PACK_VALIDATION,
  EU_C8_R4_READY_FOR_IMPLEMENTATION,
  EU_C8_R4_REQUIRED_PARAMETER_IDS,
  EU_C8_R4_REQUIRED_RULE_IDS,
  EU_C8_R4_RUNTIME_METHOD_COUNT,
  EU_C8_R4_SELECTED_CAPABILITY_LEVEL,
  EU_C8_R4_SELECTED_METHOD_ID,
  EU_C8_R4_SOURCE_CONFLICT_RECORDS,
  EU_C8_R4_UNPROVENANCED_PARAMETER_COUNT,
  resolveEuC8BasicAnchorageProfile,
} from "./eu-c8";
import {
  EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8UnboundSubPack,
} from "./eu-c8/profile";
import { EU_C7_DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7";

const profileSource = readFileSync(new URL("./eu-c8/anchorage-profile.ts", import.meta.url), "utf8");
const parentSource = readFileSync(new URL("./eu-c8/profile.ts", import.meta.url), "utf8");

const ready = {
  profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
  parentProfileId: EU_C8_R1_REFERENCE_PROFILE_ID,
  generation: EU_C8_R4_ANCHORAGE_PROFILE_GENERATION,
  profileVersion: EU_C8_R4_ANCHORAGE_PROFILE_VERSION,
  nominalBarDiameterMm: 16,
  designSteelStressMPa: 435,
  designBondStrengthMPa: 2.9,
  reinforcementType: "DEFORMED_BAR",
  barShape: "STRAIGHT",
  forceState: "TENSION",
};

describe("EOS-D1E-EU-C8-R4 anchorage authority", () => {
  it("binds level A and does not calculate a length", () => {
    expect(EU_C8_R4_SELECTED_CAPABILITY_LEVEL).toBe("BASIC_REQUIRED_STRAIGHT_BAR_ANCHORAGE");
    expect(EU_C8_R4_LEVEL_A_FEASIBILITY).toBe("YES");
    expect(EU_C8_R4_LEVEL_B_FEASIBILITY).toBe("NO");
    expect(EU_C8_R4_BASIC_ANCHORAGE_RULE_CHAIN_COMPLETE).toBe(true);
    expect(EU_C8_R4_DESIGN_BOND_STRENGTH_RULE_CHAIN_COMPLETE).toBe(false);
    expect(EU_C8_R4_EXPLICIT_FBD_FALLBACK_FEASIBLE).toBe(true);
    expect(EU_C8_R4_FBD_DERIVATION_APPLIED).toBe(false);
    expect(EU_C8_R4_DESIGN_MODIFIERS_APPLIED).toBe(false);
    expect(EU_C8_R4_MINIMUM_ANCHORAGE_APPLIED).toBe(false);
    expect(EU_C8_R4_BASIC_EQUALS_DESIGN_ANCHORAGE_AUTOMATICALLY).toBe(false);
    expect(EU_C8_R4_FYD_AUTOMATICALLY_USED_AS_SIGMA_SD).toBe(false);
    expect(EU_C8_R4_BOND_CONDITION_DEFAULTED).toBe(false);
    expect(EU_C8_R4_BAR_DIAMETER_CONTRACT).toBe("NOMINAL_BAR_DIAMETER");
    expect(EU_C8_R4_BAR_DIAMETER_GUESSED).toBe(false);
    expect(EU_C8_R4_DESIGN_STEEL_STRESS_ROUTE).toBe("EXPLICIT_DESIGN_STEEL_STRESS");
    expect(EU_C8_R4_FORCE_STATE_SCOPE).toBe("TENSION_ONLY");
    expect(EU_C8_R4_ANCHORAGE_PROFILE_CREATED).toBe(true);
    expect(EU_C8_R4_ANCHORAGE_PROFILE_ID).toBe("EU-EN1992-1-1-GEN1-C8-ANCHORAGE-BASIC-REFERENCE");
    expect(EU_C8_R4_ANCHORAGE_PROFILE_IS_NATIONAL_ANNEX).toBe(false);
    expect(EU_C8_R4_SELECTED_METHOD_ID).toBe("EU_RC_BASIC_REQUIRED_ANCHORAGE_EN1992_REFERENCE");
    expect(EU_C8_R4_FINAL_DISPOSITION).toBe("PROFILE_BOUND_BASIC_ANCHORAGE_REFERENCE_READY");
    expect(EU_C8_R4_READY_FOR_IMPLEMENTATION).toBe(true);
    expect(EU_C8_R4_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R4_NDP_PARAMETER_IDS).toEqual([]);
    expect(EU_C8_R4_NDP_VALUE_GUESSED).toBe(false);
    expect(EU_C8_R4_PARAMETERS[0]?.value).toBe(4);
    expect(EU_C8_R4_REQUIRED_RULE_IDS).toEqual(["EU_C8_R4_LB_RQD_BASIC"]);
    expect(EU_C8_R4_REQUIRED_PARAMETER_IDS).toContain("designBondStrengthMPa");
    expect(EU_C8_R4_UNPROVENANCED_PARAMETER_COUNT).toBe(0);
    expect(EU_C8_R4_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
    expect(EU_C8_R4_PROFILE_PACK_VALIDATION).toBe("PASS");
    expect(EU_C8_R4_PROFILE_BINDING_FAIL_CLOSED).toBe("PASS");
    expect(EU_C8_R4_SOURCE_CONFLICT_RECORDS.map((row) => row.classification)).toEqual([
      "DIFFERENT_SCOPE",
      "DIFFERENT_SCOPE",
      "DIFFERENT_METHOD",
    ]);
    expect(EU_C8_R4_FORMULA_FINGERPRINT).toBe(formulaFingerprint({
      ruleId: "EU_C8_R4_LB_RQD_BASIC",
      operations: ["divide", "multiply"],
      parameterIds: [...EU_C8_R4_REQUIRED_PARAMETER_IDS],
    }));
    const resolved = resolveEuC8BasicAnchorageProfile(ready);
    expect(resolved).toEqual({
      ok: true,
      profileId: EU_C8_R4_ANCHORAGE_PROFILE_ID,
      methodId: EU_C8_R4_SELECTED_METHOD_ID,
      runtimeMethodImplemented: false,
      calculatedBasicAnchorageLengthMm: null,
      designBondStrengthRoute: "EXPLICIT_GOVERNED_DESIGN_BOND_STRENGTH",
    });
  });

  it("does not encode the unbound bond product or a runtime length", () => {
    expect(profileSource.includes("2.25")).toBe(false);
    expect(profileSource.includes("0.7")).toBe(false);
    expect(profileSource.includes("0,7")).toBe(false);
    expect(parentSource.includes("2.25")).toBe(false);
    expect(parentSource.includes("0.7")).toBe(false);
    expect(profileSource.includes("calculatedBasicAnchorageLengthMm: null")).toBe(true);
    expect(resolveEuC8UnboundSubPack("ANCHORAGE")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(resolveEuC8UnboundSubPack("LAP")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
  });

  it("fails closed on missing stress, derived bond, fyd, defaults, and design modifiers", () => {
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, designSteelStressMPa: null }).ok).toBe(false);
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, designBondStrengthMPa: 0 })).toMatchObject({ ok: false, reason: "MISSING_DESIGN_BOND_STRENGTH" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, designSteelStressMPa: -1 })).toMatchObject({ ok: false, reason: "MISSING_DESIGN_STEEL_STRESS" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, substituteFydRequested: true })).toMatchObject({ ok: false, reason: "FYD_NOT_SUBSTITUTED_FOR_SIGMA_SD" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, deriveBondStrengthRequested: true })).toMatchObject({ ok: false, reason: "BOND_STRENGTH_DERIVATION_NOT_BOUND" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, bondConditionDefaultRequested: true })).toMatchObject({ ok: false, reason: "BOND_CONDITION_NOT_DEFAULTED" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, forceState: "COMPRESSION" })).toMatchObject({ ok: false, reason: "UNSUPPORTED_FORCE_STATE" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, barShape: "HOOK" })).toMatchObject({ ok: false, reason: "UNSUPPORTED_BAR_SHAPE" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, levelBModifierRequested: true })).toMatchObject({ ok: false, reason: "DESIGN_ANCHORAGE_MODIFIERS_NOT_BOUND" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, useRequiredNominalCoverAsConfinement: true })).toMatchObject({ ok: false, reason: "COVER_ASSEMBLY_NOT_ANCHORAGE_COVER" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, useSpacingCheckAsConfinement: true })).toMatchObject({ ok: false, reason: "SPACING_CHECK_NOT_CONFINEMENT_FACTOR" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, lapRequested: true })).toMatchObject({ ok: false, reason: "LAP_NOT_BOUND" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, nationalAnnexClaim: true })).toMatchObject({ ok: false, reason: "NATIONAL_ANNEX_NOT_ESTABLISHED" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, sourceConflictUnresolved: true })).toMatchObject({ ok: false, reason: "SOURCE_CONFLICT" });
    expect(resolveEuC8BasicAnchorageProfile({ ...ready, checkRequested: true })).toMatchObject({ ok: false, reason: "MISSING_AVAILABLE_ANCHORAGE_LENGTH" });
    expect(resolveEuC8BasicAnchorageProfile({
      ...ready,
      checkRequested: true,
      availableAnchorageLengthMm: 500,
    })).toMatchObject({ ok: false, reason: "MISSING_CRITICAL_SECTION" });
    expect(resolveEuC8BasicAnchorageProfile({
      ...ready,
      checkRequested: true,
      availableAnchorageLengthMm: 500,
      criticalSectionRef: "FACE_A",
    }).ok).toBe(true);
  });

  it("preserves cover, spacing, product claim, and the parent roadmap", () => {
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY")?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.MIN_CLEAR_SPACING")?.validationState).toBe("NUMERICALLY_VALIDATED");
    const anchorage = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.BASIC_ANCHORAGE_PROFILE");
    expect(anchorage?.implementationState).toBe("PROFILE_BOUND_REFERENCE");
    expect(anchorage?.validationState).toBe("NOT_VALIDATED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8")?.status).toBe("NOT_STARTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R4-ANCHORAGE-AUTHORITY")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R4B-ANCHORAGE-IMPLEMENTATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R5-LAPS-AUTHORITY")?.status).toBe("NOT_STARTED");
    expect(EU_C7_DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });
});
