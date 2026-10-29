import {
  EU_C7_CALC_BASE_EDITION,
  EU_C7_CALC_CREEP_METHOD_ID,
  EU_C7_CALC_CREEP_ONE_DECIMAL_TOLERANCE,
  EU_C7_CALC_CREEP_TWO_DECIMAL_TOLERANCE,
  EU_C7_CALC_FCK_MAX_MPA,
  EU_C7_CALC_FCK_MIN_MPA,
  EU_C7_CALC_FCM_OFFSET_MPA,
  EU_C7_CALC_FULL_EN1992_CONFORMANCE,
  EU_C7_CALC_GENERATION,
  EU_C7_CALC_H0_MIN_MM,
  EU_C7_CALC_METHOD_REVISION,
  EU_C7_CALC_NATIONAL_ANNEX_VALIDATED,
  EU_C7_CALC_NOTIONAL_CONSISTENCY_ABS_MM,
  EU_C7_CALC_PHI_EF_CALCULATED,
  EU_C7_CALC_PROFILE_ID,
  EU_C7_CALC_REGULATORY_APPROVAL,
  EU_C7_CALC_RH_MAX_PERCENT,
  EU_C7_CALC_RH_MIN_PERCENT,
  EU_C7_CALC_SHRINKAGE_METHOD_ID,
  EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE,
  EU_C7_CALC_SIZE_TIME_CAP_ASSUMED,
  EU_C7_CALC_STANDARD_FAMILY,
  EU_C7_CALC_TEMPERATURE_ADJUSTMENT_IMPLEMENTED,
  EU_C7_CALC_VALIDATED_CEMENT_CLASS,
  SI_MICROSTRAIN_PER_UNIT_STRAIN,
} from "@rtb/types";
import { formulaFingerprint } from "../eu-c1b/fingerprint";

export const EU_C7_CALC_CALCULATION_MODE = "CALCULATED_LONG_TERM_STATE" as const;
export const EU_C7_CALC_EXPLICIT_CALCULATION_MODE = "EXPLICIT_LONG_TERM_STATE" as const;
export const EU_C7_CALC_SHRINKAGE_SIGN = "SHRINKAGE_MAGNITUDE_POSITIVE" as const;
export const EU_C7_CALC_STRAIN_UNIT = "1" as const;
export const EU_C7_CALC_APPLICABILITY_ENVELOPE =
  "EN 1992-1-1 GEN1 base edition 2004 informative Handbook 3 class N linear ultimate creep and class N shrinkage. Cement classes S and R fail closed. Finite-age creep fails closed because no size-time cap was recovered. No temperature adjustment. Not a National Annex and not full EN 1992 conformance." as const;

/**
 * Drying cement coefficients from the method basis.
 * Only class N is applied. S and R remain recorded and fail closed.
 */
export const EU_C7_CALC_DRYING_CEMENT_COEFFICIENTS = {
  S: { first: 3, second: 0.13, productionValidated: false },
  N: { first: 4, second: 0.12, productionValidated: true },
  R: { first: 6, second: 0.11, productionValidated: false },
} as const;

const SIZE_FACTOR_ANCHORS = [
  { h0Mm: 100, factor: 1 },
  { h0Mm: 200, factor: 0.85 },
  { h0Mm: 300, factor: 0.75 },
  { h0Mm: 500, factor: 0.7 },
] as const;

