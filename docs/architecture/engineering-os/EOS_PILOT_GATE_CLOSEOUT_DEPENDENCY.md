# EOS Pilot Gate Closeout — Dependency record

Scanned: 2026-10-01 continuation with `pnpm audit --prod --json`.  
Expired SCA exceptions were **not** auto-renewed. `run-dependency-sca.ts` applies only exceptions with `review_by >= today`.

## Raw audit

| When | critical | high | moderate | low |
|---|---|---|---|---|
| Start of original closeout | 0 | 12 | 4 | 0 |
| After original closeout overrides | 0 | 4 | 2 | 0 |
| After continuation overrides | 0 | 0 | 1 | 0 |

RAW_DEPENDENCY_AUDIT = FAIL (pnpm `audit --prod` still exits non-zero because one moderate remains).  
SCA script `pass` = true (`unresolvedCritical` empty, `unresolvedHigh` empty).

## Continuation bounded overrides

| Advisory | Package | Before | Action |
|---|---|---|---|
| GHSA-f88m-g3jw-g9cj | sharp | 0.34.5 via next@15.5.24 | override `>=0.35.4` → 0.35.5 |
| GHSA-rgj7-g3m4-5g8c | sharp | 0.34.5 via next | same |
| GHSA-5p2g-fcmc-qvqq | image-size | 1.2.1 via pptxgenjs@4.0.1 | override `>=2.0.3` → 2.0.4 |
| GHSA-w3rx-r6r6-pgpr | image-size | 1.2.1 via pptxgenjs | same |
| GHSA-q2hr-2g5m-vwhr | brace-expansion | 1.1.20 (moderate after original pin) | pin `1.1.21` |

Original closeout overrides retained: `next@15.5.24`, `@xmldom/xmldom ^0.8.15`, `nanoid >=3.3.18`, `postcss >=8.5.18`.

`brace-expansion: ">=1.1.20"` remains rejected: it resolved to 5.0.7 and reintroduced highs. The pin is exact `1.1.21`.

## Sharp reachability

Path: `apps/web` → `next@15.5.24` → optional `sharp@0.35.5`.  
Route: Next image optimizer `GET /_next/image` (middleware-excluded). No `next/image` imports in `apps/web/src`.  
Input: `url`, `w`, `q` query parameters can be caller-controlled if the optimizer is invoked.  
Continuation classification: previously UNKNOWN / potentially runtime. Advisory floor `>=0.35.4` is now installed. **FIXED.**  
Profile A Workbench/artifact/review routes do not import sharp directly.

## image-size / pptxgenjs reachability

Path: `@rtb/engineering-os` → `pptxgenjs@4.0.1` → `image-size@2.0.4`.  
EOS PPTX builder (`artifact-automation/pptx.ts`) uses `addText` only (no `addImage`). Parser is still present in pptxgenjs.  
`eos-a11b-foundation` PPTX generation passed after the 2.0.4 override.  
Returned uploads remain disabled until hosted malware PASS, so user-controlled images do not reach this parser on the returned-artifact path.  
Continuation classification: previously UNKNOWN. Advisory floor `>=2.0.3` is now installed. **FIXED.**

## Remaining finding (moderate, not a high)

| Advisory | Package | Installed | Path | Classification | Action |
|---|---|---|---|---|---|
| GHSA-w5hq-g745-h8pq | uuid | 8.3.2 | exceljs@4.4.0 (EOS XLSX generation) | RUNTIME_LOADED_MODERATE. Advisory is v3/v5/v6 when `buf` is provided. Patch is uuid >=11.1.1 (major). Not applied: would be a major bump through exceljs, not a smallest-safe high fix. | none; not a policy-gate high |

RUNTIME_REACHABLE_HIGH: NONE.  
UNKNOWN_HIGH: NONE.  
UNACCEPTED_RUNTIME_HIGH: NONE.

## Exceptions

ACTIVE_ACCEPTED_HIGH_EXCEPTIONS: NONE.  
EXPIRED_EXCEPTIONS (`review_by` 2026-09-30, not applied): eight rows in `sca-exceptions.json` (sharp/next/postcss/nanoid IDs). None renewed. None fabricated.

## Policy gate

critical = 0.  
unaccepted runtime-reachable high = 0.  
DEPENDENCY_POLICY_GATE = PASS.
