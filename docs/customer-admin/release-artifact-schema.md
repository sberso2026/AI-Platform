# Customer Administration — Release Artifact Schema

Schema version: `customer-admin-certification/v1`

## Output location

Generated artifacts are written to ignored paths only:

```
packages/customer-administration-certification/artifacts/generated/customer-administration/
├── phase-4-certification.json
├── phase-5-release-check.json
└── phase4-cert-fixtures.json
```

Playwright output:

```
packages/customer-administration-certification/test-results/customer-administration/
```

## Required fields

| Field | Description |
|-------|-------------|
| `schemaVersion` | `customer-admin-certification/v1` |
| `commitSha` | Git SHA under test |
| `branch` | Git branch |
| `buildTimestamp` | ISO-8601 UTC |
| `supabaseProjectRef` | Hosted project ref |
| `certificationTarget` | `hosted_staging` for release |
| `verdict` | `PASS` or `FAIL` |
| `gateSummary` | Aggregate gate counts |
| `migrationChecksums` | SQL migration SHA256 prefixes |
| `environmentSafety` | Safety scan report |

## Release eligibility fields

| Field | Description |
|-------|-------------|
| `releaseEligible` | `true` only when all release criteria met |
| `releaseEligibilityReasons` | Human-readable blockers |
| `workingTreeClean` | Must be `true` for release |
| `productionCertificationBlocked` | Expected `true` for staging release |
| `requiredGateCount` | Required gates executed |
| `passedGateCount` | Gates passed |
| `failedGateCount` | Gates failed |
| `skippedGateCount` | Must be `0` |
| `unexpectedServerErrorCount` | Must be `0` |
| `diagnosticDirtyOverride` | `true` when `CUSTOMER_ADMIN_ALLOW_DIRTY=1` used |

## CI metadata

Optional but populated in CI:

- `ciRunId`
- `ciWorkflow`
- `ciRunner`
- `repositoryUrl`
- `nodeVersion`
- `pnpmVersion`
- `runnerOs`
- `buildIdentityCommitSha`

## Validation

```bash
pnpm customer-admin:verify-release-artifact \
  --artifact packages/customer-administration-certification/artifacts/generated/customer-administration/phase-4-certification.json \
  --commit-sha "$(git rev-parse HEAD)" \
  --project-ref wcydlhqiqdwgoaqrlget \
  --target hosted_staging
```

## Release eligibility rules

`releaseEligible=true` requires:

1. Clean working tree (no unignored dirty paths)
2. `commitSha` matches tested build and build-identity endpoint
3. `certificationTarget=hosted_staging`
4. All required gates passed, zero skips
5. Zero unexpected 5xx captures
6. Migration checksums recorded
7. Production destructive certification remained blocked
8. `verdict=PASS`

Dirty-tree diagnostic runs set `releaseEligible=false` even when tests pass.
