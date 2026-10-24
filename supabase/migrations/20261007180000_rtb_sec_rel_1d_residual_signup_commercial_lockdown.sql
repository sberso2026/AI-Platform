-- RTB-SEC-REL-1D: production security remediation
-- CURRENT production lockdown of residual
-- public.provision_signup_commercial_defaults(uuid, uuid).
-- THIS IS NOT reconstruction of 20260810210000.
-- THIS IS NOT reconstruction of 20260810220000.
-- Does not DROP the function. Does not rewrite commercial semantics.
-- Does not CREATE the function on a clean Engineering OS bootstrap.
-- Additive privilege reduction only.

DO $$
BEGIN
  IF to_regclass('supabase_migrations.schema_migrations') IS NULL THEN
    RAISE EXCEPTION 'rtb_sec_rel_1d: schema_migrations catalog is missing';
  END IF;

  IF to_regprocedure('public.provision_signup_commercial_defaults(uuid, uuid)') IS NULL THEN
    RAISE NOTICE 'rtb_sec_rel_1d: residual function absent; supported signup remains handle_new_user';
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'provision_signup_commercial_defaults'
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'p_tenant_id uuid, p_user_id uuid'
        AND p.prosecdef
    ) THEN
      RAISE EXCEPTION 'rtb_sec_rel_1d: residual function exists but is not SECURITY DEFINER';
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
        'RTB-SEC-REL-1D quarantined residual. EXECUTE is postgres/service_role only. Not historical SQL. Not part of supported handle_new_user signup.';
    $c$;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

INSERT INTO supabase_migrations.schema_migrations (version)
SELECT '20261007180000'
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007180000'
);
