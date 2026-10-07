# RTB-REL-1B — residual signup commercial DEFINER grant defect

**Date:** 2026-10-07  
**Environment:** production Engineering OS `wcydlhqiqdwgoaqrlget`  
**Inspection:** read-only  
**Applied to production:** NO

## Finding

`public.provision_signup_commercial_defaults(uuid, uuid)` is `SECURITY DEFINER`, owned by `postgres`, with `search_path=public` only. Catalog ACLs grant `EXECUTE` to `PUBLIC`, `anon`, `authenticated`, `service_role`, and `postgres`.

The function writes `commercial_subscriptions`, `commercial_licenses`, `commercial_seats`, `commercial_seat_assignments`, and `commercial_installations` for caller-supplied `p_tenant_id` / `p_user_id`. It does not check `auth.uid()`, tenant membership, or owner role.

No repository caller, `handle_new_user`, or `handle_new_tenant` reference was found. The function is an orphaned residual, but PostgREST still exposes functions that `anon` may execute.

## Why this is not encoded as historical SQL

The body was observed on production on 2026-10-07. That is current-state evidence. It is **not** proven to be the August 2026 text of ledger version `20260810210000`.

## Required remediation (future controlled apply)

1. `ALTER FUNCTION ... SET search_path = pg_catalog, public`
2. `REVOKE ALL ... FROM PUBLIC, anon, authenticated`
3. `GRANT EXECUTE ... TO postgres, service_role` only
4. Do not add authenticated/anon RPC access
5. Do not wire this function into `handle_new_user` without a separate product decision

Canonical SQL: `docs/recovery/sql/rtb_rel_1b_current_state_signup_commercial_lockdown.sql`

Do not apply as part of RTB-REL-1B.
