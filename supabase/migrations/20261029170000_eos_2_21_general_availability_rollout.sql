-- EOS 2.21: allow general_availability rollout mode while keeping entitlement+enrollment mandatory.
-- Additive: replaces eos2_18r_set_rollout_mode to accept general_availability and stamp GA product metadata.

CREATE OR REPLACE FUNCTION eos2_18r_set_rollout_mode(
  p_tenant uuid,
  p_workspace uuid,
  p_mode text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  v_role text;
  v_previous text;
  v_persisted text;
  v_actor uuid;
  v_settings jsonb;
  v_eos2 jsonb;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('off', 'controlled_pilot', 'general_availability') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_mode', 'auditedSuccess', false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM workspaces WHERE id = p_workspace AND tenant_id = p_tenant) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_scope', 'auditedSuccess', false);
  END IF;

  v_actor := auth.uid();
  IF v_actor IS NOT NULL THEN
    SELECT r.slug INTO v_role
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = v_actor
      AND tm.tenant_id = p_tenant
      AND tm.status = 'active'
    LIMIT 1;
    IF v_role IS NULL OR v_role NOT IN ('owner', 'admin') THEN
      INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
      VALUES (
        p_tenant, p_workspace, 'eos2_rollout_mode_rejected', v_actor,
        jsonb_build_object('error', 'authority_denied', 'requestedMode', p_mode, 'persisted', false, 'approvalGranted', false)
      );
      RETURN jsonb_build_object('ok', false, 'error', 'authority_denied', 'auditedSuccess', false);
    END IF;
  END IF;

  SELECT settings
  INTO v_settings
  FROM tenants
  WHERE id = p_tenant
  FOR UPDATE;

  IF jsonb_typeof(v_settings->'eos2') = 'object' THEN
    v_previous := v_settings->'eos2'->>'mode';
    v_eos2 := v_settings->'eos2';
  ELSE
    v_previous := NULL;
    v_eos2 := '{}'::jsonb;
  END IF;

  v_eos2 := v_eos2 || jsonb_build_object('mode', p_mode);

  IF p_mode = 'general_availability' THEN
    v_eos2 := v_eos2 || jsonb_build_object(
      'product_release_state', 'GENERAL_AVAILABILITY',
      'access_model', 'EXPLICIT_ENTITLEMENT_AND_ENROLLMENT',
      'external_customer_onboarding_hold', true,
      'ga_version', '2.0.0',
      'legacy_auto_enable', false,
      'legacy_auto_migration', false
    );
  END IF;

  UPDATE tenants
  SET settings = jsonb_set(
    coalesce(v_settings, '{}'::jsonb),
    '{eos2}',
    v_eos2,
    true
  )
  WHERE id = p_tenant
  RETURNING settings->'eos2'->>'mode' INTO v_persisted;

  IF v_persisted IS DISTINCT FROM p_mode THEN
    INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
    VALUES (
      p_tenant, p_workspace, 'eos2_rollout_mode_rejected', v_actor,
      jsonb_build_object('error', 'not_persisted', 'requestedMode', p_mode, 'persistedMode', v_persisted, 'persisted', false, 'approvalGranted', false)
    );
    RETURN jsonb_build_object('ok', false, 'error', 'not_persisted', 'persistedMode', v_persisted, 'auditedSuccess', false);
  END IF;

  INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
  VALUES (
    p_tenant, p_workspace, 'eos2_rollout_mode_set', v_actor,
    jsonb_build_object(
      'previousMode', v_previous,
      'persistedMode', v_persisted,
      'persisted', true,
      'approvalGranted', false,
      'productReleaseState', CASE WHEN p_mode = 'general_availability' THEN 'GENERAL_AVAILABILITY' ELSE NULL END,
      'accessModel', 'EXPLICIT_ENTITLEMENT_AND_ENROLLMENT',
      'externalCustomerOnboardingHold', true,
      'gaVersion', CASE WHEN p_mode = 'general_availability' THEN '2.0.0' ELSE NULL END
    )
  );

  RETURN jsonb_build_object('ok', true, 'mode', v_persisted, 'previousMode', v_previous, 'auditedSuccess', true);
END;
$fn$;

REVOKE ALL ON FUNCTION eos2_18r_set_rollout_mode(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION eos2_18r_set_rollout_mode(uuid, uuid, text) TO authenticated, service_role;
