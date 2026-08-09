/**
 * Near-final Tier-1 attack-surface inventory (Phase 16C).
 */
export type SurfaceClass =
  | "IN_SCOPE"
  | "OUT_OF_SCOPE"
  | "EXTERNAL_PROVIDER"
  | "NOT_APPLICABLE";

export type AttackSurfaceEntry = {
  surface: string;
  classification: SurfaceClass;
  notes: string;
};

export const TIER1_ATTACK_SURFACE_INVENTORY: AttackSurfaceEntry[] = [
  { surface: "Public web application (apps/web)", classification: "IN_SCOPE", notes: "Customer/admin UI" },
  { surface: "Authentication endpoints (/login, /signup, session cookies)", classification: "IN_SCOPE", notes: "Local + SSO entry" },
  { surface: "Enterprise SSO/OIDC flows", classification: "IN_SCOPE", notes: "Phase 16B production path" },
  { surface: "Password/local auth paths", classification: "IN_SCOPE", notes: "Where TenantSsoPolicy allows" },
  { surface: "MFA / privileged MFA flows", classification: "IN_SCOPE", notes: "Phase 14D + federated assurance" },
  { surface: "Privileged/admin surfaces (/platform/*, /system/*)", classification: "IN_SCOPE", notes: "Owner/platform_admin" },
  { surface: "Tenant/workspace APIs", classification: "IN_SCOPE", notes: "RLS + membership" },
  { surface: "Files/storage APIs", classification: "IN_SCOPE", notes: "Platform Files authorization" },
  { surface: "Search surfaces", classification: "IN_SCOPE", notes: "Tenant-scoped search" },
  { surface: "AI endpoints / Tool Framework", classification: "IN_SCOPE", notes: "Authorization + classification" },
  { surface: "Engineering OS APIs/UI", classification: "IN_SCOPE", notes: "Frozen V1 surface still in-scope for security" },
  { surface: "Security & Assurance surfaces", classification: "IN_SCOPE", notes: "Internal vs customer separation" },
  { surface: "Module APIs (PI/II/AI/PC/DT/Interop)", classification: "IN_SCOPE", notes: "Frozen modules; still attack surface" },
  { surface: "Digital Twin APIs", classification: "IN_SCOPE", notes: "State/ingestion/simulation control plane" },
  { surface: "Engineering Model Interoperability", classification: "IN_SCOPE", notes: "Federation/import control plane" },
  { surface: "Controlled Engineering Execution Host control plane", classification: "IN_SCOPE", notes: "Job auth, workspace isolation" },
  { surface: "Solver job interfaces (control plane)", classification: "IN_SCOPE", notes: "No destructive live solver required" },
  { surface: "Webhooks / public callbacks", classification: "IN_SCOPE", notes: "If enabled in test env" },
  { surface: "Background-job public callbacks", classification: "IN_SCOPE", notes: "If exposed" },
  { surface: "Administration / customer admin", classification: "IN_SCOPE", notes: "Role tiers" },
  { surface: "Commerce/entitlement endpoints", classification: "IN_SCOPE", notes: "Server-side entitlements" },
  { surface: "Supabase Auth/Postgres hosting", classification: "EXTERNAL_PROVIDER", notes: "RTB config vs provider defect" },
  { surface: "Microsoft Entra (customer IdP)", classification: "EXTERNAL_PROVIDER", notes: "Corporate CA/MFA owned externally" },
  { surface: "Vercel / cloud hosting", classification: "EXTERNAL_PROVIDER", notes: "Platform hosting" },
  { surface: "AI model providers", classification: "EXTERNAL_PROVIDER", notes: "Provider policy vs RTB config" },
  { surface: "Commercial solver hosts (ETABS/SPACE GASS)", classification: "EXTERNAL_PROVIDER", notes: "Client-owned commercial solvers" },
  { surface: "Physical security / office", classification: "OUT_OF_SCOPE", notes: "Not authorized" },
  { surface: "Employee social engineering / phishing", classification: "OUT_OF_SCOPE", notes: "Unless separately authorized" },
  { surface: "Uncontrolled DoS / destructive DB", classification: "OUT_OF_SCOPE", notes: "Prohibited" },
  { surface: "Public Trust Center", classification: "NOT_APPLICABLE", notes: "Intentionally unavailable in Sec&A V1" },
  { surface: "SIEM/SOAR/EDR product", classification: "NOT_APPLICABLE", notes: "Not an RTB product surface" },
];

export const PEN_TEST_TENANT_FIXTURES = {
  tenantA: {
    label: "Tenant A",
    roles: ["owner", "manager", "engineer", "viewer", "enterprise_sso_user", "local_user", "disabled_user", "revoked_user"],
  },
  tenantB: {
    label: "Tenant B",
    roles: ["owner", "manager", "engineer", "viewer", "enterprise_sso_user"],
  },
  purpose: "Cross-tenant isolation evaluation without production customer data",
} as const;

export const PEN_TEST_ENGAGEMENT_MODE = {
  mode: "grey_box_hybrid" as const,
  rationale:
    "Complex multi-tenant enterprise SaaS with OIDC, RLS, and execution-host surfaces benefits from authenticated grey-box plus selected white-box architecture briefing without full source dump by default.",
} as const;

export const S07_CLOSURE_CRITERIA = {
  requiresIndependentExternalEvidence: true,
  internalTestsInsufficient: true,
  requiredEvidenceTypes: [
    "external_report_reference",
    "assessor_identity_company",
    "scope",
    "assessment_date",
    "methodology",
    "findings_summary",
    "remediation_status",
    "retest_evidence_where_required",
    "approved_assurance_reference",
  ] as const,
  blockingFindingsMustBeResolvedOrFormallyExcepted: true,
  silentAcceptanceOfCriticalHighForbidden: true,
} as const;
