# Inspection Intelligence V1 — Incident Response

## Severity
| Sev | Example | Response |
|-----|---------|----------|
| SEV1 | Cross-tenant leakage, evidence integrity failure | Immediate page; freeze writes; notify security |
| SEV2 | Provider outage > 30m, sync lag critical | On-call + AI platform |
| SEV3 | Elevated error rates within warning SLO | Business hours triage |

## Session / workflow
- Session command failures: check entitlements, idempotency keys, audit trail.
- Stuck workflow: identify instance id; resume or cancel with authority; never silent-complete.

## Events
- Event lag: inspect bus consumers; replay by id; ensure identifiers/status only (no evidence payloads).

## Vision governance
- Unexpected mutation attempt: block; audit; require human validation path only.

## Escalation
1. Engineering on-call
2. Platform on-call (Files / Event Bus / Entitlements)
3. AI platform on-call (provider/policy)
4. Security (integrity / isolation)

Reference: `INSPECTION_INTELLIGENCE_V1_OPERATIONS.md`, `INSPECTION_INTELLIGENCE_V1_ROLLBACK.md`
