# Engineering Review AI — production dependency triage (ERA-7)

Source: `pnpm audit --prod` after pinning `next@15.5.24`.  
Evidence: `docs/engineering-review/security/evidence/era-7-pnpm-audit.json`.

ERA-6 snapshot: critical 2 / high 17 / moderate 9.  
ERA-7 after Next pin: **critical 0 / high 6 / moderate 2**.

AI does not accept residual risk. Authorized human accepted residual HIGH for the **controlled Engineering Review AI pilot only** until 2026-10-20 (`era-7a-human-dependency-acceptance.md`). Not enterprise production.

## CRITICAL

| Advisory | Package | Result |
| --- | --- | --- |
| GHSA-p293-qw3h-jr36 | `next` Windows unauthenticated RCE | Closed by `next@15.5.24` |
| GHSA-2xp9-vwfh-vxw4 | `next` AVIF/libheif RCE | Closed by 15.5.24 + `images.formats: ["image/webp"]` |

No unresolved exploitable CRITICAL remains in the production audit.

## HIGH (residual)

| Advisory | Package | Installed | Fixed | Path | Preconditions | Class | Treatment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GHSA-f88m-g3jw-g9cj | `sharp` / libvips | 0.34.5 via next 15.5.24 | >=0.35.0 | Next image optimizer | Untrusted GIF/TIFF/VIPS decode | POTENTIALLY_EXPLOITABLE | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20; Next bundles sharp |
| GHSA-rgj7-g3m4-5g8c | `sharp` / libheif | 0.34.5 via next | >=0.35.4 | Image optimizer | Untrusted AVIF/HEIF | POTENTIALLY_EXPLOITABLE mitigated by AVIF disabled | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20; keep AVIF off |
| GHSA-6g55-p6wh-862q | `postcss` | 8.4.31 via next | >=8.5.12 | Next CSS pipeline | Attacker-controlled CSS `sourceMappingURL` | NOT_REACHABLE for Review documents; POTENTIALLY_EXPLOITABLE if Next processes untrusted CSS | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20 |
| GHSA-r28c-9q8g-f849 | `postcss` | 8.4.31 via next | >=8.5.18 | Next CSS pipeline | Attacker-controlled `.map` path | Same as above | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20 |
| GHSA-28wg-ghj8-5hjv | `nanoid` | 3.3.15 via next/postcss | >=3.3.16 | Transitive | Negative size to non-secure generator | NOT_REACHABLE unless that API is exposed | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20 |
| GHSA-2v37-7h3g-55p8 | `nanoid` | 3.3.15 | >=3.3.18 | Transitive | Size 0 to customAlphabet | NOT_REACHABLE unless that API is exposed | ACCEPTED_CONTROLLED_PILOT_ONLY until 2026-10-20 |

Root `package.json` `pnpm.overrides` is not applied by the current pnpm CLI. The Next CRITICAL close is the exact `apps/web` pin `next: 15.5.24`.

`@xmldom/xmldom` via mammoth was not present in this `--prod` audit snapshot.

Do not dismiss HIGH findings solely because they are transitive.
