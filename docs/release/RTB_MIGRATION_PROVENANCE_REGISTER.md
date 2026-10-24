# RTB Migration Provenance Register

**Phase:** RTB-REL-1A / RTB-REL-1B  
**Date:** 2026-10-07  
**Branch:** `cursor/era-7a-engineering-review-pilot-gate`  
**REL-1A HEAD:** `a3fd0f6a0c598ee35218f0a3d0c673bc7b36a2e7`  
**Principle:** A missing historical migration is an evidence problem. Do not invent SQL. Historical provenance and current-state recoverability are separate.

Hosted ledgers were re-queried independently of the RTB-REL-1 snapshot.

| Environment | Project ref | Applied count | Ledger-only |
| --- | --- | --- | --- |
| Staging | `rntonzigxwxcjlcsadip` | 131 | 12 |
| Production (Engineering OS) | `wcydlhqiqdwgoaqrlget` | 100 | 2 |

**LEDGER_ONLY_TOTAL:** 14  
**UNKNOWN_UNCLASSIFIED:** 0  

Recovered Business OS SQL lives in `docs/release/historical-migrations/` as historical artifacts. Those files are **not** live `supabase/migrations` entries and must not be applied to Engineering OS production.

Production and staging schemas were not modified in this phase.

## Disposition summary

| Class | Count | Versions |
| --- | --- | --- |
| RECOVERED_EXACT | 0 | — |
| RECOVERED_FROM_TRUSTED_HISTORY | 12 | staging Business OS batches 97–108 |
| EQUIVALENT_STATE_PROVEN | 0 | — |
| SUPERSEDED_WITH_EVIDENCE | 0 | — |
| FORMALLY_RETIRED | 0 | — |
| UNRESOLVED_BLOCKED | 2 | `20260810210000`, `20260810220000` |

`RECOVERED_FROM_TRUSTED_HISTORY` rather than `RECOVERED_EXACT` because the SQL was restored from sibling Business OS branches that are **not ancestors** of this Engineering OS HEAD.

## Authoritative ledger-only list

Verified against hosted `supabase_migrations.schema_migrations` (read-only). Chronology is by version timestamp.

