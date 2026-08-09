# Platform Enterprise SSO Gap Register

Status: **READY** · Phase 16A

## Classification legend

| Class | Meaning |
|---|---|
| REQUIRED_FOR_S08 | Must be delivered to set `S08CustomerSsoProductionReady=true` |
| REQUIRED_BEFORE_TIER1 | Needed for Tier-1 beyond/alongside S08 |
| POST_V1 | Deferred after S08 |
| OPTIONAL | Useful; not mandatory for S08 |
| EXTERNAL_DEPENDENCY | Outside Platform Identity delivery |
| NOT_APPLICABLE | Explicitly out of scope |

## Gaps

| ID | Gap | Class | Notes |
|---|---|---|---|
| EI-01 | OIDC federation into authoritative Platform Auth | REQUIRED_FOR_S08 | Primary protocol |
| EI-02 | Microsoft Entra first-class enterprise app path | REQUIRED_FOR_S08 | Provider-neutral still required |
| EI-03 | Tenant SSO configuration model + admin UI | REQUIRED_FOR_S08 | No hard-coded tenants |
| EI-04 | Issuer / audience / tenant validation | REQUIRED_FOR_S08 | Fail closed |
| EI-05 | Tenant SSO policy modes + no unsafe password fallback | REQUIRED_FOR_S08 | required modes |
| EI-06 | Domain verification before auto-routing | REQUIRED_FOR_S08 | DNS/well-known/governed |
| EI-07 | External subject → user/tenant binding | REQUIRED_FOR_S08 | stable `sub` |
| EI-08 | Governed account linking | REQUIRED_FOR_S08 | anti-takeover |
| EI-09 | Claim mapping | REQUIRED_FOR_S08 | email/groups/assurance |
| EI-10 | Governed role/group mapping | REQUIRED_FOR_S08 | privileged review |
| EI-11 | MFA assurance propagation + 14D reconcile | REQUIRED_FOR_S08 | SSO ≠ MFA |
| EI-12 | Session revoke / logout / offboarding policy | REQUIRED_FOR_S08 | truthful limits |
| EI-13 | Multi-tenant IdP isolation tests | REQUIRED_FOR_S08 | issuer/tenant/domain |
| EI-14 | Audit + events for SSO lifecycle | REQUIRED_FOR_S08 | existing Audit/Event Bus |
| EI-15 | Secrets via platform secrets infra | REQUIRED_FOR_S08 | no plaintext in Sec&A |
| EI-16 | Customer login UX (discovery / SSO redirect / errors) | REQUIRED_FOR_S08 | safe errors |
| EI-17 | SAML 2.0 federation | OPTIONAL / POST_V1 | reserved secondary |
| EI-18 | JIT provisioning | OPTIONAL | bounded defaults if added |
| EI-19 | SCIM 2.0 | POST_V1 | lifecycle ≠ auth |
| EI-20 | MFA enrollment UX completion | REQUIRED_BEFORE_TIER1 | complements 14D |
| EI-21 | Invitation product flows | OPTIONAL | helpful for pre-provision |
| EI-22 | Session revocation admin UI | OPTIONAL | may ride with S08 session work |
| EI-23 | Public Trust Center | NOT_APPLICABLE | Sec&A intentionally unavailable |
| EI-24 | S07 external pen test | EXTERNAL_DEPENDENCY / REQUIRED_BEFORE_TIER1 | after SSO + near-final surface |
| EI-25 | Customer IdP Conditional Access engine inside RTB | NOT_APPLICABLE | boundary locked |
| EI-26 | Second Identity Provider replacing Supabase | NOT_APPLICABLE | duplicate IdP forbidden |

## Counts (open)

- REQUIRED_FOR_S08: EI-01 … EI-16 (implementation phases)
- REQUIRED_BEFORE_TIER1 (non-S08): EI-20, EI-24
- POST_V1: EI-17 (partial), EI-19
- OPTIONAL: EI-18, EI-21, EI-22
- EXTERNAL_DEPENDENCY: EI-24
- NOT_APPLICABLE: EI-23, EI-25, EI-26

Discovery phase does not close REQUIRED_FOR_S08 gaps — it locks architecture so implementation can close them.
