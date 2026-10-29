# Internal Security Test Matrix

**Phase:** 16C.1  
**Code mirror:** `packages/platform-identity/src/domain/internal-adversarial/matrix.ts`

| Category | Representative cases |
|---|---|
| authentication | unauthenticated, SSO state mismatch, password fallback denied, redirect abuse |
| authorization | viewer assurance/execution denied, disabled user denied |
| tenant_isolation | Tenant A→B cross-surface matrix, SSO binding leak check |
| ai_security | cross-tenant context, untrusted doc instructions, tool unauthorized, classification block |
| files | cross-tenant IDOR, path traversal, absolute path |
| execution_host | cross-tenant, command injection, unapproved solver, silent fallback |
| security_assurance | internal disclosure, auto-approval, claim without evidence |

Hosted CI does **not** require commercial ETABS/SPACE GASS licenses.
