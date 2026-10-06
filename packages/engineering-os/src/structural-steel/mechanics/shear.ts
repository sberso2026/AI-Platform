import type {
  SteelCapacityEngineInput,
  SteelGovernedProperty,
  SteelShearAxis,
  SteelShearStiffenerState,
  SteelWebSlendernessContext,
} from "@rtb/types";
import { SILENT_SHEAR_AREA_ASSUMPTION, STEEL_SHEAR_STIFFENER_STATES } from "@rtb/types";
import { toForceN } from "../../structural-demand/units";
import { toAreaM2, toStressPa } from "./tension-force";
import { toElasticModulusPa } from "./euler";

/** Jurisdiction-neutral length conversion. Not a design-code rule. */
export function toLengthM(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m") return property.value;
  if (property.unit === "mm") return property.value * 1e-3;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

/** Jurisdiction-neutral Poisson ratio. Not a design-code rule. */
export function poissonRatio(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (property.unit && property.unit !== "1" && property.unit !== "-") {
    throw new Error(`steel design fail closed: units incompatible for ${label}`);
  }
  if (!(property.value > 0) || !(property.value < 0.5)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  return property.value;
}

/** Governed plate buckling coefficient. Never defaulted. */
export function bucklingCoefficient(property: SteelGovernedProperty): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error("steel design fail closed: missing shear buckling coefficient");
  }
  return property.value;
}

/**
 * Von Mises pure-shear yield force Vy = fy × Av / √3.
 * Established engineering mechanics. Not EN 1993 Vpl,Rd and not AS 4100 φVv.
 */
export function vonMisesShearYieldN(fy: SteelGovernedProperty, shearArea: SteelGovernedProperty): number {
  if (fy.unit === "MPa" && shearArea.unit === "mm2" && typeof fy.value === "number" && typeof shearArea.value === "number") {
    if (!(fy.value > 0) || !(shearArea.value > 0)) throw new Error("steel design fail closed: missing material.yieldStrength");
    return (fy.value * shearArea.value) / Math.sqrt(3);
  }
  return toStressPa(fy, "material.yieldStrength") * toAreaM2(shearArea, "section.shearArea") / Math.sqrt(3);
}

/**
 * Elastic critical shear force for a plate: τcr = kv π² E / (12(1-ν²)(d/t)²); Vcr = τcr × Av.
 * kv must be supplied; it is never defaulted from aspect ratio. Not EN 1993 web resistance.
 */
export function elasticShearBucklingForceN(input: {
  EPa: number;
  poisson: number;
  kv: number;
  webDepthM: number;
  webThicknessM: number;
  shearAreaM2: number;
}): number {
  const { EPa, poisson, kv, webDepthM, webThicknessM, shearAreaM2 } = input;
  if (!(EPa > 0) || !(kv > 0) || !(webDepthM > 0) || !(webThicknessM > 0) || !(shearAreaM2 > 0)) {
    throw new Error("steel design fail closed: missing elastic shear-buckling input");
  }
  const slenderness = webDepthM / webThicknessM;
  const tauCrPa = (kv * Math.PI * Math.PI * EPa) / (12 * (1 - poisson * poisson) * slenderness * slenderness);
  return tauCrPa * shearAreaM2;
}

export function demandShearN(shear: { value: number; unit: string; signed: number }): number {
  if (!Number.isFinite(shear.value) || !shear.unit?.trim()) {
    throw new Error("steel design fail closed: demand missing");
  }
  const magnitude = Math.abs(shear.signed !== 0 ? shear.signed : shear.value);
  try {
    return toForceN({ value: magnitude, unit: shear.unit });
  } catch {
    throw new Error("steel design fail closed: units incompatible");
  }
}

export function shearAxisFromInput(input: SteelCapacityEngineInput): SteelShearAxis {
  if (input.limitState === "SHEAR_MAJOR") {
    if (input.shear?.shearAxis && input.shear.shearAxis !== "MAJOR_SHEAR") {
      throw new Error("steel design fail closed: missing axis");
    }
    return "MAJOR_SHEAR";
  }
  if (input.limitState === "SHEAR_MINOR") {
    if (input.shear?.shearAxis && input.shear.shearAxis !== "MINOR_SHEAR") {
      throw new Error("steel design fail closed: missing axis");
    }
    return "MINOR_SHEAR";
  }
  if (input.limitState === "SHEAR") {
    const axis = input.shear?.shearAxis;
    if (axis === "MAJOR_SHEAR" || axis === "MINOR_SHEAR") return axis;
    throw new Error("steel design fail closed: missing axis");
  }
  throw new Error("steel design fail closed: missing axis");
}

export function requireStiffenerState(input: SteelCapacityEngineInput): SteelShearStiffenerState {
  const state = input.shear?.stiffenerState;
  if (!state || state === "unknown") {
    throw new Error("steel design fail closed: unknown required stiffener state");
  }
  if (!(STEEL_SHEAR_STIFFENER_STATES as readonly string[]).includes(state)) {
    throw new Error("steel design fail closed: unknown required stiffener state");
  }
  return state;
}

export function assertShearAreaNotAssumed(usedGrossArea: boolean): void {
  if (SILENT_SHEAR_AREA_ASSUMPTION || usedGrossArea) {
    throw new Error("steel design fail closed: missing section.shearArea");
  }
}

export function bucklingContextRequested(input: SteelCapacityEngineInput): boolean {
  return Boolean(
    input.section.webDepth
    || input.section.webThickness
    || input.material.poissonRatio
    || input.shear?.shearBucklingCoefficient
    || input.shear?.stiffenerSpacing
    || input.shear?.panelLength,
  );
}

export function webSlendernessContext(input: SteelCapacityEngineInput, stiffenerState: SteelShearStiffenerState): SteelWebSlendernessContext {
  const depth = input.section.webDepth;
  const thickness = input.section.webThickness;
  let clearWebDepth: number | null = null;
  let webThickness: number | null = null;
  let slendernessRatio: number | null = null;
  if (depth && thickness) {
    clearWebDepth = toLengthM(depth, "section.webDepth");
    webThickness = toLengthM(thickness, "section.webThickness");
    slendernessRatio = clearWebDepth / webThickness;
  }
  return {
    clearWebDepth,
    webThickness,
    slendernessRatio,
    stiffenerState,
    limitState: "VALIDATION_REQUIRED",
    technicalRuleRef: null,
  };
}

export function assertAiCannotInventShear(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", valuesPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !valuesPresent) {
    throw new Error("AI cannot supply missing shear parameters");
  }
}

export { toAreaM2, toElasticModulusPa };
