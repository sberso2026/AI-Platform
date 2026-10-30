# EOS 3 — Relationship Graph Core

Phase: `EOS-3-DOMAIN-3-RELATIONSHIP-GRAPH-CORE`

## What the graph is

A governed **relational adjacency / edge** service among canonical EOS objects.

It answers:

- What depends on this?
- What does this depend on?
- What supports this?
- What is connected to this?
- Why are these objects related?

## What the graph is not

- Not a duplicate engineering object database  
- Not Neo4j / external graph infrastructure  
- Not an AI free-form knowledge graph  
- Not a second Digital Thread  

`EOS_GRAPH_DUPLICATE_OBJECT_STORE_CREATED=NO`  
`EOS_CANONICAL_OBJECTS_REMAIN_SOURCE_OF_TRUTH=YES`  
`EOS_EXTERNAL_GRAPH_DATABASE_ADDED=NO`  
`EOS_DUPLICATE_DIGITAL_THREAD_CREATED=NO`

## Composition

| Source | Strategy |
| --- | --- |
| EOS 3.2 typed relationships / digital thread | Audited; remain structured-canonical authority |
| Domain-1 Work Package dependencies / associations | Composed into edges by reference — model not duplicated |
| Domain-2 Asset/System context relationships | Composed into edges by reference — model not duplicated |

## Persistence

Migration: `supabase/migrations/20261030180000_eos_3_domain_3_relationship_graph.sql`  
Table: `eos3_relationship_edges` (workspace RLS)

Code:

- `eos3-relationship-type-registry.ts`
- `eos3-relationship-graph-core.ts`
- API: `/api/engineering/projects/{id}/relationship-graph`

## Out of scope

- Automatic staleness / invalidation propagation (Phase 5 / Intelligence-1)
- Automatic impact conclusions beyond explicit semantics
- Elaborate graph visualization
