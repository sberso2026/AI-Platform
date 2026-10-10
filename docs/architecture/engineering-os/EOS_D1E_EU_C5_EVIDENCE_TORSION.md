# EOS-D1E-EU-C5-EVIDENCE — torsion evidence and baseline reconciliation

Evidence recovery only. Shear and interior punching methods are unchanged. No numerical torsion method is added.

## Baseline lineage

`e00bbbbbeb8718d79b1e83064e9adbed312eda7e` is an ancestor of `86c1d114062a046c7884480891f27440c10b1ab9`.

One intervening commit:

| Commit | Classification | Why |
| --- | --- | --- |
| `86c1d114062a046c7884480891f27440c10b1ab9` | `LEGITIMATE_PRIOR_PHASE_COMMIT` | C5 evidence bind. It adds the fail-closed C5 evidence module and moves the recommended-next-phase pointer. It does not change C1, C2, C3, or C4 numerical engines. |

The 26 files in that range are documentation, C5 evidence contracts, capability/matrix pointers, and tests that only retarget the next-phase id. No security-control file is in the range. Release-sensitive files in the range are limited to the capability manifest, the validation matrix, and the roadmap pointer in `structural-concrete.ts`.

`C5_START_HEAD_LINEAGE_RECONCILED = YES`. History was not rewritten.

## Dependency drift

`pnpm-lock.yaml` is unchanged from the C4 baseline through the certified C5 result. The production audit rerun in this phase is critical 0, high 1, moderate 4.

| Advisory | Package | Version | Path | Origin | Disposition |
| --- | --- | --- | --- | --- | --- |
| GHSA-68fv-2mgg-jv7q / CVE-2026-93749 | source-map-js | 1.2.1 | `apps/web > next@15.5.24 > postcss > source-map-js` | present before C5 | known high, build toolchain |
| GHSA-w5hq-g745-h8pq / CVE-2026-41907 | uuid | 8.3.2 | engineering-os `exceljs@4.4.0` | present before C5 | known moderate, runtime transitive |
| GHSA-hp3w-g68c-fv3c / CVE-2026-97058 | sprintf-js | 1.0.3 | project-intelligence `mammoth > argparse` | present before C5 | known moderate, runtime transitive |
| GHSA-4jqv-mc3x-m676 / CVE-2026-94543 | next | 15.5.24 | `apps/web > next@15.5.24` | advisory published after the prior moderate snapshot; package unchanged | documented drift |
| GHSA-mcj8-r9mp-w47p / CVE-2026-94484 | next | 15.5.24 | `apps/web > next@15.5.24` | same | documented drift |

The moderate count moved from 2 to 4 because two Next.js advisories entered the audit database. C5 did not add or bump those packages. Findings are recorded in `packages/engineering-os-certification/security/sca-moderate-baseline.json`. That file is a visible debt record. It is not an exception and does not downgrade severity.

## D1C torsional action

State: absent.

`TORSION_DEMAND_SCOPE` is `NOT_IMPLEMENTED`. `StructuralDemandResult.torsion` is only `{ status: "NOT_IMPLEMENTED" }`. `runDeterministicDemand` throws if the scope flag is anything else. The D1C architecture note lists torsion as unsupported and says it must never be reported as zero.

A transport field for an externally supplied torsion would change that frozen result contract and the engine invariant. This phase does not add it. No torsion is calculated from a member model. No FEA is added.

There is no torsional action id, unit, sign convention, or provenance, because the action is not represented.

## Torsion rule dependency

Smallest candidate scope considered: external torsional demand, effective wall thickness, enclosed area, standalone cracking resistance, transverse and longitudinal torsion reinforcement, and maximum strut resistance. Combined shear-torsion and moment-torsion checks stay out of scope.

Secondary sources agree on the thin-wall description (area over outer perimeter for effective thickness, and shear flow from demand and the centre-line enclosed area): Walraven Eurocode slides (eurocodes.fi, 2 February 2008), the FRILO reinforced-concrete cross-section manual, and the SCIA theoretical manual for EN 1992-1-1 / EN 1992-2. A blog worked example was not used as authority.

That agreement does not authorize a resistance method:

- Maximum torsional resistance and the reinforcement areas depend on the compression-strut angle and on strength-reduction parameters. Those are unresolved NDPs. No national value was guessed.
- The cracking check in the FRILO manual is written as an interaction with shear, and the German national expression differs. A standalone cracking torque would drop that interaction or pick a national form. Both are refused.
- Profile identity stays first-generation only where the sources say so. No second-generation expression is mixed in. Conformance remains `INTENDED_PROFILE`.

| Rule | Classification |
| --- | --- |
| `EU_C5_TORSION_DEMAND` | absent D1C action; not implementation-ready |
| `EU_C5_TORSION_TEF` | corroborated geometry identity; not a resistance |
| `EU_C5_TORSION_AK` | corroborated geometry identity; not a resistance |
| `EU_C5_TORSION_SHEAR_FLOW` | corroborated stress identity; not a resistance |
| `EU_C5_TORSION_CRACKING` | `BLOCKED_SOURCE_CONFLICT` (coupled to shear; national variant) |
| `EU_C5_TORSION_T_RD_MAX` | `BLOCKED_NDP` |
| `EU_C5_TORSION_REINFORCEMENT` | `BLOCKED_NDP` |

Implementation-ready rule ids: none. Rule authority is not complete. No runtime torsion method, golden case, or result contract is created.

## Conformance and debt

Numerical validation is not standard conformance. The pack is not certified. The product claim stays `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`.

`D1E-EU-VD-TORSION` stays `UNRESOLVED`. Nothing in the validation-debt register is reduced. Human review, generation, edition, National Annex, third-party comparison, second-order behaviour, serviceability, detailing, anchorage, laps, and prestress remain open.

Shear without transverse reinforcement and interior rectangular punching remain the only C5 numerical methods.

## Next phase

`READY_FOR_EU_C6 = NO`.

Next phase type: `TARGETED_C5_TORSION_EVIDENCE_RECOVERY`.

Canonical phase id remains `EOS-D1E-EU-C5-EVIDENCE`. Scope: recover a governed standalone first-generation torsion resistance and an authorized D1C torsional-action transport. Do not change the implemented shear or punching methods. Do not infer a National Annex. Combined V+T and M+T stay out of scope until separately governed.

Blocker: D1C torsion is architecturally frozen, and the standalone resistance rules are blocked by unresolved strut-angle parameters and by a cracking check that the secondary sources couple to shear.
