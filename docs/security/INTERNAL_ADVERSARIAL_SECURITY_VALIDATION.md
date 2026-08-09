# Internal Adversarial Security Validation

**Phase:** 16C.1  
**Version:** `0.3.1-internal-adversarial`

## Purpose

Perform the strongest feasible **internal** adversarial security validation while formally deferring independent external penetration testing until Tier-1 commercialization.

## Critical boundary

**Internal validation ≠ independent penetration testing.**  
S07 remains `REQUIRED_BEFORE_TIER1_PRODUCTION`.  
This program MUST NOT claim, simulate, fabricate, or substitute for an independent external penetration test.

## Coverage

- Authentication (unauthenticated, session/token negatives, MFA/SSO fail-closed, password fallback prohibition)
- Authorization (RBAC/entitlement/privilege/admin/hidden API negatives via matrix)
- Tenant/workspace isolation (Tenant A/B cross-tenant matrix across product surfaces)
- AI security (context leak, tool auth, classification, untrusted instructions)
- Files/artifacts (IDOR, path traversal, malformed paths)
- API/web categories (covered via regression matrix + existing cert suites)
- Solver/execution host negatives (no live ETABS/SPACE GASS required)
- Security & Assurance disclosure negatives

## PASS semantics

PASS means only:

- `InternalAdversarialSecurityValidationReady=true`
- `InternalSecurityRegressionSuiteReady=true`
- `KnownCriticalInternalSecurityFindingOpen=false`
- `KnownHighInternalSecurityFindingOpen=false`

PASS does **not** mean S07 complete, external pen test performed, or Tier-1 production ready.

## Implementation

- Fixtures/suite: `packages/platform-identity/src/domain/internal-adversarial/`
- Flags: `packages/platform-identity/src/internal-adversarial-flags.ts`
- Certification: `@rtb/platform-identity-certification` `certify:phase16c1`
