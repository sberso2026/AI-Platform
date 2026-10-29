# EOS 2.17 Production Deployment and Smoke Evidence

## Deployment

`PRODUCTION_REDEPLOYED=NO`

Production remains deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, commit `0c1ec9e06eea59ac089753f3c930f1a599b14648`, environment `production`, Supabase `wcydlhqiqdwgoaqrlget`. Build identity was read from `https://eos-pilot.rtbea.com.au/api/platform/build-identity` before the stop. Dirty is false.

The qualified candidate `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` was not deployed. The staging preview `dpl_GgVBzbU9N2ZnR5fR41fWwdnYDhbC` was not promoted, because that preview was built with the staging Supabase project.

Rollback target `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` was inspected and is Ready.

## Smoke

Pre-enablement smoke, EOS 1 post-migration compatibility, legacy entitlement denial, and EOS 2 route smoke were not run. There was no new Production deployment and no schema change to test.

## Observability snapshot

Captured before the stop, not after a promotion:

| Signal | Observed |
| --- | --- |
| Deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, Ready |
| Database | Ledger 144, maximum `20261027233000` |
| EOS 2 mode | No tenant is `controlled_pilot` |
| Enrollment table | Absent |
| Enrolled workspaces | 0 |
| Active engineering-os installations | 396 |
| Point-in-time recovery | Not enabled |
| Latest completed physical backup | `2097755872` at `2026-10-28T17:07:26.140Z` |
