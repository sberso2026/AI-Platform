# EOS 3.12A Production Security Evidence

`EOS_3_PRODUCTION_PILOT_SECURITY_ASSURANCE=PASS`

| Control | Result |
|---------|--------|
| RLS / cross-workspace leak | PASS — foreign workspace × assurance project = **0** |
| Entitlement | PASS — only authorized workspace entitled |
| Enrollment | PASS — PILOT count = 1 |
| API bypass (unauthenticated) | PASS — DENY recorded |
| Foreign object ID | PASS — leak_count 0 |
| Role escalation (AI as human checkpoint) | PASS — DENY recorded |
| AI authority denials | PASS — 5/5 DENIED |
| Kill switch | PASS — DENY recorded |
| Live LLM disabled | PASS — connectors/AI live unused; model_identity in-process |
| Real connectors disabled | PASS — connectors = 0 |
| Migration guard | PASS — migration_jobs = 0 |

`EOS_3_PRODUCTION_CROSS_WORKSPACE_LEAK_COUNT=0`

`EOS_3_PRODUCTION_RLS_ASSURANCE=PASS`  
`EOS_3_PRODUCTION_ENTITLEMENT_ASSURANCE=PASS`  
`EOS_3_PRODUCTION_ENROLLMENT_ASSURANCE=PASS`  
`EOS_3_PRODUCTION_API_BYPASS_TEST=PASS`  
`EOS_3_PRODUCTION_FOREIGN_OBJECT_ID_TEST=PASS`  
`EOS_3_PRODUCTION_ROLE_ESCALATION_TEST=PASS`  
`EOS_3_DISABLED_CAPABILITY_ENFORCEMENT=PASS`

`EOS_3_PRODUCTION_AUDIT_ASSURANCE=PASS` — foundation + object + decision + optimization + knowledge audits present.  
`EOS_3_PRODUCTION_PROVENANCE_ASSURANCE=PASS` — campaign provenance on objects/events/AI plans.
