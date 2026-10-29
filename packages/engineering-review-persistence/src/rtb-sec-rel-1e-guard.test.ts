import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFINER_RUNTIME_CLASS,
  publicOrAnonPrivilegedWriterWithoutJustification,
  untrustedExecuteOnQuarantined,
  untrustedExecuteWithoutJustification,
} from "./security-definer-execute-guard";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20261007190000_rtb_sec_rel_1e_privileged_rpc_authorization_hardening.sql"),
  "utf8",
);
const applyRunner = readFileSync(
  resolve(root, "packages/engineering-review-persistence/scripts/rtb-sec-rel-1e-apply-production.ts"),
  "utf8",
);
const register = readFileSync(resolve(root, "docs/security/RTB_PRIVILEGED_RPC_REGISTER.md"), "utf8");

describe("RTB-SEC-REL-1E privileged RPC hardening guards", () => {
  it("is a non-destructive grant and authorization hardening migration", () => {
    expect(migration).toContain("THIS IS NOT reconstruction of 20260810210000 or 20260810220000");
    expect(migration).toContain("Does not DROP functions");
    expect(migration).not.toMatch(/^\s*DROP FUNCTION\b/im);
    expect(migration).not.toMatch(/^\s*DROP TABLE\b/im);
    expect(migration).not.toMatch(/^\s*TRUNCATE\b/im);
    expect(migration).not.toMatch(/EXCEPTION\s+WHEN\s+OTHERS/i);
    expect(migration).not.toMatch(/GRANT EXECUTE[\s\S]{0,160}TO\s+anon\b/i);
    expect(migration).not.toMatch(/GRANT EXECUTE[\s\S]{0,160}TO PUBLIC/i);
    expect(migration).toContain("rtb_sec_rel_1e_assert_tenant_caller");
  });

  it("restricts backend/trigger/PI execute and keeps justified authenticated writers", () => {
    expect(migration).toContain("'public.create_default_tenant_roles(uuid)'");
    expect(migration).toContain("EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC'");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os(uuid) TO authenticated");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin");
    expect(applyRunner).toContain('const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget"');
    expect(applyRunner).toContain("rtb-sec-rel-1e apply refuses any file other than the 1E hardening migration");
    expect(applyRunner).not.toContain("npx --yes supabase link --project-ref rntonzigxwxcjlcsadip");
  });

  it("classifies every in-scope runtime family and fails closed for PUBLIC/anon writers", () => {
    expect(Object.keys(DEFINER_RUNTIME_CLASS).length).toBeGreaterThanOrEqual(28);
    expect(register).toContain("RTB Privileged RPC Register");
    expect(register).toContain("SAFE_CLIENT_RPC");
    expect(register).toContain("SAFE_BACKEND_RPC");
    expect(register).toContain("UNSAFE_ACTIVE mitigated");
    expect(
      publicOrAnonPrivilegedWriterWithoutJustification([
        { name: "create_default_tenant_roles", grantee: "PUBLIC" },
        { name: "seed_engineering_os_demo_data", grantee: "anon" },
      ]),
    ).toEqual(["create_default_tenant_roles:PUBLIC", "seed_engineering_os_demo_data:anon"]);
    expect(
      untrustedExecuteOnQuarantined([{ name: "pi_document_claim_jobs", grantee: "authenticated" }]),
    ).toEqual(["pi_document_claim_jobs:authenticated"]);
    expect(
      untrustedExecuteWithoutJustification([
        { name: "get_user_tenant_ids", grantee: "authenticated" },
        { name: "seed_tenant_engineering_os", grantee: "authenticated" },
        { name: "bump_commercial_entitlement_version", grantee: "postgres" },
      ]),
    ).toEqual([]);
  });
});
