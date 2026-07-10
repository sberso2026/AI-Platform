# Phase 3 Installation Certification

Certification package: `packages/installation-certification/`

## Gates A–L

| Gate | Scope |
|------|-------|
| A | Unit tests, typecheck, production build |
| B | Hosted Batch 32 schema verification |
| C | Legacy installation backfill |
| D | Real-JWT RLS on installation tables |
| E | HTTP enforcement with SSR cookies |
| F | Playwright browser E2E |
| G | Scheduler lifecycle execution |
| H | Cache invalidation / multi-instance |
| I | Workspace provisioning and isolation |
| J | Upgrade, rollback, suspend, resume, uninstall |
| K | Application dependency enforcement |
| L | Reproducible build identity (Git SHA required) |

## Commands

```bash
pnpm installation:provision-fixtures
pnpm installation:certify
pnpm installation:teardown-fixtures
```

## Artifacts

- `packages/installation-certification/artifacts/phase-3-certification.json`
- `packages/installation-certification/artifacts/hosted-schema-verification.json`
- `packages/installation-certification/artifacts/installation-backfill-verification.json`

## Server ownership

The certification harness builds the current commit, starts its own `next start` process, verifies `/api/platform/build-identity`, and refuses stale unidentified servers.

## Environment

Requires hosted Supabase (`wcydlhqiqdwgoaqrlget`), `COMMERCE_SCHEDULER_SECRET`, `COMMERCE_AUTH_SECRET`, and `INSTALLATION_CERTIFICATION=1`.
