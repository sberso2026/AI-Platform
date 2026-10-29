# EOS 3.4 Decision Authority and Human Oversight

`EOS_3_HUMAN_DECISION_AUTHORITY=PASS`

`EOS_3_HUMAN_DECISION_STATE_AUTHORITY=PASS`

`EOS_3_TRADEOFF_HUMAN_AUTHORITY=PASS`

`EOS_3_OPTIMIZATION_HUMAN_SELECTION_AUTHORITY=PASS`

`EOS_3_AI_DECISION_BOUNDARY=PASS`

`EOS_3_AI_OPTIMIZATION_BOUNDARY=PASS`

`EOS_3_AI_WEIGHT_ACCEPTANCE_CONTROL=PASS`

`EOS_3_AI_CONSTRAINT_AUTHORITY_CONTROL=PASS`

`EOS_3_DECISION_HUMAN_CHECKPOINTS=PASS`

`AI_DECISION_AUTHORITY=NO`

`AI_OPTIMIZATION_SELECTION_AUTHORITY=NO`

## Rules

- Only authorized humans finalize Decision cases
- Read-only callers cannot finalize
- AI-suggested weights remain recommendations until accepted
- AI-inferred constraints remain non-authoritative until tied to Requirement/Basis/human rule
- Hard constraints cannot be bypassed by recommendations
- Historical human decisions are immutable; stale recommendations require re-evaluation