export const EU_C7_CALC_IMPLEMENTATION_FINGERPRINT = formulaFingerprint({
  ruleId: EU_C7_CALC_METHOD_REVISION,
  operations: [
    "fcm = fck + 8 MPa",
    "humidityFactor low strength = 1 + (1 - RH/100) / (0.1 * h0^(1/3))",
    "humidityFactor high strength = (1 + (1 - RH/100) / (0.1 * h0^(1/3)) * alphaStrength) * alphaHumidity",
    "alphaStrength = (35/fcm)^0.7",
    "alphaHumidity = (35/fcm)^0.2",
    "alphaTime = (35/fcm)^0.5",
    "strengthFactor = 16.8 / sqrt(fcm)",
    "loadingAgeFactor = 1 / (0.1 + t0^0.2)",
    "notionalCreep = humidityFactor * strengthFactor * loadingAgeFactor",
    "sizeTimeTerm low = 1.5 * (1 + (0.012 * RH)^18) * h0 + 250",
    "sizeTimeTerm high = 1.5 * (1 + (0.012 * RH)^18) * h0 + 250 * alphaTime",
    "ultimate timeDevelopment = 1",
    "phi at loading = 0",
    "finite t > t0 = CREEP_SIZE_TIME_CAP_UNBOUND",
    "autogenous ultimate strain = 2.5 * (fck - 10) * 1e-6",
    "autogenous time factor = 1 - exp(-0.2 * t^0.5)",
    "drying basic strain class N = 0.85 * (220 + 110 * 4) * exp(-0.12 * fcm / 10) * 1.55 * (1 - (RH/100)^3) * 1e-6",
    "drying time factor = (t - ts) / ((t - ts) + 0.04 * sqrt(h0^3))",
    "size factor linear between published anchors 100, 200, 300, 500",
    "total shrinkage = autogenous + drying",
    "h0 = 2Ac/u",
  ],
  parameterIds: [
    "fckMPa",
    "relativeHumidityPercent",
    "notionalSizeMm",
    "cementClass",
    "loadingAgeDays",
    "dryingStartAgeDays",
    "evaluationAgeDays",
  ],
});

export type EuC7CalculatedCementClass = "S" | "N" | "R";
export type EuC7CalculatedHorizon = "ULTIMATE" | "FINITE";
export type EuC7NotionalSizeSource =
  | "DERIVED_FROM_AREA_AND_DRYING_PERIMETER"
  | "EXPLICITLY_SUPPLIED_WITH_PROVENANCE"
  | "EXPLICIT_MATCHES_DERIVED";

export type EuC7CalculatedLongTermInput = {
  profileId: string;
  generation: string;
  baseEdition: string;
  methodRevision: string;
  nationalAnnexId: string | null;
  temperatureAdjustmentRequested: boolean;
  calculateCreep: boolean;
  calculateShrinkage: boolean;
  creepHorizon: EuC7CalculatedHorizon;
  shrinkageHorizon: EuC7CalculatedHorizon;
  fckMPa: number | null;
  fcmMPa: number | null;
  relativeHumidityPercent: number | null;
  sectionAreaMm2: number | null;
  dryingPerimeterMm: number | null;
  notionalSizeMm: number | null;
  geometryProvenanceRef: string | null;
  notionalSizeProvenanceRef: string | null;
  materialProvenanceRef: string | null;
  humidityProvenanceRef: string | null;
  cementClass: EuC7CalculatedCementClass | null;
  loadingAgeDays: number | null;
  dryingStartAgeDays: number | null;
  evaluationAgeDays: number | null;
};

export type EuC7CalculatedCreepIntermediates = {
  fcmMPa: number;
  notionalSizeMm: number;
  notionalSizeSource: EuC7NotionalSizeSource;
  humidityFactor: number;
  alphaStrength: number | null;
  alphaHumidity: number | null;
  alphaTime: number | null;
  strengthFactor: number;
  loadingAgeFactor: number;
  notionalCreep: number;
  sizeTimeTerm: number;
  timeDevelopment: number;
  phi: number;
  sizeTimeCapAssumed: false;
  sizeTimeCapRelevance: "IRRELEVANT_AT_ULTIMATE" | "IRRELEVANT_AT_LOADING";
};

export type EuC7CalculatedShrinkage = {
  autogenousShrinkage: number;
  dryingShrinkage: number;
  totalShrinkage: number;
  dryingBasicStrain: number;
  sizeFactor: number;
  dryingTimeFactor: number;
  autogenousTimeFactor: number;
  unit: typeof EU_C7_CALC_STRAIN_UNIT;
  signConvention: typeof EU_C7_CALC_SHRINKAGE_SIGN;
  perMille: { autogenous: number; drying: number; total: number };
  microstrain: { autogenous: number; drying: number; total: number };
};

