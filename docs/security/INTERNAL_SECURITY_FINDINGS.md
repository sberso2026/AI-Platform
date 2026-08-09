# Internal Security Findings

**Phase:** 16C.1  
**Authority:** INTERNAL only  
**Code mirror:** `packages/platform-identity/src/domain/internal-adversarial/findings.ts`

## Boundary

These findings are **internal** adversarial/validation findings.  
They are **not** external penetration-test findings and do **not** satisfy S07.

## Register summary

| ID | Severity | Status | Surface |
|---|---|---|---|
| IAS-001 | HIGH | fixed | enterprise_sso |
| IAS-002 | CRITICAL | fixed | tenant_isolation |
| IAS-003 | CRITICAL | fixed | oidc |
| IAS-004 | HIGH | fixed | ai_context |
| IAS-005 | HIGH | fixed | execution_host |
| IAS-006 | MEDIUM | fixed | security_assurance |
| IAS-007 | HIGH | fixed | files |
| IAS-INFO-001 | INFO | fixed | program / S07 deferral |

Open CRITICAL/HIGH: **0** (required for Phase 16C.1 PASS).

## AI-assisted adversarial review (INTERNAL)

An architecture/authorization challenge pass was performed using available internal tooling/subagents. Outcomes are recorded only as internal findings / regression coverage.

AI findings are INTERNAL only and MUST NOT be treated as:

- an external penetration-test opinion
- ISO/SOC2/Essential Eight certification
- S07 closure
- Tier-1 approval
