import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInventory, repoRootFromHere, unclassifiedLedgerOnlyVersions } from "./classify";
import { evaluateLedgerOnlyGuard, evaluateProductionPromotion } from "./guard";
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
    historicalFile: null,
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
    provenance: null,
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
    expect(report.securityBackports).toEqual(["20261007160000", "20261007180000", "20261007190000"]);
    expect(report.superseded).toEqual(["20261007120000", "20261007140000"]);
    expect(report.stagingOnly.length).toBe(18);
    expect(report.unknownDrift).toEqual(["20260810210000", "20260810220000"]);
    expect(report.blocked).toEqual(report.unknownDrift);
    expect(report.recoveredHistorical).toHaveLength(12);
    expect(report.unresolvedBlocked).toEqual(["20260810210000", "20260810220000"]);
    expect(report.unclassifiedLedgerOnly).toEqual([]);
    expect(report.productionApprovedNotApplied).toEqual([]);
  });
});

describe("RTB-REL-1A ledger-only provenance guard", () => {
  const live = buildInventory();
  const recoveredIds = [
    "20260818000000",
    "20260818120000",
    "20260818130000",
    "20260818140000",
    "20260819100000",
    "20260819110000",
    "20260819120000",
    "20260819130000",
    "20260819140000",
    "20260819150000",
    "20260819160000",
    "20260819170000",
  ];

  it("fails an unknown ledger-only version", () => {
    const unknown = record({
      id: "20990101000000",
      file: null,
      releaseState: "BLOCKED",
      driftClass: "UNKNOWN_DRIFT",
      stagingApplied: true,
    });
    const decision = evaluateLedgerOnlyGuard([...live, unknown]);
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.code).toBe("unknown_ledger_only");
      expect(decision.detail).toContain("20990101000000");
    }
  });

  it("passes recovered historical migrations without treating them as unknown drift", () => {
    for (const id of recoveredIds) {
      const row = live.find((item) => item.id === id);
      expect(row?.file).toBeNull();
      expect(row?.historicalFile).toBeTruthy();
      expect(row?.releaseState).toBe("STAGING_ONLY");
      expect(row?.provenance?.recoveryClass).toBe("RECOVERED_FROM_TRUSTED_HISTORY");
      expect(row?.provenance?.checksum).toMatch(/^[0-9a-f]{40}$/);
      const root = repoRootFromHere();
      const blob = execFileSync(
        "git",
        ["hash-object", join("docs/release/historical-migrations", row!.historicalFile!)],
        { encoding: "utf8", cwd: root },
      ).trim();
      expect(blob).toBe(row!.provenance!.checksum);
    }
    expect(evaluateLedgerOnlyGuard(live)).toEqual({ ok: true });
    const promotion = evaluateProductionPromotion({
      proposed: recoveredIds,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(promotion.ok).toBe(false);
    if (!promotion.ok) expect(promotion.code).toBe("staging_only");
  });

  it("passes a superseded historical version with evidence", () => {
    const successor = record({
      id: "20261008000000",
      releaseState: "PRODUCTION_APPLIED",
      productionApplied: true,
      productionEligible: true,
      backports: ["20980101000000"],
    });
    const superseded = record({
      id: "20980101000000",
      file: null,
      historicalFile: null,
      releaseState: "SUPERSEDED",
      driftClass: "SUPERSEDED",
      stagingApplied: true,
      supersededBy: "20261008000000",
      provenance: {
        disposition: "SUPERSEDED",
        recoveryClass: "SUPERSEDED_WITH_EVIDENCE",
        supersedingMigration: "20261008000000",
      },
    });
    expect(evaluateLedgerOnlyGuard([...live, superseded, successor])).toEqual({ ok: true });
    const promotion = evaluateProductionPromotion({
      proposed: ["20980101000000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: [...live, superseded, successor],
    });
    expect(promotion.ok).toBe(false);
    if (!promotion.ok) expect(promotion.code).toBe("superseded");
  });

  it("passes a formally retired historical version", () => {
    const retired = record({
      id: "20970101000000",
      file: null,
      historicalFile: null,
      releaseState: "BLOCKED",
      driftClass: "NONE",
      stagingApplied: true,
      provenance: {
        disposition: "RETIRED",
        recoveryClass: "FORMALLY_RETIRED",
      },
    });
    expect(evaluateLedgerOnlyGuard([...live, retired])).toEqual({ ok: true });
    const promotion = evaluateProductionPromotion({
      proposed: ["20970101000000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: [...live, retired],
    });
    expect(promotion.ok).toBe(false);
    if (!promotion.ok) expect(promotion.code).toBe("blocked");
  });

  it("fails production promotion of a security-relevant unresolved version", () => {
    const row = live.find((item) => item.id === "20260810210000");
    expect(row?.provenance?.recoveryClass).toBe("UNRESOLVED_BLOCKED");
    expect(row?.securityCritical).toBe(true);
    expect(row?.file).toBeNull();
    expect(row?.historicalFile).toBeNull();
    const decision = evaluateProductionPromotion({
      proposed: ["20260810210000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("blocked");
    expect(evaluateLedgerOnlyGuard(live)).toEqual({ ok: true });
  });

  it("passes a certified security backport relationship", () => {
    const decision = evaluateProductionPromotion({
      proposed: ["20261007160000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(decision).toEqual({ ok: true });
    expect(evaluateLedgerOnlyGuard(live)).toEqual({ ok: true });
  });

  it("fails when a ledger snapshot refresh introduces a new unknown version", () => {
    const refreshed = record({
      id: "20990101000001",
      file: null,
      releaseState: "BLOCKED",
      driftClass: "UNKNOWN_DRIFT",
      productionApplied: true,
    });
    expect(unclassifiedLedgerOnlyVersions([...live, refreshed])).toEqual(["20990101000001"]);
    const decision = evaluateLedgerOnlyGuard([...live, refreshed]);
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("unknown_ledger_only");
  });
});
