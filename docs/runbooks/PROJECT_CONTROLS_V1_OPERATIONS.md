# Project Controls V1.0 — Operations

## Deployment

- Module version **1.0.0** from `packages/project-controls/src/version.ts`
- Migrations **61–73** applied in order; **no batch_74**
- Repository adapter: `postgres` in production (`PROJECT_CONTROLS_REPOSITORY_ADAPTER`)

## Daily checks

1. Health endpoint `/api/engineering/project-controls/health` returns `productionProjectControlsReady: true`
2. `moduleRegistryDriftDetected === false` in manifest feature flags
3. Forbidden locks remain false (CPM, EV, financial posting, autonomous decision)

## Escalation

- P1: tenant isolation breach or forbidden engine flag opened
- P2: persistence outage or registry drift detected
- P3: documentation/manifest mismatch

See incident, recovery and rollback runbooks in this series.
