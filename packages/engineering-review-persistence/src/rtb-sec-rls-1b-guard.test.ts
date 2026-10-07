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
const queryRunner = readFileSync(
  resolve(root, "packages/engineering-review-persistence/scripts/rtb-sec-rls-1b-query-production.ts"),
  "utf8",
);
const preflight = readFileSync(
  resolve(root, "packages/engineering-review-persistence/scripts/rtb-sec-rls-1b-preflight.sql"),
  "utf8",
);

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

describe("RTB-SEC-RLS-1B production promotion guards", () => {
  it("targets Engineering OS production and refuses staging and adjacent projects", () => {
    expect(queryRunner).toContain('const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget"');
    expect(queryRunner).toContain('const STAGING_REF = "rntonzigxwxcjlcsadip"');
    expect(queryRunner).toContain('const INSPECTION_REF = "hlqwihvksjgkshipoacd"');
    expect(queryRunner).toContain('const INTRANET_PRODUCTION_REF = "vspyrlgvkpcsprzvrorb"');
    expect(queryRunner).toContain("new Set<string>([STAGING_REF, INSPECTION_REF, INTRANET_PRODUCTION_REF])");
    expect(queryRunner).toContain("production query runner refused a non-production project ref");
    expect(queryRunner).not.toContain("npx --yes supabase link --project-ref rntonzigxwxcjlcsadip");
  });

  it("keeps the production query runner read-only", () => {
    expect(queryRunner).toContain("refusing mutating SQL on production query runner");
    expect(preflight).toMatch(/^\s*SELECT\b/m);
    expect(preflight).not.toMatch(/^\s*(ALTER|CREATE|DROP|GRANT|REVOKE|INSERT|UPDATE|DELETE|TRUNCATE)\b/im);
  });

  it("does not rewrite certified staging migrations", () => {
    expect(sha256(migration1)).toBe("92a5fb257305c22a29d7b021e312b51f3762297bbf5908531c822081afa72d69");
    expect(sha256(migration1a)).toBe("9e63a0ae1b1a70dc58affda9f9be6b71e4f9a6d403652fd3ec62e58240d99965");
    expect(migration1).toContain("security_assurance_compliance_frameworks");
    expect(migration1a).toContain("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon");
  });
});
