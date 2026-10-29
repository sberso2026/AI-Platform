# EOS 2.17R Production Pilot Eligibility Remediation

## Decision

`VERDICT=PASS_WITH_LIMITATIONS`

`PR_003_RESOLVED=YES`

`PR_002_RESOLVED=NO`

`PRODUCTION_MIGRATION_APPLIED=NO`

`PRODUCTION_REDEPLOYED=NO`

`EOS_2_WORKSPACE_ENROLLED=NO`

No Production row was inserted or updated. The existing controlled pilot already has the canonical non-billing grant.

## Entitlement model

`engineering-os` access is decided by `EntitlementService.check`. An active allow row in `commercial_entitlement_overrides` returns `administrative_override` before any subscription, licence, installation, or seat is consulted. A normal customer path is different: an access-granting subscription, an active product licence, an access-granting installation, and a seat when the licence is not a feature licence.

Production catalog plans for `engineering-os` are `enterprise` (`seat`), `trial` (`free`, 14 days), and `rtb_internal_full_suite` (`seat`, named for UAT). Active installations are 396. Of those, 312 use an active enterprise subscription, 69 use a free trial, 1 uses the internal UAT plan on a different tenant, and 13 have an active installation without a joined plan. None of those rows belong to `eos-controlled-pilot`.

`ENTITLEMENT_MECHANISM_CLASSIFICATION=EXISTING_INTERNAL_PILOT_GRANT`

The controlled pilot tenant already has one unrevoked allow override. Its type is `access`. It has no application key, feature key, product, user, or workspace id. Its reason is `EOS 1.0.0 controlled pilot workspace access`. It was created `2026-10-28T01:32:36Z`, before the verified logical backup. The tenant has one workspace, so the tenant-scoped grant reaches only `5c85d773-3b79-43b2-b138-c6251f566768`.

A new subscription, licence, invoice, or installation was not created. The enterprise and internal plans are seat-billed. Marking one active would invent a paid subscription. The evaluator does not read `product_id` on an override, so a second override could not be made product-only without an application change. The application runtime was not changed.

## Pre-mutation fingerprint

| Item | Value |
| --- | --- |
| Tenant | `eos-controlled-pilot` |
| Tenant status | active |
| Workspace | `Default Workspace` |
| Workspace ID | `5c85d773-3b79-43b2-b138-c6251f566768` |
| Workspace status | active |
| Memberships | 1 |
| Active `pilot-engineer` memberships | 1 |
| Installations | 0 |
| Subscriptions | 0 |
| Licences | 0 |
| Allow override | 1, unrevoked |
| EOS 2 enrollment table | absent |
| `settings.eos2.mode` | absent |
| Workspaces in the tenant | 1 |
| Cross-tenant role memberships | 0 |
| Engineering projects on the workspace | 1 |

The post-check fingerprint is the same. `ENTITLEMENT_MUTATION_SCOPE=EXISTING_CONTROLLED_PILOT_ONLY` with zero writes.

## EOS 1 and EOS 2

The EOS 1 engineering layout calls `requireProductEntitlement` for `engineering-os`. That check matches the existing allow override, so EOS 1 access remains available to the active pilot-engineer membership. The one engineering project was not read in detail and was not modified.

EOS 2 stays off. `decideEos2Access` denies when the mode is not exactly `controlled_pilot` or when enrollment is not boolean true, including when `productEntitled` is true. The Production mode is absent, which normalizes to off. The enrollment table is absent, so the server reader treats the enrollment lookup as indeterminate and denies. The deployed Production commit `0c1ec9e06eea59ac089753f3c930f1a599b14648` contains no EOS 2 route. The candidate runtime was not deployed. There is no `"use server"` module under `apps/web/src`. EOS 2 API routes, including qualification runtime, use `withEos2Api`, which denies before the handler. The pilot-engineer role cannot call the enrollment API.

`LEGACY_ENTITLEMENT_AUTO_GRANTS_EOS_2=NO`

## Audit

| Item | Value |
| --- | --- |
| Actor | EOS 2.17R eligibility inspection |
| Authority | Existing override reason. This is not a Production release signature. |
| Target tenant | `eos-controlled-pilot` |
| Target workspace | `5c85d773-3b79-43b2-b138-c6251f566768` |
| Mechanism | `EXISTING_INTERNAL_PILOT_GRANT` |
| Product | `engineering-os` |
| Override created | `2026-10-28T01:32:36Z` |
| Inspection | `2026-10-29` |
| Reason | Prepare existing controlled EOS 1 Production pilot workspace for future controlled EOS 2 pilot eligibility. EOS 2 remains disabled. |
| Prior state | Allow override present. No installation, subscription, or licence. |
| New state | Unchanged. |

## Backup and migrations

The logical backup `392be8e01ce0adb4cca3aeff3c681c4c4833020dab0aeeb1547c7de913e6f1a8` completed `2026-10-29T01:56:35.075Z`, after the override. No entitlement metadata changed, so that backup still represents the pre-migration Production state. `FINAL_EXECUTION_BACKUP_REFRESH_REQUIRED=NO` for this phase. A later Production change still requires a fresh checkpoint.

Production ledger remains 144, maximum `20261027233000`. The fourteen-file promotion manifest was not applied.

## Limitation

The release signatory is still not named. A later human designation must give a full name, a software release role, and an authority basis limited to `EOS 2.0 controlled Production pilot software promotion`.
