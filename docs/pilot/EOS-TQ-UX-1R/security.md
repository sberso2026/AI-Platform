# EOS-TQ-UX-1R — Live security

**Host:** https://eos-pilot.rtbea.com.au  
No external users invited. Viewer used an existing cert fixture, not a new invite.

## Unauthorized mutation

Unauthenticated GET/PATCH → **401**.

Existing viewer role attempted:

- edit query
- reassign Action By
- submit response
- accept response
- close TQ

All five returned **403**.

`TQ_UNAUTHORIZED_MUTATION_BLOCK_PASS=true`

## Isolation

| Check | Result |
| --- | --- |
| Other-tenant TQ GET | 404 |
| Other-workspace TQ GET | 404 |
| Other-tenant document GET | 404 |
| TQ listed under a different project filter | false (no leak) |

`TQ_TENANT_ISOLATION_LIVE_PASS=true`  
`TQ_WORKSPACE_ISOLATION_LIVE_PASS=true`  
`TQ_PROJECT_ISOLATION_LIVE_PASS=true`

Project isolation in this product is **filter-based** (`projectId` query), not a hard ACL. Same-workspace users can list other projects unless filtered. The live TQ did not appear when listing another project.

## Identity

Visible person fields on TQ-009 / TQ-010 used names, not raw UUIDs.

`TQ_RAW_UUID_VISIBLE_COUNT=0`
