# EOS 3 — Decision Authority and Rationale

`EOS_DECISION_AUTHORITY_MODEL=PASS`  
`EOS_DECISION_OWNER_AUTO_AUTHORITY=NO`  
`EOS_DECISION_RATIONALE_REQUIRED_FOR_FINAL_DECISION=YES`  
`EOS_RECOMMENDATION_DECISION_SEPARATION=PASS`  
`EOS_HUMAN_DECISION_PROVENANCE=PASS`  
`EOS_AUTONOMOUS_FINAL_ENGINEERING_DECISION=NO`

## Authority

Decision authority must be explicit. Not auto-inferred from:

- Work Package owner  
- discipline lead  
- author  
- reviewer  

Finalization requires `authorityBasis` + `authorityRole` (not `work_package_owner` / `author`).

## Rationale

Required only when advancing to `DECIDED`. Draft/proposed decisions may omit final rationale.

## Recommendation vs Decision

EOS/AI may recommend (`recommendation` field / Decision Intelligence). Only authorized humans finalize.
