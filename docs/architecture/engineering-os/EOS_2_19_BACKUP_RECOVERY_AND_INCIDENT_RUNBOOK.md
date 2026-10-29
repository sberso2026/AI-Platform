# EOS 2.19 Backup, Recovery, and Incident Runbook

`PRODUCTION_RECOVERY_RUNBOOK_COMPLETE=YES`

`CURRENT_PRODUCTION_SCHEMA_RECOVERABILITY=PASS`

`PITR_GA_DISPOSITION=RECOMMENDED_FOR_GA`

`PRODUCTION_OBSERVABILITY_HARDENING=PASS`

`PRODUCTION_INCIDENT_RUNBOOK_COMPLETE=YES`

`PRODUCTION_INCIDENT_EXERCISE=PASS`

## Recovery posture

| Topic | Current state |
| --- | --- |
| Mechanism | Logical Supabase dump/restore (existing EOS verified path) + Vercel deployment rollback |
| Cadence | Operator-initiated logical backups around governed Production changes; not continuous PITR |
| Ownership | Authorized Production release authority / pilot operator |
| Retention | Retain last known-good dump covering migration `20261029140000` and successor dumps as taken |
| Application rollback | Redeploy prior Ready Production deployment ID (example retained: `dpl_eXE8meiGGdYAvBQ6uKJMFRKbiMkC` before 2.19 hardening; prior rollback target from 2.18R evidence remains documented) |
| Database recovery | Restore logical dump into isolated environment first; never restore over Production without dual human confirmation |
| RPO | Unvalidated quantitative RPO — mark `UNVALIDATED`; logical backup RPO equals time since last successful dump |
| RTO | Unvalidated quantitative RTO — mark `UNVALIDATED`; dominated by dump size + restore + cutover checks |

### Decision tree

1. Application-only defect → rollback Vercel deployment; keep database.
2. Bad migration/data write → stop writes; restore isolated copy; compare ledger; dual human approval before Production cutover.
3. Suspected leak/authorization bypass → kill-switch EOS 2 (`eos2_18r_set_rollout_mode` → `off`); preserve EOS 1; open SEV1.

`CURRENT_PRODUCTION_SCHEMA_RECOVERABILITY=PASS` is based on continuing ledger presence of additive migration `20261029140000` and prior EOS logical restore evidence after that schema. A fresh isolated restore was not re-executed in this phase when unsafe/unnecessary; disposition remains PASS with that evidence boundary.

PITR is **recommended for GA** for tighter RPO but is **not auto-purchased** here. Not required to complete EOS 2.19 controlled-pilot hardening.

## Observability view (support)

Support can use:

- Vercel deployment Ready/status + alias `eos-pilot.rtbea.com.au`
- Browser network/console for 401/403/5xx
- Supabase project health + management query for mode/enrollment/ledger
- `engineering_delivery_audit` for rollout and EOS 2 workflow actions
- Canonical gate JSON for release health
- Ask abstention / AI error responses where instrumented

Do not dump confidential engineering content into shared tickets.

## Severity model

| Sev | Meaning | EOS examples | Containment |
| --- | --- | --- | --- |
| SEV1 | Active data leak, authz bypass, Production outage, lost governed writes at scale | Cross-workspace leak; unauthorized approve/release; EOS 2 on for all installs | Kill switch; revoke sessions; freeze deploys |
| SEV2 | Rollout-control failure, corrupted persistence path, AI grounding fabricating approvals | Mode audit diverge; duplicate governed revisions | Disable writes/enrollment; patch; verify RLS |
| SEV3 | Degraded performance, intermittent hydration without state corruption, retrieval abstention noise | DEGRADED_NONBLOCKING latency; #418 without wrong state | Monitor; schedule hardening |
| SEV4 | Cosmetic | Favicon 404 | Backlog |

Escalation: pilot operator → Authorized Production Release Authority → platform on-call as designated.

## Incident exercise (non-destructive)

Unauthenticated mutating EOS 2 accept-interface style probe and unauthorized role actions return safe denial without leakage or state corruption (carried from EOS 2.18 and reconfirmed as still the denial model post-hardening). Tabletop: SEV1 leak → kill switch off → preserve EOS 1 → audit enrollment unchanged → restore mode only after dual confirmation.
