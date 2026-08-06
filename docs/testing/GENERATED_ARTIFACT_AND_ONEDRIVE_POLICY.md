# Generated Artifact and OneDrive Policy

**Phase:** 8I.1 · **Monorepo root under OneDrive**

## Generated / temporary directories

| Path | Policy |
|------|--------|
| `node_modules/`, `.pnpm-store/` | gitignored; never authoritative |
| `.next/`, `out/`, `dist/`, `.turbo/`, `.vercel/` | gitignored; build/deploy churn |
| `coverage/`, `test-results/`, `playwright-report/` | gitignored |
| `.tmp-cert-artifacts/`, `.tmp-ci-artifacts/`, `.tmp-pi-baseline/`, `.tmp-pi-*/` | gitignored; run-scoped |
| `packages/*-certification/artifacts/` | gitignored; copy governed evidence before cleanup |
| `tmp-cert-*` (local scratch) | must not be committed; not authoritative |

## Rules

1. Generated directories are gitignored.
2. Temporary directories are deployment-excluded.
3. Production code must not import from them.
4. Secrets must not be stored in them.
5. Cleanup is deterministic; failed cleanup must be visible in CI.
6. Governed release artifacts are copied/uploaded before cleanup.
7. No temporary directory is authoritative.
8. CI and local artifacts must not overwrite each other (run-scoped paths).

## OneDrive safety

Documented risks: symlink/readlink quirks, file locking, partial sync,
placeholder files, generated-dir churn.

Controls: prefer atomic writes; keep lockfiles committed; exclude
`node_modules` / `.next` / `.turbo` from sync where possible; verify
certification artifact checksums after download.

**Repository relocation:** **recommended later** (not required for 8I.1; no
proven reliability failure blocking certification). Do not move the repo in
this phase.
