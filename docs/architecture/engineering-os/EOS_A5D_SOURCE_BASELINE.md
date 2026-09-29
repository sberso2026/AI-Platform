# EOS-A5D Source Baseline

Recorded before Engineering OS A1–A5D checkpoint work.

| Field | Value |
| --- | --- |
| Repository | `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform` |
| Remote | `origin` → `https://github.com/sberso2026/AI-Platform.git` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| START_HEAD | `0dd05bf124c19e1fbb8099f396a904ec86a2d020` |
| Worktree start | DIRTY |
| Linked staging project | `rntonzigxwxcjlcsadip` |

Classification key:

- **A** — EOS-A1/A2/A3/A4/A5/A5C/A5D Engineering OS implementation
- **B** — pre-existing ERA (Engineering Review) work
- **C** — unrelated
- **D** — unknown / mixed incidental

## Modified tracked files

| Path | Class | Notes |
| --- | --- | --- |
| `.gitignore` | A | Ignore `.next-staging/` |
| `apps/web/next-env.d.ts` | C | Incidental Next type stub |
| `apps/web/next.config.ts` | B | ERA staging distDir / review-staging |
| `apps/web/src/__tests__/engineering-review-staging.test.ts` | B | ERA staging login/MFA |
| `apps/web/src/__tests__/eos-uat-002-engineering-api.test.ts` | A | Engineering API error contract |
| `apps/web/src/app/(auth)/login/page.tsx` | B | ERA MFA/login path |
| `apps/web/src/app/(platform)/engineering/decisions/page.tsx` | A | EOS-A2 Decision register |
| `apps/web/src/app/api/engineering/decisions/route.ts` | A | EOS-A2 Decision API |
| `apps/web/src/app/api/platform/build-identity/route.ts` | D | Mixed platform identity |
| `apps/web/src/components/commerce/create-engineering-application-layout.tsx` | A | EOS register layouts |
| `apps/web/src/lib/commerce/engineering-api.ts` | A | Engineering API guard |
| `apps/web/src/lib/commerce/with-commerce-entitlement.ts` | A | Entitlement enforcement |
| `apps/web/src/lib/engineering/experience-surfaces.ts` | A | Optimization nav destination |
| `apps/web/src/lib/supabase/client.ts` | B | ERA staging public config |
| `apps/web/src/lib/supabase/public-config.ts` | B | ERA staging public config |
| `apps/web/tsconfig.json` | D | Path mapping; used by EOS + ERA tests |
| `packages/database/src/kernel-types.ts` | A | Kernel table types for jobs |
| `packages/engineering-os/src/batch-206.test.ts` | A | Engineering OS tests |
| `packages/engineering-os/src/engineering-os.test.ts` | A | Capability catalog |
| `packages/engineering-os/src/engineering-os.ts` | A | OS composition + Optimization handler |
| `packages/engineering-os/src/index.ts` | A | Public exports |
| `packages/engineering-os/src/services/health-service.ts` | A | Health |
| `packages/engineering-os/src/services/object-framework.ts` | A | Object framework |
| `packages/engineering-os/src/services/register-services.ts` | A | Register services |
| `packages/engineering-os/src/services/core-services.ts` | A | Typecheck-safe metadata JSON (A5D) |
| `packages/engineering-os/src/services/grounded-ask.ts` | A | Typecheck-safe generate meta (A5D) |
| `packages/engineering-os/src/services/technical-query-service.ts` | A | TQ accept notify union (A5D) |
| `packages/engineering-review/src/runtime-project.test.ts` | B | ERA runtime |
| `packages/engineering-review/src/runtime-project.ts` | B | ERA runtime |
| `packages/platform-commerce/src/domain/commerce-access-policy.test.ts` | A | Optimization entitlement tests |
| `packages/platform-commerce/src/domain/commerce-access-policy.ts` | A | EOS core / Optimization product mapping |
| `packages/platform-commerce/src/domain/engineering-service-policies.ts` | A | Optimization service policies |
| `packages/platform-core/src/map-auth-error.test.ts` | B | ERA login error mapping |
| `packages/platform-core/src/map-auth-error.ts` | B | ERA login error mapping |
| `packages/project-intelligence/src/documents/shared-services-binding.ts` | C | PI binding leftover |
| `packages/types/src/engineering-api-contracts.ts` | A | Engineering API contracts |
| `packages/types/src/engineering-registers.ts` | A | Register types |
| `packages/types/src/kernel.ts` | A | Kernel types |
| `packages/types/src/project-intelligence-integration.ts` | C | PI integration leftover |
| `scripts/review-staging.mjs` | B | ERA staging runner |

## Untracked Engineering OS implementation (class A)

Includes A1–A5C domain/docs/migrations/UI/API plus A5D certification files:

- `apps/web/src/app/(platform)/engineering/{changes,configuration,interfaces,optimization,requirements,systems}/**`
- `apps/web/src/app/api/engineering/{assumptions,changes,configuration,impacts,interfaces,optimization,requirements,systems}/route.ts`
- `apps/web/src/components/engineering/{change,configuration,decision,interface,optimization,requirement,system}-*.tsx`
- `docs/architecture/engineering-os/**` (A1–A5D architecture and closeouts)
- `packages/engineering-os/src/{control,decision,optimization,systems}-intelligence/**`
- `packages/engineering-os/scripts/eos-a2*` through `eos-a5c*`
- `packages/engineering-review-persistence/src/live-a2c*` through `live-a5c*`
- `supabase/migrations/20260929180000` through `20260929230000`

## Untracked ERA leftovers (class B) — do not stage

- `docs/engineering-review/security/evidence/era-7a-pnpm-audit.json`
- `packages/engineering-review/scripts/clamav-http-bridge.mjs`
- `packages/engineering-review/scripts/run-live-malware-scan.ts`
- `packages/platform-commerce/scripts/era-pilot-0e-http.ts`
- `packages/platform-commerce/scripts/era-pilot-0e-provision.ts`
- `apps/web/src/lib/supabase/public-config.test.ts` (ERA staging config)

## Checkpoint policy

Do **not** `git add .`.

Selective checkpoint may include only class **A** files after validation.

Class **B/C/D** remain dirty in the worktree until the ERA owner commits them separately.

Do not reset, clean, discard, merge, or rebase.
