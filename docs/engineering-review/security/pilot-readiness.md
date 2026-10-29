# Engineering Review AI — pilot security gate

These classifications are not equivalent. ERA-7 does not set ENTERPRISE_PRODUCTION_READY = YES.

## INTERNAL_TEST_READY

- Authenticated Review MUP works on staging/internal fixtures
- Review table RLS proven
- Domain/unit tests green
- No live customer data required
- Password-only sessions acceptable for internal testers unless a tenant policy says otherwise

## CONTROLLED_PILOT_READY

Requires all of:

1. No unresolved exploitable CRITICAL security vulnerability
2. Tenant/workspace/project RLS proven
3. Required security schema deployed
4. Hosted security CI operates or equivalent mandatory release gate exists
5. Trusted audit operates
6. Pilot identity assurance is enforced
7. Customer document malware risk is controlled
8. Secrets are protected
9. Incident response path exists
10. Security monitoring/alerting exists at pilot-appropriate level
11. Backup/recovery has meaningful evidence
12. Dependency CRITICAL findings are resolved or proven not exploitable
13. Residual HIGH risks are explicitly surfaced
14. No security control was weakened to obtain PASS

AI cannot mark HIGH residual risks as accepted. Where a human must accept admin pre-scan, MFA enrollment, PITR gap, or hosted-CI secrets, the status is `HUMAN_DECISION_REQUIRED`.

## ENTERPRISE_PRODUCTION_READY

Requires additional operational evidence **not expected from ERA-7**:

- Independent attestation / SOC 2 examination evidence OPERATING
- Established malware scanning OPERATING for customer uploads
- PITR restore drill with measured RPO/RTO
- SIEM alerting on Review security events
- Hosted RLS CI repeatedly green
- Tenant MFA/SSO enrolled for every production Review tenant
- Vulnerability management cadence and SBOM operational process
- Rate limiting and incident tabletop for Review

Do not treat INTERNAL_TEST_READY or CONTROLLED_PILOT_READY as ENTERPRISE_PRODUCTION_READY.
