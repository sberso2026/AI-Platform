# EOS 1.0.0 pilot manual action handoff

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_MANUAL_ACTION_HANDOFF.md

These are the actions this session could not complete. No secret values are included. Do not invite users until the deployment record says the pilot is ready.

## 1. Grant Vercel access to the project that serves the pilot domain

ACTION: A team owner grants this Vercel user access to the team that owns https://eos-pilot.rtbea.com.au, then redeploy the governed branch.
WHY_REQUIRED: The CLI is authenticated only to the team Silvestre's projects. That team has a project named rtb-ai-platform, and that project does not serve eos-pilot.rtbea.com.au. The live domain returns commit 4cf16a2f7da5bf39e133b4a32eaab8239d98b454 on branch cursor/eos-ux-1-operational-experience, package version 0.1.0. The governed pilot revision is faba6d134aaa98e6289db4822ac2ce9e799e4880 on cursor/era-7a-engineering-review-pilot-gate.
SYSTEM: Vercel
EXACT_VALUE_OR_SETTING: Deploy the branch cursor/era-7a-engineering-review-pilot-gate at or after faba6d134aaa98e6289db4822ac2ce9e799e4880 to the existing production project for eos-pilot.rtbea.com.au. Do not deploy 4cf16a2f. Do not create a second production project.
HOW_TO_VERIFY: GET https://eos-pilot.rtbea.com.au/api/platform/build-identity shows that commit, or a later commit on the same branch, and the page identifies RTB Engineering OS 1.0.0 Production Pilot.
RISK_IF_SKIPPED: Invited users would use the wrong revision.

## 2. Disable public signup

ACTION: Turn off public signup on the production Auth project. Leave admin invite enabled.
WHY_REQUIRED: GET https://eos-pilot.rtbea.com.au/signup returns 200. The Supabase CLI can read the production database. It does not expose an Auth signup switch that this session could set and then verify.
SYSTEM: Supabase dashboard, project Engineering OS, ref wcydlhqiqdwgoaqrlget
EXACT_VALUE_OR_SETTING: Authentication, Providers, Email, disable Allow new users to sign up.
HOW_TO_VERIFY: An uninvited signup attempt does not create a usable account. An administrator can still send an invitation. Do not complete a real invitation in this step.
RISK_IF_SKIPPED: Anyone who can open the site can try to create an organisation.

## 3. Turn Microsoft 365 off for this informal pilot

ACTION: Set the production graph mode to off for the deployment that serves eos-pilot.rtbea.com.au.
WHY_REQUIRED: The live deployment status reports graphMode live. The production database does not have engineering_m365_connections. Informal colleagues are not authorised to connect an employer tenant. This session cannot edit the environment of the Vercel project that owns the domain.
SYSTEM: Vercel environment for that production deployment
EXACT_VALUE_OR_SETTING: PI_TEAMS_GRAPH_MODE is not live. Do not delete the connector code.
HOW_TO_VERIFY: GET https://eos-pilot.rtbea.com.au/api/deployment/status shows graphMode unset or a non-live value, and no employer tenant is connected.
RISK_IF_SKIPPED: The pilot could request enterprise Microsoft permissions without organisational authorisation.

## 4. Do not apply the 43 pending migrations until they are separately approved

ACTION: Leave production schema_migrations at 20261007190000 until a reviewed apply plan exists.
WHY_REQUIRED: 38 of the pending files change row security, 2 change data or signup behaviour, and 3 additive files depend on tables that are not in production. Recovery for that set was not accepted.
SYSTEM: Supabase project wcydlhqiqdwgoaqrlget
EXACT_VALUE_OR_SETTING: Do not run supabase db push. Do not apply 20261007120000 or 20261007140000. Those are superseded by 20261007160000, which is already applied.
HOW_TO_VERIFY: select max(version) from supabase_migrations.schema_migrations still returns 20261007190000 until an approved apply.
RISK_IF_SKIPPED: A bulk push can change production row security without a tested restore.

## 5. DNS

ACTION: None, unless the Vercel project that receives the governed deploy reports a missing domain.
WHY_REQUIRED: https://eos-pilot.rtbea.com.au already answers. This session could not read a replacement record from the owning Vercel project, so no record type, name, or target is supplied.
SYSTEM: Existing DNS
EXACT_VALUE_OR_SETTING: Do not change DNS from this handoff.
HOW_TO_VERIFY: The hostname still reaches the Vercel deployment, and the build identity matches the governed revision after action 1.
RISK_IF_SKIPPED: None, if the domain remains attached to the correct project.
