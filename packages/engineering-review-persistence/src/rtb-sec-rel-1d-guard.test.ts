import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  untrustedExecuteOnQuarantined,
  untrustedExecuteWithoutJustification,
} from "./security-definer-execute-guard";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql"),
  "utf8",
);
const applyRunner = readFileSync(
  resolve(root, "packages/engineering-review-persistence/scripts/rtb-sec-rel-1d-apply-production.ts"),
  "utf8",
);
const recoverySql = readFileSync(
  resolve(root, "docs/recovery/sql/rtb_rel_1b_current_state_signup_commercial_lockdown.sql"),
  "utf8",
);

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

describe("RTB-SEC-REL-1D residual DEFINER lockdown guards", () => {
  it("is a non-destructive privilege reduction of one residual function", () => {
    expect(migration).toContain("THIS IS NOT reconstruction of 20260810210000");
    expect(migration).toContain("THIS IS NOT reconstruction of 20260810220000");
    expect(migration).toContain("Does not DROP the function");
    expect(migration).not.toMatch(/^\s*DROP FUNCTION\b/im);
    expect(migration).not.toMatch(/^\s*DROP TABLE\b/im);
    expect(migration).not.toMatch(/^\s*TRUNCATE\b/im);
    expect(migration).not.toMatch(/^\s*DELETE FROM\b/im);
    expect(migration).not.toMatch(/^\s*INSERT INTO public\./im);
    expect(migration).not.toMatch(/^\s*UPDATE public\./im);
    expect(migration).not.toMatch(/EXCEPTION\s+WHEN\s+OTHERS/i);
    expect(migration).not.toMatch(/CREATE OR REPLACE FUNCTION public\.provision_signup_commercial_defaults/i);
    expect(migration).not.toMatch(/CREATE OR REPLACE FUNCTION public\.handle_new_user/i);
    expect(migration).not.toMatch(/CREATE OR REPLACE FUNCTION public\.handle_new_tenant/i);
    expect(sha256(migration).length).toBe(64);
  });

  it("revokes untrusted execute and pins search_path", () => {
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM PUBLIC");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM anon");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM authenticated");
    expect(migration).toContain("SET search_path = pg_catalog, public");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) TO postgres");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) TO service_role");
    expect(migration).not.toMatch(/GRANT EXECUTE[\s\S]{0,120}TO\s+anon/i);
    expect(migration).not.toMatch(/GRANT EXECUTE[\s\S]{0,120}TO\s+authenticated/i);
    expect(migration).not.toMatch(/GRANT EXECUTE[\s\S]{0,80}TO PUBLIC/i);
  });

  it("applies only the 1D file to Engineering OS production", () => {
    expect(applyRunner).toContain('const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget"');
    expect(applyRunner).toContain("rtb-sec-rel-1d apply refuses any file other than the 1D lockdown");
    expect(applyRunner).toContain("refusing untrusted EXECUTE grant");
    expect(applyRunner).not.toContain("20261007120000");
    expect(applyRunner).not.toContain("npx --yes supabase link --project-ref rntonzigxwxcjlcsadip");
    expect(recoverySql).toContain("REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM PUBLIC");
  });

  it("fails closed if the quarantined residual function regains untrusted execute", () => {
    expect(
      untrustedExecuteOnQuarantined([
        { name: "provision_signup_commercial_defaults", grantee: "anon" },
      ]),
    ).toEqual(["provision_signup_commercial_defaults:anon"]);
    expect(
      untrustedExecuteOnQuarantined([
        { name: "provision_signup_commercial_defaults", grantee: "postgres" },
        { name: "get_user_tenant_ids", grantee: "authenticated" },
      ]),
    ).toEqual([]);
  });

  it("fails closed for unclassified PUBLIC/anon execute and unclassified authenticated execute", () => {
    expect(
      untrustedExecuteWithoutJustification([
        { name: "get_user_tenant_ids", grantee: "authenticated" },
        { name: "has_permission", grantee: "authenticated" },
        { name: "provision_signup_commercial_defaults", grantee: "postgres" },
      ]),
    ).toEqual([]);
    expect(
      untrustedExecuteWithoutJustification([
        { name: "seed_tenant_engineering_os", grantee: "PUBLIC" },
        { name: "create_default_tenant_roles", grantee: "anon" },
        { name: "bump_commercial_entitlement_version", grantee: "authenticated" },
        { name: "provision_signup_commercial_defaults", grantee: "authenticated" },
      ]),
    ).toEqual([
      "seed_tenant_engineering_os:PUBLIC:REQUIRES_REVIEW",
      "create_default_tenant_roles:anon:QUARANTINED",
      "provision_signup_commercial_defaults:authenticated:QUARANTINED",
    ]);
  });
});
