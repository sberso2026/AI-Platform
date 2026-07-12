# GitHub Hosted Certification Run Verification

## Source identity (AI Platform)

| Field | Value |
|-------|--------|
| Branch | `master` |
| HEAD at Phase 6C-1 start | `b421e2e2b9fed92b93ad21b49d19e171a90658ab` |
| Phase 6B certified runtime SHA | `25e5722b6f13b1b5cc717b3bba78073d689d7d9c` |
| Post-cert evidence-only commit | `b421e2e` — docs + `.gitignore` only (no runtime/workflow/migration/test/package code) |
| Classification | Evidence commit is **not** certified runtime; any runtime change requires new certification |

## GitHub Hosted Certification Run Verification

### Phase 5 Baseline

| Field | Value |
|-------|--------|
| Tag | `customer-admin-rc-1` → `f781fa089670e2842327db1a6797f692f593afc1` |
| Successful run | **29178367138** |
| Jobs | preflight/validate/hosted-certification/release-evidence PASS |
| Artifact SHA match | yes |
| `releaseEligible` | true |
| Required skips | 0 |
| Unexpected 5xx | 0 |
| Production blocked | true |

### Phase 6B Baseline

| Field | Value |
|-------|--------|
| Commit | `25e5722b6f13b1b5cc717b3bba78073d689d7d9c` |
| Run | **29181715110** |
| Gates | 14/14 |
| Skips / 5xx | 0 / 0 |
| Artifact SHA match | yes |
| Hosted project | `wcydlhqiqdwgoaqrlget` |

### Phase 6C-1 Run

| Field | Value |
|-------|--------|
| Workflow | Project Intelligence Phase 6C-1 Certification |
| Commit | *fill after successful CI* |
| Run ID | *pending* |
| Jobs | preflight · validate · baseline-equivalence · hosted-certification · release-evidence |
| Positive entitlement proven | required |
| Baseline cases | 1892 passed at frozen tag |
| Required skips | must be 0 |
| Unexpected 5xx | must be 0 |

### Historical classification notes

Prior Phase 6B failures remain historical/superseded. Phase 5 primary evidence remains run **29178367138**. Do not use screenshots as evidence.
