import { createClient } from "@supabase/supabase-js";
import {
  certUserPassword,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { signInAccessToken, type ReviewSqlClient } from "./client";

export const ER_CERT_SLUG_PREFIX = "cert-er-";

export type ReviewRlsUser = {
  key: string;
  id: string;
  email: string;
  jwt: string;
  role: "engineer" | "admin";
};

export type ReviewRlsFixtures = {
  tenantAId: string;
  tenantBId: string;
  workspaceA1Id: string;
  workspaceA2Id: string;
  workspaceB1Id: string;
  projectA1Id: string;
  projectA2Id: string;
  projectB1Id: string;
  documentA1Id: string;
  documentA2Id: string;
  documentB1Id: string;
  packageA1Id: string;
  runA1Id: string;
  findingA1Id: string;
  evidenceA1Id: string;
  dispositionA1Id: string;
  users: {
    a1: ReviewRlsUser;
    a2: ReviewRlsUser;
    aAdmin: ReviewRlsUser;
    b1: ReviewRlsUser;
  };
};

type Admin = ReviewSqlClient;

async function required<T>(promise: PromiseLike<{ data: T; error: { message: string } | null }>, label: string): Promise<T> {
  const { data, error } = await promise;
  if (error || data == null) throw new Error(`${label}: ${error?.message ?? "no row"}`);
  return data;
}

async function existingOrInsert(
  admin: Admin,
  table: string,
  match: Record<string, unknown>,
  value: Record<string, unknown>,
): Promise<Record<string, any>> {
  let query: any = admin.from(table).select("*");
  for (const [key, item] of Object.entries(match)) {
    query = query.eq(key, item);
  }
  const { data: existing, error: readError } = await query.maybeSingle();
  if (readError) throw new Error(`${table} lookup: ${readError.message}`);
  if (existing) return existing as Record<string, any>;
  return required(admin.from(table).insert(value).select("*").single(), `${table} insert`) as Promise<Record<string, any>>;
}

async function tenantRole(admin: Admin, tenantId: string, slug: string): Promise<string> {
  const { data, error } = await admin.from("roles").select("id").eq("tenant_id", tenantId).eq("slug", slug).limit(1);
  if (error) throw new Error(`role ${slug}: ${error.message}`);
  const role = Array.isArray(data) ? data[0] : data;
  if (!role?.id) throw new Error(`role ${slug} missing for tenant ${tenantId}`);
  return role.id as string;
}

async function getOrCreateUser(admin: any, email: string, password: string): Promise<string> {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw new Error(`listUsers: ${listed.error.message}`);
  const existing = listed.data.users.find((user: { email?: string }) => user.email === email);
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    if (error) throw new Error(`update ${email}: ${error.message}`);
    return existing.id;
  }
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { cert_fixture: true, full_name: email.split("@")[0] },
  });
  if (created.error || !created.data.user) throw new Error(`create ${email}: ${created.error?.message}`);
  return created.data.user.id;
}

async function addMembership(
  admin: Admin,
  tenantId: string,
  workspaceIds: string[],
  userId: string,
  roleSlug: "engineer" | "admin",
): Promise<void> {
  const roleId = await tenantRole(admin, tenantId, roleSlug);
  await required(
    admin.from("tenant_memberships").upsert(
      { tenant_id: tenantId, user_id: userId, role_id: roleId, status: "active", joined_at: new Date().toISOString() },
      { onConflict: "tenant_id,user_id" },
    ).select("id").single(),
    `tenant membership ${userId}`,
  );
  for (const workspaceId of workspaceIds) {
    await required(
      admin
        .from("workspace_memberships")
        .upsert({ workspace_id: workspaceId, user_id: userId, role_id: roleId }, { onConflict: "workspace_id,user_id" })
        .select("id")
        .single(),
      `workspace membership ${userId}`,
    );
  }
}

async function createTenant(admin: Admin, slug: string, name: string): Promise<Record<string, any>> {
  const tenant = await existingOrInsert(admin, "tenants", { slug }, {
    name,
    slug,
    status: "active",
    settings: { cert_fixture: true, engineering_review: true },
  });
  const { error } = await admin.rpc("create_default_tenant_roles", { p_tenant_id: tenant.id });
  if (error) throw new Error(`create_default_tenant_roles: ${error.message}`);
  return tenant;
}

/**
 * Disposable ERA-3 fixtures. Service-role only. Never used as RLS proof.
 */
