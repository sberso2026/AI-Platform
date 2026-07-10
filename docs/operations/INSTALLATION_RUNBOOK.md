# Installation Runbook

## Provision Engineering OS

1. Confirm active subscription and product licence
2. `POST /api/platform/installations` with `productSlug: engineering-os`
3. Monitor workflow steps via `GET .../events`
4. Verify `GET .../health` returns healthy

## Install application shell

1. Confirm Engineering OS installation is active
2. `POST /api/platform/app-installations/request` with `applicationKey: project_intelligence`
3. Verify navigation activation

## Suspend on subscription lapse

Scheduler job `suspendInstallationsOnSubscriptionSuspension` runs via `POST /api/platform/commerce/jobs/run`.

## Certification fixtures

Prefix: `cert-install-*` — excluded from legacy backfill scope.
