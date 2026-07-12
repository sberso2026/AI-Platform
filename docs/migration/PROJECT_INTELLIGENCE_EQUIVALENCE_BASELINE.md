# Project Intelligence Equivalence Baseline

**Phase:** 6C-1  
**Frozen tag:** `project-intelligence-integration-baseline-1`  
**SHA:** `ab1f44276715888123d9f669464987e6f7c39b6c`  
**Machine artifact:** `artifacts/project-intelligence-baseline-equivalence.json`

---

## Toolchain

| Item | Value |
|------|--------|
| Target Node | 22 (AI Platform CI) |
| Observed Node (worktree) | v24.16.0 — deviation recorded |
| pnpm | 9.15.0 |
| Install | `--ignore-scripts` then approved rebuilds |

---

## Results (clean worktree at frozen tag)

| Check | Result |
|-------|--------|
| Typecheck | **PASS** after compatibility patch (`@supabase/storage-js`) |
| Vitest test **files** | 335 |
| Vitest test **cases** | **1892 passed**, 0 failed, 0 skipped |
| Production build | **PASS** (Next.js 15.5.20) |
| Migrations | 42 SQL files with SHA-256 checksums in artifact |

Do **not** confuse file count (335) with case count (1892).

---

## Approved build scripts

Only `esbuild` and `sharp` postinstall/install scripts were approved. See `PROJECT_INTELLIGENCE_BUILD_SCRIPT_REVIEW.md`.

---

## Compatibility patches (not in frozen tag)

1. `@supabase/storage-js` added in worktree/CI so `storageReadiness` typecheck resolves.
2. CI extracts `vendor/project-intelligence-baseline/ab1f442-source.tar.gz` (git archive of the frozen tag) because the standalone repository is private to the Actions default token. Optional live clone is available when `PI_BASELINE_REPO_TOKEN` is configured.

---

## Inventory (counts)

- Pages: 49  
- API routes: 85  
- AI provider paths: legacy OpenAI/Thor (listed in artifact)

---

## Equivalence status

This artifact is the **baseline reference**. Platform ports are **not** marked equivalent until capability-specific tests pass (see catalogue).
