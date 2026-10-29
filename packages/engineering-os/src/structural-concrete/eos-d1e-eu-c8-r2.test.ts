import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "./capability";
import { DEFLECTION_RUNTIME_CAPABILITY } from "./eu-c7/deflection-authority";
import {
  EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE,
  EU_C8_R1_CMIN_B_DERIVED_FROM_DIAMETER,
  EU_C8_R1_CMIN_DUR_DERIVED_FROM_EXPOSURE,
  EU_C8_R1_FORMULA_FINGERPRINT_VALIDATION,
  EU_C8_R1_LAP_PROFILE_COMPLETE,
  EU_C8_R1_PARAMETERS,
  EU_C8_R1_REFERENCE_PROFILE_GENERATION,
  EU_C8_R1_REFERENCE_PROFILE_ID,
  EU_C8_R1_REFERENCE_PROFILE_VERSION,
  EU_C8_R1_RUNTIME_METHOD_COUNT,
  EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE,
  NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_COVER_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  resolveEuC8UnboundSubPack,
} from "./eu-c8";
import {
  AI_BOND_COVER_AUTHORITY,
  AI_DEVIATION_ALLOWANCE_AUTHORITY,
  AI_DURABILITY_COVER_AUTHORITY,
  D1E_GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_CHECK,
  D1E_MODELLED_COVER_EQUALS_REQUIRED_NOMINAL_COVER,
  EU_C8_R2_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED,
  EU_C8_R2_BOND_COVER_DEFAULTED,
  EU_C8_R2_CAPABILITY_SCOPE,
  EU_C8_R2_COVER_ASSEMBLY_EQUALS_MEMBER_COMPLIANCE,
  EU_C8_R2_DEVIATION_ALLOWANCE_DEFAULTED,
  EU_C8_R2_DURABILITY_COVER_LOOKUP_IMPLEMENTED,
  EU_C8_R2_EXPOSURE_CLASS_TO_COVER_LOOKUP_IMPLEMENTED,
  EU_C8_R2_LAP_RUNTIME_METHOD_IMPLEMENTED,
  EU_C8_R2_METHOD_ID,
  EU_C8_R2_METHOD_REGISTRY,
  EU_C8_R2_NEXT_SUBPACK_CURRENTLY_IMPLEMENTATION_READY,
  EU_C8_R2_PROVIDED_COVER_CHECK_IMPLEMENTED,
  EU_C8_R2_SPACING_RUNTIME_METHOD_IMPLEMENTED,
  EU_C8_R2_ZERO_BOND_COVER_ALLOWED,
  EU_C8_R2_ZERO_DEVIATION_ALLOWANCE_ALLOWED,
  EU_C8_R2_ZERO_DURABILITY_COVER_ALLOWED,
  GENERATIVE_MODEL_CAN_INVENT_COVER_COMPONENTS,
  STALE_EU_C8_R2_RESULT_REUSE_ALLOWED,
  assertEuC8AiAuthority,
  assertEuC8CoverOptimizerRejectsUndetermined,
  assertEuC8CoverParetoRejectsUndetermined,
  assertEuC8CoverResultCurrent,
  evaluateEuC8CoverAssembly,
  inventEuC8CoverComponent,
  resolveEuC8AbsoluteMinimumCover,
  type EuC8CoverAssemblyInput,
} from "./eu-c8";
import { EU_C8_R2_CMIN_FORMULA_FINGERPRINT, EU_C8_R2_CNOM_FORMULA_FINGERPRINT, EU_C8_R2_COVER_SUBPACK_FORMULA_FINGERPRINT_VALIDATION } from "./eu-c8";

const absoluteMinimum = EU_C8_R1_PARAMETERS.find((row) => row.parameterId === "absoluteMinimumCoverMm");

function independentMm(value: number, unit: "mm" | "cm" | "m"): number {
  const metreExponent = unit === "m" ? 0 : unit === "cm" ? -2 : -3;
  return value * (10 ** (metreExponent - -3));
}

