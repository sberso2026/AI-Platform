# Engineering OS V1 Operations

Status: GA · `1.0.0` · Companion to Phase 14D security IR / secret / backup runbooks

## Installation / enablement

1. Install Engineering OS product via Platform Commerce
2. Enable entitled modules (lifecycle: installed → enabled)
3. Verify launcher shows six production modules when entitled
4. Confirm aggregate health and shared-domain pins

## Health

Statuses: `healthy` · `degraded` · `partially_available` · `unavailable` · `unknown`

- Component health remains visible
- Blocked optional external solvers must **not** mark EOS down
- Critical Platform/database failure must **not** report healthy

## Incident response

Follow `docs/operations/RTB_SECURITY_INCIDENT_RUNBOOK.md` and
`docs/security/RTB_UNIFIED_INCIDENT_RESPONSE.md`.

## Backup / restore

Follow `docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md`.

| Metric | Status |
| --- | --- |
| RPO | DEFINED_NOT_TESTED (provider schedule; not RTB SLA) |
| RTO | MEASURED (fixture/isolated; not enterprise SLA) |

## Secret revocation

Follow `docs/security/RTB_SECRET_LIFECYCLE_AND_ROTATION.md`.

## Outage postures

| Outage | Expected posture |
| --- | --- |
| Provider / hosting | Product unavailable |
| Database | Product unavailable |
| AI provider | Fail-closed / degrade AI features |
| External solver | Bounded; no silent fallback |
| Execution host | Suspend jobs; host quarantine playbook |
| Module degradation | Partial availability; other modules may remain |

## Upgrade / rollback

Certified upgrade path: `0.12.0-security-closure` → `1.0.0`.

Preserve: manifest, registry, launcher, entitlements, context, search, health,
commercial configuration, shared-domain pins, security controls.

Rollback: redeploy prior build identity; do not move frozen tags.

## Support escalation

Platform On-Call → module owner → Security On-Call (SEV1/SEV2 security).
