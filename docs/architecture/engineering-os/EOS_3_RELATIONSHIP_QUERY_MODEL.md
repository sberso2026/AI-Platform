# EOS 3 — Relationship Query Model

`EOS_GRAPH_DIRECT_QUERY_SERVICE=PASS`  
`EOS_GRAPH_BOUNDED_TRAVERSAL=PASS`  
`EOS_GRAPH_PATH_EXPLANATION=PASS`  
`EOS_GRAPH_CYCLE_SAFE_TRAVERSAL=PASS`  
`EOS_STALENESS_PROPAGATION_IMPLEMENTED=NO`  
`EOS_GRAPH_IMPACT_OVERCLAIM_COUNT=0`

## Direct queries

| Query | Meaning |
| --- | --- |
| `GET_UPSTREAM` | Incoming edges |
| `GET_DOWNSTREAM` | Outgoing edges |
| `GET_DEPENDENCIES` | REQUIRES / ASSUMES / CONSUMES / DERIVED_FROM targets |
| `GET_DEPENDENTS` | Objects that depend on / support / affect this |
| `GET_SUPPORTING_EVIDENCE` | Evidence/Document SUPPORTS/JUSTIFIES |
| `GET_RELATED_OBJECTS` | All active incident edges |

## Bounded traversal

Options: `maxDepth`, direction, type filters, object-class filters, project scope, cycle protection (visited set).

Path explanation uses relationship semantics + inverse display labels.

## Relatedness vocabulary

`RELATED` · `DEPENDENT` · `POTENTIALLY_AFFECTED` · `EXPLICITLY_AFFECTED`  

`EXPLICITLY_AFFECTED` only for `AFFECTS` / `MODIFIES`. Path existence alone never marks objects stale.
