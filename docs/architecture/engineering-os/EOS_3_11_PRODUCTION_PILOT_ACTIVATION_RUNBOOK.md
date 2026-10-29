# EOS 3.11 Production Pilot Activation Runbook

**Do not execute in EOS 3.11.** This is the future activation order after human GO.

## Prerequisites

- Human GO issued for exact candidate fingerprint
- Explicit EOS 3 release authority designated
- Fresh post-GO Production backup / recovery point verified
- External customer pilot hold remains ACTIVE (internal only)

## Activation order

1. Verify authorization fingerprint binds GO to candidate fingerprint, runtime, migration set, scope, claims, limitations, cohort, authority, timestamp
2. Verify candidate unchanged vs `c89f106af689a2e79c81a30d0a8420803e632220` (or approved RELEASE_EVIDENCE_COMMIT equivalence)
3. Create fresh Production backup / recovery point (post-GO)
4. Verify restore path
5. Verify EOS 2 GA baseline (ledger 161 pre-migration)
6. Verify EOS 3 kill switch fail-closed and EOS 2 isolation
7. Apply approved EOS 3 migrations (9 files, dependency order 3.1→3.9)
8. Verify ledger = 170
9. Deploy exact approved runtime
10. Verify EOS 2 regression (APIs, Ask AI, entitlement, customer hold)
11. Grant EOS 3-specific entitlement (not inherited from EOS 2)
12. Enroll only the approved single internal pilot workspace
13. Verify access-deny matrix (unentitled / unenrolled / Production defaults)
14. Verify RLS / cross-workspace isolation
15. Execute pilot smoke test (new EOS 3 project; no auto-migration)
16. Verify AI authority denials; confirm live LLM remains disabled
17. Verify audit completeness
18. Record activation evidence

## Rollback / kill

- Application rollback reference: `d61240896a07e7ff51280fd8d21f686ddc43795f` (EOS 3.9 close) for development-line rollback; Production EOS 2 GA remains primary Production continuity
- Invoke EOS 3 kill switch without disabling EOS 2 GA
- Revoke enrollment / entitlement before any schema reverse if required

## Support procedures (pilot)

- Verify access: entitlement + enrollment + generation routing
- Revoke enrollment: remove PILOT enrollment state; confirm DENY
- Invoke kill switch: `emergencyOff` / generation-specific suspend
- Application rollback: redeploy approved prior runtime
- Migration failure: stop; source EOS 2 immutable; restore from post-GO backup if needed
- AI failure: disable AI path; human workflow continues
- Retrieval/index issue: rebuild index without mutating canonical state
- RLS/security incident: SEV1 stop; kill switch; preserve audit
- Escalation: SEV1 → immediate stop conditions; SEV2 → release owner; SEV3 → support backlog

`EOS_3_PILOT_ACTIVATION_RUNBOOK_READY=YES`

`EOS_3_11_PRODUCTION_CHANGE_COUNT=0`
