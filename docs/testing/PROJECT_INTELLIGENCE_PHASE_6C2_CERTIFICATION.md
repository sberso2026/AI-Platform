# Project Intelligence Phase 6C-2 Certification

**Package:** `@rtb/project-intelligence-certification`  
**Workflow:** `.github/workflows/project-intelligence-phase-6c2-certification.yml`  
**Command:** `pnpm project-intelligence:certify`  
**Phase:** Document Intelligence capability port

---

## Gates (zero required skips)

| Gate | Requirement |
|------|-------------|
| A | Tests, typecheck, production build |
| B | Hosted document-intelligence schema |
| C | Real-JWT RLS matrix |
| D | Engineering Core document ownership |
| E | Storage and source authorization |
| F | Document ingestion and processing |
| G | Chunking, tables and lineage |
| H | Embeddings and hybrid retrieval |
| I | Grounded answer and citations |
| J | Abstention and conflicting evidence |
| K | Revision comparison |
| L | Findings and review boundary |
| M | Background jobs, retries and idempotency |
| N | Browser E2E |
| O | Accessibility and responsive behavior |
| P | Legacy capability equivalence |
| Q | Reproducible build identity and GitHub evidence |

---

## Jobs

1. `preflight` — secrets, staging target, refuse production cert  
2. `validate` — typecheck, unit tests (including `src/documents/`), production build  
3. `baseline-equivalence` — vendored freeze `ab1f442…` typecheck/tests/build  
4. `hosted-certification` — schema, RLS, HTTP, Playwright documents A–P  
5. `release-evidence` — artifact SHA = CI SHA = build identity; citation/abstention counts present  

---

## Browser scenarios (Playwright `documents.spec.ts`)

| ID | Scenario |
|----|----------|
| A | List authorized documents |
| B | Open document detail |
| C | Process document |
| D | Observe processing state |
| E | Query document |
| F | Verify citations |
| G | Open evidence drawer |
| H | Verify abstention |
| I | Verify conflicting evidence |
| J | Compare revisions |
| K | Review a finding |
| L | Unassigned workspace denied |
| M | Suspended licence denied |
| N | Cross-tenant document denied |
| O | Accessibility |
| P | Responsive |

Positive paths must not treat login or access-denied as success.

---

## Artifact fields (Phase 6C-2)

In addition to 6C-1 fields, the certification report includes:

- `documentFixtureCount`
- `processingFixtureCount`
- `equivalenceScenarioCount`
- `citationAssertionCount`
- `abstentionAssertionCount`
- `rlsMatrixCount`
- `baselineTag` / `baselineCommitSha`
- `compatibilityPatchChecksum` / `vendoredArchiveChecksum`
- `migrationChecksums`

---

## Fail conditions

- Missing secrets / wrong Supabase project  
- Production certification enabled  
- Dirty working tree (local)  
- Artifact SHA ≠ CI SHA  
- Required gate skip  
- Unexpected 5xx  
- Document RLS failure  
- Cross-tenant or cross-workspace access success  
- Installation entitlement bypass  
- Answered responses without citation assertions in the browser suite  

See also: `GITHUB_HOSTED_CERTIFICATION_VERIFICATION.md`, `PROJECT_INTELLIGENCE_DOCUMENT_RUNBOOK.md`.
