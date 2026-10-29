# EOS 3.13 GA Activation Runbook (DO NOT EXECUTE IN THIS PHASE)

`EOS_3_GA_ACTIVATION_RUNBOOK_READY=YES`

**This phase did not execute activation.**  
`EOS_3_GA_ACTIVATION_PERFORMED=NO`  
`EOS_3_13_PRODUCTION_CHANGE_COUNT=0`

## Preconditions

1. Explicit human GA GO issued for the exact candidate fingerprint  
2. GA release authority designated with software-release scope only  
3. Candidate fingerprint unchanged  
4. Runtime commit = `429e0452319641b717864c50ce6a40507548a7a9` (or separately authorized successor)  
5. Production migration ledger = 170  
6. Fresh Production backup / verified restore path  
7. EOS 2 health / regression PASS  
8. Security release regression PASS  
9. Kill switch operational  
10. External customer hold remains ACTIVE unless separately cleared by a different gate

## Ordered activation steps (future)

1. Verify human GA authorization + authorization fingerprint  
2. Verify GA candidate fingerprint `sha256:c5d2bef972bd4a8b108d32b8d762da58a6fe4a301977ac724630479ab25af158`  
3. Verify candidate runtime / claim matrix / limitations unchanged  
4. Verify Production backup/recovery posture  
5. Verify current deployment identity  
6. Verify migration ledger 170  
7. Verify EOS 2 health  
8. Verify security gate  
9. Verify kill switch  
10. Set EOS 3 release status to GENERAL_AVAILABILITY (software state only)  
11. Retain EXPLICIT_ENTITLEMENT_AND_ENROLLMENT; access default DENY  
12. Keep external customer hold ACTIVE  
13. Verify live LLM + real connectors remain disabled  
14. Verify D1 QUALIFIED_BOUNDED / non-D1 NOT_QUALIFIED claims  
15. Post-activation smoke + security/release regression  
16. Record GA activation evidence

## Authorization fingerprint schema (ready)

`EOS_3_GA_AUTHORIZATION_FINGERPRINT_SCHEMA_READY=YES`

Future human GO must hash-bind: GA candidate fingerprint; runtime; schema ledger; claim matrix; limitations; defect disposition; access model; release authority identity; external customer hold; authorizedAt timestamp.
