# EOS 1.0.0 pilot manual action handoff

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md

Checked again on 2026-10-27 after the governed production deployment. No secret values are included. Do not invite a pilot user until the deployment record says the pilot is ready.

The governed deployment dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T is Ready and reports commit da6b78fd3137f8209ae8271bd88373641e42f43c. https://eos-pilot.rtbea.com.au still resolves through 56a9c976bfd65e4d.vercel-dns-017.com and still serves commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454. Live pilot checks were not run against that old revision.

Production migrations are already applied. Ledger count 143. Maximum version 20261027170000. Do not run supabase db push. Do not replay the approved sequence.

## 1. Point the pilot hostname at the target project

ACTION: Change only the eos-pilot DNS records at the current DNS host. Do not change the apex nameservers. Do not change the TXT values for pilot.rtbea.com.au or intranet.rtbea.com.au.
WHY_REQUIRED: eos-pilot.rtbea.com.au is now attached to silvestres-projects-96ea276a/rtb-ai-platform, project prj_3I9XPb2FHdWbnkAOSVo6a0EINjbY, and Vercel reports verified false. Public DNS still sends the hostname to the previous Vercel target, which serves commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454. This session has no DNS provider API.
SYSTEM: DNS host for rtbea.com.au. Current nameservers are ns1.syd6.hostingplatform.net.au and ns2.syd6.hostingplatform.net.au.
EXACT_SETTING: Replace the CNAME for eos-pilot.rtbea.com.au. The live target is 56a9c976bfd65e4d.vercel-dns-017.com. The target Vercel returned for this project is bde154f6774d54de.vercel-dns-016.com. Also replace only the eos-pilot TXT value on _vercel.rtbea.com.au. The current eos-pilot value is vc-domain-verify=eos-pilot.rtbea.com.au,4aa63e0ce899746a76b6. The value Vercel now requires is vc-domain-verify=eos-pilot.rtbea.com.au,883d64a793e64bd444fb.
HOW_TO_VERIFY: Vercel shows eos-pilot.rtbea.com.au verified on rtb-ai-platform. DNS CNAME for that name is bde154f6774d54de.vercel-dns-016.com. GET https://eos-pilot.rtbea.com.au/api/platform/build-identity shows commit da6b78fd3137f8209ae8271bd88373641e42f43c on cursor/era-7a-engineering-review-pilot-gate, not 4cf16a2f7da5bf39e133b4a32eaab8239d98b454. GET /api/deployment/status on that hostname shows graphMode off.
RISK_IF_SKIPPED: The hostname keeps serving the non-GA revision. Invited users would not be on EOS 1.0.0.

## 2. Production environment and governed deployment

Completed for the Vercel project. The eight required production names are present. The non-secret checks match the pilot URL, graph mode off, and corepack 1. The public Supabase URL is the production project. Secret values were not recorded.

Production deployment dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T is Ready at https://rtb-ai-platform-4wkewy79q-silvestres-projects-96ea276a.vercel.app. Its build identity is commit da6b78fd3137f8209ae8271bd88373641e42f43c on cursor/era-7a-engineering-review-pilot-gate. The web package version reported by that deployment is 0.1.0. That is the apps/web package metadata, not a substitute for the hostname serving this commit. PI_TEAMS_GRAPH_MODE is off on that deployment. Do not redeploy 4cf16a2f7da5bf39e133b4a32eaab8239d98b454.

## 3. Enable production monitoring on the governed deployment

ACTION: Configure monitoring that records application errors, authentication failures, database failures, job failures, AI provider failures, document-processing failures, engineering-runtime failures, connector failures, and the deployment version. Do not log confidential engineering contents.
WHY_REQUIRED: The hostname returns /api/health for the non-GA revision. The target project has no monitoring credentials. This session could not enable an external monitor.
SYSTEM: The monitoring provider chosen for rtb-ai-platform. No provider credential was available in this session.
EXACT_SETTING: Alert on the nine event classes above, tagged with the deployment commit and version 1.0.0. Leave document bodies, prompts, and credentials out of the logs.
HOW_TO_VERIFY: A synthetic failed authentication and a synthetic application error appear in the monitor with the governed deployment commit, and the event payload contains no document body.
RISK_IF_SKIPPED: Pilot failures would not be visible to the operator.

## Completed in this session

Public signup is disabled on production Auth project wcydlhqiqdwgoaqrlget. A repeated uninvited signup returned signup_disabled and created no user. The temporary probe user and its tenant were removed. The signup page on the current hostname still returns HTTP 200 because that page belongs to the old revision. Account creation is rejected by Auth. No invitation email was sent.