export type EuC7CalculatedLongTermResult = {
  ok: boolean;
  calculationMode: typeof EU_C7_CALC_CALCULATION_MODE;
  failReason: string | null;
  creepMethodId: typeof EU_C7_CALC_CREEP_METHOD_ID;
  shrinkageMethodId: typeof EU_C7_CALC_SHRINKAGE_METHOD_ID;
  methodRevision: typeof EU_C7_CALC_METHOD_REVISION;
  standardFamily: typeof EU_C7_CALC_STANDARD_FAMILY;
  generation: typeof EU_C7_CALC_GENERATION;
  baseEdition: typeof EU_C7_CALC_BASE_EDITION;
  applicabilityEnvelope: typeof EU_C7_CALC_APPLICABILITY_ENVELOPE;
  implementationFingerprint: typeof EU_C7_CALC_IMPLEMENTATION_FINGERPRINT;
  phiEfCalculated: false;
  temperatureAdjustmentImplemented: false;
  creepSizeTimeCapAssumed: false;
  fullEn1992Conformance: false;
  nationalAnnexValidated: false;
  regulatoryApproval: false;
  creep: EuC7CalculatedCreepIntermediates | null;
  shrinkage: EuC7CalculatedShrinkage | null;
};

export function shrinkageMicrostrainFromStrain(strain: number): number {
  return strain * SI_MICROSTRAIN_PER_UNIT_STRAIN;
}

export function shrinkageStrainFromMicrostrain(microstrain: number): number {
  return microstrain / SI_MICROSTRAIN_PER_UNIT_STRAIN;
}

