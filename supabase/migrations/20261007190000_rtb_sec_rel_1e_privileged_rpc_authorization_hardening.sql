-- RTB-SEC-REL-1E: privileged RPC authorization hardening
-- CURRENT production security remediation.
-- THIS IS NOT reconstruction of 20260810210000 or 20260810220000.
-- Does not DROP functions. Does not change commercial/demo write semantics.
-- Does not rewrite Project Intelligence job architecture.
-- Additive privilege reduction + tenant-caller gate on user-JWT writers.

CREATE OR REPLACE FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN;
  END IF;
  IF COALESCE(public.is_platform_admin(), false) THEN
    RETURN;
  END IF;
  IF p_tenant_id IS NOT NULL AND COALESCE(public.is_tenant_member(p_tenant_id), false) THEN
    RETURN;
  END IF;
  RAISE EXCEPTION 'permission denied for tenant-scoped privileged rpc'
    USING ERRCODE = '42501';
END;
$$;

REVOKE ALL ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) TO service_role;

COMMENT ON FUNCTION public.rtb_sec_rel_1e_assert_tenant_caller(uuid) IS
  'RTB-SEC-REL-1E tenant-caller gate. Not a public RPC. service_role, platform admin, or canonical tenant membership.';

-- F — UNSAFE_ACTIVE user-JWT writers: keep authenticated EXECUTE, deny PUBLIC/anon,
-- require tenant membership inside the trusted boundary, pin search_path.

CREATE OR REPLACE FUNCTION public.bump_commercial_entitlement_version(p_tenant_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_version BIGINT;
BEGIN
  PERFORM public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id);
  INSERT INTO public.commercial_entitlement_versions (tenant_id, version, updated_at)
  VALUES (p_tenant_id, 1, NOW())
  ON CONFLICT (tenant_id) DO UPDATE
    SET version = public.commercial_entitlement_versions.version + 1,
        updated_at = NOW()
  RETURNING version INTO v_version;
  RETURN v_version;
END;
$$;

CREATE OR REPLACE FUNCTION public.bump_commercial_installation_version(p_tenant_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_version BIGINT;
BEGIN
  PERFORM public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id);
  INSERT INTO public.commercial_installation_versions (tenant_id, version)
  VALUES (p_tenant_id, 1)
  ON CONFLICT (tenant_id) DO UPDATE
    SET version = public.commercial_installation_versions.version + 1,
        updated_at = NOW()
  RETURNING version INTO v_version;
  RETURN v_version;
END;
$$;

