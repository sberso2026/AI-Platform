# Project Intelligence Build Script Review

**Baseline:** `project-intelligence-integration-baseline-1` (`ab1f44276715888123d9f669464987e6f7c39b6c`)  
**Worktree:** clean checkout at frozen tag  
**pnpm:** 9.15.0 (aligned with AI Platform CI)  
**Node (local run):** v24.16.0 — CI/target Node 22; deviation recorded  
**Policy:** do not approve scripts blindly; do not disable pnpm protections globally

---

## Mechanism used

1. `pnpm install --ignore-scripts` (safe first pass)  
2. Explicit `pnpm rebuild esbuild sharp` for required native postinstalls only  
3. Local worktree `.npmrc` listing `onlyBuiltDependencies` for esbuild/sharp (not committed to the frozen tag)

---

## Dependency build-script inventory

| Package | Version(s) observed | Requested script | Purpose | Supply-chain risk | Required for tests/build | Approval | Evidence |
|---------|---------------------|------------------|---------|-------------------|--------------------------|----------|----------|
| `esbuild` | 0.21.5, 0.28.1 | `postinstall` → `node install.js` | Download platform binary for bundling/Vitest | Medium (downloads binary) | **Yes** — Vitest/Next tooling | **Approved** | Rebuild completed; tests/build need binary |
| `sharp` | 0.34.5 | `install` → `node install/check.js` | Native image processing for Next.js | Medium (native binary) | **Yes** — Next production build | **Approved** | Rebuild completed |
| Other deps | — | none executed | — | — | — | **Not approved / not run** | Install used `--ignore-scripts` |

---

## Decisions

- Approve **only** `esbuild` and `sharp` postinstall/install scripts.  
- Do **not** approve unknown or optional lifecycle scripts wholesale.  
- Do **not** set `dangerouslyAllowAllBuilds` or disable script blocking globally.

---

## Compatibility patch (not part of frozen tag)

| Patch | Reason | Status |
|-------|--------|--------|
| Add `@supabase/storage-js` as devDependency | Frozen lockfile omitted direct types for `@supabase/storage-js` import used by `lib/platform/storageReadiness.ts` | Applied in worktree only; typecheck then passes |

Frozen tag itself is unchanged.
