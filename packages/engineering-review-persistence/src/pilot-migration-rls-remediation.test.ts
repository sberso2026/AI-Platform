import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const historical = readFileSync(
  resolve(root, "supabase/migrations/20260930090000_eos_a9a_lifecycle_intelligence.sql"),
  "utf8",
);
const forward = readFileSync(
  resolve(root, "supabase/migrations/20260930090001_eos_a9a_lifecycle_trigger_order.sql"),
  "utf8",
);
const inspection = readFileSync(
  resolve(root, "supabase/migrations/20261027170000_eos_inspection_rls_fail_closed.sql"),
  "utf8",
);

const leakTables = [
  "inspection_assignments",
  "inspection_attestations",
  "inspection_evidence_annotations",
  "inspection_offline_commands",
  "inspection_offline_entitlement_snapshots",
  "inspection_offline_evidence_queue",
  "inspection_reporting_outputs",
  "inspection_workflow_instances",
  "inspection_workflow_sla_timers",
];

function indexOfTable(sql: string, table: string): number {
  return sql.indexOf(`CREATE TABLE IF NOT EXISTS ${table}`);
}

function indexOfTrigger(sql: string, trigger: string): number {
  return sql.indexOf(`CREATE TRIGGER ${trigger}`);
}

describe("pilot migration and inspection RLS remediation", () => {
  it("keeps the historical lifecycle migration unchanged in its failing order", () => {
    const decisions = indexOfTable(historical, "engineering_lifecycle_gate_decisions");
    const transitions = indexOfTable(historical, "engineering_lifecycle_transitions");
    expect(indexOfTrigger(historical, "engineering_lifecycle_decisions_same_scope")).toBeLessThan(decisions);
    expect(indexOfTrigger(historical, "engineering_lifecycle_transitions_same_scope")).toBeLessThan(transitions);
  });

  it("creates lifecycle triggers only after their tables in the forward migration", () => {
    const decisions = indexOfTable(forward, "engineering_lifecycle_gate_decisions");
    const transitions = indexOfTable(forward, "engineering_lifecycle_transitions");
    expect(decisions).toBeGreaterThan(0);
    expect(transitions).toBeGreaterThan(decisions);
    expect(indexOfTrigger(forward, "engineering_lifecycle_decisions_same_scope")).toBeGreaterThan(decisions);
    expect(indexOfTrigger(forward, "engineering_lifecycle_transitions_same_scope")).toBeGreaterThan(transitions);
  });

  it("replaces fail-open inspection policies with membership checks", () => {
    expect(inspection).not.toMatch(/coalesce\(current_setting\('request\.jwt\.claims'/i);
    expect(inspection).toContain("inspection_workspace_visible");
    expect(inspection).toContain("get_user_tenant_ids()");
    expect(inspection).toContain("workspace_memberships");
    expect(inspection).toContain("TO authenticated");
    for (const table of leakTables) {
      expect(inspection).toContain(`'${table}'`);
    }
  });
});

const rehearsalUrl = process.env.EOS_REHEARSAL_DATABASE_URL;
const userA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const userB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const tenantA = "11111111-1111-4111-8111-111111111111";
const tenantB = "22222222-2222-4222-8222-222222222222";
const workspaceA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01";
const workspaceB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01";

async function asUser(client: pg.Client, userId: string): Promise<void> {
  await client.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
  await client.query("select set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ sub: userId, role: "authenticated" }),
  ]);
  await client.query("set local role authenticated");
}

async function expectDenied(client: pg.Client, sql: string, params: unknown[] = []): Promise<void> {
  await client.query("savepoint denied_write");
  let denied = false;
  try {
    await client.query(sql, params);
  } catch {
    denied = true;
    await client.query("rollback to savepoint denied_write");
  }
  expect(denied).toBe(true);
}

describe.skipIf(!rehearsalUrl)("migrated inspection isolation", () => {
  it("isolates inspection assignments for authenticated workspace members", async () => {
    const client = new pg.Client({ connectionString: rehearsalUrl });
    await client.connect();
    try {
      await client.query("begin");
      const harness = await client.query(
        "select rolname, rolbypassrls from pg_roles where rolname in ('authenticated', 'service_role')",
      );
      const authenticated = harness.rows.find((row) => row.rolname === "authenticated");
      expect(authenticated?.rolbypassrls).toBe(false);
      await client.query("alter table auth.users disable trigger on_auth_user_created");
      await client.query(
        `insert into auth.users (id, aud, role, email) values
          ($1, 'authenticated', 'authenticated', 'user-a@rehearsal.invalid'),
          ($2, 'authenticated', 'authenticated', 'user-b@rehearsal.invalid')`,
        [userA, userB],
      );
      await client.query(
        `insert into public.tenants (id, name, slug) values
          ($1, 'Rehearsal A', 'rehearsal-a'),
          ($2, 'Rehearsal B', 'rehearsal-b')`,
        [tenantA, tenantB],
      );
      await client.query(
        `insert into public.profiles (id, email) values
          ($1, 'user-a@rehearsal.invalid'),
          ($2, 'user-b@rehearsal.invalid')
         on conflict (id) do nothing`,
        [userA, userB],
      );
      await client.query(
        `insert into public.workspaces (id, tenant_id, name, slug) values
          ($1, $2, 'Workspace A', 'workspace-a'),
          ($3, $4, 'Workspace B', 'workspace-b')`,
        [workspaceA, tenantA, workspaceB, tenantB],
      );
      await client.query(
        `insert into public.tenant_memberships (tenant_id, user_id, role_id, status)
         select pair.tenant_id, pair.user_id, r.id, 'active'
         from (values ($1::uuid, $2::uuid), ($3::uuid, $4::uuid)) as pair(tenant_id, user_id)
         join public.roles r on r.tenant_id = pair.tenant_id and r.slug = 'member'`,
        [tenantA, userA, tenantB, userB],
      );
      await client.query(
        `insert into public.workspace_memberships (workspace_id, user_id, role_id)
         select pair.workspace_id, pair.user_id, r.id
         from (values ($1::uuid, $2::uuid, $3::uuid), ($4::uuid, $5::uuid, $6::uuid)) as pair(workspace_id, user_id, tenant_id)
         join public.roles r on r.tenant_id = pair.tenant_id and r.slug = 'member'`,
        [workspaceA, userA, tenantA, workspaceB, userB, tenantB],
      );
      await client.query(
        `insert into public.inspection_assignments (tenant_id, workspace_id, session_id, assignee_person_id) values
          ($1, $2, gen_random_uuid(), 'person-a'),
          ($3, $4, gen_random_uuid(), 'person-b')`,
        [tenantA, workspaceA, tenantB, workspaceB],
      );

      await asUser(client, userA);
      const actor = await client.query("select current_user as role, rolbypassrls from pg_roles where rolname = current_user");
      expect(actor.rows[0].role).toBe("authenticated");
      expect(actor.rows[0].rolbypassrls).toBe(false);
      const own = await client.query("select count(*)::int as n from public.inspection_assignments");
      const other = await client.query(
        "select count(*)::int as n from public.inspection_assignments where workspace_id = $1",
        [workspaceB],
      );
      expect(own.rows[0].n).toBe(1);
      expect(other.rows[0].n).toBe(0);
      const ownInsert = await client.query(
        `insert into public.inspection_assignments (tenant_id, workspace_id, session_id, assignee_person_id)
         values ($1, $2, gen_random_uuid(), 'person-a-2') returning id`,
        [tenantA, workspaceA],
      );
      expect(ownInsert.rowCount).toBe(1);
      const ownUpdate = await client.query(
        "update public.inspection_assignments set assignee_person_id = 'person-a-3' where assignee_person_id = 'person-a-2'",
      );
      expect(ownUpdate.rowCount).toBe(1);
      const ownDelete = await client.query(
        "delete from public.inspection_assignments where assignee_person_id = 'person-a-3'",
      );
      expect(ownDelete.rowCount).toBe(1);
      await expectDenied(
        client,
        `insert into public.inspection_assignments (tenant_id, workspace_id, session_id, assignee_person_id)
         values ($1, $2, gen_random_uuid(), 'cross')`,
        [tenantB, workspaceB],
      );
      const crossUpdate = await client.query(
        "update public.inspection_assignments set assignee_person_id = 'changed' where workspace_id = $1",
        [workspaceB],
      );
      expect(crossUpdate.rowCount).toBe(0);
      const crossDelete = await client.query(
        "delete from public.inspection_assignments where workspace_id = $1",
        [workspaceB],
      );
      expect(crossDelete.rowCount).toBe(0);

      await client.query("reset role");
      await asUser(client, userB);
      const ownB = await client.query("select count(*)::int as n from public.inspection_assignments");
      const otherB = await client.query(
        "select count(*)::int as n from public.inspection_assignments where workspace_id = $1",
        [workspaceA],
      );
      expect(ownB.rows[0].n).toBe(1);
      expect(otherB.rows[0].n).toBe(0);

      await client.query("reset role");
      await client.query("select set_config('request.jwt.claim.sub', '', true)");
      await client.query("select set_config('request.jwt.claims', '', true)");
      await client.query("set local role anon");
      await client.query("savepoint anon_read");
      let anonCount = 0;
      try {
        const anon = await client.query("select count(*)::int as n from public.inspection_assignments");
        anonCount = anon.rows[0].n;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!/permission denied/i.test(message)) throw error;
        await client.query("rollback to savepoint anon_read");
      }
      expect(anonCount).toBe(0);

      await client.query("reset role");
      const status = await client.query("select engineering_review_security_schema_status() as status");
      const body = typeof status.rows[0].status === "string" ? JSON.parse(status.rows[0].status) : status.rows[0].status;
      expect(body.review_tables_ready).toBe(true);
      expect(body.core_workspace_member).toBe(true);
    } finally {
      await client.query("rollback").catch(() => undefined);
      await client.end();
    }
  }, 60000);
});
