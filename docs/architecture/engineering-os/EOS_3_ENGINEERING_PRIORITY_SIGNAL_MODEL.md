# Engineering Priority Signal Model

Bounded deterministic signals (governed where noted):

- Impact states (CHANGE_DETECTED → INVALIDATED) with materiality  
- Blocking / waiting-for-me dependencies  
- Downstream consumers (material, not raw count)  
- Review / Decision obligations  
- Readiness / Pattern checkpoint pressure  
- Due / required-by date (contextual, not sole driver)  
- Explicit safety / asset criticality / project priority only when canonical  
- Manual priority hint (cannot silently override critical evidence)  
- Field/execution only with canonical evidence  

## Bands

`CRITICAL` · `HIGH` · `MEDIUM` · `LOW`

CRITICAL requires strong justification (safety-critical, invalidated approved engineering, imminent field use of stale work). Routine overdue admin is never CRITICAL.

## Tie-break

1. Priority band  
2. Internal score  
3. Required-by / due date  
4. Blocking flag  
5. Stable object ID  
