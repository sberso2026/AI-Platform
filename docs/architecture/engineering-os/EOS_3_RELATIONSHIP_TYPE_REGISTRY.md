# EOS 3 — Relationship Type Registry

`EOS_TYPED_RELATIONSHIP_REGISTRY=PASS`  
`EOS_RELATIONSHIP_SEMANTICS_GOVERNED=PASS`  
`EOS_RELATIONSHIP_TYPE_CONSTRAINTS=PASS`

Each type defines:

- engineering meaning  
- allowed source/target object classes  
- directional vs symmetric  
- inverse display label (UI only — no duplicate inverse edge required)  
- revision-specific dependency allowance  
- evidence expectation  
- inference policy / materiality default  

## Core vocabulary

`REQUIRES` · `PRODUCES` · `CONSUMES` · `SUPPORTS` · `JUSTIFIES` · `ASSUMES` · `AFFECTS` · `SUPERSEDES` · `REVIEWS` · `APPROVES` · `IMPLEMENTS` · `MODIFIES` · `BLOCKS` · `APPLIES_TO` · `DERIVED_FROM` · `CONTAINS`

## Domain-2 compatible

`LOCATED_IN` · `PART_OF_SYSTEM` · `PART_OF_ASSET` · `CONNECTED_TO` · `SERVES` · `ASSOCIATED_WITH`

Legacy EOS 3.2 types map via aliases (e.g. `DECISION_USES_ASSUMPTION` → `ASSUMES`).

Code: `apps/web/src/lib/engineering/eos3-relationship-type-registry.ts`
