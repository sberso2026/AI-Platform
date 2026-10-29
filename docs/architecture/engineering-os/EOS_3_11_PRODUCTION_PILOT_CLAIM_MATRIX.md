# EOS 3.11 Production Pilot Claim Matrix (Frozen)

Access model: `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`  
Default: `DENY`  
Live LLM: `DISABLED_NOT_VALIDATED`  
Migration in initial pilot: `DISABLED` (new EOS 3 project strategy)

| Capability | Status | Note |
|------------|--------|------|
| Canonical object model | SUPPORTED | Staging-validated |
| Digital thread | SUPPORTED | Staging-validated |
| Knowledge/retrieval | SUPPORTED_WITH_LIMITATIONS | Live LLM excluded |
| Decision Intelligence | SUPPORTED | Human authority required |
| Optimization Intelligence | SUPPORTED_WITH_LIMITATIONS | Bounded; no D1 inherit |
| Workflow/events | SUPPORTED | Human checkpoints |
| Synthetic solver framework | SUPPORTED_WITH_LIMITATIONS | Synthetic only |
| Real third-party connectors | NOT_SUPPORTED | Excluded from initial pilot |
| SPACE GASS | NOT_QUALIFIED | EXISTING_D1G_READ_ONLY_CONNECTOR_BOUNDED_LIMITATION_NOT_EXECUTION_CERTIFIED |
| Engineering Reasoning Assistant | SUPPORTED_WITH_LIMITATIONS | In-process/policy-bound only; not live generative AI |
| Live LLM | NOT_SUPPORTED | DISABLED_NOT_VALIDATED |
| Project-to-asset thread | SUPPORTED_WITH_LIMITATIONS | Not full EAM/CMMS |
| Inspection foundation | SUPPORTED_WITH_LIMITATIONS | Bounded |
| Production EOS 2→3 migration | NOT_SUPPORTED | Disabled in initial pilot |
| D1 calculations | SUPPORTED_WITH_LIMITATIONS | QUALIFIED_BOUNDED existing scope |
| Non-D1 calculations | NOT_QUALIFIED | NOT_QUALIFIED |
| External solvers | NOT_QUALIFIED | Global qualification NO |

`EOS_3_PRODUCTION_PILOT_CLAIM_MATRIX_FROZEN=YES`

## Scope freeze (ENABLED / ENABLED_WITH_LIMITATIONS / DISABLED / NOT_QUALIFIED)

- canonical object model: ENABLED
- digital thread: ENABLED
- knowledge/retrieval: ENABLED_WITH_LIMITATIONS
- Decision Intelligence: ENABLED
- Optimization Intelligence: ENABLED_WITH_LIMITATIONS
- workflow/events: ENABLED
- synthetic solver: ENABLED_WITH_LIMITATIONS
- real third-party connectors: DISABLED
- SPACE GASS: NOT_QUALIFIED
- Engineering Reasoning Assistant: ENABLED_WITH_LIMITATIONS
- live LLM: DISABLED
- project-to-asset: ENABLED_WITH_LIMITATIONS
- inspection foundation: ENABLED_WITH_LIMITATIONS
- migration: DISABLED
- D1 calculations: ENABLED_WITH_LIMITATIONS
- non-D1 calculations: NOT_QUALIFIED
- external solvers: NOT_QUALIFIED
