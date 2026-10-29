# EOS 3.12A GA Claim ↔ Production Evidence Mapping

`EOS_3_GA_CLAIM_TO_PRODUCTION_EVIDENCE_MAPPING=PASS`

| Capability | Draft GA claim posture | Production evidence in 3.12A |
|------------|------------------------|------------------------------|
| Canonical objects | SUPPORTED_WITH_LIMITATIONS | Exercised (19+ objects) |
| Digital thread | SUPPORTED_WITH_LIMITATIONS | Exercised (16 relationships) |
| Knowledge/retrieval | SUPPORTED_WITH_LIMITATIONS | Exercised; live LLM excluded |
| Decision Intelligence | SUPPORTED_WITH_LIMITATIONS | Exercised; human decision required |
| Optimization | SUPPORTED_WITH_LIMITATIONS | Exercised; not auto-final |
| Workflow/events | SUPPORTED_WITH_LIMITATIONS | Exercised with invalid-path tests |
| Reasoning assistant (in-process) | SUPPORTED_WITH_LIMITATIONS | 4 completed deterministic tasks |
| Baseline / handover | SUPPORTED_WITH_LIMITATIONS | Exercised |
| Project-to-asset / inspection | SUPPORTED_WITH_LIMITATIONS | Exercised (closes prior NOT_EXERCISED) |
| Live LLM | NOT_SUPPORTED | Still DISABLED_NOT_VALIDATED |
| Real connectors | NOT_SUPPORTED | Still DISABLED |
| SPACE GASS | NOT_QUALIFIED | Unchanged |
| External solvers | NOT_QUALIFIED | Denial tested; global qual NO |
| Non-D1 | NOT_QUALIFIED | Unchanged |
| D1 | SUPPORTED_WITH_LIMITATIONS | QUALIFIED_BOUNDED; calc metadata only |
| EOS 2→3 migration | NOT_SUPPORTED | Guarded; jobs=0 |

`EOS_3_PILOT_EVIDENCE_SUFFICIENCY=SUFFICIENT_FOR_GA_GATE`  
`EOS_3_GA_READINESS=READY_FOR_GATE`  
`EOS_3_PILOT_EXIT_ASSESSMENT=READY_FOR_GA_GATE`

This does **not** declare GENERAL_AVAILABILITY. Next phase is the GA readiness gate.
