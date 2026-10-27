# EOS 1.0.0 controlled production pilot deployment

Path: docs/architecture/engineering-os/EOS_1_0_0_CONTROLLED_PRODUCTION_PILOT_DEPLOYMENT.md

## Decision

CONTROLLED_PRODUCTION_PILOT_READY: NO
PRODUCTION_PILOT_URL: NOT_DEPLOYED
EOS_GA remains YES. This record does not make a new GA declaration.

The governed release was not deployed. An existing host is reachable, and it is a different revision. That host is not this pilot.

## GA baseline

EOS_GA_RELEASE_VERSION: 1.0.0
GA_RELEASE_COMMIT: 407f5a32b0c1651d28e79cb23442da509d5de956
POST_GA_OPERATIONS_BASELINE_COMMIT: cd9480a81f0ac26a2b8dfd6da3adc916505315bf
GA_BASELINE_FINGERPRINT: sha256:827f54e1f1327fb8f17dc4e7391ea827062eaebb9e033ea69b6f3d56706c5d70

No calculation formula, D1F blob, or C7 fingerprint was changed.

## Environment architecture

DEVELOPMENT_ENVIRONMENT: local repository. Not a hosted project. Root .env.local points at staging Supabase rntonzigxwxcjlcsadip. apps/web/.env.local points at production Supabase wcydlhqiqdwgoaqrlget. The service-role values in those two files are different. Neither file is committed.

STAGING_ENVIRONMENT: Supabase project RTB AI Platform Staging, rntonzigxwxcjlcsadip. Staging hostname staging-eos.rtbea.com.au did not resolve in this phase. No staging web deploy was verified.

PRODUCTION_ENVIRONMENT: Supabase project Engineering OS, wcydlhqiqdwgoaqrlget, documented in docs/release/migration-manifest.json. Hosting project documented as Vercel team rtbea, project rtb-ai-platform, region syd1, root apps/web.

PRODUCTION_AND_STAGING_SEPARATE: YES. The project refs differ. This phase did not delete, reset, or clone either database.

## What is live today

On 2026-10-27 these public checks succeeded against https://eos-pilot.rtbea.com.au:

- GET /api/health returned 200, service rtb-ai-os, version 0.1.0, phase platform-core.
- GET /api/deployment/status returned 200, vercelEnv production, Supabase URL and service role present, Teams graph mode live.
- GET /api/platform/build-identity returned commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454, branch cursor/eos-ux-1-operational-experience, packageVersion 0.1.0.
- GET /signup and GET /login returned 200.
- GET /robots.txt returned the application HTML, not a robots policy.
- staging-eos.rtbea.com.au was unavailable.

That live revision is not the GA commit and not the post-GA operations commit. PRODUCTION_PILOT_URL for v1.0.0 is therefore NOT_DEPLOYED. The existing hostname is not claimed as this release.

## Hosting and domain

PRODUCTION_HOSTING_PROJECT: rtb-ai-platform, from docs/deployment/vercel-env-audit.md and docs/operations/AI_PLATFORM_PRODUCTION_DEPLOYMENT.md.
PRODUCTION_DOMAIN: eos-pilot.rtbea.com.au is already serving the other revision. DNS was not modified.
STAGING_DOMAIN: not configured. staging-eos.rtbea.com.au was not created.
Vercel CLI 60.0.1 is installed and returned a team-access denial. This phase did not deploy.

DOMAIN_CONFIGURATION_STATUS for a new name: not required for the existing hostname. A separate staging name remains MANUAL_EXTERNAL_ACTION_REQUIRED if a staging web host is wanted. No DNS record was invented.

## Auth

The GA branch still has a self-service signup page at apps/web/src/app/(auth)/signup/page.tsx. The live host also serves /signup. PUBLIC_SIGNUP_DISABLED: NO. INVITE_ONLY_ACCESS: NO. UNINVITED_USER_CAN_CREATE_ACCOUNT: NOT_DENIED.

An invitation path exists in the users administration page for an authenticated admin. It was not exercised against production.

Supabase Auth public-signup disablement is a dashboard setting. It was not changed.

ADMIN_MFA_STATUS: privileged roles owner, platform_admin, security_admin, and production_support_privileged fail closed without AAL2 in packages/engineering-os/src/security-closure/privileged-mfa.ts. Source: that module and docs/security/RTB_PRIVILEGED_MFA_AND_BREAK_GLASS.md. Live admin AAL2 was not retested.
PILOT_USER_MFA_STATUS: not a separate forced policy for ordinary members. The controlled-pilot runbook requires authenticator TOTP for named pilot users on staging. That staging proof was not repeated here, and MFA was not weakened.

## Workspaces, roles, isolation

Tenant and workspace records are the existing model. Roles in the users page are owner, admin, member, and viewer. This phase did not add PILOT_ADMIN, ENGINEER, REVIEWER, or VIEWER roles. Reviewer does not mean a qualified signatory. Platform admin is not an engineering approver.

Pilot organisation rows were not created. CROSS_WORKSPACE_DATA_ACCESS was not retested with live user pairs. Repository RLS guard tests passed in this phase. PRODUCTION_RLS_VALIDATION: NOT_RUN_LIVE. STORAGE tenant isolation was not retested with live uploads.

