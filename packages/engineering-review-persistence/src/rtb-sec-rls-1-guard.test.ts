import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20261007120000_rtb_sec_rls_1_public_schema_remediation.sql"),
  "utf8",
);

const REMEDIATED = [
  "digital_twin_source_adapters",
  "digital_twin_state_schemas",
  "digital_twin_source_authority_policies",
  "security_assurance_compliance_frameworks",
  "security_assurance_compliance_framework_versions",
  "security_assurance_compliance_requirements",
  "security_assurance_compliance_control_mappings",
  "security_assurance_customer_claims",
] as const;

describe("RTB-SEC-RLS-1 static regression guard", () => {
  it("enables RLS and revokes anon on every remediated public table", () => {
    for (const table of REMEDIATED) {
      expect(migration, table).toContain(`'${table}'`);
      expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
      expect(migration).toContain("REVOKE ALL ON TABLE public.%I FROM anon");
    }
  });

  it("does not use USING (true) or WITH CHECK (true) on remediated tables", () => {
    expect(migration).not.toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/WITH CHECK\s*\(\s*true\s*\)/i);
  });

  it("does not FORCE RLS globally and does not issue destructive SQL", () => {
    expect(migration).not.toMatch(/FORCE ROW LEVEL SECURITY/i);
    expect(migration).not.toMatch(/^\s*DROP TABLE\b/im);
    expect(migration).not.toMatch(/^\s*TRUNCATE\b/im);
    expect(migration).not.toMatch(/^\s*DELETE FROM\b/im);
  });

  it("reuses is_platform_admin and pins the guard function search_path", () => {
    expect(migration).toContain("public.is_platform_admin()");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.rtb_sec_rls_public_violations()");
    expect(migration).toContain("SET search_path = pg_catalog, public");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.rtb_sec_rls_public_violations() TO service_role");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.rtb_sec_rls_public_violations() FROM anon");
  });

  it("classifies Digital Twin catalogs as PLATFORM_REFERENCE and SA tables as BACKEND_ONLY", () => {
    expect(migration).toContain("digital_twin_source_adapters");
    expect(migration).toContain("PLATFORM_REFERENCE");
    expect(migration).toContain("security_assurance_customer_claims");
    expect(migration).toContain("BACKEND_ONLY");
  });
});
