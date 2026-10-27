# EOS 1.0.0 pilot manual action handoff

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md

Checked again on 2026-10-27 after the controlled-pilot storage close. No secret values are included. Do not invite a pilot user from this document. This phase does not declare the pilot ready.

Authoritative DNS for eos-pilot.rtbea.com.au CNAMEs to bde154f6774d54de.vercel-dns-016.com. Confirm the live deployment id and commit from `/api/platform/build-identity` on that domain. Do not treat `dpl_HQJCcTcuN1zKyJgJr1TVxtjk3L9T` or commit `da6b78fd3137f8209ae8271bd88373641e42f43c` as the current production revision.

Production ledger count is 144. Maximum version is `20261027233000`. That migration closes authenticated writes to `tenant-documents` and `engineering-documents`. Do not run supabase db push. Do not replay earlier migrations. Rollback SQL is in `EOS_1_0_0_PILOT_STORAGE_WRITE_CLOSE_ROLLBACK.md` and must not be applied while the pilot upload path stays closed.

## 1. DNS cutover

Completed. Do not change the apex nameservers. Do not change the TXT values for pilot.rtbea.com.au or intranet.rtbea.com.au. The eos-pilot CNAME and the eos-pilot verification TXT now match the current Vercel project.

## 2. Production environment and governed deployment

The production project keeps the existing environment names. The non-secret checks remain the pilot URL, graph mode off, and corepack 1. Secret values are not recorded here. `EOS_CONTROLLED_PILOT_ENABLED` must not be left at `0`. The web package version 0.1.0 is apps/web metadata. PI_TEAMS_GRAPH_MODE stays off. Do not redeploy `4cf16a2f7da5bf39e133b4a32eaab8239d98b454`.

## 3. Production monitoring for the controlled pilot

Operator visibility uses the existing Vercel runtime logs and deployment status for rtb-ai-platform, plus Supabase logs for the production project. The application writes an `eos-pilot` log line for authentication failures, authorization denials, kill-switch attempts, and pilot feedback results. Those lines do not include document bodies, feedback text, tokens, or credentials.

Event classes: deployment or build failure, application exception, HTTP or API failure, authentication failure, authorization denial, database connectivity failure, storage or file-processing failure, kill switch, and pilot admin.

Retention is whatever the current Vercel and Supabase project plans keep. This pilot does not add a separate SIEM. `/api/platform/pilot/status` reports the channel names and whether the kill switch is active. It does not return secret values.

## 4. Remaining live pilot limits

Authenticated insert, update, and delete on `tenant-documents` and `engineering-documents` are denied by storage policy. `tenant_documents_select` remains tenant-folder scoped. Service-role storage access stays server-only. Application upload routes return `pilot_file_upload_disabled`. File upload is outside this pilot, so malware scanning is not a pilot pass.

The production kill switch is `EOS_CONTROLLED_PILOT_ENABLED=0`, applied by an operator deployment. Tenant administrators receive HTTP 403 if they try to activate or restore it. Do not leave the variable set to `0`. Do not invite a user from this document. Public signup stays disabled. `PI_TEAMS_GRAPH_MODE` stays off. A tenant administrator can list members, suspend or restore another member of the same tenant, and read pilot audit and feedback rows. That role is not an engineering reviewer, validator, approver, or certifier.

## Completed in this session

Public signup remains disabled. A repeated uninvited signup returned signup_disabled and created no user. The two synthetic validation users and their tenants were removed. No invitation email was sent.