export async function provisionReviewRlsFixtures(): Promise<ReviewRlsFixtures> {
  const url = resolveSupabaseUrl();
  const anon = resolveSupabaseAnonKey();
  const service = resolveServiceRoleKey();
  if (!url || !anon || !service) throw new Error("Hosted credentials missing for fixture provision");
  const supabaseUrl = url;
  const anonKey = anon;
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as Admin;
  const password = certUserPassword();

  const tenantA = await createTenant(admin, `${ER_CERT_SLUG_PREFIX}a`, "ERA-3 Review Tenant A");
  const tenantB = await createTenant(admin, `${ER_CERT_SLUG_PREFIX}b`, "ERA-3 Review Tenant B");
  const workspaceA1 = await existingOrInsert(admin, "workspaces", { tenant_id: tenantA.id, slug: `${ER_CERT_SLUG_PREFIX}a1` }, {
    tenant_id: tenantA.id, slug: `${ER_CERT_SLUG_PREFIX}a1`, name: "Review WS A1", status: "active",
  });
  const workspaceA2 = await existingOrInsert(admin, "workspaces", { tenant_id: tenantA.id, slug: `${ER_CERT_SLUG_PREFIX}a2` }, {
    tenant_id: tenantA.id, slug: `${ER_CERT_SLUG_PREFIX}a2`, name: "Review WS A2", status: "active",
  });
  const workspaceB1 = await existingOrInsert(admin, "workspaces", { tenant_id: tenantB.id, slug: `${ER_CERT_SLUG_PREFIX}b1` }, {
    tenant_id: tenantB.id, slug: `${ER_CERT_SLUG_PREFIX}b1`, name: "Review WS B1", status: "active",
  });

  const projectA1 = await existingOrInsert(admin, "engineering_projects", { tenant_id: tenantA.id, project_code: "ER-A1" }, {
    tenant_id: tenantA.id, workspace_id: workspaceA1.id, project_code: "ER-A1", project_name: "Review Project A1", status: "active",
  });
  const projectA2 = await existingOrInsert(admin, "engineering_projects", { tenant_id: tenantA.id, project_code: "ER-A2" }, {
    tenant_id: tenantA.id, workspace_id: workspaceA2.id, project_code: "ER-A2", project_name: "Review Project A2", status: "active",
  });
  const projectB1 = await existingOrInsert(admin, "engineering_projects", { tenant_id: tenantB.id, project_code: "ER-B1" }, {
    tenant_id: tenantB.id, workspace_id: workspaceB1.id, project_code: "ER-B1", project_name: "Review Project B1", status: "active",
  });

  const documentA1 = await existingOrInsert(admin, "engineering_documents", { tenant_id: tenantA.id, document_number: "ER-DOC-A1", revision: "A" }, {
    tenant_id: tenantA.id, workspace_id: workspaceA1.id, engineering_project_id: projectA1.id,
    document_number: "ER-DOC-A1", title: "Review Spec A1", revision: "A", status: "issued",
  });
  const documentA2 = await existingOrInsert(admin, "engineering_documents", { tenant_id: tenantA.id, document_number: "ER-DOC-A2", revision: "A" }, {
    tenant_id: tenantA.id, workspace_id: workspaceA2.id, engineering_project_id: projectA2.id,
    document_number: "ER-DOC-A2", title: "Review Spec A2", revision: "A", status: "issued",
  });
  const documentB1 = await existingOrInsert(admin, "engineering_documents", { tenant_id: tenantB.id, document_number: "ER-DOC-B1", revision: "A" }, {
    tenant_id: tenantB.id, workspace_id: workspaceB1.id, engineering_project_id: projectB1.id,
    document_number: "ER-DOC-B1", title: "Review Spec B1", revision: "A", status: "issued",
  });

  async function user(key: string, tenantId: string, workspaceIds: string[], role: "engineer" | "admin"): Promise<ReviewRlsUser> {
    const email = `${ER_CERT_SLUG_PREFIX}${key}@rtb-cert.test`;
    const id = await getOrCreateUser(admin as any, email, password);
    await addMembership(admin, tenantId, workspaceIds, id, role);
    return { key, id, email, jwt: await signInAccessToken(supabaseUrl, anonKey, email, password), role };
  }

  const a1 = await user("a1", tenantA.id, [workspaceA1.id], "engineer");
  const a2 = await user("a2", tenantA.id, [workspaceA2.id], "engineer");
  const aAdmin = await user("a-admin", tenantA.id, [workspaceA1.id], "admin");
  const b1 = await user("b1", tenantB.id, [workspaceB1.id], "engineer");

  const pkg = await existingOrInsert(admin, "engineering_review_packages", { tenant_id: tenantA.id, name: "ERA-3 seeded package A1" }, {
    tenant_id: tenantA.id,
    workspace_id: workspaceA1.id,
    project_id: projectA1.id,
    name: "ERA-3 seeded package A1",
    status: "ready",
    documents: [{ document_id: documentA1.id, revision: "A", role: "specification", inclusion: "current" }],
    created_by: a1.id,
  });
  const run = await existingOrInsert(admin, "engineering_review_runs", { review_package_id: pkg.id }, {
    review_package_id: pkg.id,
    tenant_id: tenantA.id,
    workspace_id: workspaceA1.id,
    project_id: projectA1.id,
    status: "completed",
    scope: { reviewTypes: ["missing_information"] },
    input_documents: [{ document_id: documentA1.id, revision: "A", role: "specification", inclusion: "current" }],
    rules: [{ rule_id: "er.missing_information", version: "1.0.0" }],
    provenance: { engine_version: "review-engine/0.2.0-era-2", rule_set_hash: "er.missing_information@1.0.0" },
  });
  const finding = await existingOrInsert(admin, "engineering_review_findings", { review_run_id: run.id, title: "ERA-3 seeded finding" }, {
    review_package_id: pkg.id,
    review_run_id: run.id,
    tenant_id: tenantA.id,
    workspace_id: workspaceA1.id,
    project_id: projectA1.id,
    category: "missing_information",
    title: "ERA-3 seeded finding",
    description: "Seeded for live RLS SELECT isolation.",
    severity: "minor",
    confidence_band: "medium",
    confidence_score: 0.5,
    requirement_references: [],
    reasoning_summary: "seed",
    reasoning_basis: "EVIDENCE_BASED",
    recommended_action: "review",
    status: "awaiting_engineer",
    verification_state: "evidence_verified",
    provenance: { origin: "detector", engine_version: "review-engine/0.2.0-era-2" },
  });
  const evidence = await existingOrInsert(admin, "engineering_review_evidence", { finding_id: finding.id, document_id: documentA1.id }, {
    finding_id: finding.id,
    tenant_id: tenantA.id,
    workspace_id: workspaceA1.id,
    project_id: projectA1.id,
    document_id: documentA1.id,
    revision: "A",
    span: "seed",
    source_type: "extracted_text",
    verification_state: "verified",
  });
  const disposition = await existingOrInsert(admin, "engineering_review_dispositions", { finding_id: finding.id, action: "assign" }, {
    finding_id: finding.id,
    tenant_id: tenantA.id,
    workspace_id: workspaceA1.id,
    project_id: projectA1.id,
    action: "assign",
    previous_status: "awaiting_engineer",
    new_status: "assigned",
    actor_id: a1.id,
    actor_kind: "human",
    reason: "seed assign",
    occurred_at: new Date().toISOString(),
  });

  return {
    tenantAId: tenantA.id,
    tenantBId: tenantB.id,
    workspaceA1Id: workspaceA1.id,
    workspaceA2Id: workspaceA2.id,
    workspaceB1Id: workspaceB1.id,
    projectA1Id: projectA1.id,
    projectA2Id: projectA2.id,
    projectB1Id: projectB1.id,
    documentA1Id: documentA1.id,
    documentA2Id: documentA2.id,
    documentB1Id: documentB1.id,
    packageA1Id: pkg.id,
    runA1Id: run.id,
    findingA1Id: finding.id,
    evidenceA1Id: evidence.id,
    dispositionA1Id: disposition.id,
    users: { a1, a2, aAdmin, b1 },
  };
}

