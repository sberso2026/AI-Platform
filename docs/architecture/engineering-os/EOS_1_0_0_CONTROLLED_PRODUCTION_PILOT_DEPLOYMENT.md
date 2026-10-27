# EOS 1.0.0 controlled production pilot deployment

Path: docs/architecture/engineering-os/EOS_1_0_0_CONTROLLED_PRODUCTION_PILOT_DEPLOYMENT.md

## Decision

CONTROLLED_PRODUCTION_PILOT_READY: NO
FIRST_PILOT_USER_CAN_BE_INVITED: NO
PRODUCTION_PILOT_URL: the hostname answers, but it is not the governed 1.0.0 revision.
EOS_GA remains YES. EOS_GA_RELEASE_VERSION remains 1.0.0. This record does not make a new GA declaration.

No calculation formula, D1F blob, or C7 fingerprint was changed. Engineering runtime was not changed.

## Database

Production Supabase wcydlhqiqdwgoaqrlget was not migrated in this phase. A read-only ledger check returned migration_count 143 and max_version 20261027170000. PRODUCTION_DATABASE_GA_READY remains YES from the controlled execution record. Staging remains rntonzigxwxcjlcsadip. The repository supabase/.temp/project-ref is still the staging ref.

## Vercel access

Vercel CLI 60.0.1 is authenticated as sberso-4483. The active team is Silvestre's projects, silvestres-projects-96ea276a. Project rtb-ai-platform is accessible. Project id prj_3I9XPb2FHdWbnkAOSVo6a0EINjbY. The local link is silvestres-projects-96ea276a/rtb-ai-platform. Root directory is apps/web. Region is iad1.

## Domain

eos-pilot.rtbea.com.au was recognized and added to rtb-ai-platform. Vercel reports verified false, with a pending TXT challenge. The domain config conflicts list was empty. The alias conflict that previously blocked attachment is not present now.

Public DNS still uses CNAME 56a9c976bfd65e4d.vercel-dns-017.com, which resolves to 216.198.79.1 and 64.29.17.1. Vercel now recommends CNAME bde154f6774d54de.vercel-dns-016.com for this project. The current nameservers are ns1.syd6.hostingplatform.net.au and ns2.syd6.hostingplatform.net.au. They were not changed. No unrelated subdomain was changed. DNS automation was not available.

The existing TXT at _vercel.rtbea.com.au contains an older eos-pilot verification token, plus tokens for pilot.rtbea.com.au and intranet.rtbea.com.au. Only the eos-pilot token needs to be replaced. The required token is recorded in the manual handoff. DNS_VALID: NO.

## What the hostname serves

These checks were made against https://eos-pilot.rtbea.com.au on 2026-10-27:

- GET /api/platform/build-identity returned 200, commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454, branch cursor/eos-ux-1-operational-experience, packageVersion 0.1.0, buildTimestamp 2026-10-27T10:45:40.033Z.
- GET /api/deployment/status returned 200, vercelEnv production, graphMode live.
- GET /signup returned 200.
- HTTPS succeeded. That TLS result belongs to the revision above, not to a governed 1.0.0 deployment.

No governed deployment was created. VERCEL_DEPLOYMENT_SUCCESS: NO. DEPLOYED_RELEASE_PROVENANCE_VERIFIED: NO. DEPLOYED_VERSION_IDENTIFIABLE: NO. The historical revision 4cf16a2f7da5bf39e133b4a32eaab8239d98b454 was not deployed again.

## Environment

vercel env ls production for rtb-ai-platform returned no environment variables. Required names that are absent: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL, SUPABASE_SERVICE_ROLE_KEY, COMMERCE_AUTH_SECRET, COMMERCE_SCHEDULER_SECRET, PI_TEAMS_GRAPH_MODE. No configured value was available to mark invalid. PRODUCTION_ENVIRONMENT_VARIABLES_COMPLETE: NO.

The local apps/web/.env.local file points at the production project and does not contain the app URL, the scheduler secret, or the graph mode. The repository root .env.local file points at staging. Staging values were not copied.

## Access control

Production Auth disable_signup was changed from false to true and a second read returned true. An uninvited signup to the production Auth endpoint then returned HTTP 422, error code signup_disabled, message "Signups not allowed for this instance". A following user count for the probe address was 0. PUBLIC_SIGNUP_DISABLED: YES. UNINVITED_USER_CAN_CREATE_ACCOUNT: NO.

