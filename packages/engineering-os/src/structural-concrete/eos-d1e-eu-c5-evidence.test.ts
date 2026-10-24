import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_IMPLEMENTED_TORSION_METHOD_IDS,
  EU_C5_PUNCHING_INTERIOR_METHOD_ID,
  EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
  EU_C5_TORSION_RULE_AUTHORITY_COMPLETE,
  NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED,
  TORSION_DEMAND_SCOPE,
} from "@rtb/types";
import { D1E_VALIDATION_DEBT_REGISTER } from "./capability";

const baselinePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../engineering-os-certification/security/sca-moderate-baseline.json",
);

describe("EOS-D1E-EU-C5-EVIDENCE torsion recovery freeze", () => {
  it("keeps the implemented shear and punching methods and adds no torsion method", () => {
    expect(EU_C5_IMPLEMENTED_METHOD_IDS).toContain("EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT");
    expect(EU_C5_IMPLEMENTED_METHOD_IDS).toContain("EU_RC_PUNCHING_EN1992_INTERIOR_RECTANGULAR_CONCRETE");
    expect(EU_C5_IMPLEMENTED_TORSION_METHOD_IDS).toEqual(["EU_RC_TORSION_EN1992_RECTANGULAR_REFERENCE"]);
    expect(EU_C5_TORSION_RULE_AUTHORITY_COMPLETE).toBe(true);
    expect(NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED).toBe(true);
    expect(TORSION_DEMAND_SCOPE).toBe("NOT_IMPLEMENTED");
  });

  it("keeps torsion validation debt unresolved and records the moderate audit drift", () => {
    expect(D1E_VALIDATION_DEBT_REGISTER.find((row) => row.debtId === "D1E-EU-VD-TORSION")?.blockingState).toBe(
      "PARTIAL",
    );
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as {
      recordKind: string;
      rerunModerateCount: number;
      lockfileChangedFromC4Baseline: boolean;
      findings: { advisory: string; introducedByCurrentPhase: boolean; disposition: string }[];
    };
    expect(baseline.recordKind).toBe("VISIBLE_DEBT_NOT_AN_EXCEPTION");
    expect(baseline.lockfileChangedFromC4Baseline).toBe(false);
    expect(baseline.rerunModerateCount).toBe(4);
    expect(baseline.findings.map((row) => row.advisory)).toEqual([
      "GHSA-w5hq-g745-h8pq",
      "GHSA-hp3w-g68c-fv3c",
      "GHSA-4jqv-mc3x-m676",
      "GHSA-mcj8-r9mp-w47p",
    ]);
    expect(baseline.findings.every((row) => row.introducedByCurrentPhase === false)).toBe(true);
    expect(baseline.findings.every((row) => row.disposition !== "DOWNGRADED")).toBe(true);
  });
});
