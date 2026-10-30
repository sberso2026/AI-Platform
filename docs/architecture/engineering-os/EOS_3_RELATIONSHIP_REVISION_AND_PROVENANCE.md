# EOS 3 — Relationship Revision & Provenance

`EOS_REVISION_AWARE_RELATIONSHIPS=PASS`  
`EOS_RELATIONSHIP_HISTORY_PRESERVED=PASS`  
`EOS_RELATIONSHIP_SUPERSESSION=PASS`  
`EOS_RELATIONSHIP_PROVENANCE=PASS`  
`EOS_RELATIONSHIP_INFERENCE_AUTHORITY_BOUNDARY=PASS`  
`EOS_RELATIONSHIP_EVIDENCE_SUPPORT=PASS`

## Revision awareness

Edges may bind:

- source revision id/label  
- target revision id/label  

Example: `CALC-STR-042 Rev 2 ASSUMES ASM-018 Rev 1` remains attributable to Rev 1 after ASM-018 Rev 2 exists.

## Status / history

`ACTIVE` · `SUPERSEDED` · `RETIRED` · `INVALIDATED`  
Supersession links `NEW SUPERSEDES OLD` without rewriting historical fields.

## Provenance origins

`HUMAN` · `SYSTEM_DERIVED` · `INFERRED` · `MIGRATED`

Inferred **material** relationships are `PROPOSED` — not silent authoritative facts.

## Evidence

`evidenceRefs[]` may attach multiple supporting evidence IDs to one edge (prefer aggregation over duplicate edges).
