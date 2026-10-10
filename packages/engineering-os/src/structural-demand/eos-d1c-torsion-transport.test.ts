import { describe, expect, it } from "vitest";
import {
  D1C_TORSIONAL_ACTION_AXIS,
  D1C_TORSIONAL_ACTION_ID,
  D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
  D1C_TORSIONAL_ACTION_TYPE,
  D1C_TORSIONAL_ACTION_UNIT,
  EU_SPECIFIC_TORSION_ACTION_CREATED,
  GENERAL_FEA_IMPLEMENTED,
  GENERAL_TORSIONAL_ANALYSIS_IMPLEMENTED,
  TORSION_DEMAND_SCOPE,
  TORSIONAL_ACTION_TRANSPORT_IMPLEMENTED,
  type StructuralLoadApplication,
} from "@rtb/types";
import { runDeterministicDemand } from "./engine";
import { transportGovernedTorsionalAction } from "./torsion-action";

const evidence = { evidenceId: "ev-torsion", sourceKind: "human_input" as const, reference: "governed action schedule" };

function udl(): StructuralLoadApplication {
  return {
    applicationId: "g",
    loadCaseId: "g",
    actionCategory: "DEAD",
    kind: "UNIFORM_DISTRIBUTED_LOAD",
    coordinateSystem: "LOCAL_MEMBER",
    memberLocalResolved: true,
    targetMemberId: "m1",
    targetNodeId: null,
    positionM: null,
    startM: 0,
    endM: 8,
    magnitude: { value: 10, unit: "kN/m" },
    endMagnitude: null,
    direction: "TRANSVERSE",
    evidenceRef: evidence,
    externalSource: null,
  };
}

function run(governedTorsion?: Parameters<typeof runDeterministicDemand>[0]["governedTorsion"]) {
  return runDeterministicDemand({
    resultId: "d-torsion",
    memberId: "m1",
    spanM: 8,
    spanUnit: "m",
    boundaryCondition: "SIMPLE_SIMPLE",
    applications: [udl()],
    factors: [{ loadCaseId: "g", factor: 1, provenanceRef: "human", source: "HUMAN_ENTERED" }],
    combinationId: "comb-1",
    standardContext: "JURISDICTION_NEUTRAL_STATICS",
    evidenceRefs: [evidence],
    governedTorsion,
  });
}

const provenance = {
  evidenceId: "ev-torsion",
  sourceDiscipline: "structural",
  sourceObjectId: "action-schedule-r1",
  revision: "1",
};

describe("EOS-D1E-EU-C5-T1 D1C torsional action transport", () => {
  it("keeps analytical torsion unimplemented and transports only an explicit action", () => {
    expect(TORSION_DEMAND_SCOPE).toBe("NOT_IMPLEMENTED");
    expect(TORSIONAL_ACTION_TRANSPORT_IMPLEMENTED).toBe(true);
    expect(GENERAL_TORSIONAL_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(GENERAL_FEA_IMPLEMENTED).toBe(false);
    expect(EU_SPECIFIC_TORSION_ACTION_CREATED).toBe(false);
    expect(D1C_TORSIONAL_ACTION_ID).toBe("MEMBER_TORSION");
    expect(D1C_TORSIONAL_ACTION_TYPE).toBe("EXPLICIT_GOVERNED_ACTION");
    expect(D1C_TORSIONAL_ACTION_UNIT).toBe("N.m");
    expect(D1C_TORSIONAL_ACTION_AXIS).toBe("MEMBER_X");
    expect(D1C_TORSIONAL_ACTION_SIGN_CONVENTION).toBe("RIGHT_HAND_ABOUT_MEMBER_X_INCREASING");
    const absent = run();
    expect(absent.torsion.status).toBe("NOT_IMPLEMENTED");
    expect(absent.shear.value).toBeGreaterThan(0);
  });

  it("accepts signed values, zero, and equivalent units with one fingerprint", () => {
    const positive = run({ value: 12.5, unit: "kN.m", axis: "MEMBER_X", combinationId: "comb-1", provenance });
    const same = run({ value: 12500, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance });
    const negative = run({ value: -12500, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance });
    const zero = run({ value: 0, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance });
    expect(positive.torsion.status).toBe("TRANSPORTED");
    if (positive.torsion.status !== "TRANSPORTED" || same.torsion.status !== "TRANSPORTED") return;
    if (negative.torsion.status !== "TRANSPORTED" || zero.torsion.status !== "TRANSPORTED") return;
    expect(positive.torsion.signedValueNm).toBe(12500);
    expect(positive.torsion.unit).toBe("N.m");
    expect(positive.torsion.fingerprint).toBe(same.torsion.fingerprint);
    expect(negative.torsion.signedValueNm).toBe(-12500);
    expect(negative.torsion.fingerprint).not.toBe(positive.torsion.fingerprint);
    expect(zero.torsion.signedValueNm).toBe(0);
    expect(positive.shear.value).toBe(same.shear.value);
  });

  it("fails closed on missing, non-finite, invalid unit, axis, and provenance", () => {
    const context = { combinationId: "comb-1", evidenceRefs: [evidence] };
    expect(() => transportGovernedTorsionalAction({ unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance }, context)).toThrow(/missing value/);
    expect(() => transportGovernedTorsionalAction({ value: Number.NaN, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance }, context)).toThrow(/finite/);
    expect(() => transportGovernedTorsionalAction({ value: Number.POSITIVE_INFINITY, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1", provenance }, context)).toThrow(/finite/);
    expect(() => transportGovernedTorsionalAction({ value: 1, unit: "kN", axis: "MEMBER_X", combinationId: "comb-1", provenance }, context)).toThrow(/unit/);
    expect(() => transportGovernedTorsionalAction({ value: 1, unit: "N.m", axis: "GLOBAL_Z", combinationId: "comb-1", provenance }, context)).toThrow(/axis/);
    expect(() => transportGovernedTorsionalAction({ value: 1, unit: "N.m", axis: "MEMBER_X", combinationId: "comb-1" }, context)).toThrow(/provenance/);
    expect(() => transportGovernedTorsionalAction({
      value: 1,
      unit: "N.m",
      axis: "MEMBER_X",
      combinationId: "other",
      provenance,
    }, context)).toThrow(/combination/);
    expect(() => run({
      value: 1,
      unit: "N.m",
      axis: "MEMBER_X",
      combinationId: "comb-1",
      provenance: { ...provenance, evidenceId: "missing" },
    })).toThrow(/evidence/);
  });
});
