# EOS 1.0.0 production database promotion plan

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_DATABASE_PROMOTION_PLAN.md

PRODUCTION_MIGRATION_PROMOTION_ALLOWED: NO
PRODUCTION_MIGRATIONS_APPLIED: NO
PRODUCTION_SCHEMA_MUTATION_ALLOWED: NO

This plan does not authorize a production apply. Recovery was not rehearsed on an isolated target.

## 1. Current production schema

Project wcydlhqiqdwgoaqrlget. Applied versions: 102. Highest version: 20261007190000. Public tables: 478, all with row security. Public policies: 1120. Engineering tables: 60. Engineering policies: 174. WAL archiver reports archived_count 2954 and failed_count 0. That shows the server is archiving write-ahead logs. It is not a named backup id, a retention period, or a tested restore.

## 2. Required GA target

A controlled pilot that uses Engineering OS work plans, reviews, artifacts, and requirements needs the engineering tables that exist on staging and are absent on production. The security backport already on production stays. Security Assurance product tables stay off production. The superseded RLS-1 staging files stay off production.

## 3. Exact promotion list

No migration is cleared for production execution in this phase.

Candidate historical files, if a later phase has a verified restore and a passing isolated rehearsal: the 38 row-security migrations that create the missing engineering and identity tables, plus 20260930020000 and 20261001200000, which only add columns to tables those migrations create. That candidate count is 40. It is not an approval to run them.

## 4. Excluded migrations

20260808290000 through 20260808340000: staging-only Security Assurance. Six files. Absent on production. Do not apply.

20261007120000 and 20261007140000: superseded by 20261007160000, which is already applied. Do not apply.

20260831230000: replaced by 20260901013000, which is already applied. Production handle_new_user already contains the invite-tenant path. Replaying the older function would roll that behavior backward. Do not apply.

20260903080000: the gpt-4o-mini model_registry row is already present on production. Count observed: 1. Do not replay.

20260930050000: an index on knowledge_nodes. The index is absent. It is not required to open the pilot. Do not apply in this set.

## 5. Destructive migration

DESTRUCTIVE_MIGRATION_ID: 20261007120000
DESTRUCTIVE_OPERATION: DROP POLICY IF EXISTS on generated policy names, then recreate. The file header says it is additive and forbids destructive schema or data operations. The prior count treated DROP POLICY as destructive.
AFFECTED_OBJECTS: policies on the eight public tables named in that staging file, plus rtb_public_table_security_classification.
DATA_AT_RISK: none identified as a table drop or delete. The risk is replacing policies and requiring Security Assurance tables that production does not have.
REQUIRED_FOR_GA_PILOT: NO
SAFE_ALTERNATIVE_AVAILABLE: YES. 20261007160000 is already applied and created the classification register without those staging dependencies.
DESTRUCTIVE_MIGRATION_RISK_RESOLVED: YES, by exclusion. It must not be executed.

## 6. Data-transforming controls

20260831230000 replaces handle_new_user. Source is the current production function. Target would be the older function body. Production already has the later function from 20260901013000. Replaying it is not idempotent with respect to the later body. Failure mode is a signup trigger that no longer matches the later invite rule. Validation already performed read-only: invite variable is present and the later version id is applied. Do not run it.

20260903080000 inserts one model_registry row and updates it on conflict. The row is already present. A replay would still update display and cost columns. It is not required. Do not run it.

DATA_TRANSFORMATION_VALIDATED: NO as an executed dry run. The read-only checks are enough to exclude both files, not enough to approve a transform.

## 7. RLS policy changes

Production engineering policies are a subset of staging. In common: 174. Only on staging: 342. Only on production: 0. A promotion that copied the staging engineering policies would add policies. It would not, on this evidence, remove a production engineering policy. Storage policies were not changed and were not line-diffed. Full text of each policy expression was not exported.

RLS_POLICY_DIFF_COMPLETE: YES for engineering policy identity and command. NO for a line-by-line expression diff of every public policy.

## 8. Backup procedure

Do not start promotion on the WAL archive counter alone. Before any later apply, record a provider backup id for wcydlhqiqdwgoaqrlget from the Supabase backup list. This session could not list that id. Do not copy production rows into the repository.

## 9. Restore procedure

Restore only to an isolated target. Do not overwrite wcydlhqiqdwgoaqrlget. Confirm the restored catalog reaches version 20261007190000 and that engineering_work_plans is still absent before applying anything new. This session did not perform that restore.

## 10. Preflight checks

Production ref is wcydlhqiqdwgoaqrlget. Staging ref is rntonzigxwxcjlcsadip. Highest production version is still 20261007190000. The repository link remains staging. engineering_work_plans is absent. The two superseded RLS files are not applied. No bulk push.

## 11. Promotion order

None. There is no authorized order while restore and rehearsal are open.

## 12. Validation queries

After a future authorized apply, read-only checks are: highest migration version, to_regclass of engineering_work_plans, engineering policy count greater than 174, and a two-workspace denial test. Do not run those writes now.

## 13. Stop conditions

Stop if the target ref is not wcydlhqiqdwgoaqrlget, if a file in the excluded list is included, if restore has not been rehearsed on an isolated target, if a policy drop appears, or if the application cannot read a workspace without using service role as a substitute for a user.

## 14. Recovery

If a future apply fails, stop and restore the isolated target or the production project from the recorded backup id. Do not invent a down migration. An irreversible change is not an automatic rollback.

## Gate

EXACT_TARGET_SCHEMA_DEFINED: YES, as the staging engineering shape minus Security Assurance and minus the superseded files.
ACTUAL_REQUIRED_MIGRATION_SET_FINAL: NO. The candidate count is 40 and it is not executable.
BACKUP_AVAILABLE: WAL archive is active. A named backup was not identified.
RESTORE_PATH_VERIFIED: NO
MANUAL_RESTORE_VERIFICATION_REQUIRED: YES
STAGING_MIGRATION_REHEARSAL: NOT_PERFORMED. Staging already contains the feature tables. Replaying onto that shared project is not an isolated rehearsal from the production baseline.
POST_MIGRATION_RLS_REHEARSAL: NOT_RUN
GA_APPLICATION_SCHEMA_COMPATIBILITY: NOT_RUN
PRODUCTION_MIGRATION_PROMOTION_ALLOWED: NO
