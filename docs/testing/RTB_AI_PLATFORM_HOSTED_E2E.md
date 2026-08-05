# RTB AI Platform — Hosted E2E

**Phase:** 7B  
**Package:** `@rtb/platform-certification`  
**Workflow:** `.github/workflows/rtb-ai-platform-production-certification.yml`

## Markers

| Marker | Meaning |
|--------|---------|
| `data-testid="rtb-ai-platform-ready"` | Platform home / platform-only readiness |
| `data-testid="reference-os-ready"` | Reference OS certification surface ready |

## Required browser flows

A–C platform-only / readiness / empty OS nav for unentitled  
D–F Engineering entitlement and navigation  
G–I engineer / viewer / unentitled denial  
J–K reference-os install visibility  
L–P suspend/resume isolation (each OS independent)  
Q–S uninstall / platform remains / reinstall attempt  
T–U workspace and cross-tenant isolation  
V logout / session invalidation  

Accessibility and responsive suites cover administration shell, OS catalogue, licences/seats, workspaces, Engineering and reference-os navigation, suspended state, and viewports 360×800 through 1440×900.

## Requirements

- Hosted staging only (`ALLOW_PRODUCTION_CERTIFICATION=false`)
- Node 22
- Nested API errors: `{ error: { code, message, requestId, details } }`
- Playwright traces/screenshots retained on failure
- Do not accept login-page or access-denied fallbacks for flows intended to prove successful entitlement
- `artifactCommitSha = ciHeadSha = buildIdentitySha`
- `releaseEligible = true` only when all required gates A–V pass with zero skips
