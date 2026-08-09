# Engineering OS Cross-Module Search Model

Status: Phase 14A · `EngineeringOSCrossModuleSearchAssessed = true`

## Decision

Do **not** create a second search engine. Reuse Platform search / Knowledge
Intelligence infrastructure with Engineering OS aggregation.

## Coherent search targets (assessment)

| Target | Provider locus | Assessed |
| --- | --- | --- |
| Projects | Engineering shared / PI | yes |
| Assets | Engineering shared / AI | yes |
| Documents | PI / Engineering documents | yes |
| Inspections / findings | II / PI findings | yes |
| Project Controls intelligence | PC providers | yes (entitlement filtered) |
| Digital Twins | DT providers | yes (bounded) |
| Engineering models | Interop providers | yes (federation refs) |
| Simulation packages | DT / Platform Files refs | yes (refs only) |
| Shared spatial references | Spatial domain | yes (bounded) |

## Required semantics

- search result ≠ authority
- search result ≠ verified engineering conclusion
- permission-filtered results only
- no silent cross-tenant leakage

## Gap

Unified Engineering Search UI exists (`/engineering/search`) but provider coverage
and result-type normalization across all V1 modules remains **ready_bounded** —
requires closure before claiming OS-wide search completeness.
