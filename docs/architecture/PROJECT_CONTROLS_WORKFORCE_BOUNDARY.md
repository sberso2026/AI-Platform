# Project Controls / Finance Boundary

Phase 11E ownership split.

| Concern | Owner | Project Controls relation |
| --- | --- | --- |
| Cost Intelligence | `project_controls` | **Owns** — advisory posture only |
| Financial ledgers / GL | `external_finance_or_future_finance_domain` | **Forbidden** — no tables, no posting |
| Budget engine | external / future | **Forbidden** — `COST_ENGINE_IMPLEMENTED = false` |
| Earned value | reserved | **Forbidden** |
| Forecast engine | reserved | **Forbidden** — `FORECAST_ENGINE_IMPLEMENTED = false` |

`CostProvider.getBudget/getCommitments/getActualCost` remain `not_implemented`. Cost Intelligence is implemented via `CostIntelligenceEngine`, distinct from the reserved ledger provider surface.
