# Project Controls Cost Model

Phase 11E vocabulary for **Cost Intelligence** — advisory posture assessment, not a ledger.

| Concept | Meaning |
| --- | --- |
| Cost Evidence | Reference to a cost signal held elsewhere (no payload duplication) |
| Cost Basis Reference | Pointer to an external budget/baseline record |
| Cost Control Context | Scope + account + currency for an assessment thread |
| Cost Posture | `within_tolerance`, `over`, `under`, `attention_required`, or `unknown` |
| Variance Attribution | How movement relates to Change Intelligence context |
| Cost Assessment | Versioned `CostIntelligenceState` from evidence + basis |

**Rules:** `over`/`under` only with valid cost basis and compatible currency-aligned evidence; otherwise `unknown`/abstain. Change candidates are never approved; attribution consumes published Change Intelligence only.

**Forbidden:** budget ledger, GL posting, earned value, forecast engine, contingency drawdown.
