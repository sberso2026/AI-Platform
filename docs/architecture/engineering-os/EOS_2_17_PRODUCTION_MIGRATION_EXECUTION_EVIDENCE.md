# EOS 2.17 Production Migration Execution Evidence

## Result

`PRODUCTION_MIGRATION_EXECUTION=APPLIED`

`MIGRATIONS_APPLIED_COUNT=14`

`SYNTHETIC_DATA_PRODUCTION_TRANSFER=NO`

Production ledger before execution: 144, maximum `20261027233000`. Production ledger after execution: 158, maximum `20261029120000`. The fourteen approved versions are present once. Staging already had the same fourteen versions. File hashes matched the manifest. No `DROP TABLE` or `TRUNCATE` is in those files. Version `20261028240000` was not renamed.

## Order applied

`20261028120000`, `20261028140000`, `20261028160000`, `20261028180000`, `20261028200000`, `20261028220000`, `20261028240000`, `20261029000000`, `20261029020000`, `20261029040000`, `20261029060000`, `20261029080000`, `20261029100000`, `20261029120000`.

Each file was applied, then its version and name were inserted into `supabase_migrations.schema_migrations`. Statement bodies were not stored. The enrollment table was created with zero rows.