function independentAssembly(bondMm: number, durabilityMm: number, deviationMm: number, absoluteMm: number) {
  const minimumCoverMm = Math.max(bondMm, durabilityMm, absoluteMm);
  const governingNames = [
    bondMm === minimumCoverMm ? "BOND" : null,
    durabilityMm === minimumCoverMm ? "DURABILITY" : null,
    absoluteMm === minimumCoverMm ? "ABSOLUTE_MINIMUM" : null,
  ].filter((item) => item != null);
  return {
    minimumCoverMm,
    nominalCoverMm: minimumCoverMm + deviationMm,
    governingMinimumComponent: governingNames.length > 1 ? "MULTIPLE" : governingNames[0],
  };
}

function input(patch: Partial<EuC8CoverAssemblyInput> = {}): EuC8CoverAssemblyInput {
  return {
    profileId: EU_C8_R1_REFERENCE_PROFILE_ID,
    profileVersion: EU_C8_R1_REFERENCE_PROFILE_VERSION,
    generation: EU_C8_R1_REFERENCE_PROFILE_GENERATION,
    bondCover: { value: 40, unit: "mm" },
    durabilityCover: { value: 25, unit: "mm" },
    deviationAllowance: { value: 10, unit: "mm" },
    bondProvenanceRef: "bond-input",
    durabilityProvenanceRef: "durability-input",
    deviationProvenanceRef: "deviation-input",
    ...patch,
  };
}

