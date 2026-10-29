# EOS 1.0.0 pilot admin runbook

Path: docs/architecture/engineering-os/EOS_1_0_0_PILOT_ADMIN_RUNBOOK.md

Use this runbook only after the deployment record says the v1.0.0 production pilot is ready. Until then, do not invite users and do not point them at the current hostname, which serves a different revision.

Platform administration is not engineering approval.

Create an organisation as a tenant and workspace through the existing administration path. Keep RTB internal work in its own workspace. Put each invited organisation in its own workspace. Do not share one workspace across organisations.

Invite a user from the users administration page. Assign owner, admin, member, or viewer. Do not invent a signatory role. Reviewer language in the product is not a qualified engineering appointment.

Remove a user by revoking membership. Suspend one organisation by suspending that commerce installation or workspace. Do not suspend every tenant to affect one organisation unless the single-workspace control is unavailable, in which case use the global kill switch and say so.

Kill switch: set EOS_CONTROLLED_PILOT_ENABLED=0 and restart the serving process, or suspend the engineering-os commerce installation. Confirm /login no longer starts pilot work. Do not test the switch by taking an unrelated production revision offline.

Health: GET /api/health must return 200 and must not contain secrets or file bodies. Admin diagnostics may show the git revision. Ordinary pages should show RTB Engineering OS, version 1.0.0, environment Production Pilot, after the GA revision is actually deployed. That label is not on the revision that was live during this phase.

Incidents follow docs/security/RTB_UNIFIED_INCIDENT_RESPONSE.md. Stop the affected workspace or the whole pilot for cross-tenant leakage, credential compromise, a canonical security-suite failure, a material incorrect engineering result that can propagate, a broken engineering-authority boundary, or unrecoverable data corruption.

Feedback is reviewed inside the reporting workspace only. Do not copy another tenant's documents into the review.

Terminate the pilot by disabling invitations, suspending workspaces, and applying the kill switch. Retention and deletion follow the existing backup and privacy records. This runbook does not invent a retention period. Export only what the data notice allows, then remove memberships. Database restore remains an isolated provider restore, not an automatic rollback.

Pending production migrations stay unapplied until the migration guard classifies them. Do not bulk-push staging SQL onto wcydlhqiqdwgoaqrlget.
