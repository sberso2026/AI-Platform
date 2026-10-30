# EOS 3 — Decision & Assumption Lineage

`EOS_DECISION_GRAPH_INTEGRATION=PASS`  
`EOS_ASSUMPTION_GRAPH_INTEGRATION=PASS`  
`EOS_DUPLICATE_DECISION_LINEAGE_STORE_CREATED=NO`  
`EOS_DUPLICATE_ASSUMPTION_DEPENDENCY_STORE_CREATED=NO`  
`EOS_STALENESS_PROPAGATION_IMPLEMENTED=NO`

Target lineage (branches optional):

`REQUIREMENT` → `EVIDENCE` → `ASSUMPTION` → `CALCULATION` → `DECISION` → `DELIVERABLE`

Uses Domain-3 relationship types (`ASSUMES`, `SUPPORTS`, `APPLIES_TO`, `AFFECTS`, …). No parallel lineage tables.

Code: `eos3-decision-assumption-lineage.ts`  
Migration: `20261030200000_eos_3_domain_4_decision_assumption_lineage.sql`