function present(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finiteNumber(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function failure(reason: string): EuC7CalculatedLongTermResult {
  return {
    ok: false,
    calculationMode: EU_C7_CALC_CALCULATION_MODE,
    failReason: reason,
    creepMethodId: EU_C7_CALC_CREEP_METHOD_ID,
    shrinkageMethodId: EU_C7_CALC_SHRINKAGE_METHOD_ID,
    methodRevision: EU_C7_CALC_METHOD_REVISION,
    standardFamily: EU_C7_CALC_STANDARD_FAMILY,
    generation: EU_C7_CALC_GENERATION,
    baseEdition: EU_C7_CALC_BASE_EDITION,
    applicabilityEnvelope: EU_C7_CALC_APPLICABILITY_ENVELOPE,
    implementationFingerprint: EU_C7_CALC_IMPLEMENTATION_FINGERPRINT,
    phiEfCalculated: false,
    temperatureAdjustmentImplemented: false,
    creepSizeTimeCapAssumed: false,
    fullEn1992Conformance: false,
    nationalAnnexValidated: false,
    regulatoryApproval: false,
    creep: null,
    shrinkage: null,
  };
}

function sizeFactor(h0Mm: number): number {
  if (h0Mm >= SIZE_FACTOR_ANCHORS[SIZE_FACTOR_ANCHORS.length - 1].h0Mm) return 0.7;
  for (let index = 0; index < SIZE_FACTOR_ANCHORS.length - 1; index += 1) {
    const left = SIZE_FACTOR_ANCHORS[index];
    const right = SIZE_FACTOR_ANCHORS[index + 1];
    if (h0Mm >= left.h0Mm && h0Mm <= right.h0Mm) {
      return left.factor + ((right.factor - left.factor) * (h0Mm - left.h0Mm)) / (right.h0Mm - left.h0Mm);
    }
  }
  return 0.7;
}

function resolveNotional(input: EuC7CalculatedLongTermInput):
  | { ok: false; reason: string }
  | { ok: true; h0Mm: number; source: EuC7NotionalSizeSource } {
  const hasArea = input.sectionAreaMm2 !== null || input.dryingPerimeterMm !== null;
  const hasExplicit = input.notionalSizeMm !== null;
  if (!hasArea && !hasExplicit) return { ok: false, reason: "MISSING_NOTIONAL_SIZE_INPUT" };
  let derived: number | null = null;
  if (hasArea) {
    if (!finiteNumber(input.sectionAreaMm2) || !finiteNumber(input.dryingPerimeterMm)) {
      return { ok: false, reason: "MISSING_NOTIONAL_SIZE_INPUT" };
    }
    if (input.sectionAreaMm2 <= 0 || input.dryingPerimeterMm <= 0) return { ok: false, reason: "INVALID_NOTIONAL_SIZE" };
    if (!present(input.geometryProvenanceRef)) return { ok: false, reason: "MISSING_NOTIONAL_SIZE_INPUT" };
    derived = (2 * input.sectionAreaMm2) / input.dryingPerimeterMm;
  }
  if (hasExplicit) {
    if (!finiteNumber(input.notionalSizeMm)) return { ok: false, reason: "INVALID_NOTIONAL_SIZE" };
    if (!present(input.notionalSizeProvenanceRef)) return { ok: false, reason: "MISSING_NOTIONAL_SIZE_INPUT" };
    if (derived !== null && Math.abs(input.notionalSizeMm - derived) > EU_C7_CALC_NOTIONAL_CONSISTENCY_ABS_MM) {
      return { ok: false, reason: "NOTIONAL_SIZE_CONFLICT" };
    }
  }
  const h0Mm = derived ?? input.notionalSizeMm;
  if (!finiteNumber(h0Mm) || h0Mm <= 0 || h0Mm < EU_C7_CALC_H0_MIN_MM) return { ok: false, reason: "INVALID_NOTIONAL_SIZE" };
  const source: EuC7NotionalSizeSource = derived !== null && hasExplicit
    ? "EXPLICIT_MATCHES_DERIVED"
    : derived !== null
      ? "DERIVED_FROM_AREA_AND_DRYING_PERIMETER"
      : "EXPLICITLY_SUPPLIED_WITH_PROVENANCE";
  return { ok: true, h0Mm, source };
}

function creepTerms(fckMPa: number, relativeHumidityPercent: number, h0Mm: number, loadingAgeDays: number) {
  const fcmMPa = fckMPa + EU_C7_CALC_FCM_OFFSET_MPA;
  const highStrength = fcmMPa > 35;
  const alphaStrength = highStrength ? (35 / fcmMPa) ** 0.7 : null;
  const alphaHumidity = highStrength ? (35 / fcmMPa) ** 0.2 : null;
  const alphaTime = highStrength ? (35 / fcmMPa) ** 0.5 : null;
  const humidityCore = (1 - relativeHumidityPercent / 100) / (0.1 * h0Mm ** (1 / 3));
  const humidityFactor = highStrength
    ? (1 + humidityCore * (alphaStrength as number)) * (alphaHumidity as number)
    : 1 + humidityCore;
  const strengthFactor = 16.8 / Math.sqrt(fcmMPa);
  const loadingAgeFactor = 1 / (0.1 + loadingAgeDays ** 0.2);
  const notionalCreep = humidityFactor * strengthFactor * loadingAgeFactor;
  const humidityPower = (0.012 * relativeHumidityPercent) ** 18;
  const sizeTimeTerm = highStrength
    ? 1.5 * (1 + humidityPower) * h0Mm + 250 * (alphaTime as number)
    : 1.5 * (1 + humidityPower) * h0Mm + 250;
  return {
    fcmMPa, alphaStrength, alphaHumidity, alphaTime, humidityFactor, strengthFactor,
    loadingAgeFactor, notionalCreep, sizeTimeTerm,
  };
}

function dryingBasicStrain(fckMPa: number, relativeHumidityPercent: number): number {
  const fcmMPa = fckMPa + EU_C7_CALC_FCM_OFFSET_MPA;
  const coefficient = EU_C7_CALC_DRYING_CEMENT_COEFFICIENTS.N;
  const humidity = 1.55 * (1 - (relativeHumidityPercent / 100) ** 3);
  return 0.85 * ((220 + 110 * coefficient.first) * Math.exp((-coefficient.second * fcmMPa) / 10)) * humidity * 1e-6;
}

function componentStrain(strain: number) {
  return {
    strain,
    perMille: strain * 1000,
    microstrain: shrinkageMicrostrainFromStrain(strain),
  };
}

export function calculateEuC7LongTermState(input: EuC7CalculatedLongTermInput): EuC7CalculatedLongTermResult {
  if (
    input.profileId !== EU_C7_CALC_PROFILE_ID
    || input.generation !== EU_C7_CALC_GENERATION
    || input.baseEdition !== EU_C7_CALC_BASE_EDITION
    || input.methodRevision !== EU_C7_CALC_METHOD_REVISION
    || input.nationalAnnexId !== null
  ) return failure("UNBOUND_METHOD_PROFILE");
  if (input.temperatureAdjustmentRequested || EU_C7_CALC_TEMPERATURE_ADJUSTMENT_IMPLEMENTED) {
    return failure("TEMPERATURE_ADJUSTMENT_NOT_BOUND");
  }
  if (!input.calculateCreep && !input.calculateShrinkage) return failure("UNBOUND_METHOD_PROFILE");
  if (!present(input.materialProvenanceRef)) return failure("UNBOUND_METHOD_PROFILE");
  if (!finiteNumber(input.fckMPa) || input.fckMPa < EU_C7_CALC_FCK_MIN_MPA || input.fckMPa > EU_C7_CALC_FCK_MAX_MPA) {
    return failure("INVALID_CONCRETE_STRENGTH");
  }
  const fcmMPa = input.fckMPa + EU_C7_CALC_FCM_OFFSET_MPA;
  if (input.fcmMPa !== null && (!finiteNumber(input.fcmMPa) || Math.abs(input.fcmMPa - fcmMPa) > 1e-9)) {
    return failure("FCM_FCK_RELATION_CONFLICT");
  }
  if (input.relativeHumidityPercent === null) return failure("MISSING_RELATIVE_HUMIDITY");
  if (!present(input.humidityProvenanceRef)) return failure("MISSING_RELATIVE_HUMIDITY");
  if (
    !finiteNumber(input.relativeHumidityPercent)
    || input.relativeHumidityPercent < EU_C7_CALC_RH_MIN_PERCENT
    || input.relativeHumidityPercent > EU_C7_CALC_RH_MAX_PERCENT
  ) return failure("RELATIVE_HUMIDITY_OUT_OF_RANGE");
  const notional = resolveNotional(input);
  if (!notional.ok) return failure(notional.reason);
  if (input.cementClass === null) return failure("MISSING_CEMENT_CLASS");
  if (input.calculateCreep && input.cementClass !== EU_C7_CALC_VALIDATED_CEMENT_CLASS) {
    return failure("CALCULATED_CREEP_CEMENT_CLASS_UNSUPPORTED");
  }
  if (input.calculateShrinkage && input.cementClass !== EU_C7_CALC_VALIDATED_CEMENT_CLASS) {
    return failure("CALCULATED_SHRINKAGE_CEMENT_CLASS_UNVALIDATED");
  }
  if (input.calculateCreep) {
    if (!finiteNumber(input.loadingAgeDays) || input.loadingAgeDays <= 0) return failure("INVALID_LOADING_AGE");
    if (input.creepHorizon === "FINITE") {
      if (!finiteNumber(input.evaluationAgeDays) || input.evaluationAgeDays <= 0) return failure("INVALID_EVALUATION_AGE");
      if (input.evaluationAgeDays < input.loadingAgeDays) return failure("INVALID_EVALUATION_AGE");
      if (input.evaluationAgeDays > input.loadingAgeDays) return failure("CREEP_SIZE_TIME_CAP_UNBOUND");
    }
  }
  if (input.calculateShrinkage) {
    if (!finiteNumber(input.dryingStartAgeDays) || input.dryingStartAgeDays < 0) return failure("INVALID_DRYING_AGE");
    if (input.shrinkageHorizon === "FINITE") {
      if (!finiteNumber(input.evaluationAgeDays) || input.evaluationAgeDays <= 0) return failure("INVALID_EVALUATION_AGE");
      if (input.evaluationAgeDays < input.dryingStartAgeDays) return failure("INVALID_EVALUATION_AGE");
    }
  }

  const creep = input.calculateCreep
    ? (() => {
        const terms = creepTerms(input.fckMPa as number, input.relativeHumidityPercent as number, notional.h0Mm, input.loadingAgeDays as number);
        const atLoading = input.creepHorizon === "FINITE";
        const timeDevelopment = atLoading ? 0 : 1;
        const phi = terms.notionalCreep * timeDevelopment;
        return {
          ...terms,
          notionalSizeMm: notional.h0Mm,
          notionalSizeSource: notional.source,
          timeDevelopment,
          phi,
          sizeTimeCapAssumed: false as const,
          sizeTimeCapRelevance: atLoading ? "IRRELEVANT_AT_LOADING" as const : "IRRELEVANT_AT_ULTIMATE" as const,
        };
      })()
    : null;

  const shrinkage = input.calculateShrinkage
    ? (() => {
        const basic = dryingBasicStrain(input.fckMPa as number, input.relativeHumidityPercent as number);
        const factor = sizeFactor(notional.h0Mm);
        const ultimate = input.shrinkageHorizon === "ULTIMATE";
        const age = ultimate ? null : input.evaluationAgeDays as number;
        const autogenousTime = ultimate ? 1 : 1 - Math.exp(-0.2 * Math.sqrt(age as number));
        const dryingTime = ultimate
          ? 1
          : ((age as number) - (input.dryingStartAgeDays as number))
            / (((age as number) - (input.dryingStartAgeDays as number)) + 0.04 * Math.sqrt(notional.h0Mm ** 3));
        const autogenousShrinkage = 2.5 * ((input.fckMPa as number) - 10) * 1e-6 * autogenousTime;
        const dryingShrinkage = basic * factor * dryingTime;
        const totalShrinkage = autogenousShrinkage + dryingShrinkage;
        const autogenousParts = componentStrain(autogenousShrinkage);
        const dryingParts = componentStrain(dryingShrinkage);
        const totalParts = componentStrain(totalShrinkage);
        return {
          autogenousShrinkage,
          dryingShrinkage,
          totalShrinkage,
          dryingBasicStrain: basic,
          sizeFactor: factor,
          dryingTimeFactor: dryingTime,
          autogenousTimeFactor: autogenousTime,
          unit: EU_C7_CALC_STRAIN_UNIT,
          signConvention: EU_C7_CALC_SHRINKAGE_SIGN,
          perMille: { autogenous: autogenousParts.perMille, drying: dryingParts.perMille, total: totalParts.perMille },
          microstrain: { autogenous: autogenousParts.microstrain, drying: dryingParts.microstrain, total: totalParts.microstrain },
        };
      })()
    : null;

  return {
    ok: true,
    calculationMode: EU_C7_CALC_CALCULATION_MODE,
    failReason: null,
    creepMethodId: EU_C7_CALC_CREEP_METHOD_ID,
    shrinkageMethodId: EU_C7_CALC_SHRINKAGE_METHOD_ID,
    methodRevision: EU_C7_CALC_METHOD_REVISION,
    standardFamily: EU_C7_CALC_STANDARD_FAMILY,
    generation: EU_C7_CALC_GENERATION,
    baseEdition: EU_C7_CALC_BASE_EDITION,
    applicabilityEnvelope: EU_C7_CALC_APPLICABILITY_ENVELOPE,
    implementationFingerprint: EU_C7_CALC_IMPLEMENTATION_FINGERPRINT,
    phiEfCalculated: EU_C7_CALC_PHI_EF_CALCULATED,
    temperatureAdjustmentImplemented: EU_C7_CALC_TEMPERATURE_ADJUSTMENT_IMPLEMENTED,
    creepSizeTimeCapAssumed: EU_C7_CALC_SIZE_TIME_CAP_ASSUMED,
    fullEn1992Conformance: EU_C7_CALC_FULL_EN1992_CONFORMANCE,
    nationalAnnexValidated: EU_C7_CALC_NATIONAL_ANNEX_VALIDATED,
    regulatoryApproval: EU_C7_CALC_REGULATORY_APPROVAL,
    creep,
    shrinkage,
  };
}

export const EU_C7_CALC_DECLARED_TOLERANCES = {
  creepOneDecimalAbsolute: EU_C7_CALC_CREEP_ONE_DECIMAL_TOLERANCE,
  creepTwoDecimalAbsolute: EU_C7_CALC_CREEP_TWO_DECIMAL_TOLERANCE,
  shrinkagePerMilleAbsolute: EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE,
  shrinkageStrainAbsolute: EU_C7_CALC_SHRINKAGE_PER_MILLE_TOLERANCE / 1000,
  autogenousClosedFormAbsolute: 1e-12,
  rationale: "Creep tolerance is half the published Handbook 3 Table 6 place value. Shrinkage tolerance is half the published Table 7 hundredth of a per mille. Autogenous tolerance is exact arithmetic of the published closed form. These limits were fixed from the published precision before comparison.",
} as const;
