import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_SHRINKAGE_SIGN_CONVENTION,
  NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED,
  SI_MICROSTRAIN_PER_UNIT_STRAIN,
  type ConcreteMaterial,
} from "@rtb/types";
import {
  assertEuC7LongTermOptimizerRejectsUngoverned,
  assertEuC7LongTermResultCurrent,
  evaluateEuC7LongTermState,
  prepareEuC7C6CreepHandoff,
  prepareEuC7R2DurationContext,
  prepareEuC7R4DeflectionInputs,
  selectEuC7Creep,
  selectEuC7PhiEfTransformation,
  selectEuC7Shrinkage,
  selectEuC7TimeContext,
  type EuC7LongTermInput,
} from "./eu-c7";

const provenance = {
  sourceEvidence: "c7-r3", sourceRevision: "0", model: null, tool: null, solver: null, version: "c7",
  promptOrTemplate: null, timestamp: "2026-10-12T00:00:00.000Z", jurisdiction: "EU", standard: null,
  calculationMethod: null, confidence: null, validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null, approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function concrete(materialRef = "c7-conc"): ConcreteMaterial {
  return {
    materialRef, designation: "C30", compressiveStrength: null, tensileStrength: null, elasticModulus: null,
    density: null, poissonRatio: null, age: null, strengthReferenceAge: null, materialClass: null,
    materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", testCertificateRef: null,
    environmentalMetadata: null, version: "c7", provenance,
  };
}

function input(overrides: Partial<EuC7LongTermInput> = {}): EuC7LongTermInput {
  return {
    profileId: EU_C7_R1_REFERENCE_PROFILE_ID,
    generation: EU_C7_R1_REFERENCE_PROFILE_GENERATION,
    profileVersion: EU_C7_R1_PROFILE_VERSION,
    stale: false,
    presence: "CREEP_AND_SHRINKAGE",
    concrete: concrete(),
    materialRef: "c7-conc",
    sectionId: "beam-a",
    timeContextId: "t-qp-50y",
    referenceTime: "50y-quasi-permanent",
    loadingAgeDays: 28,
    evaluationAgeDays: 18250,
    expectedTimeContextId: null,
    authority: "HUMAN_AUTHORED_VALIDATED_RULE",
    phi: 2.4,
    phiProvenanceRef: "project-creep-note-14",
    phiApplicabilityRef: "beam-a-c30",
    shrinkageValue: 0.00032,
    shrinkageUnit: "STRAIN",
    shrinkageSignRepresentation: "SHRINKAGE_MAGNITUDE_POSITIVE",
    shrinkageProvenanceRef: "project-shrink-note-14",
    shrinkageApplicabilityRef: "beam-a-c30",
    calculateCreep: false,
    calculateShrinkage: false,
    ...overrides,
  };
}

function expectedStrain(value: number, unit: "STRAIN" | "MICROSTRAIN"): number {
  return unit === "MICROSTRAIN" ? value / SI_MICROSTRAIN_PER_UNIT_STRAIN : value;
}

describe("EOS-D1E-EU-C7-R3 explicit long-term state", () => {
  it("normalizes explicit creep and shrinkage without calculating them", () => {
    const creepOnly = evaluateEuC7LongTermState(input({
      presence: "CREEP_ONLY", shrinkageValue: null, shrinkageUnit: null, shrinkageSignRepresentation: null,
      shrinkageProvenanceRef: null, shrinkageApplicabilityRef: null,
    }));
    const shrinkOnly = evaluateEuC7LongTermState(input({
      presence: "SHRINKAGE_ONLY", phi: null, phiProvenanceRef: null, phiApplicabilityRef: null,
    }));
    const both = evaluateEuC7LongTermState(input());
    const zeroCreep = evaluateEuC7LongTermState(input({
      presence: "CREEP_ONLY", phi: 0, shrinkageValue: null, shrinkageUnit: null,
      shrinkageSignRepresentation: null, shrinkageProvenanceRef: null, shrinkageApplicabilityRef: null,
    }));
    const zeroShrink = evaluateEuC7LongTermState(input({
      presence: "SHRINKAGE_ONLY", phi: null, phiProvenanceRef: null, phiApplicabilityRef: null, shrinkageValue: 0,
    }));
    const micro = evaluateEuC7LongTermState(input({ shrinkageValue: 320, shrinkageUnit: "MICROSTRAIN" }));
    expect(NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(creepOnly.accepted).toBe(true);
    expect(creepOnly.creepCoefficient).toBe(2.4);
    expect(creepOnly.shrinkageStrain).toBeNull();
    expect(creepOnly.creepUnit).toBe("1");
    expect(shrinkOnly.creepCoefficient).toBeNull();
    expect(shrinkOnly.shrinkageStrain).toBeCloseTo(expectedStrain(0.00032, "STRAIN"), 12);
    expect(shrinkOnly.shrinkageSignConvention).toBe(EU_C7_R3_SHRINKAGE_SIGN_CONVENTION);
    expect(both.presence).toBe("CREEP_AND_SHRINKAGE");
    expect(both.creepCoefficient).toBe(2.4);
    expect(both.shrinkageStrain).toBeCloseTo(0.00032, 12);
    expect(both.calculatedModel).toBe(false);
    expect(both.phiEqualsPhiEf).toBe(false);
    expect(zeroCreep.creepCoefficient).toBe(0);
    expect(zeroShrink.shrinkageStrain).toBe(0);
    expect(micro.shrinkageStrain).toBeCloseTo(expectedStrain(320, "MICROSTRAIN"), 12);
    expect(micro.shrinkageStrain).toBeCloseTo(both.shrinkageStrain ?? 0, 12);
    expect(micro.resultFingerprint).toBe(both.resultFingerprint);
  });

  it("fails closed and keeps consumer interfaces from changing other methods", () => {
    const cases: Array<[string, Partial<EuC7LongTermInput>]> = [
      ["MISSING_CREEP_PROVENANCE", { phiProvenanceRef: null }],
      ["MISSING_SHRINKAGE_PROVENANCE", { shrinkageProvenanceRef: "" }],
      ["NEGATIVE_CREEP", { phi: -0.2 }],
      ["INVALID_NUMBER", { phi: Number.NaN }],
      ["INVALID_NUMBER", { phi: Number.POSITIVE_INFINITY }],
      ["INVALID_SHRINKAGE_SIGN", { shrinkageSignRepresentation: "SHORTENING_NEGATIVE" }],
      ["INVALID_SHRINKAGE_SIGN", { shrinkageValue: -0.0001 }],
      ["MATERIAL_MISMATCH", { materialRef: "other-concrete" }],
      ["TIME_CONTEXT_MISMATCH", { expectedTimeContextId: "t-other" }],
      ["PROFILE_MISMATCH", { profileId: "OTHER" }],
      ["GENERATION_MISMATCH", { generation: "EN1992-1-1-GEN2" }],
      ["STALE_PROFILE", { stale: true }],
      ["CALCULATED_CREEP_NOT_BOUND", { calculateCreep: true }],
      ["CALCULATED_SHRINKAGE_NOT_BOUND", { calculateShrinkage: true }],
    ];
    for (const [code, overrides] of cases) {
      expect(evaluateEuC7LongTermState(input(overrides)).failReason, code).toBe(code);
    }
    const governed = evaluateEuC7LongTermState(input());
    const again = evaluateEuC7LongTermState(input());
    expect(again.resultFingerprint).toBe(governed.resultFingerprint);
    assertEuC7LongTermResultCurrent(governed, input());
    expect(() => assertEuC7LongTermResultCurrent(governed, input({ phi: 1.1 }))).toThrow(/stale/);
    const refused = prepareEuC7C6CreepHandoff(governed, { explicitPhiAsPhiEf: false });
    expect(refused.code).toBe("UNSUPPORTED_CONSUMER_BINDING");
    expect(refused.phiEfCandidate).toBeNull();
    expect(refused.replacesStoredPhiEf).toBe(false);
    const copied = prepareEuC7C6CreepHandoff(governed, { explicitPhiAsPhiEf: true });
    expect(copied.code).toBe("EXPLICIT_COPY_NOT_TRANSFORMATION");
    expect(copied.phiEfCandidate).toBe(2.4);
    expect(copied.transformationApplied).toBe(false);
    expect(copied.replacesStoredPhiEf).toBe(false);
    const silentCrack = prepareEuC7R2DurationContext(governed, { explicitRequest: false });
    expect(silentCrack.recomputesCrackWidth).toBe(false);
    expect(silentCrack.durationClass).toBeNull();
    const requestedCrack = prepareEuC7R2DurationContext(governed, { explicitRequest: true });
    expect(requestedCrack.durationClass).toBe("LONG_TERM");
    expect(requestedCrack.recomputesCrackWidth).toBe(false);
    const deflection = prepareEuC7R4DeflectionInputs(governed);
    expect(deflection.phi).toBe(2.4);
    expect(deflection.epsilonCs).toBeCloseTo(0.00032, 12);
    expect(deflection.deflectionCalculated).toBe(false);
    expect(() => selectEuC7Creep()).toThrow(/creep coefficient/);
    expect(() => selectEuC7Shrinkage()).toThrow(/shrinkage strain/);
    expect(() => selectEuC7TimeContext()).toThrow(/time context/);
    expect(() => selectEuC7PhiEfTransformation()).toThrow(/not governed/);
    expect(() => assertEuC7LongTermOptimizerRejectsUngoverned("UNDETERMINED")).toThrow(/ungoverned/);
  });

  it("does not calculate environment or call C6 and crack-width evaluators", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "eu-c7/long-term.ts"), "utf8");
    expect(source).not.toMatch(/relativeHumidity|cementType|notionalSize|evaluateEuC6|evaluateEuC7CrackWidth/);
    expect(source).toContain("SHRINKAGE_MAGNITUDE_POSITIVE");
  });
});
