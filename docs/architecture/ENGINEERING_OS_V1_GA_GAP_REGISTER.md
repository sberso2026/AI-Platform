# Engineering OS V1 GA Gap Register

Status: Phase 14A · `EngineeringOSGaGapRegisterReady = true`  
`phase14BReady = true` (no UNKNOWN ownership boundaries remain)

Classification: **BLOCKER** · **REQUIRED_BEFORE_GA** · **RECOMMENDED_POST_GA** ·
**OPTIONAL** · **EXTERNAL_DEPENDENCY** · **INTENTIONALLY_UNAVAILABLE**

| ID | Gap | Class | Owner | Subsystem | Evidence | Corrective phase | GA impact | Frozen module mod? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G01 | OS module registry marks Project Controls `coming_soon` / `0.0.0` / disabled despite PC V1 GA | REQUIRED_BEFORE_GA | Engineering OS | module-registry | `packages/engineering-os/src/module-registry.ts` | 14B registry reconciliation | Hides certified module from OS composition | No (EOS only) |
| G02 | OS module registry marks Digital Twin `coming_soon` / `0.0.0` / disabled despite DT V1 GA | REQUIRED_BEFORE_GA | Engineering OS | module-registry | same | 14B | Same | No |
| G03 | Asset Intelligence absent from OS module registry seed | REQUIRED_BEFORE_GA | Engineering OS | module-registry | registry list length 4 | 14B | Incomplete OS product composition | No |
| G04 | Engineering Model Interoperability absent from OS module registry seed | REQUIRED_BEFORE_GA | Engineering OS | module-registry | inventory | 14B | Incomplete OS product composition | No |
| G05 | Modules launcher marks Inspection Intelligence `coming_soon` despite II V1 | REQUIRED_BEFORE_GA | Engineering OS / web | `apps/web/.../modules/page.tsx` | status chip | 14B UI truthfulness | Certified module appears unavailable | No |
| G06 | Asset Intelligence missing from modules launcher list | REQUIRED_BEFORE_GA | Engineering OS / web | modules page | MODULES array | 14B | Discovery/navigation gap | No |
| G07 | Shared Asset Domain semantic name vs runtime `engineering_os_shared_domain` alias | REQUIRED_BEFORE_GA | Engineering OS / Shared Domains | ownership normalization | normalization map | 14B alias enforcement docs+asserts | Vocabulary drift risk | No destructive rename |
| G08 | Shared Project Domain still `0.1.0-shared-project-domain` | RECOMMENDED_POST_GA | Shared Project Domain | maturity | package version | optional domain GA | Pin-compatible OK for EOS V1 option B | No |
| G09 | Shared Spatial Domain still `0.2.0-spatial-core` not 1.0.0 | RECOMMENDED_POST_GA | Shared Spatial Domain | maturity | package version | optional domain GA | Pin-compatible OK | No |
| G10 | EngineeringOSManifest aggregate not implemented/frozen | REQUIRED_BEFORE_GA | Engineering OS | manifest aggregation | draft only in inventory | 14B | Needed for install/health truth | No |
| G11 | Cross-module search provider normalization incomplete | REQUIRED_BEFORE_GA | Engineering OS / Platform Search | search | search model doc | 14B | Coherent OS search claim | No |
| G12 | OS home lacks full multi-module command aggregation | REQUIRED_BEFORE_GA | Engineering OS / web | home | navigation model | 14B | Product coherence | No |
| G13 | EngineeringContext runtime not fully standardized across modules | REQUIRED_BEFORE_GA | Engineering OS | context | context model | 14B | Cross-module routing | No |
| G14 | Aggregate OS health does not yet include all V1 modules + host + tools | REQUIRED_BEFORE_GA | Engineering OS | health | health model | 14B | Ops honesty | No |
| G15 | Commercial EOS base vs module entitlement packaging not productized end-to-end | REQUIRED_BEFORE_GA | Commerce + EOS | packaging | packaging arch | 14B | Installability as one OS | No |
| G16 | OS-level performance/SLO aggregation missing (fixture-scale only) | RECOMMENDED_POST_GA | Ops | performance | baseline doc | post-GA | No enterprise claim | No |
| G17 | SPACE GASS live execution unavailable | EXTERNAL_DEPENDENCY | Client / Interop track | solvers | 13D blocked | post-GA provider track | Not required for EOS V1 | No |
| G18 | ETABS live COM/execution not certified | INTENTIONALLY_UNAVAILABLE | Interop track | solvers | Interop V1 flags false | post-GA provider track | Not required for EOS V1 | No |
| G19 | PoF / RUL / SHM / autonomous approval | INTENTIONALLY_UNAVAILABLE | AI / future | predictive | capability matrix | future | Must stay unavailable | No |
| G20 | Silent solver fallback / license bypass | INTENTIONALLY_UNAVAILABLE (forbidden) | All | security | policy docs | never | Must remain false | No |

## Summary counts

| Class | Count |
| --- | --- |
| BLOCKER | 0 |
| REQUIRED_BEFORE_GA | 12 |
| RECOMMENDED_POST_GA | 3 |
| EXTERNAL_DEPENDENCY | 1 |
| INTENTIONALLY_UNAVAILABLE | 3 |

## Phase 14B derivation note

Phase 14B should close **REQUIRED_BEFORE_GA** registry/UI/manifest/search/context/health/packaging
items without reopening frozen V1 module feature surfaces and without live solver work.
