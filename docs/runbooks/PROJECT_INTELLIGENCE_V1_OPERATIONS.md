# Project Intelligence V1.0 — Operations Runbook

## Deployment
1. Deploy apps/web + workers on Node 22.
2. Confirm `PROJECT_INTELLIGENCE_VERSION=1.0.0` via `/api/engineering/project-intelligence/health`.
3. Confirm About surface `/engineering/apps/project-intelligence/about`.

## Migrations
Apply PI migrations through batch_42 in order on hosted staging before release.  
Verify tables: findings, knowledge_nodes/edges, document/meeting runtime tables.

## Workers / jobs
Document and meeting workers use durable outbox + SKIP LOCKED. Restart workers on stuck leases; inspect dead letters.

## Provider outage
Document parsers / OCR / embeddings: degrade with abstention; no private fallback clients.  
Teams live remains deferred — V1 operable without it.

## Entitlement / RLS incidents
Confirm seat + workspace assignment; review commerce decision and RLS policies. Prefer revoke/repair over service-role bypass.

## Secret rotation
Rotate provider and Supabase keys via Platform secrets; re-run ci-preflight and secret-scan.
