# EOS-3 Impact Propagation Rules

`EOS_RELATIONSHIP_SEMANTIC_PROPAGATION=PASS`  
`EOS_IMPACT_MATERIALITY_GOVERNED=PASS`  
`EOS_IMPACT_PROPAGATION_BOUNDED=PASS`

## Propagating relationship types

ASSUMES, REQUIRES, SUPPORTS, JUSTIFIES, AFFECTS, MODIFIES, PRODUCES, CONSUMES, DERIVED_FROM, IMPLEMENTS, BLOCKS, APPLIES_TO, SUPERSEDES

## Non-propagating (false-positive control)

CONNECTED_TO, ASSOCIATED_WITH, CONTAINS, REVIEWS, APPROVES

Asset CONNECTED_TO Asset must not make both assets STALE.

## Bounds

- Default max depth: 4
- Project/workspace scoped
- Relation-type filter to propagating set
- Cycle protection via visited set in Domain-3 DFS
- Idempotent on event key / trigger revision / affected / state dedupe key
- Multi-path: merge explanations; do not create duplicate active impacts

## LLM

`EOS_PROPAGATION_REQUIRES_LIVE_LLM=NO` — deterministic explicit relationships are authoritative.