DO $$
BEGIN
  IF to_regprocedure('public.seed_engineering_os_demo_data_rtb_1e_impl(uuid)') IS NULL
     AND to_regprocedure('public.seed_engineering_os_demo_data(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_engineering_os_demo_data(uuid)
      RENAME TO seed_engineering_os_demo_data_rtb_1e_impl;
  END IF;
  IF to_regprocedure('public.reset_engineering_os_demo_data_rtb_1e_impl(uuid)') IS NULL
     AND to_regprocedure('public.reset_engineering_os_demo_data(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.reset_engineering_os_demo_data(uuid)
      RENAME TO reset_engineering_os_demo_data_rtb_1e_impl;
  END IF;
  IF to_regprocedure('public.seed_tenant_engineering_os_rtb_1e_impl(uuid)') IS NULL
     AND to_regprocedure('public.seed_tenant_engineering_os(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_engineering_os(uuid)
      RENAME TO seed_tenant_engineering_os_rtb_1e_impl;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.seed_engineering_os_demo_data(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id);
  RETURN public.seed_engineering_os_demo_data_rtb_1e_impl(p_tenant_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_engineering_os_demo_data(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id);
  RETURN public.reset_engineering_os_demo_data_rtb_1e_impl(p_tenant_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_tenant_engineering_os(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.rtb_sec_rel_1e_assert_tenant_caller(p_tenant_id);
  PERFORM public.seed_tenant_engineering_os_rtb_1e_impl(p_tenant_id);
END;
$$;

DO $$
BEGIN
  IF to_regprocedure('public.seed_engineering_os_demo_data_rtb_1e_impl(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid)
      SET search_path = pg_catalog, public;
    REVOKE ALL ON FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid) FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid) FROM anon;
    REVOKE ALL ON FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid) TO postgres;
    GRANT EXECUTE ON FUNCTION public.seed_engineering_os_demo_data_rtb_1e_impl(uuid) TO service_role;
  END IF;
  IF to_regprocedure('public.reset_engineering_os_demo_data_rtb_1e_impl(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid)
      SET search_path = pg_catalog, public;
    REVOKE ALL ON FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid) FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid) FROM anon;
    REVOKE ALL ON FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid) TO postgres;
    GRANT EXECUTE ON FUNCTION public.reset_engineering_os_demo_data_rtb_1e_impl(uuid) TO service_role;
  END IF;
  IF to_regprocedure('public.seed_tenant_engineering_os_rtb_1e_impl(uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid)
      SET search_path = pg_catalog, public;
    REVOKE ALL ON FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid) FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid) FROM anon;
    REVOKE ALL ON FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid) TO postgres;
    GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os_rtb_1e_impl(uuid) TO service_role;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.bump_commercial_entitlement_version(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bump_commercial_entitlement_version(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bump_commercial_entitlement_version(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bump_commercial_entitlement_version(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.bump_commercial_entitlement_version(uuid) TO postgres;

REVOKE ALL ON FUNCTION public.bump_commercial_installation_version(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bump_commercial_installation_version(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bump_commercial_installation_version(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bump_commercial_installation_version(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.bump_commercial_installation_version(uuid) TO postgres;

REVOKE ALL ON FUNCTION public.seed_engineering_os_demo_data(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_engineering_os_demo_data(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.seed_engineering_os_demo_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_engineering_os_demo_data(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.seed_engineering_os_demo_data(uuid) TO postgres;

REVOKE ALL ON FUNCTION public.reset_engineering_os_demo_data(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_engineering_os_demo_data(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.reset_engineering_os_demo_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_engineering_os_demo_data(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_engineering_os_demo_data(uuid) TO postgres;

REVOKE ALL ON FUNCTION public.seed_tenant_engineering_os(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_tenant_engineering_os(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.seed_tenant_engineering_os(uuid) TO postgres;

-- B — SAFE_BACKEND_RPC: trigger neighbors and PI workers. Untrusted EXECUTE revoked.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT to_regprocedure(v.sig) AS sig
    FROM (VALUES
      ('public.handle_new_user()'),
      ('public.handle_new_tenant()'),
      ('public.handle_new_tenant_kernel()'),
      ('public.generate_tenant_slug(text)'),
      ('public.create_default_tenant_roles(uuid)'),
      ('public.provision_tenant_kernel_defaults(uuid)'),
      ('public.seed_tenant_engineering_registers(uuid)'),
      ('public.seed_tenant_intelligence(uuid)'),
      ('public.seed_tenant_workflows(uuid)'),
      ('public.pi_document_claim_jobs(text, integer, integer)'),
      ('public.pi_document_enqueue_processing(uuid, uuid, uuid, uuid, text, text, uuid, text, jsonb, uuid)'),
      ('public.pi_document_ensure_core_document(uuid, uuid, uuid, text, text, text, text, uuid)'),
      ('public.pi_document_lexical_search(uuid, uuid, text, integer, uuid[], uuid[], text[])'),
      ('public.pi_document_release_expired_leases()'),
      ('public.pi_document_renew_lease(uuid, text, integer)'),
      ('public.pi_document_set_embedding_vector(uuid, text, text, text, double precision[])'),
      ('public.pi_document_vector_search(uuid, uuid, vector, integer, uuid[], uuid[], text[])'),
      ('public.pi_meeting_claim_jobs(text, integer, integer)'),
      ('public.pi_meeting_release_expired_leases()')
    ) AS v(sig)
    WHERE to_regprocedure(v.sig) IS NOT NULL
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO postgres', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin')
     AND to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.pi_document_claim_jobs(text, integer, integer)') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_claim_jobs(text, integer, integer)
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_enqueue_processing(uuid, uuid, uuid, uuid, text, text, uuid, text, jsonb, uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_enqueue_processing(uuid, uuid, uuid, uuid, text, text, uuid, text, jsonb, uuid)
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_ensure_core_document(uuid, uuid, uuid, text, text, text, text, uuid)') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_ensure_core_document(uuid, uuid, uuid, text, text, text, text, uuid)
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_lexical_search(uuid, uuid, text, integer, uuid[], uuid[], text[])') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_lexical_search(uuid, uuid, text, integer, uuid[], uuid[], text[])
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_release_expired_leases()') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_release_expired_leases()
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_renew_lease(uuid, text, integer)') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_renew_lease(uuid, text, integer)
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_set_embedding_vector(uuid, text, text, text, double precision[])') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_set_embedding_vector(uuid, text, text, text, double precision[])
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_document_vector_search(uuid, uuid, vector, integer, uuid[], uuid[], text[])') IS NOT NULL THEN
    ALTER FUNCTION public.pi_document_vector_search(uuid, uuid, vector, integer, uuid[], uuid[], text[])
      SET search_path = pg_catalog, public, pg_temp;
  END IF;
  IF to_regprocedure('public.pi_meeting_claim_jobs(text, integer, integer)') IS NOT NULL THEN
    ALTER FUNCTION public.pi_meeting_claim_jobs(text, integer, integer)
      SET search_path = pg_catalog, public;
  END IF;
  IF to_regprocedure('public.pi_meeting_release_expired_leases()') IS NOT NULL THEN
    ALTER FUNCTION public.pi_meeting_release_expired_leases()
      SET search_path = pg_catalog, public;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

INSERT INTO supabase_migrations.schema_migrations (version)
SELECT '20261007190000'
WHERE NOT EXISTS (
  SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '20261007190000'
);
