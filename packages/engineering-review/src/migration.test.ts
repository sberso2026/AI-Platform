import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const MIGRATION = join(REPO_ROOT, "supabase/migrations/20260919120000_engineering_review_persistence.sql");
const TABLES = [
  "engineering_review_packages",
  "engineering_review_runs",
  "engineering_review_findings",
  "engineering_review_evidence",
  "engineering_review_dispositions",
] as const;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("ERA-2 migration contract", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("is additive and documents PI tenant+workspace RLS as the primary reference", () => {
    expect(sql).toContain("20260712180000_batch_36_project_intelligence_documents.sql");
    expect(sql).toContain("DO NOT COPY: 20260203000001_batch_20_engineering_rls.sql");
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_documents/i);
    expect(sql).not.toMatch(/ALTER TABLE engineering_projects/i);
    expect(sql).not.toMatch(/DROP POLICY.*eng_documents/i);
  });

  it("enables RLS and explicit SELECT/INSERT/UPDATE/DELETE on every new table", () => {
    for (const table of TABLES) {
      expect(sql, table).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      expect(sql, `${table} update`).toContain(`${table}_update`);
      expect(sql, `${table} delete`).toContain(`${table}_delete`);
    }
    expect(sql).toContain("tbl || '_select'");
    expect(sql).toContain("tbl || '_insert'");
    expect(sql).toContain("FOR SELECT USING");
    expect(sql).toContain("FOR INSERT WITH CHECK");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("engineering_review_workspace_allowed(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'execute', tenant_id)");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).toContain("engineering_review_dispositions_update");
    expect(sql).toMatch(/engineering_review_dispositions_update[\s\S]*USING \(false\)/);
    expect(sql).toMatch(/engineering_review_dispositions_delete[\s\S]*USING \(false\)/);
  });

  it("enforces composite ownership and document laundering guards", () => {
    expect(sql).toContain("FOREIGN KEY (review_package_id, tenant_id, workspace_id, project_id)");
    expect(sql).toContain("FOREIGN KEY (review_run_id, tenant_id, workspace_id, project_id)");
    expect(sql).toContain("FOREIGN KEY (finding_id, tenant_id, workspace_id, project_id)");
    expect(sql).toContain("engineering_review_assert_document_ownership");
    expect(sql).toContain("actor_kind        TEXT NOT NULL CHECK (actor_kind = 'human')");
    expect(sql).toContain("engineering_review_dispositions is append-only");
    expect(sql).toContain("workspace_id  UUID NOT NULL");
  });
});

describe("dependency graph", () => {
  it("is not imported by engineering-os, PI, or platform packages", () => {
    const forbidden = /from ["']@rtb\/engineering-review["']/;
    const packages = [
      "engineering-os",
      "project-intelligence",
      "platform-core",
      "platform-kernel",
      "platform-intelligence",
    ];
    for (const name of packages) {
      const src = join(REPO_ROOT, "packages", name, "src");
      const files = walk(src).filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"));
      for (const file of files) {
        expect(readFileSync(file, "utf8"), file).not.toMatch(forbidden);
      }
    }
  });

  it("keeps Review UI in the ERA-5 MUP routes only", () => {
    const domainSrc = join(REPO_ROOT, "packages/engineering-review/src");
    const domainFiles = walk(domainSrc).filter((path) => path.endsWith(".ts"));
    for (const file of domainFiles) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/from ["']next["']/);
    }
    const mup = join(REPO_ROOT, "apps/web/src/app/(platform)/review/page.tsx");
    expect(readFileSync(mup, "utf8")).toContain("/api/review/projects");
  });
});
