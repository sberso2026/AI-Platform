import { describe, expect, it } from "vitest";
import {
  D1C_TORSIONAL_ACTION_AXIS,
  D1C_TORSIONAL_ACTION_ID,
  D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
  D1C_TORSIONAL_ACTION_TYPE,
  D1C_TORSIONAL_ACTION_UNIT,
  EU_C5_T4_RELATIVE_TOLERANCE,
  EU_C5_T4_RESISTANCE_TOLERANCE_NM,
} from "@rtb/types";
import { evaluateEuC5Torsion, type EuC5EvaluateInput } from "./eu-c5/evaluate";
import { transportGovernedTorsionalAction } from "../structural-demand/torsion-action";

const FLOW = 2;
const N_MM_PER_N_M = 1000;

function independentRectangle(width: number, height: number, wall: number | null) {
  const area = width * height;
  const perimeter = FLOW * (width + height);
  const thickness = wall == null ? area / perimeter : Math.min(area / perimeter, wall);
  const innerWidth = width - thickness;
  const innerHeight = height - thickness;
  return { thickness, enclosed: innerWidth * innerHeight, loop: FLOW * (innerWidth + innerHeight) };
}

function independentResistanceNm(input: {
  width: number;
  height: number;
  wall: number | null;
  fck: number;
  alpha: number;
  gammaC: number;
  cot: number;
}): number {
  const tube = independentRectangle(input.width, input.height, input.wall);
  const nu = 0.6 * (1 - input.fck / 250);
  const fcd = (input.alpha * input.fck) / input.gammaC;
  const strut = input.cot / (1 + input.cot * input.cot);
  return (FLOW * nu * 1 * fcd * tube.enclosed * tube.thickness * strut) / N_MM_PER_N_M;
}

function independentSteel(torsionNm: number, tube: { enclosed: number; loop: number }, cot: number, fyk: number, gammaS: number) {
  const fyd = fyk / gammaS;
  const demand = Math.abs(torsionNm) * N_MM_PER_N_M;
  return {
    transverse: demand === 0 ? 0 : demand / (FLOW * tube.enclosed * fyd * cot),
    longitudinal: demand === 0 ? 0 : (demand * cot * tube.loop) / (FLOW * tube.enclosed * fyd),
  };
}

function demand(signedNm: number): EuC5EvaluateInput["demand"] {
  return {
    resultId: "d1c-t4",
    capacityPresent: false,
    memberId: "m-t4",
    combinationId: "uls-t",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    torsion: {
      status: "TRANSPORTED",
      actionId: D1C_TORSIONAL_ACTION_ID,
      actionType: D1C_TORSIONAL_ACTION_TYPE,
      signedValueNm: signedNm,
      unit: D1C_TORSIONAL_ACTION_UNIT,
      axis: D1C_TORSIONAL_ACTION_AXIS,
      signConvention: D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
      combinationId: "uls-t",
      provenance: { evidenceId: "ev-t", sourceDiscipline: "STRUCTURAL", sourceObjectId: "member", revision: "A" },
      fingerprint: "fp-demand",
    },
  };
}

function request(patch: Partial<NonNullable<EuC5EvaluateInput["torsionRequest"]>> = {}): NonNullable<EuC5EvaluateInput["torsionRequest"]> {
  return {
    profileId: "EU-EN1992-1-1-GEN1-TORSION-REFERENCE",
    generation: "EN1992-1-1-FIRST_GENERATION",
    profileVersion: "d1e-eu-c5-t3r.1",
    sectionKind: "RECTANGULAR_SOLID",
    widthMm: 400,
    heightMm: 600,
    cotTheta: 2,
    prestressed: false,
    signedShearN: 0,
    fckMPa: 30,
    concreteElasticModulusMPa: 33000,
    fykLongitudinalMPa: 500,
    fykTransverseMPa: 500,
    reinforcementElasticModulusMPa: 200000,
    reinforcementReferenceAreaMm2: 100,
    alphaCc: 1,
    gammaC: 1.5,
    gammaS: 1.15,
    ndpSourceRef: "declared-project-ndp",
    transverseProvidedMm2PerMm: 2,
    longitudinalProvidedMm2: 4000,
    ...patch,
  };
}

