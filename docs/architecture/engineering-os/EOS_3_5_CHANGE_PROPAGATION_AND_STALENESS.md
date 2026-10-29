# EOS 3.5 Change Propagation and Staleness

`EOS_3_CHANGE_PROPAGATION_WORKFLOW=PASS`

`EOS_3_STALE_STATE_WORKFLOW=PASS`

`EOS_3_REQUIREMENT_CHANGE_WORKFLOW=PASS`

`EOS_3_WORKFLOW_KNOWLEDGE_INTEGRATION=PASS`

`EOS_3_EVENT_RETRIEVAL_INVALIDATION=PASS`

`EOS_3_WORKFLOW_DECISION_INTEGRATION=PASS`

`EOS_3_WORKFLOW_OPTIMIZATION_INTEGRATION=PASS`

## Propagation pattern

Revision changed → governed `REVISION_CHANGE` event → dependency evaluation → `IMPACT_CANDIDATE_CREATED` → dependent deliverable marked `STALE` → human review work item.

Downstream engineering **content** is not auto-rewritten. Materiality / acceptance remain human checkpoints.

## Requirement change

Requirement revision event → impact-assessment work item → affected objects flagged → assigned review/action. No silent redesign.

## Stale examples

- Deliverable after upstream revision
- Decision recommendation after assumption invalidation (human historical decision remains immutable)
- Retrieval invalidation signals (`object:…`, `assumption:…`) — non-authoritative; canonical state remains source of truth even if reindex lags

## Optimization completion

May emit `OPTIMIZATION_RESULT`, create candidate evidence / decision work item. Must **not** create a final Decision.
