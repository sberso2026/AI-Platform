import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20261007140000_rtb_sec_rls_1a_least_privilege_closeout.sql"),
  "utf8",
);

describe("RTB-SEC-RLS-1A static regression guard", () => {
  it("revokes anonymous table privileges and default privileges", () => {
    expect(migration).toContain("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon");
    expect(migration).toContain("ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon");
    expect(migration).toContain("rtb_anon_table_grant_exceptions");
  });

  it("pins canonical helper search_path and qualifies tenant_memberships", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()");
    expect(migration).toContain("SET search_path = pg_catalog, public");
    expect(migration).toContain("FROM public.tenant_memberships tm");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.get_user_tenant_ids() FROM anon");
  });

  it("does not introduce unrestricted catalog policies or destructive SQL", () => {
    expect(migration).not.toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/WITH CHECK\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/FORCE ROW LEVEL SECURITY/i);
    expect(migration).not.toMatch(/^\s*DROP TABLE\b/im);
    expect(migration).not.toMatch(/^\s*TRUNCATE\b/im);
    expect(migration).not.toMatch(/^\s*DELETE FROM\b/im);
  });

  it("extends the existing violations guard instead of a parallel framework", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.rtb_sec_rls_public_violations()");
    expect(migration).toContain("UNJUSTIFIED_ANON_GRANT");
    expect(migration).toContain("UNSAFE_SECURITY_DEFINER_SEARCH_PATH");
  });
});
