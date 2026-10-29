# EOS 2.16 Observability and Smoke-Test Plan

Do not run this plan against Production in EOS 2.16.

## Signals already available

- Vercel runtime logs for the production deployment.
- Supabase logs and the daily physical backup list. Point-in-time recovery is not enabled.
- Application audit rows in `engineering_delivery_audit` after migration.
- Release-governance identity: `/api/platform/build-identity`.

No new SLO is defined. No new alert product is required for the first controlled step. The human release authority receives escalation for the triggers below.

## Watch before and after

Availability of the production host, authentication success and failure, database health, request latency where Vercel reports it, critical server errors, and security denials. Capture the same readings before migration and for the first observation period after deploy. Do not put engineering document contents or qualification secrets into telemetry.

Escalate to the human release authority for: authentication outage, deployment failure, migration failure, tenant-isolation anomaly, authorization bypass, critical runtime error, data corruption, or release-governance source mismatch.

## Smoke tests before any cohort enablement

| Test | Expected | Failure action |
| --- | --- | --- |
| Build identity | Approved candidate commit, production env, `wcydlhqiqdwgoaqrlget` | Stop. Do not enable a cohort. |
| Health and login | Existing pilot login succeeds | Roll back the application if the pilot cannot sign in. |
| Logout and protected route | Protected page returns to login | Roll back on auth regression. |
| Workspace isolation | A second workspace does not show the first workspace project | Immediate stop. |
| EOS 1.0 pilot path | Existing workbench, TQ, decision, or action path still opens | Roll back. |
| EOS 2 read, only where the cohort control allows | Lifecycle, basis, one discipline home, interface, change impact, deliverable, baseline | Keep the cohort off. |
| AI authority | AI cannot approve, accept, freeze, or release | Stop on approval granted. |
| Audit | The smoke actor and action are stored | Stop on missing audit. |
| Ledger | 158 versions, maximum `20261029120000`, duplicates 0 | Stop. Do not replay. |

## Post-enablement pilot test

One authorized workspace only. Create no synthetic qualification project. Path: Engineering Basis, one discipline object, one interface, one controlled revision, one candidate impact, one deliverable state, one audit row. Do not run an external solver or an unqualified calculation. A cross-workspace leak aborts the cohort.

## Support

Intake is the existing pilot channel to the human release authority. Collect build identity, workspace id, route, timestamp, and the audit action. Do not collect secrets. Severity uses Critical, High, Medium, and Low. Known limits remain the EOS 2.15R claims register.

## Execution sequence, fail closed

1. Human GO, with RD-001 closed by a requalified cohort control.
2. Verify a new Production backup.
3. Record build identity and ledger count 144.
4. Apply only the fourteen manifest versions, in order, to `wcydlhqiqdwgoaqrlget`.
5. Read the ledger. Expect count 158 and maximum `20261029120000`.
6. Confirm the EOS 1.0 deployment still serves the pilot.
7. Deploy only `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`.
8. Read build identity. Mismatch stops the phase.
9. Leave `EOS_2_ROLLOUT` unset and leave tenant mode off. Missing `settings.eos2.mode` is off.
10. Run the pre-enablement smoke tests.
11. Enable only the named workspace.
12. Run the post-enablement path.
13. Human GO to continue, or rollback to `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`.

Each step uses the previous step's evidence as its prerequisite. Failure uses the rollback runbook.
