# EOS Controlled Pilot Runbook (PROFILE A)

Target: STAGING / NON-PRODUCTION only. READY_FOR_PRODUCTION = NO.

## Profile

PROFILE A — Core EOS Pilot. Workbench, My Engineering Day, work plans, information, templates, DOCX/XLSX/PPTX generation, Office handoff, Pre-Issue Review, Change/Impact, EOS-local RFI/TQ, Digital Thread, human Decisions, handover context.

## Approved users

- `cert-er-a1@rtb-cert.test` (engineer)
- `cert-er-a-admin@rtb-cert.test` (engineering admin)

Do not enable EOS for all users. Access must stay intentional and auditable.

## Approved tenant / workspaces

Reuse the existing certification tenant/workspace fixtures. Do not broaden to production tenants.

## Login / AAL2

1. Open the current staging web process (not a stale server).
2. Sign in as a named pilot user.
3. Complete the authenticator TOTP challenge in the browser.
4. Do not share TOTP, print authenticator secrets, inject cookies, or disable MFA.

Until HUMAN_AAL2_GATE = PASS, the controlled pilot is not open. Continuation 2026-10-01: current HEAD `f7ee6330` on localhost:3002; password sign-in as `cert-er-a1@rtb-cert.test` reached `/login/mfa?next=/engineering/work` with AAL1 shown. Operator TOTP was not completed in the browser. Do not paste TOTP into chat.

## A15A demonstration vs pilot

A15A certified a synthetic Crusher Support end-to-end demonstrator. DEMONSTRATOR_READY does not make CONTROLLED_PILOT_READY = YES. Do not present the demonstrator as a live engineering pilot.

## Pilot Gate Closeout (2026-10-01)

See `EOS_PILOT_GATE_CLOSEOUT.md`. Remaining Profile A blockers:

1. HUMAN_AAL2_GATE BLOCKED
2. AUTHENTICATED_BROWSER_HITL NOT_TESTED
3. MULTI_PROJECT_BROWSER_HITL NOT_TESTED
4. LIFECYCLE_BROWSER_HITL NOT_TESTED
5. HOSTED_MALWARE_SCANNER BLOCKED (`RTB_REVIEW_CLAMAV_URL` unset; localhost is not hosted)
6. RETURNED_ARTIFACT_PILOT BLOCKED

DEPENDENCY_POLICY_GATE = PASS (continuation). Bounded production overrides: nanoid, brace-expansion 1.1.21, postcss, image-size >=2.0.3, sharp >=0.35.4. SCA gate ignores expired exceptions. RAW audit may still FAIL on the remaining uuid moderate.

Recommended next: EOS Pilot Gate Closeout continuation — not A15B. Complete operator TOTP in the unlocked MFA browser, then hosted ClamAV.

See `EOS_A15A_END_TO_END_ENGINEERING_DEMONSTRATOR.md` and `EOS_A15A_DEMONSTRATION_RUNBOOK.md`.

## Malware / returned uploads (A14B recheck)

HOSTED_MALWARE_SCANNER remains BLOCKED unless `RTB_REVIEW_CLAMAV_URL` points at a reachable hosted scanner. Unit CLEAN/EICAR/fail-closed tests are architecture evidence only. Returned binary uploads stay prohibited.

## Dependency state (A14B recheck)

Raw production audit must be rerun each phase. Expired SCA exceptions (`review_by: 2026-09-30`) were not auto-renewed. DEPENDENCY_POLICY_GATE = PASS after continuation overrides (critical 0, high 0). RAW_DEPENDENCY_AUDIT remains FAIL while uuid@8.3.2 moderate (GHSA-w5hq-g745-h8pq via exceljs) is present.

## Backup / restore (A14B)

Provider backups: Supabase staging. PITR not claimed. Logical metadata restore rehearsal exists for disposable generated-artifact rows. Object-storage recovery is consistency/orphan/legacy-recreate, not a full region failover. See `EOS_DISASTER_RECOVERY_RUNBOOK.md`.

## Monitoring

System health only: application, database, object storage, malware scanner, jobs. Optional PROFILE A connectors are NOT_APPLICABLE and must not be treated as unhealthy blockers. Do not alert on engineer activity.

## Support / incident

1. Capture correlation/request/job id (not file bodies).
2. Stop the affected workflow.
3. If stop conditions hit (cross-tenant exposure, malware ingestion, integrity failure, AAL2 bypass, unapproved automation), disable the kill switch.
4. Restore per the DR runbook.
5. Verify RLS and authorized download.
6. Named engineering admin approves resume.

## Pilot restrictions

Non-production; named cert users only; Profile A workflows only; no solver; no EXAMPLE_ONLY calculation for design acceptance; no unapproved connectors; no returned uploads until hosted malware PASS; human approval mandatory.

## Allowed workflows

Design report / specification / technical memorandum preparation, Option Study without an autonomous winner, RFI/TQ response from EOS-local governed context, Impact Assessment, Pre-Issue Review, handover preparation, handling of existing engineer-authored calculation artifacts, EOS-generated Office drafts using company official or EOS Professional Default templates.

## Prohibited workflows

- EXAMPLE_ONLY EOS calculation definitions for real design acceptance
- Real solver execution (SPACE GASS and others)
- Live SharePoint / Aconex / ACC / P6
- PDF export
- Returned binary uploads and direct company-template upload until hosted malware PASS
- Personal OneDrive/email/file capture
- Employee productivity scoring or usage monitoring

## Artifact limits (pilot configuration, not universal EOS)

- Generated artifact: 25 MiB
- Returned upload: 15 MiB (when re-enabled)
- Template: 10 MiB
- Malware scan timeout: 8 s
- Signed URL lifetime: 300 s

## Malware behavior

Returned/user-supplied files fail closed unless a hosted ClamAV-compatible scanner returns CLEAN. Infected (including EICAR), unavailable, timeout, and scan-failed results are rejected and are not published as governed artifacts. EOS-generated bytes follow the trusted generation boundary plus OpenXML/integrity validation.

## Kill switch

1. Suspend the `engineering-os` commerce installation for the tenant, and/or
2. Set `EOS_CONTROLLED_PILOT_ENABLED=0` and restart the staging process.

No new kill-switch infrastructure.

## Backup / recovery contact

Use the staging Supabase project `rntonzigxwxcjlcsadip` operator process. Record a PITR/backup marker before any later pointer purge (not authorized in A14A). Object-storage recovery rehearsal is A14B.

## Incident response / how to stop the pilot

Disable the kill switch, revoke named-user sessions, and stop the staging web process. Preserve audit rows; do not purge `content_base64`.

## Engineering workflow feedback

Collect workflow feedback from named pilot users about Workbench, templates, generation, review, and impact. Do not collect keystrokes, screen captures, application-usage duration, browser history, personal email, or ranking/productivity scores.
