# GitHub Hosted Certification Run Verification

## GitHub Hosted Certification Run Verification

### Phase 5 Baseline

| Field | Value |
|-------|--------|
| Tag | `customer-admin-rc-1` (annotated; peeled commit below) |
| Commit | `f781fa089670e2842327db1a6797f692f593afc1` |
| Repository | `sberso2026/AI-Platform` |
| Workflow | Customer Admin Release Check |
| Successful run ID | **29178367138** |
| Head branch | `master` |
| Trigger | `push` |
| Preflight | PASS |
| Validate | PASS |
| Hosted-certification | PASS |
| Release-evidence | PASS |
| Release-approval | skipped (expected; not required for RC evidence) |
| Artifact name | `customer-admin-certification-29178367138` |
| Artifact `commitSha` | `f781fa089670e2842327db1a6797f692f593afc1` |
| `buildIdentityCommitSha` | `f781fa089670e2842327db1a6797f692f593afc1` |
| `releaseEligible` | `true` |
| Production certification blocked | `true` |
| Required skips | `0` |
| Unexpected 5xx | `0` |
| Playwright | 25/25 (flows) + a11y + responsive suites green in artifact |

Also successful on same SHA (branch `customer-admin-rc-1`): run **29178566908** — corroborating; primary evidence uses **29178367138**.

Verification commands:

```bash
git fetch origin --tags
git rev-parse 'customer-admin-rc-1^{}'
git rev-parse f781fa089670e2842327db1a6797f692f593afc1
# Expected equality of peeled tag and commit.
```

### Phase 6B Run

| Field | Value |
|-------|--------|
| Workflow | Project Intelligence Phase 6B Certification |
| Commit | `25e5722b6f13b1b5cc717b3bba78073d689d7d9c` |
| Run ID | **29181715110** |
| Job results | preflight PASS · validate PASS · hosted-certification PASS · release-evidence PASS |
| Gates A–N | 14/14 passed · 0 skipped |
| Browser tests | Gate K PASS (Playwright suite) |
| Required skips | `0` |
| Unexpected 5xx | `0` |
| Artifact commit match | CI SHA = artifact `commitSha` = `buildIdentityCommitSha` = `25e5722…` |
| `releaseEligible` | `true` |
| Production certification blocked | `true` |

Historical Phase 6B attempts on earlier SHAs (not current evidence):

| Run ID | SHA | Classification | Reason |
|--------|-----|----------------|--------|
| 29180879648 | `1ecae01…` | historical failure | Invalid workflow YAML |
| 29180898810 | `7b9f96f…` | historical failure | Validate hosted tests without secrets |
| 29181037224 | `823219b…` | historical failure | Next.js `.js` import resolution |
| 29181238945 | `7f72bde…` | historical failure | Gate C anon 200 + Playwright skipIf |
| 29181455364 | `b5dfe1f…` | historical failure | A11y main/nav on login page |
| 29181715110 | `25e5722…` | **current successful run** | — |

### Historical Runs (Customer Admin)

| Run ID | SHA | Classification | Reason not used as current Phase 5 evidence |
|--------|-----|----------------|-----------------------------------------------|
| 29179322580 | `c5b17ba…` | irrelevant workflow success (Phase 6A docs) | Different SHA; not Phase 5 RC |
| 29178566908 | `f781fa0…` | current successful run (corroborating) | Same SHA as primary; OK as secondary |
| 29178367138 | `f781fa0…` | **current successful run (primary Phase 5)** | — |
| 29178131639 | `48fbbed…` | historical failure | Superseded SHA |
| 29177573112 | `de2dda1…` | cancelled by concurrency | Not success |
| 29177057176 | `21000e0…` | cancelled by concurrency | Not success |
| 29175877867 | `21000e0…` | cancelled by concurrency | Not success |
| 29175840394 | `6cee9e0…` | cancelled by concurrency | Not success |
| 29175752816 | `55c0f61…` | cancelled by concurrency | Not success |
| 29175707733 | `fe86de4…` | cancelled by concurrency | Not success |
| 29163444765 | `7d5527f…` | historical failure | Superseded |
| 29163291011 | `7d5527f…` | cancelled by concurrency | Not success |
| 29163113808 | `2632a58…` | historical failure | Superseded |
| 29162882392 | `2632a58…` | historical failure | Superseded |
| 29162739650 | `2632a58…` | historical failure | Superseded |

Do not use aggregate screenshots or failed historical runs as current certification evidence.

### Artifact Commit Match Rule

For any Phase 6B certifying run:

`github.sha` = artifact `commitSha` = `buildIdentityCommitSha` = expected Phase 6B commit.

Mismatch → FAIL.
