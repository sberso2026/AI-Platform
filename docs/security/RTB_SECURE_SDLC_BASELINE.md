# RTB Secure SDLC Baseline

Status: Phase 14C · `SecureSdlcAssessed = true`

## Inventory

| Control | Status |
| --- | --- |
| Secret scanning in certification CI | implemented |
| Dependency SCA (npm audit/CodeQL/Snyk) | missing |
| SAST | missing / unknown |
| DAST | missing |
| SBOM generation | missing |
| Build provenance / signed artifacts | missing |
| Branch protection | unknown (org setting; not evidenced in repo docs) |
| Code review | manual / process |
| Frozen lockfile (`pnpm-lock.yaml`) | implemented |
| Deployment authorization | implemented_bounded (GitHub Actions + secrets) |
| Rollback | implemented_bounded (platform lifecycle) |
| Certification gate culture | implemented |

## Supply chain notes

- Prefer pinned Actions major versions currently in use (`@v4`) — digest pinning not evidenced
- External solver binaries / IFC parser / AI SDKs: treat as trusted-with-review
- No evidence of untrusted build sources in certified paths

## GA impact

Introducing minimum dependency vulnerability scanning in CI = **REQUIRED_BEFORE_GA**.
