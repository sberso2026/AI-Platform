# RTB Tier-1 External Penetration Test Scope

**Phase:** 16C — Tier-1 External Penetration Test Readiness  
**Version:** `0.3.0-pen-test-readiness`  
**Baseline:** Phase 16B PASS commit `0078c9b67021b695c5a4137905247818dd945d83` / hosted `31310620360`  
**Purpose:** Bound the certified RTB attack surface for an **independent** external penetration test required by S07.  
**Non-claim:** This document does **not** constitute completion of S07, an external pen-test opinion, or Tier-1 enterprise production readiness.

## 1. Engagement objective

Assess confidentiality, integrity, and tenant-isolation controls on the near-final Tier-1 RTB enterprise deployment surface so that genuine independent evidence can later satisfy S07 closure criteria.

## 2. Recommended engagement mode

**Grey-box / hybrid** (authenticated access + architecture briefing; source dump optional only if white-box is explicitly commissioned).

Rationale: multi-tenant SaaS with OIDC, RLS, AI authorization, and execution-host control planes is poorly served by pure black-box alone; full white-box is not required for S07 readiness packaging.

## 3. Environments

| Environment | Use |
|---|---|
| Dedicated production-like security-test / staging | **Preferred** primary test target |
| Production customer environments | **Out of scope** unless separately authorized in writing |
| Local developer workstations | Out of scope |

Requirements for the security-test environment:

- Real architecture and authentication paths (including enterprise SSO/OIDC)
- Representative tenant isolation, RLS, entitlements, file access, AI authorization
- **No** production customer data

Material parity deviations between security-test and production **must** be disclosed to the assessor (see environment parity register in the assessor package).

## 4. Domains / applications / APIs (IN_SCOPE)

Exact hostnames/IPs are supplied in the controlled assessor package at commissioning time. Categories:

- Public web application (`apps/web`)
- Authentication endpoints (local/password where enabled, session cookies)
- Enterprise SSO/OIDC (Phase 16B production capability; controlled Entra certification path)
- MFA / privileged MFA flows
- Privileged/admin surfaces (`/platform/*`, `/system/*` as applicable)
- Tenant and workspace APIs
- Files/storage APIs
- Search
- AI endpoints / Tool Framework
- Engineering OS
- Security & Assurance (internal vs customer separation)
- Frozen module APIs (Project/Inspection/Asset Intelligence, Project Controls, Digital Twin, Engineering Model Interoperability)
- Controlled Engineering Execution Host **control plane**
- Solver job interfaces (control plane only unless live solvers expressly provisioned)
- Webhooks / public callbacks if present in the test environment
- Administration and commerce/entitlement endpoints

## 5. IP ranges

Where applicable, RTB will provide:

- Application / edge IPs or hostnames for the security-test environment
- Optional assessor egress IP allowlisting (if required by hosting controls)

Do not treat cloud provider shared infrastructure ranges as blanket authorization for testing unrelated tenants or services.

## 6. Test accounts and tenant fixtures

Controlled fixtures (no production data):

| Fixture | Purpose |
|---|---|
| Tenant A | Isolation baseline |
| Tenant B | Cross-tenant contrast |

Representative roles per tenant (as applicable):

- owner / admin
- manager / reviewer
- engineer
- viewer
- enterprise SSO user
- local user (where password path enabled)
- disabled user
- revoked user

Privileged platform roles (e.g. `platform_admin`) are provided only under RoE and least privilege for the engagement window.

## 7. SSO providers in scope

- RTB enterprise SSO/OIDC production capability (Phase 16B / S08)
- Controlled Microsoft Entra configuration used for certification fixtures / security-test IdP

**Boundary:** The engagement tests RTB’s enterprise SSO capability. It need **not** reproduce every future customer’s exact Entra Conditional Access posture. Customer IdP policy defects remain EXTERNAL_PROVIDER unless caused by RTB misconfiguration.

## 8. Execution-host endpoints

In scope (bounded):

- Job authorization
- Tenant/workspace separation
- Artifact access
- Provider selection
- Workspace isolation
- Timeout/resource policy enforcement
- Unauthorized job access attempts

**Not required** unless expressly included and safely provisioned:

- Licensed live ETABS / SPACE GASS execution
- Destructive solver-host testing

## 9. Explicit test categories (summary)

### 9.1 Enterprise SSO

OIDC state/nonce/PKCE; issuer/audience/JWKS validation; redirect handling; tenant confusion; account linking; domain discovery; role mapping; MFA assurance; session/logout; offboarding; provider disablement.

### 9.2 Authorization / IDOR

Cross-tenant and cross-workspace access; role escalation; object-reference manipulation; hidden/admin endpoints; file access; search leakage; AI-context leakage.

### 9.3 API security

Authn/authz bypass; mass assignment; parameter manipulation; rate limits (where relevant); injection; unsafe deserialization (where applicable); error leakage; security headers; CORS; CSRF (where applicable); request replay; HTTP method abuse.

### 9.4 Web application security

Mapped to current OWASP (or equivalent recognized) web application methodology — not hard-locked to a single checklist if the assessor uses an equivalent recognized method.

### 9.5 AI security surface

Prompt-injection boundaries; unauthorized retrieval; cross-tenant context; tool authorization; sensitive-data disclosure; classification-aware provider restrictions; indirect prompt injection where relevant. Hidden chain-of-thought disclosure is not required.

### 9.6 File / artifact security

Upload/download authorization; object-ID manipulation; signed URL behavior; content-type and malicious filename handling; path traversal; cross-tenant artifact/document disclosure.

### 9.7 Security & Assurance surface

Internal/customer separation; claim/package authorization; restricted evidence access; customer assurance disclosure; cross-tenant assurance data; admin authorization.

### 9.8 Logging / detection evidence

Engagement should be able to demonstrate evidence of authentication failures, authorization failures, admin activity, SSO failures, suspicious activity, and execution-host security events — without requiring secret or sensitive payload exposure merely for testing.

## 10. EXTERNAL_PROVIDER surfaces

Testers may interact with, but RTB does not own:

- Supabase (Auth/Postgres hosting)
- Microsoft Entra (customer/corporate IdP)
- Vercel / cloud hosting
- AI model providers
- Commercial solver hosts

Distinguish **RTB configuration defect** from **provider-owned defect** in all reporting.

## 11. OUT_OF_SCOPE / exclusions

Unless separately authorized in writing:

- Production customer data destruction or uncontrolled production testing
- Uncontrolled DoS / stress against shared infrastructure
- Destructive database actions
- Physical security testing
- Employee social engineering / phishing
- Credential theft outside provided test accounts
- Malware deployment
- Commercial-license abuse of solver products
- Claiming ISO / SOC / Essential Eight certification via this engagement alone
- Public Trust Center / SIEM-as-product (not applicable surfaces)

## 12. S07 relationship

`S07ExternalPenTestComplete` may become true **only** when genuine independent external evidence confirms the required scope was assessed and blocking findings are resolved per approved policy. Internal readiness (this Phase 16C package) is **not** sufficient.

## 13. Document control

| Field | Value |
|---|---|
| Owner | Platform Identity / Security operations (commissioning) |
| Classification | Assessor-confidential when populated with hosts/credentials |
| Related | `RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md` |
