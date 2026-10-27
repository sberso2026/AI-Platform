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

## 3. Production monitoring for the controlled pilot

Operator visibility uses the existing Vercel runtime logs and deployment status for rtb-ai-platform, plus Supabase logs for the production project. The application writes an `eos-pilot` log line for authentication failures, authorization denials, kill-switch attempts, and pilot feedback results. Those lines do not include document bodies, feedback text, tokens, or credentials.

Event classes: deployment or build failure, application exception, HTTP or API failure, authentication failure, authorization denial, database connectivity failure, storage or file-processing failure, kill switch, and pilot admin.

Retention is whatever the current Vercel and Supabase project plans keep. This pilot does not add a separate SIEM. `/api/platform/pilot/status` reports the channel names and whether the kill switch is active. It does not return secret values.

## 4. Remaining live pilot limits

Direct authenticated upload to `engineering-documents` returns HTTP 400 because storage row-level security denies the insert. That bucket has no authenticated policy. The denial message is `new row violates row-level security policy`. The tenant-scoped bucket is `tenant-documents`, whose first folder must be one of the caller's tenant ids.

Engineering file ingestion is fail-closed while no hosted malware scanner is configured. Upload session, upload complete, query-image upload, and metadata extraction reject with `pilot_file_upload_disabled`. The raw `tenant-documents` storage API can still accept an authenticated object. Closing that path needs a storage policy change, and this phase does not add or run a migration.

The production kill switch remains `EOS_CONTROLLED_PILOT_ENABLED=0`. Tenant administrators receive HTTP 403 if they try to activate it. Do not leave the variable set to `0`. Do not invite a user from this document. Public signup stays disabled. `PI_TEAMS_GRAPH_MODE` stays off.

## Completed in this session

Public signup remains disabled. A repeated uninvited signup returned signup_disabled and created no user. The two synthetic validation users and their tenants were removed. No invitation email was sent.
