# Digital Twin V1.0 — Incident Response

## Severity model

- Sev-1: governance lock breach, tenant isolation / IDOR, silent solver fallback
- Sev-2: hosted persistence outage, solver sandbox unavailable
- Sev-3: UI/entitlement degradation

Fail closed on external solver errors. Never fabricate provenance.
