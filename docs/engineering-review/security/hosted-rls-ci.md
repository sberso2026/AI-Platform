# Hosted Review / Core RLS CI configuration

Target: **RTB AI Platform Staging** Supabase project `rntonzigxwxcjlcsadip`.

Do **not** reuse:

- EOS certification project `wcydlhqiqdwgoaqrlget`
- production credentials
- unrelated Supabase projects

## GitHub secrets (names only — never commit values)

Create dedicated repository secrets (recommended GitHub Environment name: `review-staging`):

| Secret name | Purpose |
| --- | --- |
| `REVIEW_STAGING_SUPABASE_URL` | Staging API URL |
| `REVIEW_STAGING_SUPABASE_ANON_KEY` | Staging anon key |
| `REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging service role (server tests only) |
| `REVIEW_STAGING_CERT_USER_PASSWORD` | Password for `cert-er-*` fixture users |
| `REVIEW_STAGING_SUPABASE_DB_URL` | Optional Postgres URL to apply additive migrations |

Workflow: `.github/workflows/engineering-review-hosted-rls.yml`

- Sets `ENGINEERING_REVIEW_RLS=1`
- If required secrets are absent, the job **fails** with a configuration error
- A missing-secret failure is **not** RLS PASS
- The job must never print secret values
- Hosted suite includes Review RLS, Core RLS, trusted audit, pilot identity policy, security schema RPC, and logical restore drill

Unit workflow `.github/workflows/engineering-review-unit.yml` keeps `ENGINEERING_REVIEW_RLS=0` so a skipped live suite cannot look like a security pass.

## ERA-7A configuration evidence (no secret values)

- GitHub secrets `REVIEW_STAGING_*` are present (names only).
- Target project: `rntonzigxwxcjlcsadip`. EOS `wcydlhqiqdwgoaqrlget` was not used.
- GitHub Actions run `35507801752` **success**, 28/28 tests.
- Evidence file: `evidence/era-7a-hosted-ci.md`.