describe("EOS-D1E-EU-C8-R2 cover assembly", () => {
  it("accepts complete cover fingerprints while the pack stays partial", () => {
    expect(EU_C8_R1_FORMULA_FINGERPRINT_VALIDATION).toBe("PARTIAL");
    expect(EU_C8_R1_SPACING_DETAILING_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R1_ANCHORAGE_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R1_LAP_PROFILE_COMPLETE).toBe(false);
    expect(EU_C8_R2_COVER_SUBPACK_FORMULA_FINGERPRINT_VALIDATION).toBe("PASS");
    expect(EU_C8_R2_CMIN_FORMULA_FINGERPRINT).toMatch(/^fp:[0-9a-f]{8}$/);
    expect(EU_C8_R2_CNOM_FORMULA_FINGERPRINT).toMatch(/^fp:[0-9a-f]{8}$/);
    expect(EU_C8_R2_CMIN_FORMULA_FINGERPRINT).not.toBe(EU_C8_R2_CNOM_FORMULA_FINGERPRINT);
    expect(absoluteMinimum?.value).toBeTypeOf("number");
    expect(absoluteMinimum?.units).toBe("mm");
  });

  it("resolves the absolute minimum from the profile parameter", () => {
    const resolved = resolveEuC8AbsoluteMinimumCover();
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.parameter.value).toBe(absoluteMinimum?.value);
      expect(resolved.parameter.units).toBe("mm");
      expect(resolved.parameter.sourceIds.length).toBeGreaterThan(0);
    }
    expect(resolveEuC8AbsoluteMinimumCover([])).toEqual({ ok: false, reason: "MISSING_PROFILE_ABSOLUTE_MINIMUM" });
  });

  it("matches independent component algebra", () => {
    const absolute = absoluteMinimum?.value ?? Number.NaN;
    const bond = independentMm(4, "cm");
    const durability = independentMm(0.02, "m");
    const deviation = independentMm(5, "mm");
    const expected = independentAssembly(bond, durability, deviation, absolute);
    const result = evaluateEuC8CoverAssembly(input({
      bondCover: { value: 4, unit: "cm" },
      durabilityCover: { value: 0.02, unit: "m" },
      deviationAllowance: { value: 5, unit: "mm" },
    }));
    expect(result.ok).toBe(true);
    expect(result.bondCoverComponentMm).toBe(bond);
    expect(result.durabilityCoverComponentMm).toBe(durability);
    expect(result.absoluteMinimumCoverMm).toBe(absolute);
    expect(result.minimumCoverMm).toBe(expected.minimumCoverMm);
    expect(result.nominalCoverMm).toBe(expected.nominalCoverMm);
    expect(result.governingMinimumComponent).toBe(expected.governingMinimumComponent);
    expect(result.governingMinimumComponent).toBe("BOND");
  });

  it("runs the independent golden cases", () => {
    const absolute = absoluteMinimum?.value ?? Number.NaN;
    const cases: Array<{ name: string; patch: Partial<EuC8CoverAssemblyInput>; bond: number; durability: number; deviation: number; governing: string }> = [
      { name: "bond governs", patch: {}, bond: 40, durability: 25, deviation: 10, governing: "BOND" },
      { name: "durability governs", patch: { bondCover: { value: 15, unit: "mm" }, durabilityCover: { value: 30, unit: "mm" }, deviationAllowance: { value: 5, unit: "mm" } }, bond: 15, durability: 30, deviation: 5, governing: "DURABILITY" },
      { name: "absolute minimum governs", patch: { bondCover: { value: 5, unit: "mm" }, durabilityCover: { value: 8, unit: "mm" } }, bond: 5, durability: 8, deviation: 10, governing: "ABSOLUTE_MINIMUM" },
      { name: "bond durability tie", patch: { bondCover: { value: 25, unit: "mm" }, durabilityCover: { value: 25, unit: "mm" } }, bond: 25, durability: 25, deviation: 10, governing: "MULTIPLE" },
      { name: "durability absolute tie", patch: { bondCover: { value: 5, unit: "mm" }, durabilityCover: { value: absolute, unit: "mm" } }, bond: 5, durability: absolute, deviation: 10, governing: "MULTIPLE" },
      { name: "all three tie", patch: { bondCover: { value: absolute, unit: "mm" }, durabilityCover: { value: absolute, unit: "mm" }, deviationAllowance: { value: 0, unit: "mm" } }, bond: absolute, durability: absolute, deviation: 0, governing: "MULTIPLE" },
      { name: "positive deviation", patch: { deviationAllowance: { value: 12, unit: "mm" } }, bond: 40, durability: 25, deviation: 12, governing: "BOND" },
      { name: "zero deviation", patch: { deviationAllowance: { value: 0, unit: "mm" } }, bond: 40, durability: 25, deviation: 0, governing: "BOND" },
      { name: "equivalent units", patch: { bondCover: { value: 2.5, unit: "cm" }, durabilityCover: { value: 20, unit: "mm" }, deviationAllowance: { value: 0.01, unit: "m" } }, bond: independentMm(2.5, "cm"), durability: 20, deviation: independentMm(0.01, "m"), governing: "BOND" },
      { name: "decimal values", patch: { bondCover: { value: 12.5, unit: "mm" }, durabilityCover: { value: 11.25, unit: "mm" }, deviationAllowance: { value: 2.5, unit: "mm" } }, bond: 12.5, durability: 11.25, deviation: 2.5, governing: "BOND" },
    ];
    for (const item of cases) {
      const expected = independentAssembly(item.bond, item.durability, item.deviation, absolute);
      const result = evaluateEuC8CoverAssembly(input(item.patch));
      expect(result.ok, item.name).toBe(true);
      expect(result.minimumCoverMm, item.name).toBe(expected.minimumCoverMm);
      expect(result.nominalCoverMm, item.name).toBe(expected.nominalCoverMm);
      expect(result.governingMinimumComponent, item.name).toBe(item.governing);
      expect(result.governingMinimumComponent, item.name).toBe(expected.governingMinimumComponent);
      expect(result.checkState, item.name).toBe("COVER_REQUIREMENT_CALCULATED");
      expect(result.memberCompliance, item.name).toBe(false);
    }

    const exposure = evaluateEuC8CoverAssembly(input({ exposureContext: "XC2", materialContext: "project-concrete", executionContext: "measured-cover", projectRequirementRef: "spec-4" }));
    expect(exposure.ok).toBe(true);
    expect(exposure.durabilityCoverComponentMm).toBe(25);
    expect(exposure.exposureContext).toBe("XC2");
    expect(exposure.warnings[0]).toContain("does not set durabilityCoverComponentMm");
    expect(EU_C8_R2_DURABILITY_COVER_LOOKUP_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_EXPOSURE_CLASS_TO_COVER_LOOKUP_IMPLEMENTED).toBe(false);
  });

  it("fails closed on unbound, invalid, and unsupported requests", () => {
    const failures: Array<[string, Partial<EuC8CoverAssemblyInput>]> = [
      ["MISSING_PROFILE", { profileId: null }],
      ["PROFILE_MISMATCH", { profileId: "OTHER" }],
      ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
      ["STALE_PROFILE", { stale: true }],
      ["STALE_PROFILE", { profileVersion: "c8-r1-cover-assembly-0" }],
      ["MISSING_BOND_COVER", { bondCover: null }],
      ["MISSING_DURABILITY_COVER", { durabilityCover: { value: null, unit: "mm" } }],
      ["MISSING_DEVIATION_ALLOWANCE", { deviationAllowance: null }],
      ["NAN_INPUT", { bondCover: { value: Number.NaN, unit: "mm" } }],
      ["NAN_INPUT", { durabilityCover: { value: Number.NaN, unit: "mm" } }],
      ["NAN_INPUT", { deviationAllowance: { value: Number.NaN, unit: "mm" } }],
      ["INFINITY_INPUT", { bondCover: { value: Number.POSITIVE_INFINITY, unit: "mm" } }],
      ["NEGATIVE_INPUT", { durabilityCover: { value: -1, unit: "mm" } }],
      ["INVALID_UNITS", { deviationAllowance: { value: 10, unit: "inch" } }],
      ["UNRESOLVED_NDP_INPUT", { durabilityNdpState: "UNRESOLVED" }],
      ["INVALID_PROVENANCE", { bondProvenanceRef: " " }],
      ["EXPOSURE_DOES_NOT_SUPPLY_DURABILITY_COVER", { deriveDurabilityFromExposure: true, exposureContext: "XC4" }],
      ["DEVIATION_ALLOWANCE_NOT_DEFAULTED", { applyDefaultDeviationAllowance: true, deviationAllowance: null }],
      ["UNSUPPORTED_PROVIDED_COVER_COMPARISON", { requestProvidedCoverComparison: true }],
      ["NATIONAL_ANNEX_NOT_REFERENCE_PROFILE", { nationalAnnexClaim: true }],
    ];
    for (const [reason, patch] of failures) {
      const result = evaluateEuC8CoverAssembly(input(patch));
      expect(result.ok, reason).toBe(false);
      expect(result.failReason, reason).toBe(reason);
      expect(result.checkState, reason).toBe("FAIL_CLOSED");
      expect(result.nominalCoverMm, reason).toBeNull();
      expect(result.resultFingerprint, reason).toBeNull();
    }
    expect(evaluateEuC8CoverAssembly(input({ bondCover: { value: 0, unit: "mm" }, durabilityCover: { value: 0, unit: "mm" }, deviationAllowance: { value: 0, unit: "mm" } })).ok).toBe(true);
  });

  it("fingerprints, invalidates, and stays deterministic", () => {
    const first = evaluateEuC8CoverAssembly(input());
    const again = evaluateEuC8CoverAssembly(input());
    expect(first.resultFingerprint).toBe(again.resultFingerprint);
    expect(first.inputFingerprint).toBe(first.resultFingerprint);
    expect(first.profileFingerprint?.startsWith("fp:")).toBe(true);
    expect(first.provenance.sourceIds).toEqual(["JRC_BOUCHON_VIENNA_2010_EN1992_COVER"]);
    expect(() => assertEuC8CoverResultCurrent(first, input())).not.toThrow();
    expect(() => assertEuC8CoverResultCurrent(first, input({ bondCover: { value: 41, unit: "mm" } }))).toThrow(/stale/);
    expect(STALE_EU_C8_R2_RESULT_REUSE_ALLOWED).toBe(false);
    expect(() => assertEuC8CoverOptimizerRejectsUndetermined("FAIL_CLOSED")).toThrow(/rejected/);
    expect(() => assertEuC8CoverParetoRejectsUndetermined("FAIL_CLOSED")).toThrow(/rejected/);
    expect(() => inventEuC8CoverComponent()).toThrow(/cannot invent/);
    expect(() => assertEuC8AiAuthority()).not.toThrow();
  });

  it("keeps the bounded claim and does not open the other sub-packs", () => {
    expect(EU_C8_R2_CAPABILITY_SCOPE).toBe("COVER_ASSEMBLY_ONLY");
    expect(EU_C8_R2_METHOD_ID).toBe("EU_RC_COVER_ASSEMBLY_EN1992_REFERENCE");
    expect(EU_C8_R2_METHOD_REGISTRY).toHaveLength(1);
    expect(EU_C8_R2_METHOD_REGISTRY[0]?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(EU_C8_R2_METHOD_REGISTRY[0]?.engineerValidationState).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(EU_C8_R2_METHOD_REGISTRY[0]?.conformanceState).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_C8_R2_COVER_ASSEMBLY_EQUALS_MEMBER_COMPLIANCE).toBe(false);
    expect(EU_C8_R2_PROVIDED_COVER_CHECK_IMPLEMENTED).toBe(false);
    expect(D1E_MODELLED_COVER_EQUALS_REQUIRED_NOMINAL_COVER).toBe(false);
    expect(D1E_GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_CHECK).toBe(false);
    expect(EU_C8_R2_BOND_COVER_DEFAULTED).toBe(false);
    expect(EU_C8_R2_DEVIATION_ALLOWANCE_DEFAULTED).toBe(false);
    expect(EU_C8_R1_CMIN_B_DERIVED_FROM_DIAMETER).toBe(false);
    expect(EU_C8_R1_CMIN_DUR_DERIVED_FROM_EXPOSURE).toBe(false);
    expect(EU_C8_R2_ZERO_BOND_COVER_ALLOWED).toBe(true);
    expect(EU_C8_R2_ZERO_DURABILITY_COVER_ALLOWED).toBe(true);
    expect(EU_C8_R2_ZERO_DEVIATION_ALLOWANCE_ALLOWED).toBe(true);
    expect(AI_BOND_COVER_AUTHORITY).toBe(false);
    expect(AI_DURABILITY_COVER_AUTHORITY).toBe(false);
    expect(AI_DEVIATION_ALLOWANCE_AUTHORITY).toBe(false);
    expect(GENERATIVE_MODEL_CAN_INVENT_COVER_COMPONENTS).toBe(false);
    expect(EU_C8_R1_RUNTIME_METHOD_COUNT).toBe(0);
    expect(NEW_C8_COVER_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C8_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_SPACING_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_ANCHORAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_LAP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C8_R2_NEXT_SUBPACK_CURRENTLY_IMPLEMENTATION_READY).toBe(false);
    expect(resolveEuC8UnboundSubPack("SPACING")).toEqual({ ok: false, reason: "SUBPACK_NOT_READY" });
    expect(DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    const manifest = CONCRETE_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1E.EU.C8.COVER_ASSEMBLY");
    expect(manifest?.implementationState).toBe("IMPLEMENTED_NUMERICALLY_VALIDATED");
    expect(manifest?.validationState).toBe("NUMERICALLY_VALIDATED");
    expect(manifest?.conformanceState).toBe("INTENDED_PROFILE");
    expect(manifest?.limitations).toContain("DURABILITY_LOOKUP = NOT_IMPLEMENTED");
    expect(manifest?.limitations).toContain("Spacing, basic anchorage, and laps are separate capabilities");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C8-R2-COVER-DURABILITY")?.status).toBe("CLOSED");
    const evaluateSource = readFileSync(new URL("./eu-c8/evaluate.ts", import.meta.url), "utf8");
    expect(evaluateSource).not.toMatch(/(?<![A-Za-z0-9_])\d/);
    const bars = readFileSync(new URL("./section-mechanics/bars.ts", import.meta.url), "utf8");
    expect(bars).toContain("codeCoverCompliance: false");
  });
});
