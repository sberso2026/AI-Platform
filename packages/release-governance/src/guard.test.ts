import { describe, expect, it } from "vitest";
import { buildInventory } from "./classify";
import { evaluateProductionPromotion } from "./guard";
import { productionApprovalAllowed, unsatisfiedDependencies } from "./graph";
import { driftReport } from "./report";
import {
  PRODUCTION_PROJECT_REF,
  STAGING_PROJECT_REF,
  type MigrationRecord,
} from "./types";

function record(partial: Partial<MigrationRecord> & Pick<MigrationRecord, "id" | "releaseState">): MigrationRecord {
  return {
    file: `${partial.id}.sql`,
    module: "test",
    driftClass: "NONE",
    stagingApplied: false,
    productionApplied: false,
    productionEligible: false,
    securityCritical: false,
    destructive: false,
    featureDependent: false,
    dependsOn: [],
    supersededBy: null,
    backports: [],
    notes: "",
    ...partial,
  };
}

describe("RTB-REL-1 production promotion guard", () => {
  const live = buildInventory();

  it("fails STAGING_ONLY proposed for production", () => {
    const decision = evaluateProductionPromotion({
      proposed: ["20260808330000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("staging_only");
  });

  it("fails BLOCKED migration proposed for production", () => {
    const decision = evaluateProductionPromotion({
      proposed: ["20260810210000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("blocked");
  });

  it("fails missing dependency", () => {
    const records = [
      record({
        id: "dep_staging_only",
        releaseState: "STAGING_ONLY",
        driftClass: "EXPECTED_FEATURE_DRIFT",
      }),
      record({
        id: "child",
        releaseState: "PRODUCTION_APPROVED",
        productionEligible: true,
        dependsOn: ["dep_staging_only"],
      }),
    ];
    const decision = evaluateProductionPromotion({
      proposed: ["child"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("missing_dependency");
  });

  it("fails unknown migration state", () => {
    const decision = evaluateProductionPromotion({
      proposed: ["99999999999999"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("unknown_state");
  });

  it("passes approved migration with dependencies satisfied", () => {
    const records = [
      record({
        id: "base",
        releaseState: "PRODUCTION_APPLIED",
        productionApplied: true,
        productionEligible: true,
      }),
      record({
        id: "next",
        releaseState: "PRODUCTION_APPROVED",
        productionEligible: true,
        dependsOn: ["base"],
      }),
    ];
    const decision = evaluateProductionPromotion({
      proposed: ["next"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records,
    });
    expect(decision).toEqual({ ok: true });
  });

  it("passes certified security backport that supersedes incompatible staging migrations", () => {
    const rls1 = live.find((row) => row.id === "20261007120000");
    const rls1a = live.find((row) => row.id === "20261007140000");
    const rls1c = live.find((row) => row.id === "20261007160000");
    expect(rls1?.releaseState).toBe("SUPERSEDED");
    expect(rls1a?.releaseState).toBe("SUPERSEDED");
    expect(rls1c?.releaseState).toBe("PRODUCTION_APPLIED");
    expect(rls1c?.backports).toEqual(["20261007120000", "20261007140000"]);
    expect(rls1c?.driftClass).toBe("SECURITY_BACKPORT");
    expect(unsatisfiedDependencies(rls1c!, live)).toEqual([]);
    expect(productionApprovalAllowed(rls1!, live)).toBe(false);
    const direct = evaluateProductionPromotion({
      proposed: ["20261007120000", "20261007140000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(direct.ok).toBe(false);
    const backport = evaluateProductionPromotion({
      proposed: ["20261007160000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(backport).toEqual({ ok: true });
  });

  it("fails production environment identity mismatch", () => {
    const decision = evaluateProductionPromotion({
      proposed: ["20261007160000"],
      productionProjectRef: STAGING_PROJECT_REF,
      records: live,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("identity_mismatch");
  });
});

describe("RTB-REL-1 drift report", () => {
  it("is read-only and surfaces expected drift without treating it as an error", () => {
    const report = driftReport(buildInventory());
    expect(report.readOnly).toBe(true);
    expect(report.synchronizesEnvironments).toBe(false);
    expect(report.counts.inventoried).toBeGreaterThan(149);
    expect(report.securityBackports).toEqual(["20261007160000"]);
    expect(report.superseded).toEqual(["20261007120000", "20261007140000"]);
    expect(report.stagingOnly.length).toBe(6);
    expect(report.unknownDrift.length).toBeGreaterThan(0);
    expect(report.blocked).toEqual(expect.arrayContaining(report.unknownDrift));
    expect(report.productionApprovedNotApplied).toEqual([]);
  });
});
