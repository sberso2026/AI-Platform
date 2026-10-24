-- RTB-REL-1B CURRENT-STATE RECOVERY BASELINE
-- THIS IS A CURRENT-STATE RECOVERY BASELINE.
-- IT IS NOT THE ORIGINAL SQL FOR 20260810210000 OR 20260810220000.
-- Identifier: rtb-rel-1b-current-state-signup-commercial-lockdown
--
-- Canonical live equivalent: supabase/migrations/20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql
-- REL-1D applied that file to production on 2026-10-07.
-- Keep this copy for production-dump disaster recovery when the live
-- migration history is not being replayed. It does not reconstruct unknown historical SQL.
--
-- Observed production defect (read-only inspection, 2026-10-07):
--   SECURITY DEFINER function provision_signup_commercial_defaults(uuid, uuid)
--   has EXECUTE for PUBLIC, anon, and authenticated, and search_path=public
--   only. No repository or trigger caller was found. Supported signup is
--   public.handle_new_user(). Do not recreate the unsafe grants.
--
-- This artifact only locks down the residual function WHEN it already exists.
-- It does not CREATE the function on a clean Engineering OS bootstrap.

DO $$
BEGIN
  IF to_regprocedure('public.provision_signup_commercial_defaults(uuid, uuid)') IS NULL THEN
    RAISE NOTICE 'rtb-rel-1b: residual function absent; supported signup remains handle_new_user';
    RETURN;
  END IF;

  ALTER FUNCTION public.provision_signup_commercial_defaults(uuid, uuid)
    SET search_path = pg_catalog, public;

  REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM PUBLIC;
  REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM anon;
  REVOKE ALL ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) FROM authenticated;

  GRANT EXECUTE ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) TO postgres;
  GRANT EXECUTE ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) TO service_role;

  EXECUTE $c$
    COMMENT ON FUNCTION public.provision_signup_commercial_defaults(uuid, uuid) IS
      'RTB-REL-1B current-state residual. Orphaned signup commercial helper. EXECUTE is postgres/service_role only. Not historical SQL. Not part of the supported handle_new_user signup path.';
  $c$;
END $$;
