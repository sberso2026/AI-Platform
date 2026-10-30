# Engineering Dependency Model (Intelligence-2)

`EOS_ENGINEERING_DEPENDENCY_STAKEHOLDER_MODEL=PASS`  
`EOS_EXISTING_RELATIONSHIP_GRAPH_REUSED=YES`  
`EOS_DUPLICATE_DEPENDENCY_GRAPH_CREATED=NO`

Information dependencies interpret producer/consumer/handoff/blocking state on top of the Relationship Graph.  
Dependencies always reference a canonical information object (no copies).

Module: `eos3-engineering-dependency-stakeholder.ts`  
API: `/api/engineering/projects/[projectId]/dependencies`  
Migration: `20261030240000_eos_3_intelligence_2_dependency_stakeholder.sql`
