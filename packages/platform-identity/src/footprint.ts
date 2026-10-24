/**
 * Existing identity footprint classification (Phase 16A inventory summary).
 */
export type FootprintClass =
  | "AUTHORITATIVE_EXISTING"
  | "REUSABLE"
  | "PARTIAL"
  | "RESERVED"
  | "MISSING"
  | "EXTERNAL";

export type FootprintEntry = {
  capability: string;
  classification: FootprintClass;
  owner: string;
  evidence: string;
};

export const EXISTING_IDENTITY_FOOTPRINT: FootprintEntry[] = [
  {
    capability: "Supabase Auth email/password",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core + supabase",
    evidence: "apps/web/(auth)/login, packages/platform-core/src/auth.ts",
  },
  {
    capability: "JWT cookie session / refresh",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core + supabase_ssr",
    evidence: "apps/web/src/middleware.ts",
  },
  {
    capability: "Profiles / signup provisioning",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core",
    evidence: "supabase/migrations platform_core + fix_signup_provisioning",
  },
  {
    capability: "Tenant / workspace membership",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core",
    evidence: "tenant_memberships, workspace_memberships, kernel.ts",
  },
  {
    capability: "Roles / permissions / nav tiers",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core",
    evidence: "permissions.ts, nav-visibility.ts, RLS",
  },
  {
    capability: "Commerce entitlements",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_commerce",
    evidence: "entitlement-service.ts",
  },
  {
    capability: "Privileged MFA (Phase 14D AAL2/AMR)",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "engineering_os_security_closure + middleware",
    evidence: "privileged-mfa.ts, middleware privileged enforcement",
  },
  {
    capability: "MFA enrollment / challenge UI",
    classification: "PARTIAL",
    owner: "platform_identity (future) + supabase_auth_mfa",
    evidence: "middleware mfa_required query; login page incomplete",
  },
  {
    capability: "Break-glass governance",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "engineering_os_security_closure",
    evidence: "break-glass.ts (policy module; limited runtime UI)",
  },
  {
    capability: "Logout",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core",
    evidence: "AuthService.signOut, header/sidebar",
  },
  {
    capability: "Token revocation admin surface",
    classification: "MISSING",
    owner: "platform_identity",
    evidence: "no product session-revocation admin",
  },
  {
    capability: "Invitations",
    classification: "PARTIAL",
    owner: "platform_identity",
    evidence: "DB invited_at/pending; no invite API/UI",
  },
  {
    capability: "Service-role / platform_admin",
    classification: "AUTHORITATIVE_EXISTING",
    owner: "platform_core",
    evidence: "service.ts, is_platform_admin()",
  },
  {
    capability: "Customer enterprise SSO (OIDC/SAML)",
    classification: "MISSING",
    owner: "platform_identity",
    evidence: "S08 flags false; no signInWithOAuth/SAML",
  },
  {
    capability: "Microsoft Entra customer login",
    classification: "RESERVED",
    owner: "platform_identity",
    evidence: "docs only; Teams Graph OAuth is separate EXTERNAL",
  },
  {
    capability: "Teams / Microsoft Graph OAuth",
    classification: "EXTERNAL",
    owner: "project_intelligence",
    evidence: "microsoft-graph-token-service.ts (not customer SSO)",
  },
  {
    capability: "Policy Engine (authorization PDP)",
    classification: "REUSABLE",
    owner: "platform_intelligence",
    evidence: "not an IdP; remain separate from federation",
  },
  {
    capability: "Platform Audit",
    classification: "REUSABLE",
    owner: "platform_audit",
    evidence: "SSO config/login events must use existing audit",
  },
  {
    capability: "Event Bus",
    classification: "REUSABLE",
    owner: "platform_events",
    evidence: "future identity.enterprise_* metadata events",
  },
  {
    capability: "Security & Assurance SSO evidence",
    classification: "REUSABLE",
    owner: "security_assurance",
    evidence: "evidences/assesses only; must not own SSO",
  },
  {
    capability: "SCIM provisioning",
    classification: "MISSING",
    owner: "platform_identity",
    evidence: "POST_V1 lifecycle; not 16A",
  },
  {
    capability: "Domain verification",
    classification: "MISSING",
    owner: "platform_identity",
    evidence: "architecture defined in 16A",
  },
  {
    capability: "Account linking",
    classification: "MISSING",
    owner: "platform_identity",
    evidence: "architecture defined in 16A",
  },
];
