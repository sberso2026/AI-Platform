# Historical migrations (not executable)

These files are exact recoveries of Business OS SQL from trusted Git history on
sibling `origin/cursor/bos-*` branches. They are **not** live Engineering OS
migrations.

Do **not**:

- copy them into `supabase/migrations/`
- apply them with `supabase db push`
- apply them to production `wcydlhqiqdwgoaqrlget`
- treat recovery as production authorization

Checksums in `docs/release/migration-manifest.json` are Git blob SHAs of the
unmodified historical files. SQL bodies were not rewritten.

See `docs/release/RTB_MIGRATION_PROVENANCE_REGISTER.md`.