The first signup attempt, made immediately after the setting change, created one synthetic user and one owned tenant before the Auth service had applied the setting. That user, profile, memberships, workspace, roles, identities, and tenant were deleted in the same session. A later count of rehearsal.invalid users was 0.

An admin invite call with an invalid email returned HTTP 400 validation_failed, not signup_disabled. No invitation was sent. INVITE_ONLY_ACCESS: YES at the Auth service. The application invite workflow was not exercised on a governed deployment.

The only enabled external Auth provider reported was email. No customer Microsoft tenant was authorized.

## Microsoft 365

The hostname that users can open still reports graphMode live. The target project has no PI_TEAMS_GRAPH_MODE value because it has no environment. M365_DISABLED_FOR_INFORMAL_PILOT: NO. Connector code was not deleted.

## Live pilot checks

These were not run against a governed deployment, because the hostname is still the other revision and the target project has no production environment:

- synthetic workspaces PILOT_TEST_WORKSPACE_A and PILOT_TEST_WORKSPACE_B
- deployed-application RLS and storage isolation
- upload and fail-closed malware behavior
- admin create, invite, revoke, role assignment, user suspend, and workspace suspend
- kill-switch rehearsal on the serving process
- monitoring delivery
- audit events for invitation, role change, workspace creation, upload, admin action, and security event
- the full feedback set
- the production data notice and engineering-authority notice on the governed revision
- the production smoke matrix

PILOT_WORKSPACE_MODEL_READY: NO
LIVE_PRODUCTION_RLS_VALIDATION: NOT_RUN
LIVE_CROSS_WORKSPACE_DATA_LEAK_COUNT: NOT_RUN
LIVE_STORAGE_ISOLATION: NOT_RUN
FILE_SECURITY_GATE_STATUS: NOT_RUN
MALWARE_SCAN_STATUS: NOT_RUN. Hosted scanning was not available to verify. The repository policy remains fail-closed when a hosted scanner is absent. That policy was not weakened.
PILOT_ADMIN_CAPABILITY_READY: NO
PILOT_KILL_SWITCH_AVAILABLE: YES in repository code, through EOS_CONTROLLED_PILOT_ENABLED=0 and commerce installation suspend.
PILOT_KILL_SWITCH_VERIFIED: NO. The switch was not flipped on the live hostname.
PRODUCTION_MONITORING_ACTIVE: NO
PILOT_AUDITABILITY: NOT_RUN
PILOT_FEEDBACK_CAPTURE_AVAILABLE: NO. The governed source records useful and not useful in Ask Engineering. The full pilot category set is not a deployed capture path.
PILOT_DATA_POLICY_ACTIVE: NO on the serving hostname. The repository notice remains the controlled-pilot notice and still says not to upload confidential employer or client data unless authorized.
ENGINEERING_AUTHORITY_NOTICE_ACTIVE: NO on the governed production deployment. Source pages state that readiness and assurance text are not engineering approval. That was not demonstrated on a 1.0.0 deployment.
PRODUCTION_SMOKE_TEST: NOT_RUN

## Security and release gates

These are repository gates. They are not live deployment validation.

Persistence unit tests: 37 passed, 1 skipped. The skipped test is the live rehearsal test, and EOS_REHEARSAL_DATABASE_URL was unset. Engineering-review tests: 164 passed, 1 skipped. GA security closure: 7 passed. Secret scan: PASS, 624 files, 0 findings. Dependency audit: critical 0, high 0, moderate 1. Release-governance tests: 220 passed, including artifact classification. Release-governance typecheck: PASS. Ledger-only: ok true.

CANONICAL_SECURITY_SUITE_STATUS: PASS
GA_SECURITY_GATE: PASS
RLS_REGRESSION_GATE: PASS
TENANT_ISOLATION_GATE: PASS
SECRET_SCAN: PASS
DEPENDENCY_AUDIT: PASS
NEW_SECURITY_REGRESSION: NO
RELEASE_GOVERNANCE_TESTS: PASS
RELEASE_GOVERNANCE_TEST_COUNT: 220
RELEASE_GOVERNANCE_TYPECHECK: PASS
RELEASE_LEDGER_INTEGRITY: PASS
RELEASE_ARTIFACT_CONSISTENCY: PASS
SECURITY_RELEASE_REGRESSION_GATE: PASS

## Result

The pilot stays closed. The unresolved operator actions are in docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md. The next phase does not start until DNS, production environment, a governed deployment, and the live isolation, monitoring, audit, and smoke gates pass.
