# Customer Administration — CI Release Check

Workflow file: `.github/workflows/customer-admin-release-check.yml`

## Triggers

- `workflow_dispatch`
- Push to `master`, `main`, `release/**`
- Tags: `customer-admin-rc-*`, `customer-admin-v*`

## Jobs

| Job | Purpose |
|-----|---------|
| `validate` | typecheck, unit/regression tests, production build |
| `hosted-certification` | full `pnpm customer-admin:release-check` + artifact verification |
| `release-evidence` | upload artifacts + GitHub summary |
| `release-approval` | protected approval for `customer-admin-v*` tags |

## Command

```bash
pnpm customer-admin:release-check
```

Verify artifact:

```bash
pnpm customer-admin:verify-release-artifact \
  --artifact packages/customer-administration-certification/artifacts/generated/customer-administration/phase-4-certification.json \
  --commit-sha "${GITHUB_SHA}" \
  --project-ref wcydlhqiqdwgoaqrlget \
  --target hosted_staging
```

## Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `CERT_USER_PASSWORD` | Certification admin user |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side fixtures only |
| `COMMERCE_AUTH_SECRET` | Commerce auth |
| `COMMERCE_SCHEDULER_SECRET` | Scheduler endpoints |

## Required environment variables (workflow)

```yaml
CUSTOMER_ADMIN_CERTIFICATION_TARGET: hosted_staging
ALLOW_PRODUCTION_CERTIFICATION: "false"
CUSTOMER_ADMIN_RELEASE_CHECK: "1"
```

Do **not** set `CUSTOMER_ADMIN_ALLOW_DIRTY=1` in CI release jobs.

## Artifact output paths

- `packages/customer-administration-certification/artifacts/generated/customer-administration/phase-4-certification.json`
- `packages/customer-administration-certification/artifacts/generated/customer-administration/phase-5-release-check.json`
- Playwright: `packages/customer-administration-certification/test-results/customer-administration/`

## Failure conditions

- Missing secrets
- Skipped required gates
- `releaseEligible=false`
- `workingTreeClean=false`
- SHA mismatch vs `github.sha`
- Service role in client bundle or `NEXT_PUBLIC_*`
- Production target without explicit approval

## Protected environment

Create GitHub environment `customer-admin-production` for `release-approval` job on production tags.

## Related docs

- [production-release-runbook.md](./production-release-runbook.md)
- [release-artifact-schema.md](./release-artifact-schema.md)
- [release-tag-governance.md](./release-tag-governance.md)
