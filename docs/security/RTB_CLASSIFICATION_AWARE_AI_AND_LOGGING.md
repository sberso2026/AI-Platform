# Classification-Aware AI & Sensitive Logging (Phase 14D · S05)

Status: CLOSED · `ClassificationAwareAiPolicyReady=true` · `SensitiveLoggingEnforcementReady=true`

## Taxonomy (unchanged)

PUBLIC · INTERNAL · CLIENT_CONFIDENTIAL · ENGINEERING_SENSITIVE · RESTRICTED

## Enforcement module

`packages/engineering-os/src/security-closure/classification-ai-policy.ts`  
`packages/engineering-os/src/security-closure/sensitive-logging.ts`

Reuses shared AI Runtime + Policy Engine semantics.  
`implementsOwnAiStack=false` · `duplicatePolicyEngineDetected=false`

## AI policy (fail-closed)

| Classification | External AI |
| --- | --- |
| PUBLIC / INTERNAL | allowed if provider approved; training-use forbidden |
| CLIENT_CONFIDENTIAL / ENGINEERING_SENSITIVE | deny unless explicit provider policy allow |
| RESTRICTED | deny unless governed permit |
| UNKNOWN | deny on sensitive external-AI paths |

Semantics locks:

- classification ≠ authorization
- provider approval ≠ data approval
- redaction ≠ deletion
- audit evidence ≠ sensitive payload duplication

## Logging

Sensitive classifications omit payloads from operational logs; audit may keep governed refs only.
