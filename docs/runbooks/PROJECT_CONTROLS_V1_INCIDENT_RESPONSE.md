# Project Controls V1.0 — Incident Response

## Severity model

| Severity | Example |
| --- | --- |
| SEV-1 | Cross-tenant data exposure |
| SEV-2 | Governance lock breach (CPM/EV/financial posting enabled) |
| SEV-3 | Health endpoint degraded |
| SEV-4 | UI readiness marker missing |

## Governance lock breach

If `CPM_SCHEDULING_IMPLEMENTED`, `EARNED_VALUE_IMPLEMENTED` or `FINANCIAL_POSTING_IMPLEMENTED` becomes true, treat as SEV-2. Roll back to tag `project-controls-v1.0.0` and open a release blocker.

## Tenant isolation

Verify RLS on `project_controls_*` tables. Anonymous clients must read zero rows.

## Contact

Engineering OS on-call → Platform SRE → Release owner for GA tag decisions.
