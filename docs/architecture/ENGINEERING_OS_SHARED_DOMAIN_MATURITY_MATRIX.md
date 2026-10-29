# Engineering OS Shared Domain Maturity Matrix

Status: Phase 14A · `EngineeringOSSharedDomainMaturityAssessed = true`

## Assessment

| Domain | Package / locus | Version | Runtime maturity | Public contracts | Persistence / RLS | Cross-module usage | Migration stability | GA requirement for EOS V1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shared Asset Domain | Engineering Core / `engineering_os_shared_domain` | historical / not separately versioned as 1.0.0 package | production_bounded (long-lived tables) | implicit via Engineering OS APIs | Yes (hosted) | PI, II, AI, PC, DT, Interop | Stable lineage | **B** — pin compatible contracts; optional explicit domain GA track |
| Shared Project Domain | `@rtb/engineering-shared-project-domain` | `0.1.0-shared-project-domain` | prerelease references | draft/prerelease | batch_61 refs | PC + others referencing projects | Stable | **B** — may pin prerelease; explicit 1.0.0 preferred but not automatic |
| Shared Spatial Domain | `@rtb/engineering-shared-spatial-domain` | `0.2.0-spatial-core` | core certified (12M) | prerelease bounded | batch_85 | DT, Interop, AI consumers | Stable | **B** — pin compatible prerelease; do not auto-promote to 1.0.0 |

## Decision

Do **not** automatically promote every shared domain to `1.0.0`.

Engineering OS V1 **may pin compatible prerelease shared-domain contracts**
provided ownership remains unambiguous and modules consume public/approved
references only.

Option **A** (explicit shared-domain GA before EOS V1) remains available for
Asset Domain vocabulary normalization if Product chooses stricter freeze.
