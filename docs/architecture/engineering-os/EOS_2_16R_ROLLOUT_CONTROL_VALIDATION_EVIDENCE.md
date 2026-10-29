# EOS 2.16R Rollout Control Validation Evidence

## Runtime

| Item | Value |
| --- | --- |
| Staging deployment | `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC` |
| Status | Ready |
| Environment | Vercel preview |
| Source commit | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Build dirty | false |
| Staging Supabase | `rntonzigxwxcjlcsadip` |
| Prior qualified runtime | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| Production commit | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Production deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |
| Production Supabase | `wcydlhqiqdwgoaqrlget` |

Build identity was read from the new preview and from Production after the deploy. Production was not redeployed. `EOS_2_ROLLOUT` was not set on the preview.

## Staging data

Staging ledger 146, maximum `20261029120000`. Production ledger 144, maximum `20261027233000`. The enrollment table exists on staging and does not exist on Production.

Tenant `eos-qa-001` has three workspaces. One is enrolled: `eos-qa-a`. The enrollment authority role is `release-governance`, the reason is the EOS 2.16R staging qualification cohort, and `enrolled_at` is set. The other two workspaces are not enrolled. Mode was restored to `controlled_pilot` after the off test.

## Enrolled browser validation

Signed-in engineer in `eos-qa-001 / eos-qa-a`:

| # | Check | Result |
| --- | --- | --- |
| 1 | Login | PASS. Session left `/login`. |
| 2 | Workspace | PASS. `eos-qa-001 / eos-qa-a`. |
| 3 | `/engineering` | PASS. `EOS-QA-001` visible. |
| 4 | `/engineering/delivery-lifecycle` | PASS. |
| 5 | `/engineering/process` | PASS. |
| 6 | `/engineering/mechanical` | PASS. |
| 7 | `/engineering/piping` | PASS. |
| 8 | `/engineering/structural` | PASS. |
| 9 | `/engineering/civil` | PASS. |
| 10 | `/engineering/geotechnical` | PASS. |
| 11 | `/engineering/electrical` | PASS. |
| 12 | `/engineering/instrumentation` | PASS. |
| 13 | `/engineering/interface-intelligence` | PASS. |
| 14 | `/engineering/change-impact` | PASS. |
| 15 | `/engineering/design-freeze` | PASS. |
| 16 | `/engineering/deliverables` | PASS. `EOS-QA-001` visible. |
| 17 | `/engineering/integrated-project` | PASS. `EOS-QA-001` visible. |
| 18 | Logout | PASS. |
| 19 | `/engineering/mechanical` after logout | PASS. Landed on `/login`. |

Route count 19. Pass count 19. Fail count 0.

The EOS 1.0 lifecycle page showed the delivery-lifecycle link after the rollout status returned allowed.

## Critical path and authority

The enrolled session executed the bounded P-101 actions. Vendor revision, structural acceptance, electrical acceptance, both materiality assessments, and the revalidation disposition committed. Approval granted was false on every step. Wrong receiver, AI materiality, AI freeze, owner freeze, owner deliverable approval, and owner IFC release were denied. No formula was added.

## Non-enrolled entitled workspace

Engineer in `eos-qa-001 / eos-qa-b` still has the `engineering-os` entitlement.

| Check | Observed |
| --- | --- |
| `/engineering` | Loaded. |
| `/engineering/lifecycle` | Loaded. Delivery link absent. Project id absent. |
| `/engineering/mechanical` | `/access-denied`, reason `eos2_not_enabled`. |
| `/engineering/delivery-lifecycle` | Same denial. |
| `/engineering/integrated-project` | Same denial. |
| `/engineering/design-freeze` | Same denial. |
| `GET /api/engineering/lifecycle` | 200. Not `eos2_not_enabled`. |
| `GET` and `POST /api/engineering/qualification-runtime` | 403 `eos2_not_enabled`. Body did not contain the qualification project id. |
| `POST /api/engineering/mechanical-delivery` | 403 `eos2_not_enabled`. |
| `POST /api/engineering/eos2-enrollment` | 403 `eos2_enrollment_denied`. |
| `GET /api/engineering/ai` | 403 `feature_not_enabled`. No EOS 2 project payload. |

Cross-workspace leak count for these responses is 0.

## Global off and kill switch

`tenants.settings.eos2.mode` was set to `off` for `eos-qa-001` only. The enrolled engineer was then denied `/engineering/mechanical` and `POST /api/engineering/qualification-runtime`. `/engineering` still loaded. `GET /api/engineering/lifecycle` stayed available. The enrollment row remained, and the audit row count increased by the denial. No schema or data rollback was performed.

The mode was then restored to `controlled_pilot`. The same enrolled engineer loaded `/engineering/mechanical`, and the qualification POST passed the rollout gate. The final staging mode is `controlled_pilot`.

The server environment `EOS_2_ROLLOUT=off` forces deny even when the tenant mode is `controlled_pilot`. That branch is covered by the rollout unit test. It was not set on the preview.

## Regression suites

Executed after the runtime commit:

- release-governance: 220 passed
- persistence unit: 37 passed, 1 skipped
- secret scan: 624 files, 0 findings
- engineering-os security, interface, change, freeze, and D1 review: 18 passed
- engineering-review: 166 passed, 1 skipped
- platform-core: 162 passed
- EOS 2 decision tests: 4 passed
- `pnpm audit --prod`: one known moderate `GHSA-w5hq-g745-h8pq` through `exceljs` and `uuid`. No new blocking advisory.

## Migration

`20261029120000` SHA-256 `9896c49a648ffe05892caccb733b82b342006bde618eb73235a058a3a4a5b21`. Isolated rehearsal created the table with RLS enabled, three policies, and zero rows. Staging apply did not enroll any workspace by itself. The qualification enrollment was a separate explicit write. Production was not migrated.

Pending Production versions are the previous thirteen EOS 2.x files plus this file. Count 14. Destructive count 0. Version `20261028240000` remains a historical key and was not renamed.
