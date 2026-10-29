# EOS 2.20 GA Claim Matrix (post-2.20R)

`GA_CLAIM_MATRIX_COMPLETE=YES`

`GA_PRODUCT_CLAIMS_REVIEW=PASS`

Preserve: `IMPLEMENTED != VALIDATED != QUALIFIED`.

| CAPABILITY | IMPLEMENTED | VALIDATED | QUALIFIED | GA_SUPPORTED | LIMITATION |
| --- | --- | --- | --- | --- | --- |
| Engineering Basis persistence (pilot / multi-enrolled validation) | YES | YES | N/A | CONDITIONAL | Final GA GO not issued; mode remains controlled_pilot |
| Multidisciplinary objects / revisions | YES | YES | N/A | CONDITIONAL | Live enrolled cohort=2 internal validation |
| Cross-discipline interfaces | YES | YES | N/A | CONDITIONAL | Acceptance ≠ design approval |
| Change impact + human materiality | YES | YES | N/A | CONDITIONAL | AI cannot finalize materiality |
| Deliverables / freeze readiness | YES | YES | N/A | CONDITIONAL | MDR naming UX limitation |
| Provenance / audit | YES | YES | N/A | CONDITIONAL | Some denials may lack audit rows |
| RLS / tenant isolation | YES | YES | N/A | YES (security) | Multi-enrolled Production leak count 0 |
| Authority boundaries | YES | YES | N/A | YES (security) | Workspace-scoped; no cross-WS role propagation |
| Kill switch / rollout control | YES | YES | N/A | CONDITIONAL | Mode remains controlled_pilot until GA GO |
| Ask Engineering AI reasoning | YES | YES | N/A | BOUNDED | Corpus excludes EOS 2 pilot tables; abstain |
| Structural D1 calculations | YES | YES | QUALIFIED_BOUNDED | BOUNDED | Known D1 limitations retained |
| Other discipline deterministic calcs | PARTIAL | PARTIAL | NO | NO | NOT_QUALIFIED |
| External solver execution | CONNECTOR/METADATA | NO | NO | NO | Not globally qualified |
| Autonomous approval/IFC/release | NO | N/A | N/A | NO | Forbidden |
| Regulatory / PE certification | NO | N/A | N/A | NO | Forbidden claim |
| Commercial entitlement GA | YES | YES (internal) | N/A | READY_WITH_LIMITATIONS | Canonical `eos-2` grants; billing-independent; no fabricated payments |
| GA customer onboarding | YES | YES (internal) | N/A | READY | Audited admin workflow; not DB editing |
| Full enterprise DMS | NO | NO | N/A | NO | Excluded |
| Construction management | NO | NO | N/A | NO | Excluded |
| Formal SOC 2 / ISO 27001 / EU AI Act certification | NO | NO | N/A | NO | Readiness statements only; not certified |

`GA_SUPPORTED=CONDITIONAL` means technically evidenced under controlled_pilot / INTERNAL_GA_VALIDATION but **not** activated as General Availability until a subsequent EOS 2.20 gate and human FINAL_GA_GO.
