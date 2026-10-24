export const DEFINER_RUNTIME_CLASS = {
  get_user_tenant_ids: "A_SAFE_CLIENT_RPC",
  is_tenant_member: "A_SAFE_CLIENT_RPC",
  has_permission: "A_SAFE_CLIENT_RPC",
  is_platform_admin: "A_SAFE_CLIENT_RPC",
  handle_new_user: "B_SAFE_BACKEND_RPC",
  handle_new_tenant: "B_SAFE_BACKEND_RPC",
  handle_new_tenant_kernel: "B_SAFE_BACKEND_RPC",
  generate_tenant_slug: "B_SAFE_BACKEND_RPC",
  create_default_tenant_roles: "B_SAFE_BACKEND_RPC",
  provision_tenant_kernel_defaults: "B_SAFE_BACKEND_RPC",
  seed_tenant_engineering_registers: "B_SAFE_BACKEND_RPC",
  seed_tenant_intelligence: "B_SAFE_BACKEND_RPC",
  seed_tenant_workflows: "B_SAFE_BACKEND_RPC",
  pi_document_claim_jobs: "B_SAFE_BACKEND_RPC",
  pi_document_enqueue_processing: "B_SAFE_BACKEND_RPC",
  pi_document_ensure_core_document: "B_SAFE_BACKEND_RPC",
  pi_document_lexical_search: "B_SAFE_BACKEND_RPC",
  pi_document_release_expired_leases: "B_SAFE_BACKEND_RPC",
  pi_document_renew_lease: "B_SAFE_BACKEND_RPC",
  pi_document_set_embedding_vector: "B_SAFE_BACKEND_RPC",
  pi_document_vector_search: "B_SAFE_BACKEND_RPC",
  pi_meeting_claim_jobs: "B_SAFE_BACKEND_RPC",
  pi_meeting_release_expired_leases: "B_SAFE_BACKEND_RPC",
  rtb_sec_rel_1e_assert_tenant_caller: "B_SAFE_BACKEND_RPC",
  seed_engineering_os_demo_data: "F_UNSAFE_ACTIVE_MITIGATED",
  reset_engineering_os_demo_data: "F_UNSAFE_ACTIVE_MITIGATED",
  seed_tenant_engineering_os: "F_UNSAFE_ACTIVE_MITIGATED",
  bump_commercial_entitlement_version: "F_UNSAFE_ACTIVE_MITIGATED",
  bump_commercial_installation_version: "F_UNSAFE_ACTIVE_MITIGATED",
  provision_signup_commercial_defaults: "G_UNSAFE_UNUSED",
} as const;

export type DefinerRuntimeClass = (typeof DEFINER_RUNTIME_CLASS)[keyof typeof DEFINER_RUNTIME_CLASS];

export const INTENTIONAL_AUTHENTICATED_DEFINERS = [
  "get_user_tenant_ids",
  "is_tenant_member",
  "has_permission",
  "is_platform_admin",
  "seed_engineering_os_demo_data",
  "reset_engineering_os_demo_data",
  "seed_tenant_engineering_os",
  "bump_commercial_entitlement_version",
  "bump_commercial_installation_version",
] as const;

export const INTENTIONAL_PUBLIC_ANON_DEFINERS: readonly string[] = [];

export const QUARANTINED_UNTRUSTED_DEFINERS = [
  "provision_signup_commercial_defaults",
  "create_default_tenant_roles",
  "provision_tenant_kernel_defaults",
  "seed_tenant_engineering_registers",
  "seed_tenant_intelligence",
  "seed_tenant_workflows",
  "generate_tenant_slug",
  "handle_new_user",
  "handle_new_tenant",
  "handle_new_tenant_kernel",
  "pi_document_claim_jobs",
  "pi_document_enqueue_processing",
  "pi_document_ensure_core_document",
  "pi_document_lexical_search",
  "pi_document_release_expired_leases",
  "pi_document_renew_lease",
  "pi_document_set_embedding_vector",
  "pi_document_vector_search",
  "pi_meeting_claim_jobs",
  "pi_meeting_release_expired_leases",
  "rtb_sec_rel_1e_assert_tenant_caller",
] as const;

export type DefinerExecuteRow = {
  name: string;
  grantee: string;
};

export type DefinerExecuteClass = "INTENTIONAL_SAFE" | "QUARANTINED" | "REQUIRES_REVIEW";

export function classifyDefinerExecute(row: DefinerExecuteRow): DefinerExecuteClass {
  if ((QUARANTINED_UNTRUSTED_DEFINERS as readonly string[]).includes(row.name)) {
    return "QUARANTINED";
  }
  if (
    (row.grantee === "PUBLIC" || row.grantee === "anon") &&
    INTENTIONAL_PUBLIC_ANON_DEFINERS.includes(row.name)
  ) {
    return "INTENTIONAL_SAFE";
  }
  if (
    (INTENTIONAL_AUTHENTICATED_DEFINERS as readonly string[]).includes(row.name) &&
    row.grantee === "authenticated"
  ) {
    return "INTENTIONAL_SAFE";
  }
  return "REQUIRES_REVIEW";
}

function isUntrustedGrantee(grantee: string): boolean {
  return grantee === "PUBLIC" || grantee === "anon" || grantee === "authenticated";
}

export function untrustedExecuteOnQuarantined(rows: DefinerExecuteRow[]): string[] {
  return rows
    .filter((row) => classifyDefinerExecute(row) === "QUARANTINED")
    .filter((row) => isUntrustedGrantee(row.grantee))
    .map((row) => `${row.name}:${row.grantee}`);
}

export function untrustedExecuteWithoutJustification(rows: DefinerExecuteRow[]): string[] {
  return rows
    .filter((row) => isUntrustedGrantee(row.grantee))
    .filter((row) => classifyDefinerExecute(row) !== "INTENTIONAL_SAFE")
    .map((row) => `${row.name}:${row.grantee}:${classifyDefinerExecute(row)}`);
}

export function publicOrAnonPrivilegedWriterWithoutJustification(rows: DefinerExecuteRow[]): string[] {
  return rows
    .filter((row) => row.grantee === "PUBLIC" || row.grantee === "anon")
    .filter((row) => classifyDefinerExecute(row) !== "INTENTIONAL_SAFE")
    .map((row) => `${row.name}:${row.grantee}`);
}
