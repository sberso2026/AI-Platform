import type { SteelCapacityEngineInput, SteelMemberDesignCheckKind } from "@rtb/types";
import { APPLICABILITY_EQUALS_PASS } from "@rtb/types";
import { detectRequiredInteractions } from "../au-combined/detect";

export type MemberApplicability = Record<SteelMemberDesignCheckKind, boolean>;

function axialN(input: SteelCapacityEngineInput): number {
  const extra = input.combined?.componentDemands?.find((row) => row.kind === "AXIAL");
  if (extra) return extra.signed !== 0 ? extra.signed : extra.value;
  const axial = input.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") return 0;
  return axial.valueN;
}

function momentMajorAbs(input: SteelCapacityEngineInput): number {
  const extra = input.combined?.componentDemands?.find((row) => row.kind === "MOMENT_MAJOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.moment.signed !== 0 ? input.demand.moment.signed : input.demand.moment.value);
}

function momentMinorAbs(input: SteelCapacityEngineInput): number {
  const extra = input.combined?.componentDemands?.find((row) => row.kind === "MOMENT_MINOR");
  if (!extra) return 0;
  return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
}

function shearAbs(input: SteelCapacityEngineInput): number {
  const extra = input.combined?.componentDemands?.find((row) => row.kind === "SHEAR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.shear.signed !== 0 ? input.demand.shear.signed : input.demand.shear.value);
}

export function resolveMemberApplicability(input: {
  capacityInput: SteelCapacityEngineInput;
  serviceabilityRequested: boolean;
  otherServiceabilityRequested: boolean;
}): MemberApplicability {
  if (APPLICABILITY_EQUALS_PASS) throw new Error("applicability must not equal pass");
  const n = axialN(input.capacityInput);
  const mx = momentMajorAbs(input.capacityInput);
  const my = momentMinorAbs(input.capacityInput);
  const v = shearAbs(input.capacityInput);
  const tension = n > 0;
  const compression = n < 0;
  const shearAxis = input.capacityInput.shear?.shearAxis;
  const interaction = detectRequiredInteractions(input.capacityInput).length > 0;
  const unbraced = input.capacityInput.stability?.unbracedLengthM != null && input.capacityInput.stability.unbracedLengthM > 0;
  return {
    TENSION: tension,
    COMPRESSION: compression,
    STABILITY_COMPRESSION: compression,
    BENDING_MAJOR: mx > 0,
    BENDING_MINOR: my > 0,
    STABILITY_LTB: (mx > 0 || my > 0) && unbraced,
    SHEAR_MAJOR: v > 0 && shearAxis !== "MINOR_SHEAR",
    SHEAR_MINOR: v > 0 && shearAxis === "MINOR_SHEAR",
    COMBINED_ACTION: interaction,
    WEB_STABILITY: false,
    DEFLECTION: input.serviceabilityRequested,
    OTHER_SERVICEABILITY: input.otherServiceabilityRequested,
  };
}
