-- II-1C fixture provisioning only (not a schema migration).
-- Adds Inspection Intelligence application entitlement to the existing PI cert tenant
-- on the approved Engineering OS hosted project. Idempotent.

DO $$
DECLARE
  v_tenant uuid := '3ed74058-2394-45ef-ace2-f7be9587f10f';
  v_product uuid := 'c1000000-0000-4000-8000-000000000001';
  v_sub uuid := 'c5265837-0ad3-45cf-b531-cc27d7497e84';
  v_parent uuid := '09364f1d-0468-4189-9217-edfa412befbf';
  v_ws_a uuid := '8465840f-0c52-42fc-8233-2171c339080e';
  v_ws_b uuid := 'dd74093e-a788-4e2a-9789-69e074718496';
  v_project uuid := 'b1de062f-22c3-48cd-9d18-5c9f3a27344a';
  v_owner uuid;
  v_engineer_b uuid;
  v_licence uuid;
  v_app_install uuid;
  v_pool uuid;
BEGIN
  SELECT tm.user_id INTO v_owner
  FROM tenant_memberships tm
  JOIN roles r ON r.id = tm.role_id
  WHERE tm.tenant_id = v_tenant AND r.slug = 'owner'
  LIMIT 1;

  SELECT u.id INTO v_engineer_b
  FROM auth.users u
  WHERE u.email = 'cert-pi-baseline-engineer-b-pi6browsercert@rtb-cert.test';

  INSERT INTO commercial_licenses (
    tenant_id, product_id, subscription_id, application_key, license_type, status
  )
  SELECT v_tenant, v_product, v_sub, 'inspection_intelligence', 'application', 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM commercial_licenses
    WHERE tenant_id = v_tenant
      AND application_key = 'inspection_intelligence'
      AND deleted_at IS NULL
  );

  SELECT id INTO v_licence
  FROM commercial_licenses
  WHERE tenant_id = v_tenant
    AND application_key = 'inspection_intelligence'
    AND deleted_at IS NULL
  LIMIT 1;

  INSERT INTO commercial_application_installations (
    tenant_id, product_id, application_key, parent_product_installation_id,
    subscription_id, licence_id, status, installed_version, installed_at
  )
  SELECT v_tenant, v_product, 'inspection_intelligence', v_parent, v_sub, v_licence,
         'active', '1.0.0', now()
  WHERE NOT EXISTS (
    SELECT 1 FROM commercial_application_installations
    WHERE tenant_id = v_tenant AND application_key = 'inspection_intelligence'
  );

  SELECT id INTO v_app_install
  FROM commercial_application_installations
  WHERE tenant_id = v_tenant AND application_key = 'inspection_intelligence'
  LIMIT 1;

  INSERT INTO commercial_workspace_application_assignments (
    tenant_id, workspace_id, app_installation_id, application_key, assigned_by, status
  )
  SELECT v_tenant, v_ws_a, v_app_install, 'inspection_intelligence', v_owner, 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM commercial_workspace_application_assignments
    WHERE workspace_id = v_ws_a AND app_installation_id = v_app_install
  );

  INSERT INTO commercial_workspace_application_assignments (
    tenant_id, workspace_id, app_installation_id, application_key, assigned_by, status
  )
  SELECT v_tenant, v_ws_b, v_app_install, 'inspection_intelligence', v_owner, 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM commercial_workspace_application_assignments
    WHERE workspace_id = v_ws_b AND app_installation_id = v_app_install
  );

  SELECT id INTO v_pool
  FROM commercial_seats
  WHERE tenant_id = v_tenant AND product_id = v_product
  LIMIT 1;

  IF v_pool IS NOT NULL AND v_engineer_b IS NOT NULL THEN
    INSERT INTO commercial_seat_assignments (
      tenant_id, seat_pool_id, user_id, workspace_id, subscription_id, status
    )
    SELECT v_tenant, v_pool, v_engineer_b, v_ws_b, v_sub, 'active'
    WHERE NOT EXISTS (
      SELECT 1 FROM commercial_seat_assignments
      WHERE seat_pool_id = v_pool AND user_id = v_engineer_b AND deleted_at IS NULL
    );
  END IF;

  INSERT INTO engineering_assets (
    tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, status, created_by
  )
  SELECT v_tenant, v_ws_a, v_project, 'II-CERT-ASSET-1', 'II Certification Asset', 'active', v_owner
  WHERE NOT EXISTS (
    SELECT 1 FROM engineering_assets WHERE tenant_id = v_tenant AND asset_tag = 'II-CERT-ASSET-1'
  );
END $$;
