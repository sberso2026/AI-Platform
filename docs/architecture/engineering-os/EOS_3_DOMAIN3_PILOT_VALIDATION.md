# EOS 3 — Domain 3 Pilot Validation

`PILOT_001_RELATIONSHIP_GRAPH_VALIDATION=PASS`  
`EOS_BROWNFIELD_DEPENDENCY_QUERY=PASS`  
`EOS_WORK_PACKAGE_GRAPH_QUERY=PASS`  
`EOS_ASSET_ENGINEERING_CONTEXT_QUERY=PASS`

## Seed

`seedPilot001RelationshipGraph()` composes:

- Project `CONTAINS` WP-STR-004  
- Domain-1 associations/dependencies  
- Domain-2 Asset/System context + WP asset links  
- CALC-001 `ASSUMES` ASM-001 (revision-aware)  
- Evidence `SUPPORTS` ASM-001  
- CALC-001 `APPLIES_TO` AST-PLT-201  
- REQ-001 `APPLIES_TO` WP-STR-004  
- CALC-001 `SUPPORTS` DEC-001  
- DEC-001 `AFFECTS` DEL-001  

Only relationships supported by existing pilot state / Domain-1/2 seeds.

## Demonstrated queries

1. What does CALC-001 depend on? → ASM-001  
2. What depends on ASM-001? → CALC-001  
3. What belongs to / affects WP-STR-004? → associations + MODIFIES/AFFECTS assets  
4. What engineering work is associated with AST-PLT-201? → calculations, WP modifies, related assets  

## Performance baseline (measured)

Recorded by automated test on synthetic ~200-node graph (see test stdout `EOS_DOMAIN3_PERF`).
