# EOS 2.20 GA Claim Matrix

`GA_CLAIM_MATRIX_COMPLETE=YES`

| CAPABILITY | IMPLEMENTED | VALIDATED | QUALIFIED | GA_SUPPORTED | LIMITATION |
| --- | --- | --- | --- | --- | --- |
| Engineering Basis persistence (pilot path) | YES | YES | N/A | CONDITIONAL | GA blocked on entitlement/onboarding; pilot validated |
| Multidisciplinary objects / revisions | YES | YES | N/A | CONDITIONAL | Pilot scope; cohort=1 |
| Cross-discipline interfaces | YES | YES | N/A | CONDITIONAL | Acceptance ≠ design approval |
| Change impact + human materiality | YES | YES | N/A | CONDITIONAL | AI cannot finalize materiality |
| Deliverables / freeze readiness | YES | YES | N/A | CONDITIONAL | MDR naming UX limitation |
| Provenance / audit | YES | YES | N/A | CONDITIONAL | Some denials lack audit rows |
| RLS / tenant isolation | YES | YES | N/A | YES (security) | Multi-enrolled live cohort not validated |
| Authority boundaries | YES | YES | N/A | YES (security) | — |
| Kill switch / rollout control | YES | YES | N/A | CONDITIONAL | Mode remains controlled_pilot |
| Ask Engineering AI reasoning | YES | YES | N/A | BOUNDED | Corpus excludes EOS 2 pilot tables; abstain |
| Structural D1 calculations | YES | YES | QUALIFIED_BOUNDED | BOUNDED | Known D1 limitations retained |
| Other discipline deterministic calcs | PARTIAL | PARTIAL | NO | NO | NOT_QUALIFIED |
| External solver execution | CONNECTOR/METADATA | NO | NO | NO | Not globally qualified |
| Autonomous approval/IFC/release | NO | N/A | N/A | NO | Forbidden |
| Regulatory / PE certification | NO | N/A | N/A | NO | Forbidden claim |
| Commercial entitlement GA | NO | NO | N/A | NO | INTERNAL_PILOT_ONLY |
| GA customer onboarding | NO | NO | N/A | NO | NOT_READY |
| Full enterprise DMS | NO | NO | N/A | NO | Excluded |
| Construction management | NO | NO | N/A | NO | Excluded |

`GA_SUPPORTED=CONDITIONAL` means technically evidenced in controlled pilot but **not** authorized for GA release while blockers remain.
