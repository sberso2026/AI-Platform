# ERA-7A residual HIGH dependency disposition pack

**Audience:** Authorized human decision-maker for the controlled Engineering Review AI pilot.  
**AI recommendation only. AI must not mark these risks ACCEPTED.**  
**Scope of recorded acceptance:** controlled Engineering Review AI pilot only — not enterprise production.  
**Date prepared:** 2026-09-20  
**Expiry / review date:** 2026-10-20  

Production audit after `next@15.5.24`: **critical 0 / high 6 / moderate 2**.  
Evidence: `docs/engineering-review/security/evidence/era-7-pnpm-audit.json`.

Authorized human decision (not AI):

```
accepted_by: Silvestre Berso
accepted_at: 2026-09-20T20:24+08:00
scope: controlled Engineering Review AI pilot only
expiry/review_date: 2026-10-20
rationale: Reviewed ERA-7A disposition and reachability. No unresolved CRITICAL production dependency remains. Documented HIGH advisories are not assessed as practically exploitable through the bounded controlled-pilot Engineering Review path, subject to ERA-7A mitigations. Continue monitoring and upgrade when a compatible remediation is available.
```

Does not authorize enterprise production, removal of monitoring, expansion of affected paths, live LLM, or ignoring future advisories. See `evidence/era-7a-human-dependency-acceptance.md`.

---

## 1. sharp@0.34.5 (GHSA-f88m-g3jw-g9cj)

| Field | Evidence |
| --- | --- |
| Advisory | GHSA-f88m-g3jw-g9cj — libvips inherited vulns (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591) |
| Installed | `sharp@0.34.5` via `apps/web > next@15.5.24` |
| Fixed version | `>=0.35.0` |
| Affected code | Next.js image optimizer, not Review domain/parser |
| Review reachability | Review does not decode GIF/TIFF/VIPS for engineering documents. PI/Review ingest is PDF/TXT/DOCX only. |
| Exploit prerequisites | Attacker supplies untrusted image that Next image optimization decodes |
| Existing mitigation | Next pin 15.5.24; Review MIME allowlist excludes images |
| Pilot exposure | Low for Review document path; residual if `/_next/image` processes untrusted images |
| Upgrade/regression | Forcing sharp `>=0.35.0` under Next 15.5.24 is an unsupported nested override and may break image optimization |
| Recommended disposition | HUMAN_DECISION_REQUIRED — accept residual for controlled pilot **or** wait for Next release that bumps sharp |
| Review/remediation date | 2026-10-20 |

## 2. sharp@0.34.5 (GHSA-rgj7-g3m4-5g8c)

| Field | Evidence |
| --- | --- |
| Advisory | GHSA-rgj7-g3m4-5g8c — libheif issues, possible RCE on glibc Linux under conditions |
| Installed | `sharp@0.34.5` via Next |
| Fixed version | `>=0.35.4` |
| Affected code | Next image optimizer AVIF/HEIF decode |
| Review reachability | AVIF disabled in `apps/web/next.config.ts` (`images.formats: ["image/webp"]`) |
| Exploit prerequisites | Untrusted AVIF/HEIF submitted to image optimizer |
| Existing mitigation | AVIF format disabled; Review ingest is not image-based |
| Pilot exposure | Low after AVIF disable |
| Upgrade/regression | Same nested-sharp constraint as above |
| Recommended disposition | HUMAN_DECISION_REQUIRED |
| Review/remediation date | 2026-10-20 |

## 3. postcss@8.4.31 (GHSA-6g55-p6wh-862q)

| Field | Evidence |
| --- | --- |
| Advisory | GHSA-6g55-p6wh-862q — attacker-controlled CSS `sourceMappingURL` arbitrary file read |
| Installed | `postcss@8.4.31` via Next |
| Fixed version | `>=8.5.12` (later GHSA-r28c-9q8g-f849 needs `>=8.5.18`) |
| Affected code | Next CSS pipeline |
| Review reachability | Review documents are PDF/TXT/DOCX. Untrusted CSS is not a Review ingest type. |
| Exploit prerequisites | Application processes attacker-controlled CSS through PostCSS without `map: false` |
| Existing mitigation | Review/PI MIME allowlist; no user CSS upload |
| Pilot exposure | Not reachable on Review ingest; residual if some other Next CSS path processes untrusted CSS |
| Upgrade/regression | Nested PostCSS is bundled by Next; override may desync compiler |
| Recommended disposition | HUMAN_DECISION_REQUIRED |
| Review/remediation date | 2026-10-20 |

## 4. postcss@8.4.31 (GHSA-r28c-9q8g-f849)

| Field | Evidence |
| --- | --- |
| Advisory | Path traversal via `sourceMappingURL` disclosing `.map` files |
| Installed | `postcss@8.4.31` via Next |
| Fixed version | `>=8.5.18` |
| Affected code / reachability / exposure | Same as §3 |
| Recommended disposition | HUMAN_DECISION_REQUIRED |
| Review/remediation date | 2026-10-20 |

## 5. nanoid@3.3.15 (GHSA-28wg-ghj8-5hjv)

| Field | Evidence |
| --- | --- |
| Advisory | Non-secure generator infinite loop on negative size |
| Installed | `nanoid@3.3.15` via `next > postcss` |
| Fixed version | `>=3.3.16` |
| Affected code | Transitive CSS toolchain, not Review IDs (Review uses `crypto.randomUUID`) |
| Review reachability | Review does not pass attacker-controlled size into nanoid |
| Exploit prerequisites | Caller invokes nanoid/non-secure with negative size |
| Existing mitigation | No Review API takes a nanoid size parameter |
| Pilot exposure | NOT_REACHABLE for Review execution path |
| Upgrade/regression | Nested under Next/PostCSS |
| Recommended disposition | HUMAN_DECISION_REQUIRED |
| Review/remediation date | 2026-10-20 |

## 6. nanoid@3.3.15 (GHSA-2v37-7h3g-55p8)

| Field | Evidence |
| --- | --- |
| Advisory | customAlphabet infinite loop when size is 0 |
| Installed | `nanoid@3.3.15` |
| Fixed version | `>=3.3.18` |
| Reachability / exposure | Same as §5 — NOT_REACHABLE for Review |
| Recommended disposition | HUMAN_DECISION_REQUIRED |
| Review/remediation date | 2026-10-20 |

---

## Decision record (authorized human)

| Package | Human disposition | accepted_by | accepted_at | expiry | rationale |
| --- | --- | --- | --- | --- | --- |
| sharp@0.34.5 | ACCEPTED_CONTROLLED_PILOT_ONLY | Silvestre Berso | 2026-09-20T20:24+08:00 | 2026-10-20 | Not assessed as practically exploitable on the bounded Review pilot path; keep monitoring |
| postcss@8.4.31 | ACCEPTED_CONTROLLED_PILOT_ONLY | Silvestre Berso | 2026-09-20T20:24+08:00 | 2026-10-20 | Same; CSS ingest is not a Review document type |
| nanoid@3.3.15 | ACCEPTED_CONTROLLED_PILOT_ONLY | Silvestre Berso | 2026-09-20T20:24+08:00 | 2026-10-20 | Same; Review IDs do not use nanoid |

Not accepted for enterprise production. Re-review on or before 2026-10-20.
