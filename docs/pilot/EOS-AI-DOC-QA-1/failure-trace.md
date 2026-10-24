# Failure trace (pre-remediation)

Measured against Preview before this ticket’s retrieval/generation changes. Full JSON: `failure-trace.json`.

## Questions

1. `supports for lanyards or pull wires shall be provided at what maximum interval?`
2. `what is the maximum interval for lanyard or pull wire support?`

Authoritative fact: supports at intervals not exceeding **4.5 m** (clause 4.8.7.6(e)).

## Layer answers

| Question | 4.5 m body retrieved? | Rank | Selected? | Passed to generation? | Provider executed? | Provider failed? | Parse failed? | Sufficiency rejected? | Degraded discard? |
|---|---|---|---|---|---|---|---|---|---|
| Q1 | yes | fused 8 (rank 1 was 4.8.7.6(d) force) | yes | yes | openai | no | no | no | no — wrong fact generated |
| Q2 | yes | same pattern | yes | yes | openai | no | no | no | no — wrong fact generated |

`LANYARD_FAILURE_LAYER=evidence_selection+grounded_generation`  
`LANYARD_FAILURE_ROOT_CAUSE=Neighbouring same-clause force text (70 N / 230 N) outranked the asked interval property; generation used the first evidence window; no structured MAX-interval extraction or claim verification.`
