# EOS 1.0.0 pilot manual action handoff

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md

Checked 2026-10-27 against production Supabase wcydlhqiqdwgoaqrlget and Vercel team silvestres-projects-96ea276a, project rtb-ai-platform. No secret values are included. Do not invite a pilot user until the deployment record says the pilot is ready.

Production migrations are already applied. Ledger count 143. Maximum version 20261027170000. Do not run supabase db push. Do not replay the approved sequence.

## 1. Point the pilot hostname at the target project

ACTION: Change only the eos-pilot DNS records at the current DNS host. Do not change the apex nameservers. Do not change the TXT values for pilot.rtbea.com.au or intranet.rtbea.com.au.
WHY_REQUIRED: eos-pilot.rtbea.com.au is now attached to silvestres-projects-96ea276a/rtb-ai-platform, project prj_3I9XPb2FHdWbnkAOSVo6a0EINjbY, and Vercel reports verified false. Public DNS still sends the hostname to the previous Vercel target, which serves commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454. This session has no DNS provider API.
SYSTEM: DNS host for rtbea.com.au. Current nameservers are ns1.syd6.hostingplatform.net.au and ns2.syd6.hostingplatform.net.au.
EXACT_SETTING: Replace the CNAME for eos-pilot.rtbea.com.au. The live target is 56a9c976bfd65e4d.vercel-dns-017.com. The target Vercel returned for this project is bde154f6774d54de.vercel-dns-016.com. Also replace only the eos-pilot TXT value on _vercel.rtbea.com.au. The current eos-pilot value is vc-domain-verify=eos-pilot.rtbea.com.au,4aa63e0ce899746a76b6. The value Vercel now requires is vc-domain-verify=eos-pilot.rtbea.com.au,883d64a793e64bd444fb.
HOW_TO_VERIFY: Vercel shows eos-pilot.rtbea.com.au verified on rtb-ai-platform. DNS CNAME for that name is bde154f6774d54de.vercel-dns-016.com. GET https://eos-pilot.rtbea.com.au/api/platform/build-identity shows a commit on cursor/era-7a-engineering-review-pilot-gate at or after afc8f3fac8ba977cd8a47761202d3128f9c9a935, not 4cf16a2f7da5bf39e133b4a32eaab8239d98b454.
RISK_IF_SKIPPED: The hostname keeps serving the non-GA revision. Invited users would not be on EOS 1.0.0.

## 2. Set production environment variables on the target project

ACTION: Add the production environment variable names on silvestres-projects-96ea276a/rtb-ai-platform. Take the Supabase URL, anon key, service role key, and commerce auth secret from the existing production secret store for wcydlhqiqdwgoaqrlget. Generate a new commerce scheduler secret. Set the app URL and graph mode as specified below. Do not copy values from the staging project rntonzigxwxcjlcsadip. Do not copy the local root .env.local file.
WHY_REQUIRED: vercel env ls production for this project returned no environment variables. The local apps/web/.env.local file identifies the production project, but it does not contain NEXT_PUBLIC_APP_URL, COMMERCE_SCHEDULER_SECRET, or PI_TEAMS_GRAPH_MODE. The staging local file must not be used to fill those gaps.
SYSTEM: Vercel project rtb-ai-platform, Production environment.
EXACT_SETTING: NEXT_PUBLIC_SUPABASE_URL for https://wcydlhqiqdwgoaqrlget.supabase.co. NEXT_PUBLIC_SUPABASE_ANON_KEY for that project. SUPABASE_SERVICE_ROLE_KEY for that project. COMMERCE_AUTH_SECRET must not be the development default. COMMERCE_SCHEDULER_SECRET must be a new production value. NEXT_PUBLIC_APP_URL is https://eos-pilot.rtbea.com.au. PI_TEAMS_GRAPH_MODE is off. Do not authorize a customer Microsoft tenant.
HOW_TO_VERIFY: vercel env ls production lists those names and no required name is missing. GET https://eos-pilot.rtbea.com.au/api/deployment/status shows graphMode unset or off after the governed deployment is the hostname. The response must not be printed if it ever contains a secret.
RISK_IF_SKIPPED: A deploy of this project cannot authenticate to production, or it could boot with Microsoft 365 live or with a staging credential.

## 3. Deploy the governed revision after DNS and environment are ready

ACTION: Deploy cursor/era-7a-engineering-review-pilot-gate at or after afc8f3fac8ba977cd8a47761202d3128f9c9a935 to rtb-ai-platform. Do not deploy 4cf16a2f7da5bf39e133b4a32eaab8239d98b454. Do not create a second production project.
WHY_REQUIRED: This session did not deploy. The hostname still serves package version 0.1.0 from branch cursor/eos-ux-1-operational-experience. The target project has no production environment, so a deploy now would not be a working EOS 1.0.0 pilot.
SYSTEM: Vercel project rtb-ai-platform.
EXACT_SETTING: Production deployment of the governed branch after actions 1 and 2. The public identity must show RTB Engineering OS, version 1.0.0, environment Controlled Production Pilot, and the deployment commit.
HOW_TO_VERIFY: GET https://eos-pilot.rtbea.com.au/api/platform/build-identity shows that commit and branch. The page identifies version 1.0.0 and the controlled production pilot environment.
RISK_IF_SKIPPED: There is no governed production pilot to invite a user into.

## 4. Enable production monitoring on the governed deployment

ACTION: Configure monitoring that records application errors, authentication failures, database failures, job failures, AI provider failures, document-processing failures, engineering-runtime failures, connector failures, and the deployment version. Do not log confidential engineering contents.
WHY_REQUIRED: The hostname returns /api/health for the non-GA revision. The target project has no monitoring credentials. This session could not enable an external monitor.
SYSTEM: The monitoring provider chosen for rtb-ai-platform. No provider credential was available in this session.
EXACT_SETTING: Alert on the nine event classes above, tagged with the deployment commit and version 1.0.0. Leave document bodies, prompts, and credentials out of the logs.
HOW_TO_VERIFY: A synthetic failed authentication and a synthetic application error appear in the monitor with the governed deployment commit, and the event payload contains no document body.
RISK_IF_SKIPPED: Pilot failures would not be visible to the operator.

## Completed in this session

Public signup is disabled on production Auth project wcydlhqiqdwgoaqrlget. A repeated uninvited signup returned signup_disabled and created no user. The temporary probe user and its tenant were removed. The signup page on the current hostname still returns HTTP 200 because that page belongs to the old revision. Account creation is rejected by Auth. No invitation email was sent.
