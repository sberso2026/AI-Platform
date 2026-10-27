# EOS 1.0.0 pilot manual action handoff

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md

Checked again on 2026-10-27 after the governed production deployment. No secret values are included. Do not invite a pilot user until the deployment record says the pilot is ready.

Authoritative DNS for eos-pilot.rtbea.com.au now CNAMEs to bde154f6774d54de.vercel-dns-016.com. Vercel reports the domain verified and configured correctly on rtb-ai-platform. A request to that current address returns deployment dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T, commit da6b78fd3137f8209ae8271bd88373641e42f43c, and graphMode off. The pilot is still not ready to invite a user.

Production migrations are already applied. Ledger count 143. Maximum version 20261027170000. Do not run supabase db push. Do not replay the approved sequence.

## 1. DNS cutover

Completed. Do not change the apex nameservers. Do not change the TXT values for pilot.rtbea.com.au or intranet.rtbea.com.au. The eos-pilot CNAME and the eos-pilot verification TXT now match the current Vercel project.

## 2. Production environment and governed deployment

Completed for the Vercel project. The eight required production names are present. The non-secret checks match the pilot URL, graph mode off, and corepack 1. The public Supabase URL is the production project. Secret values were not recorded.

Production deployment dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T is Ready at https://rtb-ai-platform-4wkewy79q-silvestres-projects-96ea276a.vercel.app. Its build identity is commit da6b78fd3137f8209ae8271bd88373641e42f43c on cursor/era-7a-engineering-review-pilot-gate. The web package version reported by that deployment is 0.1.0. That is the apps/web package metadata, not a substitute for the hostname serving this commit. PI_TEAMS_GRAPH_MODE is off on that deployment. Do not redeploy 4cf16a2f7da5bf39e133b4a32eaab8239d98b454.

## 3. Enable production monitoring on the governed deployment

ACTION: Configure monitoring that records application errors, authentication failures, database failures, job failures, AI provider failures, document-processing failures, engineering-runtime failures, connector failures, and the deployment version. Do not log confidential engineering contents.
WHY_REQUIRED: The governed hostname returns /api/health. The production project has no monitoring-provider credentials. This session could not enable an external monitor.
SYSTEM: The monitoring provider chosen for rtb-ai-platform. No provider credential was available in this session.
EXACT_SETTING: Alert on the nine event classes above, tagged with the deployment commit and version 1.0.0. Leave document bodies, prompts, and credentials out of the logs.
HOW_TO_VERIFY: A synthetic failed authentication and a synthetic application error appear in the monitor with the governed deployment commit, and the event payload contains no document body.
RISK_IF_SKIPPED: Pilot failures would not be visible to the operator.

## 4. Finish the live pilot gates before invitation

ACTION: Prove authorized synthetic storage and file-security behavior, show the pilot data notice and engineering-authority notice on the user-facing pilot, verify the kill switch without leaving it active, and keep monitoring from action 3. Do not invite a user before those gates pass.
WHY_REQUIRED: Two synthetic users could read and update only their own workspace, and cross-workspace reads and updates returned no rows. Direct storage calls for a synthetic text object returned HTTP 400, so the authorized file path was not proven. The login and signup pages do not show the data notice or the authority notice. The kill switch was not activated.
SYSTEM: The governed production deployment dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T.
EXACT_SETTING: Keep PI_TEAMS_GRAPH_MODE off and public signup disabled. Do not weaken storage or RLS controls.
HOW_TO_VERIFY: An authorized synthetic upload and same-workspace retrieval succeed, a cross-workspace retrieval is denied, the notices are visible before upload, and the kill switch can be turned on and back off with an audit event.
RISK_IF_SKIPPED: A pilot user could be invited before file handling and the authority boundary are demonstrated.

## Completed in this session

Public signup remains disabled. A repeated uninvited signup returned signup_disabled and created no user. The two synthetic validation users and their tenants were removed. No invitation email was sent.