export async function reviewTablesReady(url: string, serviceKey: string): Promise<{ ready: boolean; missing: string[] }> {
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const missing: string[] = [];
  for (const table of [
    "engineering_review_packages",
    "engineering_review_runs",
    "engineering_review_findings",
    "engineering_review_evidence",
    "engineering_review_dispositions",
  ]) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      const detail = [error.code, error.message, (error as { hint?: string }).hint]
        .filter(Boolean)
        .join(" ");
      missing.push(`${table}:${detail || "unknown"}`);
    }
  }
  return { ready: missing.length === 0, missing };
}

/**
 * Removes disposable JWT-test packages created during the suite.
 * Seeded `cert-er-*` tenants/users remain as labeled fixtures; dispositions stay append-only.
 */
export async function cleanupTransientReviewPackages(): Promise<{ deleted: number; error?: string }> {
  const url = resolveSupabaseUrl();
  const service = resolveServiceRoleKey();
  if (!url || !service) return { deleted: 0, error: "credentials" };
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin
    .from("engineering_review_packages")
    .delete()
    .or("name.like.ERA-3 insert %,name.like.ERA-3 delete-target %,name.like.ERA-3 update-target %")
    .select("id");
  if (error) return { deleted: 0, error: error.message };
  return { deleted: Array.isArray(data) ? data.length : 0 };
}