## Secrets

SECRETS_HARDCODED: NO. PRODUCTION_SECRETS_COMMITTED_TO_REPOSITORY: NO. Secret scan PASS, 623 files, 0 findings.
DEVELOPMENT_PRODUCTION_SECRET_REUSE: NO for the compared local service-role values. Staging and production hosts differ. Vercel-stored values were not read.

Required names, without values: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Commerce and connector names are in .env.example and docs/operations/AI_PLATFORM_PRODUCTION_DEPLOYMENT.md. The live deployment status shows Supabase public and service values present, and Teams client credential present. Graph mode on that host is live. For an informal colleague pilot, Microsoft 365 stays DISABLED until that organisation authorizes it. This phase did not change the live connector.

## Migrations

Production ledger head in docs/release/migration-manifest.json, captured 2026-10-07: 20261007190000. Ledger length 102.
Repository SQL files: 151. Staging-only or production-ineligible overrides: 22. Repository migrations absent from the production ledger and not in that override set: 43.
REQUIRED_GA_SCHEMA_VERSION: not separately pinned by the GA decision.
PENDING_PRODUCTION_MIGRATION_COUNT: 43 unclassified relative to the production ledger.
PRODUCTION_MIGRATION_STATUS: NOT_APPLIED.

No migration was applied, skipped, or rewritten. Destructive classification of those 43 was not completed. An irreversible migration is not an automatic safe rollback. They must not be bulk-pushed.

## Backup

PRODUCTION_BACKUP_STATUS: provider backup documented. Fixture restore certification is recorded as passed in docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md. It was not retested in this phase.
PRODUCTION_RESTORE_PATH: isolated provider restore, then migration-lineage and tenant-boundary checks. Release-governance commands do not roll back a database.
PITR_AVAILABLE: not claimed.
RPO_STATUS: DEFINED_NOT_TESTED
RTO_STATUS: MEASURED on a fixture or isolated restore, not an enterprise SLA.

## Monitoring, kill switch, audit, feedback

The non-GA host returns /api/health. That is not monitoring of a v1.0.0 deployment.
PILOT_KILL_SWITCH_AVAILABLE: YES in repository code, EOS_CONTROLLED_PILOT_ENABLED=0, plus commerce installation suspend. It was not flipped on the live host.
SINGLE_WORKSPACE_SUSPENSION_SUPPORTED: commerce installation suspend is tenant-scoped in the pilot runbook. A live suspend was not executed.
PILOT_AUDITABILITY: existing audit events and admin invite records. Not retested live.
PILOT_FEEDBACK_CAPTURE_AVAILABLE: PARTIAL. Ask Engineering already records useful and not useful. The full pilot category set, bound to release 1.0.0, is not a deployed capture path.
PILOT_USAGE_ANALYTICS_AVAILABLE: NO new pilot analytics were added. System health only. No confidential prompt logging was added.

Pilot scorecard, with no numeric targets because none are approved: time saved, source traceability, result usefulness, technical-correctness feedback, workflow completion, user return rate, critical defect count, major defect count, and adoption intent. PILOT_SUCCESS_SCORECARD_DEFINED: YES.

Stop the pilot or the affected capability for cross-tenant leakage, credential compromise, a critical security regression, a material incorrect engineering result with uncontrolled propagation, loss of the engineering-authority boundary, unrecoverable production data corruption, or a GA security-gate failure. PILOT_STOP_CONDITIONS_DEFINED: YES.

## Smoke test

PRODUCTION_SMOKE_TEST: NOT_RUN for v1.0.0. The checks above describe the other revision only. Invitation, cross-workspace denial, upload, review, feedback, logout, suspension, and a 1.0.0 version label were not demonstrated on a GA deployment.

## Security and release gates this phase

Engineering-review tests: 164 passed, 1 skipped. Persistence unit tests: 34 passed. Secret scan PASS. Dependency audit critical 0, high 0, moderate 1. Release-governance tests 220 passed, typecheck PASS, ledger-only ok true.

## External actions remaining

Vercel production deployment of this governed branch: BLOCKED_BY_CREDENTIALS.
Supabase Auth disable public signup on wcydlhqiqdwgoaqrlget: MANUAL_ACTION_REQUIRED.
Classify and, only if the migration guard passes, promote the pending production migrations: MANUAL_ACTION_REQUIRED. Do not bulk-push.
Set Teams and Microsoft 365 to disabled for an informal colleague pilot: MANUAL_ACTION_REQUIRED on the current host, which currently reports graph mode live.
Confirm production AI provider key and fail-safe mode on the GA deployment: MANUAL_ACTION_REQUIRED.
Live two-workspace RLS and storage checks: MANUAL_ACTION_REQUIRED after deploy.
DNS for eos-pilot.rtbea.com.au: ALREADY_CONFIGURED for the current host. No change was made.
Staging hostname: NOT_REQUIRED for this decision.
Email provider and monitoring vendor beyond /api/health: NOT_VERIFIED.

FIRST_PILOT_USER_CAN_BE_INVITED: NO until the GA revision is the deployed revision, public signup is disabled, and an admin invitation is verified.
INITIAL_PILOT_USER_TARGET: 5_TO_10, a planning target only.
