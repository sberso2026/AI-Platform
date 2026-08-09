# RTB Tier-1 External Pen-Test Assessor Package (Bounded)

**Phase:** 16C  
**Version:** `0.3.0-pen-test-readiness`  
**Mode:** Grey-box / hybrid (recommended)  
**Delivery:** Controlled channel at commissioning — not a public dump

## Package contents (bounded)

| Item | Status in Phase 16C |
|---|---|
| Architecture overview (high level) | Ready (see architecture docs) |
| Attack surface inventory | Ready — `RTB_TIER1_ATTACK_SURFACE_INVENTORY.md` |
| Scope document | Ready — `RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md` |
| Rules of engagement | Ready — `RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md` |
| Remediation / retest / S07 criteria | Ready — `RTB_TIER1_PEN_TEST_REMEDIATION_AND_S07_CLOSURE.md` |
| Test environment description | Ready (template below) |
| Roles & tenant fixtures | Ready (Tenant A / B) |
| Test accounts | Issued at commissioning (not in git secrets) |
| SSO configuration guide | Ready — enterprise SSO ops + Phase 16B contracts |
| API inventory (bounded) | Ready via attack-surface + module docs |
| Support / escalation contacts | Populated at commissioning |
| Environment parity register | Ready (template below) |
| Operations / monitoring notes | Ready (template below) |

## Explicit exclusions from default package

Unless white-box is explicitly commissioned:

- Full source code repository
- Sensitive internal architecture beyond agreed scope
- Production customer data
- Production secrets
- Unredacted internal incident history

## Tester selection requirements (minimum)

- Independent from RTB development
- Commercially credible security-testing practice
- Web / API / identity experience
- Multi-tenant SaaS experience
- OIDC/OAuth expertise
- Secure handling of customer-sensitive data
- Professional report and retest process

Arbitrary certification letters are not required if not commercially justified.

## Test environment template

| Attribute | Requirement |
|---|---|
| Architecture | Production-like |
| Auth paths | Real (local where enabled + enterprise SSO) |
| Tenant isolation / RLS | Representative |
| Entitlements | Representative |
| File access | Representative |
| AI authorization | Representative |
| Customer data | None (fixtures only) |

## Tenant fixtures

- **Tenant A:** owner/admin, manager/reviewer, engineer, viewer, enterprise SSO user, local user (if applicable), disabled user, revoked user
- **Tenant B:** owner/admin, manager/reviewer, engineer, viewer, enterprise SSO user

Purpose: safe cross-tenant isolation evaluation.

## Environment parity (known deviation register)

Populate before kickoff. Material differences **must** be disclosed.

| Area | Security-test | Production | Material? | Disclosure |
|---|---|---|---|---|
| Hosting region | _TBD_ | _TBD_ | _TBD_ | Required if yes |
| SSO IdP tenant | Controlled test Entra / fixture | Customer Entra | Usually yes | Disclose CA differences |
| Live commercial solvers | Typically off | Customer-dependent | Often yes | Control-plane focus |
| Observability retention | _TBD_ | _TBD_ | _TBD_ | Disclose |
| Rate limits / WAF | _TBD_ | _TBD_ | _TBD_ | Disclose |

## Operations during test

- Monitoring active for authn/authz/admin/SSO/execution-host events
- Contacts and incident escalation defined
- Assessor IP allowlisting if needed
- Provider coordination (Supabase/hosting/IdP) as required
- Rollback plan for test-induced misconfiguration
- Test account cleanup checklist
- Post-test credential rotation

## Post-test secret hygiene checklist

- [ ] Revoke temporary credentials
- [ ] Remove/disable test accounts where appropriate
- [ ] Rotate exposed/shared test secrets
- [ ] Remove temporary allowlists
- [ ] Archive evidence securely
- [ ] Confirm S07 still false until independent closure evidence validated

## SSO customer-specific boundary

Controlled Entra certification already supports S08. External pen test covers RTB enterprise SSO capability; it need not represent every future customer’s exact Conditional Access configuration.
