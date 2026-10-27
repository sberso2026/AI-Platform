import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C7_CALC_CREEP_ONE_DECIMAL_TOLERANCE,
  EU_C7_CALC_CREEP_TWO_DECIMAL_TOLERANCE,
  EU_C7_CALC_METHOD_REVISION,
  EU_C7_CALC_PROFILE_ID,
  EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE,
  EU_C7_R1_PROFILE_VERSION,
  EU_C7_R1_REFERENCE_PROFILE_GENERATION,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED,
  EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED,
  NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED,
  NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED,
  type ConcreteMaterial,
} from "@rtb/types";
import {
  EU_C7_CALC_IMPLEMENTATION_FINGERPRINT,
  EU_C7_CALCULATED_CREEP_CAPABILITY,
  calculateEuC7LongTermState,
  evaluateEuC7LongTermState,
  shrinkageMicrostrainFromStrain,
  shrinkageStrainFromMicrostrain,
  type EuC7CalculatedLongTermInput,
  type EuC7LongTermInput,
} from "./eu-c7";

/**
 * Published Handbook 3 Table 6 class N ultimate creep, C30/37.
 * h0 order is 100, 200, 500, 1000 mm. These literals are the acceptance source.
 */
const CREEP_H0_MM = [100, 200, 500, 1000] as const;
const CREEP_TABLE: Record<number, Record<number, readonly number[]>> = {
  30: {
    1: [5.9, 5.2, 4.5, 4.0],
    7: [4.1, 3.6, 3.1, 2.8],
    28: [3.2, 2.8, 2.4, 2.2],
    90: [2.5, 2.2, 1.9, 1.7],
    360: [1.9, 1.7, 1.5, 1.3],
  },
  50: {
    1: [4.9, 4.4, 3.9, 3.6],
    7: [3.4, 3.1, 2.7, 2.5],
    28: [2.6, 2.4, 2.1, 1.9],
    90: [2.1, 1.9, 1.7, 1.5],
    360: [1.6, 1.4, 1.3, 1.2],
  },
  80: {
    1: [3.4, 3.2, 3.0, 2.9],
    7: [2.39, 2.25, 2.1, 2.0],
    28: [1.8, 1.7, 1.6, 1.6],
    90: [1.5, 1.4, 1.3, 1.2],
    360: [1.1, 1.1, 1.0, 1.0],
  },
};
const CREEP_TWO_DECIMAL = new Set(["80|100|7", "80|200|7"]);

/** Published Handbook 3 Table 7 class N basic drying strain, per mille, before size and time factors. */
const DRYING_TABLE = [
  { fckMPa: 30, values: [0.55, 0.52, 0.43, 0.27, 0.15, 0] },
  { fckMPa: 50, values: [0.43, 0.41, 0.34, 0.21, 0.12, 0] },
  { fckMPa: 70, values: [0.34, 0.32, 0.27, 0.17, 0.09, 0] },
] as const;
const DRYING_RH = [20, 40, 60, 80, 90, 100] as const;

const provenance = {
  sourceEvidence: "c7-r3", sourceRevision: "0", model: null, tool: null, solver: null, version: "c7",
  promptOrTemplate: null, timestamp: "2026-10-12T00:00:00.000Z", jurisdiction: "EU", standard: null,
  calculationMethod: null, confidence: null, validationState: "NUMERICALLY_VALIDATED",
  humanReviewer: null, approvalState: "PENDING_HUMAN_ENGINEERING_REVIEW",
};

function concrete(): ConcreteMaterial {
  return {
    materialRef: "c7-conc", designation: "C30", compressiveStrength: null, tensileStrength: null, elasticModulus: null,
    density: null, poissonRatio: null, age: null, strengthReferenceAge: null, materialClass: null,
    materialStandardRef: "project", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE", testCertificateRef: null,
    environmentalMetadata: null, version: "c7", provenance,
  };
}

function explicitInput(): EuC7LongTermInput {
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
  };
}

