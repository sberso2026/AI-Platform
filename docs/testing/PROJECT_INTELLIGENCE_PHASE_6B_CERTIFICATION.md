# Project Intelligence Phase 6B Certification

**Package:** `@rtb/project-intelligence-certification`  
**Workflow:** `.github/workflows/project-intelligence-phase-6b-certification.yml`  
**Command:** `pnpm project-intelligence:certify`

---

## Gates (zero required skips)

| Gate | Requirement |
|------|-------------|
| A | Tests, typecheck, production build |
| B | Hosted mapping schema verification |
| C | Real-JWT RLS for mapping records |
| D | Application installation and entitlement |
| E | Shared shell and access states |
| F | Engineering Core read adapters |
| G | Legacy migration-source adapter |
| H | Mapping review API and UI |
| I | AI Director proof with evidence |
| J | Workspace and role boundaries |
| K | Accessibility and responsive behavior |
| L | Nested error contract and correlation IDs |
| M | Reproducible build identity |
| N | GitHub hosted certification run verification |

---

## Jobs

1. `preflight` — secrets, staging target, refuse production cert  
2. `validate` — typecheck, unit tests, production build  
3. `hosted-certification` — schema, RLS, HTTP, Playwright  
4. `release-evidence` — artifact SHA = CI SHA = build identity  

Production approval is **not** required for Phase 6B development certification.

---

## Fail conditions

- Missing secrets / wrong Supabase project  
- Production certification enabled  
- Dirty working tree  
- Artifact SHA ≠ CI SHA  
- Required gate skip  
- Unexpected 5xx  
- Mapping RLS failure  
- Cross-tenant or cross-workspace access success  
- Installation entitlement bypass  

See also: `GITHUB_HOSTED_CERTIFICATION_VERIFICATION.md`
