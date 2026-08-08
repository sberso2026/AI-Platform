# Project Controls V1.0 — Unavailable Capabilities

Public contract version: **1.0.0**

## UNAVAILABLE — not production functions of V1.0

| Capability | Governing lock | Reason |
| --- | --- | --- |
| Native CPM | `CPM_SCHEDULING_IMPLEMENTED = false` | Schedule intelligence is descriptive only. |
| Critical path engine | `CPM_SCHEDULING_IMPLEMENTED = false` | No forward/backward pass in V1.0. |
| Resource leveling | `RESOURCE_LEVELING_IMPLEMENTED = false` | Out of scope. |
| Schedule execution | `SCHEDULE_EXECUTION_IMPLEMENTED = false` | Intelligence never executes schedule changes. |
| Financial posting | `FINANCIAL_POSTING_IMPLEMENTED = false` | Project Controls is not a ledger. |
| Budget ledger | `BUDGET_LEDGER_IMPLEMENTED = false` | Cost intelligence is descriptive. |
| Accounting ledger | `FINANCIAL_POSTING_IMPLEMENTED = false` | Owned by external finance domain. |
| Autonomous project management | `AUTOMATIC_DECISION_EXECUTION_ENABLED = false` | Humans own project decisions. |
| Automatic contract instruction | `AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED = false` | Contractual authority stays outside PC. |
| Earned value | `EARNED_VALUE_IMPLEMENTED = false` | Progress is not EV/CPI/SPI. |

## Enforcement points

- `packages/project-controls/src/version.ts` — authoritative false flags
- `packages/project-controls/src/domain/unavailable-capabilities.ts` — machine-readable matrix
- `packages/project-controls/src/domain/capability-registry.ts` — maturity classifications
- Engineering OS module page — UNAVAILABLE labels in text
