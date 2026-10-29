# EOS 3.12A Production Reliability and Performance

## Reliability

`EOS_3_PRODUCTION_RELIABILITY_ASSURANCE=PASS_WITH_LIMITATIONS`

| Metric | Value |
|--------|-------|
| `EOS_3_12A_OPERATION_COUNT` | 144 |
| `EOS_3_12A_SUCCESS_COUNT` | 144 |
| `EOS_3_12A_FAILURE_COUNT` | 0 |
| `EOS_3_CUMULATIVE_PILOT_OPERATION_COUNT` | 150 |
| `EOS_3_CUMULATIVE_PILOT_SUCCESS_COUNT` | 150 |
| `EOS_3_CUMULATIVE_PILOT_FAILURE_COUNT` | 0 |
| SEV1 / SEV2 / SEV3 | 0 / 0 / 0 |
| Application / workflow / event / AI task failures | 0 / 0 / 0 / 0 |

Duplicate event submission was rejected by idempotency (expected control success, not a failure).

Limitation: evidence demonstrates repeatable controlled pilot paths; not a statistical Production reliability certification or GA SLO.

## Performance

`EOS_3_PRODUCTION_PERFORMANCE_ASSURANCE=PASS_WITH_LIMITATIONS`

Campaign SQL apply batches completed without timeout or threshold breach. No dedicated APM latency series for each capability class.

`EOS_3_PILOT_THRESHOLD_BREACH_COUNT=0`

## Concurrency

`EOS_3_PRODUCTION_CONCURRENCY_ASSURANCE=PASS`

Bounded: simultaneous governed reads (10 retrieval audits), competing invalid workflow transitions recorded, duplicate event rejected. No destructive load test.

## Observability / supportability / recovery

`EOS_3_PRODUCTION_OBSERVABILITY_ASSURANCE=PASS`  
`EOS_3_PRODUCTION_SUPPORTABILITY_ASSURANCE=PASS` — can identify workspace, project `eos3-12a-assurance-001`, workflow, events, AI tasks, audits.  
`EOS_3_PRODUCTION_RECOVERY_ASSURANCE=PASS`  
`EOS_3_PRODUCTION_BACKUP_POSTURE=PASS_WITH_LIMITATIONS` — WAL-G enabled; PITR not enabled.  
`EOS_3_PILOT_KILL_SWITCH_ASSURANCE=PASS`
