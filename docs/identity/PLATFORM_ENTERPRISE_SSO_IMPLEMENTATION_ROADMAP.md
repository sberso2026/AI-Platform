# Platform Enterprise SSO Implementation Roadmap

Status: **READY** · Phase 16A · Minimum scope to close S08

## Recommended next implementation (post-16A)

Supported by 16A evidence only:

1. **OIDC / Entra first-class federation** into authoritative Platform Auth (provider-neutral)
2. **Tenant SSO configuration** store + review status (secrets via platform secrets)
3. **Issuer / audience / tenant validation** fail-closed
4. **Domain verification** before automatic IdP routing
5. **Claim mapping** + **governed role mapping** (privileged mappings reviewed)
6. **Account linking** with anti-takeover controls
7. **Multi-tenant IdP isolation** certification
8. **MFA assurance propagation** reconciled with Phase 14D privileged MFA
9. **Session / logout / revocation / offboarding** policy enforcement
10. **Admin configuration surfaces** + Audit/Event metadata
11. **Customer login UX** (email-first discovery, org SSO, safe errors)
12. **S08 production certification** gates → only then `S08CustomerSsoProductionReady=true`

## Explicitly deferred

- SCIM (POST_V1)
- SAML (reserved secondary)
- Uncontrolled JIT privilege
- Public Trust Center
- Replacing Supabase / Platform Core as IdP
- S07 external pentest (after near-final Tier-1 surface)

## Sequencing with S07

Complete S08 implementation/certification and stabilize near-final Tier-1 surface **before** independent external penetration test.
