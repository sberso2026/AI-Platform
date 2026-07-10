# Phase 3 Certification

Phase 3 certification extends Phase 2 gates A–H with installation-specific gates I–L.

## Gates

| Gate | Scope |
|------|--------|
| A | Unit tests, typecheck, production build |
| B | Hosted migration verification (Batch 32) |
| C | Installation backfill verification |
| D | Real-JWT RLS on installation tables |
| E | HTTP installation enforcement |
| F | Browser installation E2E |
| G | Scheduler lifecycle execution |
| H | Cache / invalidation verification |
| I | Workspace provisioning and isolation |
| J | Upgrade, rollback, suspend, resume, uninstall |
| K | Application dependency enforcement |
| L | Reproducible build identity (Git SHA, working tree) |

## Required artifacts

- `artifacts/installation-phase3-certification.json`
- `docs/certification/INSTALLATION_PHASE_3_CERTIFICATION.md`

## Certification harness requirements

- Own production server lifecycle (no unidentified running server)
- Zero skipped required tests
- Record commit SHA, migration checksums, hosted project ref

## Status

**Not yet certified** — Batch 32 migrations and core services implemented; full hosted RLS/HTTP/browser/scheduler certification pending.
