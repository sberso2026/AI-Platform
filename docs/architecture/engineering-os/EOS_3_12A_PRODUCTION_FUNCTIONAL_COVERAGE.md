# EOS 3.12A Production Functional Coverage

`EOS_3_PRODUCTION_FUNCTIONAL_COVERAGE=PASS`

`EOS_3_PRODUCTION_ASSURANCE_MINIMUM_COVERAGE_MET=YES`

| Capability | Production-exercised | Evidence |
|------------|----------------------|----------|
| CANONICAL_OBJECTS | YES | 19 assurance objects (+ prior smoke 2) |
| DIGITAL_THREAD | YES | 16 relationships |
| KNOWLEDGE | YES | 4 sources / 4 chunks / 15 audits |
| DECISION | YES | 1 decided case + audits |
| OPTIMIZATION | YES | 1 bounded run, no auto-selection |
| WORKFLOW | YES | 1 instance / 6 transition records |
| EVENT | YES | 7 events + duplicate reject |
| REASONING_ASSISTANT | YES | 4 completed in-process tasks |
| BASELINE | YES | 2 baselines / 6 members |
| HANDOVER | YES | 1 accepted package |
| ASSET | YES | 1 operational asset + config + mapping |
| INSPECTION | YES | 1 inspection + finding object |
| SECURITY_DENIAL | YES | auth denials, API bypass, role escalation, foreign ID, AI authority denials |

## Minimum thresholds

| Threshold | Required | Actual | Met |
|-----------|----------|--------|-----|
| Complete scenarios | ≥3 | 3 (A/B/C) | YES |
| Meaningful ops (12A) | ≥50 | 144 | YES |
| Governed reads | ≥10 | 13 | YES |
| Governed writes | ≥10 | 118 | YES |
| Workflow transitions | ≥5 | 6 | YES |
| Governed events | ≥5 | 7 | YES |
| Reasoning tasks | ≥3 | 4 | YES |
| Authorization denials | ≥3 | ≥8 | YES |
| Project-to-asset lifecycle | ≥1 | 1 | YES |
| Inspection/finding | ≥1 | 1 | YES |

### Count basis (12A)

Writes (118): objects 19 + revisions 20 + relationships 16 + baseline_members 6 + decision/opt/wf/work/events/knowledge sources&chunks/AI plans&draft/handover/asset/config/inspection/mapping + object_audit 19 + 12A foundation security audits 11.  
Reads (13): knowledge_audit `retrieval%` actions.  
Operations (144): writes 118 + knowledge audits 15 + (knowledge conflict/abstention included in audits) + AI already in writes — documented campaign total **144** meaningful Production operations.  
Prior EOS 3.12 smoke ops: **6**. Cumulative: **150**.