function run(signedNm: number, patch: Partial<NonNullable<EuC5EvaluateInput["torsionRequest"]>> = {}) {
  return evaluateEuC5Torsion({ demand: demand(signedNm), torsionRequest: request(patch) });
}

describe("EOS-D1E-EU-C5-T4 bounded torsion", () => {
  it("matches an independent closed-form calculation and keeps the checks separate", () => {
    const hand = independentResistanceNm({ width: 400, height: 600, wall: null, fck: 30, alpha: 1, gammaC: 1.5, cot: 2 });
    const tube = independentRectangle(400, 600, null);
    const steel = independentSteel(50_000, tube, 2, 500, 1.15);
    const result = run(50_000);
    expect(result.ok).toBe(true);
    expect(result.resistance?.unit).toBe("N.m");
    expect(Math.abs((result.resistance?.value ?? 0) - hand)).toBeLessThan(EU_C5_T4_RESISTANCE_TOLERANCE_NM);
    expect(result.torsionDetail?.transverseRequirementMm2PerMm).toBeCloseTo(steel.transverse, 8);
    expect(result.torsionDetail?.longitudinalRequirementMm2).toBeCloseTo(steel.longitudinal, 6);
    expect(result.torsionDetail?.interactionRatio).toBeCloseTo(50_000 / hand, 8);
    expect(result.torsionDetail?.governingCheck).toBe("STRUT_INTERACTION");
    expect(result.checkState).toBe("CHECK_SATISFIED");
    expect(run(50_000).fingerprint).toBe(result.fingerprint);
    expect(run(50_000, { cotTheta: 1 }).fingerprint).not.toBe(result.fingerprint);
  });

  it("covers the bounded edges without designing reinforcement", () => {
    const hand = independentResistanceNm({ width: 400, height: 600, wall: null, fck: 30, alpha: 1, gammaC: 1.5, cot: 2 });
    const low = run(1_000);
    expect(low.torsionDetail?.interactionRatio).toBeCloseTo(1_000 / hand, 8);
    expect(low.checkState).toBe("CHECK_SATISFIED");
    const tube = independentRectangle(400, 600, null);
    const over = run(hand + 1);
    expect(over.torsionDetail?.governingCheck).toBe("STRUT_INTERACTION");
    expect(over.checkState).toBe("CHECK_NOT_SATISFIED");
    const steel = independentSteel(50_000, tube, 2, 500, 1.15);
    const transverse = run(50_000, { transverseProvidedMm2PerMm: steel.transverse / 2 });
    expect(transverse.torsionDetail?.governingCheck).toBe("TRANSVERSE_REINFORCEMENT");
    expect(transverse.torsionDetail?.transverseCheck).toBe("CHECK_NOT_SATISFIED");
    const longitudinal = run(50_000, { longitudinalProvidedMm2: steel.longitudinal / 2 });
    expect(longitudinal.torsionDetail?.governingCheck).toBe("LONGITUDINAL_REINFORCEMENT");
    const interaction = run(hand / 2, { signedShearN: 100_000, shearResistanceMaxN: 100_000 });
    expect(interaction.torsionDetail?.interactionRatio).toBeCloseTo(1.5, 8);
    expect(interaction.checkState).toBe("CHECK_NOT_SATISFIED");
    const zeroShear = run(hand / 2, { signedShearN: 0 });
    expect(zeroShear.ok).toBe(true);
    expect(zeroShear.torsionDetail?.interactionRatio).toBeCloseTo(0.5, 8);
    const minimum = run(10_000, { cotTheta: 1 });
    const maximum = run(10_000, { cotTheta: 2.5 });
    expect(minimum.resistance?.value).toBeCloseTo(independentResistanceNm({ width: 400, height: 600, wall: null, fck: 30, alpha: 1, gammaC: 1.5, cot: 1 }), 6);
    expect(maximum.resistance?.value).toBeCloseTo(independentResistanceNm({ width: 400, height: 600, wall: null, fck: 30, alpha: 1, gammaC: 1.5, cot: 2.5 }), 6);
    const negative = run(-50_000);
    expect(negative.torsionDetail?.signedTorsionalDemandNm).toBe(-50_000);
    expect(negative.resistance?.value).toBeCloseTo(hand, 6);
    const zero = run(0, { transverseProvidedMm2PerMm: 0, longitudinalProvidedMm2: 0 });
    expect(zero.checkState).toBe("CHECK_SATISFIED");
    expect(zero.torsionDetail?.transverseRequirementMm2PerMm).toBe(0);
  });

  it("fails closed and treats equivalent demand units through the transported newton-metre value", () => {
    expect(run(Number.NaN).failReason).toBe("INVALID_INPUT");
    expect(run(Number.POSITIVE_INFINITY).failReason).toBe("INVALID_INPUT");
    expect(evaluateEuC5Torsion({ demand: { ...demand(1), torsion: { status: "NOT_IMPLEMENTED" } } }).failReason).toBe("D1C_TORSION_DEMAND_NOT_AVAILABLE");
    expect(run(10_000, { cotTheta: 0.5 }).failReason).toBe("INVALID_INPUT");
    expect(run(10_000, { cotTheta: 3 }).failReason).toBe("INVALID_INPUT");
    expect(run(10_000, { alphaCc: Number.NaN }).failReason).toBe("MISSING_NDP");
    expect(run(10_000, { gammaC: Number.NaN }).failReason).toBe("MISSING_NDP");
    expect(run(10_000, { gammaS: Number.NaN }).failReason).toBe("MISSING_NDP");
    expect(run(10_000, { fckMPa: Number.NaN }).failReason).toBe("MISSING_MATERIAL_PARAMETER");
    expect(run(10_000, { widthMm: 0 }).failReason).toBe("MISSING_GEOMETRY");
    expect(run(10_000, { sectionKind: "OTHER" }).failReason).toBe("UNSUPPORTED_GEOMETRY");
    expect(run(10_000, { sectionKind: "RECTANGULAR_HOLLOW" }).failReason).toBe("MISSING_GEOMETRY");
    expect(run(10_000, { transverseProvidedMm2PerMm: Number.NaN }).failReason).toBe("MISSING_SHEAR_REINFORCEMENT_DATA");
    expect(run(10_000, { longitudinalProvidedMm2: Number.NaN }).failReason).toBe("MISSING_LONGITUDINAL_REINFORCEMENT");
    expect(run(10_000, { profileId: "NA-DE" }).failReason).toBe("UNSUPPORTED_RULE_APPLICABILITY");
    expect(run(10_000, { profileVersion: "stale" }).failReason).toBe("STALE_RESULT");
    expect(run(10_000, { signedShearN: 10 }).failReason).toBe("INVALID_INPUT");
    const hollow = run(20_000, { sectionKind: "RECTANGULAR_HOLLOW", actualWallThicknessMm: 80 });
    expect(hollow.resistance?.value).toBeCloseTo(independentResistanceNm({ width: 400, height: 600, wall: 80, fck: 30, alpha: 1, gammaC: 1.5, cot: 2 }), 6);
    const hand = independentResistanceNm({ width: 400, height: 600, wall: null, fck: 30, alpha: 1, gammaC: 1.5, cot: 2 });
    const transported = transportGovernedTorsionalAction({
      value: 50,
      unit: "kN.m",
      axis: "MEMBER_X",
      combinationId: "uls-t",
      provenance: { evidenceId: "ev-t", sourceDiscipline: "STRUCTURAL", sourceObjectId: "member", revision: "A" },
    }, {
      combinationId: "uls-t",
      evidenceRefs: [{ evidenceId: "ev-t", sourceKind: "human_input", reference: "governed action schedule" }],
    });
    expect(transported.signedValueNm).toBe(50_000);
    expect(run(transported.signedValueNm).resistance?.value).toBeCloseTo(hand, 6);
    expect(Math.abs(run(50_000).resistance!.value - run(transported.signedValueNm).resistance!.value)).toBeLessThan(EU_C5_T4_RELATIVE_TOLERANCE);
  });
});
