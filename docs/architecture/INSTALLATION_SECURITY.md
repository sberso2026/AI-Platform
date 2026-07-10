# Installation Security

## RLS

Batch 32 RLS policies on installation tables:

- Tenant members: SELECT own tenant data
- Owner/admin/commerce-admin: mutations on requests and workspace assignments
- Service role: provisioning orchestration (audited at application layer)
- Cross-tenant reads and writes denied

## HTTP guards

All installation mutation routes use `requireInstallationAdmin` + commerce entitlement guards.

## Event immutability

`commercial_installation_events` has an immutability trigger preventing UPDATE/DELETE.

## Real-JWT certification

Phase 3 certification uses real Supabase users and JWTs — zero skipped required RLS tests in certification mode.