function calculated(overrides: Partial<EuC7CalculatedLongTermInput> = {}): EuC7CalculatedLongTermInput {
  return {
    profileId: EU_C7_CALC_PROFILE_ID,
    generation: "GEN1",
    baseEdition: "2004",
    methodRevision: EU_C7_CALC_METHOD_REVISION,
    nationalAnnexId: null,
    temperatureAdjustmentRequested: false,
    calculateCreep: true,
    calculateShrinkage: false,
    creepHorizon: "ULTIMATE",
    shrinkageHorizon: "ULTIMATE",
    fckMPa: 30,
    fcmMPa: null,
    relativeHumidityPercent: 50,
    sectionAreaMm2: null,
    dryingPerimeterMm: null,
    notionalSizeMm: 100,
    geometryProvenanceRef: null,
    notionalSizeProvenanceRef: "handbook-table-6-h0",
    materialProvenanceRef: "handbook-c30",
    humidityProvenanceRef: "handbook-rh",
    cementClass: "N",
    loadingAgeDays: 28,
    dryingStartAgeDays: null,
    evaluationAgeDays: null,
    ...overrides,
  };
}

function creepTolerance(relativeHumidity: number, h0Mm: number, loadingAgeDays: number): number {
  return CREEP_TWO_DECIMAL.has(`${relativeHumidity}|${h0Mm}|${loadingAgeDays}`)
    ? EU_C7_CALC_CREEP_TWO_DECIMAL_TOLERANCE
    : EU_C7_CALC_CREEP_ONE_DECIMAL_TOLERANCE;
}

