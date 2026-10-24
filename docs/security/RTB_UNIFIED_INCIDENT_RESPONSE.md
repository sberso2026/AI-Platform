# Unified RTB AI Platform / Engineering OS Incident Response (Phase 14D · S03)

Status: CLOSED · `UnifiedIncidentResponseReady=true`  
Companion runbook: `docs/operations/RTB_SECURITY_INCIDENT_RUNBOOK.md`

## Non-goals

No SIEM, SOC, or Security Intelligence product in this phase.

## Severity model

| Severity | Meaning |
| --- | --- |
| SEV1 | Active security impact / isolation breach / credential compromise |
| SEV2 | Significant security event without confirmed customer data loss |
| SEV3 | Limited security degradation |
| SEV4 | Minor / informational |

## Categories (minimum)

- Suspected cross-tenant access
- Privileged credential compromise
- External AI provider security event
- Solver / execution-host compromise
- Production secret exposure
- Data exposure
- Platform / Engineering OS availability security impact

## Lifecycle

detection/intake → ownership → technical escalation → security escalation →
containment → evidence preservation → recovery → customer communication governance →
post-incident review → closure

**Do not invent contractual notification periods.** Customer communication requires security lead authorization when impact is confirmed.

## Ownership

| Area | Owner |
| --- | --- |
| Platform / EOS aggregate | Platform On-Call |
| Identity / privileged access | Identity owner + Security On-Call |
| AI provider | AI Runtime owner |
| Execution host | Execution Host owner |
| Secrets | Ops + Secret Management owner |
| Tenant isolation | Platform Kernel / DB owner |

## Evidence preservation

Retain audit metadata, request ids, hashes, and configuration snapshots.  
Do **not** copy sensitive payloads, prompts, or secret values into tickets/logs.

## Certification fixtures

`packages/engineering-os/src/security-closure/incident-fixtures.ts` (IR-FIX-01…05)