| VERSION | ENVIRONMENT | LEDGER_PRESENT | REPOSITORY_SQL_PRESENT | HISTORICAL_ARTIFACT | CURRENT_MANIFEST_STATE | CHRONOLOGICAL_POSITION |
| --- | --- | --- | --- | --- | --- | --- |
| 20260810210000 | production | YES | NO | NO | BLOCKED / UNRESOLVED_BLOCKED | after `20260808280000`, before `20260901013000` |
| 20260810220000 | production | YES | NO | NO | BLOCKED / UNRESOLVED_BLOCKED | after `20260810210000`, before `20260901013000` |
| 20260818000000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260808350000`, before `20260818120000` |
| 20260818120000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260818000000` |
| 20260818130000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260818120000` |
| 20260818140000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260818130000` |
| 20260819100000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260818140000` |
| 20260819110000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819100000` |
| 20260819120000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819110000` |
| 20260819130000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819120000` |
| 20260819140000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819130000` |
| 20260819150000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819140000` |
| 20260819160000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819150000` |
| 20260819170000 | staging | YES | NO | YES | STAGING_ONLY / RECOVERED | after `20260819160000`, before `20260831230000` |

Name collision warning: production `20260810210000` hosted name is `batch_98_signup_commercial_bootstrap`. Staging `20260818120000` hosted name is `batch_98_business_os_financial_intelligence`. Same informal batch number, different products and timestamps. They are not the same migration.

## Staging recoveries (Business OS)

All twelve were found as `supabase/migrations/<filename>` on `origin/cursor/bos-*` branches. `git merge-base --is-ancestor <source-commit> HEAD` is false. Hosted staging `name` values match the recovered filenames. Files were restored byte-for-byte; Git blob SHAs match.

Security relevance for all twelve: **YES**. The SQL enables tenant/workspace Row Level Security, issues GRANTs, and includes SECURITY DEFINER helpers. That is expected Business OS product isolation on staging, not an Engineering OS production control gap. Promotion remains fail-closed (`STAGING_ONLY`).

Current schema relevance: these objects belong to the Business OS sibling product line. This branch reconstructs Engineering OS from `supabase/migrations/` and does not replay these files.

<a id="20260818000000"></a>

### 20260818000000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `1ba939f6e55609609da67a2be5252d529b446841` (`origin/cursor/bos-1-owner-command-centre-2756`), path `supabase/migrations/20260818000000_batch_97_business_os_owner_command.sql`, blob `6bf52c4f6789ecc40b2e9bf14bee7b2cfd9bf56c` |
| HOSTED LEDGER NAME | `batch_97_business_os_owner_command` |
| SECURITY RELEVANCE | YES — tenant/workspace RLS, GRANTs, SECURITY DEFINER |
| CURRENT SCHEMA RELEVANCE | Staging Business OS owner-command tables; not live on this branch |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob matches source commit. Not an ancestor of this HEAD, so classified from trusted history rather than exact current-lineage recovery. |

<a id="20260818120000"></a>

### 20260818120000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `f70167a29932ebb4a372c9f3d59570e7716f14ae` (`origin/cursor/bos-2-financial-intelligence-2756`), path `supabase/migrations/20260818120000_batch_98_business_os_financial_intelligence.sql`, blob `6b24be97b6cee9075c7232ee38aae940897e82c3` |
| HOSTED LEDGER NAME | `batch_98_business_os_financial_intelligence` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS financial-intelligence schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Same recovery model as batch 97. Distinct from production `batch_98_signup_commercial_bootstrap`. |

<a id="20260818130000"></a>

### 20260818130000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `c518a145d3d143b05137b0c849f6c24471a04c46` (`origin/cursor/bos-3-growth-intelligence-2756`), path `supabase/migrations/20260818130000_batch_99_business_os_growth_intelligence.sql`, blob `90e0464faf645358185ff91aaf69a97a769164be` |
| HOSTED LEDGER NAME | `batch_99_business_os_growth_intelligence` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS growth-intelligence schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Distinct from production `batch_99_document_storage_ai_assistant_uat`. |

<a id="20260818140000"></a>

### 20260818140000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `17afb57d2e01d3f2905a9016d59d2381b39b8b99` (`origin/cursor/bos-4-revenue-execution-2756`), path `supabase/migrations/20260818140000_batch_100_business_os_revenue_execution.sql`, blob `0a5a81c8d7e12fd20fec4449cef7c19423d58325` |
| HOSTED LEDGER NAME | `batch_100_business_os_revenue_execution` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS revenue-execution schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-4. |

<a id="20260819100000"></a>

### 20260819100000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `eb5231a9797d462721555e081a7f754e826e6f86` (`origin/cursor/bos-5-customer-intelligence-2756`), path `supabase/migrations/20260819100000_batch_101_business_os_customer_intelligence.sql`, blob `7b1ad07419dd157c94b1a419774c31a2e4374ebf` |
| HOSTED LEDGER NAME | `batch_101_business_os_customer_intelligence` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS customer-intelligence schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-5. |

<a id="20260819110000"></a>

### 20260819110000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `ac8db1abd3f008f06943c7502253e0dd0d1853b3` (`origin/cursor/bos-6-profit-intelligence-2756`), path `supabase/migrations/20260819110000_batch_102_business_os_profit_intelligence.sql`, blob `2c96aad86abf0120c3a0392976d08e5ad05e2e68` |
| HOSTED LEDGER NAME | `batch_102_business_os_profit_intelligence` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS profit-intelligence schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-6. |

<a id="20260819120000"></a>

### 20260819120000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `56e3a20a4a4831b06a521f94678529770a10e457` (`origin/cursor/bos-7-work-operations-2756`), path `supabase/migrations/20260819120000_batch_103_business_os_work_operations.sql`, blob `95a6e0e45f1343b2219d9cac7b55e286e649c167` |
| HOSTED LEDGER NAME | `batch_103_business_os_work_operations` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS work-operations schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-7. |

<a id="20260819130000"></a>

### 20260819130000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `534953a5f5ffb17a3e9f09de0e4741fc2c60f53b` (`origin/cursor/bos-8-decision-action-2756`), path `supabase/migrations/20260819130000_batch_104_business_os_decision_action.sql`, blob `23e629087de48942a6e80cdcc78cbec444cdcd06` |
| HOSTED LEDGER NAME | `batch_104_business_os_decision_action` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS decision-action schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-8. |

<a id="20260819140000"></a>

### 20260819140000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `f21a2026485463faf1d1e44a0a9b8b711069f47c` (`origin/cursor/bos-9-business-risk-2756`), path `supabase/migrations/20260819140000_batch_105_business_os_business_risk.sql`, blob `842eb3e783c5fa8a772edafca56f31745a13c816` |
| HOSTED LEDGER NAME | `batch_105_business_os_business_risk` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS business-risk schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-9. |

<a id="20260819150000"></a>

### 20260819150000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `ed8629dfff1e24c6c3bb4d44a715df800a43e22a` (`origin/cursor/bos-10-business-context-graph-2756`), path `supabase/migrations/20260819150000_batch_106_business_os_business_context.sql`, blob `efe3f4fb83cbdfbb1fa76c023a622876c66fe9ec` |
| HOSTED LEDGER NAME | `batch_106_business_os_business_context` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS business-context schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-10. |

<a id="20260819160000"></a>

### 20260819160000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `f6d7a84a3382d4055ab1eff6d1bbe97da429426d` (`origin/cursor/bos-11-ai-workforce-2756`), path `supabase/migrations/20260819160000_batch_107_business_os_ai_workforce.sql`, blob `d6d34809267a7ed9800f5ded87aba40efe9d2b79` |
| HOSTED LEDGER NAME | `batch_107_business_os_ai_workforce` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS AI-workforce schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-11. |

<a id="20260819170000"></a>

### 20260819170000

| Field | Value |
| --- | --- |
| ENVIRONMENT | staging |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Exact SQL in trusted sibling-branch history |
| SOURCE | commit `28728d3fedcbcd0fd04a9004daa9fc68809c55e0` (`origin/cursor/bos-12-connectors-hardening-2756`), path `supabase/migrations/20260819170000_batch_108_business_os_connectors_hardening.sql`, blob `12cbca6bcc3871f95e265a50754fa674a1b6daf4` |
| HOSTED LEDGER NAME | `batch_108_business_os_connectors_hardening` |
| SECURITY RELEVANCE | YES |
| CURRENT SCHEMA RELEVANCE | Staging Business OS connectors/hardening schema |
| DISPOSITION | RECOVERED / RECOVERED_FROM_TRUSTED_HISTORY |
| CONFIDENCE | HIGH |
| RATIONALE | Blob-identical recovery from BOS-12. |

## Production unresolved

Searches covered current `supabase/migrations`, reachable Git history (`git log -S`, `git log --all -- <path>`), deleted/renamed SQL, release docs, certification reports, tests, and scripts. Hosted `statements` arrays for both production rows are empty, so the ledger itself does not preserve SQL.

<a id="20260810210000"></a>

### 20260810210000

| Field | Value |
| --- | --- |
| ENVIRONMENT | production |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Historical SQL not recovered. Hosted name only. Current residual function inspected read-only. |
| SOURCE | production ledger name `batch_98_signup_commercial_bootstrap`; `statement_count` 0 |
| KNOWN_OBJECTS | `provision_signup_commercial_defaults(uuid, uuid)` on production (effect, not proven 1021 body) |
| POSSIBLE_OBJECTS | commercial trial bootstrap; EXECUTE grants; `search_path` |
| CURRENTLY_REQUIRED_OBJECTS | none for supported signup (`handle_new_user`) |
| CURRENT_APPLICATION_REFERENCES | none in repository, APIs, or trigger neighbors |
| SECURITY RELEVANCE | YES historically; live untrusted EXECUTE closed by `20261007180000` |
| CURRENT SCHEMA RELEVANCE | Residual function present; EXECUTE postgres/service_role only; `search_path=pg_catalog, public`; post-1D fingerprint `4d6d64fffe4ecc5eaf178d97a3c9925a` |
| HISTORICAL DISPOSITION | BLOCKED / UNRESOLVED_BLOCKED |
| CURRENT_STATE_RECOVERABILITY | NOT_REQUIRED |
| CONFIDENCE | HIGH that SQL is unrecovered; HIGH that current function is quarantined |
| RATIONALE | Do not dump current DDL and call it this migration. REL-1D locked down grants without inventing 1021 SQL. |

<a id="20260810220000"></a>

### 20260810220000

| Field | Value |
| --- | --- |
| ENVIRONMENT | production |
| ORIGINAL STATUS | BLOCKED / UNKNOWN_DRIFT |
| DISCOVERY RESULT | Historical SQL not recovered. Hosted name only. |
| SOURCE | production ledger name `batch_99_document_storage_ai_assistant_uat`; `statement_count` 0 |
| KNOWN_OBJECTS | none proven |
| POSSIBLE_OBJECTS | `tenant-documents` bucket + tenant-scoped storage policies; UAT helpers since removed |
| CURRENTLY_REQUIRED_OBJECTS | none — supported EOS documents use `engineering-documents` via service client |
| CURRENT_APPLICATION_REFERENCES | `apps/web/src/lib/engineering/document-storage.ts` uses `engineering-documents`, not this ledger version |
| SECURITY RELEVANCE | Historical unknown; current `tenant-documents` policies are tenant-scoped via `get_user_tenant_ids()` (ownership by 1022 unproven) |
| CURRENT SCHEMA RELEVANCE | No public assistant tables. Storage policies exist on `tenant-documents` only. |
| HISTORICAL DISPOSITION | BLOCKED / UNRESOLVED_BLOCKED |
| CURRENT_STATE_RECOVERABILITY | INDEPENDENT |
| CURRENT RELEVANCE | OBSOLETE for supported Engineering OS document storage |
| CONFIDENCE | HIGH that SQL is unrecovered; MEDIUM that 1022 is unrelated to current EOS docs |
| RATIONALE | Do not infer that 1022 created `tenant-documents`. Keep historical blocked. Reconstruct documents via the app bucket helper and A14A artifacts bucket. |

## Formal retirement checklist (production pair)

| Criterion | 20260810210000 | 20260810220000 |
| --- | --- | --- |
| 1. Exact SQL cannot reasonably be recovered | YES | YES |
| 2. Hosted ledger confirms historical application | YES | YES |
| 3. Current schema does not depend on replaying missing SQL for supported deploy paths | YES — supported signup is `handle_new_user` | YES — supported docs are `engineering-documents` |
| 4. Later migrations or baseline establish required current state | PARTIAL — lockdown artifact exists; function body not promoted into live migrations | YES for supported EOS docs |
| 5. Disaster recovery does not require the missing SQL as executable | YES for supported path; leftover function uses lockdown, not 1021 replay | YES |
| 6. Dependency graph can model it as historical/non-replayable | YES (BLOCKED, not promoted) | YES (BLOCKED, not promoted) |
| 7. Retirement does not hide unknown security behavior | NO — live DEFINER grant defect would be hidden by retirement | NO — storage-policy ownership still unproven |
| Result | UNRESOLVED_BLOCKED | UNRESOLVED_BLOCKED |

## Disaster recovery / from-scratch

This branch creates a new database from `supabase/migrations/` via the existing Supabase reset/push path. `docs/release/historical-migrations/` is documentation, not a bootstrap path.

**DATABASE_FROM_SCRATCH_REPRODUCIBLE = PARTIAL**

Supported Engineering OS reconstruction uses live `supabase/migrations/` and does **not** require unknown 1021/1022 SQL. Remaining limitations:

1. Isolated clean-database reconstruction was not executed in REL-1B (static verification only).
2. A fresh environment will **not** recreate `provision_signup_commercial_defaults`. That is intended: the function is not on the supported signup path.
3. Production dumps that already contain the residual function should apply `20261007180000` (REL-1D) then `20261007190000` (REL-1E). Clean bootstrap does not create the residual signup function.
4. `tenant-documents` bucket/policies exist on production and are not live migrations; supported EOS documents use `engineering-documents` at runtime.
5. Business OS historical artifacts remain excluded from this product line.

## Guard behavior

- Recovered Business OS versions: classified, not unknown drift; production promotion still fails (`STAGING_ONLY`).
- Unresolved production versions: classified `UNRESOLVED_BLOCKED`; production promotion fails (`BLOCKED`).
- New ledger snapshot ID without SQL, historical artifact, or certified SUPERSEDED / RETIRED / SECURITY_BACKPORT / UNRESOLVED_BLOCKED provenance: `evaluateLedgerOnlyGuard` fails.

Hosted migration ledgers were not edited.
