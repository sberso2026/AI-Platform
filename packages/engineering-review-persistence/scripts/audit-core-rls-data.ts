/**
 * Pre-migration data audit for Core RLS. Read-only. Does not destroy rows.
 * Prints counts only — never prints document content or secrets.
 */
import { loadLocalEnv, resolveServiceRoleKey, resolveSupabaseUrl } from "../src/env";

type CountRow = { count: number | null };

async function count(url: string, key: string, table: string, query: string): Promise<number> {
  const response = await fetch(`${url}/rest/v1/${table}?select=id&${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const range = response.headers.get("content-range");
  if (range && range.includes("/")) {
    const total = Number(range.split("/")[1]);
    if (Number.isFinite(total)) return total;
  }
  const body = (await response.json()) as CountRow[] | { message?: string };
  if (!response.ok) {
    throw new Error(`${table} audit failed: ${response.status}`);
  }
  return Array.isArray(body) ? body.length : 0;
}

export async function auditCoreRlsData(): Promise<{
  projects: { total: number; nullWorkspace: number };
  documents: { total: number; nullWorkspace: number };
}> {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) throw new Error("Hosted credentials missing for Core RLS data audit");

  const [projectsTotal, projectsNull, documentsTotal, documentsNull] = await Promise.all([
    count(url, key, "engineering_projects", "limit=1"),
    count(url, key, "engineering_projects", "workspace_id=is.null"),
    count(url, key, "engineering_documents", "limit=1"),
    count(url, key, "engineering_documents", "workspace_id=is.null"),
  ]);

  return {
    projects: { total: projectsTotal, nullWorkspace: projectsNull },
    documents: { total: documentsTotal, nullWorkspace: documentsNull },
  };
}

async function main() {
  const result = await auditCoreRlsData();
  console.log(JSON.stringify({ audit: "core_rls_pre_migration", destroyed: false, ...result }));
}

const isDirect = process.argv[1]?.includes("audit-core-rls-data");
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "audit failed");
    process.exit(1);
  });
}
