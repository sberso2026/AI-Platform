# EOS Pilot Gate Closeout — Dependency record

Scanned: 2026-10-01 with `pnpm audit --prod --json`.  
Expired SCA exceptions were **not** auto-renewed. `run-dependency-sca.ts` now applies only exceptions with `review_by >= today`.

## Raw audit

| When | critical | high | moderate | low |
|---|---|---|---|---|
| Start of closeout | 0 | 12 | 4 | 0 |
| After bounded overrides | 0 | 4 | 2 | 0 |

RAW_DEPENDENCY_AUDIT = FAIL (highs remain).

## Fixed in this closeout (overrides)

| Advisory | Package | Before | Action |
|---|---|---|---|
| GHSA-28wg-ghj8-5hjv | nanoid | 3.3.15 via next→postcss | override `>=3.3.18` |
| GHSA-2v37-7h3g-55p8 | nanoid | 3.3.15 | same |
| GHSA-mh99-v99m-4gvg | brace-expansion | 1.1.16 via exceljs→glob | pin `1.1.20` |
| GHSA-rgw5-rvv9-x895 | brace-expansion | 1.1.16 | pin `1.1.20` |
| GHSA-qhr7-859c-m2p7 | brace-expansion | 1.1.16 | pin `1.1.20` |
| GHSA-6j4f-fj2g-mc7p | brace-expansion | 1.1.16 | pin `1.1.20` |
| GHSA-6g55-p6wh-862q | postcss | 8.4.31 via next | override `>=8.5.18` |
| GHSA-r28c-9q8g-f849 | postcss | 8.4.31 | override `>=8.5.18` |

`brace-expansion: ">=1.1.20"` was **not** kept: it resolved to 5.0.7 and the same GHSAs remained.

nanoid is not imported by `@rtb/engineering-os`. Path was Next CSS toolchain (build). Still patched because it appeared in `--prod` audit via Next.

## Remaining highs (4) — reachability

| Advisory | Package | Installed | Path | Profile A classification | Fix | Action taken |
|---|---|---|---|---|---|---|
| GHSA-f88m-g3jw-g9cj | sharp | 0.34.5 | next@15.5.24 → sharp | UNKNOWN — no `next/image` in apps/web src; `/_next/image` still exists in Next. Cannot treat as safe. | >=0.35.0 (breaking vs Next 15.5.24 pin) | not upgraded |
| GHSA-rgj7-g3m4-5g8c | sharp | 0.34.5 | next → sharp | UNKNOWN (same) | >=0.35.4 | not upgraded |
| GHSA-5p2g-fcmc-qvqq | image-size | 1.2.1 | pptxgenjs@4.0.1 | UNKNOWN — EOS PPTX builder uses text slides only (`addText`); parser still present in pptxgenjs. Returned uploads remain disabled. | >=2.0.3 major | not upgraded |
| GHSA-w3rx-r6r6-pgpr | image-size | 1.2.1 | pptxgenjs | UNKNOWN (same) | >=2.0.3 major | not upgraded |

RUNTIME_REACHABLE_HIGH (proven on Workbench/artifact/review path): NONE.  
UNACCEPTED_RUNTIME_HIGH / UNKNOWN: the four rows above.  
NON_RUNTIME_HIGH after fix: postcss/nanoid/brace-expansion no longer in high set.

## Exceptions

ACTIVE_ACCEPTED_HIGH_EXCEPTIONS: NONE.  
EXPIRED_EXCEPTIONS (review_by 2026-09-30, not applied):

- GHSA-f88m-g3jw-g9cj (sharp) — still present
- GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-p9j2-gv94-2wf4 (next) — not in current audit
- GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849 (postcss) — fixed by override
- GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8 (nanoid) — fixed by override

No new human-governed exception was recorded.

## Policy gate

critical = 0.  
Unaccepted highs remain (4), classification UNKNOWN for Profile A runtime.  
DEPENDENCY_POLICY_GATE = BLOCKED.
