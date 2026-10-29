# EOS 3.12 GA Claim Matrix Draft (Candidate Only)

`EOS_3_GA_CLAIM_MATRIX_DRAFTED=YES`

**Not activated. Not GA. Draft for a future GA readiness gate.**

Based on current evidence, a *bounded* GA could only claim what is proven; unproven Production paths remain limited or unsupported.

| Capability | Draft GA status | Evidence note |
|------------|-----------------|---------------|
| Canonical object model | SUPPORTED_WITH_LIMITATIONS | Production smoke only (2 objects); staging validated |
| Digital thread | SUPPORTED_WITH_LIMITATIONS | Staging validated; Production relationships = 0 |
| Knowledge / retrieval | SUPPORTED_WITH_LIMITATIONS | Staging validated; Production knowledge = 0; live LLM excluded |
| Decision Intelligence | SUPPORTED_WITH_LIMITATIONS | Human authority required; Production decisions = 0 |
| Optimization Intelligence | SUPPORTED_WITH_LIMITATIONS | No auto final selection; Production not exercised |
| Workflow / events | SUPPORTED_WITH_LIMITATIONS | Staging validated; Production workflows/events = 0 |
| Synthetic solver framework | SUPPORTED_WITH_LIMITATIONS | Synthetic only |
| Real third-party connectors | NOT_SUPPORTED | DISABLED; D002 open |
| SPACE GASS | NOT_QUALIFIED | Read-only bounded; not execution-certified |
| Engineering Reasoning Assistant | SUPPORTED_WITH_LIMITATIONS | Policy-bound; not live generative AI |
| Live LLM | NOT_SUPPORTED | DISABLED_NOT_VALIDATED; D001 open |
| Project-to-asset thread | NOT_SUPPORTED | NOT_EXERCISED in Production Pilot |
| Inspection foundation | SUPPORTED_WITH_LIMITATIONS | Staging only |
| Production EOS 2→3 migration | NOT_SUPPORTED | Guarded; count 0 |
| D1 calculations | SUPPORTED_WITH_LIMITATIONS | QUALIFIED_BOUNDED existing scope only |
| Non-D1 calculations | NOT_QUALIFIED | NOT_QUALIFIED |
| External solvers | NOT_QUALIFIED | Global qualification NO |

## GA readiness criteria (defined)

`EOS_3_GA_READINESS_CRITERIA_DEFINED=YES`

Minimum for a future GA gate:

- 0 unresolved Critical / High
- 0 cross-workspace leakage / authority bypass
- EOS 2 GA regression PASS
- Production Pilot security assurance PASS
- Acceptable reliability & performance for claimed scope
- Audit / provenance / recovery / support runbook ready
- Claim matrix & limitations accurate (no qualification misrepresentation)
- Sufficient Production Pilot operational evidence (`SUFFICIENT_FOR_CURRENT_GATE` or better)

Current assessment: criteria defined; **not met for GA** due to `INSUFFICIENT` Production evidence.
