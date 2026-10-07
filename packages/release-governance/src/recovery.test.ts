import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInventory, repoRootFromHere } from "./classify";
import { evaluateLedgerOnlyGuard, evaluateProductionPromotion } from "./guard";
import { PRODUCTION_PROJECT_REF } from "./types";

const root = repoRootFromHere();
const recoverySqlPath = join(
  root,
  "docs/recovery/sql/rtb_rel_1b_current_state_signup_commercial_lockdown.sql",
);
const recoveryDocPath = join(root, "docs/recovery/RTB_DATABASE_RECOVERY_BASELINE.md");
const handleNewUserPath = join(
  root,
  "supabase/migrations/20260901013000_batch_99_invite_no_stray_tenant.sql",
);

describe("RTB-REL-1B current-state recovery baseline", () => {
  const live = buildInventory();
  const recoverySql = readFileSync(recoverySqlPath, "utf8");
  const recoveryDoc = readFileSync(recoveryDocPath, "utf8");

  it("contains the residual function name and required lockdown", () => {
    expect(recoverySql).toContain("THIS IS A CURRENT-STATE RECOVERY BASELINE");
    expect(recoverySql).toContain("provision_signup_commercial_defaults");
    expect(recoverySql).toMatch(/SET search_path = pg_catalog, public/);
    expect(recoverySql).toMatch(/REVOKE ALL ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) FROM PUBLIC/);
    expect(recoverySql).toMatch(/REVOKE ALL ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) FROM anon/);
    expect(recoverySql).toMatch(/REVOKE ALL ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) FROM authenticated/);
    expect(recoverySql).toMatch(/GRANT EXECUTE ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) TO postgres/);
    expect(recoverySql).toMatch(/GRANT EXECUTE ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) TO service_role/);
  });

  it("does not grant anonymous execute or impersonate historical versions", () => {
    expect(recoverySql).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) TO anon/);
    expect(recoverySql).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) TO authenticated/);
    expect(recoverySql).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.provision_signup_commercial_defaults\(uuid, uuid\) TO PUBLIC/);
    expect(recoverySql).not.toMatch(/^\s*--\s*20260810210000/m);
    expect(recoverySql).not.toMatch(/^\s*--\s*20260810220000/m);
    expect(recoverySql).toContain("IT IS NOT THE ORIGINAL SQL FOR");
    expect(recoverySql).toContain("20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql");
    expect(recoverySql).toContain("It does not CREATE the function on a clean Engineering OS bootstrap");
    expect(recoveryDoc).toContain("DO NOT REPLAY BLOCKED HISTORICAL VERSIONS FROM INFERRED SQL");
  });

  it("keeps blocked historical ledger versions blocked and fail-closed", () => {
    const blocked = ["20260810210000", "20260810220000"];
    for (const id of blocked) {
      const row = live.find((item) => item.id === id);
      expect(row?.releaseState).toBe("BLOCKED");
      expect(row?.provenance?.recoveryClass).toBe("UNRESOLVED_BLOCKED");
      expect(row?.file).toBeNull();
      expect(row?.historicalFile).toBeNull();
      expect(row?.productionEligible).toBe(false);
    }
    expect(live.find((item) => item.id === "20260810210000")?.provenance?.currentStateRecoverability).toBe(
      "NOT_REQUIRED",
    );
    expect(live.find((item) => item.id === "20260810220000")?.provenance?.currentRelevance).toBe("OBSOLETE");
    const promotion = evaluateProductionPromotion({
      proposed: blocked,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(promotion.ok).toBe(false);
    if (!promotion.ok) expect(promotion.code).toBe("blocked");
    expect(evaluateLedgerOnlyGuard(live)).toEqual({ ok: true });
  });

  it("does not promote Business OS historical artifacts into Engineering OS", () => {
    const bos = live.filter((row) => row.module === "business-os");
    expect(bos.length).toBe(12);
    expect(bos.every((row) => row.releaseState === "STAGING_ONLY")).toBe(true);
    expect(bos.every((row) => row.file === null && Boolean(row.historicalFile))).toBe(true);
    const liveNames = readdirSync(join(root, "supabase/migrations")).filter((name) => name.endsWith(".sql"));
    expect(liveNames.some((name) => name.includes("business_os"))).toBe(false);
    const promotion = evaluateProductionPromotion({
      proposed: bos.map((row) => row.id),
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(promotion.ok).toBe(false);
    if (!promotion.ok) expect(promotion.code).toBe("staging_only");
  });

  it("records REL-1D as a contemporary security lockdown, not historical recovery", () => {
    const rel1d = live.find((row) => row.id === "20261007180000");
    expect(rel1d?.file).toBe("20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql");
    expect(rel1d?.releaseState).toBe("PRODUCTION_APPLIED");
    expect(rel1d?.driftClass).toBe("SECURITY_BACKPORT");
    expect(rel1d?.productionEligible).toBe(true);
    const sql = readFileSync(join(root, "supabase/migrations", rel1d!.file!), "utf8");
    expect(sql).toContain("THIS IS NOT reconstruction of 20260810210000");
    expect(sql).not.toMatch(/CREATE OR REPLACE FUNCTION public\.provision_signup_commercial_defaults/i);
    const promotion = evaluateProductionPromotion({
      proposed: ["20261007180000"],
      productionProjectRef: PRODUCTION_PROJECT_REF,
      records: live,
    });
    expect(promotion).toEqual({ ok: true });
  });

  it("keeps supported signup in live migrations, not in the residual function", () => {
    expect(existsSync(handleNewUserPath)).toBe(true);
    const signup = readFileSync(handleNewUserPath, "utf8");
    expect(signup).toContain("CREATE OR REPLACE FUNCTION public.handle_new_user()");
    expect(signup).toContain("SECURITY DEFINER");
    expect(signup).not.toContain("provision_signup_commercial_defaults");
    const liveSql = readdirSync(join(root, "supabase/migrations"))
      .filter((name) => name.endsWith(".sql"))
      .map((name) => readFileSync(join(root, "supabase/migrations", name), "utf8"))
      .join("\n");
    expect(liveSql).not.toContain("CREATE OR REPLACE FUNCTION public.provision_signup_commercial_defaults");
  });
});
