# Customer Administration — Emergency Release Process

## Principle

Emergency release **does not** bypass artifact identity requirements. Every deployment must reference a commit SHA with a verifiable certification artifact.

## Allowed expedited steps

1. Hotfix commit on release branch
2. CI `customer-admin-release-check` on exact commit
3. Protected environment approval with documented incident record
4. Tag `customer-admin-v*` only after `releaseEligible=true`

## Not allowed

- Deploying without artifact
- Tagging a SHA different from artifact `commitSha`
- Using `CUSTOMER_ADMIN_ALLOW_DIRTY=1` for production release evidence
- Running destructive certification against production Supabase
- Skipping required gates because secrets are missing

## Minimum emergency evidence

- CI run URL and artifact upload
- `pnpm customer-admin:verify-release-artifact` output
- Incident ticket with correlation IDs from failed production requests
- Rollback target SHA from last known-good artifact

## Rollback decision

Use last artifact with `releaseEligible=true` and `verdict=PASS`. Redeploy that commit/build; do not forward-fix without new certification.

## Secret rotation during incident

If secrets are rotated:

1. Update GitHub Actions secrets
2. Re-run full release-check
3. Generate new artifact on unchanged code if only secrets changed

## Limitations

Emergency process cannot override production Supabase guard without explicit `ALLOW_PRODUCTION_CERTIFICATION=true` in a protected workflow and approved change record.
