# Engineering Review AI — pilot security gate

These classifications are not equivalent.

## INTERNAL_TEST_READY

- Authenticated Review MUP works on staging/internal fixtures
- Review table RLS proven
- Domain/unit tests green
- No live customer data required
- Password-only sessions acceptable for internal testers unless a tenant policy says otherwise

## CONTROLLED_PILOT_READY

Requires at minimum:

1. No unresolved CRITICAL security finding
2. All externally exploitable HIGH findings remediated **or explicitly human risk-accepted**
3. Review RLS proven on staging
4. Core access boundary appropriate for pilot (tenant + workspace where ownership supports it)
5. Trusted audit operating on staging
6. Secrets safe on the Review production path (no placeholder encryption; production secrets fail closed)
7. Identity assurance defined and enforceable (MFA and/or enterprise SSO by tenant policy)
8. External file-ingestion risk controlled (fail-closed without malware scanning)
9. Incident path defined (platform IR + Review security events)

AI cannot mark HIGH residual risks as accepted.

## ENTERPRISE_PRODUCTION_READY

Requires additional operational evidence **not expected from ERA-6 alone**:

- Independent attestation / SOC 2 examination evidence OPERATING
- Malware scanning for customer uploads
- Restore drill with measured RPO/RTO
- SIEM alerting on Review security events
- Hosted RLS CI secrets configured and job repeatedly green
- Tenant MFA/SSO policies applied for every production Review tenant
- Vulnerability management cadence and SBOM operational process
- Rate limiting and incident tabletop for Review

Do not treat INTERNAL_TEST_READY or CONTROLLED_PILOT_READY as ENTERPRISE_PRODUCTION_READY.
