import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migration1 = readFileSync(
  resolve(root, "supabase/migrations/20261007120000_rtb_sec_rls_1_public_schema_remediation.sql"),
  "utf8",
);
const migration1a = readFileSync(
  resolve(root, "supabase/migrations/20261007140000_rtb_sec_rls_1a_least_privilege_closeout.sql"),
  "utf8",
);
const migration1c = readFileSync(
  resolve(root, "supabase/migrations/20261007160000_rtb_sec_rls_1c_production_security_backport.sql"),
  "utf8",
);
const applyRunner = readFileSync(
  resolve(root, "packages/engineering-review-persistence/scripts/rtb-sec-rls-1c-apply-production.ts"),
  "utf8",
);

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

describe("RTB-SEC-RLS-1C production backport guards", () => {
  it("does not rewrite certified staging migrations", () => {
    expect(sha256(migration1)).toBe("92a5fb257305c22a29d7b021e312b51f3762297bbf5908531c822081afa72d69");
    expect(sha256(migration1a)).toBe("9e63a0ae1b1a70dc58affda9f9be6b71e4f9a6d403652fd3ec62e58240d99965");
  });

  it("is a non-destructive security backport without Security Assurance deployment", () => {
    expect(migration1c).not.toMatch(/^\s*DROP TABLE\b/im);
    expect(migration1c).not.toMatch(/^\s*TRUNCATE\b/im);
    expect(migration1c).not.toMatch(/^\s*DELETE FROM\b/im);
    expect(migration1c).not.toMatch(/EXCEPTION\s+WHEN\s+OTHERS/i);
    expect(migration1c).not.toMatch(/CREATE TABLE[\s\S]{0,80}security_assurance_/i);
    expect(migration1c).toContain("NOT_APPLICABLE_OBJECT_ABSENT");
    expect(migration1c).toContain("RAISE EXCEPTION 'rtb_sec_rls_1c: expected Digital Twin catalog tables are missing'");
  });

  it("backports RLS-1 / RLS-1A controls onto existing production objects", () => {
    expect(migration1c).toContain("ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY");
    expect(migration1c).toContain("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon");
    expect(migration1c).toContain("CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()");
    expect(migration1c).toContain("SET search_path = pg_catalog, public");
    expect(migration1c).toContain("USING (auth.uid() IS NOT NULL)");
    expect(migration1c).toContain("WITH CHECK (public.is_platform_admin())");
    expect(migration1c).not.toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(migration1c).not.toMatch(/FORCE ROW LEVEL SECURITY/i);
  });

  it("applies only the 1C file to Engineering OS production", () => {
    expect(applyRunner).toContain('const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget"');
    expect(applyRunner).toContain("rtb-sec-rls-1c apply refuses any file other than the 1C backport");
    expect(applyRunner).not.toContain("20261007120000");
    expect(applyRunner).not.toContain("npx --yes supabase link --project-ref rntonzigxwxcjlcsadip");
  });
});
