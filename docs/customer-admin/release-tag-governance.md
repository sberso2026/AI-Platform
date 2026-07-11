# Customer Administration — Release Tag Governance

## Rule

A production release tag may only reference a commit with a **releaseEligible** certification artifact whose `commitSha` equals the tagged commit.

## Required flow

```
Committed Phase 5 SHA
  → clean CI checkout
  → pnpm customer-admin:release-check
  → releaseEligible artifact
  → artifact SHA equals commit SHA
  → protected approval (customer-admin-production environment)
  → release tag (customer-admin-v*)
  → deployment
```

## Tag patterns

| Pattern | Purpose |
|---------|---------|
| `customer-admin-rc-*` | Release candidate — runs full CI, no production approval |
| `customer-admin-v*` | Production release — triggers protected approval job |

## Verification before tag

```bash
git status --porcelain   # must be empty
pnpm customer-admin:release-check
pnpm customer-admin:verify-release-artifact \
  --artifact packages/customer-administration-certification/artifacts/generated/customer-administration/phase-4-certification.json \
  --commit-sha "$(git rev-parse HEAD)" \
  --project-ref wcydlhqiqdwgoaqrlget \
  --target hosted_staging
```

## Fail conditions

Tag creation must be blocked when:

- Artifact `commitSha` ≠ tag target SHA
- `releaseEligible=false`
- `workingTreeClean=false`
- Any required gate failed or skipped
- `unexpectedServerErrorCount > 0`
- Certification target is not `hosted_staging` (for standard release)

## CI enforcement

Workflow: `.github/workflows/customer-admin-release-check.yml`

- `hosted-certification` job produces and verifies artifact
- `release-approval` job runs only on `customer-admin-v*` tags with protected environment

## Emergency releases

Emergency releases must still attach an immutable artifact. They may not silently bypass SHA or eligibility checks. See [emergency-release-process.md](./emergency-release-process.md).
