# EOS 3.4 Decision Intelligence Model

`EOS_3_DECISION_INTELLIGENCE_MODEL_IMPLEMENTED=YES`

`EOS_3_DECISION_CASE_LIFECYCLE_IMPLEMENTED=YES`

`EOS_3_DECISION_OPTION_MODEL_IMPLEMENTED=YES`

`EOS_3_OBJECTIVE_MODEL_IMPLEMENTED=YES`

`EOS_3_CONSTRAINT_MODEL_IMPLEMENTED=YES`

`EOS_3_UNCERTAINTY_MODEL_IMPLEMENTED=YES`

`EOS_3_TRADEOFF_MODEL_IMPLEMENTED=YES`

`EOS_3_MULTI_CRITERIA_DECISION_SUPPORT_IMPLEMENTED=YES`

`EOS_3_DECISION_RECOMMENDATION_ENGINE_IMPLEMENTED=YES`

## Lifecycle

`DRAFT → ANALYSIS → READY_FOR_HUMAN_DECISION → DECIDED | SUPERSEDED`

AI may advance analytical states. Only `recordHumanDecision` sets `DECIDED`.

## Options / objectives / constraints

Options carry origin (`human` | `ai_recommendation` | `optimization_candidate`). AI options are `RECOMMENDATION` evidence class.

Objectives are configurable (not a hard-coded universal set) with direction, unit, weight, source, authority, version.

Constraints distinguish hard/soft and deterministic / rule-based / ai_inferred. Hard constraints cannot be silently violated.

## MCDM

Weighted scoring + Pareto dominance. Weight schemes require source, actor, rationale, version. AI weights require human acceptance.

## Module

`apps/web/src/lib/engineering/eos3-decision-intelligence.ts`