describe("EOS C7 calculated long-term class N", () => {
  it("keeps the historical explicit-mode locks false", () => {
    expect(NEW_C7_CREEP_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_C7_SHRINKAGE_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED).toBe(false);
    expect(EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED).toBe(false);
    expect(EU_C7_CALCULATED_CREEP_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_C7_CALC_IMPLEMENTATION_FINGERPRINT).not.toBe("9b2c325cdad7b78d");
    expect(EU_C7_CALC_IMPLEMENTATION_FINGERPRINT.startsWith("fp:")).toBe(true);
  });

  it("matches Handbook 3 Table 6 class N within the predeclared rounding tolerance", () => {
    expect(EU_C7_CALC_CREEP_ONE_DECIMAL_TOLERANCE).toBe(0.05);
    expect(EU_C7_CALC_CREEP_TWO_DECIMAL_TOLERANCE).toBe(0.005);
    for (const relativeHumidity of [30, 50, 80]) {
      for (const loadingAgeDays of [1, 7, 28, 90, 360]) {
        CREEP_H0_MM.forEach((h0Mm, index) => {
          const expected = CREEP_TABLE[relativeHumidity][loadingAgeDays][index];
          const result = calculateEuC7LongTermState(calculated({
            relativeHumidityPercent: relativeHumidity,
            notionalSizeMm: h0Mm,
            loadingAgeDays,
          }));
          expect(result.ok, `${relativeHumidity}/${h0Mm}/${loadingAgeDays}`).toBe(true);
          expect(result.creep?.sizeTimeCapAssumed).toBe(false);
          expect(result.creep?.timeDevelopment).toBe(1);
          expect(Math.abs((result.creep?.phi ?? Number.NaN) - expected)).toBeLessThanOrEqual(
            creepTolerance(relativeHumidity, h0Mm, loadingAgeDays),
          );
        });
      }
    }
  });

  it("matches Handbook 3 Table 7 class N and the autogenous closed form", () => {
    expect(EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE).toBe(0.005);
    for (const row of DRYING_TABLE) {
      DRYING_RH.forEach((relativeHumidity, index) => {
        const expectedPerMille = row.values[index];
        const result = calculateEuC7LongTermState(calculated({
          calculateCreep: false,
          calculateShrinkage: true,
          fckMPa: row.fckMPa,
          relativeHumidityPercent: relativeHumidity,
          notionalSizeMm: 100,
          dryingStartAgeDays: 1,
          shrinkageHorizon: "ULTIMATE",
        }));
        expect(result.ok, `${row.fckMPa}/${relativeHumidity}`).toBe(true);
        expect(result.shrinkage?.sizeFactor).toBe(1);
        expect(result.shrinkage?.dryingTimeFactor).toBe(1);
        expect(Math.abs((result.shrinkage?.dryingBasicStrain ?? Number.NaN) * 1000 - expectedPerMille))
          .toBeLessThanOrEqual(EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE);
        const autogenous = 2.5 * (row.fckMPa - 10) * 1e-6;
        expect(Math.abs((result.shrinkage?.autogenousShrinkage ?? Number.NaN) - autogenous)).toBeLessThanOrEqual(1e-12);
        expect(result.shrinkage?.totalShrinkage).toBeCloseTo(
          (result.shrinkage?.autogenousShrinkage ?? 0) + (result.shrinkage?.dryingShrinkage ?? 0),
          12,
        );
        expect(result.shrinkage?.signConvention).toBe("SHRINKAGE_MAGNITUDE_POSITIVE");
        expect(result.shrinkage?.unit).toBe("1");
      });
    }
  });

  it("reports the primary class N creep and shrinkage benchmark with traceable intermediates", () => {
    const creep = calculateEuC7LongTermState(calculated());
    expect(creep.creep?.fcmMPa).toBe(38);
    expect(creep.creep?.phi).not.toBe(2.4);
    expect(creep.calculationMode).toBe("CALCULATED_LONG_TERM_STATE");
    expect(creep.phiEfCalculated).toBe(false);
    expect(creep).not.toHaveProperty("phiEf");
    const shrinkage = calculateEuC7LongTermState(calculated({
      calculateCreep: false,
      calculateShrinkage: true,
      relativeHumidityPercent: 40,
      dryingStartAgeDays: 7,
    }));
    expect(shrinkage.shrinkage?.autogenousShrinkage).toBeCloseTo(0.00005, 12);
    expect(Math.abs((shrinkage.shrinkage?.dryingShrinkage ?? Number.NaN) - 0.00052)).toBeLessThanOrEqual(0.000005);
    expect(shrinkage.shrinkage?.totalShrinkage).toBeCloseTo(
      (shrinkage.shrinkage?.autogenousShrinkage ?? 0) + (shrinkage.shrinkage?.dryingShrinkage ?? 0),
      12,
    );
    expect(shrinkage.shrinkage?.totalShrinkage).not.toBeCloseTo(0.00032, 6);
    expect(shrinkage.shrinkage?.microstrain.autogenous).toBeCloseTo(50, 8);
  });

  it("converts strain and microstrain only through the explicit helper", () => {
    expect(shrinkageMicrostrainFromStrain(0.00032)).toBeCloseTo(320, 10);
    expect(shrinkageStrainFromMicrostrain(320)).toBeCloseTo(0.00032, 12);
    const result = calculateEuC7LongTermState(calculated({
      calculateCreep: false,
      calculateShrinkage: true,
      relativeHumidityPercent: 40,
      dryingStartAgeDays: 7,
    }));
    expect(result.shrinkage?.microstrain.total).toBeCloseTo(shrinkageMicrostrainFromStrain(result.shrinkage?.totalShrinkage ?? 0), 8);
  });

  it("separates explicit supplied state from calculated state", () => {
    const explicit = evaluateEuC7LongTermState(explicitInput());
    const calculatedCreep = calculateEuC7LongTermState(calculated());
    const again = calculateEuC7LongTermState(calculated());
    expect(explicit.accepted).toBe(true);
    expect(explicit.calculatedModel).toBe(false);
    expect(explicit.creepCoefficient).toBe(2.4);
    expect(explicit.shrinkageStrain).toBeCloseTo(0.00032, 12);
    expect(evaluateEuC7LongTermState({ ...explicitInput(), calculateCreep: true }).failReason).toBe("CALCULATED_CREEP_NOT_BOUND");
    expect(evaluateEuC7LongTermState({ ...explicitInput(), calculateShrinkage: true }).failReason).toBe("CALCULATED_SHRINKAGE_NOT_BOUND");
    expect(calculatedCreep.calculationMode).toBe("CALCULATED_LONG_TERM_STATE");
    expect(calculatedCreep.creep?.phi).not.toBe(explicit.creepCoefficient);
    expect(JSON.stringify(again)).toBe(JSON.stringify(calculatedCreep));
  });

  it("fails closed outside the validated envelope", () => {
    expect(calculateEuC7LongTermState(calculated({ cementClass: "S" })).failReason).toBe("CALCULATED_CREEP_CEMENT_CLASS_UNSUPPORTED");
    expect(calculateEuC7LongTermState(calculated({ cementClass: "R" })).failReason).toBe("CALCULATED_CREEP_CEMENT_CLASS_UNSUPPORTED");
    expect(calculateEuC7LongTermState(calculated({
      calculateCreep: false, calculateShrinkage: true, cementClass: "S", dryingStartAgeDays: 7,
    })).failReason).toBe("CALCULATED_SHRINKAGE_CEMENT_CLASS_UNVALIDATED");
    expect(calculateEuC7LongTermState(calculated({
      calculateCreep: false, calculateShrinkage: true, cementClass: "R", dryingStartAgeDays: 7,
    })).failReason).toBe("CALCULATED_SHRINKAGE_CEMENT_CLASS_UNVALIDATED");
    expect(calculateEuC7LongTermState(calculated({ relativeHumidityPercent: null })).failReason).toBe("MISSING_RELATIVE_HUMIDITY");
    expect(calculateEuC7LongTermState(calculated({ relativeHumidityPercent: -1 })).failReason).toBe("RELATIVE_HUMIDITY_OUT_OF_RANGE");
    expect(calculateEuC7LongTermState(calculated({ relativeHumidityPercent: 101 })).failReason).toBe("RELATIVE_HUMIDITY_OUT_OF_RANGE");
    expect(calculateEuC7LongTermState(calculated({
      notionalSizeMm: null, notionalSizeProvenanceRef: null,
    })).failReason).toBe("MISSING_NOTIONAL_SIZE_INPUT");
    expect(calculateEuC7LongTermState(calculated({ notionalSizeMm: 99 })).failReason).toBe("INVALID_NOTIONAL_SIZE");
    expect(calculateEuC7LongTermState(calculated({ notionalSizeMm: 250, sectionAreaMm2: 100000, dryingPerimeterMm: 1000, geometryProvenanceRef: "section-a" })).failReason)
      .toBe("NOTIONAL_SIZE_CONFLICT");
    expect(calculateEuC7LongTermState(calculated({ fckMPa: 11 })).failReason).toBe("INVALID_CONCRETE_STRENGTH");
    expect(calculateEuC7LongTermState(calculated({ fckMPa: 91 })).failReason).toBe("INVALID_CONCRETE_STRENGTH");
    expect(calculateEuC7LongTermState(calculated({ fcmMPa: 40 })).failReason).toBe("FCM_FCK_RELATION_CONFLICT");
    expect(calculateEuC7LongTermState(calculated({ loadingAgeDays: 0 })).failReason).toBe("INVALID_LOADING_AGE");
    expect(calculateEuC7LongTermState(calculated({ loadingAgeDays: -5 })).failReason).toBe("INVALID_LOADING_AGE");
    expect(calculateEuC7LongTermState(calculated({
      creepHorizon: "FINITE", loadingAgeDays: 28, evaluationAgeDays: 10,
    })).failReason).toBe("INVALID_EVALUATION_AGE");
    expect(calculateEuC7LongTermState(calculated({
      creepHorizon: "FINITE", loadingAgeDays: 28, evaluationAgeDays: 100,
    })).failReason).toBe("CREEP_SIZE_TIME_CAP_UNBOUND");
    expect(calculateEuC7LongTermState(calculated({
      calculateCreep: false, calculateShrinkage: true, dryingStartAgeDays: -1,
    })).failReason).toBe("INVALID_DRYING_AGE");
    expect(calculateEuC7LongTermState(calculated({
      calculateCreep: false, calculateShrinkage: true, shrinkageHorizon: "FINITE", dryingStartAgeDays: 20, evaluationAgeDays: 10,
    })).failReason).toBe("INVALID_EVALUATION_AGE");
    expect(calculateEuC7LongTermState(calculated({ temperatureAdjustmentRequested: true })).failReason).toBe("TEMPERATURE_ADJUSTMENT_NOT_BOUND");
    expect(calculateEuC7LongTermState(calculated({ nationalAnnexId: "BS" })).failReason).toBe("UNBOUND_METHOD_PROFILE");
    expect(calculateEuC7LongTermState(calculated({ generation: "GEN2" })).failReason).toBe("UNBOUND_METHOD_PROFILE");
    const unsupported = calculateEuC7LongTermState(calculated({ cementClass: "S" }));
    expect(unsupported.creep).toBeNull();
    expect(unsupported.shrinkage).toBeNull();
    expect(unsupported.ok).toBe(false);
  });

  it("accepts the supported boundaries and derived notional size", () => {
    expect(calculateEuC7LongTermState(calculated({ fckMPa: 12 })).ok).toBe(true);
    expect(calculateEuC7LongTermState(calculated({ fckMPa: 90 })).ok).toBe(true);
    expect(calculateEuC7LongTermState(calculated({ relativeHumidityPercent: 0 })).ok).toBe(true);
    expect(calculateEuC7LongTermState(calculated({ relativeHumidityPercent: 100 })).ok).toBe(true);
    expect(calculateEuC7LongTermState(calculated({ notionalSizeMm: 100 })).ok).toBe(true);
    const atLoading = calculateEuC7LongTermState(calculated({
      creepHorizon: "FINITE", loadingAgeDays: 28, evaluationAgeDays: 28,
    }));
    expect(atLoading.ok).toBe(true);
    expect(atLoading.creep?.phi).toBe(0);
    expect(atLoading.creep?.timeDevelopment).toBe(0);
    const later = calculateEuC7LongTermState(calculated({
      calculateCreep: false,
      calculateShrinkage: true,
      shrinkageHorizon: "FINITE",
      dryingStartAgeDays: 7,
      evaluationAgeDays: 100,
      relativeHumidityPercent: 40,
    }));
    expect(later.ok).toBe(true);
    expect(later.shrinkage?.dryingShrinkage).toBeGreaterThan(0);
    expect(later.shrinkage?.totalShrinkage).toBeCloseTo(
      (later.shrinkage?.autogenousShrinkage ?? 0) + (later.shrinkage?.dryingShrinkage ?? 0),
      12,
    );
    const atDryingStart = calculateEuC7LongTermState(calculated({
      calculateCreep: false,
      calculateShrinkage: true,
      shrinkageHorizon: "FINITE",
      dryingStartAgeDays: 7,
      evaluationAgeDays: 7,
    }));
    expect(atDryingStart.shrinkage?.dryingShrinkage).toBe(0);
    expect(atDryingStart.shrinkage?.totalShrinkage).toBe(atDryingStart.shrinkage?.autogenousShrinkage);
    const derived = calculateEuC7LongTermState(calculated({
      notionalSizeMm: null,
      notionalSizeProvenanceRef: null,
      sectionAreaMm2: 50000,
      dryingPerimeterMm: 1000,
      geometryProvenanceRef: "section-a",
    }));
    expect(derived.creep?.notionalSizeMm).toBe(100);
    expect(derived.creep?.notionalSizeSource).toBe("DERIVED_FROM_AREA_AND_DRYING_PERIMETER");
    const matched = calculateEuC7LongTermState(calculated({
      notionalSizeMm: 100,
      sectionAreaMm2: 50000,
      dryingPerimeterMm: 1000,
      geometryProvenanceRef: "section-a",
    }));
    expect(matched.creep?.notionalSizeSource).toBe("EXPLICIT_MATCHES_DERIVED");
    const low = calculateEuC7LongTermState(calculated({ fckMPa: 12 }));
    expect(low.creep?.alphaStrength).toBeNull();
    const high = calculateEuC7LongTermState(calculated({ fckMPa: 90 }));
    expect(high.creep?.alphaStrength).not.toBeNull();
  });

  it("does not rewrite the historical C7 human review", () => {
    const historical = readFileSync(join(
      dirname(fileURLToPath(import.meta.url)),
      "../../../../docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md",
    ), "utf8").replace(/\r\n/g, "\n");
    expect(historical).toContain("FROZEN_FINGERPRINT:\n9b2c325cdad7b78d");
    expect(historical).toContain("REVIEWER_OUTCOME:\nREVIEW_INCOMPLETE");
    expect(historical).toContain("INDEPENDENT_RESULT:\nBLANK");
  });
});
