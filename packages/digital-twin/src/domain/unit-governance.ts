/**
 * Phase 12D — Unit governance for quantitative twin state values.
 *
 * Requires unitSystem/unitCode for quantitative fields. Reuses platform SI/imperial codes —
 * no competing unit framework.
 */

export const ENGINEERING_UNIT_SYSTEMS = ["SI", "imperial", "dimensionless"] as const;
export type EngineeringUnitSystem = (typeof ENGINEERING_UNIT_SYSTEMS)[number];

/** Common engineering unit codes aligned with platform conventions */
export const ENGINEERING_UNIT_CODES = [
  "m",
  "mm",
  "km",
  "ft",
  "in",
  "degC",
  "degF",
  "K",
  "Pa",
  "kPa",
  "MPa",
  "bar",
  "psi",
  "N",
  "kN",
  "kW",
  "MW",
  "pct",
  "ratio",
  "none",
] as const;

export type EngineeringUnitCode = (typeof ENGINEERING_UNIT_CODES)[number];

export type UnitGovernanceRecord = {
  unitSystem: EngineeringUnitSystem;
  unitCode: EngineeringUnitCode;
  conversionMethod?: string;
  conversionSourceRef?: string;
};

export function assertQuantitativeUnits(input: {
  hasQuantitativeValue: boolean;
  unitSystem?: string;
  unitCode?: string;
}): UnitGovernanceRecord | undefined {
  if (!input.hasQuantitativeValue) return undefined;
  if (!input.unitSystem || !input.unitCode) {
    throw new Error("quantitative_state_requires_unit_system_and_code");
  }
  if (!ENGINEERING_UNIT_SYSTEMS.includes(input.unitSystem as EngineeringUnitSystem)) {
    throw new Error(`unsupported_unit_system:${input.unitSystem}`);
  }
  if (!ENGINEERING_UNIT_CODES.includes(input.unitCode as EngineeringUnitCode)) {
    throw new Error(`unsupported_unit_code:${input.unitCode}`);
  }
  return {
    unitSystem: input.unitSystem as EngineeringUnitSystem,
    unitCode: input.unitCode as EngineeringUnitCode,
  };
}

export function recordUnitConversion(input: {
  unit: UnitGovernanceRecord;
  conversionMethod: string;
  conversionSourceRef?: string;
}): UnitGovernanceRecord {
  return {
    ...input.unit,
    conversionMethod: input.conversionMethod,
    conversionSourceRef: input.conversionSourceRef,
  };
}
