# EOS 3.13 GA Claim Matrix (Frozen)

`EOS_3_GA_CLAIM_MATRIX_FROZEN=YES`

Access model: `EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`  
Default: `DENY`  
Runtime candidate: `429e0452319641b717864c50ce6a40507548a7a9`  
Migration ledger: `170`

| Capability | GA status | Note |
|------------|-----------|------|
| Canonical engineering objects | SUPPORTED_WITH_LIMITATIONS | Production-exercised; internal pilot evidence |
| Digital thread | SUPPORTED_WITH_LIMITATIONS | Production-exercised |
| Knowledge Intelligence | SUPPORTED_WITH_LIMITATIONS | Live LLM excluded; conflict/abstention required |
| Decision Intelligence | SUPPORTED_WITH_LIMITATIONS | Human decision required; AI recommendation ≠ decision |
| Optimization Intelligence | SUPPORTED_WITH_LIMITATIONS | Bounded; no D1 inheritance; no auto-final selection |
| Governed workflow | SUPPORTED_WITH_LIMITATIONS | Human checkpoints; invalid paths rejected |
| Governed events | SUPPORTED_WITH_LIMITATIONS | Idempotent; grants_authority always false |
| Engineering Reasoning Assistant (deterministic / in-process) | SUPPORTED_WITH_LIMITATIONS | Not live generative LLM |
| Live LLM | NOT_SUPPORTED | DISABLED_NOT_VALIDATED (D001) |
| Synthetic solver framework | SUPPORTED_WITH_LIMITATIONS | Synthetic adapters only |
| Real third-party connectors | NOT_SUPPORTED | DISABLED (D002) |
| SPACE GASS | NOT_QUALIFIED | EXISTING_D1G_READ_ONLY_CONNECTOR_BOUNDED_LIMITATION_NOT_EXECUTION_CERTIFIED |
| External solver execution | NOT_QUALIFIED | Global qualification NO |
| D1 structural calculations | SUPPORTED_WITH_LIMITATIONS | QUALIFIED_BOUNDED existing validated scope only |
| Non-D1 calculations | NOT_QUALIFIED | NOT_QUALIFIED |
| Baseline / deliverable governance | SUPPORTED_WITH_LIMITATIONS | Human freeze/approval |
| Project-to-asset continuity | SUPPORTED_WITH_LIMITATIONS | Engineering lifecycle continuity — not full EAM/CMMS |
| Inspection / finding foundation | SUPPORTED_WITH_LIMITATIONS | Bounded foundation |
| Migration framework | SUPPORTED_WITH_LIMITATIONS | Framework guarded; Production EOS 2 project migration not exercised |
| External / Production EOS 2 project migration | NOT_SUPPORTED | Count 0; requires separate validation + authorization |
| External customer access | NOT_SUPPORTED | Hold ACTIVE; separate legal/commercial gate |
| Public self-service signup | NOT_SUPPORTED | NO |

`EOS_3_GA_AI_CAPABILITY_CLAIM_ACCURATE=PASS` — live LLM not claimed as supported.  
`EOS_3_GA_ENGINEERING_REASONING_SCOPE_DEFINED=YES` — deterministic/in-process assist only.
