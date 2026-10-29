import type {
  ComplianceMapping,
  ControlImplementationReference,
  SecurityControl,
} from "../contracts";

/** Seed RTB controls including S01–S08 ownership-preserving references. */
export const SEED_CONTROLS: SecurityControl[] = [
  {
    controlId: "RTB-SEC-S01",
    title: "Privileged MFA / break-glass",
    objective: "Privileged production access requires MFA; break-glass is audited.",
    category: "identity",
    lifecycle: "active",
    ownerDomain: "platform_core",
  },
  {
    controlId: "RTB-SEC-S02",
    title: "Dependency SCA",
    objective: "Dependency scanning runs in CI with governed exceptions.",
    category: "secure_sdlc",
    lifecycle: "active",
    ownerDomain: "ops",
  },
  {
    controlId: "RTB-SEC-S03",
    title: "Incident response",
    objective: "Bounded incident response process with exercise evidence.",
    category: "incident_readiness",
    lifecycle: "active",
    ownerDomain: "ops",
  },
  {
    controlId: "RTB-SEC-S04",
    title: "Secret lifecycle",
    objective: "Secrets rotation and exposure prevention.",
    category: "data_protection",
    lifecycle: "active",
    ownerDomain: "platform_core",
  },
  {
    controlId: "RTB-SEC-S05",
    title: "Classification-aware AI/logging",
    objective: "AI and logs respect data classification policy.",
    category: "ai_security",
    lifecycle: "active",
    ownerDomain: "platform_core",
  },
  {
    controlId: "RTB-SEC-S06",
    title: "Backup / restore",
    objective: "Backup and restore evidence with RPO/RTO tracking.",
    category: "recovery",
    lifecycle: "active",
    ownerDomain: "ops",
  },
  {
    controlId: "RTB-SEC-S07",
    title: "External penetration test",
    objective: "Independent pen-test before Tier-1 production.",
    category: "compliance_evidence",
    lifecycle: "active",
    ownerDomain: "external",
    definedOnly: true,
  },
  {
    controlId: "RTB-SEC-S08",
    title: "Customer enterprise SSO",
    objective: "Customer OIDC/SAML SSO productization (Platform Identity owns).",
    category: "identity",
    lifecycle: "active",
    ownerDomain: "platform_core",
    definedOnly: true,
  },
  {
    controlId: "RTB-SEC-ISO-BASE",
    title: "Tenant / workspace isolation baseline",
    objective: "RLS and authorization enforce tenant/workspace isolation.",
    category: "isolation",
    lifecycle: "active",
    ownerDomain: "platform_core",
  },
];

export const SEED_IMPLEMENTATIONS: ControlImplementationReference[] = [
  {
    implementationId: "impl-s01-mfa",
    controlId: "RTB-SEC-S01",
    owner: "Platform Identity",
    capabilityRef: "packages/engineering-os/src/security-closure/privileged-mfa.ts",
    version: "1.0.0",
    scope: "privileged_production",
    authoritative: true,
  },
  {
    implementationId: "impl-s02-sca",
    controlId: "RTB-SEC-S02",
    owner: "DevOps",
    capabilityRef: "packages/engineering-os-certification/scripts/run-dependency-sca.ts",
    version: "1.0.0",
    scope: "ci",
    authoritative: true,
  },
  {
    implementationId: "impl-s08-sso",
    controlId: "RTB-SEC-S08",
    owner: "Platform Identity",
    capabilityRef: "platform_identity.customer_sso",
    version: "pending_tier1",
    scope: "enterprise_customers",
    authoritative: true,
  },
  {
    implementationId: "impl-isolation-rls",
    controlId: "RTB-SEC-ISO-BASE",
    owner: "Platform Core",
    capabilityRef: "supabase/migrations/*_rls_policies.sql",
    version: "platform",
    scope: "database",
    authoritative: true,
  },
];

/** S01–S06 CLOSED evidence refs (metadata only). */
export const CLOSED_S01_S06 = [
  "RTB-SEC-S01",
  "RTB-SEC-S02",
  "RTB-SEC-S03",
  "RTB-SEC-S04",
  "RTB-SEC-S05",
  "RTB-SEC-S06",
] as const;

export const TIER1_EXTERNAL = {
  S07: {
    controlId: "RTB-SEC-S07",
    ownership: "EXTERNAL_ASSURANCE / Platform Security program",
    status: "REQUIRED_BEFORE_TIER1_PRODUCTION",
  },
  S08: {
    controlId: "RTB-SEC-S08",
    ownership: "Platform Identity",
    status: "REQUIRED_BEFORE_TIER1_PRODUCTION",
    securityAssuranceOwns: false,
  },
} as const;

export const SEED_FRAMEWORK_MAPPINGS: ComplianceMapping[] = [
  {
    mappingId: "map-s01-iso-a5",
    controlId: "RTB-SEC-S01",
    frameworkId: "ISO27001",
    frameworkRequirementRef: "A.5 / access control themes",
    certified: false,
  },
  {
    mappingId: "map-s01-nist-pr-aa",
    controlId: "RTB-SEC-S01",
    frameworkId: "NIST_CSF_2",
    frameworkRequirementRef: "PR.AA",
    certified: false,
  },
  {
    mappingId: "map-s01-e8-mfa",
    controlId: "RTB-SEC-S01",
    frameworkId: "ESSENTIAL_EIGHT",
    frameworkRequirementRef: "Multi-factor authentication",
    certified: false,
  },
  {
    mappingId: "map-s02-nist-id-ra",
    controlId: "RTB-SEC-S02",
    frameworkId: "NIST_CSF_2",
    frameworkRequirementRef: "ID.RA",
    certified: false,
  },
];
